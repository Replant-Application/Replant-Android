/**
 * ConfirmModal 스타일
 * 확인/취소 다이얼로그 모달 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createTitleStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { modalStyles, buttonStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  overlay: {
    ...modalStyles.overlay(),
  },
  modalContainer: {
    ...modalStyles.content(),
    backgroundColor: colors.gray[800],
    width: '80%',
    maxWidth: 400,
  },
  modalImage: {
    width: 64,
    height: 64,
    alignSelf: 'center',
    marginBottom: spacing[3],
  },
  title: {
    ...createTitleStyle('xl', {
      color: colors.white,
      marginBottom: spacing[3],
      textAlign: 'center',
    }),
  },
  message: {
    ...createTextStyle('base', {
      color: colors.gray[300],
      marginBottom: spacing[6],
      textAlign: 'center',
    }),
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
  cancelButtonText: {
    ...createButtonTextStyle('base'),
  },
  confirmButtonText: {
    ...createButtonTextStyle('base'),
  },
});
