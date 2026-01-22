/**
 * 사진 선택 화면
 * 카메라 촬영 또는 갤러리에서 사진 선택 (다중 선택 지원)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { Header, Button } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { usePhotoSelectScreenContainer } from './PhotoSelectScreen.container';

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  backButton: {
    padding: spacing[2],
  },
  backButtonIcon: {
    width: 24,
    height: 24,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[5],
    paddingBottom: spacing[10],
  },
  instructionContainer: {
    marginBottom: spacing[6],
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  instructionText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  optionsContainer: {
    gap: spacing[4],
  },
  optionButton: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[5],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  optionIconContainer: {
    marginBottom: spacing[3],
  },
  optionIconImage: {
    width: 48,
    height: 48,
  },
  optionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xl),
  },
  optionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[5],
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
  previewButtons: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[4],
  },
  cancelButton: {
    flex: 1,
  },
  analyzeButton: {
    flex: 1,
    backgroundColor: colors.blue[100],
    borderWidth: 1,
    borderColor: colors.blue[300],
  },
  analyzingButton: {
    backgroundColor: colors.blue[200],
    opacity: 0.7,
  },
  analyzeButtonText: {
    color: colors.blue[700],
    fontWeight: typography.fontWeight.medium,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.primary[500],
  },
});

export default PhotoSelectScreen;
