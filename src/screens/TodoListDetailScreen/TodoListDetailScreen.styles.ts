/**
 * TodoListDetailScreen 스타일
 * 투두리스트 상세 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createTitleStyle, createBodyStyle, createSecondaryTextStyle } from '../../utils/styles/textStyles';
import { emptyStateStyles, cardStyles } from '../../utils/styles/commonStyles';
import { loadingStyles } from '../../utils/styles/componentStyles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  archiveButton: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
  },
  archiveButtonText: {
    ...createTextStyle('sm', {
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  loadingContainer: {
    ...loadingStyles.container(),
  },
  emptyContainer: {
    ...emptyStateStyles.container(),
  },
  emptyText: {
    ...emptyStateStyles.text(),
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing[4],
    paddingBottom: 120,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing[5],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  deleteButton: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  deleteButtonText: {
    ...createTextStyle('sm', {
      color: colors.primary[600],
      fontWeight: typography.fontWeight.medium,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
    }),
  },
  infoTitle: {
    ...createTitleStyle('lg', {
      flex: 1,
      marginRight: spacing[2],
      fontWeight: typography.fontWeight.medium,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
    }),
  },
  statusBadge: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary[500],
  },
  statusBadgeCompleted: {
    backgroundColor: '#E8F5E9',
  },
  statusBadgeArchived: {
    backgroundColor: colors.gray[200],
  },
  statusBadgeText: {
    ...createTextStyle('xs', {
      fontWeight: typography.fontWeight.medium,
      color: colors.white,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
    }),
  },
  statusBadgeTextCompleted: {
    color: colors.white,
  },
  statusBadgeTextArchived: {
    color: colors.text.secondary,
  },
  infoDescription: {
    ...createSecondaryTextStyle('sm', {
      marginBottom: spacing[4],
    }),
  },
  progressSection: {
    marginTop: spacing[4],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  progressLabel: {
    ...createTextStyle('sm', {
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.medium,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
    }),
  },
  progressValue: {
    ...createTitleStyle('lg', {
      color: colors.primary[600],
      fontWeight: typography.fontWeight.medium,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
    }),
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.sm,
  },
  progressFillCompleted: {
    backgroundColor: '#4CAF50',
  },
  progressCount: {
    ...createTextStyle('xs', {
      color: colors.text.primary,
      fontWeight: typography.fontWeight.medium,
      marginTop: spacing[2],
      textAlign: 'center',
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
    }),
  },
  createNewButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.base,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    marginTop: spacing[4],
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  createNewButtonText: {
    ...createTextStyle('sm', {
      color: colors.primary[700],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  missionSection: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  missionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.sm,
    marginBottom: spacing[2],
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  missionItemCompleted: {
    opacity: 0.6,
  },
  missionDivider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginLeft: 0,
    marginRight: 0,
    marginVertical: spacing[1],
  },
  missionCheckbox: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.gray[400],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
    marginTop: spacing[0.5],
  },
  missionCheckboxCompleted: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },
  checkIcon: {
    width: 14,
    height: 14,
    tintColor: colors.white,
  },
  missionContent: {
    flex: 1,
    paddingTop: spacing[0.5],
  },
  missionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[0.5],
  },
  missionTitle: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.medium,
      flex: 1,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
    }),
  },
  missionTitleCompleted: {
    color: colors.text.secondary,
    textDecorationLine: 'line-through',
  },
  missionDescription: {
    ...createSecondaryTextStyle('sm', {
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
      fontWeight: typography.fontWeight.medium,
    }),
  },
  missionBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  missionBadge: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    borderRadius: borderRadius.full, // 둥근 모서리로 통일
    borderWidth: 1,
    backgroundColor: colors.white,
  },
  missionBadgeOfficial: {
    borderColor: colors.blue[400],
  },
  missionBadgeCustom: {
    borderColor: colors.purple[400],
  },
  missionBadgeCompleted: {
    borderColor: colors.green[400],
  },
  missionBadgeText: {
    ...createTextStyle('xs', {
      fontWeight: typography.fontWeight.medium,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
    }),
  },
  missionBadgeTextOfficial: {
    color: colors.blue[600],
  },
  missionBadgeTextCustom: {
    color: colors.purple[600],
  },
  missionBadgeTextCompleted: {
    ...createTextStyle('xs', {
      fontWeight: typography.fontWeight.medium,
      color: colors.green[600],
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
    }),
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: spacing[0.5],
    paddingHorizontal: spacing[2],
    borderRadius: borderRadius.sm,
    marginLeft: spacing[2],
  },
  verifiedIcon: {
    ...createTextStyle('xs', {
      color: '#4CAF50',
      marginRight: spacing[0.5],
      fontWeight: typography.fontWeight.bold,
    }),
  },
  verifiedText: {
    ...createTextStyle('xs', {
      color: '#4CAF50',
      fontWeight: typography.fontWeight.medium,
    }),
  },
  emptyMissions: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  emptyMissionsText: {
    ...emptyStateStyles.text(),
  },
});
