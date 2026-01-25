/**
 * MissionDetailScreen 스타일
 * 미션 상세 화면의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/styles/textStyles';
import { createTextStyle, createTitleStyle, createBodyStyle, createSecondaryTextStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { buttonStyles, inputStyles, cardStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing[4],
    paddingBottom: spacing[20],
  },
  backButtonIcon: {
    width: 24,
    height: 24,
  },
  // 미션 정보
  missionContainer: {
    ...cardStyles.base(),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: '#D4A574',
    marginBottom: spacing[4],
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  missionTitleContainer: {
    flex: 1,
  },
  missionTitle: {
    ...createTitleStyle('xl', {
      marginBottom: spacing[2],
    }),
  },
  missionMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    alignItems: 'center',
  },
  missionType: {
    ...createTextStyle('sm', {
      color: colors.primary[600],
      backgroundColor: colors.primary[100],
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[1],
      borderRadius: borderRadius.sm,
      overflow: 'hidden',
    }),
  },
  difficultyBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  difficultyText: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  missionExpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: colors.blue[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.base,
  },
  sunIcon: {
    width: 16,
    height: 16,
  },
  missionExp: {
    ...createTextStyle('sm', {
      color: '#000000',
      paddingVertical: spacing[1],
      borderRadius: borderRadius.sm,
      overflow: 'hidden',
    }),
  },
  missionDescription: {
    ...createSecondaryTextStyle('base', {
      marginBottom: spacing[4],
    }),
  },
  missionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...createTitleStyle('lg', {
      marginBottom: spacing[1],
    }),
  },
  statLabel: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
    }),
  },
  verificationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[4],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  verificationLabel: {
    ...createSecondaryTextStyle('sm'),
  },
  verificationValue: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  completeCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    marginTop: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary[500],
    minHeight: 48,
  },
  completeCustomButtonDisabled: {
    opacity: 0.7,
  },
  completeCustomButtonText: {
    ...createButtonTextStyle('base', { color: colors.white }),
  },
  // 리뷰 목록
  sectionTitle: {
    ...createTitleStyle('lg', {
      marginBottom: spacing[3],
    }),
  },
  reviewsSection: {
    marginBottom: spacing[6],
  },
  reviewsList: {
    gap: spacing[3],
  },
  reviewCard: {
    ...cardStyles.base(),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#D4A574',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  reviewAuthorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  reviewAuthorImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  reviewAuthorImagePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewAuthorImageText: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      color: colors.primary[600],
      lineHeight: getOptimizedLineHeight(typography.fontSize.base),
    }),
  },
  reviewAuthor: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  ratingStarsDisplay: {
    flexDirection: 'row',
    marginTop: 2,
  },
  ratingStarDisplay: {
    fontSize: 12,
    color: colors.warning,
  },
  reviewDate: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
    }),
  },
  reviewContent: {
    ...createBodyStyle('base'),
  },
  loadMoreButton: {
    paddingVertical: spacing[3],
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
  },
  loadMoreText: {
    ...createTextStyle('sm', {
      color: colors.primary[600],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  // 뱃지 없음 안내 섹션
  noBadgeSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    marginBottom: spacing[4],
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D4A574',
  },
  noBadgeIcon: {
    width: 40,
    height: 40,
    marginBottom: spacing[2],
  },
  noBadgeTitle: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.medium,
      marginBottom: spacing[2],
    }),
  },
  noBadgeDescription: {
    ...createSecondaryTextStyle('sm', {
      textAlign: 'center',
    }),
  },
  // 이미 후기 작성 완료 섹션
  alreadyWrittenSection: {
    backgroundColor: 'rgba(232, 245, 233, 0.95)',
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[4],
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  alreadyWrittenIcon: {
    fontSize: 32,
    marginBottom: spacing[2],
  },
  alreadyWrittenText: {
    ...createSecondaryTextStyle('sm', {
      textAlign: 'center',
    }),
  },
  // 후기 작성 섹션 스타일
  writeReviewSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 2,
    borderColor: '#D4A574',
  },
  writeReviewHint: {
    ...createTextStyle('sm', {
      color: colors.primary[600],
      marginBottom: spacing[3],
    }),
  },
  // 별점 선택 스타일
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
    gap: spacing[2],
  },
  ratingLabel: {
    ...createSecondaryTextStyle('sm'),
  },
  starsContainer: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  starButton: {
    padding: spacing[1],
  },
  starText: {
    fontSize: 28,
    color: colors.warning,
  },
  ratingValue: {
    ...createSecondaryTextStyle('sm', {
      marginLeft: spacing[2],
    }),
  },
  reviewInput: {
    ...inputStyles.base(),
    backgroundColor: colors.background.secondary,
    minHeight: 100,
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  submitReviewButton: {
    ...buttonStyles.primary(),
    paddingVertical: spacing[3],
  },
  submitReviewButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  submitReviewButtonText: {
    ...createButtonTextStyle('base'),
  },
});
