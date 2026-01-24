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
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
  },
  skipButtonText: {
    ...createTextStyle('sm', {
      color: '#000000',
      fontFamily: typography.fontFamily.bold,
      fontWeight: '800',
      textShadowColor: 'rgba(255,255,255,0.95)',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 4,
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
