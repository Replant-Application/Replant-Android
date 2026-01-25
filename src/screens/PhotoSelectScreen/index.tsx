/**
 * 사진 선택 화면
 * 카메라 촬영 또는 갤러리에서 사진 선택 (다중 선택 지원)
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Header, Button } from '../../components/ui';
import { colors } from '../../utils/designTokens';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { usePhotoSelectScreenContainer } from './PhotoSelectScreen.container';
import { styles } from './PhotoSelectScreen.styles';

interface PhotoSelectScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route?: RouteProp<RootStackParamList, 'PhotoSelect'>;
}

const PhotoSelectScreen: React.FC<PhotoSelectScreenProps> = ({ navigation, route }) => {
  const missionId = route?.params?.missionId;

  // 비즈니스 로직은 Container에서 처리
  const {
    selectedPhotoUris,
    uploadingImage,
    analyzing,
    handleTakePhoto,
    handlePickFromGallery,
    handleRemoveImage,
    handleAnalyzePhoto,
    handleConfirm,
    handleCancel,
    handleGoBack,
  } = usePhotoSelectScreenContainer({ navigation, missionId });

  return (
    <View style={styles.container}>
      <Header
        title="사진 선택"
        titleStyle={styles.headerTitle}
        leftButton={
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Image
              source={require('../../assets/images/left.png')}
              style={styles.backButtonIcon}
              resizeMode="contain"
              accessibilityLabel="뒤로 가기"
            />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            미션 인증을 위한 사진을 선택해주세요{'\n'}
            (최대 3개까지 선택 가능)
          </Text>
        </View>

        {/* 선택된 사진 그리드 */}
        {selectedPhotoUris.length > 0 && (
          <View style={styles.imageContainer}>
            {selectedPhotoUris.map((imageUrl, index) => (
              <View key={index} style={styles.imagePreviewWrapper}>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.previewImage}
                  resizeMode="cover"
                  accessibilityLabel={`선택한 사진 ${index + 1}`}
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveImage(index)}
                >
                  <Text style={styles.removeImageText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            {selectedPhotoUris.length < 3 && (
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={handlePickFromGallery}
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
                      accessibilityLabel="사진 추가 아이콘"
                    />
                    <Text style={styles.addImageText}>사진 추가</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* 사진 선택 옵션 (선택된 사진이 없을 때만 표시) */}
        {selectedPhotoUris.length === 0 && (
          <View style={styles.optionsContainer}>
            {/* 카메라 촬영 버튼 */}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleTakePhoto}
              activeOpacity={0.7}
              disabled={uploadingImage}
            >
              <View style={styles.optionIconContainer}>
                <Image
                  source={require('../../assets/images/camera.png')}
                  style={styles.optionIconImage}
                  resizeMode="contain"
                  accessibilityLabel="카메라 아이콘"
                />
              </View>
              <Text style={styles.optionTitle}>카메라로 촬영</Text>
              <Text style={styles.optionDescription}>새 사진을 촬영합니다</Text>
            </TouchableOpacity>

            {/* 갤러리 선택 버튼 */}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handlePickFromGallery}
              activeOpacity={0.7}
              disabled={uploadingImage}
            >
              <View style={styles.optionIconContainer}>
                <Image
                  source={require('../../assets/images/picture.png')}
                  style={styles.optionIconImage}
                  resizeMode="contain"
                  accessibilityLabel="갤러리 아이콘"
                />
              </View>
              <Text style={styles.optionTitle}>갤러리에서 선택</Text>
              <Text style={styles.optionDescription}>
                저장된 사진을 선택합니다 (최대 3개)
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 하단 버튼 */}
        {selectedPhotoUris.length > 0 && (
          <View style={styles.previewButtons}>
            <Button
              title="다시 선택"
              onPress={handleCancel}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              title={analyzing ? '🤖 분석중...' : '🤖 AI 분석'}
              onPress={handleAnalyzePhoto}
              style={[styles.analyzeButton, analyzing ? styles.analyzingButton : undefined].filter(Boolean) as any}
              textStyle={styles.analyzeButtonText}
              disabled={analyzing}
            />
            <Button
              title="확인"
              onPress={handleConfirm}
              style={styles.confirmButton}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default PhotoSelectScreen;
