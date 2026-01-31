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
    ...createTitleStyle('xl', {
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
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing[3],
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
    tintColor: colors.gray[400],
  },
  likeIconActive: {
    tintColor: colors.error[500],
  },
  likeCount: {
    ...createTextStyle('sm', {
      color: colors.text.tertiary,
    }),
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
  missionTitle: {
    flex: 1,
    ...createBodyStyle('base'),
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
