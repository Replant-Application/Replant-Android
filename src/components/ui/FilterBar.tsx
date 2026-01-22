/**
 * FilterBar 컴포넌트
 * 범용 필터 바 컴포넌트
 */

import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { styles } from './FilterBar.styles';

export interface FilterItem {
  key: string;
  label: string;
}

export interface FilterBarProps {
  filters: FilterItem[];
  selectedFilter: string;
  onFilterChange: (key: string) => void;
  variant?: 'pill' | 'button';
  containerStyle?: ViewStyle;
  style?: ViewStyle;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  selectedFilter,
  onFilterChange,
  variant = 'pill',
  containerStyle,
  style,
}) => {
  const renderPillVariant = () => (
    <View style={[styles.pillContainer, containerStyle]}>
      <View style={styles.pillWrapper}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.pillFilter,
              selectedFilter === filter.key && styles.pillFilterActive,
            ]}
            onPress={() => onFilterChange(filter.key)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={filter.label}
            accessibilityState={{ selected: selectedFilter === filter.key }}
          >
            <Text
              style={[
                styles.pillFilterText,
                selectedFilter === filter.key && styles.pillFilterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderButtonVariant = () => (
    <View style={[styles.buttonContainer, containerStyle]}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.buttonFilter,
            selectedFilter === filter.key && styles.buttonFilterActive,
          ]}
          onPress={() => onFilterChange(filter.key)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={filter.label}
          accessibilityState={{ selected: selectedFilter === filter.key }}
        >
          <Text
            style={[
              styles.buttonFilterText,
              selectedFilter === filter.key && styles.buttonFilterTextActive,
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  switch (variant) {
    case 'pill':
      return renderPillVariant();
    case 'button':
      return renderButtonVariant();
    default:
      return renderPillVariant();
  }
};

