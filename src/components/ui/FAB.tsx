import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../utils/designTokens';
import { styles } from './FAB.styles';

interface FABProps {
  onPress: () => void;
  icon?: string;
  size?: 'sm' | 'base' | 'lg';
  color?: string;
  style?: ViewStyle;
  iconStyle?: TextStyle;
}

/**
 * 재사용 가능한 플로팅 액션 버튼 컴포넌트
 * 화면 우하단에 떠있는 액션 버튼을 제공
 */
const FAB: React.FC<FABProps> = ({
  onPress,
  icon = '+',
  size = 'base',
  color = colors.primary[500],
  style,
  iconStyle,
}) => {
  const sizeStyles = {
    sm: styles.sm,
    base: styles.base,
    lg: styles.lg,
  };

  const iconSizeStyles = {
    sm: styles.smIcon,
    base: styles.baseIcon,
    lg: styles.lgIcon,
  };

  // FAB 접근성 라벨 생성 (icon 기반)
  const getAccessibilityLabel = () => {
    if (icon === '+') return '추가';
    if (icon === '✏️') return '수정';
    if (icon === '✕' || icon === '×') return '닫기';
    return `액션 버튼 ${icon}`;
  };

  return (
    <TouchableOpacity
      testID="fab-button"
      style={[
        styles.fab,
        sizeStyles[size],
        { backgroundColor: color },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={getAccessibilityLabel()}
      accessibilityHint="플로팅 액션 버튼"
    >
      <Text style={[
        styles.icon,
        iconSizeStyles[size],
        iconStyle,
      ]}>
        {icon}
      </Text>
    </TouchableOpacity>
  );
};

export default FAB;
