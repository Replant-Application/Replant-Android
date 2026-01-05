import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../utils/designTokens';

interface CardProps {
  children: React.ReactNode;
  variant?: 'base' | 'elevated' | 'flat';
  padding?: 'sm' | 'base' | 'lg';
  style?: ViewStyle;
  [key: string]: any;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'base',
  padding = 'base',
  style,
  ...props
}) => {
      const cardStyle = [
        styles.base,
        styles[variant],
        styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}` as keyof typeof styles],
        style,
      ];

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
  },

  // Variants
  elevated: {
    // 그림자 제거
  },
  flat: {
    borderWidth: 1,
    borderColor: colors.border.light,
  },

  // Padding variants
  paddingSm: {
    padding: spacing[3],
  },
  paddingBase: {
    padding: spacing[4],
  },
  paddingLg: {
    padding: spacing[6],
  },
});

export default Card;
