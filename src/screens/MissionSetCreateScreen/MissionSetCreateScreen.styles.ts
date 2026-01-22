/**
 * MissionSetCreateScreen 스타일
 * 미션세트 생성 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { createTextStyle, createBodyStyle, createSecondaryTextStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { buttonStyles, inputStyles, emptyStateStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing[4],
  },
  section: {
    marginBottom: spacing[5],
  },
  sectionTitle: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.medium,
      marginBottom: spacing[2],
    }),
  },
  sectionHint: {
    ...createTextStyle('sm', {
      color: colors.text.tertiary,
      marginBottom: spacing[3],
    }),
  },
  textInput: {
    ...inputStyles.base(),
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
  },
  textArea: {
    height: 100,
    paddingTop: spacing[3],
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  switchDescription: {
    ...createSecondaryTextStyle('sm', {
      marginTop: spacing[1],
    }),
  },
  missionList: {
    gap: spacing[2],
  },
  missionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  missionItemSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.base,
    borderWidth: 2,
    borderColor: colors.gray[300],
    marginRight: spacing[3],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[500],
  },
  checkmark: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  missionTitle: {
    flex: 1,
    ...createBodyStyle('base'),
  },
  missionTitleSelected: {
    color: colors.primary[700],
    fontWeight: typography.fontWeight.medium,
  },
  emptyMissions: {
    ...emptyStateStyles.container(),
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  emptyText: {
    ...createSecondaryTextStyle('sm', {
      textAlign: 'center',
      lineHeight: getOptimizedLineHeight(typography.fontSize.sm) * 1.5,
    }),
  },
  buttonContainer: {
    padding: spacing[4],
    paddingBottom: spacing[6],
    backgroundColor: 'transparent',
  },
  createButton: {
    ...buttonStyles.primary(),
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
  },
  createButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  createButtonText: {
    ...createButtonTextStyle('lg'),
  },
});
