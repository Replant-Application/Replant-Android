/**
 * Card 스타일
 * 재사용 가능한 카드 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing } from '../../../utils/designTokens';
import { cardStyles } from '../../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  base: {
    ...cardStyles.base(),
  },

  // Variants
  elevated: {
    // 그림자 제거
  },
  flat: {
    ...cardStyles.base(),
    borderWidth: 1,
    borderColor: colors.border.light,
  },

  // Padding variants
  paddingSm: {
    padding: spacing[3],
  },
  paddingBase: {
    padding: spacing[4],
  },
  paddingLg: {
    padding: spacing[6],
  },
});
