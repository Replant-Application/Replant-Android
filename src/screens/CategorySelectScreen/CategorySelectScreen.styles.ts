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
  list: {
    gap: spacing[3],
  },
  // 일상·성장·운동·학습·건강·관계·모두 선택 공통 버튼 스타일
  categoryButton: {
    alignSelf: 'stretch',
    backgroundColor: colors.white,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
  },
  selectAllButtonMargin: {
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  selectAllButtonDisabled: {
    opacity: 0.6,
  },
  categoryButtonText: {
    ...createTextStyle('base', {
      color: colors.text.primary,
      fontWeight: typography.fontWeight.medium,
    }),
    fontFamily: Platform.select({
      ios: undefined,
      android: typography.fontFamily.regular,
    }),
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
  optionSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  optionTextSelected: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.semibold,
  },
  completeButton: {
    alignSelf: 'stretch',
    marginTop: spacing[3],
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  completeButtonDisabled: {
    backgroundColor: colors.border.light,
    borderColor: colors.border.light,
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
