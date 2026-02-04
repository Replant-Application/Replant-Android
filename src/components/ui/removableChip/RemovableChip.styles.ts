/**
 * RemovableChip (선택 해제용 필터 칩) 스타일
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../../utils/designTokens';
import { createTextStyle } from '../../../utils/styles/textStyles';

export const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[100],
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderWidth: 1,
    borderColor: colors.primary[500],
    gap: spacing[1],
  },
  chipText: {
    ...createTextStyle('xs', {
      color: colors.primary[700],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  chipClose: {
    ...createTextStyle('base', {
      color: colors.primary[700],
      fontWeight: typography.fontWeight.medium,
      lineHeight: 16,
    }),
  },
});
