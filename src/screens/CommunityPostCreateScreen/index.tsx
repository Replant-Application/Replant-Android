/**
 * 커뮤니티 게시글 작성 화면
 * 미션 완료 후 커뮤니티에 공유하는 화면
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
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { Header, AlertModal } from '../../components/ui';
import { colors } from '../../utils/designTokens';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { useCommunityPostCreateScreenContainer } from './CommunityPostCreateScreen.container';
import { styles } from './CommunityPostCreateScreen.styles';

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
      accessibilityElementsHidden={true}
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

export default CommunityPostCreateScreen;

