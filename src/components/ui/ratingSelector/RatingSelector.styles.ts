/**
 * RatingSelector 스타일
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../../utils/designTokens';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing[2],
    alignItems: 'center',
  },
  star: {
    fontSize: typography.fontSize['2xl'],
    color: colors.gray[300],
  },
  starActive: {
    color: colors.warning,
  },
});
