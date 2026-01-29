/**
 * BadgeDetailScreen 스타일
 * 배지 상세 화면의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createTitleStyle, createSecondaryTextStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { buttonStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  backButtonIcon: {
    width: 24,
    height: 24,
    tintColor: colors.text.primary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[20],
  },
  badgeIconContainer: {
    alignItems: 'center',
    marginTop: spacing[2],
    marginBottom: spacing[5],
    position: 'relative',
  },
  badgeIcon: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeIconExpired: {
    backgroundColor: colors.gray[200],
  },
  badgeImage: {
    width: 64,
    height: 64,
  },
  expiredBadge: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: colors.gray[500],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  expiredBadgeText: {
    ...createTextStyle('xs', {
      fontWeight: typography.fontWeight.medium,
      color: colors.white,
    }),
  },
  infoCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[5],
    marginBottom: spacing[4],
  },
  badgeTitle: {
    ...createTitleStyle('xl', {
      textAlign: 'center',
      marginBottom: spacing[2],
    }),
  },
  missionType: {
    ...createSecondaryTextStyle('sm', {
      textAlign: 'center',
      marginBottom: spacing[3],
    }),
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing[4],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  infoLabel: {
    ...createSecondaryTextStyle('base'),
  },
  infoValue: {
    ...createTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.primary,
    }),
  },
  expiredText: {
    ...createTextStyle('base', {
      color: colors.gray[400],
    }),
  },
  remainingDays: {
    ...createTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
      color: colors.primary[600],
    }),
  },
  benefitCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[5],
    marginBottom: spacing[5],
  },
  benefitTitle: {
    ...createTitleStyle('lg', {
      marginBottom: spacing[4],
    }),
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  benefitIcon: {
    ...createTextStyle('base', {
      color: colors.primary[500],
      marginRight: spacing[3],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  benefitText: {
    ...createTextStyle('base', {
      color: colors.text.primary,
    }),
  },
  viewMissionButton: {
    ...buttonStyles.primary(),
    borderRadius: borderRadius.base,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    alignItems: 'center',
    marginTop: spacing[2],
    backgroundColor: colors.primary[500],
  },
  viewMissionButtonText: {
    ...createButtonTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
});
