/**
 * 커뮤니티 관리 Hook
 * 게시글 목록, 생성, 수정, 삭제, 좋아요 기능 제공
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import {
  createPost as createPostService,
  updatePost as updatePostService,
  deletePost as deletePostService,
  getPosts as getPostsService,
  toggleLike as toggleLikeService,
} from '../services/communityService';
import { useUser } from '../contexts/UserContext';
import { logError } from '../utils/logger';
import {
  CommunityPost,
  CommunityPostData,
  UseCommunityReturn,
  ServiceResult,
} from '../types';

export const useCommunity = (): UseCommunityReturn => {
  const { currentNickname, currentUserId } = useUser();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 게시글 목록 로드
  const loadPosts = useCallback(async (): Promise<void> => {
    if (!currentNickname) return;

    try {
      setLoading(true);
      setError(null);

      const postsData = await getPostsService(currentNickname);
      // 최신순 정렬
      const sortedPosts = postsData.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setPosts(sortedPosts);
    } catch (loadError) {
      logError('게시글 목록 로드 실패', loadError as Error, { currentNickname });
      setError((loadError as Error).message);
    } finally {
      setLoading(false);
    }
  }, [currentNickname]);

  // 초기 로드 및 currentNickname 변경 시 로드
  useEffect(() => {
    if (currentNickname) {
      loadPosts();
    } else {
      // currentNickname이 없으면 로딩 상태를 false로 설정 (무한 로딩 방지)
      setLoading(false);
    }
  }, [loadPosts, currentNickname]);

  // 게시글 생성
  const createPost = useCallback(
    async (postData: CommunityPostData): Promise<ServiceResult<CommunityPost>> => {
      if (!currentNickname) {
        return { success: false, error: '사용자 정보가 없습니다.' };
      }

      try {
        const result = await createPostService(postData, currentNickname);

        if (result.success && result.data) {
          // 로컬 상태 업데이트
          setPosts(prev => [result.data!, ...prev]);
        }

        return result;
      } catch (createError) {
        logError('게시글 생성 실패', createError as Error, { postData, currentNickname });
        return { success: false, error: (createError as Error).message };
      }
    },
    [currentNickname]
  );

  // 게시글 수정
  const updatePost = useCallback(
    async (
      postId: string,
      postData: Partial<CommunityPostData>
    ): Promise<ServiceResult<CommunityPost>> => {
      if (!currentNickname) {
        return { success: false, error: '사용자 정보가 없습니다.' };
      }

      try {
        const result = await updatePostService(postId, postData, currentNickname);

        if (result.success && result.data) {
          // 로컬 상태 업데이트
          setPosts(prev =>
            prev.map(p => (p.post_id === postId ? result.data! : p))
          );
        }

        return result;
      } catch (updateError) {
        logError('게시글 수정 실패', updateError as Error, { postId, postData, currentNickname });
        return { success: false, error: (updateError as Error).message };
      }
    },
    [currentNickname]
  );

  // 게시글 삭제
  const deletePost = useCallback(
    async (postId: string): Promise<ServiceResult<void>> => {
      if (!currentNickname) {
        return { success: false, error: '사용자 정보가 없습니다.' };
      }

      try {
        const result = await deletePostService(postId, currentNickname);

        if (result.success) {
          // 로컬 상태 업데이트
          setPosts(prev => prev.filter(p => p.post_id !== postId));
        }

        return result;
      } catch (deleteError) {
        logError('게시글 삭제 실패', deleteError as Error, { postId, currentNickname });
        return { success: false, error: (deleteError as Error).message };
      }
    },
    [currentNickname]
  );

  // 좋아요 토글
  const toggleLike = useCallback(
    async (postId: string): Promise<ServiceResult<void>> => {
      if (!currentNickname) {
        return { success: false, error: '사용자 정보가 없습니다.' };
      }

      // 해당 게시글 찾기
      const targetPost = posts.find(p => p.post_id === postId);

      // 내 게시글에는 좋아요를 누를 수 없음 (백엔드에서 제공하는 isAuthor 필드 사용)
      if (targetPost?.isAuthor === true) {
        return { success: false, error: '내 게시글에는 좋아요를 누를 수 없습니다.' };
      }

      try {
        const result = await toggleLikeService(postId, currentNickname);

        if (result.success && result.data) {
          // 백엔드 응답으로 로컬 상태 업데이트
          setPosts(prev =>
            prev.map(p => {
              if (p.post_id === postId) {
                return {
                  ...p,
                  is_liked: result.data!.isLiked,
                  like_count: result.data!.likeCount,
                };
              }
              return p;
            })
          );
        } else if (!result.success) {
          Alert.alert('오류', result.error || '좋아요 처리에 실패했습니다.');
        }

        return { success: result.success, error: result.error };
      } catch (toggleError) {
        logError('좋아요 토글 실패', toggleError as Error, { postId, currentNickname });
        Alert.alert('오류', '좋아요 처리 중 문제가 발생했습니다.');
        return { success: false, error: (toggleError as Error).message };
      }
    },
    [currentNickname, posts]
  );

  // 게시글 검색
  const searchPosts = useCallback(
    (query: string): CommunityPost[] => {
      if (!query.trim()) {
        return posts;
      }

      const lowerQuery = query.toLowerCase();
      return posts.filter(
        post =>
          post.title.toLowerCase().includes(lowerQuery) ||
          post.content.toLowerCase().includes(lowerQuery) ||
          post.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    },
    [posts]
  );

  // 게시글 필터링
  const filterPosts = useCallback(
    (category?: string, sortBy: 'latest' | 'popular' = 'latest'): CommunityPost[] => {
      let filtered = posts;

      // 카테고리 필터
      if (category) {
        filtered = filtered.filter(post => post.category === category);
      }

      // 정렬
      if (sortBy === 'popular') {
        filtered = [...filtered].sort((a, b) => {
          const aScore = a.like_count + a.comment_count;
          const bScore = b.like_count + b.comment_count;
          return bScore - aScore;
        });
      } else {
        // latest는 이미 정렬되어 있음
        filtered = [...filtered].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }

      return filtered;
    },
    [posts]
  );

  // 메모이제이션된 반환 객체
  return useMemo(
    () => ({
      posts,
      loading,
      error,
      loadPosts,
      createPost,
      updatePost,
      deletePost,
      toggleLike,
      searchPosts,
      filterPosts,
    }),
    [
      posts,
      loading,
      error,
      loadPosts,
      createPost,
      updatePost,
      deletePost,
      toggleLike,
      searchPosts,
      filterPosts,
    ]
  );
};
