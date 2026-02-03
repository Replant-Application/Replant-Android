/**
 * ConfirmModal
 * 확인/취소 다이얼로그 모달 컴포넌트
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { colors } from '../../../utils/designTokens';
import { styles } from './ConfirmModal.styles';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonColor?: string;
  image?: ImageSourcePropType;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  confirmButtonColor = colors.error,
  image,
}) => {
  // 리터럴 '\n' 문자열을 실제 줄바꿈으로 변환 (AlertModal과 동일)
  const normalizedMessage =
    typeof message === 'string' ? message.replace(/\\n/g, '\n') : String(message ?? '');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {image && (
            <Image
              source={image}
              style={styles.modalImage}
              resizeMode="contain"
              accessibilityLabel="확인 모달 이미지"
            />
          )}
          <Text style={styles.title} accessibilityRole="header">{title}</Text>
          <View style={styles.messageWrap}>
            {normalizedMessage.split(/\n/).map((line, index) => (
              <Text
                key={index}
                style={[styles.message, index > 0 && styles.messageLine]}
              >
                {line}
              </Text>
            ))}
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel={cancelText}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: confirmButtonColor }]}
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel={confirmText}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmModal;

