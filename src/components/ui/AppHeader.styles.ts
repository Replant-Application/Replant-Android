/**
 * AppHeader 스타일
 * 앱 헤더 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { createTextStyle } from '../../utils/styles/textStyles';

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
    paddingTop: spacing[6],
    paddingBottom: spacing[3],
    paddingLeft: spacing[4],
    paddingRight: spacing[4],
    width: '100%',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  menuButton: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    width: 36,
    height: 36,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  menuBar: {
    position: 'absolute',
    top: spacing[16],
    right: 0,
    width: 280,
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderBottomLeftRadius: borderRadius.xl,
    borderLeftWidth: 3,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: '#D4A574',
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
    paddingHorizontal: spacing[4],
    ...shadows.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.md,
    marginBottom: spacing[1],
    backgroundColor: '#FFF8E7',
    borderWidth: 1,
    borderColor: '#D4A574',
  },
  menuItemIcon: {
    width: 24,
    height: 24,
    marginRight: spacing[3],
  },
  menuItemText: {
    ...createTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.primary,
    }),
  },
  iconButton: {
    position: 'relative',
  },
  iconWrapper: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconText: {
    ...createTextStyle('base'),
  },
  iconImage: {
    width: 36,
    height: 36,
  },
  soundIcon: {
    fontSize: 28,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2.5,
    borderColor: colors.background.primary,
    zIndex: 10,
    elevation: 10,
  },
  badgeText: {
    ...createTextStyle('xs', {
      color: colors.white,
      fontWeight: typography.fontWeight.medium,
    }),
  },
});
