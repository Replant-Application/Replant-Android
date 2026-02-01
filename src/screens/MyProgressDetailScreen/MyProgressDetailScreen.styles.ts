/**
 * MyProgressDetailScreen 스타일
 * 나의 진행률 상세 화면의 모든 스타일 정의
 */

import { StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createTitleStyle, createBodyStyle, createSecondaryTextStyle } from '../../utils/styles/textStyles';
import { emptyStateStyles, paginationStyles } from '../../utils/styles/commonStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
    padding: spacing[4],
    paddingBottom: spacing[20],
  },
  section: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 4,
    borderColor: '#0E0F37',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  sectionTitle: {
    ...createTitleStyle('lg', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  sectionCount: {
    ...createTextStyle('sm', {
      color: colors.primary[600],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  emptyContainer: {
    ...emptyStateStyles.container(),
  },
  emptyIcon: {
    width: 48,
    height: 48,
    marginBottom: spacing[3],
    opacity: 0.5,
  },
  emptyText: {
    ...createBodyStyle('base', {
      color: colors.text.secondary,
      marginBottom: spacing[1],
      textAlign: 'center',
    }),
  },
  emptySubtext: {
    ...createSecondaryTextStyle('sm', {
      textAlign: 'center',
    }),
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  badgeItem: {
    alignItems: 'center',
    width: '30%',
    padding: spacing[3],
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
  },
  badgeIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  badgeIconImage: {
    width: 32,
    height: 32,
  },
  badgeTitle: {
    ...createTextStyle('xs', {
      fontWeight: typography.fontWeight.medium,
      textAlign: 'center',
      marginBottom: spacing[1],
    }),
  },
  badgeRemaining: {
    ...createTextStyle('xs', {
      fontWeight: typography.fontWeight.medium,
      color: colors.primary[600],
    }),
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[4],
    marginTop: spacing[4],
    paddingTop: spacing[4],
  },
  pageButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary[100],
  },
  pageButtonDisabled: {
    backgroundColor: colors.gray[100],
    opacity: 0.7,
  },
  pageButtonText: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      color: colors.primary[600],
    }),
  },
  pageButtonTextDisabled: {
    color: colors.gray[400],
  },
  pageIndicatorText: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.secondary,
    }),
  },
  pageContainer: {
    width: SCREEN_WIDTH - spacing[8],
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionList: {
    gap: spacing[2],
    alignSelf: 'stretch',
  },
  missionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.base,
    padding: spacing[3],
  },
  missionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  missionEmoji: {
    fontSize: 22,
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.medium,
      marginBottom: spacing[1],
    }),
  },
  missionDescription: {
    ...createSecondaryTextStyle('sm'),
  },
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.green[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing[2],
  },
  checkIcon: {
    width: 16,
    height: 16,
    tintColor: colors.green[600],
  },
  paginationContainer: {
    ...paginationStyles.container(),
  },
  pageArrow: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageArrowDisabled: {
    backgroundColor: colors.gray[100],
  },
  pageArrowText: {
    fontSize: typography.fontSize['2xl'],
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  pageArrowTextDisabled: {
    color: colors.gray[400],
  },
  pageIndicators: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  pageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[300],
  },
  pageIndicatorActive: {
    backgroundColor: colors.primary[500],
    width: 20,
  },
  pageInfo: {
    textAlign: 'center',
    ...createSecondaryTextStyle('sm', {
      marginTop: spacing[2],
    }),
  },
});
