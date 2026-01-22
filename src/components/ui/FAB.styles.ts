/**
 * FAB 스타일
 * 플로팅 액션 버튼 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle } from '../../utils/styles/textStyles';

export const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: spacing[6],
    right: spacing[5],
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: colors.primary[500],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  base: {
    width: 56,
    height: 56,
  },
  sm: {
    width: 48,
    height: 48,
  },
  lg: {
    width: 64,
    height: 64,
  },
  icon: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.medium,
  },
  baseIcon: {
    ...createTextStyle('2xl'),
  },
  smIcon: {
    ...createTextStyle('xl'),
  },
  lgIcon: {
    ...createTextStyle('3xl'),
  },
});
