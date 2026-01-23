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
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle, TouchableOpacityProps } from 'react-native';
import { colors } from '../../../utils/designTokens';
import { styles } from './Button.styles';

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

export default Button;
