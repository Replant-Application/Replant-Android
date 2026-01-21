/**
 * 미션 페이지네이션 컴포넌트
 * 미션 목록의 페이지네이션 UI
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';

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

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing[4],
    gap: spacing[1],
  },
  pageArrow: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageArrowDisabled: {
    backgroundColor: colors.gray[100],
  },
  pageArrowText: {
    fontSize: typography.fontSize['2xl'],
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  pageArrowTextDisabled: {
    color: colors.gray[400],
  },
  pageArrowIcon: {
    width: 16,
    height: 16,
    tintColor: colors.primary[600],
  },
  pageArrowIconLeft: {
    transform: [{ rotate: '180deg' }],
  },
  pageArrowIconDisabled: {
    tintColor: colors.gray[400],
  },
  pageIndicators: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  pageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[300],
  },
  pageIndicatorActive: {
    backgroundColor: colors.primary[500],
    width: 20,
  },
  pageInfo: {
    textAlign: 'center',
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
});

export default MissionPagination;
