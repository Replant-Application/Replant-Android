import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { CommunityComment } from '../../types';

interface CommentCardProps {
  comment: CommunityComment;
  onEdit?: (comment: CommunityComment) => void;
  onDelete?: (commentId: string) => void;
  isAuthor?: boolean;
  style?: ViewStyle;
}

const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  onEdit,
  onDelete,
  isAuthor = false,
  style
}) => {
  if (!comment) return null;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{comment.author_nickname}</Text>
          {isAuthor && (
            <View style={styles.authorBadge}>
              <Text style={styles.authorBadgeText}>작성자</Text>
            </View>
          )}
        </View>
        <Text style={styles.date}>{formatDate(comment.created_at)}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.text}>{comment.content}</Text>
        {comment.updated_at && comment.updated_at !== comment.created_at && (
          <Text style={styles.editedText}>(수정됨)</Text>
        )}
      </View>

      {isAuthor && (onEdit || onDelete) && (
        <View style={styles.footer}>
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onEdit(comment)}
                activeOpacity={0.7}
              >
                <Text style={styles.editText}>✏️ 수정</Text>
              </TouchableOpacity>
            )}

            {onDelete && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onDelete(comment.comment_id)}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteText}>🗑️ 삭제</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    marginVertical: spacing[2],
    borderWidth: 1,
    borderColor: colors.border.light,
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
    gap: spacing[2],
  },
  authorName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  authorBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing[1],
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  authorBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[700],
    fontWeight: typography.fontWeight.medium,
  },
  date: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  content: {
    marginBottom: spacing[2],
  },
  text: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.base,
  },
  editedText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing[1],
    fontStyle: 'italic',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing[2],
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[3],
  },
  actionButton: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  editText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
  },
  deleteText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    fontWeight: typography.fontWeight.medium,
  },
});

export default CommentCard;

