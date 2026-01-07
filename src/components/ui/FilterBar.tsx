/**
 * FilterBar 컴포넌트
 * 범용 필터 바 컴포넌트
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';

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

const styles = StyleSheet.create({
  // Pill variant (MissionScreen 필터 탭 스타일)
  pillContainer: {
    marginBottom: spacing[5],
  },
  pillWrapper: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.xl,
    padding: spacing[1],
  },
  pillFilter: {
    flex: 1,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  pillFilterActive: {
    backgroundColor: colors.primary[500],
    ...shadows.sm,
  },
  pillFilterText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  pillFilterTextActive: {
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
  },

  // Button variant (MissionHistoryScreen, CommunityScreen verificationFilter 스타일)
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: spacing[3],
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    padding: spacing[1],
  },
  buttonFilter: {
    flex: 1,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  buttonFilterActive: {
    backgroundColor: colors.primary[500],
  },
  buttonFilterText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  buttonFilterTextActive: {
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
  },
});

