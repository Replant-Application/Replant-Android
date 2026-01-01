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
  updateDataParam: Partial<CommunityPostData>,
  nickname: string
): Promise<ServiceResult<CommunityPost>> => {
  try {
    const endpoint = API_CONFIG.endpoints.post.update.replace(':postId', postId);
    const result = await apiClient.put<CommunityPost>(endpoint, {
      title: updateDataParam.title,
      content: updateDataParam.content,
      images: updateDataParam.images,
      tags: updateDataParam.tags,
      category: updateDataParam.category,
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
    logError('게시글 수정 실패', error as Error, { postId, updateData: updateDataParam, nickname });
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

// 백엔드 API 응답 타입
interface BackendPostResponse {
  id: number;
  userId: number;
  userNickname: string;
  userProfileImg?: string;
  missionTag?: {
    id: number;
    title: string;
    type: 'SYSTEM' | 'CUSTOM';
  };
  title: string;
  content: string;
  imageUrls: string[];
  hasValidBadge: boolean;
  commentCount: number;
  createdAt: string;
  updatedAt?: string;
}

interface BackendPageResponse {
  content: BackendPostResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
}

/**
 * 백엔드 응답을 프론트엔드 형식으로 변환
 */
const transformBackendPost = (post: BackendPostResponse): CommunityPost => ({
  id: post.id.toString(),
  post_id: post.id.toString(),
  mission_id: post.missionTag?.id?.toString() || '',
  mission_title: post.missionTag?.title || '자유 게시글',
  mission_emoji: '📝', // 기본 이모지
  title: post.title || post.missionTag?.title || '제목 없음',
  content: post.content,
  author: post.userId.toString(),
  author_nickname: post.userNickname,
  created_at: post.createdAt,
  updated_at: post.updatedAt,
  like_count: 0, // 백엔드에서 제공하지 않음 - 로컬 관리
  comment_count: post.commentCount || 0,
  scrap_count: 0, // 백엔드에서 제공하지 않음 - 로컬 관리
  images: post.imageUrls || [],
  tags: post.missionTag ? [post.missionTag.title] : [],
  category: post.missionTag?.type || 'GENERAL',
});

/**
 * 게시글 목록 조회 - 백엔드 API 사용
 */
export const getPosts = async (nickname: string): Promise<CommunityPost[]> => {
  try {
    // 백엔드는 Page 객체를 반환
    const result = await apiClient.get<BackendPageResponse | BackendPostResponse[]>(API_CONFIG.endpoints.post.list);

    if (result.success && result.data) {
      let backendPosts: BackendPostResponse[] = [];

      // Page 객체인지 배열인지 확인
      if (result.data && typeof result.data === 'object' && 'content' in result.data) {
        // Page 객체
        backendPosts = (result.data as BackendPageResponse).content || [];
      } else if (Array.isArray(result.data)) {
        // 배열
        backendPosts = result.data;
      }

      // 사용자의 좋아요/스크랩 정보 가져오기 (로컬)
      const storageKeys = getStorageKeys(nickname);
      const userLikes: string[] = await getData(storageKeys.USER_LIKES) || [];
      const userScraps: string[] = await getData(storageKeys.USER_SCRAPS) || [];

      // 백엔드 응답을 프론트엔드 형식으로 변환 + 좋아요/스크랩 상태 추가
      return backendPosts.map(post => {
        const transformed = transformBackendPost(post);
        return {
          ...transformed,
          is_liked: userLikes.includes(transformed.post_id),
          is_scrapped: userScraps.includes(transformed.post_id),
        };
      });
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
    const result = await apiClient.get<BackendPostResponse>(endpoint);

    if (result.success && result.data) {
      // 사용자의 좋아요/스크랩 정보 가져오기 (로컬)
      const storageKeys = getStorageKeys(nickname);
      const userLikes: string[] = await getData(storageKeys.USER_LIKES) || [];
      const userScraps: string[] = await getData(storageKeys.USER_SCRAPS) || [];

      // 백엔드 응답을 프론트엔드 형식으로 변환
      const transformed = transformBackendPost(result.data);
      return {
        ...transformed,
        is_liked: userLikes.includes(transformed.post_id),
        is_scrapped: userScraps.includes(transformed.post_id),
      };
    }

    return null;
  } catch (error) {
    logError('게시글 상세 조회 실패', error as Error, { postId, nickname });
    return null;
  }
};

// 백엔드 댓글 응답 타입
interface BackendCommentResponse {
  id: number;
  userId: number;
  userNickname: string;
  userProfileImg?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * 백엔드 댓글 응답을 프론트엔드 형식으로 변환
 */
const transformBackendComment = (comment: BackendCommentResponse | any, postId?: string): CommunityComment => ({
  id: (comment.id || comment.comment_id || '').toString(),
  comment_id: (comment.id || comment.comment_id || '').toString(),
  post_id: postId || '',
  content: comment.content || '',
  author: (comment.userId || comment.author || '').toString(),
  author_nickname: comment.userNickname || comment.author_nickname || '알 수 없음',
  created_at: comment.createdAt || comment.created_at || new Date().toISOString(),
  updated_at: comment.updatedAt || comment.updated_at,
});

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
    const result = await apiClient.post<BackendCommentResponse>(endpoint, {
      content: content.trim(),
      parentCommentId,
    });

    if (result.success && result.data) {
      // 백엔드 응답을 프론트엔드 형식으로 변환
      const transformedComment = transformBackendComment(result.data, postId);
      // 백엔드에서 사용자 닉네임이 없으면 현재 사용자 닉네임 사용
      if (!transformedComment.author_nickname || transformedComment.author_nickname === '알 수 없음') {
        transformedComment.author_nickname = nickname;
      }
      return {
        success: true,
        data: transformedComment
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

    const result = await apiClient.put<BackendCommentResponse>(endpoint, {
      content: content.trim(),
    });

    if (result.success && result.data) {
      // 백엔드 응답을 프론트엔드 형식으로 변환
      const transformedComment = transformBackendComment(result.data, postId);
      if (!transformedComment.author_nickname || transformedComment.author_nickname === '알 수 없음') {
        transformedComment.author_nickname = nickname;
      }
      return {
        success: true,
        data: transformedComment
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
    const result = await apiClient.get<BackendCommentResponse[] | any>(endpoint);

    if (result.success && result.data) {
      let rawComments = result.data;
      // Page 객체인 경우 content 추출
      if (result.data && typeof result.data === 'object' && 'content' in result.data) {
        rawComments = result.data.content || [];
      }
      const comments = Array.isArray(rawComments) ? rawComments : [];

      // 백엔드 응답을 프론트엔드 형식으로 변환
      const transformedComments = comments.map(comment => transformBackendComment(comment, postId));

      return transformedComments.sort((a, b) =>
        new Date(a.created_at || 0).getTime() -
        new Date(b.created_at || 0).getTime()
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
