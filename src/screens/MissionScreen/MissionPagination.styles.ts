/**
 * MissionPagination 스타일
 * 미션 페이지네이션 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createSecondaryTextStyle } from '../../utils/styles/textStyles';

export const styles = StyleSheet.create({
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
    ...createTextStyle('2xl', {
      color: colors.primary[600],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  pageArrowTextDisabled: {
    ...createTextStyle('2xl', {
      color: colors.gray[400],
      fontWeight: typography.fontWeight.medium,
    }),
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
    ...createSecondaryTextStyle('sm', {
      textAlign: 'center',
      marginTop: spacing[2],
    }),
  },
});
