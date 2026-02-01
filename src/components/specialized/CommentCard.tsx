import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle, Image, Alert } from 'react-native';
import { CommunityComment } from '../../types';
import { formatTimeAgo } from '../../utils/dateUtils';
import { styles } from './CommentCard.styles';

interface CommentCardProps {
  comment: CommunityComment;
  onEdit?: (comment: CommunityComment) => void;
  onDelete?: (commentId: string) => void;
  onReply?: (comment: CommunityComment) => void;
  onHide?: (commentId: string) => void;
  isAuthor?: boolean; // 레거시 호환용 (comment.isAuthor를 우선 사용)
  isReply?: boolean;
  style?: ViewStyle;
}

const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  onEdit,
  onDelete,
  onReply,
  onHide,
  isAuthor: propIsAuthor,
  isReply = false,
  style
}) => {
  if (!comment) return null;

  // 백엔드에서 제공하는 isAuthor 필드 우선 사용, 없으면 prop 사용 (레거시 호환)
  const isAuthor = comment.isAuthor === true || propIsAuthor === true;

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
              accessibilityRole="button"
              accessibilityLabel="답글"
            >
              <Image
                source={require('../../assets/images/say.png')}
                style={styles.replyIcon}
                resizeMode="contain"
                accessibilityLabel="답글 아이콘"
                accessibilityElementsHidden={true}
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
              accessibilityRole="button"
              accessibilityLabel="수정"
            >
              <Image
                source={require('../../assets/images/pencil.png')}
                style={styles.actionIcon}
                resizeMode="contain"
                accessibilityLabel="수정 아이콘"
                accessibilityElementsHidden={true}
              />
              <Text style={styles.editText}>수정</Text>
            </TouchableOpacity>
          )}

          {isAuthor && onDelete && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onDelete(comment.comment_id)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="삭제"
            >
              <Image
                source={require('../../assets/images/trash.png')}
                style={styles.actionIcon}
                resizeMode="contain"
                accessibilityLabel="삭제 아이콘"
                accessibilityElementsHidden={true}
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
              accessibilityRole="button"
              accessibilityLabel="숨기기"
            >
              <Text style={styles.hideText}>🚫 숨기기</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default CommentCard;
