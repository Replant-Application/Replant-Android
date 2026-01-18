/**
 * 커뮤니티 게시글 상세 관리 Hook
 * 게시글 상세 조회, 댓글 관리 기능 제공
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  getPost as getPostService,
  getComments as getCommentsService,
  createComment as createCommentService,
  updateComment as updateCommentService,
  deleteComment as deleteCommentService,
  toggleLike as toggleLikeService,
} from '../services/communityService';
import { autoLevelupCharacter } from '../services/characterService';
import { getData, getStorageKeys } from '../services/storage';
import { useUser } from '../contexts/UserContext';
import { logError } from '../utils/logger';
import {
  CommunityPost,
  CommunityComment,
  UseCommunityPostReturn,
  ServiceResult,
  Character,
} from '../types';

export const useCommunityPost = (postId: string): UseCommunityPostReturn => {
  const { currentNickname } = useUser();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 게시글 로드
  const loadPost = useCallback(async (): Promise<void> => {
    if (!currentNickname || !postId) return;

    try {
      setLoading(true);
      setError(null);

      const postData = await getPostService(postId, currentNickname);
      setPost(postData);
    } catch (loadError) {
      logError('게시글 로드 실패', loadError as Error, { postId, currentNickname });
      setError((loadError as Error).message);
    } finally {
      setLoading(false);
    }
  }, [postId, currentNickname]);

  // 댓글 목록 로드
  const loadComments = useCallback(async (): Promise<void> => {
    if (!currentNickname || !postId) return;

    try {
      const commentsData = await getCommentsService(postId, currentNickname);
      setComments(commentsData);
    } catch (loadError) {
      logError('댓글 목록 로드 실패', loadError as Error, { postId, currentNickname });
    }
  }, [postId, currentNickname]);

  // 초기 로드
  useEffect(() => {
    loadPost();
    loadComments();
  }, [loadPost, loadComments]);

  // 좋아요 토글
  const toggleLike = useCallback(
    async (): Promise<ServiceResult<void>> => {
      if (!currentNickname || !post) {
        return { success: false, error: '사용자 정보가 없습니다.' };
      }

      // 내 게시글에는 좋아요를 누를 수 없음 (닉네임 비교)
      if (post.author_nickname === currentNickname) {
        return { success: false, error: '내 게시글에는 좋아요를 누를 수 없습니다.' };
      }

      try {
        const result = await toggleLikeService(postId, currentNickname);

        if (result.success && result.data) {
          // 백엔드에서 반환한 최신 상태 사용
          // 백엔드에서 좋아요 3개 이상 시 자동으로 status = "APPROVED"로 변경하고 UserMission.status = COMPLETED로 변경
          const updatedPost = {
            ...post,
            is_liked: result.data.isLiked,
            like_count: result.data.likeCount, // 백엔드에서 countByPostId()로 최신 카운트 반환
            verified: result.data.verified ?? post.verified, // 백엔드에서 인증 처리된 경우
            status: result.data.status ?? post.status, // 백엔드에서 status = "APPROVED"로 변경된 경우
          };

          // 로컬 상태 업데이트 (백엔드 응답 기반)
          setPost(updatedPost);

          // 백엔드에서 인증이 완료된 경우 알림 표시
          if (result.data.verified && result.data.status === 'APPROVED' && post.mission_id && post.author_nickname !== currentNickname) {
            try {
              // 작성자의 캐릭터에 경험치 추가 (백엔드에서 이미 처리했을 수 있지만, UI 업데이트를 위해)
              const authorNickname = post.author_nickname;
              const storageKeys = getStorageKeys(authorNickname);
              const characters: Character[] = await getData(storageKeys.CHARACTERS) || [];
              const character = characters[0];
              
              if (character && character.id) {
                // 백엔드에서 이미 경험치 지급 및 UserMission 완료 처리를 했으므로, 
                // 여기서는 알림만 표시
                Alert.alert('🎉 인증 완료!', '게시글이 좋아요 인증되었습니다!\n작성자에게 경험치가 지급되었습니다.');
              }
            } catch (verifyError) {
              logError('인증 완료 알림 처리 실패', verifyError as Error, { postId });
            }
          }
        }

        return result;
      } catch (toggleError) {
        logError('좋아요 토글 실패', toggleError as Error, { postId, currentNickname });
        Alert.alert('오류', '좋아요 처리 중 문제가 발생했습니다.');
        return { success: false, error: (toggleError as Error).message };
      }
    },
    [postId, currentNickname, post]
  );

  // 댓글 생성
  const createComment = useCallback(
    async (content: string, parentCommentId?: string): Promise<ServiceResult<CommunityComment>> => {
      if (!currentNickname) {
        return { success: false, error: '사용자 정보가 없습니다.' };
      }

      try {
        const result = await createCommentService(postId, content, currentNickname, parentCommentId);

        if (result.success && result.data) {
          // 로컬 상태 업데이트
          setComments(prev => [...prev, result.data!]);
          // 게시글 댓글 수 업데이트
          if (post) {
            setPost({ ...post, comment_count: post.comment_count + 1 });
          }
        }

        return result;
      } catch (createError) {
        logError('댓글 생성 실패', createError as Error, { postId, content, currentNickname });
        return { success: false, error: (createError as Error).message };
      }
    },
    [postId, currentNickname, post]
  );

  // 댓글 수정
  const updateComment = useCallback(
    async (commentId: string, content: string): Promise<ServiceResult<CommunityComment>> => {
      if (!currentNickname) {
        return { success: false, error: '사용자 정보가 없습니다.' };
      }

      try {
        const result = await updateCommentService(commentId, content, currentNickname);

        if (result.success && result.data) {
          // 로컬 상태 업데이트
          setComments(prev =>
            prev.map(c => (c.comment_id === commentId ? result.data! : c))
          );
        }

        return result;
      } catch (updateError) {
        logError('댓글 수정 실패', updateError as Error, { commentId, content, currentNickname });
        return { success: false, error: (updateError as Error).message };
      }
    },
    [currentNickname]
  );

  // 댓글 삭제
  const deleteComment = useCallback(
    async (commentId: string): Promise<ServiceResult<void>> => {
      if (!currentNickname) {
        return { success: false, error: '사용자 정보가 없습니다.' };
      }

      try {
        const result = await deleteCommentService(commentId, currentNickname);

        if (result.success) {
          // 로컬 상태 업데이트
          setComments(prev => prev.filter(c => c.comment_id !== commentId));
          // 게시글 댓글 수 업데이트
          if (post) {
            setPost({ ...post, comment_count: Math.max(0, post.comment_count - 1) });
          }
        }

        return result;
      } catch (deleteError) {
        logError('댓글 삭제 실패', deleteError as Error, { commentId, currentNickname });
        return { success: false, error: (deleteError as Error).message };
      }
    },
    [currentNickname, post]
  );

  return {
    post,
    comments,
    loading,
    error,
    loadPost,
    loadComments,
    toggleLike,
    createComment,
    updateComment,
    deleteComment,
  };
};

