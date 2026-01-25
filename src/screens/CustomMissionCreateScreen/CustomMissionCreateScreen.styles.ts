/**
 * CustomMissionCreateScreen 스타일
 * 커스텀 미션 생성 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/styles/textStyles';
import { createTextStyle, createBodyStyle } from '../../utils/styles/textStyles';
import { inputStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  backButtonIcon: {
    width: 24,
    height: 24,
    tintColor: colors.text.primary,
  },
  content: {
    flex: 1,
    padding: spacing[5],
  },
  textInput: {
    ...inputStyles.base(),
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    fontSize: typography.fontSize.base,
    backgroundColor: colors.background.primary,
    textAlignVertical: 'top',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  worryTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    justifyContent: 'flex-start',
  },
  worryTypeButton: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    flexBasis: '30%',
    flexGrow: 0,
    flexShrink: 0,
    height: 40,
    marginBottom: spacing[2],
  },
  selectedWorryType: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[500],
  },
  worryTypeEmoji: {
    fontSize: typography.fontSize.base,
  },
  worryTypeText: {
    ...createTextStyle('sm', {
      color: colors.text.secondary,
    }),
  },
  selectedWorryTypeText: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  optionalHint: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
      marginTop: spacing[2],
    }),
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  categoryButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    minWidth: 90,
    height: 40,
  },
  selectedCategory: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[500],
  },
  categoryEmoji: {
    fontSize: typography.fontSize.base,
  },
  categoryText: {
    ...createTextStyle('sm', {
      color: colors.text.secondary,
    }),
  },
  selectedCategoryText: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  verificationContainer: {
    flexDirection: 'column',
    gap: spacing[2],
  },
  verificationButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[3],
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  selectedVerification: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[500],
  },
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationEmoji: {
    fontSize: typography.fontSize.xl,
    marginRight: spacing[2],
  },
  verificationText: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.secondary,
    }),
  },
  selectedVerificationText: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  verificationDesc: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
      textAlign: 'center',
      marginTop: spacing[1],
    }),
  },
  timeSettingContainer: {
    marginTop: spacing[4],
    padding: spacing[3],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  timeSettingTitle: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      color: colors.primary[700],
      marginBottom: spacing[3],
      textAlign: 'center',
    }),
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timePickerItem: {
    alignItems: 'center',
  },
  timeLabel: {
    ...createTextStyle('xs', {
      color: colors.text.secondary,
      marginBottom: spacing[1],
    }),
  },
  timeButton: {
    backgroundColor: colors.background.primary,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary[300],
    minWidth: 100,
    alignItems: 'center',
  },
  timeButtonText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  timeSeparator: {
    fontSize: typography.fontSize.xl,
    color: colors.text.secondary,
    marginHorizontal: spacing[3],
    marginTop: spacing[4],
  },
  timeHint: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
      textAlign: 'center',
      marginTop: spacing[3],
    }),
  },
  missionTypeToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  missionTypeButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
    marginHorizontal: spacing[1],
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.primary,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  selectedMissionType: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[500],
  },
  missionTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  missionTypeEmoji: {
    fontSize: typography.fontSize['2xl'],
    marginRight: spacing[2],
  },
  missionTypeText: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.secondary,
    }),
  },
  selectedMissionTypeText: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.bold,
  },
  missionTypeDesc: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
      textAlign: 'center',
      marginTop: spacing[1],
    }),
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  daysButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[3],
    marginHorizontal: spacing[1],
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  selectedDays: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[500],
  },
  daysRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  daysEmoji: {
    fontSize: typography.fontSize.xl,
    marginRight: spacing[2],
  },
  daysText: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.secondary,
    }),
  },
  selectedDaysText: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emojiButton: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  selectedEmoji: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[500],
  },
  emojiText: {
    fontSize: typography.fontSize.xl,
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xl),
  },
  expContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  expInput: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    backgroundColor: colors.background.primary,
    width: 80,
    textAlign: 'center',
    marginRight: spacing[2],
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  expLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  expHint: {
    ...createTextStyle('sm', {
      color: colors.text.tertiary,
    }),
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: spacing[5],
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  button: {
    flex: 1,
    marginHorizontal: spacing[2],
  },
  cancelButton: {
    backgroundColor: colors.gray[200],
  },
  cancelButtonText: {
    color: colors.text.secondary,
  },
  createButton: {
    backgroundColor: colors.primary[500],
  },
});
