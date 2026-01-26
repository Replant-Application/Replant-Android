/**
 * 공통 컴포넌트 스타일
 * 버튼, 입력, 모달, 카드 등 재사용 가능한 공통 스타일
 */

import { ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../designTokens';
import { createTextStyle } from './textStyles';

/**
 * 공통 버튼 스타일
 */
export const buttonStyles = {
  /**
   * Primary 버튼 (메인 액션)
   */
  primary: (): ViewStyle => ({
    backgroundColor: colors.primary[700],
    borderRadius: borderRadius.base,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48, // 접근성 2.5: 9mm(≈48dp) 최소 터치 영역
  }),

  /**
   * Secondary 버튼 (보조 액션)
   */
  secondary: (): ViewStyle => ({
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.base,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48, // 접근성 2.5: 9mm(≈48dp) 최소 터치 영역
    borderWidth: 1,
    borderColor: colors.gray[300],
  }),

  /**
   * Disabled 버튼
   */
  disabled: (): ViewStyle => ({
    backgroundColor: colors.gray[300],
    opacity: 0.6,
  }),

  /**
   * Small 버튼 (접근성 2.5: 48dp 최소 터치 영역)
   */
  small: (): ViewStyle => ({
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    minHeight: 48,
  }),

  /**
   * Large 버튼
   */
  large: (): ViewStyle => ({
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
    minHeight: 52,
  }),
};

/**
 * 공통 입력 필드 스타일
 */
export const inputStyles = {
  /**
   * 기본 입력 필드
   */
  base: (): ViewStyle => ({
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    minHeight: 44,
  }),

  /**
   * 에러 상태 입력 필드
   */
  error: (): ViewStyle => ({
    borderColor: colors.red[500],
  }),

  /**
   * 포커스 상태 입력 필드
   */
  focused: (): ViewStyle => ({
    borderColor: colors.primary[500],
    borderWidth: 2,
  }),

  /**
   * Disabled 입력 필드
   */
  disabled: (): ViewStyle => ({
    backgroundColor: colors.gray[100],
    opacity: 0.6,
  }),
};

/**
 * 공통 모달 스타일
 */
export const modalStyles = {
  /**
   * 모달 오버레이
   */
  overlay: (): ViewStyle => ({
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  }),

  /**
   * 모달 오버레이 (하단 시트용)
   */
  overlayBottomSheet: (): ViewStyle => ({
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  }),

  /**
   * 모달 컨텐츠
   */
  content: (): ViewStyle => ({
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    width: '85%',
    maxWidth: 350,
    alignItems: 'center',
  }),

  /**
   * 모달 컨텐츠 (하단 시트용)
   */
  contentBottomSheet: (): ViewStyle => ({
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    maxHeight: '70%',
    paddingBottom: 0,
  }),

  /**
   * 모달 헤더
   */
  header: (): ViewStyle => ({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingTop: spacing[3],
    paddingBottom: spacing[1],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  }),

  /**
   * 모달 제목
   */
  title: (): TextStyle => ({
    ...createTextStyle('lg'),
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  }),

  /**
   * 모달 닫기 버튼
   */
  closeButton: (): TextStyle => ({
    ...createTextStyle('sm'),
    color: colors.primary[500],
  }),
};

/**
 * 공통 카드 스타일
 */
export const cardStyles = {
  /**
   * 기본 카드
   */
  base: (): ViewStyle => ({
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  }),

  /**
   * 강조 카드 (border 강조)
   */
  emphasized: (): ViewStyle => ({
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[4],
    borderWidth: 4,
    borderColor: '#0E0F37',
  }),

  /**
   * 그림자 카드
   */
  shadow: (): ViewStyle => ({
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  }),
};

/**
 * 공통 리스트 아이템 스타일
 */
export const listItemStyles = {
  /**
   * 기본 리스트 아이템
   */
  base: (): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  }),

  /**
   * 선택된 리스트 아이템
   */
  selected: (): ViewStyle => ({
    backgroundColor: colors.primary[50],
  }),

  /**
   * 첫 번째 리스트 아이템
   */
  first: (): ViewStyle => ({
    paddingTop: spacing[2],
  }),

  /**
   * 마지막 리스트 아이템
   */
  last: (): ViewStyle => ({
    borderBottomWidth: 0,
  }),
};

/**
 * 공통 섹션 스타일
 */
export const sectionStyles = {
  /**
   * 섹션 컨테이너
   */
  container: (): ViewStyle => ({
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[4],
    marginBottom: spacing[4],
  }),

  /**
   * 섹션 헤더
   */
  header: (): ViewStyle => ({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  }),

  /**
   * 섹션 제목
   */
  title: (): TextStyle => ({
    ...createTextStyle('lg'),
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  }),

  /**
   * 섹션 카운트
   */
  count: (): TextStyle => ({
    ...createTextStyle('sm'),
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  }),
};

/**
 * 공통 Empty State 스타일
 */
export const emptyStateStyles = {
  /**
   * Empty State 컨테이너
   */
  container: (): ViewStyle => ({
    alignItems: 'center',
    paddingVertical: spacing[6],
    width: '100%',
  }),

  /**
   * Empty State 아이콘
   */
  icon: (): ViewStyle => ({
    width: 48,
    height: 48,
    marginBottom: spacing[3],
    opacity: 0.5,
  }),

  /**
   * Empty State 텍스트
   */
  text: (): TextStyle => ({
    ...createTextStyle('base'),
    color: colors.text.secondary,
    marginBottom: spacing[1],
    textAlign: 'center',
  }),

  /**
   * Empty State 보조 텍스트
   */
  subtext: (): TextStyle => ({
    ...createTextStyle('sm'),
    color: colors.text.tertiary,
    textAlign: 'center',
  }),
};

/**
 * 공통 페이지네이션 스타일
 */
export const paginationStyles = {
  /**
   * 페이지네이션 컨테이너
   */
  container: (): ViewStyle => ({
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing[4],
    gap: spacing[3],
  }),

  /**
   * 페이지 화살표
   */
  arrow: (): ViewStyle => ({
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  }),

  /**
   * Disabled 페이지 화살표
   */
  arrowDisabled: (): ViewStyle => ({
    backgroundColor: colors.gray[100],
  }),

  /**
   * 페이지 인디케이터
   */
  indicator: (): ViewStyle => ({
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[300],
  }),

  /**
   * 활성 페이지 인디케이터
   */
  indicatorActive: (): ViewStyle => ({
    backgroundColor: colors.primary[500],
    width: 20,
  }),
};
