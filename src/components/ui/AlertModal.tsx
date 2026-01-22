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
  // message가 문자열이 아닌 경우 문자열로 변환
  const messageText = typeof message === 'string' ? message : String(message || '');
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
          <Text style={styles.title}>{titleText}</Text>
          <Text style={styles.message}>{messageText}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AlertModal;

