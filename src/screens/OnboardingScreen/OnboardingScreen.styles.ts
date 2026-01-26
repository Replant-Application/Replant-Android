/**
 * OnboardingScreen 스타일
 * 온보딩 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform, Dimensions } from 'react-native';
import { spacing, typography, colors } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/styles/textStyles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  transparentFlatList: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 + spacing[2] : 30 + spacing[2],
    right: spacing[3],
    zIndex: 10,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: 'transparent',
  },
  navContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 36,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[6],
  },
  pageIndicatorWrapper: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 12,
    justifyContent: 'center',
  },
  pageIndicator: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    fontWeight: '700',
    color: colors.white,
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  navButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  navButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  navButtonPrev: {
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  navButtonNext: {
    backgroundColor: colors.primary[600],
  },
  navButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    fontWeight: '700',
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  navButtonTextPrev: {
    color: colors.gray[700],
  },
  navButtonTextNext: {
    color: colors.white,
  },
});
