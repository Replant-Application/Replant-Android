/**
 * NotificationDropdown 스타일
 * 알림 드롭다운 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet, Platform, Dimensions } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { createTextStyle, createSecondaryTextStyle, createTitleStyle } from '../../utils/styles/textStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const DROPDOWN_WIDTH = Math.min(SCREEN_WIDTH - 32, 340);

export const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  dropdown: {
    position: 'absolute',
    width: DROPDOWN_WIDTH,
    maxHeight: 400,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    ...shadows.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    ...createTitleStyle('lg'),
  },
  unreadBadge: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadBadgeText: {
    ...createTextStyle('xs', {
      fontWeight: typography.fontWeight.medium,
      color: colors.white,
    }),
  },
  scrollView: {
    maxHeight: 280,
  },
  loadingContainer: {
    padding: spacing[8],
    alignItems: 'center',
  },
  loadingText: {
    ...createSecondaryTextStyle('sm'),
  },
  emptyContainer: {
    padding: spacing[8],
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  emptyText: {
    ...createSecondaryTextStyle('sm'),
  },
  notificationItem: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  unreadItem: {
    backgroundColor: colors.primary[50],
  },
  notificationIcon: {
    ...createTextStyle('base', {
      fontSize: 20,
      marginRight: spacing[3],
    }),
  },
  notificationIconImage: {
    width: 20,
    height: 20,
    marginRight: spacing[3],
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationTitle: {
    flex: 1,
    ...createTextStyle('sm', {
      color: colors.text.primary,
    }),
  },
  unreadTitle: {
    fontWeight: typography.fontWeight.medium as any,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary[500],
    marginLeft: spacing[2],
  },
  notificationBody: {
    ...createSecondaryTextStyle('xs', {
      marginTop: 2,
    }),
  },
  notificationTime: {
    ...createSecondaryTextStyle('xs', {
      fontSize: 10,
      marginTop: spacing[1],
    }),
  },
  footer: {
    paddingVertical: spacing[3],
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.secondary,
  },
  footerText: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      color: colors.primary[600],
    }),
  },
});
