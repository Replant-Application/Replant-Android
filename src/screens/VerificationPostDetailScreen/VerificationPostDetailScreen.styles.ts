/**
 * VerificationPostDetailScreen 스타일
 * 인증글 상세 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createBodyStyle, createSecondaryTextStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { buttonStyles, inputStyles, cardStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[24],
  },
  header: {
    backgroundColor: colors.background.primary,
    paddingTop: spacing[16],
    paddingBottom: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: spacing[1],
  },
  backButtonIcon: {
    width: 20,
    height: 20,
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  headerRight: {
    width: 28,
  },
  postContainer: {
    ...cardStyles.base(),
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[3],
    marginBottom: spacing[2],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  authorAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
  },
  authorAvatarText: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.normal,
      color: colors.white,
    }),
  },
  authorNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
  },
  authorName: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.semibold,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
    }),
  },
  missionTypeBadge: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
      backgroundColor: colors.primary[100],
      paddingHorizontal: spacing[1.5],
      paddingVertical: 2,
      borderRadius: borderRadius.base,
    }),
  },
  date: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
      fontWeight: typography.fontWeight.medium,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
    }),
  },
  missionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    marginBottom: spacing[3],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    backgroundColor: colors.primary[100],
    borderRadius: borderRadius.base,
    borderWidth: 1.5,
    borderColor: colors.primary[500],
  },
  missionEmoji: {
    fontSize: typography.fontSize.base,
  },
  missionTitle: {
    flex: 1,
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.normal,
      color: colors.primary[800],
    }),
  },
  approvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.base,
    gap: 2,
  },
  rejectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.red[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.base,
    gap: 2,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.orange[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.base,
    gap: 2,
  },
  badgeIcon: {
    fontSize: typography.fontSize.xs,
  },
  approvedText: {
    ...createTextStyle('xs', {
      color: colors.primary[700],
      fontWeight: typography.fontWeight.normal,
    }),
  },
  rejectedText: {
    ...createTextStyle('xs', {
      color: colors.red[700],
      fontWeight: typography.fontWeight.normal,
    }),
  },
  pendingText: {
    ...createTextStyle('xs', {
      color: colors.orange[700],
      fontWeight: typography.fontWeight.normal,
    }),
  },
  contentText: {
    ...createSecondaryTextStyle('sm', {
      lineHeight: 18,
      marginBottom: spacing[3],
    }),
  },
  imageContainer: {
    marginBottom: spacing[3],
    gap: spacing[2],
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.base,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[4],
    paddingTop: spacing[3],
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.base,
    backgroundColor: colors.background.secondary,
  },
  voteButtonActive: {
    backgroundColor: colors.primary[100],
  },
  voteIcon: {
    fontSize: typography.fontSize.base,
  },
  voteIconImage: {
    width: 20,
    height: 20,
  },
  voteText: {
    ...createTextStyle('sm', {
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.normal,
    }),
  },
  voteTextActive: {
    color: colors.primary[700],
    fontWeight: typography.fontWeight.medium,
  },
  voteButtonDisabled: {
    opacity: 0.5,
  },
  voteIconDisabled: {
    opacity: 0.5,
  },
  voteTextDisabled: {
    color: colors.text.tertiary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  actionIcon: {
    fontSize: typography.fontSize.base,
  },
  actionIconImage: {
    width: 20,
    height: 20,
  },
  actionText: {
    ...createTextStyle('sm', {
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.semibold,
    }),
  },
  deleteText: {
    color: colors.error,
    fontWeight: typography.fontWeight.semibold,
  },
  commentsSection: {
    marginTop: spacing[2],
  },
  commentsTitle: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.normal,
      marginBottom: spacing[2],
    }),
  },
  commentsList: {
    gap: spacing[1],
  },
  editCommentContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[2],
    marginBottom: spacing[1],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  editCommentInput: {
    ...inputStyles.base(),
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.base,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    minHeight: 60,
    maxHeight: 100,
    marginBottom: spacing[3],
    fontFamily: Platform.select({ ios: undefined, android: typography.fontFamily.regular }),
    includeFontPadding: false,
  },
  editCommentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[3],
  },
  editCommentButton: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    minHeight: 32,
    borderRadius: borderRadius.base,
    backgroundColor: colors.gray[200],
    borderWidth: 1,
    borderColor: colors.gray[400],
  },
  editCommentButtonSave: {
    backgroundColor: colors.primary[600],
    borderWidth: 1,
    borderColor: colors.primary[700],
  },
  editCommentButtonText: {
    ...createTextStyle('sm', {
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.normal,
    }),
  },
  editCommentButtonTextSave: {
    color: colors.white,
    fontWeight: typography.fontWeight.normal,
  },
  replyEditContainer: {
    marginLeft: spacing[4],
  },
  commentInputWrapper: {
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.primary[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  replyingToText: {
    ...createTextStyle('xs', {
      color: colors.primary[700],
      fontWeight: typography.fontWeight.normal,
    }),
  },
  cancelReplyButton: {
    padding: spacing[1],
  },
  cancelReplyText: {
    ...createTextStyle('sm', {
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.normal,
    }),
  },
  commentInputContainer: {
    flexDirection: 'row',
    padding: spacing[3],
    gap: spacing[2],
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.base,
    padding: spacing[2],
    ...createTextStyle('sm', {
      color: colors.text.primary,
      maxHeight: 80,
      borderWidth: 1,
      borderColor: colors.border.light,
    }),
  },
  submitButton: {
    ...buttonStyles.primary(),
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    minHeight: 36,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[200],
  },
  submitButtonText: {
    ...createButtonTextStyle('sm'),
  },
});
