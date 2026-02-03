/**
 * MissionCard 스타일
 * 미션 카드 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createSecondaryTextStyle } from '../../utils/styles/textStyles';
import { cardStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  container: {
    ...cardStyles.base(),
    borderWidth: 4,
    borderColor: '#0E0F37',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    gap: spacing[1],
    flexShrink: 0,
    flexWrap: 'nowrap',
  },
  categoryEmoji: {
    ...createTextStyle('sm'),
    flexShrink: 0,
  },
  categoryImage: {
    width: 16,
    height: 16,
    flexShrink: 0,
  },
  categoryName: {
    ...createTextStyle('xs', {
      fontWeight: typography.fontWeight.normal,
      color: colors.text.secondary,
      flexShrink: 0,
    }),
  },
  statusWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  statusIcon: {
    width: 16,
    height: 16,
  },
  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 28,
    minWidth: 28,
  },
  pendingText: {
    ...createTextStyle('xs', {
      color: colors.warning,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  pendingVerificationText: {
    ...createTextStyle('xs', {
      color: colors.warning,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.green[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    gap: spacing[1],
  },
  verifiedIcon: {
    ...createTextStyle('xs', {
      color: colors.green[500],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  verifiedText: {
    ...createTextStyle('xs', {
      color: colors.green[500],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.orange[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    gap: spacing[1],
  },
  pendingIcon: {
    ...createTextStyle('xs'),
  },
  inProgressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    gap: spacing[1],
  },
  inProgressIcon: {
    ...createTextStyle('xs', {
      color: colors.gray[500],
    }),
  },
  content: {
    marginBottom: spacing[3],
  },
  title: {
    ...createTextStyle('base', {
      fontWeight: typography.fontWeight.normal,
      color: colors.text.primary,
      marginBottom: spacing[2],
    }),
  },
  description: {
    ...createSecondaryTextStyle('sm'),
  },
  photoContainer: {
    position: 'relative',
    width: '100%',
    marginTop: spacing[2],
  },
  photo: {
    width: '100%',
    height: 80,
    borderRadius: borderRadius.base,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
  },
  imageItem: {
    position: 'relative',
    width: '48%',
    height: 80,
    borderRadius: borderRadius.base,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.base,
  },
  moreImagesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreImagesText: {
    ...createTextStyle('base', {
      color: colors.white,
      fontWeight: typography.fontWeight.bold,
    }),
  },
  deletePhotoButton: {
    position: 'absolute',
    top: spacing[1],
    right: spacing[1],
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deletePhotoIcon: {
    ...createTextStyle('base', {
      color: colors.text.inverse,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[2],
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: spacing[2],
    alignItems: 'center',
  },
  experienceInfo: {
    flex: 1,
  },
  experienceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  sunIcon: {
    width: 16,
    height: 16,
  },
  experienceText: {
    ...createTextStyle('sm', {
      color: '#000000',
      fontWeight: typography.fontWeight.medium,
    }),
  },
  actionButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.xl,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  completeButton: {
    // 기본 actionButton 스타일 사용
  },
  /** 인증 버튼 고대비: 짙은 배경 + 흰색 텍스트 */
  verifyButton: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[700],
  },
  verifyText: {
    color: colors.white,
  },
  uncompleteButton: {
    backgroundColor: colors.gray[300],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    minHeight: 32,
  },
  viewButton: {
    backgroundColor: colors.primary[100],
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  actionText: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  completeText: {
    color: colors.primary[500],
  },
  uncompleteText: {
    ...createTextStyle('xs', {
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  viewText: {
    color: colors.primary[500],
  },
  photoIconButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoIcon: {
    width: 20,
    height: 20,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1.5],
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary[100],
    borderWidth: 1,
    borderColor: colors.primary[300],
    minHeight: 32,
    justifyContent: 'center',
    gap: spacing[1],
  },
  shareIcon: {
    width: 16,
    height: 16,
  },
  shareButtonText: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      color: colors.primary[500],
    }),
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    backgroundColor: colors.green[200],
    borderWidth: 1,
    borderColor: colors.green[500],
    minHeight: 24,
    justifyContent: 'center',
    gap: spacing[1],
  },
  reviewIcon: {
    width: 14,
    height: 14,
  },
  reviewButtonText: {
    ...createTextStyle('xs', {
      fontWeight: typography.fontWeight.medium,
      color: colors.green[600],
      fontSize: 11,
    }),
  },
  disabledButton: {
    backgroundColor: colors.gray[200],
    opacity: 0.6,
  },
  disabledText: {
    ...createTextStyle('sm', {
      color: colors.text.tertiary,
    }),
  },
});
