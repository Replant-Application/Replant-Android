/**
 * MissionInfoModal 스타일
 * 미션 정보 모달 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createTitleStyle, createSecondaryTextStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { modalStyles, buttonStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  modalOverlay: {
    ...modalStyles.overlay(),
  },
  modalContainer: {
    ...modalStyles.content(),
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    ...modalStyles.header(),
    marginBottom: spacing[4],
  },
  modalTitle: {
    ...createTitleStyle('xl'),
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 20,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  modalContent: {
    maxHeight: 400,
  },
  modalDetailRow: {
    marginBottom: spacing[4],
  },
  modalDetailLabel: {
    ...createSecondaryTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      marginBottom: spacing[1],
    }),
  },
  modalDetailValue: {
    ...createTextStyle('base'),
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[4],
    alignItems: 'center',
  },
  modalDetailButton: {
    ...buttonStyles.primary(),
    flex: 1,
  },
  modalDetailButtonText: {
    ...createButtonTextStyle('base'),
  },
  modalEditButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalEditIcon: {
    width: 20,
    height: 20,
    tintColor: colors.primary[600],
  },
});
