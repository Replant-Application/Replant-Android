/**
 * 커뮤니티 게시글 작성 화면
 * 미션 완료 후 커뮤니티에 공유하는 화면
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
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
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { useCommunityPostCreateScreenContainer } from './CommunityPostCreateScreen.container';

interface CommunityPostCreateScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'CommunityPostCreate'>;
}

const CommunityPostCreateScreen: React.FC<CommunityPostCreateScreenProps> = ({ navigation, route }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    isGeneralPost,
    missionTitle,
    missionEmoji,
    photoUrl,
    title,
    content,
    images,
    uploadingImage,
    loading,
    showSuccessModal,
    setTitle,
    setContent,
    handleSelectImage,
    handleRemoveImage,
    handleCreatePost,
    handleSuccessModalClose,
  } = useCommunityPostCreateScreenContainer({ navigation, route });

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
              {images.length < 3 && (
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
        onClose={handleSuccessModalClose}
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

