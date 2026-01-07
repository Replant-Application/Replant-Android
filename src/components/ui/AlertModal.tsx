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
  Platform,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';

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
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  icon: {
    width: 70,
    height: 70,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing[3],
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xl),
  },
  message: {
    fontSize: typography.fontSize.base,
    color: colors.gray[300],
    marginBottom: spacing[6],
    textAlign: 'center',
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
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
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
});

export default AlertModal;

