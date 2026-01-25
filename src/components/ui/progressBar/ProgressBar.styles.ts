/**
 * ProgressBar 스타일
 * 진행률 바 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../../utils/designTokens';
import { createTextStyle, createSecondaryTextStyle, createTitleStyle } from '../../../utils/styles/textStyles';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    ...createTitleStyle('sm', {
      color: colors.text.secondary,
      marginBottom: spacing[2],
    }),
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  progressBar: {
    flex: 1,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  progressText: {
    ...createTextStyle('sm', {
      color: colors.text.primary,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  percentageText: {
    ...createTextStyle('sm', {
      color: colors.primary[600],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  remainingText: {
    ...createSecondaryTextStyle('xs', {
      textAlign: 'center',
      marginTop: spacing[2],
    }),
  },
});
