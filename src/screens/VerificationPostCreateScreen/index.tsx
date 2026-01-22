/**
 * 인증글 작성/수정 화면
 * COMMUNITY 인증 타입 미션의 인증글 작성 및 수정
 */

import React from 'react';
import {
  View,
  Text,
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
import { colors } from '../../utils/designTokens';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { useVerificationPostCreateScreenContainer } from './VerificationPostCreateScreen.container';
import { styles } from './VerificationPostCreateScreen.styles';

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

export default VerificationPostCreateScreen;
