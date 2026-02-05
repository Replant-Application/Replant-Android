/**
 * RemovableChip
 * 선택된 필터 하나를 표시하고 × 로 제거할 수 있는 칩 (CommunityScreen 필터 등)
 */

import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { styles } from './RemovableChip.styles';
import type { RemovableChipProps } from './RemovableChip.types';

export const RemovableChip: React.FC<RemovableChipProps> = ({
  label,
  onRemove,
  accessibilityLabel,
}) => {
  return (
    <TouchableOpacity
      style={styles.chip}
      onPress={onRemove}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `${label} 필터 제거`}
    >
      <Text style={styles.chipText} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.chipClose} accessibilityElementsHidden={true}>
        ×
      </Text>
    </TouchableOpacity>
  );
};
