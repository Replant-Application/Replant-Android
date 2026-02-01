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
import Slider from '@react-native-community/slider';
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
    isMealMission,
    missionTitle,
    photoUrl,
    title,
    content,
    images,
    uploadingImage,
    loading,
    showSuccessModal,
    tasteRating,
    showAlert,
    alertTitle,
    alertMessage,
    setTitle,
    setContent,
    setTasteRating,
    handleSelectImage,
    handleRemoveImage,
    handleCreatePost,
    handleSuccessModalClose,
    handleAlertClose,
  } = useCommunityPostCreateScreenContainer({ navigation, route });

  const getTasteLabel = (rating: number) => {
    const labels = ['😖 별로', '😐 그저그럼', '🙂 보통', '😋 맛있음', '🤤 최고!'];
    return labels[Math.round(rating) - 1] || labels[2];
  };

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
          <Text style={styles.label}>제목</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="제목을 입력해주세요"
            placeholderTextColor={colors.text.tertiary}
            accessibilityLabel="제목"
            accessibilityHint="게시글 제목을 입력하세요"
          />
        </View>

        {/* 내용 입력 - 노트 스타일 */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>설명</Text>
          <View style={styles.contentInputWrapper}>
            {/* 노트 줄 배경 */}
            <View style={styles.noteLines}>
              {[...Array(6)].map((_, i) => (
                <View key={i} style={styles.noteLine} />
              ))}
            </View>
            <TextInput
              style={styles.contentInput}
              value={content}
              onChangeText={setContent}
              placeholder={isGeneralPost
                ? "자유롭게 이야기를 나눠보세요..."
                : "미션을 완료한 소감이나 경험을 공유해주세요..."
              }
              placeholderTextColor={colors.text.tertiary}
              accessibilityLabel="내용"
              accessibilityHint={isGeneralPost ? "자유롭게 이야기를 나눠보세요" : "미션을 완료한 소감이나 경험을 공유해주세요"}
              multiline
              textAlignVertical="top"
            />
          </View>
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
                    accessibilityRole="button"
                    accessibilityLabel="이미지 삭제"
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

        {/* 이미지 섹션 (식사 미션) */}
        {!isGeneralPost && isMealMission && (
          <View style={styles.inputSection}>
            <Text style={styles.label}>오늘의 식사 사진</Text>
            <View style={styles.mealPhotoContainer}>
              <View style={styles.imageContainer}>
                {images.map((imageUrl, index) => (
                  <View key={index} style={styles.imagePreviewWrapper}>
                    <Image 
                      source={{ uri: imageUrl }} 
                      style={styles.mealPreviewImage} 
                      resizeMode="cover" 
                      accessibilityLabel="식사 사진 미리보기"
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(index)}
                      accessibilityRole="button"
                      accessibilityLabel="이미지 삭제"
                    >
                      <Text style={styles.removeImageText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                {images.length < 3 && (
                  <TouchableOpacity
                    style={styles.addImageButtonSmall}
                    onPress={handleSelectImage}
                    disabled={uploadingImage}
                    accessibilityRole="button"
                    accessibilityLabel="사진 추가"
                    accessibilityState={{ disabled: uploadingImage }}
                  >
                    {uploadingImage ? (
                      <ActivityIndicator color={colors.primary[500]} size="small" />
                    ) : (
                      <Image
                        source={require('../../assets/images/camera.png')}
                        style={styles.addImageIconSmall}
                        resizeMode="contain"
                        accessibilityLabel="이미지 추가 아이콘"
                      />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}

        {/* 맛 평가 슬라이더 (식사 미션) */}
        {!isGeneralPost && isMealMission && (
          <View style={styles.inputSection}>
            <Text style={styles.label}>맛은 어땠나요?</Text>
            <View style={styles.sliderContainer}>
              <View style={styles.sliderHeader}>
                <Text style={styles.tasteLabel}>{getTasteLabel(tasteRating)}</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={5}
                step={1}
                value={tasteRating}
                onValueChange={setTasteRating}
                minimumTrackTintColor={colors.green[500]}
                maximumTrackTintColor={colors.gray[300]}
                thumbTintColor={colors.green[500]}
                accessibilityRole="adjustable"
                accessibilityLabel="맛 점수"
                accessibilityValue={{ min: 1, max: 5, now: tasteRating }}
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderMinLabel}>1</Text>
                <Text style={styles.sliderMaxLabel}>5</Text>
              </View>
            </View>
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
          accessibilityRole="button"
          accessibilityLabel={loading ? '작성 중' : '게시글 등록'}
          accessibilityState={{ disabled: loading || !content.trim() }}
        >
          <Text style={styles.submitButtonText}>
            {loading ? '작성 중...' : '게시글 등록'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 성공 모달 */}
      <AlertModal
        visible={showSuccessModal}
        title="성공!"
        message="커뮤니티에 게시글이 등록되었습니다!"
        buttonText="확인"
        onClose={handleSuccessModalClose}
      />

      {/* 오류 모달 */}
      <AlertModal
        visible={showAlert}
        title={alertTitle}
        message={alertMessage}
        buttonText="확인"
        onClose={handleAlertClose}
      />
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default CommunityPostCreateScreen;

