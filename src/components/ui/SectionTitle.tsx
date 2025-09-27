import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { colors, spacing, typography } from '../../utils/designTokens';

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
    fontWeight: typography.fontWeight.bold,
  },
  sm: {
    fontSize: typography.fontSize.sm,
  },
  base: {
    fontSize: typography.fontSize.base,
  },
  lg: {
    fontSize: typography.fontSize.lg,
  },
  xl: {
    fontSize: typography.fontSize.xl,
  },
});

export default SectionTitle;
