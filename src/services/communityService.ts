/**
 * 커뮤니티 서비스
 * 백엔드 API를 통한 게시글 및 댓글 CRUD 기능 제공
 */

import { apiClient } from '../api/client';
import { API_CONFIG } from '../config/apiConfig';
import { getData, setData, getStorageKeys } from './storage';
import { logError } from '../utils/logger';
import { CommunityPost, CommunityComment, CommunityPostData, ServiceResult } from '../types';

/**
 * 게시글 생성 - 백엔드 API 사용
 */
export const createPost = async (
  postData: CommunityPostData,
  nickname: string
): Promise<ServiceResult<CommunityPost>> => {
  try {
    // 백엔드 API로 게시글 생성
    const result = await apiClient.post<CommunityPost>(API_CONFIG.endpoints.post.create, {
      title: postData.title || postData.mission_title,
      content: postData.content,
      missionId: postData.mission_id,
      missionTitle: postData.mission_title,
      missionEmoji: postData.mission_emoji,
      images: postData.images || [],
      tags: postData.tags || [],
      category: postData.category,
    });

    if (result.success && result.data) {
      return {
        success: true,
        data: result.data
      };
    }

    return {
      success: false,
      error: result.error || '게시글 생성에 실패했습니다.'
    };
  } catch (error) {
    logError('게시글 생성 실패', error as Error, { postData, nickname });
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

/**
 * 게시글 수정 - 백엔드 API 사용
 */
export const updatePost = async (
  postId: string,
  updateData: Partial<CommunityPostData>,
  nickname: string
): Promise<ServiceResult<CommunityPost>> => {
  try {
    const endpoint = API_CONFIG.endpoints.post.update.replace(':postId', postId);
    const result = await apiClient.put<CommunityPost>(endpoint, {
      title: updateData.title,
      content: updateData.content,
      images: updateData.images,
      tags: updateData.tags,
      category: updateData.category,
    });

    if (result.success && result.data) {
      return {
        success: true,
        data: result.data
      };
    }

    return {
      success: false,
      error: result.error || '게시글 수정에 실패했습니다.'
    };
  } catch (error) {
    logError('게시글 수정 실패', error as Error, { postId, updateData, nickname });
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

/**
 * 게시글 삭제 - 백엔드 API 사용
 */
export const deletePost = async (
  postId: string,
  nickname: string
): Promise<ServiceResult<void>> => {
  try {
    const endpoint = API_CONFIG.endpoints.post.delete.replace(':postId', postId);
    const result = await apiClient.delete<void>(endpoint);

    if (result.success) {
      return { success: true };
    }

    return {
      success: false,
      error: result.error || '게시글 삭제에 실패했습니다.'
    };
  } catch (error) {
    logError('게시글 삭제 실패', error as Error, { postId, nickname });
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

/**
 * 게시글 목록 조회 - 백엔드 API 사용
 */
export const getPosts = async (nickname: string): Promise<CommunityPost[]> => {
  try {
    const result = await apiClient.get<CommunityPost[]>(API_CONFIG.endpoints.post.list);

    if (result.success && result.data) {
      // 배열인지 확인
      const posts = Array.isArray(result.data) ? result.data : [];

      // 사용자의 좋아요/스크랩 정보 가져오기 (로컬)
      const storageKeys = getStorageKeys(nickname);
      const userLikes: string[] = await getData(storageKeys.USER_LIKES) || [];
      const userScraps: string[] = await getData(storageKeys.USER_SCRAPS) || [];

      // 좋아요/스크랩 상태 추가
      return posts.map(post => ({
        ...post,
        post_id: post.post_id || post.id?.toString(),
        is_liked: userLikes.includes(post.post_id || post.id?.toString() || ''),
        is_scrapped: userScraps.includes(post.post_id || post.id?.toString() || ''),
      }));
    }

    return [];
  } catch (error) {
    logError('게시글 목록 조회 실패', error as Error, { nickname });
    return [];
  }
};

/**
 * 게시글 상세 조회 - 백엔드 API 사용
 */
export const getPost = async (
  postId: string,
  nickname: string
): Promise<CommunityPost | null> => {
  try {
    const endpoint = API_CONFIG.endpoints.post.detail.replace(':postId', postId);
    const result = await apiClient.get<CommunityPost>(endpoint);

    if (result.success && result.data) {
      // 사용자의 좋아요/스크랩 정보 가져오기 (로컬)
      const storageKeys = getStorageKeys(nickname);
      const userLikes: string[] = await getData(storageKeys.USER_LIKES) || [];
      const userScraps: string[] = await getData(storageKeys.USER_SCRAPS) || [];

      const post = result.data;
      return {
        ...post,
        post_id: post.post_id || post.id?.toString(),
        is_liked: userLikes.includes(post.post_id || post.id?.toString() || ''),
        is_scrapped: userScraps.includes(post.post_id || post.id?.toString() || ''),
      };
    }

    return null;
  } catch (error) {
    logError('게시글 상세 조회 실패', error as Error, { postId, nickname });
    return null;
  }
};

/**
 * 댓글 생성 - 백엔드 API 사용
 */
export const createComment = async (
  postId: string,
  content: string,
  nickname: string,
  parentCommentId?: string
): Promise<ServiceResult<CommunityComment>> => {
  try {
    const endpoint = API_CONFIG.endpoints.post.createComment.replace(':postId', postId);
    const result = await apiClient.post<CommunityComment>(endpoint, {
      content: content.trim(),
      parentCommentId,
    });

    if (result.success && result.data) {
      return {
        success: true,
        data: result.data
      };
    }

    return {
      success: false,
      error: result.error || '댓글 생성에 실패했습니다.'
    };
  } catch (error) {
    logError('댓글 생성 실패', error as Error, { postId, content, nickname });
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

/**
 * 댓글 수정 - 백엔드 API 사용
 */
export const updateComment = async (
  commentId: string,
  content: string,
  nickname: string,
  postId?: string
): Promise<ServiceResult<CommunityComment>> => {
  try {
    // postId가 필요한 경우를 대비
    const endpoint = API_CONFIG.endpoints.post.updateComment
      .replace(':postId', postId || '0')
      .replace(':commentId', commentId);

    const result = await apiClient.put<CommunityComment>(endpoint, {
      content: content.trim(),
    });

    if (result.success && result.data) {
      return {
        success: true,
        data: result.data
      };
    }

    return {
      success: false,
      error: result.error || '댓글 수정에 실패했습니다.'
    };
  } catch (error) {
    logError('댓글 수정 실패', error as Error, { commentId, content, nickname });
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

/**
 * 댓글 삭제 - 백엔드 API 사용
 */
export const deleteComment = async (
  commentId: string,
  nickname: string,
  postId?: string
): Promise<ServiceResult<void>> => {
  try {
    const endpoint = API_CONFIG.endpoints.post.deleteComment
      .replace(':postId', postId || '0')
      .replace(':commentId', commentId);

    const result = await apiClient.delete<void>(endpoint);

    if (result.success) {
      return { success: true };
    }

    return {
      success: false,
      error: result.error || '댓글 삭제에 실패했습니다.'
    };
  } catch (error) {
    logError('댓글 삭제 실패', error as Error, { commentId, nickname });
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

/**
 * 댓글 목록 조회 - 백엔드 API 사용
 */
export const getComments = async (
  postId: string,
  nickname: string
): Promise<CommunityComment[]> => {
  try {
    const endpoint = API_CONFIG.endpoints.post.comments.replace(':postId', postId);
    const result = await apiClient.get<CommunityComment[]>(endpoint);

    if (result.success && result.data) {
      const comments = Array.isArray(result.data) ? result.data : [];
      return comments.sort((a, b) =>
        new Date(a.created_at || a.createdAt || 0).getTime() -
        new Date(b.created_at || b.createdAt || 0).getTime()
      );
    }

    return [];
  } catch (error) {
    logError('댓글 목록 조회 실패', error as Error, { postId, nickname });
    return [];
  }
};

/**
 * 좋아요 토글 - 로컬 저장 + 백엔드 연동 (백엔드 API 있으면 사용)
 */
export const toggleLike = async (
  postId: string,
  nickname: string
): Promise<ServiceResult<void>> => {
  try {
    const storageKeys = getStorageKeys(nickname);
    const userLikes: string[] = await getData(storageKeys.USER_LIKES) || [];

    const isLiked = userLikes.includes(postId);

    if (isLiked) {
      // 좋아요 취소
      const filteredLikes = userLikes.filter(id => id !== postId);
      await setData(storageKeys.USER_LIKES, filteredLikes);
    } else {
      // 좋아요 추가
      await setData(storageKeys.USER_LIKES, [...userLikes, postId]);
    }

    // TODO: 백엔드에 좋아요 API가 있으면 호출
    // await apiClient.post(`/posts/${postId}/like`);

    return { success: true };
  } catch (error) {
    logError('좋아요 토글 실패', error as Error, { postId, nickname });
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

/**
 * 스크랩 토글 - 로컬 저장
 */
export const toggleScrap = async (
  postId: string,
  nickname: string
): Promise<ServiceResult<void>> => {
  try {
    const storageKeys = getStorageKeys(nickname);
    const userScraps: string[] = await getData(storageKeys.USER_SCRAPS) || [];

    const isScrapped = userScraps.includes(postId);

    if (isScrapped) {
      // 스크랩 취소
      const filteredScraps = userScraps.filter(id => id !== postId);
      await setData(storageKeys.USER_SCRAPS, filteredScraps);
    } else {
      // 스크랩 추가
      await setData(storageKeys.USER_SCRAPS, [...userScraps, postId]);
    }

    return { success: true };
  } catch (error) {
    logError('스크랩 토글 실패', error as Error, { postId, nickname });
    return {
      success: false,
      error: (error as Error).message
    };
  }
};
