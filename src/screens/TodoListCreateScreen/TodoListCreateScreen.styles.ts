/**
 * TodoListCreateScreen 스타일
 * 투두리스트 생성 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/styles/textStyles';
import { createTextStyle, createTitleStyle, createBodyStyle, createSecondaryTextStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { buttonStyles, inputStyles, modalStyles, emptyStateStyles } from '../../utils/styles/commonStyles';
import { loadingStyles } from '../../utils/styles/componentStyles';

export const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  icon24: {
    width: 24,
    height: 24,
  },

  introContainer: { 
    flex: 1, 
    padding: spacing[5], 
    justifyContent: 'center' 
  },
  introContent: { 
    alignItems: 'center', 
    marginBottom: spacing[8] 
  },
  introIconContainer: { 
    width: 100, 
    height: 100, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: spacing[5] 
  },
  introIcon: { 
    width: 100, 
    height: 100 
  },
  introTitle: {
    ...createTitleStyle('xl', {
      marginBottom: spacing[5],
      textAlign: 'center',
    }),
  },
  introDescriptionContainer: { 
    backgroundColor: colors.overlay.white.medium, 
    borderRadius: borderRadius.base, 
    padding: spacing[4], 
    maxWidth: '100%' 
  },
  introDescription: {
    ...createBodyStyle('base', {
      textAlign: 'center',
      lineHeight: getOptimizedLineHeight(typography.fontSize.base) * 1.4,
      fontWeight: typography.fontWeight.medium,
    }),
  },

  stepContainer: { 
    flex: 1, 
    padding: spacing[4] 
  },
  stepHeader: { 
    marginBottom: spacing[5], 
    paddingHorizontal: spacing[1] 
  },
  stepTitle: {
    ...createTitleStyle('xl', {
      marginBottom: spacing[2],
    }),
  },
  stepSubtitle: {
    ...createSecondaryTextStyle('sm'),
  },

  filterSection: {
    marginBottom: spacing[3],
  },
  onlyMyMissionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.overlay.white.medium,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  onlyMyMissionsLabel: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.semibold,
      color: colors.text.primary,
    }),
  },

  // 검색창과 필터 버튼
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderWidth: 1,
    borderColor: '#D4A574',
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: spacing[2],
    tintColor: colors.text.tertiary,
  },
  searchInput: {
    flex: 1,
    ...createBodyStyle('base', {
      color: colors.text.primary,
    }),
    padding: 0,
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
  filterIcon: {
    width: 26,
    height: 26,
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

  // 필터 모달
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModalContent: {
    backgroundColor: colors.overlay.white.heavy,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    width: '85%',
    maxWidth: 400,
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  filterModalTitle: {
    ...createTitleStyle('lg', {
      fontWeight: typography.fontWeight.bold,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.bold,
      }),
    }),
  },
  filterModalClose: {
    ...createTextStyle('xl', {
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.bold,
    }),
  },
  filterOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    gap: spacing[4],
  },
  filterOptionLabel: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.primary,
    }),
  },

  loadingContainer: { 
    ...loadingStyles.container() 
  },
  loadingText: {
    ...createSecondaryTextStyle('sm', {
      marginTop: spacing[3],
    }),
  },

  missionList: { 
    flex: 1 
  },
  missionCard: { 
    flexDirection: 'row', 
    backgroundColor: colors.overlay.white.heavy, 
    borderRadius: borderRadius.md, 
    padding: spacing[4], 
    marginBottom: spacing[3], 
    alignItems: 'center' 
  },
  missionContent: { 
    flex: 1 
  },
  missionTitleContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: spacing[1],
  },
  missionNumber: { 
    width: 22, 
    height: 22, 
    borderRadius: 11, 
    backgroundColor: colors.primary[500], 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: spacing[2] 
  },
  missionNumberText: {
    ...createTextStyle('xs', {
      fontWeight: typography.fontWeight.medium,
      color: colors.white,
    }),
  },
  missionTitle: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.medium,
      marginBottom: spacing[2],
    }),
  },
  missionTitleSelected: { 
    color: colors.primary[700] 
  },
  missionDescription: {
    ...createSecondaryTextStyle('sm', {
      marginBottom: spacing[3],
      color: colors.text.secondary,
      lineHeight: getOptimizedLineHeight(typography.fontSize.sm) * 1.3,
    }),
  },
  missionMeta: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: spacing[2] 
  },
  missionCategory: { 
    fontSize: typography.fontSize.xs, 
    color: colors.blue[600], 
    backgroundColor: colors.blue[100], 
    paddingVertical: 2, 
    paddingHorizontal: spacing[2], 
    borderRadius: borderRadius.sm 
  },
  missionExpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: '#FFF3E0',
    paddingVertical: 2,
    paddingHorizontal: spacing[2],
    borderRadius: borderRadius.sm,
  },
  sunIcon: {
    width: 14,
    height: 14,
  },
  missionExp: {
    ...createTextStyle('xs', {
      color: '#FF9800',
      fontWeight: typography.fontWeight.medium,
    }),
  },
  rerollButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing[2],
  },
  rerollButtonIcon: {
    width: 30,
    height: 30,
  },

  selectableMissionCard: { 
    flexDirection: 'row', 
    backgroundColor: colors.overlay.white.heavy, 
    borderRadius: borderRadius.md, 
    padding: spacing[4], 
    marginBottom: spacing[3] 
  },
  selectableMissionCardSelected: { 
    backgroundColor: colors.primary[50] 
  },
  checkbox: { 
    width: 20, 
    height: 20, 
    borderRadius: borderRadius.sm, 
    borderWidth: 2, 
    borderColor: colors.gray[300], 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: spacing[3] 
  },
  checkboxSelected: { 
    borderColor: colors.primary[500], 
    backgroundColor: colors.primary[500] 
  },
  checkmark: { 
    color: colors.white, 
    fontSize: 12, 
    fontWeight: typography.fontWeight.medium 
  },

  confirmContent: { 
    flex: 1 
  },
  inputGroup: { 
    marginBottom: spacing[4] 
  },
  inputLabel: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      marginBottom: spacing[2],
      fontFamily: typography.fontFamily.regular,
      color: colors.text.primary,
    }),
  },
  textInput: {
    ...inputStyles.base(),
    ...createTextStyle('sm', {
      color: colors.text.primary,
    }),
    backgroundColor: colors.overlay.white.heavy,
    fontFamily: Platform.select({
      ios: undefined,
      android: typography.fontFamily.regular,
    }),
  },
  textArea: { 
    height: 100, 
    textAlignVertical: 'top' 
  },
  descriptionTextArea: {
    paddingTop: spacing[3],
  },

  buttonContainer: { 
    flexDirection: 'row', 
    gap: spacing[3], 
    paddingTop: spacing[4] 
  },
  primaryButton: { 
    ...buttonStyles.primary(),
    width: '100%',
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[4],
  },
  primaryButtonText: {
    ...createButtonTextStyle('base'),
  },
  secondaryButton: { 
    ...buttonStyles.secondary(),
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[6],
  },
  secondaryButtonText: {
    ...createButtonTextStyle('base', {
      color: colors.text.secondary,
    }),
  },
  buttonFlex: { 
    flex: 1 
  },
  buttonDisabled: { 
    backgroundColor: colors.gray[300] 
  },

  createMissionButton: { 
    backgroundColor: colors.primary[700], 
    borderRadius: borderRadius.md, 
    paddingVertical: spacing[1], 
    paddingHorizontal: spacing[4], 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: spacing[3], 
    minHeight: 36 
  },
  createMissionButtonText: {
    ...createButtonTextStyle('base'),
  },
  createMissionForm: { 
    backgroundColor: colors.overlay.white.heavy, 
    borderRadius: borderRadius.md, 
    padding: spacing[4], 
    marginBottom: spacing[3] 
  },
  createMissionFormTitle: {
    ...createTitleStyle('lg', {
      marginBottom: spacing[4],
    }),
  },

  emptyContainer: { 
    ...emptyStateStyles.container() 
  },
  emptyText: { 
    ...emptyStateStyles.text(),
    marginBottom: spacing[2],
  },
  emptySubtext: { 
    ...emptyStateStyles.subtext() 
  },

  todaySection: { 
    backgroundColor: colors.overlay.white.heavy, 
    borderRadius: borderRadius.md, 
    padding: spacing[4],
    paddingTop: spacing[2],
    paddingBottom: spacing[2],
    marginTop: spacing[2], 
    marginBottom: spacing[4] 
  },
  todayHeader: { 
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[1], 
    paddingBottom: spacing[2], 
    borderBottomWidth: 1, 
    borderBottomColor: colors.primary[500] 
  },
  todayDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  todayDayName: {
    ...createTitleStyle('lg', {
      color: colors.primary[600],
      marginRight: spacing[2],
    }),
  },
  todayDayNumber: {
    ...createTitleStyle('2xl', {
      color: colors.primary[600],
    }),
  },
  emptyTodayText: {
    ...createSecondaryTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
    }),
  },

  timeMissionItem: { 
    flexDirection: 'column', 
    backgroundColor: colors.overlay.white.heavy, 
    borderRadius: borderRadius.md, 
    padding: spacing[3], 
    marginBottom: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  timeMissionItemLast: {
    marginBottom: 0,
    borderBottomWidth: 0,
  },
  timeMissionHeader: { 
    marginBottom: spacing[1], 
  },
  timeMissionContentWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  timeMissionContent: { 
    flex: 1,
    marginRight: spacing[2],
  },
  timeMissionTitle: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      marginTop: spacing[1],
      marginBottom: spacing[2],
      color: colors.text.primary,
    }),
  },
  timeMissionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  timeMissionCategory: {
    fontSize: typography.fontSize.xs,
    color: colors.blue[600],
    backgroundColor: colors.blue[50],
    paddingVertical: 2,
    paddingHorizontal: spacing[2],
    borderRadius: borderRadius.sm,
  },
  timeMissionTime: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.bold,
      color: colors.primary[600],
      marginBottom: spacing[1],
    }),
  },
  timeMissionExpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  timeMissionExp: {
    ...createTextStyle('xs', {
      color: colors.text.secondary,
    }),
  },
  timeMissionRemoveButton: { 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    backgroundColor: 'transparent', 
    justifyContent: 'center', 
    alignItems: 'center', 
    flexShrink: 0,
  },
  timeMissionRemoveText: { 
    fontSize: 16, 
    color: colors.gray[600], 
    lineHeight: 18,
    fontWeight: typography.fontWeight.semibold,
  },

  missionsListSection: { 
    marginTop: spacing[2], 
    marginBottom: spacing[4] 
  },
  missionsListTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  allDayCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allDayCheckbox: {
    width: 18,
    height: 18,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.gray[400],
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[2],
  },
  allDayCheckboxSelected: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[600],
  },
  allDayCheckmark: {
    color: colors.white,
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    lineHeight: 14,
  },
  allDayLabel: {
    ...createTextStyle('xs', {
      color: colors.text.primary,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  missionsListTitle: {
    ...createTitleStyle('base', {
      flex: 1,
    }),
  },
  defaultTimeButton: {
    ...buttonStyles.primary(),
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[1.5],
    marginLeft: spacing[3],
    minHeight: 28,
  },
  defaultTimeButtonText: {
    ...createButtonTextStyle('xs'),
  },
  missionListItem: { 
    flexDirection: 'row', 
    backgroundColor: colors.overlay.white.heavy, 
    borderRadius: borderRadius.md, 
    padding: spacing[4], 
    marginBottom: spacing[2], 
    alignItems: 'center' 
  },
  missionListItemSelected: { 
    backgroundColor: colors.primary[50], 
    borderWidth: 1, 
    borderColor: colors.primary[500] 
  },
  missionListItemContent: { 
    flex: 1 
  },
  missionListItemTitleContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: spacing[1.5],
    marginBottom: spacing[1],
  },
  missionListItemTitle: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.medium,
      marginBottom: spacing[2],
    }),
  },
  missionListItemTitleSelected: { 
    color: colors.primary[700] 
  },
  missionListItemDescription: {
    ...createSecondaryTextStyle('sm', {
      marginBottom: spacing[2],
    }),
  },
  missionListItemMeta: { 
    flexDirection: 'row', 
    justifyContent: 'flex-start', 
    alignItems: 'center',
    gap: spacing[2],
  },
  missionListItemCategory: {
    ...createTextStyle('xs', {
      color: colors.blue[600],
      backgroundColor: colors.blue[100],
      paddingVertical: 2,
      paddingHorizontal: spacing[2],
      borderRadius: borderRadius.sm,
    }),
  },
  missionListItemExpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: '#FFF3E0',
    paddingVertical: 2,
    paddingHorizontal: spacing[2],
    borderRadius: borderRadius.sm,
  },
  missionListItemExp: {
    ...createTextStyle('xs', {
      color: '#000000',
      fontWeight: typography.fontWeight.medium,
    }),
  },
  missionListItemTimeSlot: {
    ...createTextStyle('sm', {
      color: colors.primary[600],
      fontWeight: typography.fontWeight.bold,
    }),
  },

  /* 시간 설정 모달 스타일 */
  timePickerModalOverlay: {
    ...modalStyles.overlay(),
  },

  modalShadowWrap: {
    borderRadius: borderRadius.xl,
    backgroundColor: 'transparent',
    elevation: 18,
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
  },
  
  timePickerModalContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[10],
    paddingTop: spacing[5],
    paddingBottom: spacing[5],
    width: 350,
    alignSelf: 'center',
  },
  
  timePickerModalTitle: {
    ...createTitleStyle('xl', {
      marginBottom: spacing[3],
      textAlign: 'center',
    }),
  },
  timePickerModalMissionTitle: {
    ...createBodyStyle('base', {
      color: colors.text.secondary,
      marginBottom: spacing[5],
      textAlign: 'center',
    }),
  },
  timePickerModalButtons: { 
    flexDirection: 'row', 
    gap: spacing[2], 
    marginTop: spacing[4] 
  },
  timePickerModalCancelButton: { 
    flex: 1, 
    paddingVertical: spacing[3], 
    borderRadius: borderRadius.md, 
    backgroundColor: colors.gray[200], 
    alignItems: 'center', 
    minHeight: 44 
  },
  timePickerModalCancelText: {
    ...createButtonTextStyle('base', {
      color: colors.text.secondary,
    }),
  },
  timePickerModalConfirmButton: { 
    flex: 1, 
    paddingVertical: spacing[3], 
    borderRadius: borderRadius.md, 
    backgroundColor: colors.primary[500], 
    alignItems: 'center', 
    minHeight: 44 
  },
  timePickerModalConfirmText: {
    ...createButtonTextStyle('base'),
  },

  timeRangeSection: { 
    marginBottom: spacing[4] 
  },
  timeRangeLabel: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.medium,
      marginBottom: spacing[2],
    }),
  },
  timeRangeRow: { 
    flexDirection: 'row', 
    gap: spacing[2], 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  timePickerWrapper: {
    width: '100%',
  },
  timeSeparator: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 250,
    paddingHorizontal: spacing[2],
  },
  timeSeparatorText: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    includeFontPadding: false,
  },

  /* 드롭다운 스타일 (레거시 - 시간 모달에서 WheelPicker 사용) */
  dropdownContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
    elevation: 1,
  },
  dropdownContainerPeriod: {
    flex: 1.2,
    minWidth: 65,
  },
  dropdownContainerHour: {
    flex: 1.3,
    minWidth: 70,
  },
  dropdownContainerMinute: {
    flex: 1.3,
    minWidth: 70,
  },
  dropdownContainerOpen: {
    zIndex: 999999,
    elevation: 999999,
  },

  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[2],
    borderWidth: 1,
    borderColor: colors.gray[300],
    minHeight: 40,
  },
  dropdownButtonText: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  dropdownArrow: { 
    fontSize: typography.fontSize.xs, 
    color: colors.text.secondary, 
    marginLeft: spacing[1] 
  },

  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    marginTop: spacing[1],
    height: 250,
    maxHeight: 250,
    zIndex: 999999,
    elevation: 999999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    minWidth: '100%',
    overflow: 'hidden',
    pointerEvents: 'box-none',
  },
  dropdownListSmall: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    marginTop: spacing[1],
    height: 90,
    maxHeight: 90,
    zIndex: 999999,
    elevation: 999999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    minWidth: '100%',
    overflow: 'hidden',
    pointerEvents: 'box-none',
  },
  dropdownScrollView: { 
    flex: 1,
    maxHeight: 250,
    pointerEvents: 'auto',
  },
  dropdownScrollViewSmall: {
    flex: 1,
    maxHeight: 90,
    pointerEvents: 'auto',
  },
  dropdownScrollContent: {
    paddingVertical: 0,
  },
  dropdownItem: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    minHeight: 40,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownItemText: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.medium,
      textAlign: 'center',
      width: '100%',
    }),
  },
  emptyTouchable: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
});
