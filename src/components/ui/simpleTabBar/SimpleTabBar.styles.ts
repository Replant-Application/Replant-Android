/**
 * SimpleTabBar 스타일
 * 간단한 탭 바 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { spacing, typography, borderRadius, shadows } from '../../../utils/designTokens';
import { createTextStyle } from '../../../utils/styles/textStyles';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E7', // 책 페이지와 같은 크림색 배경
    borderRadius: borderRadius.base,
    padding: spacing[1],
    marginVertical: spacing[2],
    borderWidth: 2,
    borderColor: '#D4A574', // 책 테두리 색상
    ...shadows.sm,
    shadowColor: '#8B6F47',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderRadius: borderRadius.base,
    marginHorizontal: spacing[0.5],
  },
  tabActive: {
    backgroundColor: '#8B6F47', // 활성 탭 배경색 (책 등 색상)
    ...shadows.sm,
    shadowColor: '#8B6F47',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      color: '#8B6F47', // 비활성 탭 텍스트 색상
      letterSpacing: 0.3,
    }),
  },
  tabTextActive: {
    ...createTextStyle('sm', {
      color: '#FFF8E7', // 활성 탭 텍스트 색상 (크림색)
      fontWeight: typography.fontWeight.medium,
      letterSpacing: 0.3,
    }),
  },
  underline: {
    display: 'none', // 언더라인 제거 (배경색으로 구분)
  },
});
