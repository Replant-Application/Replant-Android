/**
 * VerificationPostDetailScreen 비즈니스 로직
 * 인증글 상세 화면: 인증글 조회, 투표, 댓글 CRUD, 게시글 삭제
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
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
import { useUser } from '../../contexts/UserContext';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { SCREEN_NAMES } from '../../utils/constants';

interface VerificationPostDetailScreenContainerProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'VerificationPostDetail'>;
}

export const useVerificationPostDetailScreenContainer = ({
  navigation,
  route,
}: VerificationPostDetailScreenContainerProps) => {
  const { verificationId } = route.params;
  const { currentUserId } = useUser();

  const [post, setPost] = useState<VerificationPost | null>(null);
  const [comments, setComments] = useState<VerificationComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [replyingToComment, setReplyingToComment] = useState<{ id: string; nickname: string } | null>(null);

  // 오류/성공/알림용 AlertModal (showAlertModal API 오류 + useErrorHandler)
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const showAlertModal = useCallback((title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlert(true);
  }, []);
  const handleAlertClose = useCallback(() => setShowAlert(false), []);

  const errorHandlerOverrides = useMemo(
    () => ({
      onShowError: showAlertModal,
      onShowSuccess: showAlertModal,
      onShowInfo: showAlertModal,
    }),
    [showAlertModal]
  );
  const { showError, showSuccess, showInfo } = useErrorHandler(errorHandlerOverrides);

  /**
   * 본인 게시글인지 확인
   */
  const isAuthor = useMemo(() => {
    return (
      currentUserId !== null &&
      post?.userId !== undefined &&
      post.userId === currentUserId
    );
  }, [currentUserId, post]);

  /**
   * 인증글 데이터 로드
   */
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

  /**
   * 댓글 데이터 로드
   */
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

  /**
   * 전체 데이터 로드
   */
  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadPost(), loadComments()]);
    setLoading(false);
  }, [loadPost, loadComments]);

  /**
   * 초기 데이터 로드
   */
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * 화면 포커스 시 최신 상태 다시 조회
   */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // 화면이 포커스될 때마다 최신 상태 조회
      loadPost();
    });

    return unsubscribe;
  }, [navigation, loadPost]);

  /**
   * 새로고침
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  /**
   * 인증 완료 시 투두리스트 미션 완료 처리
   */
  const completeTodoMissionForVerification = useCallback(async (userMissionId: number) => {
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
            mission => mission.missionId === missionId && !mission.isCompleted
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
    } catch (err) {
      console.error('[VerificationPostDetailScreen] 투두리스트 미션 완료 처리 중 오류:', err);
    }
  }, []);

  /**
   * 투표 처리
   */
  const handleVote = useCallback(
    async (voteType: VoteType) => {
      if (!post) return;

      // 내 게시글에는 투표할 수 없음 - 크래시 방지
      if (isAuthor) {
        showInfo('자신의 인증글에는 투표할 수 없습니다.');
        return;
      }

      try {
        const result = await voteVerification(verificationId, { vote: voteType });
        if (result.success && result.data) {
          const wasPending = post.status === 'PENDING';
          const isNowApproved = result.data.status === 'APPROVED';

          // 상태 즉시 업데이트 (verified 필드 기반)
          setPost(prev =>
            prev
              ? {
                  ...prev,
                  approveCount: result.data!.approveCount,
                  rejectCount: result.data!.rejectCount,
                  myVote: voteType,
                  status: result.data!.status, // verified 필드에 따라 'APPROVED' 또는 'PENDING'
                }
              : null
          );

          // 인증 완료 알림 (PENDING -> APPROVED로 변경된 경우)
          if (wasPending && isNowApproved) {
            showSuccess('🎉 인증 완료!', '이 인증글이 인증되었습니다!');
            // 게시글 다시 조회하여 최신 상태 반영
            await loadPost();

            // 인증 완료 시 투두리스트 미션도 완료 처리
            if (post?.userMissionId) {
              try {
                await completeTodoMissionForVerification(post.userMissionId);
              } catch (err) {
                console.error('[VerificationPostDetailScreen] 투두리스트 미션 완료 처리 실패:', err);
              }
            }
          }
        } else {
          showAlertModal('오류', result.error || '투표 처리 중 오류가 발생했습니다.');
        }
      } catch (err) {
        showError(
          err instanceof Error ? err : new Error('투표 중 오류가 발생했습니다.'),
          'VerificationPostDetailScreen.handleVote'
        );
      }
    },
    [post, isAuthor, verificationId, loadPost, completeTodoMissionForVerification, showInfo, showSuccess, showAlertModal, showError]
  );

  /**
   * 게시글 삭제
   */
  const handleDeletePost = useCallback(() => {
    if (!post) return;

    Alert.alert('인증글 삭제', '정말로 이 인증글을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        onPress: async () => {
          const result = await deleteVerification(verificationId);
          if (result.success) {
            navigation.goBack();
          } else {
            showAlertModal('오류', result.error || '인증글 삭제에 실패했습니다.');
          }
        },
      },
    ]);
  }, [post, verificationId, navigation, showAlertModal]);

  /**
   * 댓글 작성
   */
  const handleSubmitComment = useCallback(async () => {
    if (!commentContent.trim()) {
      showError(new Error('댓글을 입력해주세요.'), 'VerificationPostDetailScreen.handleSubmitComment');
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
      showAlertModal('오류', result.error || '댓글 작성에 실패했습니다.');
    }
  }, [commentContent, replyingToComment, verificationId, loadComments, showError, showAlertModal]);

  /**
   * 답글 버튼 클릭
   */
  const handleReplyComment = useCallback((comment: any) => {
    setReplyingToComment({ id: comment.comment_id, nickname: comment.author_nickname });
  }, []);

  /**
   * 답글 모드 취소
   */
  const handleCancelReply = useCallback(() => {
    setReplyingToComment(null);
  }, []);

  /**
   * 댓글 수정 시작
   */
  const handleEditComment = useCallback((comment: any) => {
    setEditingCommentId(comment.comment_id);
    setEditingContent(comment.content);
  }, []);

  /**
   * 댓글 수정 취소
   */
  const handleCancelEdit = useCallback(() => {
    setEditingCommentId(null);
    setEditingContent('');
  }, []);

  /**
   * 댓글 수정 저장
   */
  const handleUpdateComment = useCallback(async () => {
    if (!editingCommentId || !editingContent.trim()) return;

    const result = await updateVerificationComment(verificationId, editingCommentId, editingContent.trim());

    if (result.success) {
      setEditingCommentId(null);
      setEditingContent('');
      await loadComments();
    } else {
      showAlertModal('오류', result.error || '댓글 수정에 실패했습니다.');
    }
  }, [editingCommentId, editingContent, verificationId, loadComments, showAlertModal]);

  /**
   * 댓글 삭제
   */
  const handleDeleteComment = useCallback(
    (commentId: string) => {
      Alert.alert('댓글 삭제', '정말로 이 댓글을 삭제하시겠습니까?', [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          onPress: async () => {
            const result = await deleteVerificationComment(verificationId, commentId);
            if (result.success) {
              await loadComments();
            } else {
              showAlertModal('오류', result.error || '댓글 삭제에 실패했습니다.');
            }
          },
        },
      ]);
    },
    [verificationId, loadComments, showAlertModal]
  );

  /**
   * 미션 제목 가져오기
   */
  const getMissionTitle = useCallback(() => {
    if (!post) return '미션';
    return post.missionTitle || post.mission?.title || post.customMission?.title || '미션';
  }, [post]);

  /**
   * 게시글 수정 화면으로 이동
   */
  const handleEditPost = useCallback(() => {
    if (!post) return;

    navigation.navigate(SCREEN_NAMES.VERIFICATION_POST_CREATE as any, {
      mode: 'edit',
      verificationId: verificationId,
      initialContent: post.content,
      photoUrl: post.imageUrls?.[0],
      missionId: post.mission?.id,
      missionTitle: getMissionTitle(),
      missionEmoji: '🎯',
    });
  }, [post, verificationId, navigation, getMissionTitle]);

  /**
   * 상태 뱃지 렌더링 함수
   */
  const getStatusBadge = useCallback(() => {
    if (!post) return null;

    switch (post.status) {
      case 'APPROVED':
        return { type: 'APPROVED' as const, icon: '✓', text: '인증완료' };
      case 'REJECTED':
        return { type: 'REJECTED' as const, icon: '✗', text: '인증실패' };
      case 'PENDING':
      default:
        return { type: 'PENDING' as const, icon: '⏳', text: '인증대기' };
    }
  }, [post]);

  return {
    // Data
    post,
    comments,
    // State
    loading,
    refreshing,
    error,
    commentContent,
    editingCommentId,
    editingContent,
    replyingToComment,
    isAuthor,
    showAlert,
    alertTitle,
    alertMessage,
    handleAlertClose,
    // Setters
    setCommentContent,
    setEditingContent,
    // Handlers
    onRefresh,
    handleVote,
    handleDeletePost,
    handleSubmitComment,
    handleReplyComment,
    handleCancelReply,
    handleEditComment,
    handleCancelEdit,
    handleUpdateComment,
    handleDeleteComment,
    handleEditPost,
    // Utils
    getStatusBadge,
    getMissionTitle,
    // User context
    currentUserId,
  };
};
