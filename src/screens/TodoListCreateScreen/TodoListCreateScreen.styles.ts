/**
 * TodoListCreateScreen 스타일
 * 투두리스트 생성 화면의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/styles/textStyles';
import { createTextStyle, createTitleStyle, createBodyStyle, createSecondaryTextStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { buttonStyles, inputStyles, modalStyles, emptyStateStyles } from '../../utils/styles/commonStyles';
import { loadingStyles } from '../../utils/styles/componentStyles';

export const styles = StyleSheet.create({
  container: { 
    flex: 1 
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
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
    ...createTitleStyle('2xl', {
      marginBottom: spacing[2],
    }),
  },
  stepSubtitle: {
    ...createSecondaryTextStyle('sm'),
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
    borderRadius: borderRadius.md, 
    padding: spacing[4], 
    marginBottom: spacing[3], 
    alignItems: 'center' 
  },
  missionNumber: { 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    backgroundColor: colors.primary[500], 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: spacing[3] 
  },
  missionNumberText: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      color: colors.white,
    }),
  },
  missionContent: { 
    flex: 1 
  },
  missionTitle: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.medium,
      marginBottom: spacing[1],
    }),
  },
  missionTitleSelected: { 
    color: colors.primary[700] 
  },
  missionDescription: {
    ...createSecondaryTextStyle('sm', {
      marginBottom: spacing[2],
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
    backgroundColor: colors.blue[50], 
    paddingVertical: 2, 
    paddingHorizontal: spacing[2], 
    borderRadius: borderRadius.base 
  },
  missionExpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
    borderRadius: borderRadius.md, 
    padding: spacing[4], 
    marginBottom: spacing[3] 
  },
  selectableMissionCardSelected: { 
    backgroundColor: colors.primary[50] 
  },
  checkbox: { 
    width: 24, 
    height: 24, 
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
    fontSize: 14, 
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
    }),
  },
  textInput: {
    ...inputStyles.base(),
    ...createTextStyle('base'),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[6],
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
    backgroundColor: colors.primary[500], 
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
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
  timeMissionTime: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.bold,
      color: colors.primary[600],
    }),
  },
  timeMissionContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  timeMissionTitle: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      flex: 1,
      marginRight: spacing[2],
    }),
  },
  timeMissionRemoveButton: { 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    backgroundColor: colors.gray[300], 
    justifyContent: 'center', 
    alignItems: 'center', 
    flexShrink: 0 
  },
  timeMissionRemoveText: { 
    fontSize: 18, 
    color: colors.text.secondary, 
    lineHeight: 20 
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
  missionsListTitle: {
    ...createTitleStyle('lg', {
      flex: 1,
    }),
  },
  defaultTimeButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
    marginLeft: spacing[3],
  },
  defaultTimeButtonText: {
    ...createButtonTextStyle('sm', {
      color: colors.white,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  missionListItem: { 
    flexDirection: 'row', 
    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
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
  missionListItemTitle: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.medium,
      marginBottom: spacing[1],
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
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  missionListItemCategory: {
    ...createTextStyle('xs', {
      color: colors.blue[600],
      backgroundColor: colors.blue[50],
      paddingVertical: 2,
      paddingHorizontal: spacing[2],
      borderRadius: borderRadius.base,
    }),
  },
  missionListItemExpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
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
      marginTop: spacing[1],
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
