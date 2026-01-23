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
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
  },
  authorImage: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
  },
  authorImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorImageText: {
    ...createTextStyle('base', {
      color: colors.primary[700],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  author: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.primary,
    }),
  },
  date: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
    }),
  },
  content: {
    ...createBodyStyle('base'),
  },
});
