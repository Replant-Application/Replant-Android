/**
 * OnboardingScreen 스타일
 * 온보딩 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform, Dimensions } from 'react-native';
import { spacing, typography, colors } from '../../utils/designTokens';
import { createTextStyle, getOptimizedLineHeight } from '../../utils/styles/textStyles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: colors.gray[900], // 어두운 배경
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 + spacing[2] : 30 + spacing[2],
    right: spacing[3],
    zIndex: 1000,
    elevation: 10,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  flatList: {
    flex: 1,
    width: '100%',
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[8],
    paddingBottom: spacing[4],
  },
  slideImage: {
    width: '100%',
    maxWidth: SCREEN_WIDTH * 0.95,
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
    paddingTop: spacing[20],
    paddingBottom: spacing[20],
    marginTop: -spacing[12],
  },
  emoji: {
    fontSize: 32,
    marginBottom: spacing[2],
  },
  slideText: {
    ...createTextStyle('lg', {
      fontWeight: typography.fontWeight.medium,
      color: colors.white,
      fontFamily: Platform.select({ ios: undefined, android: typography.fontFamily.regular }),
      textAlign: 'center',
      lineHeight: getOptimizedLineHeight(typography.fontSize.lg) * 1.2,
    }),
  },
  paginationContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 120 : 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[10],
    zIndex: 200,
    elevation: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[400],
  },
  paginationDotActive: {
    backgroundColor: colors.white,
    width: 8,
    height: 8,
  },
  startButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 60,
    left: '5%',
    right: '5%',
    width: '90%',
    maxWidth: SCREEN_WIDTH - spacing[8],
    backgroundColor: colors.primary[600],
    paddingVertical: spacing[4],
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    elevation: 10,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary[600],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  startButtonText: {
    ...createTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
      color: colors.white,
      fontFamily: Platform.select({ ios: undefined, android: typography.fontFamily.regular }),
    }),
  },
  leftTouchArea: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH / 2,
    zIndex: 100,
  },
  rightTouchArea: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH / 2,
    zIndex: 100,
  },
});
