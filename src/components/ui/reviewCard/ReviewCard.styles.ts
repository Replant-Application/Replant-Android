/**
 * ReviewCard 스타일
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../../utils/designTokens';
import { createTextStyle, createBodyStyle } from '../../../utils/styles/textStyles';
import { cardStyles } from '../../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  container: {
    ...cardStyles.base(),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: borderRadius.md,
    padding: spacing[4],
    marginBottom: spacing[3],
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
    gap: spacing[2],
    flex: 1,
    minWidth: 0,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  authorAvatarImage: {
    width: 32,
    height: 32,
  },
  authorNameWrap: {
    flex: 1,
    minWidth: 0,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flexShrink: 0,
  },
  author: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.primary,
    }),
    flexShrink: 1,
  },
  date: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
    }),
    flexShrink: 0,
  },
  deleteButton: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
  },
  deleteButtonText: {
    ...createTextStyle('xs', {
      color: colors.semantic.fg.error,
    }),
  },
  content: {
    ...createBodyStyle('base'),
  },
});
