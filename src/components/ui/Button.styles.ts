/**
 * Button 스타일
 * 재사용 가능한 버튼 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { buttonStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  // Variants
  primary: {
    backgroundColor: colors.primary[700], // WCAG AA 대비율 개선: primary[500] → primary[700]
  },
  secondary: {
    backgroundColor: colors.gray[200],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  ghost: {
    backgroundColor: 'transparent',
  },

  // Sizes
  sm: {
    height: 32,
    paddingHorizontal: spacing[3],
  },
  baseSize: {
    height: 40,
    paddingHorizontal: spacing[4],
  },
  lg: {
    height: 48,
    paddingHorizontal: spacing[5],
  },

  // States
  disabled: {
    backgroundColor: colors.gray[300],
    borderColor: colors.gray[300],
  },

  // Text styles
  text: {
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular, // Android는 커스텀 폰트 사용
    }),
    includeFontPadding: false,
  },
  primaryText: {
    color: colors.text.inverse,
  },
  secondaryText: {
    color: colors.text.primary,
  },
  outlineText: {
    color: colors.primary[500],
  },
  ghostText: {
    color: colors.primary[500],
  },

  // Text sizes
  smText: {
    ...createTextStyle('sm'),
    fontWeight: typography.fontWeight.medium,
  },
  baseText: {
    ...createTextStyle('base'),
    fontWeight: typography.fontWeight.medium,
  },
  lgText: {
    ...createTextStyle('lg'),
    fontWeight: typography.fontWeight.medium,
  },

  disabledText: {
    color: colors.text.tertiary,
  },
});
