/**
 * 사진 선택 화면
 * 카메라 촬영 또는 갤러리에서 사진 선택 (다중 선택 지원)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { launchCamera, launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { Header, Button } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { Platform } from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { uploadMissionVerifyPhoto } from '../../api/fileApi';
import { logError } from '../../utils/logger';

interface PhotoSelectScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route?: RouteProp<RootStackParamList, 'PhotoSelect'>;
}

const PhotoSelectScreen: React.FC<PhotoSelectScreenProps> = ({ navigation, route }) => {
  const [selectedPhotoUris, setSelectedPhotoUris] = useState<string[]>([]); // 업로드된 URL 배열
  const [uploadingImage, setUploadingImage] = useState(false);
  const [analyzing] = useState(false);

  const missionId = route?.params?.missionId;

  // 카메라로 사진 촬영
  const handleTakePhoto = async () => {
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
        Alert.alert('카메라 사용 불가', errorMessage, [{ text: '확인' }]);
        return;
      }

      if (response.assets && response.assets[0]?.uri) {
        await uploadAndAddPhoto(response.assets[0]);
      }
    });
  };

  // 갤러리에서 사진 선택 (다중 선택) - 자유게시판과 완전히 동일한 방식
  const handlePickFromGallery = async () => {
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
          Alert.alert('권한 필요', '사진을 선택하려면 갤러리 접근 권한이 필요합니다.');
        } else {
          Alert.alert('오류', '사진을 불러오는 중 오류가 발생했습니다.');
        }
        return;
      }

      if (result.assets && result.assets.length > 0) {
        setUploadingImage(true);
        try {
          // 자유게시판과 완전히 동일하게 즉시 업로드
          const uploadPromises = result.assets.map(async (asset) => {
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

          const uploadedUrls = (await Promise.all(uploadPromises)).filter((url): url is string => url !== null);
          
          // 자유게시판과 완전히 동일하게 기존 이미지에 추가 (단순 추가, slice 없음)
          setSelectedPhotoUris((prev) => [...prev, ...uploadedUrls]);
        } catch (error) {
          logError('이미지 업로드 오류', error as Error);
          Alert.alert('오류', '이미지 업로드 중 오류가 발생했습니다.');
        } finally {
          setUploadingImage(false);
        }
      }
    } catch (error) {
      logError('이미지 선택 오류', error as Error);
      Alert.alert('오류', '사진을 선택하는 중 오류가 발생했습니다.');
    }
  };

  // 단일 사진 업로드 및 추가
  const uploadAndAddPhoto = async (asset: { uri?: string; type?: string; fileName?: string }) => {
    if (!asset.uri) return;

    if (selectedPhotoUris.length >= 3) {
      Alert.alert('알림', '최대 3개의 사진만 선택할 수 있습니다.');
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
        setSelectedPhotoUris((prev) => [...prev, uploadResult.data!.fileUrl]);
      } else {
        Alert.alert('오류', uploadResult.error || '사진 업로드에 실패했습니다.');
      }
    } catch (error) {
      logError('사진 업로드 오류', error as Error);
      Alert.alert('오류', '사진 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploadingImage(false);
    }
  };


  // 이미지 제거
  const handleRemoveImage = (index: number) => {
    setSelectedPhotoUris((prev) => prev.filter((_, i) => i !== index));
  };

  // AI 분석하기
  const handleAnalyzePhoto = async () => {
    Alert.alert('준비중', 'AI 분석 기능은 현재 준비중입니다.\n곧 만나보실 수 있습니다!', [{ text: '확인' }]);
  };

  // 사진 선택 확인
  const handleConfirm = () => {
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
      Alert.alert('알림', '사진을 최소 1개 이상 선택해주세요.');
    }
  };

  // 사진 선택 취소
  const handleCancel = () => {
    setSelectedPhotoUris([]);
  };

  // 뒤로가기
  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Header
        title="사진 선택"
        titleStyle={styles.headerTitle}
        leftButton={
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Image
              source={require('../../assets/images/left.png')}
              style={styles.backButtonIcon}
              resizeMode="contain"
              accessibilityLabel="뒤로 가기"
            />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            미션 인증을 위한 사진을 선택해주세요{'\n'}
            (최대 3개까지 선택 가능)
          </Text>
        </View>

        {/* 선택된 사진 그리드 */}
        {selectedPhotoUris.length > 0 && (
          <View style={styles.imageContainer}>
            {selectedPhotoUris.map((imageUrl, index) => (
              <View key={index} style={styles.imagePreviewWrapper}>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.previewImage}
                  resizeMode="cover"
                  accessibilityLabel={`선택한 사진 ${index + 1}`}
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveImage(index)}
                >
                  <Text style={styles.removeImageText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            {selectedPhotoUris.length < 3 && (
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={handlePickFromGallery}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <ActivityIndicator color={colors.primary[500]} />
                ) : (
                  <>
                    <Image
                      source={require('../../assets/images/camera.png')}
                      style={styles.addImageIcon}
                      resizeMode="contain"
                      accessibilityLabel="사진 추가 아이콘"
                    />
                    <Text style={styles.addImageText}>사진 추가</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* 사진 선택 옵션 (선택된 사진이 없을 때만 표시) */}
        {selectedPhotoUris.length === 0 && (
          <View style={styles.optionsContainer}>
            {/* 카메라 촬영 버튼 */}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleTakePhoto}
              activeOpacity={0.7}
              disabled={uploadingImage}
            >
              <View style={styles.optionIconContainer}>
                <Image
                  source={require('../../assets/images/camera.png')}
                  style={styles.optionIconImage}
                  resizeMode="contain"
                  accessibilityLabel="카메라 아이콘"
                />
              </View>
              <Text style={styles.optionTitle}>카메라로 촬영</Text>
              <Text style={styles.optionDescription}>새 사진을 촬영합니다</Text>
            </TouchableOpacity>

            {/* 갤러리 선택 버튼 */}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handlePickFromGallery}
              activeOpacity={0.7}
              disabled={uploadingImage}
            >
              <View style={styles.optionIconContainer}>
                <Image
                  source={require('../../assets/images/picture.png')}
                  style={styles.optionIconImage}
                  resizeMode="contain"
                  accessibilityLabel="갤러리 아이콘"
                />
              </View>
              <Text style={styles.optionTitle}>갤러리에서 선택</Text>
              <Text style={styles.optionDescription}>
                저장된 사진을 선택합니다 (최대 3개)
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 하단 버튼 */}
        {selectedPhotoUris.length > 0 && (
          <View style={styles.previewButtons}>
            <Button
              title="다시 선택"
              onPress={handleCancel}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              title={analyzing ? '🤖 분석중...' : '🤖 AI 분석'}
              onPress={handleAnalyzePhoto}
              style={[styles.analyzeButton, analyzing ? styles.analyzingButton : undefined].filter(Boolean) as any}
              textStyle={styles.analyzeButtonText}
              disabled={analyzing}
            />
            <Button
              title="확인"
              onPress={handleConfirm}
              style={styles.confirmButton}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  backButton: {
    padding: spacing[2],
  },
  backButtonIcon: {
    width: 24,
    height: 24,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[5],
    paddingBottom: spacing[10],
  },
  instructionContainer: {
    marginBottom: spacing[6],
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  instructionText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  optionsContainer: {
    gap: spacing[4],
  },
  optionButton: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[5],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  optionIconContainer: {
    marginBottom: spacing[3],
  },
  optionIconImage: {
    width: 48,
    height: 48,
  },
  optionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xl),
  },
  optionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[5],
  },
  imagePreviewWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  addImageButton: {
    width: 100,
    height: 100,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[1],
  },
  addImageIcon: {
    width: 24,
    height: 24,
    tintColor: colors.text.tertiary,
  },
  addImageText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  previewButtons: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[4],
  },
  cancelButton: {
    flex: 1,
  },
  analyzeButton: {
    flex: 1,
    backgroundColor: colors.blue[100],
    borderWidth: 1,
    borderColor: colors.blue[300],
  },
  analyzingButton: {
    backgroundColor: colors.blue[200],
    opacity: 0.7,
  },
  analyzeButtonText: {
    color: colors.blue[700],
    fontWeight: typography.fontWeight.medium,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.primary[500],
  },
});

export default PhotoSelectScreen;
