/**
 * 커뮤니티 게시글 작성 화면
 * 미션 완료 후 커뮤니티에 공유하는 화면
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
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { Header, AlertModal } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { useCommunity } from '../../hooks/useCommunity';
import { createVerificationPost } from '../../api/verificationApi';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { launchImageLibrary, launchCamera, ImagePickerResponse } from 'react-native-image-picker';
import { uploadCommunityPhoto } from '../../api/fileApi';
import { logError } from '../../utils/logger';

interface CommunityPostCreateScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'CommunityPostCreate'>;
}

const CommunityPostCreateScreen: React.FC<CommunityPostCreateScreenProps> = ({
  navigation,
  route,
}) => {
  // 안전한 기본값 설정 (크래시 방지)
  const params = route.params || {};
  const postType = params.type || 'VERIFICATION'; // GENERAL or VERIFICATION
  const isGeneralPost = postType === 'GENERAL';
  const userMissionId = params.userMissionId; // 인증글 작성 시 필요한 UserMission ID
  const missionId = params.missionId || '';
  const missionTitle = isGeneralPost ? '자유게시판' : (params.missionTitle || '미션');
  const missionEmoji = isGeneralPost ? '📝' : (params.missionEmoji || '🎯');
  const photoUrl = params.photoUrl;
  // 인증글일 때는 createPost를 사용하지 않음
  const { createPost } = useCommunity();
  const [title, setTitle] = useState(missionTitle);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 컴포넌트 마운트 시 로그
  React.useEffect(() => {
    console.log('[CommunityPostCreateScreen] 마운트:', {
      postType,
      isGeneralPost,
      userMissionId,
      missionId,
      missionTitle,
    });
  }, []);

  // 이미지 선택 (갤러리)
  const handleSelectImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 5,
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
          const uploadPromises = result.assets.map(async (asset) => {
            if (asset.uri) {
              const uploadResult = await uploadCommunityPhoto({
                uri: asset.uri,
                type: asset.type || 'image/jpeg',
                name: asset.fileName || `image_${Date.now()}.jpg`,
              });
              return uploadResult.success && uploadResult.data ? uploadResult.data.fileUrl : null;
            }
            return null;
          });

          const uploadedUrls = (await Promise.all(uploadPromises)).filter((url): url is string => url !== null);
          setImages((prev) => [...prev, ...uploadedUrls]);
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

  // 이미지 제거
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async () => {
    // 중복 호출 방지
    if (loading) {
      console.log('[CommunityPostCreateScreen] 이미 처리 중입니다.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('오류', '내용을 입력해주세요.');
      return;
    }

    // 인증글인데 userMissionId가 없으면 오류
    if (!isGeneralPost && !userMissionId) {
      Alert.alert('오류', '미션 정보가 없습니다. 다시 시도해주세요.');
      return;
    }

    try {
      setLoading(true);

      let result;

      if (isGeneralPost) {
        // 일반 게시글: communityService 사용
        // title이 비어있으면 missionTitle 사용, 그것도 없으면 기본값
        const postTitle = title.trim() || missionTitle || '자유게시글';
        
        console.log('[CommunityPostCreateScreen] 일반 게시글 작성 시작:', {
          postTitle,
          missionTitle,
          hasContent: !!content.trim(),
          postType,
        });
        
        const postData = {
          mission_id: missionId,
          mission_title: missionTitle,
          mission_emoji: missionEmoji,
          title: postTitle,
          content: content.trim(),
          images: photoUrl ? [photoUrl, ...images] : images,
          category: postType,
        };
        result = await createPost(postData);
        console.log('[CommunityPostCreateScreen] 일반 게시글 작성 완료:', result.success);
      } else {
        // 인증 게시글: verificationApi 사용 (일반 게시글 API 호출하지 않음)
        console.log('[CommunityPostCreateScreen] 인증글 작성 시작:', {
          userMissionId: userMissionId!,
          hasContent: !!content.trim(),
          hasPhoto: !!photoUrl,
          postType,
          isGeneralPost: false,
        });
        
        // 인증글은 createVerificationPost만 호출 (createPost 절대 호출 안 함)
        result = await createVerificationPost({
          userMissionId: userMissionId!,
          content: content.trim(),
          imageUrls: photoUrl ? [photoUrl] : undefined,
        });
        console.log('[CommunityPostCreateScreen] 인증글 작성 완료:', result.success);
        
        // 인증글 작성 시 일반 게시글 API는 절대 호출하지 않음
        if (result.success) {
          console.log('[CommunityPostCreateScreen] 인증글만 생성됨 - 일반 게시글 API 호출 안 함');
        }
      }

      if (result.success) {
        setShowSuccessModal(true);
      } else {
        Alert.alert('오류', result.error || '게시글 작성에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '게시글 작성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Header
          title="게시글 작성"
          navigation={navigation}
          showBorder={false}
          titleStyle={styles.headerTitle}
        />

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* 미션 정보 표시 */}
        <View style={styles.missionInfo}>
          <Image
            source={isGeneralPost
              ? require('../../assets/images/pencil.png')
              : require('../../assets/images/alarm.png')
            }
            style={styles.missionIcon}
            resizeMode="contain"
            accessibilityLabel={isGeneralPost ? "일반 게시글 아이콘" : "인증 게시글 아이콘"}
          />
          <View style={styles.missionTextContainer}>
            <Text style={styles.missionLabel}>
              {isGeneralPost ? '게시판' : '완료한 미션'}
            </Text>
            <Text style={styles.missionTitle}>{missionTitle}</Text>
          </View>
        </View>

        {/* 제목 입력 */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>제목 (선택사항)</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder={missionTitle}
            placeholderTextColor={colors.text.tertiary}
          />
        </View>

        {/* 내용 입력 */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>내용 *</Text>
          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder={isGeneralPost
              ? "자유롭게 이야기를 나눠보세요..."
              : "미션을 완료한 소감이나 경험을 공유해주세요..."
            }
            placeholderTextColor={colors.text.tertiary}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* 이미지 섹션 (일반 게시글만) */}
        {isGeneralPost && (
          <View style={styles.inputSection}>
            <Text style={styles.label}>사진 (선택)</Text>
            <View style={styles.imageContainer}>
              {images.map((imageUrl, index) => (
                <View key={index} style={styles.imagePreviewWrapper}>
                  <Image 
                    source={{ uri: imageUrl }} 
                    style={styles.previewImage} 
                    resizeMode="cover" 
                    accessibilityLabel="이미지 미리보기"
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Text style={styles.removeImageText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 5 && (
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={handleSelectImage}
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
                        accessibilityLabel="이미지 추가 아이콘"
                      />
                      <Text style={styles.addImageText}>사진 추가</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* 미션 인증 사진 표시 (인증글만) */}
        {!isGeneralPost && photoUrl && (
          <View style={styles.imageSection}>
            <Text style={styles.label}>인증 사진</Text>
            <Image 
              source={{ uri: photoUrl }} 
              style={styles.previewImage} 
              resizeMode="cover" 
              accessibilityLabel="인증 사진 미리보기"
            />
          </View>
        )}

        {/* 작성 버튼 */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (loading || !content.trim()) && styles.submitButtonDisabled
          ]}
          onPress={handleCreatePost}
          disabled={loading || !content.trim()}
          activeOpacity={0.7}
        >
          <Text style={styles.submitButtonText}>
            {loading ? '작성 중...' : '게시글 등록'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <AlertModal
        visible={showSuccessModal}
        title="성공!"
        message="커뮤니티에 게시글이 등록되었습니다!"
        buttonText="확인"
        onClose={() => {
          setShowSuccessModal(false);
          navigation.navigate('Community');
        }}
      />
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[6],
  },
  backButtonIcon: {
    width: 24,
    height: 24,
  },
  missionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    marginBottom: spacing[4],
  },
  missionIcon: {
    width: 32,
    height: 32,
    marginRight: spacing[3],
  },
  missionTextContainer: {
    flex: 1,
  },
  missionLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  missionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  inputSection: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  titleInput: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    height: 48,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  contentInput: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    minHeight: 150,
    maxHeight: 300,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    textAlignVertical: 'top',
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  imagePreviewWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
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
  imageSection: {
    marginBottom: spacing[4],
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
  },
  submitButton: {
    backgroundColor: colors.green[500],
    borderRadius: borderRadius.full,
    paddingVertical: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[2],
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[300],
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
});

export default CommunityPostCreateScreen;

