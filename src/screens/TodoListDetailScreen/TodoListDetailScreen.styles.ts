/**
 * TodoListDetailScreen 스타일
 * 투두리스트 상세 화면의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
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
    ...cardStyles.base(),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 2,
    borderColor: '#D4A574',
    marginBottom: spacing[4],
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  infoTitle: {
    ...createTitleStyle('lg', {
      flex: 1,
      marginRight: spacing[2],
    }),
  },
  statusBadge: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.base,
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
    marginTop: spacing[2],
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
    }),
  },
  progressValue: {
    ...createTitleStyle('lg', {
      color: colors.primary[600],
    }),
  },
  progressBar: {
    height: 12,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.full,
  },
  progressFillCompleted: {
    backgroundColor: '#4CAF50',
  },
  progressCount: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
      marginTop: spacing[1.5],
      textAlign: 'center',
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
    borderRadius: borderRadius.base,
    padding: spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  missionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[3],
  },
  missionItemCompleted: {
    opacity: 0.6,
  },
  missionDivider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginLeft: spacing[11],
    marginRight: spacing[3],
  },
  missionCheckbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.base,
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
  missionCheckboxRequired: {
    borderColor: colors.primary[500],
    borderWidth: 2,
  },
  checkIcon: {
    width: 16,
    height: 16,
    tintColor: colors.white,
  },
  requiredIcon: {
    width: 14,
    height: 14,
    tintColor: colors.primary[500],
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
    }),
  },
  requiredBadge: {
    ...createTextStyle('xs', {
      fontWeight: typography.fontWeight.medium,
      color: colors.primary[600],
      marginLeft: spacing[2],
    }),
  },
  missionTitleCompleted: {
    color: colors.text.secondary,
    textDecorationLine: 'line-through',
  },
  missionDescription: {
    ...createSecondaryTextStyle('sm'),
  },
  emptyMissions: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  emptyMissionsText: {
    ...emptyStateStyles.text(),
  },
});
