/**
 * MissionGroupList 스타일
 * 미션 도감 목록 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createTitleStyle, createSecondaryTextStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { buttonStyles, cardStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[20],
  },
  createMissionButton: {
    ...buttonStyles.primary(),
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[4],
    paddingVertical: spacing[2],
    minHeight: 40,
  },
  createMissionIcon: {
    width: 20,
    height: 20,
    tintColor: colors.white,
  },
  createMissionText: {
    ...createButtonTextStyle('base'),
  },
  serverPaginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing[4],
    marginBottom: spacing[2],
    gap: spacing[12],
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  serverPageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[100],
  },
  serverPageButtonDisabled: {
    backgroundColor: colors.gray[100],
  },
  serverPageArrowIcon: {
    width: 16,
    height: 16,
    tintColor: colors.primary[600],
  },
  serverPageArrowIconLeft: {
    transform: [{ rotate: '180deg' }],
  },
  serverPageArrowIconDisabled: {
    tintColor: colors.gray[400],
  },
  serverPageInfo: {
    ...createTitleStyle('base'),
  },
  groupMissionList: {
    marginBottom: spacing[4],
  },
  groupMissionCard: {
    ...cardStyles.base(),
    padding: spacing[3],
    marginBottom: spacing[1],
  },
  groupMissionCardLocked: {
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.base,
    padding: spacing[8],
    marginBottom: spacing[1],
    borderWidth: 2.5,
    borderColor: colors.gray[500],
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.gray[800],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  groupMissionCardSelected: {
    borderColor: colors.primary[500],
    borderWidth: 2,
    backgroundColor: colors.primary[50],
  },
  groupMissionHeader: {
    marginBottom: spacing[2],
  },
  groupMissionInfo: {
    flex: 1,
  },
  groupMissionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
    gap: spacing[1.5],
  },
  groupMissionIcon: {
    width: 20,
    height: 20,
  },
  groupMissionTitle: {
    flex: 1,
    ...createTitleStyle('base'),
  },
  groupMissionTypeBadge: {
    backgroundColor: colors.primary[100],
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  groupMissionTypeText: {
    ...createTextStyle('xs', {
      color: colors.primary[700],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  groupMissionDescription: {
    ...createSecondaryTextStyle('sm'),
  },
  groupMissionContent: {
    marginBottom: spacing[2],
  },
  groupMissionVerificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  groupVerificationIcon: {
    width: 16,
    height: 16,
  },
  groupMissionVerificationText: {
    ...createTextStyle('xs', {
      color: colors.primary[800],
      fontWeight: typography.fontWeight.normal,
    }),
  },
  groupMissionFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing[2],
  },
  groupMissionStats: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  groupStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  groupStatIcon: {
    width: 16,
    height: 16,
  },
  groupStatText: {
    ...createSecondaryTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  groupMissionLockIconCenter: {
    width: 40,
    height: 40,
    tintColor: colors.gray[600],
  },
});
