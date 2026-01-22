/**
 * HeaderActions 스타일
 * 헤더 액션 아이콘 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle } from '../../utils/styles/textStyles';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing[1],
    backgroundColor: 'transparent',
  },
  iconButtonActive: {
    backgroundColor: colors.gray[100],
  },
  icon: {
    ...createTextStyle('base', {
      fontSize: 22,
    }),
  },
  iconImage: {
    width: 22,
    height: 22,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: colors.background.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  badgeText: {
    ...createTextStyle('xs', {
      fontSize: 9,
      fontWeight: typography.fontWeight.medium,
      color: colors.white,
    }),
  },
});
