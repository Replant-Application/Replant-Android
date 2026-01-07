import React from 'react';
import { Text, StyleSheet, TextStyle, Platform } from 'react-native';
import { colors, spacing, typography } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';

interface SectionTitleProps {
  title: string;
  size?: 'sm' | 'base' | 'lg' | 'xl';
  color?: string;
  marginBottom?: number;
  style?: TextStyle;
}

/**
 * 재사용 가능한 섹션 제목 컴포넌트
 * 모든 화면에서 일관된 섹션 제목 스타일을 제공
 */
const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  size = 'xl',
  color = colors.text.primary,
  marginBottom,
  style,
}) => {
  const sizeStyles = {
    sm: styles.sm,
    base: styles.base,
    lg: styles.lg,
    xl: styles.xl,
  };

  return (
    <Text style={[
      styles.title,
      sizeStyles[size],
      { color, marginBottom: marginBottom || spacing[4] },
      style
    ]}>
      {title}
    </Text>
  );
};

const styles = StyleSheet.create({
  title: {
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  sm: {
    fontSize: typography.fontSize.sm,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  base: {
    fontSize: typography.fontSize.base,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  lg: {
    fontSize: typography.fontSize.lg,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  xl: {
    fontSize: typography.fontSize.xl,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xl),
  },
});

export default SectionTitle;
