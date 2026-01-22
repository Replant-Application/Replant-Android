/**
 * SectionTitle 스타일
 * 섹션 제목 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography } from '../../utils/designTokens';
import { createTextStyle } from '../../utils/styles/textStyles';

export const styles = StyleSheet.create({
  title: {
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  sm: {
    ...createTextStyle('sm'),
  },
  base: {
    ...createTextStyle('base'),
  },
  lg: {
    ...createTextStyle('lg'),
  },
  xl: {
    ...createTextStyle('xl'),
  },
});
