/**
 * AppHeader 스타일
 * 앱 헤더 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../../utils/designTokens';
import { createTextStyle } from '../../../utils/styles/textStyles';

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
    ...createTextStyle('base', {
      color: colors.text.primary,
    }),
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
