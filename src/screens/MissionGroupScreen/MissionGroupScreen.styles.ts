/**
 * MissionGroupScreen 스타일
 * 미션 도감 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createTitleStyle, createBodyStyle, createSecondaryTextStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { buttonStyles, inputStyles, modalStyles, cardStyles } from '../../utils/styles/commonStyles';

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
  tabContainer: {
    paddingHorizontal: spacing[3],
    paddingTop: spacing[2],
    paddingBottom: spacing[1],
  },
  tabBar: {
    marginBottom: 0,
  },
  content: {
    flex: 1,
    padding: spacing[4],
    paddingBottom: spacing[20], // 하단 탭바 높이 + 여유 공간
  },
  loadMoreButton: {
    ...buttonStyles.primary(),
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  loadMoreButtonText: {
    ...createButtonTextStyle('base'),
  },
  pageInfo: {
    ...createSecondaryTextStyle('sm', {
      textAlign: 'center',
      marginBottom: spacing[4],
    }),
  },
  sectionTitle: {
    ...createTitleStyle('xl'),
  },
  sectionSubtitle: {
    ...createSecondaryTextStyle('sm', {
      marginTop: spacing[1],
      marginBottom: spacing[4],
    }),
  },
  missionListContainer: {
    marginBottom: spacing[4],
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
    gap: spacing[4],
  },
  logoIcon: {
    width: 24,
    height: 24,
  },
  infoText: {
    flex: 1,
    ...createTextStyle('sm', {
      color: colors.primary[700],
    }),
  },
  missionCard: {
    ...cardStyles.base(),
    backgroundColor: colors.background.primary,
    marginBottom: spacing[1],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  missionCardSelected: {
    borderColor: colors.primary[500],
    borderWidth: 2,
    backgroundColor: colors.primary[50],
  },
  missionHeader: {
    marginBottom: spacing[2],
  },
  missionInfo: {
    flex: 1,
  },
  missionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
    gap: spacing[1.5],
  },
  missionIcon: {
    width: 20,
    height: 20,
  },
  missionTitle: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.normal,
      flex: 1,
    }),
  },
  missionTypeBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.base,
  },
  missionTypeText: {
    ...createTextStyle('xs', {
      color: colors.primary[600],
      fontWeight: typography.fontWeight.normal,
    }),
  },
  missionDescription: {
    ...createSecondaryTextStyle('sm', {
      marginBottom: spacing[2],
      fontWeight: typography.fontWeight.normal,
    }),
  },
  missionContent: {
    marginBottom: spacing[2],
  },
  missionVerificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    backgroundColor: colors.primary[100],
    borderRadius: borderRadius.base,
    borderWidth: 1.5,
    borderColor: colors.primary[500],
    alignSelf: 'flex-start',
    gap: spacing[1],
  },
  verificationIcon: {
    width: 14,
    height: 14,
  },
  missionVerificationText: {
    ...createTextStyle('xs', {
      color: colors.primary[800],
      fontWeight: typography.fontWeight.normal,
    }),
  },
  missionFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing[2],
  },
  missionStats: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  statIcon: {
    width: 16,
    height: 16,
  },
  statText: {
    ...createTextStyle('sm', {
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  detailContainer: {
    marginTop: spacing[4],
  },
  inlineDetailContainer: {
    marginTop: spacing[2],
    marginBottom: spacing[3],
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[400],
    marginLeft: spacing[2],
    paddingLeft: spacing[3],
  },
  inlineDetailCard: {
    ...cardStyles.base(),
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  inlineReviewSection: {
    marginBottom: spacing[2],
  },
  detailCard: {
    ...cardStyles.base(),
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  detailTitle: {
    ...createTitleStyle('lg', {
      marginBottom: spacing[4],
    }),
  },
  detailRow: {
    marginBottom: spacing[3],
  },
  detailLabel: {
    ...createSecondaryTextStyle('sm', {
      marginBottom: spacing[1],
    }),
  },
  detailValue: {
    ...createBodyStyle('base'),
  },
  detailButton: {
    ...buttonStyles.primary(),
    backgroundColor: colors.green[500],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    marginTop: spacing[4],
  },
  detailButtonText: {
    ...createButtonTextStyle('base'),
  },
  reviewSection: {
    marginBottom: spacing[6],
  },
  reviewSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  writeReviewButton: {
    ...buttonStyles.primary(),
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  writeReviewButtonText: {
    ...createButtonTextStyle('sm'),
  },
  reviewHint: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
      marginBottom: spacing[4],
    }),
  },
  loadingContainer: {
    padding: spacing[8],
    alignItems: 'center',
  },
  reviewList: {
    gap: spacing[3],
  },
  reviewCard: {
    ...cardStyles.base(),
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  reviewAvatarText: {
    ...createTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
      color: colors.primary[600],
    }),
  },
  reviewAuthorInfo: {
    flex: 1,
  },
  reviewAuthor: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  reviewDate: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
      marginTop: spacing[1],
    }),
  },
  reviewContent: {
    ...createSecondaryTextStyle('sm'),
  },
  // Modal styles
  modalOverlay: {
    ...modalStyles.overlayBottomSheet(),
  },
  modalContent: {
    ...modalStyles.contentBottomSheet(),
    paddingBottom: spacing[8],
  },
  modalHeader: {
    ...modalStyles.header(),
    marginBottom: spacing[4],
  },
  modalTitle: {
    ...modalStyles.title(),
  },
  modalCloseButton: {
    padding: spacing[2],
  },
  modalCloseText: {
    ...createTitleStyle('xl', {
      color: colors.text.tertiary,
    }),
  },
  modalMissionTitle: {
    ...createBodyStyle('base', {
      color: colors.primary[600],
      fontWeight: typography.fontWeight.medium,
      marginBottom: spacing[4],
    }),
  },
  reviewInput: {
    ...inputStyles.base(),
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    minHeight: 150,
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  cancelButton: {
    ...buttonStyles.secondary(),
    flex: 1,
    paddingVertical: spacing[4],
    borderRadius: borderRadius.lg,
  },
  cancelButtonText: {
    ...createButtonTextStyle('base', {
      color: colors.text.secondary,
    }),
  },
  submitButton: {
    ...buttonStyles.primary(),
    flex: 1,
    paddingVertical: spacing[4],
    borderRadius: borderRadius.lg,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  submitButtonText: {
    ...createButtonTextStyle('base'),
  },
});
