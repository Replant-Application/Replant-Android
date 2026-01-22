/**
 * DiaryCard 스타일
 * 일기 카드 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { createTextStyle, createSecondaryTextStyle } from '../../utils/styles/textStyles';
import { cardStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  container: {
    ...cardStyles.base(),
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  emotionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emotionEmoji: {
    ...createTextStyle('xl', {
      marginRight: spacing[2],
    }),
  },
  emotionName: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.secondary,
    }),
  },
  date: {
    ...createSecondaryTextStyle('xs', {
      color: colors.text.tertiary,
    }),
  },
  content: {
    marginBottom: spacing[3],
  },
  text: {
    ...createTextStyle('base', {
      color: colors.text.primary,
    }),
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing[3],
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[3],
  },
  actionButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  editText: {
    ...createTextStyle('sm', {
      color: colors.primary[500],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  deleteText: {
    ...createTextStyle('sm', {
      color: colors.error,
      fontWeight: typography.fontWeight.medium,
    }),
  },
});
