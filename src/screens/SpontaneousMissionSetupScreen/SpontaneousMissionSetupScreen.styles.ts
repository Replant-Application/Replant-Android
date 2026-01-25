/**
 * SpontaneousMissionSetupScreen 스타일
 * 돌발 미션 설정 온보딩 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/styles/textStyles';
import { createTextStyle, createBodyStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { buttonStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...createBodyStyle('base', {
      color: colors.text.secondary,
    }),
  },
  container: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  contentTouchable: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing[4],
    paddingTop: spacing[6],
    justifyContent: 'flex-start',
  },
  progressContainer: {
    marginBottom: spacing[4],
  },
  progressText: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.secondary,
      marginBottom: spacing[2],
      textAlign: 'center',
    }),
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
  },
  stepContainer: {
    alignItems: 'center',
    marginTop: spacing[2],
  },
  stepTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[2],
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize['2xl']),
  },
  stepDescription: {
    ...createBodyStyle('base', {
      color: colors.text.secondary,
      marginBottom: spacing[6],
      textAlign: 'center',
      lineHeight: getOptimizedLineHeight(typography.fontSize.base) * 1.5,
    }),
  },
  timeInputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  timePickerRow: {
    flexDirection: 'row',
    gap: spacing[2],
    justifyContent: 'center',
    alignItems: 'center',
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
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  wheelPickerContainer: {
    height: 250,
    position: 'relative',
    overflow: 'hidden',
  },
  wheelPickerSelection: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 50,
    marginTop: -25,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: borderRadius.sm,
    zIndex: 1,
    pointerEvents: 'none',
  },
  wheelPickerScrollView: {
    flex: 1,
  },
  wheelPickerContent: {
    paddingVertical: 0,
  },
  wheelPickerItem: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
  },
  wheelPickerItemText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    textAlign: 'center',
  },
  timePickerWrapper: {
    width: '100%',
  },
  dropdownWrapper: {
    position: 'relative',
    zIndex: 1,
  },
  dropdownWrapperOpen: {
    zIndex: 1000,
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    minHeight: 48,
    minWidth: 80,
  },
  dropdownButtonText: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  dropdownArrow: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginLeft: spacing[2],
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.sm,
    marginTop: spacing[1],
    maxHeight: 200,
    zIndex: 1000,
    elevation: 3,
  },
  dropdownScrollView: {
    maxHeight: 200,
    flexGrow: 0,
  },
  dropdownScrollContent: {
    paddingVertical: spacing[1],
  },
  dropdownItem: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  dropdownItemText: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  buttonContainer: {
    padding: spacing[4],
    paddingBottom: spacing[6],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  prevButton: {
    flex: 1,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.sm,
    paddingVertical: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevButtonText: {
    ...createButtonTextStyle('base', {
      color: colors.text.primary,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  nextButton: {
    ...buttonStyles.primary(),
    flex: 1,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing[3],
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonDisabled: {
    backgroundColor: colors.gray[300],
    opacity: 0.6,
  },
  nextButtonText: {
    ...createButtonTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
});
