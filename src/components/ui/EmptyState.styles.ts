/**
 * EmptyState 스타일
 * 빈 상태 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography } from '../../utils/designTokens';
import { createTextStyle, createSecondaryTextStyle } from '../../utils/styles/textStyles';
import { emptyStateStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  container: {
    ...emptyStateStyles.container(),
    padding: spacing[8],
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
    width: 40,
    height: 40,
    marginBottom: spacing[4],
  },
  title: {
    ...createTextStyle('base', {
      fontWeight: typography.fontWeight.normal,
      color: colors.text.primary,
      marginBottom: spacing[2],
      textAlign: 'center',
    }),
  },
  description: {
    ...createSecondaryTextStyle('sm', {
      textAlign: 'center',
      marginBottom: spacing[4],
    }),
  },
  actionContainer: {
    marginTop: spacing[2],
  },
});
