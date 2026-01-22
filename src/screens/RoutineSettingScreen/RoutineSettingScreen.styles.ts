/**
 * RoutineSettingScreen 스타일
 * 나의 루틴 설정 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { createTextStyle, createBodyStyle, createSecondaryTextStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { inputStyles, buttonStyles, cardStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing[3],
    ...createBodyStyle('base', {
      color: colors.text.secondary,
    }),
  },
  tabContainer: {
    paddingHorizontal: spacing[3],
    paddingTop: spacing[2],
    paddingBottom: spacing[3],
  },
  tabTextActive: {
    color: colors.primary[500],
    fontWeight: typography.fontWeight.semibold,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing[4],
  },
  sectionDescription: {
    ...createSecondaryTextStyle('sm', {
      lineHeight: getOptimizedLineHeight(typography.fontSize.sm) * 1.5,
      marginBottom: spacing[4],
    }),
  },
  routineCard: {
    ...cardStyles.base(),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 2,
    borderColor: '#D4A574',
  },
  routineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  routineIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFF8F0',
    borderWidth: 1,
    borderColor: '#E8DDD4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  routineIcon: {
    fontSize: 22,
  },
  routineInfo: {
    flex: 1,
  },
  routineName: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.semibold,
      marginBottom: spacing[1],
    }),
  },
  routineDescription: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
    }),
  },
  historyButton: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.sm,
  },
  historyButtonText: {
    ...createTextStyle('xs', {
      color: colors.text.secondary,
    }),
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: '#E8DDD4',
  },
  valueText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: '#6B5344',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  valueTextPlaceholder: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.tertiary,
    }),
  },
  editIcon: {
    fontSize: typography.fontSize.xl,
    color: colors.gray[400],
  },
  editContainer: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    padding: spacing[3],
  },
  inputGroup: {
    marginBottom: spacing[3],
  },
  inputLabel: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.secondary,
      marginBottom: spacing[2],
    }),
  },
  timeEditContainer: {
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  timeDisplay: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  timeText: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  timeRangeItem: {
    alignItems: 'center',
  },
  timeRangeSeparator: {
    fontSize: typography.fontSize.xl,
    color: colors.text.secondary,
    marginHorizontal: spacing[3],
    marginTop: spacing[6],
  },
  locationInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: spacing[2],
  },
  mapButton: {
    ...buttonStyles.primary(),
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.md,
  },
  mapButtonText: {
    ...createButtonTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  coordinateText: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
      marginTop: spacing[2],
    }),
  },
  textInput: {
    ...inputStyles.base(),
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    padding: spacing[3],
    fontSize: typography.fontSize.base,
    borderWidth: 1,
    borderColor: colors.gray[300],
    marginBottom: spacing[3],
    minHeight: 44,
  },
  textAreaInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
    marginBottom: spacing[3],
  },
  notificationLabel: {
    ...createTextStyle('sm', {
      color: colors.text.secondary,
    }),
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[2],
  },
  cancelButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[200],
  },
  cancelButtonText: {
    ...createButtonTextStyle('sm', {
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  saveButton: {
    ...buttonStyles.primary(),
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.md,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.primary[300],
  },
  saveButtonText: {
    ...createButtonTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  routineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  notificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationStatusText: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
    }),
  },
  deleteButton: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
  },
  deleteButtonText: {
    ...createTextStyle('xs', {
      color: colors.error[500],
    }),
  },
  bottomSpacer: {
    height: 100,
  },
});
