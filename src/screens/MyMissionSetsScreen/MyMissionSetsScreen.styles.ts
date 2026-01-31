/**
 * MyMissionSetsScreen 스타일
 * 내 미션세트 관리 화면의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createSecondaryTextStyle } from '../../utils/styles/textStyles';
import { cardStyles } from '../../utils/styles/commonStyles';

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
  createButton: {
    padding: spacing[2],
  },
  createButtonIcon: {
    width: 24,
    height: 24,
  },
  content: {
    flex: 1,
    padding: spacing[4],
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.base,
    padding: spacing[3],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.primary[200],
    gap: spacing[3],
  },
  infoIcon: {
    width: 24,
    height: 24,
  },
  infoText: {
    flex: 1,
    ...createTextStyle('sm', {
      color: colors.primary[700],
    }),
  },
  missionSetList: {
    gap: spacing[2],
  },
  missionSetCard: {
    ...cardStyles.base(),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginRight: spacing[2],
  },
  cardIcon: {
    width: 20,
    height: 20,
  },
  missionSetTitle: {
    flex: 1,
    ...createTextStyle('base', {
      fontWeight: typography.fontWeight.normal,
      color: colors.text.primary,
    }),
  },
  publicBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[0.5],
    borderRadius: borderRadius.base,
  },
  publicBadgeText: {
    ...createTextStyle('xs', {
      color: colors.primary[600],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  privateBadge: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[0.5],
    borderRadius: borderRadius.base,
  },
  privateBadgeText: {
    ...createTextStyle('xs', {
      color: colors.gray[600],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  deleteButton: {
    padding: spacing[1],
  },
  deleteIcon: {
    width: 18,
    height: 18,
    tintColor: colors.error,
  },
  missionSetDescription: {
    ...createSecondaryTextStyle('sm', {
      marginBottom: spacing[2],
    }),
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  createdAtText: {
    ...createSecondaryTextStyle('sm', {
      color: colors.text.tertiary,
    }),
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  statIcon: {
    width: 16,
    height: 16,
  },
  statText: {
    ...createSecondaryTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  likeIcon: {
    width: 20,
    height: 20,
    tintColor: colors.gray[400],
  },
  likeCount: {
    ...createSecondaryTextStyle('xs'),
  },
});
