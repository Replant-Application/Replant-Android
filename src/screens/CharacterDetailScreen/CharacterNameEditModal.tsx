/**
 * 캐릭터 이름 변경 모달 컴포넌트
 */

import React from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { Button } from '../../components/ui';

interface CharacterNameEditModalProps {
  visible: boolean;
  name: string;
  onNameChange: (name: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const CharacterNameEditModal: React.FC<CharacterNameEditModalProps> = ({
  visible,
  name,
  onNameChange,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>캐릭터 이름 변경</Text>
          <TextInput
            style={styles.input}
            placeholder="새 이름을 입력하세요"
            value={name}
            onChangeText={onNameChange}
            placeholderTextColor={colors.text.secondary}
            maxLength={20}
            autoFocus
          />
          <View style={styles.actions}>
            <Button
              title="취소"
              onPress={onCancel}
              variant="outline"
              style={styles.button}
            />
            <Button
              title="변경"
              onPress={onConfirm}
              style={styles.button}
            />
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
  content: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[4],
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xl),
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.base,
    padding: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
    marginBottom: spacing[4],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  button: {
    flex: 1,
  },
});

export default CharacterNameEditModal;
