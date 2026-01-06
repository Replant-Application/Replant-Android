/**
 * 인증글 상세 화면
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshControl,
} from 'react-native';
import {
  getVerification,
  getVerificationComments,
  createVerificationComment,
  updateVerificationComment,
  deleteVerificationComment,
  voteVerification,
  deleteVerification,
  VerificationPost,
  VerificationComment,
  VoteType,
} from '../../api/missionApi';
import { CommentCard } from '../../components/specialized';
import { Loading, ErrorBoundary, EmptyState } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { useUser } from '../../contexts/UserContext';

interface VerificationPostDetailScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'VerificationPostDetail'>;
}

const VerificationPostDetailScreen: React.FC<VerificationPostDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { verificationId } = route.params;
  const { currentNickname } = useUser();

  const [post, setPost] = useState<VerificationPost | null>(null);
  const [comments, setComments] = useState<VerificationComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [replyingToComment, setReplyingToComment] = useState<{ id: string; nickname: string } | null>(null);

  const isAuthor = post?.userNickname === currentNickname;

  const loadPost = useCallback(async () => {
    try {
      const result = await getVerification(verificationId);
      if (result.success && result.data) {
        setPost(result.data);
      } else {
        setError(result.error || '인증글을 불러올 수 없습니다.');
      }
    } catch (err) {
      setError('인증글을 불러오는 중 오류가 발생했습니다.');
    }
  }, [verificationId]);

  const loadComments = useCallback(async () => {
    try {
      const result = await getVerificationComments(verificationId);
      if (result.success && result.data) {
        setComments(result.data.content || []);
      }
    } catch (err) {
      console.error('댓글 로드 오류:', err);
    }
  }, [verificationId]);

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadPost(), loadComments()]);
    setLoading(false);
  }, [loadPost, loadComments]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleVote = async (voteType: VoteType) => {
    if (!post) return;

    try {
      const result = await voteVerification(verificationId, { vote: voteType });
      if (result.success && result.data) {
        setPost(prev => prev ? {
          ...prev,
          approveCount: result.data!.approveCount,
          rejectCount: result.data!.rejectCount,
          myVote: voteType,
          status: result.data!.status,
        } : null);
      } else {
        Alert.alert('오류', result.error || '투표에 실패했습니다.');
      }
    } catch (err) {
      Alert.alert('오류', '투표 중 오류가 발생했습니다.');
    }
  };

  const handleDeletePost = () => {
    if (!post) return;

    Alert.alert(
      '인증글 삭제',
      '정말로 이 인증글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteVerification(verificationId);
            if (result.success) {
              navigation.goBack();
            } else {
              Alert.alert('오류', result.error || '인증글 삭제에 실패했습니다.');
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

    const result = await createVerificationComment(
      verificationId,
      commentContent.trim(),
      replyingToComment?.id
    );

    if (result.success) {
      setCommentContent('');
      setReplyingToComment(null);
      await loadComments();
    } else {
      Alert.alert('오류', result.error || '댓글 작성에 실패했습니다.');
    }
  };

  const handleReplyComment = (comment: any) => {
    setReplyingToComment({ id: comment.comment_id, nickname: comment.author_nickname });
  };

  const handleCancelReply = () => {
    setReplyingToComment(null);
  };

  const handleEditComment = (comment: any) => {
    setEditingCommentId(comment.comment_id);
    setEditingContent(comment.content);
  };

  const handleUpdateComment = async () => {
    if (!editingCommentId || !editingContent.trim()) return;

    const result = await updateVerificationComment(
      verificationId,
      editingCommentId,
      editingContent.trim()
    );

    if (result.success) {
      setEditingCommentId(null);
      setEditingContent('');
      await loadComments();
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
            const result = await deleteVerificationComment(verificationId, commentId);
            if (result.success) {
              await loadComments();
            } else {
              Alert.alert('오류', result.error || '댓글 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const getStatusBadge = () => {
    if (!post) return null;

    switch (post.status) {
      case 'APPROVED':
        return (
          <View style={styles.approvedBadge}>
            <Text style={styles.badgeIcon}>✓</Text>
            <Text style={styles.approvedText}>인증완료</Text>
          </View>
        );
      case 'REJECTED':
        return (
          <View style={styles.rejectedBadge}>
            <Text style={styles.badgeIcon}>✗</Text>
            <Text style={styles.rejectedText}>인증실패</Text>
          </View>
        );
      case 'PENDING':
      default:
        return (
          <View style={styles.pendingBadge}>
            <Text style={styles.badgeIcon}>⏳</Text>
            <Text style={styles.pendingText}>인증대기</Text>
          </View>
        );
    }
  };

  const getMissionTitle = () => {
    if (!post) return '미션';
    return post.missionTitle || post.mission?.title || post.customMission?.title || '미션';
  };

  if (loading) {
    return <Loading text="인증글을 불러오는 중..." />;
  }

  if (error || !post) {
    return <ErrorBoundary error={error || '인증글을 찾을 수 없습니다.'} />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image
            source={require('../../assets/images/left.png')}
            style={styles.backButtonIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>인증글</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 게시글 내용 */}
        <View style={styles.postContainer}>
          <View style={styles.postHeader}>
            <View style={styles.authorInfo}>
              <View style={styles.authorAvatar}>
                {post.userProfileImg ? (
                  <Image source={{ uri: post.userProfileImg }} style={styles.authorAvatarImage} />
                ) : (
                  <Text style={styles.authorAvatarText}>
                    {post.userNickname.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <View>
                <Text style={styles.authorName}>{post.userNickname}</Text>
                <Text style={styles.missionTypeBadge}>
                  {post.missionType === 'SYSTEM' ? '시스템 미션' : '커스텀 미션'}
                </Text>
              </View>
            </View>
            <Text style={styles.date}>
              {new Date(post.createdAt).toLocaleDateString('ko-KR')}
            </Text>
          </View>

          <View style={styles.missionInfo}>
            <Text style={styles.missionEmoji}>🎯</Text>
            <Text style={styles.missionTitle}>{getMissionTitle()}</Text>
            {getStatusBadge()}
          </View>

          <Text style={styles.contentText}>{post.content}</Text>

          {post.imageUrls && post.imageUrls.length > 0 && (
            <View style={styles.imageContainer}>
              {post.imageUrls.map((imageUrl, index) => (
                <Image key={index} source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
              ))}
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.voteButton, post.myVote === 'APPROVE' && styles.voteButtonActive]}
              onPress={() => handleVote('APPROVE')}
              disabled={isAuthor}
            >
              <Text style={styles.voteIcon}>👍</Text>
              <Text style={[styles.voteText, post.myVote === 'APPROVE' && styles.voteTextActive]}>
                {post.approveCount}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.voteButton, post.myVote === 'REJECT' && styles.voteButtonRejectActive]}
              onPress={() => handleVote('REJECT')}
              disabled={isAuthor}
            >
              <Text style={styles.voteIcon}>👎</Text>
              <Text style={[styles.voteText, post.myVote === 'REJECT' && styles.voteTextRejectActive]}>
                {post.rejectCount}
              </Text>
            </TouchableOpacity>

            <View style={styles.actionButton}>
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionText}>{post.commentCount || comments.length}</Text>
            </View>

            {isAuthor && post.status === 'PENDING' && (
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
              {comments
                .filter(comment => !comment.parent_comment_id)
                .map(parentComment => (
                  <View key={parentComment.comment_id}>
                    {editingCommentId === parentComment.comment_id ? (
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
                            <Text style={[styles.editCommentButtonText, styles.editCommentButtonTextSave]}>
                              저장
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <CommentCard
                        comment={parentComment}
                        isAuthor={parentComment.author_nickname === currentNickname}
                        onEdit={handleEditComment}
                        onDelete={handleDeleteComment}
                        onReply={handleReplyComment}
                      />
                    )}

                    {/* 대댓글 */}
                    {(parentComment.replies || comments.filter(r => r.parent_comment_id === parentComment.comment_id))
                      .map(reply => (
                        <View key={reply.comment_id}>
                          {editingCommentId === reply.comment_id ? (
                            <View style={[styles.editCommentContainer, styles.replyEditContainer]}>
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
                                  <Text style={[styles.editCommentButtonText, styles.editCommentButtonTextSave]}>
                                    저장
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          ) : (
                            <CommentCard
                              comment={reply}
                              isAuthor={reply.author_nickname === currentNickname}
                              isReply={true}
                              onEdit={handleEditComment}
                              onDelete={handleDeleteComment}
                            />
                          )}
                        </View>
                      ))}
                  </View>
                ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 댓글 입력 */}
      <View style={styles.commentInputWrapper}>
        {replyingToComment && (
          <View style={styles.replyingToContainer}>
            <Text style={styles.replyingToText}>
              @{replyingToComment.nickname}님에게 답글 작성 중
            </Text>
            <TouchableOpacity onPress={handleCancelReply} style={styles.cancelReplyButton}>
              <Text style={styles.cancelReplyText}>X</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            value={commentContent}
            onChangeText={setCommentContent}
            placeholder={replyingToComment ? `@${replyingToComment.nickname}님에게 답글...` : "댓글을 입력하세요..."}
            placeholderTextColor={colors.text.tertiary}
            multiline
          />
          <TouchableOpacity
            style={[styles.submitButton, !commentContent.trim() && styles.submitButtonDisabled]}
            onPress={handleSubmitComment}
            disabled={!commentContent.trim()}
          >
            <Text style={styles.submitButtonText}>{replyingToComment ? '답글' : '등록'}</Text>
          </TouchableOpacity>
        </View>
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
  },
  headerRight: {
    width: 28,
  },
  postContainer: {
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
    overflow: 'hidden',
  },
  authorAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
  },
  authorAvatarText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.white,
  },
  authorName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    marginBottom: 2,
  },
  missionTypeBadge: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  date: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
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
  missionEmoji: {
    fontSize: typography.fontSize.base,
  },
  missionTitle: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.primary[800],
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
    fontSize: typography.fontSize.xs,
    color: colors.primary[700],
    fontWeight: typography.fontWeight.normal,
  },
  rejectedText: {
    fontSize: typography.fontSize.xs,
    color: colors.red[700],
    fontWeight: typography.fontWeight.normal,
  },
  pendingText: {
    fontSize: typography.fontSize.xs,
    color: colors.orange[700],
    fontWeight: typography.fontWeight.normal,
  },
  contentText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing[2],
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
  voteButtonRejectActive: {
    backgroundColor: colors.red[100],
  },
  voteIcon: {
    fontSize: typography.fontSize.base,
  },
  voteText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.normal,
  },
  voteTextActive: {
    color: colors.primary[700],
    fontWeight: typography.fontWeight.medium,
  },
  voteTextRejectActive: {
    color: colors.red[700],
    fontWeight: typography.fontWeight.medium,
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
    fontWeight: typography.fontWeight.normal,
  },
  deleteText: {
    color: colors.error,
  },
  commentsSection: {
    marginTop: spacing[2],
  },
  commentsTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    marginBottom: spacing[2],
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
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.base,
    padding: spacing[2],
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    minHeight: 60,
    marginBottom: spacing[1],
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
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.normal,
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
    fontSize: typography.fontSize.xs,
    color: colors.primary[700],
    fontWeight: typography.fontWeight.normal,
  },
  cancelReplyButton: {
    padding: spacing[1],
  },
  cancelReplyText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.normal,
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
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    maxHeight: 80,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  submitButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.base,
    justifyContent: 'center',
    minHeight: 36,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[200],
  },
  submitButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    fontWeight: typography.fontWeight.normal,
  },
});

export default VerificationPostDetailScreen;
