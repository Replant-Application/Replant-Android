import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';

export type MissionFilter = 'all' | 'daily' | 'completed';

interface MissionFilterBarProps {
  selectedFilter: MissionFilter;
  onFilterChange: (filter: MissionFilter) => void;
}

export const MissionFilterBar: React.FC<MissionFilterBarProps> = ({
  selectedFilter,
  onFilterChange,
}) => {
  const filters: Array<{ key: MissionFilter; label: string }> = [
    { key: 'all', label: '전체' },
    { key: 'daily', label: '오늘' },
    { key: 'completed', label: '완료' },
  ];

  return (
    <View style={styles.container}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterButton,
            selectedFilter === filter.key && styles.filterButtonActive,
          ]}
          onPress={() => onFilterChange(filter.key)}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === filter.key && styles.filterTextActive,
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  filterButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
  },
  filterButtonActive: {
    backgroundColor: colors.primary[500],
  },
  filterText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  filterTextActive: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.bold,
  },
});
