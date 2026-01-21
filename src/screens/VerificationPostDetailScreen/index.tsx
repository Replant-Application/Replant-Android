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
import { getActiveTodoLists, getTodoListDetail, completeTodoMission } from '../../api/todolistApi';
import { getUserMission } from '../../api/missionApi';
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
  const { currentNickname, currentUserId } = useUser();

  const [post, setPost] = useState<VerificationPost | null>(null);
  const [comments, setComments] = useState<VerificationComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [replyingToComment, setReplyingToComment] = useState<{ id: string; nickname: string } | null>(null);

  // 본인 게시글인지 확인 (user_id 비교, fallback으로 닉네임 비교)
  const isAuthor = currentUserId !== null && 
    post?.userId !== undefined && 
    post.userId === currentUserId;

  const loadPost = useCallback(async () => {
    try {
      const result = await getVerification(verificationId);
      if (result.success && result.data) {
        const verificationData = result.data;
        
        // 디버깅: 좋아요 수와 상태 확인
        console.log('[VerificationPostDetailScreen] 인증글 조회:', {
          verificationId,
          likeCount: verificationData.approveCount,
          status: verificationData.status,
          shouldBeApproved: verificationData.approveCount >= 3,
        });
        
        // 좋아요가 3개 이상인데도 PENDING인 경우 경고 (백엔드 동기화 문제 가능성)
        if (verificationData.approveCount >= 3 && verificationData.status === 'PENDING') {
          console.warn('[VerificationPostDetailScreen] 좋아요 3개 이상인데도 PENDING 상태:', {
            verificationId,
            likeCount: verificationData.approveCount,
            status: verificationData.status,
          });
        }
        
        setPost(verificationData);
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

  // 화면 포커스 시 최신 상태 다시 조회 (다른 화면에서 좋아요를 눌렀을 수 있음)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // 화면이 포커스될 때마다 최신 상태 조회
      loadPost();
    });

    return unsubscribe;
  }, [navigation, loadPost]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // 인증 완료 시 투두리스트 미션 완료 처리
  const completeTodoMissionForVerification = async (userMissionId: number) => {
    try {
      console.log('[VerificationPostDetailScreen] 인증 완료 - userMissionId:', userMissionId);
      
      // userMissionId를 통해 실제 미션 ID 확인
      const userMissionResult = await getUserMission(userMissionId);
      if (!userMissionResult.success || !userMissionResult.data) {
        console.warn('[VerificationPostDetailScreen] UserMission 조회 실패:', userMissionResult.error);
        return;
      }

      const missionId = userMissionResult.data.mission?.id;
      if (!missionId) {
        console.warn('[VerificationPostDetailScreen] missionId를 찾을 수 없음');
        return;
      }

      console.log('[VerificationPostDetailScreen] missionId:', missionId);

      // 활성 투두리스트 목록 조회
      const todoListsResult = await getActiveTodoLists();
      if (!todoListsResult.success || !todoListsResult.data) {
        console.warn('[VerificationPostDetailScreen] 활성 투두리스트 조회 실패');
        return;
      }

      // 각 투두리스트에서 해당 미션 찾아서 완료 처리
      for (const todoList of todoListsResult.data) {
        const detailResult = await getTodoListDetail(todoList.id);
        if (detailResult.success && detailResult.data?.missions) {
          // 해당 missionId와 일치하는 미션 찾기
          const targetMission = detailResult.data.missions.find(
            (mission) => mission.missionId === missionId && !mission.isCompleted
          );

          if (targetMission) {
            console.log('[VerificationPostDetailScreen] 투두리스트 미션 완료 처리:', {
              todoListId: todoList.id,
              missionId: targetMission.missionId,
              missionTitle: targetMission.title,
            });

            // 투두리스트 미션 완료 처리
            const completeResult = await completeTodoMission(todoList.id, targetMission.missionId);
            if (completeResult.success) {
              console.log('[VerificationPostDetailScreen] 투두리스트 미션 완료 처리 성공');
            } else {
              console.error('[VerificationPostDetailScreen] 투두리스트 미션 완료 처리 실패:', completeResult.error);
            }
          }
        }
      }
    } catch (error) {
      console.error('[VerificationPostDetailScreen] 투두리스트 미션 완료 처리 중 오류:', error);
    }
  };

  const handleVote = async (voteType: VoteType) => {
    if (!post) return;

    // 내 게시글에는 투표할 수 없음 - 크래시 방지
    if (isAuthor) {
      Alert.alert('알림', '자신의 인증글에는 투표할 수 없습니다.');
      return;
    }

    try {
      const result = await voteVerification(verificationId, { vote: voteType });
      if (result.success && result.data) {
        const wasPending = post.status === 'PENDING';
        const isNowApproved = result.data.status === 'APPROVED';
        
        // 상태 즉시 업데이트 (verified 필드 기반)
        setPost(prev => prev ? {
          ...prev,
          approveCount: result.data!.approveCount,
          rejectCount: result.data!.rejectCount,
          myVote: voteType,
          status: result.data!.status, // verified 필드에 따라 'APPROVED' 또는 'PENDING'
        } : null);

        // 인증 완료 알림 (PENDING -> APPROVED로 변경된 경우)
        if (wasPending && isNowApproved) {
          Alert.alert('🎉 인증 완료!', '이 인증글이 인증되었습니다!');
          // 게시글 다시 조회하여 최신 상태 반영
          await loadPost();
          
          // 인증 완료 시 투두리스트 미션도 완료 처리
          if (post?.userMissionId) {
            try {
              await completeTodoMissionForVerification(post.userMissionId);
            } catch (error) {
              console.error('[VerificationPostDetailScreen] 투두리스트 미션 완료 처리 실패:', error);
            }
          }
        }
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
            accessibilityLabel="뒤로 가기"
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
                  <Image 
                    source={{ uri: post.userProfileImg }} 
                    style={styles.authorAvatarImage} 
                    accessibilityLabel={`${post.userNickname || '사용자'} 프로필 이미지`}
                  />
                ) : (
                  <Text style={styles.authorAvatarText}>
                    {post.userNickname?.charAt(0)?.toUpperCase() || '?'}
                  </Text>
                )}
              </View>
              <View style={styles.authorNameContainer}>
                <Text style={styles.authorName}>{post.userNickname || '알 수 없음'}</Text>
                <Text style={styles.missionTypeBadge}>
                  {post.missionType === 'OFFICIAL' ? '시스템 미션' : '커스텀 미션'}
                </Text>
              </View>
            </View>
            <Text style={styles.date}>
              {post.createdAt ? new Date(post.createdAt).toLocaleDateString('ko-KR') : ''}
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
                <Image 
                  key={index} 
                  source={{ uri: imageUrl }} 
                  style={styles.image} 
                  resizeMode="cover" 
                  accessibilityLabel={`${post.title} 인증 이미지 ${index + 1}`}
                />
              ))}
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.voteButton, post.myVote === 'APPROVE' && styles.voteButtonActive, isAuthor && styles.voteButtonDisabled]}
              onPress={() => handleVote('APPROVE')}
              disabled={isAuthor}
            >
              {post.myVote === 'APPROVE' ? (
                <Text style={[styles.voteIcon, isAuthor && styles.voteIconDisabled]}>❤️</Text>
              ) : (
                <Image
                  source={require('../../assets/images/heart.png')}
                  style={styles.voteIconImage}
                  resizeMode="contain"
                  accessibilityLabel="좋아요 아이콘"
                />
              )}
              <Text style={[styles.voteText, post.myVote === 'APPROVE' && styles.voteTextActive, isAuthor && styles.voteTextDisabled]}>
                {post.approveCount}
              </Text>
            </TouchableOpacity>

            <View style={styles.actionButton}>
              <Image
                source={require('../../assets/images/say.png')}
                style={styles.actionIconImage}
                resizeMode="contain"
                accessibilityLabel="댓글 아이콘"
              />
              <Text style={styles.actionText}>{post.commentCount || comments.length}</Text>
            </View>

            {isAuthor && post.status === 'PENDING' && (
              <>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    navigation.navigate('VerificationPostCreate' as any, {
                      mode: 'edit',
                      verificationId: verificationId,
                      initialContent: post.content,
                      photoUrl: post.imageUrls?.[0],
                      missionId: post.mission?.id,
                      missionTitle: getMissionTitle(),
                      missionEmoji: '🎯',
                    });
                  }}
                >
                  <Text style={styles.actionText}>✏️ 수정</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={handleDeletePost}>
                  <Text style={[styles.actionText, styles.deleteText]}>🗑️ 삭제</Text>
                </TouchableOpacity>
              </>
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
                        isAuthor={currentUserId !== null && 
                          (parentComment.author_id !== undefined 
                            ? Number(parentComment.author_id) === currentUserId
                            : parseInt(parentComment.author) === currentUserId)}
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
                              isAuthor={currentUserId !== null && 
                                (reply.author_id !== undefined 
                                  ? Number(reply.author_id) === currentUserId
                                  : parseInt(reply.author) === currentUserId)}
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
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.white,
  },
  authorNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
  },
  authorName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
  },
  missionTypeBadge: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing[1.5],
    paddingVertical: 2,
    borderRadius: borderRadius.base,
  },
  date: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
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
    marginBottom: spacing[3],
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
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.normal,
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
