/**
 * EmotionSelector 스타일
 * 감정 선택 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createTitleStyle } from '../../utils/styles/textStyles';

export const styles = StyleSheet.create({
  container: {
    marginVertical: spacing[4],
  },
  title: {
    ...createTitleStyle('lg', {
      marginBottom: spacing[3],
      textAlign: 'center',
    }),
  },
  scrollContent: {
    paddingHorizontal: spacing[2],
  },
  emotionButton: {
    alignItems: 'center',
    padding: spacing[3],
    marginHorizontal: spacing[1],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    minWidth: 80,
  },
  selectedButton: {
    borderColor: colors.primary[500],
    borderWidth: 2,
  },
  emoji: {
    ...createTextStyle('2xl', {
      marginBottom: spacing[1],
    }),
  },
  label: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.secondary,
      textAlign: 'center',
    }),
  },
  selectedLabel: {
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
  },
});
