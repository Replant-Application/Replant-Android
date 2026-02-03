/**
 * PlacesSearchScreen 스타일
 * 장소 검색 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/styles/textStyles';
import { createTextStyle, createSecondaryTextStyle } from '../../utils/styles/textStyles';
import { inputStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  backButtonIcon: {
    width: 24,
    height: 24,
  },
  content: {
    flex: 1,
    padding: spacing[4],
  },
  searchContainer: {
    marginBottom: spacing[3],
  },
  searchInput: {
    ...inputStyles.base(),
    padding: spacing[2],
    fontSize: typography.fontSize.base,
    textAlignVertical: 'center',
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
    fontFamily: Platform.select({ ios: undefined, android: typography.fontFamily.regular }),
    color: colors.text.primary,
  },
  filterContainer: {
    marginBottom: spacing[3],
    maxHeight: 40,
  },
  filterChip: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.primary,
    marginRight: spacing[2],
  },
  filterChipActive: {
    backgroundColor: colors.primary[500],
  },
  filterChipText: {
    ...createSecondaryTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  filterChipTextActive: {
    ...createTextStyle('sm', {
      color: colors.text.inverse,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  regionContainer: {
    marginBottom: spacing[4],
    maxHeight: 40,
  },
  regionChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.base,
    backgroundColor: colors.background.primary,
    marginRight: spacing[2],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  regionChipActive: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[500],
  },
  regionChipText: {
    ...createSecondaryTextStyle('sm'),
  },
  regionChipTextActive: {
    ...createTextStyle('sm', {
      color: colors.primary[700],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing[3],
    ...createSecondaryTextStyle('base'),
  },
  placesList: {
    flex: 1,
  },
  resultsCount: {
    ...createSecondaryTextStyle('sm', {
      marginBottom: spacing[3],
      fontWeight: typography.fontWeight.medium,
    }),
  },
});
