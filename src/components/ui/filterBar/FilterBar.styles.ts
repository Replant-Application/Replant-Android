/**
 * FilterBar 스타일
 * 범용 필터 바 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../../utils/designTokens';
import { createTextStyle } from '../../../utils/styles/textStyles';
import { filterBarStyles, tabBarStyles } from '../../../utils/styles/componentStyles';

export const styles = StyleSheet.create({
  // Pill variant (MissionScreen 필터 탭 스타일)
  pillContainer: {
    marginBottom: spacing[5],
  },
  pillWrapper: {
    ...tabBarStyles.container(),
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
    ...createTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.secondary,
    }),
  },
  pillFilterTextActive: {
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
  },

  // Button variant (MissionHistoryScreen, CommunityScreen verificationFilter 스타일)
  buttonContainer: {
    ...filterBarStyles.container(),
    marginBottom: spacing[3],
  },
  buttonFilter: {
    ...filterBarStyles.option(),
    flex: 1,
  },
  buttonFilterActive: {
    ...filterBarStyles.optionActive(),
  },
  buttonFilterText: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.secondary,
    }),
  },
  buttonFilterTextActive: {
    ...filterBarStyles.optionTextActive(),
  },
});
