/**
 * 재사용 가능한 컴포넌트 스타일
 * 특정 컴포넌트에서 사용되는 스타일 패턴
 */

import { ViewStyle, TextStyle, ImageStyle, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../designTokens';
import { createTextStyle } from './textStyles';

/**
 * 드롭다운/셀렉터 스타일
 */
export const dropdownStyles = {
  /**
   * 드롭다운 버튼
   */
  button: (): ViewStyle => ({
    height: 44,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  }),

  /**
   * 드롭다운 버튼 텍스트
   */
  buttonText: (): TextStyle => ({
    ...createTextStyle('sm'),
    color: colors.text.primary,
    textAlignVertical: 'center',
  }),

  /**
   * 드롭다운 플레이스홀더
   */
  placeholder: (): TextStyle => ({
    color: colors.gray[400],
  }),

  /**
   * 드롭다운 리스트
   */
  list: (): ViewStyle => ({
    marginTop: spacing[1],
    maxHeight: 200,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.gray[300],
    overflow: 'hidden',
  }),

  /**
   * 드롭다운 리스트 아이템
   */
  listItem: (): ViewStyle => ({
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  }),

  /**
   * 선택된 드롭다운 리스트 아이템
   */
  listItemSelected: (): ViewStyle => ({
    backgroundColor: colors.primary[50],
  }),

  /**
   * 드롭다운 리스트 아이템 텍스트
   */
  listItemText: (): TextStyle => ({
    ...createTextStyle('sm'),
    color: colors.text.primary,
  }),

  /**
   * 선택된 드롭다운 리스트 아이템 텍스트
   */
  listItemTextSelected: (): TextStyle => ({
    color: colors.primary[600],
    fontWeight: typography.fontWeight.semibold,
  }),
};

/**
 * 체크박스/라디오 버튼 스타일
 */
export const checkboxStyles = {
  /**
   * 체크박스 컨테이너
   */
  container: (): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  }),

  /**
   * 체크박스
   */
  box: (size: number = 20): ViewStyle => ({
    width: size,
    height: size,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  }),

  /**
   * 체크된 체크박스
   */
  boxChecked: (): ViewStyle => ({
    backgroundColor: colors.primary[700],
  }),

  /**
   * 체크마크
   */
  checkmark: (): TextStyle => ({
    color: colors.text.inverse,
    fontSize: 12,
    fontWeight: typography.fontWeight.medium,
  }),

  /**
   * 체크박스 라벨
   */
  label: (): TextStyle => ({
    ...createTextStyle('sm'),
    color: colors.text.primary,
  }),
};

/**
 * 탭 바 스타일
 */
export const tabBarStyles = {
  /**
   * 탭 바 컨테이너
   */
  container: (): ViewStyle => ({
    flexDirection: 'row',
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.base,
    padding: spacing[1],
  }),

  /**
   * 탭 버튼
   */
  tab: (): ViewStyle => ({
    flex: 1,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  }),

  /**
   * 활성 탭 버튼
   */
  tabActive: (): ViewStyle => ({
    backgroundColor: colors.background.primary,
  }),

  /**
   * 탭 텍스트
   */
  tabText: (): TextStyle => ({
    ...createTextStyle('sm'),
    color: colors.text.secondary,
  }),

  /**
   * 활성 탭 텍스트
   */
  tabTextActive: (): TextStyle => ({
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  }),
};

/**
 * 필터 바 스타일
 */
export const filterBarStyles = {
  /**
   * 필터 바 컨테이너
   */
  container: (): ViewStyle => ({
    flexDirection: 'row',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.background.primary,
  }),

  /**
   * 필터 옵션 버튼
   */
  option: (): ViewStyle => ({
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[300],
  }),

  /**
   * 활성 필터 옵션 버튼
   */
  optionActive: (): ViewStyle => ({
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  }),

  /**
   * 필터 옵션 텍스트
   */
  optionText: (): TextStyle => ({
    ...createTextStyle('sm'),
    color: colors.text.primary,
  }),

  /**
   * 활성 필터 옵션 텍스트
   */
  optionTextActive: (): TextStyle => ({
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.medium,
  }),
};

/**
 * 배지/배지 스타일
 */
export const badgeStyles = {
  /**
   * 배지 컨테이너
   */
  container: (): ViewStyle => ({
    alignItems: 'center',
    width: '30%',
    padding: spacing[3],
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
  }),

  /**
   * 배지 아이콘 컨테이너
   */
  iconContainer: (): ViewStyle => ({
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[2],
  }),

  /**
   * 배지 제목
   */
  title: (): TextStyle => ({
    ...createTextStyle('xs'),
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[1],
  }),

  /**
   * 배지 보조 텍스트
   */
  subtitle: (): TextStyle => ({
    ...createTextStyle('xs'),
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[600],
  }),
};

/**
 * 미션 아이템 스타일
 */
export const missionItemStyles = {
  /**
   * 미션 아이템 컨테이너
   */
  container: (): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.base,
    padding: spacing[3],
  }),

  /**
   * 미션 아이콘 컨테이너
   */
  iconContainer: (): ViewStyle => ({
    width: 44,
    height: 44,
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  }),

  /**
   * 미션 정보 컨테이너
   */
  infoContainer: (): ViewStyle => ({
    flex: 1,
  }),

  /**
   * 미션 제목
   */
  title: (): TextStyle => ({
    ...createTextStyle('base'),
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[1],
  }),

  /**
   * 미션 설명
   */
  description: (): TextStyle => ({
    ...createTextStyle('sm'),
    color: colors.text.secondary,
  }),

  /**
   * 완료 배지
   */
  completedBadge: (): ViewStyle => ({
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.green[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing[2],
  }),
};

/**
 * 미션/커뮤니티/투두리스트 등에서 쓰는 상단 탭 스타일 (베이지/브라운 테마)
 * CommunityScreen, TodoListScreen, MissionScreen에서 공통 사용
 */
export const missionTabStyles = {
  container: (): ViewStyle => ({
    flexDirection: 'row',
    backgroundColor: '#F5F5F0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A68B6F',
    paddingVertical: spacing[1],
    paddingHorizontal: 3,
    gap: 2,
  }),
  tab: (): ViewStyle => ({
    flex: 1,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: 'transparent',
  }),
  tabActive: (): ViewStyle => ({
    backgroundColor: '#8B6F47',
  }),
  tabText: (): TextStyle => ({
    ...createTextStyle('sm', {
      color: colors.text.primary,
      fontWeight: typography.fontWeight.medium,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
    }),
  }),
  tabTextActive: (): TextStyle => ({
    ...createTextStyle('sm', {
      color: colors.white,
      fontWeight: typography.fontWeight.medium,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
    }),
  }),
};

/**
 * 로딩 스타일
 */
export const loadingStyles = {
  /**
   * 로딩 컨테이너
   */
  container: (): ViewStyle => ({
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[6],
  }),

  /**
   * 로딩 텍스트
   */
  text: (): TextStyle => ({
    ...createTextStyle('base'),
    color: colors.text.secondary,
    marginTop: spacing[3],
  }),
};

/**
 * 헤더 스타일
 */
export const headerStyles = {
  /**
   * 뒤로가기 버튼 아이콘
   */
  backButtonIcon: (): ImageStyle => ({
    width: 24,
    height: 24,
    tintColor: colors.text.primary,
  }),

  /**
   * 뒤로가기 버튼
   */
  backButton: (): ViewStyle => ({
    padding: spacing[2],
    justifyContent: 'center',
    alignItems: 'center',
  }),
};
