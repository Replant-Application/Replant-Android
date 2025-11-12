/**
 * 커뮤니티 게시글 상세 관리 Hook
 * 게시글 상세 조회, 댓글 관리 기능 제공
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getPost as getPostService,
  getComments as getCommentsService,
  createComment as createCommentService,
  updateComment as updateCommentService,
  deleteComment as deleteCommentService,
} from '../services/communityService';
import { useUser } from '../contexts/UserContext';
import { logError } from '../utils/logger';
import {
  CommunityPost,
  CommunityComment,
  UseCommunityPostReturn,
  ServiceResult,
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
    createComment,
    updateComment,
    deleteComment,
  };
};

