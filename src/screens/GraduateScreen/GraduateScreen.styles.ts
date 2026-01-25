/**
 * GraduateScreen 스타일
 * 졸업자 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
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
  graduateBanner: {
    backgroundColor: colors.primary[50],
    marginBottom: spacing[6],
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  graduateBadge: {
    fontSize: 48,
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    ...createTitleStyle('xl', {
      color: colors.primary[700],
      marginBottom: spacing[1],
    }),
  },
  bannerSubtitle: {
    ...createTextStyle('sm', {
      color: colors.primary[600],
      marginBottom: spacing[2],
    }),
  },
  graduationDate: {
    ...createTextStyle('xs', {
      color: colors.primary[500],
    }),
  },
  statsCard: {
    marginBottom: spacing[6],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
  },
  statValue: {
    ...createTextStyle('2xl', {
      fontWeight: typography.fontWeight.medium,
      color: colors.primary[600],
      marginBottom: spacing[1],
    }),
  },
  statLabel: {
    ...createSecondaryTextStyle('sm'),
  },
  roleCard: {
    marginBottom: spacing[6],
  },
  roleList: {
    gap: spacing[4],
  },
  roleItem: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  roleIcon: {
    fontSize: 28,
    width: 40,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  roleIconImage: {
    width: 28,
    height: 28,
  },
  roleContent: {
    flex: 1,
  },
  roleTitle: {
    ...createTitleStyle('base', {
      marginBottom: spacing[1],
    }),
  },
  roleDescription: {
    ...createSecondaryTextStyle('sm'),
  },
  activityCard: {
    marginBottom: spacing[6],
  },
  emptyText: {
    ...createTextStyle('base', {
      color: colors.text.tertiary,
      textAlign: 'center',
      padding: spacing[4],
    }),
  },
  activityIconImage: {
    width: 20,
    height: 20,
  },
  activityItem: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  activityIcon: {
    fontSize: 20,
    width: 30,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...createTextStyle('sm', {
      color: colors.text.primary,
      marginBottom: spacing[1],
    }),
  },
  activityDate: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
    }),
  },
  actionsCard: {
    marginBottom: spacing[6],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[4],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing[3],
    ...shadows.sm,
  },
  actionIcon: {
    fontSize: 24,
    width: 40,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  actionIconImage: {
    width: 24,
    height: 24,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    ...createTitleStyle('base', {
      marginBottom: spacing[1],
    }),
  },
  actionDescription: {
    ...createSecondaryTextStyle('sm'),
  },
  badgeCard: {
    marginBottom: spacing[6],
    backgroundColor: colors.primary[600],
  },
  badgeContent: {
    alignItems: 'center',
    padding: spacing[4],
  },
  badgeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
    ...shadows.lg,
  },
  badgeEmoji: {
    fontSize: 40,
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  badgeTitle: {
    ...createTitleStyle('xl', {
      color: colors.text.inverse,
      marginBottom: spacing[2],
    }),
  },
  badgeDescription: {
    ...createTextStyle('sm', {
      color: colors.primary[100],
      textAlign: 'center',
      marginBottom: spacing[4],
    }),
  },
  badgeStats: {
    backgroundColor: colors.primary[700],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
  },
  badgeStatText: {
    ...createTextStyle('xs', {
      color: colors.primary[200],
      fontWeight: typography.fontWeight.medium,
    }),
  },
});
