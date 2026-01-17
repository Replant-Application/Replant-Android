import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, Platform, Image, Alert } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { CommunityComment } from '../../types';
import { formatTimeAgo } from '../../utils/dateUtils';

interface CommentCardProps {
  comment: CommunityComment;
  onEdit?: (comment: CommunityComment) => void;
  onDelete?: (commentId: string) => void;
  onReply?: (comment: CommunityComment) => void;
  onHide?: (commentId: string) => void;
  isAuthor?: boolean;
  isReply?: boolean;
  style?: ViewStyle;
}

const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  onEdit,
  onDelete,
  onReply,
  onHide,
  isAuthor = false,
  isReply = false,
  style
}) => {
  if (!comment) return null;

  const handleHide = () => {
    Alert.alert(
      '댓글 숨기기',
      '이 댓글을 숨기시겠습니까? 숨긴 댓글은 목록에서 보이지 않습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '숨기기',
          onPress: () => onHide?.(comment.comment_id)
        }
      ]
    );
  };

  // formatDate는 formatTimeAgo의 longFormat 버전 사용

  return (
    <View style={[styles.container, isReply && styles.replyContainer, style]}>
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{comment.author_nickname}</Text>
          {isAuthor && (
            <View style={styles.authorBadge}>
              <Text style={styles.authorBadgeText}>작성자</Text>
            </View>
          )}
        </View>
        <Text style={styles.date}>{formatTimeAgo(comment.created_at, { longFormat: true })}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.text}>{comment.content}</Text>
        {comment.updated_at && comment.updated_at !== comment.created_at && (
          <Text style={styles.editedText}>(수정됨)</Text>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.actions}>
          {/* 답글 버튼 - 대댓글이 아닌 경우에만 표시 */}
          {onReply && !isReply && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onReply(comment)}
              activeOpacity={0.7}
            >
              <Image
                source={require('../../assets/images/say.png')}
                style={styles.replyIcon}
                resizeMode="contain"
                accessibilityLabel="답글 아이콘"
              />
              <Text style={styles.replyText}>답글</Text>
            </TouchableOpacity>
          )}

          {/* 수정/삭제 버튼 - 본인 댓글인 경우에만 표시 */}
          {isAuthor && onEdit && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEdit(comment)}
              activeOpacity={0.7}
            >
              <Image
                source={require('../../assets/images/pencil.png')}
                style={styles.actionIcon}
                resizeMode="contain"
                accessibilityLabel="수정 아이콘"
              />
              <Text style={styles.editText}>수정</Text>
            </TouchableOpacity>
          )}

          {isAuthor && onDelete && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onDelete(comment.comment_id)}
              activeOpacity={0.7}
            >
              <Image
                source={require('../../assets/images/trash.png')}
                style={styles.actionIcon}
                resizeMode="contain"
                accessibilityLabel="삭제 아이콘"
              />
              <Text style={styles.deleteText}>삭제</Text>
            </TouchableOpacity>
          )}

          {/* 숨기기 버튼 - 본인 댓글이 아닌 경우에만 표시 (isAuthor가 명시적으로 false일 때만) */}
          {isAuthor !== true && onHide && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleHide}
              activeOpacity={0.7}
            >
              <Text style={styles.hideText}>🚫 숨기기</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[2],
    marginVertical: spacing[1],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  replyContainer: {
    marginLeft: spacing[3],
    backgroundColor: colors.gray[50],
    borderLeftWidth: 2,
    borderLeftColor: colors.primary[500],
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    paddingLeft: spacing[1],
  },
  authorName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  authorBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing[1],
    paddingVertical: 2,
    borderRadius: borderRadius.base,
  },
  authorBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[700],
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  date: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  content: {
    marginTop: spacing[1],
    marginBottom: spacing[1],
    paddingLeft: spacing[1],
  },
  text: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  editedText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing[1],
    fontStyle: 'italic',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  footer: {
    paddingTop: spacing[1],
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[2],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[1],
    paddingVertical: 2,
  },
  editText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  deleteText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  hideText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  replyIcon: {
    width: 12,
    height: 12,
    marginRight: spacing[1],
  },
  actionIcon: {
    width: 14,
    height: 14,
    marginRight: spacing[0.5],
  },
  replyText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
});

export default CommentCard;
