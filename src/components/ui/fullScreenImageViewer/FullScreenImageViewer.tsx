/**
 * FullScreenImageViewer
 * 이미지 클릭 시 풀스크린으로 자세히 보기
 */

import React from 'react';
import { Text, Modal, TouchableOpacity, Image } from 'react-native';
import { styles } from './FullScreenImageViewer.styles';

interface FullScreenImageViewerProps {
  visible: boolean;
  imageUri: string | null;
  onClose: () => void;
}

const FullScreenImageViewer: React.FC<FullScreenImageViewerProps> = ({
  visible,
  imageUri,
  onClose,
}) => {
  if (!imageUri) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="닫기"
      >
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="닫기"
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.imageWrapper}
          activeOpacity={1}
          onPress={() => {}}
        >
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
            accessibilityLabel="이미지 전체 보기"
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default FullScreenImageViewer;
