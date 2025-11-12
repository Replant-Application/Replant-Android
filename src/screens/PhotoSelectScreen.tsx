/**
 * 사진 선택 화면
 * 카메라 촬영 또는 갤러리에서 사진 선택
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { launchCamera, launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { Header, Button } from '../components/ui';
import { colors, spacing, typography, borderRadius } from '../utils/designTokens';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

interface PhotoSelectScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route?: RouteProp<RootStackParamList, 'PhotoSelect'>;
}

const PhotoSelectScreen: React.FC<PhotoSelectScreenProps> = ({ navigation, route }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const missionId = route?.params?.missionId;

  // 카메라로 사진 촬영
  const handleTakePhoto = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      saveToPhotos: true,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        const errorMessage = response.errorMessage || '카메라를 사용할 수 없습니다.';
        Alert.alert(
          '카메라 사용 불가',
          errorMessage,
          [{ text: '확인' }]
        );
        return;
      }

      if (response.assets && response.assets[0]) {
        const uri = response.assets[0].uri;
        if (uri) {
          setSelectedPhoto(uri);
          setShowPreview(true);
        }
      }
    });
  };

  // 갤러리에서 사진 선택
  const handlePickFromGallery = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      selectionLimit: 1,
      includeBase64: false,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        return;
      }

      if (response.assets && response.assets[0]) {
        const uri = response.assets[0].uri;
        if (uri) {
          setSelectedPhoto(uri);
          setShowPreview(true);
        }
      }
    });
  };

  // 사진 선택 확인
  const handleConfirm = () => {
    if (selectedPhoto && missionId) {
      navigation.navigate('Mission', { 
        selectedPhotoUri: selectedPhoto, 
        missionId,
        timestamp: Date.now()
      });
    }
  };

  // 사진 선택 취소
  const handleCancel = () => {
    setSelectedPhoto(null);
    setShowPreview(false);
  };

  // 뒤로가기
  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Header 
        title="사진 선택"
        leftButton={
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← 뒤로</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.content}>
        {!showPreview ? (
          <>
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>
                미션 인증을 위한 사진을 선택해주세요
              </Text>
            </View>

            <View style={styles.optionsContainer}>
              {/* 카메라 촬영 버튼 */}
              <TouchableOpacity
                style={styles.optionButton}
                onPress={handleTakePhoto}
                activeOpacity={0.7}
              >
                <View style={styles.optionIconContainer}>
                  <Text style={styles.optionIcon}>📷</Text>
                </View>
                <Text style={styles.optionTitle}>카메라로 촬영</Text>
                <Text style={styles.optionDescription}>
                  새 사진을 촬영합니다
                </Text>
              </TouchableOpacity>

              {/* 갤러리 선택 버튼 */}
              <TouchableOpacity
                style={styles.optionButton}
                onPress={handlePickFromGallery}
                activeOpacity={0.7}
              >
                <View style={styles.optionIconContainer}>
                  <Text style={styles.optionIcon}>🖼️</Text>
                </View>
                <Text style={styles.optionTitle}>갤러리에서 선택</Text>
                <Text style={styles.optionDescription}>
                  저장된 사진을 선택합니다
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>선택한 사진</Text>
            {selectedPhoto && (
              <Image
                source={{ uri: selectedPhoto }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            )}
            <View style={styles.previewButtons}>
              <Button
                title="다시 선택"
                onPress={handleCancel}
                variant="outline"
                style={styles.cancelButton}
              />
              <Button
                title="확인"
                onPress={handleConfirm}
                style={styles.confirmButton}
              />
            </View>
          </View>
        )}
      </View>
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
  backButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    padding: spacing[5],
  },
  instructionContainer: {
    marginBottom: spacing[6],
    alignItems: 'center',
  },
  instructionText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    textAlign: 'center',
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
  optionIcon: {
    fontSize: 48,
  },
  optionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  optionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  previewContainer: {
    flex: 1,
  },
  previewTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[4],
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    height: 400,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[100],
    marginBottom: spacing[5],
  },
  previewButtons: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.primary[500],
  },
});

export default PhotoSelectScreen;

