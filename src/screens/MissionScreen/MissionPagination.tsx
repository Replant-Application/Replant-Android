/**
 * 미션 페이지네이션 컴포넌트
 * 미션 목록의 페이지네이션 UI
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { styles } from './MissionPagination.styles';

interface MissionPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageIndex: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}

const MissionPagination: React.FC<MissionPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  onPrevious,
  onNext,
}) => {
  if (totalPages <= 1) return null;

  return (
    <>
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.pageArrow, currentPage === 0 && styles.pageArrowDisabled]}
          onPress={onPrevious}
          disabled={currentPage === 0}
        >
          <Image
            source={require('../../assets/images/chevron.png')}
            style={[
              styles.pageArrowIcon,
              styles.pageArrowIconLeft,
              currentPage === 0 && styles.pageArrowIconDisabled,
            ]}
            resizeMode="contain"
            accessibilityLabel="이전 페이지"
          />
        </TouchableOpacity>

        <View style={styles.pageIndicators}>
          {Array.from({ length: totalPages }, (_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.pageIndicator,
                currentPage === index && styles.pageIndicatorActive,
              ]}
              onPress={() => onPageChange(index)}
              accessibilityRole="button"
              accessibilityLabel={`${index + 1}페이지로 이동${currentPage === index ? ', 현재 페이지' : ''}`}
              accessibilityState={{ selected: currentPage === index }}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.pageArrow, currentPage === totalPages - 1 && styles.pageArrowDisabled]}
          onPress={onNext}
          disabled={currentPage === totalPages - 1}
        >
          <Image
            source={require('../../assets/images/chevron.png')}
            style={[
              styles.pageArrowIcon,
              currentPage === totalPages - 1 && styles.pageArrowIconDisabled,
            ]}
            resizeMode="contain"
            accessibilityLabel="다음 페이지"
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.pageInfo}>
        {currentPage + 1} / {totalPages} 페이지
      </Text>
    </>
  );
};

export default MissionPagination;
