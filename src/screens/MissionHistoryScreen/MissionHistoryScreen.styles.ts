/**
 * MissionHistoryScreen 스타일
 * 미션 수행 이력 화면의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createTitleStyle, createSecondaryTextStyle } from '../../utils/styles/textStyles';
import { cardStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    marginHorizontal: spacing[4],
    marginVertical: spacing[3],
    padding: spacing[4],
    borderRadius: borderRadius.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...createTextStyle('2xl', {
      fontWeight: typography.fontWeight.medium,
      color: colors.primary[600],
    }),
  },
  statLabel: {
    ...createSecondaryTextStyle('xs', {
      marginTop: spacing[1],
    }),
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing[1],
  },
  listContent: {
    padding: spacing[4],
  },
  missionCard: {
    ...cardStyles.base(),
    marginBottom: spacing[3],
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  statusBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  statusText: {
    ...createTextStyle('xs', {
      color: colors.text.inverse,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  missionType: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
    }),
  },
  missionTitle: {
    ...createTitleStyle('lg', {
      marginBottom: spacing[1],
    }),
  },
  missionDescription: {
    ...createSecondaryTextStyle('sm'),
  },
  missionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing[3],
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  dateText: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
    }),
  },
  rewardInfo: {
    marginTop: spacing[2],
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  rewardText: {
    ...createTextStyle('sm', {
      color: colors.success,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  backButtonText: {
    fontSize: 24,
  },
  filterBarContainer: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
});
