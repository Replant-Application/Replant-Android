/**
 * PhotoSelectScreen 비즈니스 로직
 * 카메라 촬영 또는 갤러리에서 사진 선택 (다중 선택 지원)
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { launchCamera, launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { uploadMissionVerifyPhoto } from '../../api/fileApi';
import { logError } from '../../utils/logger';
import { useErrorHandler } from '../../hooks/useErrorHandler';

interface PhotoSelectScreenContainerProps {
  navigation: NavigationProp<RootStackParamList>;
  missionId?: string;
}

export const usePhotoSelectScreenContainer = ({
  navigation,
  missionId,
}: PhotoSelectScreenContainerProps) => {
  const [selectedPhotoUris, setSelectedPhotoUris] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [analyzing] = useState(false);
  const { showError, showInfo } = useErrorHandler();

  /**
   * 단일 사진 업로드 및 추가
   */
  const uploadAndAddPhoto = useCallback(
    async (asset: { uri?: string; type?: string; fileName?: string }) => {
      if (!asset.uri) return;

      if (selectedPhotoUris.length >= 3) {
        showInfo('최대 3개의 사진만 선택할 수 있습니다.');
        return;
      }

      try {
        setUploadingImage(true);

        const file = {
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `mission_${missionId}_${Date.now()}.jpg`,
        };

        const uploadResult = await uploadMissionVerifyPhoto(file);

        if (uploadResult.success && uploadResult.data) {
          setSelectedPhotoUris(prev => [...prev, uploadResult.data!.fileUrl]);
        } else {
          Alert.alert('오류', uploadResult.error || '사진 업로드에 실패했습니다.');
        }
      } catch (error) {
        logError('사진 업로드 오류', error as Error);
        Alert.alert('오류', '사진 업로드 중 오류가 발생했습니다.');
      } finally {
        setUploadingImage(false);
      }
    },
    [selectedPhotoUris.length, missionId, showInfo]
  );

  /**
   * 카메라로 사진 촬영
   */
  const handleTakePhoto = useCallback(async () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8 as any,
      saveToPhotos: true,
    };

    launchCamera(options, async (response: ImagePickerResponse) => {
      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        const errorMessage = response.errorMessage || '카메라를 사용할 수 없습니다.';
        showError(new Error(errorMessage), 'PhotoSelectScreen.handleTakePhoto');
        return;
      }

      if (response.assets && response.assets[0]?.uri) {
        await uploadAndAddPhoto(response.assets[0]);
      }
    });
  }, [uploadAndAddPhoto, showError]);

  /**
   * 갤러리에서 사진 선택 (다중 선택)
   */
  const handlePickFromGallery = useCallback(async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo' as MediaType,
        quality: 0.8 as any,
        selectionLimit: 3, // 최대 3장 제한
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        logError('갤러리 오류', new Error(result.errorMessage || result.errorCode));
        if (result.errorCode === 'permission') {
          showError(
            new Error('사진을 선택하려면 갤러리 접근 권한이 필요합니다.'),
            'PhotoSelectScreen.handlePickFromGallery'
          );
        } else {
          showError(
            new Error('사진을 불러오는 중 오류가 발생했습니다.'),
            'PhotoSelectScreen.handlePickFromGallery'
          );
        }
        return;
      }

      if (result.assets && result.assets.length > 0) {
        setUploadingImage(true);
        try {
          // 즉시 업로드
          const uploadPromises = result.assets.map(async asset => {
            if (asset.uri) {
              const uploadResult = await uploadMissionVerifyPhoto({
                uri: asset.uri,
                type: asset.type || 'image/jpeg',
                name: asset.fileName || `mission_${missionId}_${Date.now()}_${Math.random()}.jpg`,
              });
              return uploadResult.success && uploadResult.data ? uploadResult.data.fileUrl : null;
            }
            return null;
          });

          const uploadedUrls = (await Promise.all(uploadPromises)).filter(
            (url): url is string => url !== null
          );

          // 기존 이미지에 추가
          setSelectedPhotoUris(prev => [...prev, ...uploadedUrls]);
        } catch (error) {
          logError('이미지 업로드 오류', error as Error);
          showError(
            error instanceof Error ? error : new Error('이미지 업로드 중 오류가 발생했습니다.'),
            'PhotoSelectScreen.handlePickFromGallery'
          );
        } finally {
          setUploadingImage(false);
        }
      }
    } catch (error) {
      logError('이미지 선택 오류', error as Error);
      showError(
        error instanceof Error ? error : new Error('사진을 선택하는 중 오류가 발생했습니다.'),
        'PhotoSelectScreen.handlePickFromGallery'
      );
    }
  }, [missionId, showError]);

  /**
   * 이미지 제거
   */
  const handleRemoveImage = useCallback((index: number) => {
    setSelectedPhotoUris(prev => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * AI 분석하기
   */
  const handleAnalyzePhoto = useCallback(() => {
    showInfo('AI 분석 기능은 현재 준비중입니다.\n곧 만나보실 수 있습니다!');
  }, [showInfo]);

  /**
   * 사진 선택 확인
   */
  const handleConfirm = useCallback(() => {
    if (selectedPhotoUris.length > 0 && missionId) {
      // 최대 3개까지만 전달
      const photosToSend = selectedPhotoUris.slice(0, 3);
      navigation.navigate('Mission', {
        selectedPhotoUris: photosToSend,
        missionId,
        timestamp: Date.now(),
        analysisResult: null,
      });
    } else {
      showInfo('사진을 최소 1개 이상 선택해주세요.');
    }
  }, [selectedPhotoUris, missionId, navigation, showInfo]);

  /**
   * 사진 선택 취소
   */
  const handleCancel = useCallback(() => {
    setSelectedPhotoUris([]);
  }, []);

  /**
   * 뒤로가기
   */
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    selectedPhotoUris,
    uploadingImage,
    analyzing,
    handleTakePhoto,
    handlePickFromGallery,
    handleRemoveImage,
    handleAnalyzePhoto,
    handleConfirm,
    handleCancel,
    handleGoBack,
  };
};
