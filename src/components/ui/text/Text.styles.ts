/**
 * Text 스타일
 * 전역 Text 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { typography } from '../../../utils/designTokens';

export const styles = StyleSheet.create({
  default: {
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular, // Android는 커스텀 폰트 사용
    }),
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
