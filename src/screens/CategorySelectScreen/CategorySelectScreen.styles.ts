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
  scrollView: {
    flex: 1,
  },
  headerTitle: {
    ...createTextStyle('lg', {
      textAlign: 'center',
    }),
  },
  headerNoPadding: {
    paddingHorizontal: 0,
    paddingLeft: spacing[5],
  },
  /** 본문 영역: 좌우 여백 늘려 가운데 콘텐츠 너비 축소, 하단 여백으로 밑 버튼이 잘 보이도록 */
  content: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[5],
    paddingBottom: spacing[8],
  },
  subtitle: {
    ...createTextStyle('sm', {
      color: colors.text.secondary,
      textAlign: 'center',
      marginBottom: spacing[3],
    }),
  },
  /** 카테고리 영역 카드 - 중간 간격 줄임 */
  categoryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    marginBottom: spacing[1],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  /** 2열 그리드 - 행/열 간격 줄여서 중간 덜 벌어지게 */
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[4],
    justifyContent: 'space-between',
  },
  /** 그리드 한 칸: 둥근 정사각형, 높이 더 낮춤 (가로 42%) */
  categoryButtonWrap: {
    width: '42%',
    aspectRatio: 1,
  },
  /** 둥근모서리 정사각형 버튼 */
  categoryButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    gap: spacing[2],
  },
  /** 아이콘 */
  categoryButtonIcon: {
    width: 40,
    height: 40,
    flexShrink: 0,
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
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.xl,
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
    backgroundColor: colors.primary[100],
    borderWidth: 2,
    borderColor: colors.primary[400],
  },
  optionTextSelected: {
    color: colors.primary[700],
    fontWeight: typography.fontWeight.semibold,
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
    ...createButtonTextStyle('base', {
      color: colors.white,
      fontWeight: typography.fontWeight.bold,
    }),
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
