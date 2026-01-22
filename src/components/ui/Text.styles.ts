/**
 * Text 스타일
 * 전역 Text 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { typography } from '../../utils/designTokens';

export const styles = StyleSheet.create({
  default: {
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
