/**
 * VerificationPostCreateScreen 비즈니스 로직
 * 인증글 작성/수정 화면: 인증글 작성, 수정, 이미지 업로드
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { createVerification, updateVerification, getVerification } from '../../api/missionApi';
import { uploadCommunityPhoto } from '../../api/fileApi';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { logError } from '../../utils/logger';
import { useErrorHandler } from '../../hooks/useErrorHandler';

interface VerificationPostCreateScreenContainerProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'VerificationPostCreate'>;
}

export const useVerificationPostCreateScreenContainer = ({
  navigation,
  route,
}: VerificationPostCreateScreenContainerProps) => {
  // route.params가 없을 경우 안전하게 처리
  const params = route?.params || {};
  const {
    userMissionId,
    missionTitle = '미션',
    missionEmoji = '',
    photoUrl: initialPhotoUrl,
    // 수정 모드용 params
    mode = 'create',
    verificationId,
    initialContent,
  } = params as any;

  const isEditMode = mode === 'edit' && verificationId;
  const { showError, showInfo, handleApiError } = useErrorHandler();

  const [content, setContent] = useState(initialContent || '');
  const [images, setImages] = useState<string[]>(initialPhotoUrl ? [initialPhotoUrl] : []); // 다중 이미지 지원
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAlreadyExistsModal, setShowAlreadyExistsModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loadingData, setLoadingData] = useState(isEditMode);
  // 완료 정도 슬라이더 상태 (기본값 50%, 0~100% 5% 단위)
  const [completionRate, setCompletionRate] = useState(50);

  /**
   * 필수 파라미터 체크
   */
  useEffect(() => {
    if (!isEditMode && (!userMissionId || userMissionId === 0)) {
      logError('VerificationPostCreate: userMissionId 누락', new Error('Missing userMissionId'), { params });
      showError(new Error('미션 정보가 올바르지 않습니다.'), 'VerificationPostCreateScreen.useEffect');
      navigation.goBack();
      return;
    }
  }, [userMissionId, isEditMode, navigation, params, showError]);

  /**
   * 수정 모드일 때 기존 데이터 로드
   */
  useEffect(() => {
    if (isEditMode && verificationId) {
      loadVerificationData();
    }
  }, [isEditMode, verificationId]);

  /**
   * 인증글 데이터 로드
   */
  const loadVerificationData = useCallback(async () => {
    try {
      setLoadingData(true);
      const result = await getVerification(verificationId);
      if (result.success && result.data) {
        setContent(result.data.content || '');
        if (result.data.imageUrls && result.data.imageUrls.length > 0) {
          setImages(result.data.imageUrls); // 다중 이미지 지원
        }
        // 기존 완료 정도 로드
        if (result.data.completionRate !== undefined) {
          setCompletionRate(result.data.completionRate);
        }
      }
    } catch (error) {
      logError('인증글 데이터 로드 오류', error as Error);
    } finally {
      setLoadingData(false);
    }
  }, [verificationId]);

  /**
   * 사진 선택 (갤러리)
   */
  const handleSelectPhoto = useCallback(async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 3, // 최대 3장 제한
      });

      // 사용자가 취소했거나 에러가 있는 경우 무시
      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        logError('갤러리 오류', new Error(result.errorMessage || result.errorCode));
        if (result.errorCode === 'permission') {
          showError(
            new Error('사진을 선택하려면 갤러리 접근 권한이 필요합니다. 설정에서 권한을 허용해주세요.'),
            'VerificationPostCreateScreen.handleSelectPhoto'
          );
        } else {
          showError(
            new Error('사진을 불러오는 중 오류가 발생했습니다.'),
            'VerificationPostCreateScreen.handleSelectPhoto'
          );
        }
        return;
      }

      if (result.assets && result.assets.length > 0) {
        setUploadingPhoto(true);
        try {
          // 자유게시판과 완전히 동일하게 즉시 업로드
          const uploadPromises = result.assets.map(async asset => {
            if (asset.uri) {
              const uploadResult = await uploadCommunityPhoto({
                uri: asset.uri,
                type: asset.type || 'image/jpeg',
                name: asset.fileName || `verification_${Date.now()}_${Math.random()}.jpg`,
              });
              return uploadResult.success && uploadResult.data ? uploadResult.data.fileUrl : null;
            }
            return null;
          });

          const uploadedUrls = (await Promise.all(uploadPromises)).filter((url): url is string => url !== null);

          // 자유게시판과 완전히 동일하게 기존 이미지에 추가 (단순 추가)
          setImages(prev => [...prev, ...uploadedUrls]);
        } catch (error) {
          logError('이미지 업로드 오류', error as Error);
          showError(
            error instanceof Error ? error : new Error('이미지 업로드 중 오류가 발생했습니다.'),
            'VerificationPostCreateScreen.handleSelectPhoto'
          );
        } finally {
          setUploadingPhoto(false);
        }
      }
    } catch (error) {
      logError('사진 선택 오류', error as Error);
      showError(
        error instanceof Error ? error : new Error('사진을 선택하는 중 오류가 발생했습니다.'),
        'VerificationPostCreateScreen.handleSelectPhoto'
      );
    }
  }, [showError]);

  /**
   * 사진 촬영
   */
  const handleTakePhoto = useCallback(async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
      });

      // 사용자가 취소했거나 에러가 있는 경우 무시
      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        logError('카메라 오류', new Error(result.errorMessage || result.errorCode));
        if (result.errorCode === 'permission') {
          showError(
            new Error('사진을 촬영하려면 카메라 권한이 필요합니다. 설정에서 권한을 허용해주세요.'),
            'VerificationPostCreateScreen.handleTakePhoto'
          );
        } else if (result.errorCode === 'camera_unavailable') {
          showError(new Error('카메라를 사용할 수 없습니다.'), 'VerificationPostCreateScreen.handleTakePhoto');
        } else {
          showError(
            new Error('카메라를 사용하는 중 오류가 발생했습니다.'),
            'VerificationPostCreateScreen.handleTakePhoto'
          );
        }
        return;
      }

      if (result.assets && result.assets[0]?.uri) {
        if (images.length >= 3) {
          showInfo('최대 3개의 사진만 선택할 수 있습니다.');
          return;
        }

        setUploadingPhoto(true);
        try {
          const uploadResult = await uploadCommunityPhoto({
            uri: result.assets[0].uri,
            type: result.assets[0].type || 'image/jpeg',
            name: result.assets[0].fileName || `verification_${Date.now()}.jpg`,
          });

          if (uploadResult.success && uploadResult.data) {
            setImages(prev => [...prev, uploadResult.data!.fileUrl]);
          } else {
            showError(
              new Error(uploadResult.error || '사진 업로드에 실패했습니다.'),
              'VerificationPostCreateScreen.handleTakePhoto'
            );
          }
        } catch (error) {
          logError('사진 업로드 오류', error as Error);
          showError(
            error instanceof Error ? error : new Error('사진 업로드 중 오류가 발생했습니다.'),
            'VerificationPostCreateScreen.handleTakePhoto'
          );
        } finally {
          setUploadingPhoto(false);
        }
      }
    } catch (error) {
      logError('카메라 오류', error as Error);
      showError(
        error instanceof Error ? error : new Error('카메라를 사용하는 중 오류가 발생했습니다.'),
        'VerificationPostCreateScreen.handleTakePhoto'
      );
    }
  }, [images.length, showError, showInfo]);

  /**
   * 이미지 제거
   */
  const handleRemoveImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * 사진 선택 옵션 표시
   */
  const showPhotoOptions = useCallback(() => {
    Alert.alert('사진 추가', '사진을 추가할 방법을 선택해주세요.', [
      { text: '취소', style: 'cancel' },
      { text: '카메라', onPress: handleTakePhoto },
      { text: '갤러리', onPress: handleSelectPhoto },
    ]);
  }, [handleTakePhoto, handleSelectPhoto]);

  /**
   * 인증글 작성 또는 수정
   */
  const handleSubmitVerification = useCallback(async () => {
    if (!content.trim()) {
      showError(new Error('인증 내용을 입력해주세요.'), 'VerificationPostCreateScreen.handleSubmitVerification');
      return;
    }

    if (!isEditMode && (!userMissionId || userMissionId === 0)) {
      showError(
        new Error('미션 정보가 올바르지 않습니다.'),
        'VerificationPostCreateScreen.handleSubmitVerification'
      );
      return;
    }

    try {
      setLoading(true);

      if (isEditMode) {
        // 수정 모드
        const result = await updateVerification(verificationId, {
          content: content.trim(),
          imageUrls: images, // 다중 이미지 배열
          completionRate: completionRate,
        });

        if (result.success) {
          setShowSuccessModal(true);
        } else {
          // 인증 통과 후 수정 불가 에러 처리
          if (result.error?.includes('수정') || result.error?.includes('MODIFICATION')) {
            showError(
              new Error('인증이 완료된 게시글은 수정할 수 없습니다.'),
              'VerificationPostCreateScreen.handleSubmitVerification'
            );
          } else {
            handleApiError(result, 'VerificationPostCreateScreen.handleSubmitVerification');
          }
        }
      } else {
        // 작성 모드
        const verificationData = {
          userMissionId: userMissionId,
          content: content.trim(),
          imageUrls: images, // 다중 이미지 배열
          completionRate: completionRate, // 완료 정도 추가
        };

        const result = await createVerification(verificationData);

        if (result.success) {
          setShowSuccessModal(true);
        } else {
          // 이미 인증글이 존재하는 경우 처리
          if (
            result.error?.includes('이미 인증') ||
            result.error?.includes('ALREADY_EXISTS') ||
            result.error?.includes('V013')
          ) {
            setShowAlreadyExistsModal(true);
          } else {
            setErrorMessage(result.error || '인증글 작성에 실패했습니다.');
            setShowErrorModal(true);
          }
        }
      }
    } catch (error) {
      logError('인증글 작성/수정 오류', error as Error);
      setErrorMessage('인증글 작성 중 오류가 발생했습니다.');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  }, [
    content,
    isEditMode,
    userMissionId,
    verificationId,
    images,
    completionRate,
    showError,
    handleApiError,
  ]);

  /**
   * 성공 모달 닫기 및 네비게이션
   */
  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false);
    navigation.goBack();
  }, [navigation]);

  /**
   * 이미 존재하는 인증글 모달 닫기 및 네비게이션
   */
  const handleAlreadyExistsModalClose = useCallback(() => {
    setShowAlreadyExistsModal(false);
    navigation.goBack();
  }, [navigation]);

  /**
   * 에러 모달 닫기
   */
  const handleErrorModalClose = useCallback(() => {
    setShowErrorModal(false);
  }, []);

  /**
   * 슬라이더 값 변경 핸들러 (5% 단위로 스냅, 0~100% 허용)
   */
  const handleSliderChange = useCallback((value: number) => {
    const snappedValue = Math.round(value / 5) * 5;
    setCompletionRate(snappedValue);
  }, []);

  /**
   * 완료 정도에 따른 응원 메시지
   */
  const getEncouragementMessage = useCallback((rate: number) => {
    if (rate <= 30) return '시작이 반이에요. 조금이라도 해냈다는 게 대단해요!';
    if (rate <= 50) return '절반 가까이 왔어요. 충분히 잘하고 있어요!';
    if (rate <= 80) return '많이 해냈네요. 정말 멋져요!';
    if (rate < 100) return '거의 다 왔어요! 스스로를 칭찬해주세요.';
    return '완주했네요! 정말 대단해요 🎉';
  }, []);

  return {
    // Route params
    isEditMode,
    missionTitle,
    missionEmoji,
    // State
    content,
    images,
    loading,
    uploadingPhoto,
    loadingData,
    showSuccessModal,
    showAlreadyExistsModal,
    showErrorModal,
    errorMessage,
    completionRate,
    // Setters
    setContent,
    // Handlers
    handleSelectPhoto,
    handleTakePhoto,
    handleRemoveImage,
    showPhotoOptions,
    handleSubmitVerification,
    handleSuccessModalClose,
    handleAlreadyExistsModalClose,
    handleErrorModalClose,
    handleSliderChange,
    getEncouragementMessage,
  };
};
