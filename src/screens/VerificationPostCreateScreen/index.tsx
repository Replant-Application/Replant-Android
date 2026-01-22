/**
 * 인증글 작성/수정 화면
 * COMMUNITY 인증 타입 미션의 인증글 작성 및 수정
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
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { Header, AlertModal } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { useVerificationPostCreateScreenContainer } from './VerificationPostCreateScreen.container';

interface VerificationPostCreateScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'VerificationPostCreate'>;
}

const VerificationPostCreateScreen: React.FC<VerificationPostCreateScreenProps> = ({ navigation, route }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    isEditMode,
    missionTitle,
    missionEmoji,
    content,
    images,
    loading,
    uploadingPhoto,
    loadingData,
    showSuccessModal,
    showAlreadyExistsModal,
    showErrorModal,
    errorMessage,
    setContent,
    handleRemoveImage,
    showPhotoOptions,
    handleSubmitVerification,
    handleSuccessModalClose,
    handleAlreadyExistsModalClose,
    handleErrorModalClose,
  } = useVerificationPostCreateScreenContainer({ navigation, route });

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Header
        title={isEditMode ? "인증글 수정" : "인증글 작성"}
        leftButton={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../../assets/images/left.png')}
              style={styles.backButtonIcon}
              resizeMode="contain"
              accessibilityLabel="뒤로 가기"
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
          <View style={styles.missionEmojiContainer}>
            <Image
              source={require('../../assets/images/goal.png')}
              style={styles.missionEmojiImage}
              resizeMode="contain"
              accessibilityLabel="미션 아이콘"
            />
          </View>
          <View style={styles.missionTextContainer}>
            <Text style={styles.missionLabel}>미션</Text>
            <Text style={styles.missionTitle}>{missionTitle}</Text>
          </View>
        </View>

        {/* 안내 메시지 */}
        <View style={styles.infoBox}>
          <Image
            source={require('../../assets/images/light.png')}
            style={styles.infoIconImage}
            resizeMode="contain"
            accessibilityLabel="안내 아이콘"
          />
          <Text style={styles.infoText}>
            인증글을 작성하면 커뮤니티에 공개됩니다.{'\n'}
            다른 사용자들의 좋아요를 받으면 미션이 완료됩니다.
          </Text>
        </View>

        {/* 내용 입력 */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>인증 내용 *</Text>
          <View style={styles.notebookContainer}>
            <View style={styles.notebookLines}>
              {[...Array(20)].map((_, i) => (
                <View key={i} style={styles.notebookLine} />
              ))}
            </View>
            <TextInput
              style={styles.contentInput}
              value={content}
              onChangeText={setContent}
              placeholder="미션을 완료한 과정을 자유롭게 작성해주세요"
              placeholderTextColor={colors.text.tertiary}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* 사진 섹션 */}
        <View style={styles.photoSection}>
          <Text style={styles.label}>인증 사진 (선택)</Text>
          <View style={styles.imageContainer}>
            {images.map((imageUrl, index) => (
              <View key={index} style={styles.imagePreviewWrapper}>
                <Image 
                  source={{ uri: imageUrl }} 
                  style={styles.previewImage} 
                  resizeMode="cover" 
                  accessibilityLabel={`인증 사진 ${index + 1}`}
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
                style={styles.addPhotoButton}
                onPress={showPhotoOptions}
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? (
                  <ActivityIndicator color={colors.primary[500]} />
                ) : (
                  <>
                    <Image
                      source={require('../../assets/images/camera.png')}
                      style={styles.addPhotoIcon}
                      resizeMode="contain"
                      accessibilityLabel="사진 첨부 아이콘"
                    />
                    <Text style={styles.addPhotoText}>사진 추가</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

      </ScrollView>

      {/* 작성/수정 버튼 - 하단 고정 */}
      <View style={styles.buttonContainer}>
        <ImageBackground
          source={require('../../assets/images/background.png')}
          style={styles.buttonBackground}
          resizeMode="cover"
        >
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
        </ImageBackground>
      </View>

      {/* 성공 모달 */}
      <AlertModal
        visible={showSuccessModal}
        title={isEditMode ? '인증글 수정 완료' : '인증글 작성 완료'}
        message={
          isEditMode
            ? '인증글이 수정되었습니다.'
            : '인증글이 등록되었습니다. 다른 사용자들의 좋아요를 받으면 미션이 인증됩니다!'
        }
        onClose={handleSuccessModalClose}
      />

      {/* 이미 존재하는 인증글 모달 */}
      <AlertModal
        visible={showAlreadyExistsModal}
        title="인증글이 이미 존재합니다"
        message="이미 작성한 인증글이 있습니다. 커뮤니티에서 다른 사용자들의 투표를 기다려주세요!"
        buttonText="확인"
        onClose={handleAlreadyExistsModalClose}
      />

      {/* 오류 모달 */}
      <AlertModal
        visible={showErrorModal}
        title="오류"
        message={errorMessage}
        buttonText="확인"
        onClose={handleErrorModalClose}
      />
    </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
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
    backgroundColor: colors.white,
    padding: spacing[4],
    borderRadius: borderRadius.base,
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  missionEmojiContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  missionEmoji: {
    fontSize: 24,
  },
  missionEmojiImage: {
    width: 24,
    height: 24,
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
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.primary[50],
    padding: spacing[3],
    borderRadius: borderRadius.base,
    marginBottom: spacing[4],
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 18,
    marginRight: spacing[2],
    marginTop: 1,
  },
  infoIconImage: {
    width: 18,
    height: 18,
    marginRight: spacing[2],
    marginTop: 1,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    color: colors.primary[700],
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
    includeFontPadding: false,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
  },
  inputSection: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  notebookContainer: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.base,
    minHeight: 200,
    overflow: 'hidden',
    position: 'relative',
  },
  notebookLines: {
    position: 'absolute',
    top: 0,
    left: -24,
    right: 0,
    bottom: 0,
    paddingLeft: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
  },
  notebookLine: {
    height: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    marginBottom: 0,
  },
  contentInput: {
    backgroundColor: 'transparent',
    padding: spacing[4],
    paddingLeft: spacing[6],
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    minHeight: 200,
    textAlignVertical: 'top',
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    includeFontPadding: false,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
  },
  photoSection: {
    marginBottom: spacing[4],
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
  addPhotoButton: {
    width: 100,
    height: 100,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
  },
  addPhotoIcon: {
    width: 32,
    height: 32,
    marginBottom: spacing[2],
  },
  addPhotoText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  buttonContainer: {
    padding: spacing[4],
    paddingBottom: spacing[6],
    borderTopWidth: 1,
    borderTopColor: '#D4A574',
  },
  buttonBackground: {
    borderRadius: borderRadius.base,
    overflow: 'hidden',
  },
  submitButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.base,
    alignItems: 'center',
    shadowColor: colors.primary[500],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[300],
    shadowOpacity: 0,
    elevation: 0,
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

export default VerificationPostCreateScreen;
