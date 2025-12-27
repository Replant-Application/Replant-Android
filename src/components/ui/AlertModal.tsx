/**
 * AlertModal
 * 알림 다이얼로그 모달 컴포넌트
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  title,
  message,
  buttonText = '확인',
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.gray[800],
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    width: '80%',
    maxWidth: 400,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  message: {
    fontSize: typography.fontSize.base,
    color: colors.gray[300],
    marginBottom: spacing[6],
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    paddingVertical: spacing[2],
    borderRadius: borderRadius.xl,
    backgroundColor: colors.green[600],
    alignItems: 'center',
  },
  buttonText: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
});

export default AlertModal;

