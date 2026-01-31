/**
 * AlertModal
 * 알림 다이얼로그 모달 컴포넌트
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
import { styles } from './AlertModal.styles';

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
  icon?: ImageSourcePropType;
}

const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  title,
  message,
  buttonText = '확인',
  onClose,
  icon,
}) => {
  // message가 문자열이 아닌 경우 문자열로 변환, 리터럴 '\n'은 실제 줄바꿈으로 변환
  const rawMessage = typeof message === 'string' ? message : String(message || '');
  const messageText = rawMessage.replace(/\\n/g, '\n');
  const titleText = typeof title === 'string' ? title : String(title || '');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="닫기"
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          {icon && (
            <View style={styles.iconContainer}>
              <Image
                source={icon}
                style={styles.icon}
                resizeMode="contain"
                accessibilityLabel="알림 아이콘"
              />
            </View>
          )}
          <Text style={styles.title} accessibilityRole="header">{titleText}</Text>
          <Text style={styles.message}>{messageText}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={buttonText}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AlertModal;

