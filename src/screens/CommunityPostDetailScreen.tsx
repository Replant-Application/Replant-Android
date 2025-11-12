/**
 * 커뮤니티 게시글 상세 화면
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useCommunityPost } from '../hooks/useCommunityPost';
import { useCommunity } from '../hooks/useCommunity';
import { CommentCard } from '../components/specialized';
import { Loading, ErrorBoundary, Header, EmptyState, Button } from '../components/ui';
import { colors, spacing, typography, borderRadius } from '../utils/designTokens';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { useUser } from '../contexts/UserContext';

interface CommunityPostDetailScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'CommunityPostDetail'>;
}

const CommunityPostDetailScreen: React.FC<CommunityPostDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { postId } = route.params;
  const { currentNickname } = useUser();
  const { post, comments, loading, error, createComment, updateComment, deleteComment, loadPost } =
    useCommunityPost(postId);
  const { toggleLike, toggleScrap, deletePost } = useCommunity();
  const [commentContent, setCommentContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const isAuthor = post?.author === currentNickname;

  const handleLike = async () => {
    if (post) {
      await toggleLike(post.post_id);
      await loadPost(); // 게시글 정보 새로고침
    }
  };

  const handleScrap = async () => {
    if (post) {
      await toggleScrap(post.post_id);
      await loadPost(); // 게시글 정보 새로고침
    }
  };


  const handleDeletePost = () => {
    if (!post) return;

    Alert.alert(
      '게시글 삭제',
      '정말로 이 게시글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            const result = await deletePost(post.post_id);
            if (result.success) {
              navigation.goBack();
            } else {
              Alert.alert('오류', result.error || '게시글 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleSubmitComment = async () => {
    if (!commentContent.trim()) {
      Alert.alert('오류', '댓글을 입력해주세요.');
      return;
    }

    const result = await createComment(commentContent.trim());
    if (result.success) {
      setCommentContent('');
    } else {
      Alert.alert('오류', result.error || '댓글 작성에 실패했습니다.');
    }
  };

  const handleEditComment = (comment: any) => {
    setEditingCommentId(comment.comment_id);
    setEditingContent(comment.content);
  };

  const handleUpdateComment = async () => {
    if (!editingCommentId || !editingContent.trim()) return;

    const result = await updateComment(editingCommentId, editingContent.trim());
    if (result.success) {
      setEditingCommentId(null);
      setEditingContent('');
    } else {
      Alert.alert('오류', result.error || '댓글 수정에 실패했습니다.');
    }
  };

  const handleDeleteComment = (commentId: string) => {
    Alert.alert(
      '댓글 삭제',
      '정말로 이 댓글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            await deleteComment(commentId);
          },
        },
      ]
    );
  };

  if (loading) {
    return <Loading text="게시글을 불러오는 중..." />;
  }

  if (error || !post) {
    return <ErrorBoundary error={error || '게시글을 찾을 수 없습니다.'} />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Header
        title="게시글"
        leftButton={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← 뒤로</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* 게시글 내용 */}
        <View style={styles.postContainer}>
          <View style={styles.header}>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{post.author_nickname}</Text>
              {post.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{post.category}</Text>
                </View>
              )}
            </View>
            <Text style={styles.date}>
              {new Date(post.created_at).toLocaleDateString('ko-KR')}
            </Text>
          </View>

          <View style={styles.missionInfo}>
            <Text style={styles.missionEmoji}>{post.mission_emoji}</Text>
            <Text style={styles.missionTitle}>{post.mission_title}</Text>
          </View>

          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.contentText}>{post.content}</Text>

          {post.images && post.images.length > 0 && (
            <View style={styles.imageContainer}>
              {post.images.map((image, index) => (
                <Image key={index} source={{ uri: image }} style={styles.image} resizeMode="cover" />
              ))}
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
              <Text style={styles.actionIcon}>{post.is_liked ? '❤️' : '🤍'}</Text>
              <Text style={styles.actionText}>{post.like_count}</Text>
            </TouchableOpacity>

            <View style={styles.actionButton}>
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionText}>{post.comment_count}</Text>
            </View>

            <TouchableOpacity style={styles.actionButton} onPress={handleScrap}>
              <Text style={styles.actionIcon}>{post.is_scrapped ? '🔖' : '📌'}</Text>
              {post.scrap_count > 0 && (
                <Text style={styles.actionText}>{post.scrap_count}</Text>
              )}
            </TouchableOpacity>

            {isAuthor && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('CommunityPostEdit', { postId: post.post_id })}
              >
                <Text style={styles.actionText}>✏️ 수정</Text>
              </TouchableOpacity>
            )}

            {isAuthor && (
              <TouchableOpacity style={styles.actionButton} onPress={handleDeletePost}>
                <Text style={[styles.actionText, styles.deleteText]}>🗑️ 삭제</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 댓글 섹션 */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>댓글 ({comments.length})</Text>

          {comments.length === 0 ? (
            <EmptyState icon="💬" title="아직 댓글이 없어요" description="첫 댓글을 남겨보세요!" />
          ) : (
            <View style={styles.commentsList}>
              {comments.map(comment => (
                <View key={comment.comment_id}>
                  {editingCommentId === comment.comment_id ? (
                    <View style={styles.editCommentContainer}>
                      <TextInput
                        style={styles.editCommentInput}
                        value={editingContent}
                        onChangeText={setEditingContent}
                        multiline
                      />
                      <View style={styles.editCommentActions}>
                        <TouchableOpacity
                          style={styles.editCommentButton}
                          onPress={() => {
                            setEditingCommentId(null);
                            setEditingContent('');
                          }}
                        >
                          <Text style={styles.editCommentButtonText}>취소</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.editCommentButton, styles.editCommentButtonSave]}
                          onPress={handleUpdateComment}
                        >
                          <Text
                            style={[
                              styles.editCommentButtonText,
                              styles.editCommentButtonTextSave,
                            ]}
                          >
                            저장
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <CommentCard
                      comment={comment}
                      isAuthor={comment.author === currentNickname}
                      onEdit={handleEditComment}
                      onDelete={handleDeleteComment}
                    />
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 댓글 입력 */}
      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          value={commentContent}
          onChangeText={setCommentContent}
          placeholder="댓글을 입력하세요..."
          placeholderTextColor={colors.text.tertiary}
          multiline
        />
        <TouchableOpacity
          style={[styles.submitButton, !commentContent.trim() && styles.submitButtonDisabled]}
          onPress={handleSubmitComment}
          disabled={!commentContent.trim()}
        >
          <Text style={styles.submitButtonText}>등록</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    flex: 1,
    padding: spacing[4],
  },
  backButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  postContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  authorName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  categoryBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[700],
  },
  date: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  missionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    padding: spacing[3],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    marginBottom: spacing[3],
  },
  missionEmoji: {
    fontSize: typography.fontSize['2xl'],
  },
  missionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[700],
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  contentText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.base,
    marginBottom: spacing[4],
  },
  imageContainer: {
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[4],
    paddingTop: spacing[3],
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
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  deleteText: {
    color: colors.error,
  },
  commentsSection: {
    marginTop: spacing[4],
  },
  commentsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  commentsList: {
    gap: spacing[2],
  },
  editCommentContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    marginBottom: spacing[2],
  },
  editCommentInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    minHeight: 80,
    marginBottom: spacing[2],
  },
  editCommentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[2],
  },
  editCommentButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.secondary,
  },
  editCommentButtonSave: {
    backgroundColor: colors.primary[600],
  },
  editCommentButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  editCommentButtonTextSave: {
    color: colors.white,
  },
  commentInputContainer: {
    flexDirection: 'row',
    padding: spacing[4],
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: spacing[2],
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    maxHeight: 100,
  },
  submitButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius.md,
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.background.secondary,
  },
  submitButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
  },
});

export default CommunityPostDetailScreen;

