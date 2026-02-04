/**
 * FilterOptionSection 스타일
 * 모달 내 "제목 + 옵션 버튼 행" 섹션용
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../../utils/designTokens';
import { createTextStyle, createButtonTextStyle } from '../../../utils/styles/textStyles';

export const styles = StyleSheet.create({
  sectionTitle: {
    ...createTextStyle('base', {
      color: colors.text.primary,
      fontWeight: typography.fontWeight.medium,
      marginTop: spacing[3],
      marginBottom: spacing[4],
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
    }),
  },
  optionRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.secondary,
    borderWidth: 1.5,
    borderColor: colors.border.light,
    minHeight: 32,
  },
  optionButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
    borderWidth: 1.5,
  },
  optionText: {
    ...createButtonTextStyle('sm', { color: colors.text.primary }),
  },
  optionTextActive: {
    ...createButtonTextStyle('sm'),
  },
  optionCheck: {
    ...createTextStyle('xs', {
      color: colors.white,
      fontWeight: typography.fontWeight.bold,
      marginLeft: spacing[2],
    }),
  },
});
