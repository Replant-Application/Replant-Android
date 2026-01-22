import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './MissionFilterBar.styles';

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
