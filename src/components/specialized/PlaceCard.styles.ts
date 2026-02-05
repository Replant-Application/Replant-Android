/**
 * PlaceCard 스타일
 * 장소 카드 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, shadows } from '../../utils/designTokens';
import { createTextStyle, createSecondaryTextStyle, createTitleStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { cardStyles, buttonStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  container: {
    ...cardStyles.base(),
    ...shadows.base,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    marginBottom: spacing[2],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  name: {
    flex: 1,
    ...createTitleStyle('lg'),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingIcon: {
    width: 16,
    height: 16,
    marginRight: spacing[1],
  },
  rating: {
    ...createTextStyle('sm', {
      color: colors.warning[600],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  ratingCount: {
    ...createTextStyle('sm', {
      color: colors.text.secondary,
      marginLeft: spacing[1],
    }),
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[1],
  },
  addressIcon: {
    width: 16,
    height: 16,
    marginRight: spacing[1],
  },
  address: {
    flex: 1,
    ...createSecondaryTextStyle('sm'),
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  phoneIcon: {
    width: 16,
    height: 16,
    marginRight: spacing[1],
  },
  phone: {
    ...createSecondaryTextStyle('sm'),
  },
  hoursContainer: {
    marginBottom: spacing[3],
  },
  openStatus: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  open: {
    color: colors.success[600],
  },
  closed: {
    color: colors.error[600],
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  button: {
    flex: 1,
    ...buttonStyles.secondary(),
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    minHeight: 36,
  },
  buttonText: {
    ...createButtonTextStyle('sm', { color: colors.text.primary }),
  },
});
