/**
 * ErrorBoundary 스타일
 * 에러 경계 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../../utils/designTokens';
import { createTextStyle, createTitleStyle, createSecondaryTextStyle, createButtonTextStyle } from '../../../utils/styles/textStyles';
import { buttonStyles } from '../../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
    backgroundColor: colors.background.secondary,
  },
  icon: {
    fontSize: typography.fontSize['4xl'],
    marginBottom: spacing[4],
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  iconImage: {
    width: 64,
    height: 64,
    marginBottom: spacing[4],
  },
  title: {
    ...createTitleStyle('xl', {
      marginBottom: spacing[2],
      textAlign: 'center',
    }),
  },
  message: {
    ...createSecondaryTextStyle('base', {
      textAlign: 'center',
      marginBottom: spacing[6],
    }),
  },
  retryButton: {
    ...buttonStyles.primary(),
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
  },
  retryText: {
    ...createButtonTextStyle('base'),
  },
});
