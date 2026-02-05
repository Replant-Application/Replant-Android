/**
 * 인증글 작성/수정 화면
 * COMMUNITY 인증 타입 미션의 인증글 작성 및 수정
 */

import React, { useState } from 'react';
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
  Modal,
} from 'react-native';
import { Header, AlertModal, FullScreenImageViewer } from '../../components/ui';
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
    content,
    images,
    loading,
    uploadingPhoto,
    loadingData,
    showSuccessModal,
    showAlreadyExistsModal,
    showErrorModal,
    errorMessage,
    alertTitle,
    setContent,
    handleRemoveImage,
    showPhotoOptions,
    showPhotoOptionsModal,
    closePhotoOptionsModal,
    handleTakePhoto,
    handleSelectPhoto,
    handleSubmitVerification,
    handleSuccessModalClose,
    handleAlreadyExistsModalClose,
    handleErrorModalClose,
    completionRate,
    getEncouragementMessage,
    sliderRef,
    panResponder,
  } = useVerificationPostCreateScreenContainer({ navigation, route });

  const [showInfoMessage, setShowInfoMessage] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const isCompletionAtOrBelow25 = completionRate <= 25;

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.container}
      resizeMode="cover"
      accessibilityElementsHidden={true}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Header
        title={isEditMode ? "인증글 수정" : "인증글 작성"}
        leftButton={
          <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="뒤로 가기">
            <Image
              source={require('../../assets/images/left.png')}
              style={styles.backButtonIcon}
              resizeMode="contain"
              accessibilityElementsHidden={true}
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

        {/* 완료 정도 슬라이더 (감정일기와 동일한 트랙·썸·± 버튼 스타일) */}
        <View style={styles.completionSection}>
          <View style={styles.completionHeader}>
            <Text style={styles.completionHeaderLabel}>
              완료 정도 <Text style={styles.completionPercent}>({completionRate}%)</Text>
            </Text>
          </View>
          <View style={styles.sliderContainer}>
            <View
              ref={sliderRef}
              style={styles.sliderTrack}
              {...panResponder.panHandlers}
              accessible={true}
              accessibilityRole="adjustable"
              accessibilityLabel="완료 정도 슬라이더. 0%부터 100%까지 5% 단위로 조절할 수 있습니다."
              accessibilityValue={{ min: 0, max: 100, now: completionRate }}
            >
              <View
                style={[
                  styles.sliderFill,
                  { width: `${completionRate}%`, backgroundColor: colors.primary[500] },
                ]}
                accessibilityElementsHidden={true}
              />
              <View
                style={[styles.sliderThumb, { left: `${completionRate}%` }]}
                accessibilityElementsHidden={true}
              />
            </View>
          </View>

          {/* 원래 표시되던 메시지 영역: 25% 이하는 경고만, 25% 초과는 응원만 (항상 1개) */}
          <View style={[styles.encouragementBox, isCompletionAtOrBelow25 && styles.messageBoxLowCompletion]}>
            <Text style={[styles.encouragementText, isCompletionAtOrBelow25 && styles.messageBoxLowCompletionText]}>
              {isCompletionAtOrBelow25
                ? '미션 완료를 위해 더 노력해요! (최소 25%)'
                : getEncouragementMessage(completionRate)}
            </Text>
          </View>
        </View>

        {/* 내용 입력 */}
        <View style={styles.inputSection}>
          <View style={styles.inputHeaderRow}>
            <Text style={[styles.label, styles.inputLabelNoMargin]}>인증 내용</Text>
            <TouchableOpacity
              style={styles.infoToggleButton}
              onPress={() => setShowInfoMessage(prev => !prev)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="안내 보기"
            >
              <Text style={styles.infoToggleButtonText}>?</Text>
            </TouchableOpacity>
          </View>
          {showInfoMessage && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                인증글을 작성하면 커뮤니티에 공개됩니다.{'\n'}
                다른 사용자의 좋아요를 받으면 미션이 완료됩니다.
              </Text>
            </View>
          )}
          <View style={styles.notebookContainer}>
            <View style={styles.notebookLines}>
              {[...Array(20)].map((_, i) => (
                <View key={i} style={i === 19 ? styles.notebookLineLast : styles.notebookLine} />
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
              accessibilityLabel="인증 내용"
              accessibilityHint="미션을 완료한 과정을 자유롭게 작성해주세요"
            />
          </View>
        </View>

        {/* 사진 섹션 */}
        <View style={styles.photoSection}>
          <Text style={styles.label}>인증 사진 (선택)</Text>
          {images.length > 0 && (
            <View style={styles.imageContainer}>
              {images.map((imageUrl, index) => (
                <View key={index} style={styles.imagePreviewWrapper}>
                  <TouchableOpacity
                    style={styles.previewImageTouchable}
                    onPress={() => setSelectedImageUri(imageUrl)}
                    activeOpacity={0.9}
                    accessibilityRole="imagebutton"
                    accessibilityLabel={`인증 사진 ${index + 1} 자세히 보기`}
                  >
                    <Image 
                      source={{ uri: imageUrl }} 
                      style={styles.previewImage} 
                      resizeMode="cover" 
                      accessibilityLabel={`인증 사진 ${index + 1}`}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(index)}
                    accessibilityRole="button"
                    accessibilityLabel={`인증 사진 ${index + 1} 제거`}
                  >
                    <Text style={styles.removeImageText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          {images.length < 3 && (
            <TouchableOpacity
              style={[
                styles.addPhotoButton,
                images.length > 0 && styles.addPhotoButtonWithImages
              ]}
              onPress={showPhotoOptions}
              disabled={uploadingPhoto}
              accessibilityRole="button"
              accessibilityLabel="사진 추가"
              accessibilityState={{ disabled: uploadingPhoto }}
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

      </ScrollView>

      {/* 작성/수정 버튼 - 하단 고정 */}
      <View style={styles.buttonContainer}>
        <ImageBackground
          source={require('../../assets/images/background.png')}
          style={styles.buttonBackground}
          resizeMode="cover"
          accessibilityElementsHidden={true}
        >
        <TouchableOpacity
          style={[
            styles.submitButton,
            (loading || loadingData || !content.trim()) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmitVerification}
          disabled={loading || loadingData || !content.trim()}
          accessibilityRole="button"
          accessibilityLabel={isEditMode ? '인증글 수정' : '인증글 작성'}
          accessibilityState={{ disabled: loading || loadingData || !content.trim() }}
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
            : '인증글이 등록되었습니다.\n좋아요를 받으면 인증이 완료됩니다!'
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
        title={alertTitle || '오류'}
        message={errorMessage}
        buttonText="확인"
        onClose={handleErrorModalClose}
      />

      <FullScreenImageViewer
        visible={!!selectedImageUri}
        imageUri={selectedImageUri}
        onClose={() => setSelectedImageUri(null)}
      />

      {/* 사진 추가 커스텀 모달 */}
      <Modal
        visible={showPhotoOptionsModal}
        transparent
        animationType="fade"
        onRequestClose={closePhotoOptionsModal}
      >
        <View style={styles.photoOptionsOverlay}>
          <View style={styles.photoOptionsModalContainer}>
            <Text style={styles.photoOptionsTitle} accessibilityRole="header">사진 추가</Text>
            <Text style={styles.photoOptionsMessage}>사진을 추가할 방법을 선택해주세요.</Text>
            <View style={styles.photoOptionsButtonRow}>
              <TouchableOpacity
                style={[styles.photoOptionsButton, styles.photoOptionsCancelButton]}
                onPress={closePhotoOptionsModal}
                accessibilityRole="button"
                accessibilityLabel="취소"
              >
                <Text style={styles.photoOptionsCancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.photoOptionsButton, styles.photoOptionsActionButton]}
                onPress={() => {
                  closePhotoOptionsModal();
                  handleTakePhoto();
                }}
                accessibilityRole="button"
                accessibilityLabel="카메라"
              >
                <Text style={styles.photoOptionsButtonText}>카메라</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.photoOptionsButton, styles.photoOptionsActionButton]}
                onPress={() => {
                  closePhotoOptionsModal();
                  handleSelectPhoto();
                }}
                accessibilityRole="button"
                accessibilityLabel="갤러리"
              >
                <Text style={styles.photoOptionsButtonText}>갤러리</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default VerificationPostCreateScreen;
