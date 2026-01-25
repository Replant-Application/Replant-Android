/**
 * MissionSetDetailScreen 스타일
 * 미션세트 상세 화면의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/styles/textStyles';
import { createTextStyle, createTitleStyle, createBodyStyle, createSecondaryTextStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { buttonStyles, inputStyles, cardStyles, emptyStateStyles } from '../../utils/styles/commonStyles';

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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  stars: {
    fontSize: typography.fontSize.base,
    color: colors.warning,
  },
  ratingText: {
    ...createSecondaryTextStyle('sm'),
  },
  addedCount: {
    ...createTextStyle('sm', {
      color: colors.text.tertiary,
      marginLeft: spacing[1],
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
  reviewSection: {
    marginBottom: spacing[4],
  },
  myReviewCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.primary[200],
    marginBottom: spacing[2],
    minHeight: 60,
    justifyContent: 'center',
  },
  myReviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  myReviewLabel: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      color: colors.primary[600],
    }),
  },
  myReviewStars: {
    fontSize: typography.fontSize.base,
    color: colors.warning,
  },
  myReviewContent: {
    ...createSecondaryTextStyle('sm', {
      lineHeight: getOptimizedLineHeight(typography.fontSize.sm) * 1.4,
    }),
  },
  reviewFormCard: {
    ...cardStyles.base(),
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  reviewFormLabel: {
    ...createSecondaryTextStyle('sm', {
      marginBottom: spacing[2],
    }),
  },
  ratingSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[2],
    marginBottom: spacing[5],
  },
  ratingStar: {
    fontSize: 32,
    color: colors.gray[300],
  },
  ratingStarActive: {
    color: colors.warning,
  },
  reviewInput: {
    ...inputStyles.base(),
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.base,
    fontSize: typography.fontSize.sm,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: spacing[3],
  },
  reviewFormButtons: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  cancelButton: {
    ...buttonStyles.secondary(),
    flex: 1,
    paddingVertical: spacing[2],
  },
  cancelButtonText: {
    ...createButtonTextStyle('sm', {
      color: colors.text.secondary,
    }),
  },
  submitButton: {
    ...buttonStyles.primary(),
    flex: 1,
    paddingVertical: spacing[2],
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  submitButtonText: {
    ...createButtonTextStyle('sm'),
  },
  writeReviewButton: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary[200],
    borderStyle: 'dashed',
  },
  writeReviewButtonText: {
    ...createTextStyle('sm', {
      color: colors.primary[500],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing[4],
    paddingBottom: spacing[6],
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  copyButton: {
    ...buttonStyles.primary(),
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
  },
  copyButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  copyButtonText: {
    ...createButtonTextStyle('lg'),
  },
});
