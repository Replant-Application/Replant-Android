import React from 'react';
import { StyleSheet, Image, ImageStyle } from 'react-native';

interface BadgeProps {
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'; // 나중에 다른 등급 뱃지 이미지로 확장 가능
  size?: 'sm' | 'md' | 'lg';
  style?: ImageStyle;
}

const Badge: React.FC<BadgeProps> = ({ tier: _tier, size = 'md', style }) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          width: 36,
          height: 36,
        };
      case 'lg':
        return {
          width: 64,
          height: 64,
        };
      default:
        return {
          width: 48,
          height: 48,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <Image
      source={require('../../assets/images/badge_verified.png')}
      style={[
        styles.badgeImage,
        {
          width: sizeStyles.width,
      accessibilityLabel="뱃지 아이콘"
          height: sizeStyles.height,
        },
        style,
      ]}
      resizeMode="contain"
    />
  );
};

const styles = StyleSheet.create({
  badgeImage: {
    // 이미지 스타일
  },
});

export default Badge;
