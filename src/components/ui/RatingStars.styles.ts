/**
 * RatingStars 스타일
 */

import { StyleSheet } from 'react-native';
import { colors } from '../../utils/designTokens';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    fontSize: 16,
    color: colors.primary[500],
  },
});
