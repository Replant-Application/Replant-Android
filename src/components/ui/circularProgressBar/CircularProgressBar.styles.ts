/**
 * CircularProgressBar 스타일
 * 원형 진행률 바 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../../utils/designTokens';
import { createTextStyle, createSecondaryTextStyle } from '../../../utils/styles/textStyles';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  circle: {
    position: 'absolute',
  },
  content: {
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  countText: {
    ...createTextStyle('lg', {
      fontWeight: typography.fontWeight.normal,
      color: colors.text.primary,
    }),
  },
  totalText: {
    ...createTextStyle('base', {
      fontWeight: typography.fontWeight.normal,
      color: colors.text.secondary,
    }),
  },
  labelText: {
    ...createSecondaryTextStyle('xs', {
      marginTop: spacing[1],
    }),
  },
  percentageContainer: {
    marginTop: spacing[1],
  },
  percentageContainerSquare: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.primary[500],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  percentage: {
    ...createTextStyle('xs', {
      fontWeight: typography.fontWeight.bold,
      color: colors.primary[500],
    }),
  },
});
