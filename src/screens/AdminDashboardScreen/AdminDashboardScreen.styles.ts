/**
 * AdminDashboardScreen 스타일
 * 관리자 대시보드 화면의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { createTextStyle, createTitleStyle, createSecondaryTextStyle } from '../../utils/styles/textStyles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    padding: spacing[5],
  },
  statsCard: {
    marginBottom: spacing[6],
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    ...shadows.base,
  },
  statValue: {
    ...createTextStyle('3xl', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.primary,
      marginBottom: spacing[2],
    }),
  },
  activeStat: {
    ...createTextStyle('3xl', {
      color: colors.primary[600],
      fontWeight: typography.fontWeight.medium,
      marginBottom: spacing[2],
    }),
  },
  inactiveStat: {
    ...createTextStyle('3xl', {
      color: colors.gray[500],
      fontWeight: typography.fontWeight.medium,
      marginBottom: spacing[2],
    }),
  },
  statLabel: {
    ...createSecondaryTextStyle('sm'),
  },
  recentUsersCard: {
    marginBottom: spacing[6],
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing[2],
  },
  userInfo: {
    flex: 1,
  },
  userNickname: {
    ...createTitleStyle('base', {
      marginBottom: spacing[1],
    }),
  },
  userEmail: {
    ...createSecondaryTextStyle('sm'),
  },
  userRole: {
    ...createTextStyle('sm', {
      color: colors.text.tertiary,
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[1],
      backgroundColor: colors.gray[100],
      borderRadius: borderRadius.sm,
    }),
  },
  actionsCard: {
    marginBottom: spacing[6],
  },
  actionButton: {
    backgroundColor: colors.primary[500],
    padding: spacing[4],
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  actionButtonText: {
    ...createTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.inverse,
    }),
  },
  dangerButton: {
    backgroundColor: colors.error,
    padding: spacing[4],
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing[3],
  },
  dangerButtonText: {
    ...createTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.inverse,
    }),
  },
});
