/**
 * UpdateModal
 * 앱 업데이트 알림 모달 컴포넌트
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';

interface UpdateModalProps {
  visible: boolean;
  isRequired: boolean; // 강제 업데이트 여부
  message: string; // 업데이트 안내 메시지
  onUpdate: () => void; // 업데이트 버튼 클릭
  onClose?: () => void; // 선택 업데이트일 때만 닫기 가능
}

const UpdateModal: React.FC<UpdateModalProps> = ({
  visible,
  isRequired,
  message,
  onUpdate,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={isRequired ? undefined : onClose} // 강제 업데이트면 닫기 불가
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>업데이트 알림</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonContainer}>
            {!isRequired && onClose && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>나중에</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.updateButton]}
              onPress={onUpdate}
            >
              <Text style={styles.updateButtonText}>업데이트</Text>
            </TouchableOpacity>
          </View>
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
    fontWeight: typography.fontWeight.medium,
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
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  button: {
    flex: 1,
    paddingVertical: spacing[2],
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.gray[700],
  },
  updateButton: {
    backgroundColor: colors.green[600],
  },
  cancelButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  updateButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
});

export default UpdateModal;
