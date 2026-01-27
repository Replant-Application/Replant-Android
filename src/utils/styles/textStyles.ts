/**
 * 텍스트 스타일 유틸리티
 * 공통 텍스트 스타일 패턴을 추상화하여 재사용 가능하게 만듦
 */

import { Platform, TextStyle } from 'react-native';
import { typography, colors } from '../designTokens';

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
 * 텍스트 스타일 생성 함수
 * Platform.select + fontFamily + includeFontPadding + lineHeight 패턴을 자동화
 * 
 * @param fontSize - typography.fontSize의 키 (예: 'sm', 'base', 'lg')
 * @param options - 추가 스타일 옵션
 * @returns TextStyle 객체
 */
export const createTextStyle = (
  fontSize: keyof typeof typography.fontSize,
  options?: Partial<TextStyle>
): TextStyle => {
  const fontSizeValue = typography.fontSize[fontSize];
  
  return {
    fontSize: fontSizeValue,
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular, // Android는 커스텀 폰트 사용
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(fontSizeValue),
    ...options,
  };
};

/**
 * 제목 텍스트 스타일
 */
export const createTitleStyle = (
  fontSize: keyof typeof typography.fontSize = 'lg',
  options?: Partial<TextStyle>
): TextStyle => {
  return createTextStyle(fontSize, {
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    ...options,
  });
};

/**
 * 본문 텍스트 스타일
 */
export const createBodyStyle = (
  fontSize: keyof typeof typography.fontSize = 'base',
  options?: Partial<TextStyle>
): TextStyle => {
  return createTextStyle(fontSize, {
    color: colors.text.primary,
    ...options,
  });
};

/**
 * 보조 텍스트 스타일 (secondary, tertiary)
 */
export const createSecondaryTextStyle = (
  fontSize: keyof typeof typography.fontSize = 'sm',
  options?: Partial<TextStyle>
): TextStyle => {
  return createTextStyle(fontSize, {
    color: colors.text.secondary,
    ...options,
  });
};

/**
 * 에러 텍스트 스타일
 */
export const createErrorTextStyle = (
  fontSize: keyof typeof typography.fontSize = 'sm',
  options?: Partial<TextStyle>
): TextStyle => {
  return createTextStyle(fontSize, {
    color: colors.semantic.fg.error,
    ...options,
  });
};

/**
 * 링크 텍스트 스타일
 */
export const createLinkTextStyle = (
  fontSize: keyof typeof typography.fontSize = 'sm',
  options?: Partial<TextStyle>
): TextStyle => {
  return createTextStyle(fontSize, {
    color: colors.semantic.fg.brand,
    textDecorationLine: 'underline',
    ...options,
  });
};

/**
 * 버튼 텍스트 스타일
 */
export const createButtonTextStyle = (
  fontSize: keyof typeof typography.fontSize = 'base',
  options?: Partial<TextStyle>
): TextStyle => {
  return createTextStyle(fontSize, {
    fontWeight: typography.fontWeight.medium,
    color: colors.semantic.fg.inverse,
    textAlign: 'center',
    ...options,
  });
};
