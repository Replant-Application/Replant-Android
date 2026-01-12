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
    // missionId가 빈 문자열이면 undefined로 처리 (GENERAL 게시글)
    const missionIdNum = postData.mission_id ? parseInt(postData.mission_id, 10) : undefined;

    const result = await apiClient.post<CommunityPost>(API_CONFIG.endpoints.post.create, {
      title: postData.title || postData.mission_title || '자유게시글',
      content: postData.content,
      missionId: !isNaN(missionIdNum as number) ? missionIdNum : undefined,
      imageUrls: postData.images || [],
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
  postType: 'GENERAL' | 'VERIFICATION';  // 게시글 타입
  userId: number;
  userNickname: string;
  userProfileImg?: string;
  missionTag?: {
    id: number;
    title: string;
    type: 'OFFICIAL' | 'CUSTOM';
  };
  title: string;
  content: string;
  imageUrls: string[];
  hasValidBadge: boolean;
  commentCount: number;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt?: string;
  // 인증글 전용 필드
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  approveCount?: number;
  rejectCount?: number;
  verifiedAt?: string;
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
const transformBackendPost = (post: BackendPostResponse): CommunityPost => {
  // 인증 상태 결정
  // - 인증글(VERIFICATION)이고 APPROVED 상태면 verified = true
  // - 인증글이고 PENDING 상태면 verified = false
  // - 일반글(GENERAL)이면 verified = undefined (인증 개념 없음)
  let verified: boolean | undefined = undefined;
  if (post.postType === 'VERIFICATION') {
    verified = post.status === 'APPROVED';
  }

  return {
    id: post.id.toString(),
    post_id: post.id.toString(),
    mission_id: post.missionTag?.id?.toString() || '',
    mission_title: post.missionTag?.title || (post.postType === 'VERIFICATION' ? '미션 인증' : '자유 게시글'),
    mission_emoji: post.postType === 'VERIFICATION' ? '✅' : '📝',
    title: post.title || post.missionTag?.title || '제목 없음',
    content: post.content,
    author: post.userId?.toString() || '',
    author_id: post.userId?.toString() || '',
    author_nickname: post.userNickname || '익명',
    created_at: post.createdAt,
    updated_at: post.updatedAt,
    like_count: post.likeCount || 0,
    comment_count: post.commentCount || 0,
    scrap_count: 0, // 백엔드에서 제공하지 않음 - 로컬 관리
    images: post.imageUrls || [],
    tags: post.missionTag ? [post.missionTag.title] : [],
    category: post.postType === 'VERIFICATION' ? '인증' : '일반',
    is_liked: post.isLiked || false,
    verified,  // 인증 완료 여부
  };
};

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

      // 스크랩 정보 가져오기 (로컬 - 백엔드에 스크랩 기능 없음)
      const storageKeys = getStorageKeys(nickname);
      const userScraps: string[] = await getData(storageKeys.USER_SCRAPS) || [];

      // 백엔드 응답을 프론트엔드 형식으로 변환 + 스크랩 상태 추가
      // 좋아요(likeCount, isLiked)는 백엔드에서 제공
      return backendPosts.map(post => {
        const transformed = transformBackendPost(post);
        return {
          ...transformed,
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

// 댓글 생성 백엔드 응답 타입
interface CreateCommentResponse {
  id: number;
  userId: number;
  userNickname: string;
  userProfileImg?: string;
  content: string;
  parentId?: number;
  createdAt: string;
}

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
    const result = await apiClient.post<CreateCommentResponse>(endpoint, {
      content: content.trim(),
      parentId: parentCommentId ? parseInt(parentCommentId, 10) : undefined,
    });

    if (result.success && result.data) {
      // 백엔드 응답을 프론트엔드 형식으로 변환
      const comment: CommunityComment = {
        id: result.data.id.toString(),
        comment_id: result.data.id.toString(),
        post_id: postId,
        content: result.data.content,
        author: result.data.userId.toString(),
        author_nickname: result.data.userNickname,
        created_at: result.data.createdAt,
        parent_comment_id: result.data.parentId?.toString(),
      };
      return {
        success: true,
        data: comment
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

    const result = await apiClient.put<CreateCommentResponse>(endpoint, {
      content: content.trim(),
    });

    if (result.success && result.data) {
      // 백엔드 응답을 프론트엔드 형식으로 변환
      const comment: CommunityComment = {
        id: result.data.id.toString(),
        comment_id: result.data.id.toString(),
        post_id: postId || '',
        content: result.data.content,
        author: result.data.userId.toString(),
        author_nickname: result.data.userNickname,
        created_at: result.data.createdAt,
        parent_comment_id: result.data.parentId?.toString(),
      };
      return {
        success: true,
        data: comment
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

// 백엔드 댓글 응답 타입
interface BackendComment {
  id: number;
  userId: number;
  userNickname: string;
  userProfileImg?: string;
  content: string;
  parentId?: number;
  replies?: BackendComment[];
  replyCount?: number;
  createdAt: string;
  updatedAt?: string;
}

interface BackendCommentPageResponse {
  content: BackendComment[];
  totalElements: number;
  totalPages: number;
  number: number;
}

/**
 * 백엔드 댓글을 프론트엔드 형식으로 변환
 */
const transformBackendComment = (comment: BackendComment, postId: string): CommunityComment => ({
  id: comment.id.toString(),
  comment_id: comment.id.toString(),
  post_id: postId,
  content: comment.content,
  author: comment.userId.toString(),
  author_nickname: comment.userNickname,
  created_at: comment.createdAt,
  updated_at: comment.updatedAt,
  parent_comment_id: comment.parentId?.toString(),
});

/**
 * 댓글 목록 조회 - 백엔드 API 사용
 */
export const getComments = async (
  postId: string,
  nickname: string
): Promise<CommunityComment[]> => {
  try {
    const endpoint = API_CONFIG.endpoints.post.comments.replace(':postId', postId);
    const result = await apiClient.get<BackendCommentPageResponse | BackendComment[]>(endpoint);

    if (result.success && result.data) {
      let backendComments: BackendComment[] = [];

      // Page 객체인지 배열인지 확인
      if (result.data && typeof result.data === 'object' && 'content' in result.data) {
        backendComments = (result.data as BackendCommentPageResponse).content || [];
      } else if (Array.isArray(result.data)) {
        backendComments = result.data;
      }

      // 댓글과 대댓글 변환
      const allComments: CommunityComment[] = [];
      backendComments.forEach(comment => {
        allComments.push(transformBackendComment(comment, postId));
        // 대댓글도 변환
        if (comment.replies && comment.replies.length > 0) {
          comment.replies.forEach(reply => {
            allComments.push(transformBackendComment(reply, postId));
          });
        }
      });

      // 생성일 기준 정렬
      return allComments.sort((a, b) =>
        new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
      );
    }

    return [];
  } catch (error) {
    logError('댓글 목록 조회 실패', error as Error, { postId, nickname });
    return [];
  }
};

/**
 * 좋아요 토글 - 백엔드 API 사용
 */
export const toggleLike = async (
  postId: string,
  _nickname: string
): Promise<ServiceResult<{ isLiked: boolean; likeCount: number }>> => {
  try {
    // 백엔드 좋아요 토글 API 호출
    const result = await apiClient.post<{ isLiked: boolean; likeCount: number }>(
      `/community/posts/${postId}/like`
    );

    if (result.success && result.data) {
      return {
        success: true,
        data: {
          isLiked: result.data.isLiked,
          likeCount: result.data.likeCount,
        }
      };
    }

    return {
      success: false,
      error: result.error || '좋아요 처리에 실패했습니다.'
    };
  } catch (error) {
    logError('좋아요 토글 실패', error as Error, { postId });
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

// 좋아요 인증 임계값 (테스트용: 1개)
const LIKE_VERIFICATION_THRESHOLD = 1;

/**
 * 좋아요 인증 확인 - 게시글의 좋아요가 임계값에 도달했는지 확인
 */
export const checkLikeVerification = async (
  postId: string,
  likeCount: number,
  missionId: string,
  nickname: string
): Promise<ServiceResult<{ verified: boolean; missionId: string; experience: number }>> => {
  try {
    // 좋아요가 임계값 이상인지 확인
    if (likeCount < LIKE_VERIFICATION_THRESHOLD) {
      return { success: true, data: { verified: false, missionId, experience: 0 } };
    }

    // 미션이 이미 인증되었는지 확인
    const storageKeys = getStorageKeys(nickname);
    const missions = await getData(storageKeys.MISSIONS) || [];
    const mission = missions.find((m: { mission_id: string }) => m.mission_id === missionId);

    if (!mission) {
      return { success: true, data: { verified: false, missionId, experience: 0 } };
    }

    // 이미 인증된 경우
    if (mission.verified) {
      return { success: true, data: { verified: true, missionId, experience: 0 } };
    }

    // 미션이 완료되었고 인증 대기 중인 경우
    if (mission.completed && !mission.verified) {
      // 미션 인증 완료 처리
      const updatedMission = {
        ...mission,
        verified: true,
        verification_method: 'like',
        verified_at: new Date().toISOString(),
      };

      const updatedMissions = missions.map((m: { mission_id: string }) =>
        m.mission_id === missionId ? updatedMission : m
      );
      await setData(storageKeys.MISSIONS, updatedMissions);

      return {
        success: true,
        data: {
          verified: true,
          missionId,
          experience: mission.experience || 10
        }
      };
    }

    return { success: true, data: { verified: false, missionId, experience: 0 } };
  } catch (error) {
    logError('좋아요 인증 확인 실패', error as Error, { postId, missionId, nickname });
    return {
      success: false,
      error: (error as Error).message
    };
  }
};
