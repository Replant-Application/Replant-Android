/**
 * OnboardingScreen 스타일
 * 온보딩 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform, Dimensions } from 'react-native';
import { spacing, typography, colors } from '../../utils/designTokens';
import { createTextStyle } from '../../utils/styles/textStyles';

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
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_HEIGHT * 0.85,
    alignSelf: 'center',
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
    borderWidth: 1,
    borderColor: colors.gray[400],
    borderRadius: 999,
    overflow: 'hidden',
  },
  skipButtonBackground: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    minHeight: 20,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    ...createTextStyle('xs', {
      color: colors.gray[700] || '#1a1a1a',
      fontFamily: typography.fontFamily.regular,
      fontWeight: typography.fontWeight.bold,
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
});
