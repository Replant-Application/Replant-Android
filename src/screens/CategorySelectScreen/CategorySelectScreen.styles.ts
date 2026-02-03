/**
 * CategorySelectScreen 스타일
 * 필수 미션 카테고리 선택 화면
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createButtonTextStyle } from '../../utils/styles/textStyles';

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
  },
  containerTransparent: {
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    textAlign: 'center',
  },
  headerNoPadding: {
    paddingHorizontal: 0,
    paddingLeft: spacing[5],
  },
  /** 캘린더 화면과 동일한 본문 영역 패딩 */
  content: {
    padding: spacing[5],
  },
  subtitle: {
    ...createTextStyle('sm', {
      color: colors.text.secondary,
      textAlign: 'center',
      marginBottom: spacing[4],
    }),
  },
  /** 카테고리 영역 카드 (연한 배경 + 둥근 모서리) */
  categoryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  /** 2열 그리드 */
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  /** 그리드 한 칸 (50% - gap 고려) */
  categoryButtonWrap: {
    width: '47%',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.border.light,
    gap: spacing[2],
  },
  categoryButtonIcon: {
    width: 24,
    height: 24,
  },
  selectAllSection: {
    marginTop: spacing[4],
    paddingTop: spacing[4],
    borderTopWidth: 2,
    borderTopColor: colors.border.medium,
  },
  selectAllButton: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.border.light,
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
  optionSelected: {
    borderColor: colors.gray[400],
    backgroundColor: colors.gray[100],
    borderWidth: 2,
  },
  optionTextSelected: {
    color: colors.text.primary,
  },
  completeButton: {
    alignSelf: 'stretch',
    marginTop: spacing[3],
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
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
    ...createButtonTextStyle('base', { color: colors.white, fontWeight: typography.fontWeight.bold }),
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
