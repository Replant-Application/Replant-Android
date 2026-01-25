/**
 * ContributorDashboardScreen 스타일
 * 기여자 대시보드 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/styles/textStyles';
import { createTextStyle, createTitleStyle, createBodyStyle, createSecondaryTextStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { modalStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    padding: spacing[5],
  },
  welcomeBanner: {
    backgroundColor: colors.primary[50],
    marginBottom: spacing[6],
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  welcomeEmoji: {
    fontSize: 40,
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  bannerText: {
    flex: 1,
  },
  welcomeTitle: {
    ...createTitleStyle('lg', {
      color: colors.primary[700],
      marginBottom: spacing[1],
    }),
  },
  welcomeSubtitle: {
    ...createTextStyle('sm', {
      color: colors.primary[600],
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
    padding: spacing[3],
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
    ...createSecondaryTextStyle('xs'),
  },
  totalHours: {
    marginTop: spacing[4],
    padding: spacing[3],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  totalHoursText: {
    ...createTextStyle('sm', {
      color: colors.primary[700],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  requestsCard: {
    marginBottom: spacing[6],
  },
  emptyText: {
    ...createTextStyle('base', {
      color: colors.text.tertiary,
      textAlign: 'center',
      padding: spacing[4],
    }),
  },
  requestItem: {
    padding: spacing[4],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing[3],
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[400],
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  requestUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  requestUserName: {
    ...createTitleStyle('sm'),
  },
  urgencyBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  urgencyText: {
    ...createTextStyle('xs', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  requestTime: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
    }),
  },
  requestTopic: {
    ...createBodyStyle('base', {
      marginBottom: spacing[3],
    }),
  },
  acceptButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  acceptButtonText: {
    ...createButtonTextStyle('sm', {
      color: colors.text.inverse,
    }),
  },
  sessionsCard: {
    marginBottom: spacing[6],
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing[2],
    gap: spacing[3],
  },
  sessionAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionAvatarText: {
    ...createTextStyle('lg', {
      fontWeight: typography.fontWeight.medium,
      color: colors.primary[600],
    }),
  },
  sessionContent: {
    flex: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[1],
  },
  sessionUserName: {
    ...createTitleStyle('sm'),
  },
  sessionTime: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
    }),
  },
  sessionLastMessage: {
    ...createSecondaryTextStyle('sm'),
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.error[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadCount: {
    ...createTextStyle('xs', {
      color: colors.text.inverse,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  guideCard: {
    marginBottom: spacing[6],
  },
  guideList: {
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  guideItem: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  guideIcon: {
    fontSize: 24,
    width: 32,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(24),
  },
  guideIconImage: {
    width: 24,
    height: 24,
  },
  guideContent: {
    flex: 1,
  },
  guideTitle: {
    ...createTitleStyle('sm', {
      marginBottom: spacing[1],
    }),
  },
  guideDescription: {
    ...createSecondaryTextStyle('xs'),
  },
  resourceButton: {
    backgroundColor: colors.primary[50],
    padding: spacing[3],
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  resourceButtonText: {
    ...createTextStyle('sm', {
      color: colors.primary[600],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  actionsCard: {
    marginBottom: spacing[6],
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  actionItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(24),
  },
  actionIconImage: {
    width: 24,
    height: 24,
    marginBottom: spacing[2],
  },
  actionLabel: {
    ...createTitleStyle('sm'),
  },
  emergencyCard: {
    marginBottom: spacing[6],
    backgroundColor: colors.error[50],
    borderWidth: 1,
    borderColor: colors.error[200],
  },
  emergencyTitle: {
    ...createTitleStyle('sm', {
      color: colors.error[700],
      marginBottom: spacing[2],
    }),
  },
  emergencyText: {
    ...createTextStyle('sm', {
      color: colors.error[600],
    }),
  },
  // Modal styles
  modalOverlay: {
    ...modalStyles.overlayBottomSheet(),
  },
  modalContent: {
    ...modalStyles.contentBottomSheet(),
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing[5],
    maxHeight: '80%',
  },
  resourceList: {
    marginBottom: spacing[4],
  },
  resourceItem: {
    flexDirection: 'row',
    gap: spacing[3],
    padding: spacing[4],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing[3],
  },
  resourceIcon: {
    fontSize: 24,
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular,
    }),
  },
  resourceIconImage: {
    width: 24,
    height: 24,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    ...createTitleStyle('base', {
      marginBottom: spacing[1],
    }),
  },
  resourceDesc: {
    ...createSecondaryTextStyle('sm'),
  },
  closeButton: {
    backgroundColor: colors.background.secondary,
    padding: spacing[4],
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  closeButtonText: {
    ...createSecondaryTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
});
