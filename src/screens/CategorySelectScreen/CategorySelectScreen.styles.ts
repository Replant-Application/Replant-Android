/**
 * CategorySelectScreen 스타일
 * 필수 미션 카테고리 선택 화면
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createTitleStyle, createButtonTextStyle } from '../../utils/styles/textStyles';

const CATEGORY_LABELS: Record<string, string> = {
  DAILY_LIFE: '일상',
  GROWTH: '성장',
  EXERCISE: '운동',
  STUDY: '학습',
  HEALTH: '건강',
  RELATIONSHIP: '관계',
};

export const CATEGORY_OPTIONS = [
  'DAILY_LIFE',
  'GROWTH',
  'EXERCISE',
  'STUDY',
  'HEALTH',
  'RELATIONSHIP',
] as const;

export const getCategoryLabel = (key: string) => CATEGORY_LABELS[key] || key;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing[4],
    paddingTop: spacing[16],
  },
  title: {
    ...createTitleStyle('lg', {
      color: colors.text.primary,
      textAlign: 'center',
      marginBottom: spacing[2],
    }),
  },
  subtitle: {
    ...createTextStyle('sm', {
      color: colors.text.secondary,
      textAlign: 'center',
      marginBottom: spacing[4],
    }),
  },
  selectAllButton: {
    alignSelf: 'stretch',
    backgroundColor: colors.white,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    marginTop: spacing[4],
    marginBottom: spacing[4],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
  },
  selectAllButtonDisabled: {
    opacity: 0.6,
  },
  selectAllButtonText: {
    ...createTextStyle('base', {
      color: colors.primary[600],
      fontWeight: typography.fontWeight.medium,
    }),
    fontFamily: Platform.select({
      ios: undefined,
      android: typography.fontFamily.regular,
    }),
  },
  list: {
    gap: spacing[3],
  },
  option: {
    backgroundColor: colors.white,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
  },
  optionSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  optionText: {
    ...createTextStyle('base', {
      color: colors.text.primary,
      fontWeight: typography.fontWeight.medium,
    }),
    fontFamily: Platform.select({
      ios: undefined,
      android: typography.fontFamily.regular,
    }),
  },
  optionTextSelected: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.semibold,
  },
  completeButton: {
    marginTop: spacing[6],
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[4],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  completeButtonDisabled: {
    backgroundColor: colors.border.light,
    opacity: 0.7,
  },
  completeButtonText: {
    ...createButtonTextStyle('base', { color: colors.white }),
    fontFamily: Platform.select({
      ios: undefined,
      android: typography.fontFamily.regular,
    }),
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
