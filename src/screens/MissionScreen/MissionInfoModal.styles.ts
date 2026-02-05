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
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    padding: spacing[6],
    alignItems: 'flex-start',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing[5],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    ...createTitleStyle('xl'),
    flex: 1,
    marginRight: spacing[3],
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  modalCloseButtonText: {
    ...createTextStyle('xl', {
      fontWeight: typography.fontWeight.semibold,
      color: colors.text.secondary,
      textAlign: 'center',
    }),
  },
  modalContent: {
    maxHeight: 400,
    width: '100%',
    paddingTop: spacing[1],
  },
  modalDetailRow: {
    marginBottom: spacing[5],
    width: '100%',
  },
  modalDetailLabel: {
    ...createSecondaryTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
      marginBottom: spacing[1],
      color: colors.text.primary, // 진한 색상으로 변경
    }),
  },
  modalDetailValue: {
    ...createTextStyle('sm', {
      color: colors.text.secondary,
    }),
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
