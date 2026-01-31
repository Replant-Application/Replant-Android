/**
 * MissionSetList 스타일
 * 미션세트 목록 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../../utils/designTokens';
import { createTextStyle, createTitleStyle, createSecondaryTextStyle } from '../../../utils/styles/textStyles';
import { cardStyles } from '../../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  filterContainer: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
    backgroundColor: colors.background.primary,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: spacing[2],
    tintColor: colors.text.tertiary,
  },
  searchInput: {
    flex: 1,
    ...createTextStyle('base', {
      color: colors.text.primary,
    }),
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: {
    width: 20,
    height: 20,
    tintColor: colors.text.secondary,
  },
  content: {
    flex: 1,
  },
  missionSetList: {
    padding: spacing[4],
    gap: spacing[3],
  },
  missionSetCard: {
    ...cardStyles.shadow(),
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  missionSetCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
    gap: spacing[2],
  },
  missionSetTitle: {
    flex: 1,
    ...createTitleStyle('lg'),
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[1.5],
    paddingVertical: spacing[0.5],
  },
  deleteIcon: {
    width: 14,
    height: 14,
  },
  deleteText: {
    ...createTextStyle('xs', {
      color: colors.error,
      fontWeight: typography.fontWeight.normal,
    }),
  },
  missionSetDescription: {
    ...createSecondaryTextStyle('base', {
      marginBottom: spacing[3],
    }),
  },
  missionSetMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  metaText: {
    ...createSecondaryTextStyle('sm', {
      color: colors.text.tertiary,
    }),
  },
  metaDot: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginHorizontal: spacing[2],
  },
  missionSetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[2],
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
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
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  likeCountActive: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.normal,
  },
});
