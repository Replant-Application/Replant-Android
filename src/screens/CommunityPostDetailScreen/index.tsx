/**
 * 커뮤니티 게시글 상세 화면
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
  ImageBackground,
} from 'react-native';
import { useCommunityPost } from '../../hooks/useCommunityPost';
import { useCommunity } from '../../hooks/useCommunity';
import { CommentCard } from '../../components/specialized';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { Loading, ErrorBoundary, EmptyState, Header, Card } from '../../components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { useUser } from '../../contexts/UserContext';
import { getHiddenComments, hideComment } from '../../utils/hiddenContentStorage';
import { logError } from '../../utils/logger';

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
  const { post, comments, loading, error, createComment, updateComment, deleteComment, toggleLike } =
    useCommunityPost(postId);
  const { deletePost } = useCommunity();
  const [commentContent, setCommentContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [replyingToComment, setReplyingToComment] = useState<{ id: string; nickname: string } | null>(null);
  
  // 숨긴 댓글 ID 목록
  const [hiddenCommentIds, setHiddenCommentIds] = useState<string[]>([]);

  const isAuthor = post?.author === currentNickname;

  // 숨긴 댓글 목록 로드
  useEffect(() => {
    const loadHiddenComments = async () => {
      try {
        const hiddenIds = await getHiddenComments();
        setHiddenCommentIds(hiddenIds);
      } catch (error) {
        logError('숨긴 댓글 목록 로드 실패', error as Error);
      }
    };
    loadHiddenComments();
  }, []);

  // 댓글 숨기기 처리
  const handleHideComment = useCallback(async (commentId: string) => {
    try {
      await hideComment(commentId);
      setHiddenCommentIds(prev => [...prev, commentId]);
    } catch (error) {
      logError('댓글 숨기기 실패', error as Error);
      Alert.alert('오류', '댓글을 숨기는 중 문제가 발생했습니다.');
    }
  }, []);

  const handleLike = async () => {
    if (post) {
      await toggleLike();
      // toggleLike가 내부적으로 post 상태를 업데이트하므로 loadPost 불필요
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

    // 대댓글인 경우 parentCommentId 전달
    const result = await createComment(commentContent.trim(), replyingToComment?.id);
    if (result.success) {
      setCommentContent('');
      setReplyingToComment(null); // 답글 모드 해제
    } else {
      Alert.alert('오류', result.error || '댓글 작성에 실패했습니다.');
    }
  };

  // 답글 버튼 클릭 핸들러
  const handleReplyComment = (comment: any) => {
    setReplyingToComment({ id: comment.comment_id, nickname: comment.author_nickname });
    // 답글 입력란에 포커스를 맞추기 위해 placeholder를 변경
  };

  // 답글 모드 취소 핸들러
  const handleCancelReply = () => {
    setReplyingToComment(null);
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
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Header
          title="게시글"
          navigation={navigation}
          showBorder={false}
          titleStyle={styles.headerTitle}
        />

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 게시글 내용 */}
          <Card style={styles.postContainer}>
          <View style={styles.postHeader}>
            <View style={styles.authorInfo}>
              <View style={styles.authorAvatar}>
                <Text style={styles.authorAvatarText}>
                  {post.author_nickname?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
              <View>
                <Text style={styles.authorName}>{post.author_nickname || '알 수 없음'}</Text>
                {post.category && (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{post.category}</Text>
                  </View>
                )}
              </View>
            </View>
            <Text style={styles.date}>
              {post.created_at ? new Date(post.created_at).toLocaleDateString('ko-KR') : ''}
            </Text>
          </View>

          <View style={styles.missionInfo}>
            <Text style={styles.missionEmoji}>{post.mission_emoji || '🎯'}</Text>
            <Text style={styles.missionTitle}>{post.mission_title || '미션'}</Text>
            {/* 인증 상태 뱃지 */}
            {post.verified === true ? (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedIcon}>✓</Text>
                <Text style={styles.verifiedText}>인증완료</Text>
              </View>
            ) : post.verified === false ? (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingIcon}>⏳</Text>
                <Text style={styles.pendingText}>인증대기</Text>
              </View>
            ) : null}
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
              {post.is_liked ? (
                <Text style={styles.actionIcon}>❤️</Text>
              ) : (
                <Image
                  source={require('../../assets/images/heart.png')}
                  style={styles.actionIconImage}
                  resizeMode="contain"
                />
              )}
              <Text style={styles.actionText}>{post.like_count}</Text>
            </TouchableOpacity>

            <View style={styles.actionButton}>
              <Image
                source={require('../../assets/images/say.png')}
                style={styles.actionIconImage}
                resizeMode="contain"
              />
              <Text style={styles.actionText}>{post.comment_count}</Text>
            </View>

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
          </Card>

          {/* 댓글 섹션 */}
          <Card style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>댓글 ({comments.length})</Text>

          {comments.length === 0 ? (
            <EmptyState iconImage={require('../../assets/images/say.png')} title="아직 댓글이 없어요" description="첫 댓글을 남겨보세요!" />
          ) : (
            <View style={styles.commentsList}>
              {/* 부모 댓글만 먼저 렌더링하고, 대댓글은 부모 댓글 아래에 표시 */}
              {comments
                .filter(comment => !comment.parent_comment_id)
                .filter(comment => !hiddenCommentIds.includes(comment.comment_id))
                .map(parentComment => (
                  <View key={parentComment.comment_id}>
                    {/* 부모 댓글 */}
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
                        comment={parentComment}
                        isAuthor={parentComment.author_nickname === currentNickname}
                        onEdit={handleEditComment}
                        onDelete={handleDeleteComment}
                        onReply={handleReplyComment}
                        onHide={handleHideComment}
                      />
                    )}

                    {/* 대댓글 (부모 댓글에 속한 댓글들) */}
                    {comments
                      .filter(reply => reply.parent_comment_id === parentComment.comment_id)
                      .filter(reply => !hiddenCommentIds.includes(reply.comment_id))
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
                              comment={reply}
                              isAuthor={reply.author_nickname === currentNickname}
                              isReply={true}
                              onEdit={handleEditComment}
                              onDelete={handleDeleteComment}
                              onHide={handleHideComment}
                            />
                          )}
                        </View>
                      ))}
                  </View>
                ))}
            </View>
          )}
          </Card>
        </ScrollView>

        {/* 댓글 입력 */}
        <View style={styles.commentInputWrapper}>
          {/* 답글 모드 표시 */}
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
              placeholder={replyingToComment ? `@${replyingToComment.nickname}님에게 답글...` : "댓글을 입력하세요"}
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
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
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
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  postContainer: {
    marginBottom: spacing[5],
    ...shadows.sm,
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
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.white,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  authorName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    marginBottom: 2,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  categoryBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.base,
    alignSelf: 'flex-start',
  },
  categoryText: {
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
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  missionTitle: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.primary[800],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
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
    fontSize: typography.fontSize.xs,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  verifiedText: {
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
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  pendingText: {
    fontSize: typography.fontSize.xs,
    color: colors.orange[700],
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    marginBottom: spacing[1],
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  contentText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
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
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  actionIconImage: {
    width: 20,
    height: 20,
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  deleteText: {
    color: colors.error,
  },
  commentsSection: {
    marginTop: spacing[2],
    ...shadows.sm,
  },
  commentsTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
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
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
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
  cancelReplyButton: {
    padding: spacing[1],
  },
  cancelReplyText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
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
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    textAlignVertical: 'top',
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
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
});

export default CommunityPostDetailScreen;
