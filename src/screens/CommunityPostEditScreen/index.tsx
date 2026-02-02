/**
 * 커뮤니티 게시글 수정 화면
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
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Button, Header, AlertModal, FullScreenImageViewer } from '../../components/ui';
import { colors } from '../../utils/designTokens';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { useCommunityPostEditScreenContainer } from './CommunityPostEditScreen.container';
import { styles } from './CommunityPostEditScreen.styles';

interface CommunityPostEditScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'CommunityPostEdit'>;
}

const CommunityPostEditScreen: React.FC<CommunityPostEditScreenProps> = ({ navigation, route }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    post,
    loading,
    isAuthor,
    isVerificationPost,
    isGeneralPost,
    title,
    content,
    images,
    isPublic,
    setIsPublic,
    uploadingImage,
    saving,
    setTitle,
    setContent,
    handleSelectImage,
    handleRemoveImage,
    handleUpdatePost,
    showAlert,
    alertTitle,
    alertMessage,
    handleAlertClose,
    showSuccessModal,
    handleSuccessModalClose,
  } = useCommunityPostEditScreenContainer({ navigation, route });

  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  if (loading || !post) {
    return (
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
        accessibilityElementsHidden={true}
      >
        <View style={styles.container}>
          <Header
            title="게시글 수정"
            navigation={navigation}
            showBorder={false}
            titleStyle={styles.headerTitle}
          />
          <View style={styles.loadingContainer}>
            <Text>로딩 중...</Text>
          </View>
        </View>
        <AlertModal
          visible={showAlert}
          title={alertTitle}
          message={alertMessage}
          buttonText="확인"
          onClose={handleAlertClose}
        />
        <AlertModal
          visible={showSuccessModal}
          title="성공!"
          message="게시글이 수정되었습니다!"
          buttonText="확인"
          onClose={handleSuccessModalClose}
        />
      </ImageBackground>
    );
  }

  if (!isAuthor) {
    return (
      <>
        <AlertModal
          visible={showAlert}
          title={alertTitle}
          message={alertMessage}
          buttonText="확인"
          onClose={handleAlertClose}
        />
        <AlertModal
          visible={showSuccessModal}
          title="성공!"
          message="게시글이 수정되었습니다!"
          buttonText="확인"
          onClose={handleSuccessModalClose}
        />
      </>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
      accessibilityElementsHidden={true}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Header
          title="게시글 수정"
          navigation={navigation}
          showBorder={false}
          titleStyle={styles.headerTitle}
        />

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* 인증글만: 완료한 미션 표시 (수정 불가) */}
        {!isGeneralPost && (
          <View style={styles.missionInfo}>
            <Text style={styles.missionEmoji}>{post.mission_emoji || '🎯'}</Text>
            <View style={styles.missionTextContainer}>
              <Text style={styles.missionLabel}>완료한 미션</Text>
              <Text style={styles.missionTitle}>{post.mission_title || '미션'}</Text>
            </View>
          </View>
        )}

        {/* 일반글만: 비공개 전환 (제목 위, 작성 화면과 동일 순서) */}
        {isGeneralPost && (
          <View style={styles.inputSection}>
            <TouchableOpacity
              style={styles.privateCheckboxRow}
              onPress={() => setIsPublic(!isPublic)}
              activeOpacity={0.7}
              accessibilityRole="checkbox"
              accessibilityLabel="비공개로 작성"
              accessibilityState={{ checked: !isPublic }}
              accessibilityHint="체크하면 작성자만 볼 수 있는 비공개 글로 전환됩니다"
            >
              <Text style={styles.privateCheckboxLabel}>비공개로 작성</Text>
              <View style={[styles.privateCheckbox, !isPublic && styles.privateCheckboxSelected]}>
                {!isPublic && <Text style={styles.privateCheckmark}>✓</Text>}
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* 제목 입력 */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>제목</Text>
          {isVerificationPost ? (
            <>
              <TextInput
                style={[styles.titleInput, styles.titleInputDisabled]}
                value={title}
                editable={false}
                placeholder={post.mission_title || '미션'}
                placeholderTextColor={colors.text.tertiary}
                multiline={false}
                accessibilityLabel="제목 (수정 불가)"
                accessibilityHint="인증글은 제목을 수정할 수 없습니다"
              />
              <Text style={styles.disabledNote}>인증글은 제목을 수정할 수 없습니다.</Text>
            </>
          ) : (
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder={post.mission_title || '미션'}
              placeholderTextColor={colors.text.tertiary}
              multiline={false}
              accessibilityLabel="제목"
              accessibilityHint="게시글 제목을 입력하세요"
            />
          )}
        </View>

        {/* 내용 입력 - 노트 스타일 (작성 화면과 동일) */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>내용 *</Text>
          <View style={styles.contentInputWrapper}>
            <View style={styles.noteLines}>
              {[...Array(6)].map((_, i) => (
                <View key={i} style={styles.noteLine} />
              ))}
            </View>
            <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="내용을 입력하세요..."
            placeholderTextColor={colors.text.tertiary}
            multiline
            numberOfLines={7}
            textAlignVertical="top"
            accessibilityLabel="내용"
            accessibilityHint="게시글 내용을 입력하세요"
          />
          </View>
        </View>

        {/* 사진 (일반/인증 모두 표시, 추가·삭제 가능) */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>사진 (선택)</Text>
          <View style={styles.imageContainer}>
            {images.map((imageUrl, index) => (
              <View key={index} style={styles.imagePreviewWrapper}>
                <TouchableOpacity
                  style={styles.previewImageTouchable}
                  onPress={() => setSelectedImageUri(imageUrl)}
                  activeOpacity={0.9}
                  accessibilityRole="imagebutton"
                  accessibilityLabel={`사진 ${index + 1} 자세히 보기`}
                >
                  <Image 
                    source={{ uri: imageUrl }} 
                    style={styles.previewImage} 
                    resizeMode="cover" 
                    accessibilityLabel={`사진 ${index + 1}`}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveImage(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`사진 ${index + 1} 제거`}
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
                accessibilityRole="button"
                accessibilityLabel="사진 추가"
                accessibilityState={{ disabled: uploadingImage }}
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

        {/* 수정 버튼 */}
        <View style={styles.buttonContainer}>
          <Button
            title={saving ? '수정 중...' : '수정 완료'}
            onPress={handleUpdatePost}
            disabled={saving || !content.trim()}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>

      {/* 오류 모달 */}
      <AlertModal
        visible={showAlert}
        title={alertTitle}
        message={alertMessage}
        buttonText="확인"
        onClose={handleAlertClose}
      />
      {/* 성공 모달 */}
      <AlertModal
        visible={showSuccessModal}
        title="성공!"
        message="게시글이 수정되었습니다!"
        buttonText="확인"
        onClose={handleSuccessModalClose}
      />

      <FullScreenImageViewer
        visible={!!selectedImageUri}
        imageUri={selectedImageUri}
        onClose={() => setSelectedImageUri(null)}
      />
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};


export default CommunityPostEditScreen;

