/**
 * 커뮤니티 게시글 수정 화면
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
  ImageBackground,
} from 'react-native';
import { Button, Header, AlertModal } from '../../components/ui';
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
    title,
    content,
    saving,
    setTitle,
    setContent,
    handleUpdatePost,
    showAlert,
    alertTitle,
    alertMessage,
    handleAlertClose,
    showSuccessModal,
    handleSuccessModalClose,
  } = useCommunityPostEditScreenContainer({ navigation, route });

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
        {/* 미션 정보 표시 (수정 불가) */}
        <View style={styles.missionInfo}>
          <Text style={styles.missionEmoji}>{post.mission_emoji || '🎯'}</Text>
          <View style={styles.missionTextContainer}>
            <Text style={styles.missionLabel}>완료한 미션</Text>
            <Text style={styles.missionTitle}>{post.mission_title || '미션'}</Text>
          </View>
        </View>

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

        {/* 내용 입력 */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>내용 *</Text>
          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="내용을 입력하세요..."
            placeholderTextColor={colors.text.tertiary}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            accessibilityLabel="내용"
            accessibilityHint="게시글 내용을 입력하세요"
          />
        </View>

        {/* 미션 인증 사진 표시 (수정 불가) */}
        {post.images && post.images.length > 0 && (
          <View style={styles.imageSection}>
            <Text style={styles.label}>인증 사진</Text>
            <Image 
              source={{ uri: post.images[0] }} 
              style={styles.previewImage} 
              resizeMode="cover" 
              accessibilityLabel="인증 사진"
            />
            <Text style={styles.imageNote}>인증 사진은 수정할 수 없습니다.</Text>
          </View>
        )}

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
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};


export default CommunityPostEditScreen;

