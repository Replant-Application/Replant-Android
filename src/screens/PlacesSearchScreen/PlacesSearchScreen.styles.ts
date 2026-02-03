/**
 * PlacesSearchScreen 스타일
 * 장소 검색 화면의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
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
    marginBottom: spacing[5],
  },
  searchInput: {
    ...inputStyles.base(),
    padding: spacing[2],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    textAlignVertical: 'center',
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  filterCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[5],
    gap: spacing[3],
  },
  filterCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  filterCheckbox: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border.medium,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterCheckboxChecked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  filterCheckboxMark: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  filterCheckboxLabel: {
    ...createSecondaryTextStyle('sm', {
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
  resultsArea: {
    flex: 1,
  },
  loadingCenter: {
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
    paddingLeft: spacing[2],
  },
});
