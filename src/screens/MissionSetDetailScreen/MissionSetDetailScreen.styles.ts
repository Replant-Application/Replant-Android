/**
 * MissionSetDetailScreen 스타일
 * 미션세트 상세 화면의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/styles/textStyles';
import { createTextStyle, createTitleStyle, createBodyStyle, createSecondaryTextStyle } from '../../utils/styles/textStyles';
import { cardStyles, emptyStateStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing[4],
  },
  headerCard: {
    ...cardStyles.base(),
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  title: {
    ...createTitleStyle('lg', {
      fontWeight: typography.fontWeight.semibold,
      marginBottom: spacing[2],
    }),
  },
  description: {
    ...createSecondaryTextStyle('base', {
      marginBottom: spacing[3],
      lineHeight: getOptimizedLineHeight(typography.fontSize.base) * 1.4,
    }),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  creator: {
    ...createTextStyle('sm', {
      color: colors.text.tertiary,
    }),
  },
  metaDot: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginHorizontal: spacing[1],
  },
  missionCount: {
    ...createTextStyle('sm', {
      color: colors.text.tertiary,
    }),
  },
  createdAt: {
    ...createSecondaryTextStyle('sm', {
      color: colors.text.tertiary,
    }),
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing[1],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  likeButton: {
    padding: spacing[1],
  },
  likeIcon: {
    width: 20,
    height: 20,
    tintColor: colors.error,
  },
  likeIconActive: {
    tintColor: colors.error,
  },
  likeCount: {
    ...createTextStyle('sm', {
      color: colors.text.tertiary,
    }),
  },
  likeCountActive: {
    color: colors.primary[600],
  },
  missionSection: {
    marginBottom: spacing[4],
  },
  sectionTitle: {
    ...createTitleStyle('lg', {
      marginBottom: spacing[3],
    }),
  },
  missionList: {
    gap: spacing[2],
  },
  missionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  missionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  missionNumberText: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      color: colors.primary[600],
    }),
  },
  missionTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  missionTitle: {
    flex: 1,
    ...createBodyStyle('base'),
  },
  creatorStatusBadge: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    borderRadius: borderRadius.base,
  },
  creatorStatusCompleted: {
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  creatorStatusIncomplete: {
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  creatorStatusText: {
    ...createTextStyle('xs', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  creatorStatusTextCompleted: {
    color: colors.primary[600],
  },
  creatorStatusTextIncomplete: {
    color: colors.text.tertiary,
  },
  emptyMissions: {
    ...emptyStateStyles.container(),
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  emptyText: {
    ...createTextStyle('sm', {
      color: colors.text.tertiary,
    }),
  },
  spacer: {
    height: 120,
  },
});
