import React from 'react';
import { View, ViewStyle } from 'react-native';
import { styles } from './Card.styles';

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

export default Card;
