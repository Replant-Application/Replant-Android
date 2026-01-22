/**
 * 전역 Text 스타일 설정
 * Neo-Regular 폰트를 전역적으로 적용하고 여백 문제를 해결
 */

import { Platform, TextStyle } from 'react-native';
import { typography } from './designTokens';

/**
 * 기본 Text 스타일 (Neo-Regular 폰트 적용, 여백 최적화)
 * 모든 Text 컴포넌트에서 사용할 기본 스타일
 */
export const getDefaultTextStyle = (): TextStyle => ({
  fontFamily: Platform.select({
    ios: undefined, // iOS는 기본 시스템 폰트 사용
    android: typography.fontFamily.regular, // Android는 커스텀 폰트 사용
  }),
  includeFontPadding: false, // Android 여백 문제 해결
  textAlignVertical: 'center', // Android 수직 정렬
});

/**
 * TextInput용 기본 스타일 (includeFontPadding: false 포함)
 */
export const getDefaultTextInputStyle = (): TextStyle => ({
  ...getDefaultTextStyle(),
  includeFontPadding: false,
});

/**
 * 폰트 크기에 따른 최적화된 lineHeight 계산
 * 폰트 적용 시 여백 문제를 해결하기 위한 헬퍼 함수
 */
export const getOptimizedLineHeight = (fontSize: number): number => {
  // Neo-Regular 폰트 특성에 맞춘 lineHeight 계산
  // 기본적으로 fontSize의 1.4배 정도가 적절하지만, 여백을 줄이기 위해 조정
  return Math.round(fontSize * 1.35);
};

/**
 * 폰트 크기에 따른 최적화된 paddingVertical 계산
 */
export const getOptimizedPaddingVertical = (fontSize: number): number => {
  // 폰트 크기에 비례하여 최소한의 padding만 적용
  if (fontSize <= 12) return 2;
  if (fontSize <= 14) return 3;
  if (fontSize <= 16) return 4;
  if (fontSize <= 18) return 5;
  if (fontSize <= 20) return 6;
  return Math.round(fontSize * 0.3);
};

/**
 * Text 스타일에 Neo-Regular 폰트와 여백 최적화를 자동으로 적용하는 헬퍼 함수
 * 기존 스타일에 fontFamily, includeFontPadding, lineHeight를 추가
 */
export const applyTextStyle = (style: any, fontSize?: number): TextStyle => {
  const baseStyle: TextStyle = {
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular, // Android는 커스텀 폰트 사용
    }),
    includeFontPadding: false,
  };

  // fontSize가 있으면 lineHeight도 자동 계산
  if (fontSize) {
    baseStyle.lineHeight = getOptimizedLineHeight(fontSize);
  } else if (style?.fontSize) {
    baseStyle.lineHeight = getOptimizedLineHeight(style.fontSize);
  }

  return {
    ...style,
    ...baseStyle,
  };
};

