/**
 * 레이아웃 스타일 유틸리티
 * 화면 레이아웃 패턴을 추상화하여 재사용 가능하게 만듦 (토스 방식 참고)
 */

import { ViewStyle } from 'react-native';
import { layout, spacing } from '../designTokens';

/**
 * 화면 컨테이너 기본 스타일
 * Global Gutter를 적용한 화면 컨테이너
 */
export const screenContainer = (): ViewStyle => ({
  flex: 1,
  paddingHorizontal: layout.globalGutter,
});

/**
 * 화면 콘텐츠 영역 스타일
 * Global Gutter를 적용한 콘텐츠 영역
 */
export const screenContent = (): ViewStyle => ({
  paddingHorizontal: layout.globalGutter,
  paddingVertical: layout.screenPadding.vertical,
});

/**
 * 섹션별 컨테이너 스타일
 * 섹션 내부 간격 관리
 */
export const sectionContainer = (): ViewStyle => ({
  marginBottom: spacing[4],
});

/**
 * 화면 컨테이너 (큰 간격)
 * 특수 화면용 큰 간격
 */
export const screenContainerLarge = (): ViewStyle => ({
  flex: 1,
  paddingHorizontal: layout.globalGutterLarge,
});

/**
 * 화면 콘텐츠 영역 (큰 간격)
 * 특수 화면용 큰 간격
 */
export const screenContentLarge = (): ViewStyle => ({
  paddingHorizontal: layout.globalGutterLarge,
  paddingVertical: layout.screenPadding.vertical,
});
