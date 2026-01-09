/**
 * 재사용 가능한 버튼 컴포넌트
 * 다양한 스타일과 크기를 지원하는 버튼
 *
 * @param {string} title - 버튼 텍스트
 * @param {Function} onPress - 클릭 이벤트 핸들러
 * @param {string} variant - 버튼 스타일 ('primary' | 'secondary' | 'outline')
 * @param {string} size - 버튼 크기 ('sm' | 'base' | 'lg')
 * @param {boolean} disabled - 비활성화 상태
 * @param {boolean} loading - 로딩 상태
 * @param {Object} style - 추가 스타일
 * @param {Object} textStyle - 텍스트 스타일
 * @param {Object} props - 기타 props
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, TouchableOpacityProps, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';

interface ButtonProps extends Omit<TouchableOpacityProps, 'onPress' | 'style'> {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'base' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'base',
  disabled = false,
  loading = false,
  style,
  textStyle,
  ...props
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size === 'base' ? 'baseSize' : size],
    disabled && styles.disabled,
    style,
  ];

  const textStyleCombined = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  // hitSlop 계산: sm(32px)는 6px 추가, base(40px)는 2px 추가, lg(48px)는 불필요
  const hitSlopValue = size === 'sm' 
    ? { top: 6, bottom: 6, left: 6, right: 6 }
    : size === 'base'
    ? { top: 2, bottom: 2, left: 2, right: 2 }
    : undefined;

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
      hitSlop={hitSlopValue}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.text.inverse : colors.primary[500]}
          size="small"
        />
      ) : (
        <Text style={textStyleCombined}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
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
    fontSize: typography.fontSize.sm,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  baseText: {
    fontSize: typography.fontSize.base,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  lgText: {
    fontSize: typography.fontSize.lg,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },

  disabledText: {
    color: colors.text.tertiary,
  },
});

export default Button;
