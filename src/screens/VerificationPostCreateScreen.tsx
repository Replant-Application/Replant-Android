/**
 * 인증글 작성/수정 화면
 * COMMUNITY 인증 타입 미션의 인증글 작성 및 수정
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Header, AlertModal } from '../components/ui';
import { colors, spacing, typography, borderRadius } from '../utils/designTokens';
import { createVerification, updateVerification, getVerification } from '../api/missionApi';
import { uploadMissionVerifyPhoto } from '../api/fileApi';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { logError } from '../utils/logger';

interface VerificationPostCreateScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'VerificationPostCreate'>;
}

const VerificationPostCreateScreen: React.FC<VerificationPostCreateScreenProps> = ({
  navigation,
  route,
}) => {
  // route.params가 없을 경우 안전하게 처리
  const params = route?.params || {};
  const {
    userMissionId,
    missionId,
    missionTitle = '미션',
    missionEmoji = '🎯',
    photoUrl: initialPhotoUrl,
    // 수정 모드용 params
    mode = 'create',
    verificationId,
    initialContent,
  } = params as any;

  const isEditMode = mode === 'edit' && verificationId;
  const [content, setContent] = useState(initialContent || '');
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialPhotoUrl || null);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);

  // 필수 파라미터 체크
  useEffect(() => {
    if (!isEditMode && !userMissionId) {
      logError('VerificationPostCreate: userMissionId 누락', new Error('Missing userMissionId'), { params });
      Alert.alert('오류', '미션 정보가 올바르지 않습니다.', [
        { text: '확인', onPress: () => navigation.goBack() }
      ]);
    }
  }, [userMissionId, isEditMode, navigation]);

  // 수정 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (isEditMode && verificationId) {
      loadVerificationData();
    }
  }, [isEditMode, verificationId]);

  const loadVerificationData = async () => {
    try {
      setLoadingData(true);
      const result = await getVerification(verificationId);
      if (result.success && result.data) {
        setContent(result.data.content || '');
        if (result.data.imageUrls && result.data.imageUrls.length > 0) {
          setPhotoUrl(result.data.imageUrls[0]);
        }
      }
    } catch (error) {
      logError('인증글 데이터 로드 오류', error as Error);
    } finally {
      setLoadingData(false);
    }
  };

  // 사진 선택 (갤러리)
  const handleSelectPhoto = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      });

      // 사용자가 취소했거나 에러가 있는 경우 무시
      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        logError('갤러리 오류', new Error(result.errorMessage || result.errorCode));
        if (result.errorCode === 'permission') {
          Alert.alert('권한 필요', '사진을 선택하려면 갤러리 접근 권한이 필요합니다. 설정에서 권한을 허용해주세요.');
        } else {
          Alert.alert('오류', '사진을 불러오는 중 오류가 발생했습니다.');
        }
        return;
      }

      if (result.assets && result.assets[0]?.uri) {
        await uploadPhoto(result.assets[0]);
      }
    } catch (error) {
      logError('사진 선택 오류', error as Error);
      Alert.alert('오류', '사진을 선택하는 중 오류가 발생했습니다.');
    }
  };

  // 사진 촬영
  const handleTakePhoto = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      });

      // 사용자가 취소했거나 에러가 있는 경우 무시
      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        logError('카메라 오류', new Error(result.errorMessage || result.errorCode));
        if (result.errorCode === 'permission') {
          Alert.alert('권한 필요', '사진을 촬영하려면 카메라 권한이 필요합니다. 설정에서 권한을 허용해주세요.');
        } else if (result.errorCode === 'camera_unavailable') {
          Alert.alert('오류', '카메라를 사용할 수 없습니다.');
        } else {
          Alert.alert('오류', '카메라를 사용하는 중 오류가 발생했습니다.');
        }
        return;
      }

      if (result.assets && result.assets[0]?.uri) {
        await uploadPhoto(result.assets[0]);
      }
    } catch (error) {
      logError('카메라 오류', error as Error);
      Alert.alert('오류', '카메라를 사용하는 중 오류가 발생했습니다.');
    }
  };

  // 사진 업로드 (S3)
  const uploadPhoto = async (asset: { uri?: string; type?: string; fileName?: string }) => {
    if (!asset.uri) return;

    try {
      setUploadingPhoto(true);

      const file = {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `verification_${Date.now()}.jpg`,
      };

      const result = await uploadMissionVerifyPhoto(file);

      if (result.success && result.data) {
        setPhotoUrl(result.data.fileUrl);
        Alert.alert('성공', '사진이 업로드되었습니다.');
      } else {
        Alert.alert('오류', result.error || '사진 업로드에 실패했습니다.');
      }
    } catch (error) {
      logError('사진 업로드 오류', error as Error);
      Alert.alert('오류', '사진 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // 사진 선택 옵션 표시
  const showPhotoOptions = () => {
    Alert.alert(
      '사진 추가',
      '사진을 추가할 방법을 선택해주세요.',
      [
        { text: '카메라', onPress: handleTakePhoto },
        { text: '갤러리', onPress: handleSelectPhoto },
        { text: '취소', style: 'cancel' },
      ]
    );
  };

  // 인증글 작성 또는 수정
  const handleSubmitVerification = async () => {
    if (!content.trim()) {
      Alert.alert('오류', '인증 내용을 입력해주세요.');
      return;
    }

    if (!isEditMode && !userMissionId) {
      Alert.alert('오류', '미션 정보가 올바르지 않습니다.');
      return;
    }

    try {
      setLoading(true);

      if (isEditMode) {
        // 수정 모드
        const result = await updateVerification(verificationId, {
          content: content.trim(),
          imageUrls: photoUrl ? [photoUrl] : [],
        });

        if (result.success) {
          setShowSuccessModal(true);
        } else {
          // 인증 통과 후 수정 불가 에러 처리
          if (result.error?.includes('수정') || result.error?.includes('MODIFICATION')) {
            Alert.alert('수정 불가', '인증이 완료된 게시글은 수정할 수 없습니다.');
          } else {
            Alert.alert('오류', result.error || '인증글 수정에 실패했습니다.');
          }
        }
      } else {
        // 작성 모드
        const verificationData = {
          userMissionId: userMissionId,
          content: content.trim(),
          imageUrls: photoUrl ? [photoUrl] : [],
        };

        const result = await createVerification(verificationData);

        if (result.success) {
          setShowSuccessModal(true);
        } else {
          // 이미 인증글이 존재하는 경우 처리
          if (result.error?.includes('이미 인증') || result.error?.includes('ALREADY_EXISTS') || result.error?.includes('V013')) {
            Alert.alert(
              '인증글이 이미 존재합니다',
              '이미 작성한 인증글이 있습니다. 커뮤니티에서 다른 사용자들의 투표를 기다려주세요!',
              [
                { text: '확인', onPress: () => navigation.goBack() }
              ]
            );
          } else {
            Alert.alert('오류', result.error || '인증글 작성에 실패했습니다.');
          }
        }
      }
    } catch (error) {
      logError('인증글 작성/수정 오류', error as Error);
      Alert.alert('오류', '인증글 작성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Header
        title={isEditMode ? "인증글 수정" : "인증글 작성"}
        leftButton={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../assets/images/left.png')}
              style={styles.backButtonIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* 미션 정보 표시 */}
        <View style={styles.missionInfo}>
          <Text style={styles.missionEmoji}>{missionEmoji || '🎯'}</Text>
          <View style={styles.missionTextContainer}>
            <Text style={styles.missionLabel}>인증할 미션</Text>
            <Text style={styles.missionTitle}>{missionTitle}</Text>
          </View>
        </View>

        {/* 안내 메시지 */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            인증글을 작성하면 다른 사용자들이 투표합니다.{'\n'}
            좋아요를 받으면 미션이 인증됩니다!
          </Text>
        </View>

        {/* 내용 입력 */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>인증 내용 *</Text>
          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="미션을 어떻게 완료했는지 설명해주세요..."
            placeholderTextColor={colors.text.tertiary}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />
        </View>

        {/* 사진 섹션 */}
        <View style={styles.photoSection}>
          <Text style={styles.label}>인증 사진 (선택)</Text>

          {photoUrl ? (
            <View style={styles.photoPreviewContainer}>
              <Image source={{ uri: photoUrl }} style={styles.previewImage} resizeMode="cover" />
              <TouchableOpacity
                style={styles.changePhotoButton}
                onPress={showPhotoOptions}
              >
                <Text style={styles.changePhotoText}>사진 변경</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={showPhotoOptions}
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? (
                <ActivityIndicator color={colors.primary[500]} />
              ) : (
                <>
                  <Image
                    source={require('../assets/images/plus.png')}
                    style={styles.addPhotoIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.addPhotoText}>사진 추가</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* 작성/수정 버튼 */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (loading || loadingData || !content.trim()) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmitVerification}
          disabled={loading || loadingData || !content.trim()}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditMode ? '인증글 수정' : '인증글 작성'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* 성공 모달 */}
      <AlertModal
        visible={showSuccessModal}
        title={isEditMode ? "인증글 수정 완료" : "인증글 작성 완료"}
        message={isEditMode
          ? "인증글이 수정되었습니다."
          : "인증글이 등록되었습니다. 다른 사용자들의 좋아요를 받으면 미션이 인증됩니다!"
        }
        onClose={() => {
          setShowSuccessModal(false);
          navigation.goBack();
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[20], // 하단 탭바 높이 + 여유 공간
  },
  backButtonIcon: {
    width: 24,
    height: 24,
    tintColor: colors.text.primary,
  },
  missionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.green[50],
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[4],
  },
  missionEmoji: {
    fontSize: 32,
    marginRight: spacing[3],
  },
  missionTextContainer: {
    flex: 1,
  },
  missionLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  missionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  infoBox: {
    backgroundColor: colors.blue[50],
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[4],
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.blue[700],
    lineHeight: 20,
  },
  inputSection: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  contentInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    minHeight: 160,
    textAlignVertical: 'top',
  },
  photoSection: {
    marginBottom: spacing[4],
  },
  photoPreviewContainer: {
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.lg,
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: spacing[2],
    right: spacing[2],
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
  },
  changePhotoText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
  },
  addPhotoButton: {
    backgroundColor: colors.gray[100],
    borderWidth: 2,
    borderColor: colors.gray[300],
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    padding: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoIcon: {
    width: 32,
    height: 32,
    tintColor: colors.gray[400],
    marginBottom: spacing[2],
  },
  addPhotoText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  submitButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[4],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing[4],
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  submitButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});

export default VerificationPostCreateScreen;
