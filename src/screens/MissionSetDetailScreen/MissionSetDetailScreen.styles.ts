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
    alignItems: 'flex-start',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  missionContent: {
    flex: 1,
  },
  missionTitleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    marginBottom: spacing[2],
  },
  missionBadgesBelow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flexWrap: 'wrap',
  },
  missionTitle: {
    ...createBodyStyle('base'),
    marginRight: spacing[1],
  },
  missionTitleText: {
    ...createBodyStyle('base'),
    flex: 1,
    flexShrink: 1,
  },
  missionTypeBadge: {
    paddingVertical: 4,
    paddingHorizontal: spacing[2],
    borderRadius: borderRadius.sm,
    minWidth: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** 공식: 완료(녹색)와 구분되도록 파란색 계열 */
  missionTypeBadgeOfficial: {
    backgroundColor: colors.blue[200],
    borderWidth: 1,
    borderColor: colors.blue[300],
  },
  /** 커스텀: 비활성 느낌 없이 구분되는 보라색 계열 */
  missionTypeBadgeCustom: {
    backgroundColor: colors.purple[200],
    borderWidth: 1,
    borderColor: colors.purple[300],
  },
  missionTypeBadgeText: {
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    flexShrink: 0,
  },
  missionTypeBadgeTextOfficial: {
    color: colors.blue[700],
  },
  missionTypeBadgeTextCustom: {
    color: colors.purple[700],
  },
  creatorStatusBadge: {
    paddingVertical: 4,
    paddingHorizontal: spacing[2],
    borderRadius: borderRadius.sm,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** 미완료 시 텍스트 없이 자리만 유지 (완료 버튼 위치 고정) */
  creatorStatusBadgePlaceholder: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    minWidth: 48,
  },
  creatorStatusCompleted: {
    backgroundColor: colors.primary[200],
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  creatorStatusIncomplete: {
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  creatorStatusText: {
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    flexShrink: 0,
  },
  creatorStatusTextCompleted: {
    color: colors.primary[700],
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
