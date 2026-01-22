/**
 * OnboardingScreen 스타일
 * 온보딩 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform, Dimensions } from 'react-native';
import { spacing, typography, colors } from '../../utils/designTokens';
import { createTextStyle, createButtonTextStyle } from '../../utils/styles/textStyles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: colors.white,
  },
  transparentFlatList: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : 30,
    right: spacing[6],
    zIndex: 10,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    minHeight: 44, // 최소 터치 영역 확보 (iOS 가이드라인: 44x44)
    minWidth: 44, // 최소 너비 확보 (X 기호용)
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    ...createTextStyle('2xl', {
      color: colors.gray[900] || '#1a1a1a', // 진한 색상으로 변경
      fontWeight: typography.fontWeight.bold,
    }),
  },
  startButtonText: {
    ...createButtonTextStyle('sm', {
      color: colors.white,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: 'transparent',
  },
  paginationWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? spacing[12] + 8 : spacing[8],
    left: 0,
    right: 0,
    zIndex: 10,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[4],
    gap: spacing[2],
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[600],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
});
