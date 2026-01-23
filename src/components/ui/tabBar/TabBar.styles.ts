/**
 * TabBar 스타일
 * 범용 탭 바 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../../utils/designTokens';
import { createTextStyle } from '../../../utils/styles/textStyles';
import { tabBarStyles } from '../../../utils/styles/componentStyles';

export const styles = StyleSheet.create({
  // Pill variant (CommunityScreen 메인 탭 스타일)
  pillContainer: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  pillWrapper: {
    ...tabBarStyles.container(),
  },
  pillTab: {
    ...tabBarStyles.tab(),
    flex: 1,
    borderRadius: borderRadius.lg,
    minHeight: 40,
  },
  pillTabActive: {
    ...tabBarStyles.tabActive(),
    backgroundColor: colors.green[500],
    ...shadows.sm,
  },
  pillTabText: {
    ...createTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.secondary,
    }),
  },
  pillTabTextActive: {
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
  },

  // Simple variant (ConnectionsScreen 스타일)
  simpleContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  simpleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    borderRadius: borderRadius.md,
    marginHorizontal: spacing[1],
  },
  simpleTabActive: {
    backgroundColor: colors.primary[500],
  },
  simpleTabText: {
    ...createTextStyle('base', {
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  simpleTabTextActive: {
    color: colors.text.inverse,
  },
  tabBadge: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    marginLeft: spacing[2],
  },
  tabBadgeText: {
    ...createTextStyle('xs', {
      color: colors.text.inverse,
      fontWeight: typography.fontWeight.medium,
    }),
  },

  // Underline variant (향후 확장용)
  underlineContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  underlineTab: {
    flex: 1,
    paddingVertical: spacing[3],
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  underlineTabActive: {
    borderBottomColor: colors.primary[600],
  },
  underlineTabText: {
    ...createTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.tertiary,
    }),
  },
  underlineTabTextActive: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
});
