/**
 * FilterOptionSection
 * 모달 내 "제목 + 가로 옵션 버튼 행" 재사용 컴포넌트
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './FilterOptionSection.styles';
import type { FilterOptionSectionProps } from './FilterOptionSection.types';

export const FilterOptionSection: React.FC<FilterOptionSectionProps> = ({
  title,
  options,
  selected,
  onSelect,
  showCheckmark = true,
  sectionTitleStyle,
  containerStyle,
}) => {
  return (
    <View style={containerStyle}>
      <Text
        style={[styles.sectionTitle, sectionTitleStyle]}
        accessibilityRole="header"
      >
        {title}
      </Text>
      <View style={styles.optionRow}>
        {options.map((option) => {
          const isSelected = selected === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.optionButton,
                isSelected && styles.optionButtonActive,
              ]}
              onPress={() => onSelect(option.key)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextActive,
                ]}
              >
                {option.label}
              </Text>
              {showCheckmark && isSelected && (
                <Text style={styles.optionCheck} accessibilityElementsHidden={true}>
                  ✓
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
