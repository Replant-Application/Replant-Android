/**
 * CommentCard 스타일
 * 댓글 카드 컴포넌트의 모든 스타일 정의
 */

import { Platform, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createSecondaryTextStyle } from '../../utils/styles/textStyles';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[2],
    marginVertical: spacing[1],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  replyContainer: {
    marginLeft: spacing[4],
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    paddingLeft: spacing[1],
  },
  authorName: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.semibold,
      color: colors.text.primary,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
    }),
  },
  authorBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing[1],
    paddingVertical: 2,
    borderRadius: borderRadius.base,
  },
  authorBadgeText: {
    ...createTextStyle('xs', {
      color: colors.primary[700],
      fontWeight: typography.fontWeight.normal,
    }),
  },
  date: {
    ...createSecondaryTextStyle('xs', {
      color: colors.text.tertiary,
      fontWeight: typography.fontWeight.medium,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
    }),
  },
  content: {
    marginTop: spacing[1],
    marginBottom: spacing[1],
    paddingLeft: spacing[1],
  },
  text: {
    ...createSecondaryTextStyle('sm'),
  },
  editedText: {
    ...createSecondaryTextStyle('xs', {
      color: colors.text.tertiary,
      marginTop: spacing[1],
      fontStyle: 'italic',
    }),
  },
  footer: {
    paddingTop: spacing[1],
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[2],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[1],
    paddingVertical: 2,
  },
  editText: {
    ...createTextStyle('xs', {
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.semibold,
    }),
  },
  deleteText: {
    ...createTextStyle('xs', {
      color: colors.error,
      fontWeight: typography.fontWeight.semibold,
    }),
  },
  hideText: {
    ...createTextStyle('xs', {
      color: colors.text.primary,
      fontWeight: typography.fontWeight.semibold,
    }),
  },
  replyIcon: {
    width: 12,
    height: 12,
    marginRight: spacing[1],
  },
  actionIcon: {
    width: 14,
    height: 14,
    marginRight: spacing[0.5],
  },
  replyText: {
    ...createTextStyle('xs', {
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.semibold,
    }),
  },
});
