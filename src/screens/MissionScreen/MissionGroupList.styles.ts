/**
 * MissionGroupList 스타일
 * 미션 도감 목록 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createTitleStyle, createSecondaryTextStyle, createButtonTextStyle, createBodyStyle } from '../../utils/styles/textStyles';
import { buttonStyles, cardStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingTop: spacing[2],
    paddingBottom: spacing[20],
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#D4A574',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    gap: spacing[2],
    minHeight: 36,
  },
  searchIcon: {
    width: 18,
    height: 18,
    tintColor: colors.gray[500],
  },
  searchInput: {
    flex: 1,
    ...createTextStyle('sm', {
      color: colors.text.primary,
      padding: 0,
    }),
  },
  searchClearButton: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchClearText: {
    ...createTextStyle('sm', {
      color: colors.gray[500],
      fontWeight: typography.fontWeight.bold,
    }),
  },
  titleOnlyToggle: {
    alignSelf: 'flex-start',
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  titleOnlyToggleActive: {
    borderColor: colors.primary[400],
    backgroundColor: colors.primary[50],
  },
  titleOnlyToggleText: {
    ...createTextStyle('sm', {
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  titleOnlyToggleTextActive: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.semibold,
  },
  filterButton: {
    backgroundColor: '#8B6F47',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#D4A574',
  },
  filterButtonActive: {
    backgroundColor: '#8B6F47',
  },
  filterIcon: {
    width: 24,
    height: 24,
    tintColor: colors.white,
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.white,
  },
  filterButtonText: {
    ...createTextStyle('sm', {
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  filterButtonTextActive: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.semibold,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[1],
  },
  filterBadgeText: {
    ...createTextStyle('xs', {
      color: colors.white,
      fontWeight: typography.fontWeight.bold,
    }),
  },
  filterDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: spacing[1],
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[300],
    minWidth: 200,
    maxWidth: '100%',
    padding: spacing[3],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  filterSection: {
    marginBottom: spacing[4],
  },
  filterSectionTitle: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.semibold,
      color: colors.text.primary,
      marginBottom: spacing[2],
    }),
  },
  filterOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  filterOption: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  filterOptionActive: {
    borderColor: colors.primary[400],
    backgroundColor: colors.primary[50],
  },
  filterOptionText: {
    ...createTextStyle('sm', {
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  filterOptionTextActive: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.semibold,
  },
  // 필터 모달
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    width: '85%',
    maxWidth: 400,
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  filterModalTitle: {
    ...createTitleStyle('lg', {
      fontWeight: typography.fontWeight.medium,
      fontFamily: typography.fontFamily.regular,
    }),
  },
  filterModalClose: {
    ...createTextStyle('xl', {
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.bold,
    }),
  },
  filterSection: {
    marginBottom: spacing[4],
  },
  filterSectionTitle: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.semibold,
      color: colors.text.primary,
      marginBottom: spacing[2],
    }),
  },
  filterOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  fab: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[400], // 연두색
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: colors.primary[400],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 100,
  },
  fabIconImage: {
    width: 24,
    height: 24,
    tintColor: colors.white,
  },
  customMissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  createMissionButton: {
    ...buttonStyles.primary(),
    flexDirection: 'row',
    gap: spacing[2],
    flex: 1,
    paddingVertical: spacing[2],
    minHeight: 40,
  },
  createMissionIcon: {
    width: 20,
    height: 20,
    tintColor: colors.white,
  },
  createMissionText: {
    ...createButtonTextStyle('base'),
  },
  filterSortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
    marginBottom: spacing[3],
    marginTop: spacing[1],
    width: '100%',
  },
  filterSortRowWithSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
    marginBottom: spacing[3],
    marginTop: spacing[1],
    width: '100%',
  },
  filterCheckboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
    marginTop: spacing[2],
  },
  filterCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  filterCheckboxPlaceholder: {
    flex: 1,
    minWidth: 0,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.gray[400],
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  checkboxCheckmark: {
    ...createTextStyle('xs', {
      fontWeight: typography.fontWeight.bold,
      color: colors.white,
    }),
  },
  filterCheckboxLabel: {
    ...createTextStyle('sm', {
      color: colors.text.primary,
    }),
  },
  sortButtonWrapper: {
    flexDirection: 'row',
    position: 'relative',
    zIndex: 10,
    flexShrink: 1,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[2],
    minHeight: 36,
  },
  sortButtonText: {
    ...createTextStyle('sm', {
      color: colors.black,
      fontWeight: typography.fontWeight.normal,
    }),
  },
  sortButtonArrow: {
    ...createTextStyle('base', {
      color: colors.black,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  sortDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: spacing[1],
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.gray[300],
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  sortDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  sortDropdownItemSelected: {
    backgroundColor: colors.primary[50],
  },
  sortDropdownItemText: {
    ...createTextStyle('sm', {
      color: colors.text.primary,
    }),
  },
  sortDropdownItemTextSelected: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.semibold,
  },
  sortDropdownCheck: {
    ...createTextStyle('sm', {
      color: colors.primary[600],
      fontWeight: typography.fontWeight.bold,
      marginLeft: spacing[2],
    }),
  },
  serverPaginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing[4],
    marginBottom: spacing[2],
    gap: spacing[12],
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  serverPageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[100],
  },
  serverPageButtonDisabled: {
    backgroundColor: colors.gray[100],
  },
  serverPageArrowIcon: {
    width: 16,
    height: 16,
    tintColor: colors.primary[600],
  },
  serverPageArrowIconLeft: {
    transform: [{ rotate: '180deg' }],
  },
  serverPageArrowIconDisabled: {
    tintColor: colors.gray[400],
  },
  serverPageInfo: {
    ...createTitleStyle('base', {
      fontWeight: typography.fontWeight.bold,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.bold,
      }),
    }),
  },
  groupMissionList: {
    marginBottom: spacing[4],
  },
  groupMissionCard: {
    ...cardStyles.base(),
    backgroundColor: colors.gray[50],
    padding: spacing[3],
    marginBottom: spacing[1],
  },
  groupMissionCardLocked: {
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.base,
    padding: spacing[8],
    marginBottom: spacing[1],
    borderWidth: 2.5,
    borderColor: colors.gray[500],
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.gray[800],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  groupMissionCardSelected: {
    borderColor: colors.primary[500],
    borderWidth: 2,
    backgroundColor: colors.primary[50],
  },
  groupMissionHeader: {
    marginBottom: spacing[2],
  },
  groupMissionInfo: {
    flex: 1,
  },
  groupMissionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
    gap: spacing[1.5],
  },
  groupMissionIcon: {
    width: 20,
    height: 20,
  },
  groupMissionTitle: {
    flex: 1,
    ...createTitleStyle('base'),
  },
  groupMissionTypeBadge: {
    backgroundColor: colors.primary[100],
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  groupMissionTypeText: {
    ...createTextStyle('xs', {
      color: colors.primary[700],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  groupMissionDescription: {
    ...createSecondaryTextStyle('sm'),
  },
  groupMissionContent: {
    marginBottom: spacing[2],
  },
  groupMissionVerificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  groupVerificationIcon: {
    width: 16,
    height: 16,
  },
  groupMissionVerificationText: {
    ...createTextStyle('xs', {
      color: colors.primary[800],
      fontWeight: typography.fontWeight.normal,
    }),
  },
  groupMissionFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing[2],
  },
  groupMissionStats: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  groupStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  officialFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  filterCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    gap: spacing[3],
  },
  filterCheckboxBox: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.gray[400],
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCheckboxBoxChecked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  filterCheckboxCheckmark: {
    ...createTextStyle('sm', {
      color: colors.white,
      fontWeight: typography.fontWeight.bold,
    }),
  },
  filterOptionLabel: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.primary,
    }),
  },
  groupStatIcon: {
    width: 16,
    height: 16,
  },
  groupStatText: {
    ...createSecondaryTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  groupMissionLockIconCenter: {
    width: 40,
    height: 40,
    tintColor: colors.gray[600],
  },
});
