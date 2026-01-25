/**
 * CommunityPostDetailScreen 스타일
 * 커뮤니티 게시글 상세 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { createTextStyle, createBodyStyle, createSecondaryTextStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { buttonStyles, inputStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[5],
    paddingBottom: spacing[24],
  },
  headerTitle: {
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  postContainer: {
    marginBottom: spacing[5],
    ...shadows.sm,
    position: 'relative',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
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
    flex: 1,
  },
  authorName: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.normal,
    }),
  },
  categoryBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.base,
  },
  categoryText: {
    ...createTextStyle('xs', {
      color: colors.primary[700],
      fontWeight: typography.fontWeight.normal,
    }),
  },
  postActionsContainer: {
    position: 'absolute',
    bottom: spacing[4],
    right: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    zIndex: 10,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  postActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[0.5],
    paddingHorizontal: spacing[1.5],
    paddingVertical: spacing[0.5],
  },
  postActionIcon: {
    width: 14,
    height: 14,
  },
  postActionText: {
    ...createTextStyle('xs', {
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.normal,
    }),
  },
  postActionTextDelete: {
    color: colors.error,
  },
  date: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
    }),
    marginLeft: 'auto',
  },
  missionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    marginBottom: spacing[2],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    backgroundColor: colors.primary[100],
    borderRadius: borderRadius.base,
    borderWidth: 1.5,
    borderColor: colors.primary[500],
  },
  missionEmojiImage: {
    width: 16,
    height: 16,
  },
  missionTitle: {
    flex: 1,
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.normal,
      color: colors.primary[800],
    }),
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.base,
    gap: 2,
    marginLeft: spacing[2],
  },
  verifiedIcon: {
    ...createTextStyle('xs', {
      color: colors.primary[600],
      fontWeight: typography.fontWeight.normal,
    }),
  },
  verifiedText: {
    ...createTextStyle('xs', {
      color: colors.primary[700],
      fontWeight: typography.fontWeight.normal,
    }),
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.orange[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.base,
    gap: 2,
    marginLeft: spacing[2],
  },
  pendingIcon: {
    fontSize: typography.fontSize.xs,
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  pendingText: {
    ...createTextStyle('xs', {
      color: colors.orange[700],
      fontWeight: typography.fontWeight.normal,
    }),
  },
  completionRateText: {
    ...createTextStyle('xs', {
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.normal,
    }),
    marginLeft: spacing[2],
  },
  title: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.normal,
      marginBottom: spacing[1],
    }),
  },
  contentText: {
    ...createSecondaryTextStyle('sm', {
      marginBottom: spacing[2],
    }),
  },
  imageContainer: {
    marginBottom: spacing[2],
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
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  actionIcon: {
    fontSize: typography.fontSize.base,
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  actionIconImage: {
    width: 20,
    height: 20,
  },
  actionText: {
    ...createTextStyle('sm', {
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.normal,
    }),
  },
  deleteText: {
    color: colors.error,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  headerActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  headerActionIcon: {
    width: 16,
    height: 16,
  },
  headerActionText: {
    ...createTextStyle('xs', {
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.normal,
    }),
  },
  headerActionTextDelete: {
    color: colors.error,
  },
  commentsSection: {
    marginTop: spacing[2],
    ...shadows.sm,
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
    minHeight: 60,
    marginBottom: spacing[1],
    textAlignVertical: 'top',
  },
  editCommentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[2],
  },
  editCommentButton: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.base,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  editCommentButtonSave: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  editCommentButtonText: {
    ...createTextStyle('xs', {
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
    ...shadows.sm,
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
      maxHeight: 40,
      borderWidth: 1,
      borderColor: colors.border.light,
      textAlignVertical: 'center',
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
