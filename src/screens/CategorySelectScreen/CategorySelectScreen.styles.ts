/**
 * CategorySelectScreen 스타일
 * 미션 카테고리 선택 화면 (처음부터 재작성)
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

const s = spacing;
const br = borderRadius;

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
    ...createTextStyle('lg', { textAlign: 'center' }),
  },
  headerNoPadding: {
    paddingHorizontal: 0,
    paddingLeft: s[5],
  },
  content: {
    paddingHorizontal: s[4],
    paddingTop: s[5],
    paddingBottom: s[8],
  },
  subtitle: {
    ...createTextStyle('sm', {
      color: colors.text.secondary,
      textAlign: 'center',
      marginBottom: s[4],
    }),
  },
  categoryCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: br.xl,
    padding: s[4],
    marginBottom: s[2],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s[3],
    justifyContent: 'space-between',
  },
  categoryButtonWrap: {
    width: '47%',
    aspectRatio: 1,
  },
  categoryButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: br.lg,
    padding: s[2],
    gap: s[2],
  },
  categoryButtonIcon: {
    width: 36,
    height: 36,
    flexShrink: 0,
  },
  categoryButtonText: {
    ...createTextStyle('sm', {
      color: colors.text.primary,
      fontWeight: typography.fontWeight.medium,
    }),
    fontFamily: Platform.select({ ios: undefined, android: typography.fontFamily.regular }),
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
  selectAllSection: {
    marginTop: s[4],
    paddingTop: s[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.medium,
  },
  selectAllButton: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: s[2],
    paddingHorizontal: s[3],
    borderRadius: br.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  selectAllButtonDisabled: {
    opacity: 0.6,
  },
  completeButton: {
    alignSelf: 'stretch',
    marginTop: s[4],
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
    paddingVertical: s[3],
    paddingHorizontal: s[3],
    borderRadius: br.lg,
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
