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
    // title이 undefined이거나 빈 문자열인 경우 방지
    const title = postData.title?.trim() || postData.mission_title?.trim() || '자유게시글';
    
    // title이 여전히 빈 문자열이면 기본값 사용
    if (!title || title.length === 0) {
      logError('createPost: title이 비어있음', new Error('Empty title'), { postData });
      return {
        success: false,
        error: '제목을 입력해주세요.'
      };
    }

    // 디버깅: API 호출 전 로그
    console.log('[createPost] API 호출:', {
      endpoint: API_CONFIG.endpoints.post.create,
      title: title,
      hasContent: !!postData.content,
      missionId: postData.mission_id,
    });

    // 백엔드 API로 게시글 생성
    // missionId가 빈 문자열이면 undefined로 처리 (GENERAL 게시글)
    const missionIdNum = postData.mission_id ? parseInt(postData.mission_id, 10) : undefined;

    const result = await apiClient.post<CommunityPost>(API_CONFIG.endpoints.post.create, {
      title: title,
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
    // 백엔드 API 요청 형식에 맞게 변환
    const requestData: {
      missionId?: number;
      title?: string;
      content?: string;
      imageUrls?: string[];
    } = {
      title: updateDataParam.title,
      content: updateDataParam.content,
      imageUrls: updateDataParam.images,
    };
    
    // missionId가 있으면 추가 (미션 태그가 있는 경우)
    if (updateDataParam.mission_id) {
      const missionIdNum = parseInt(updateDataParam.mission_id, 10);
      if (!isNaN(missionIdNum)) {
        requestData.missionId = missionIdNum;
      }
    }
    
    const result = await apiClient.put<BackendPostResponse>(endpoint, requestData);

    if (result.success && result.data) {
      // 백엔드 응답을 프론트엔드 형식으로 변환 (isAuthor 포함)
      const transformed = transformBackendPost(result.data);
      
      // 사용자의 좋아요/스크랩 정보 가져오기 (로컬)
      const storageKeys = getStorageKeys(nickname);
      const userLikes: string[] = await getData(storageKeys.USER_LIKES) || [];
      const userScraps: string[] = await getData(storageKeys.USER_SCRAPS) || [];
      
      return {
        success: true,
        data: {
          ...transformed,
          is_liked: userLikes.includes(transformed.post_id),
          is_scrapped: userScraps.includes(transformed.post_id),
        }
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
  isAuthor?: boolean; // 본인 게시글 여부 (백엔드에서 제공, userId 기반)
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

  // 인증글의 경우 missionTag.title을 우선 사용 (DB에 title이 NULL이어도 missionTag.title은 있음)
  // 일반 게시글의 경우 title 필드 사용
  let postTitle: string;
  if (post.postType === 'VERIFICATION') {
    // 인증글: missionTag.title 우선, 없으면 title, 둘 다 없으면 fallback
    postTitle = post.missionTag?.title || post.title?.trim() || '미션';
  } else {
    // 일반 게시글: title 필드 사용
    postTitle = post.title?.trim() || '자유 게시글';
  }
  
  return {
    id: post.id.toString(),
    post_id: post.id.toString(),
    mission_id: post.missionTag?.id?.toString() || '',
    mission_title: post.missionTag?.title || postTitle,
    mission_emoji: post.postType === 'VERIFICATION' ? '✅' : '📝',
    title: postTitle, // title 필드를 직접 사용
    content: post.content,
    author: post.userId?.toString() || '',
    author_id: post.userId?.toString() || '',
    userId: post.userId, // 백엔드 userId 직접 사용
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
    isAuthor: post.isAuthor, // 백엔드에서 제공하는 본인 게시글 여부 (userId 기반)
    verified,  // 인증 완료 여부
  };
};

/**
 * 게시글 목록 조회 - 백엔드 API 사용
 */
export const getPosts = async (nickname: string): Promise<CommunityPost[]> => {
  try {
    // 백엔드는 Page 객체를 반환 (파라미터 추가)
    const result = await apiClient.get<BackendPageResponse | BackendPostResponse[]>(
      API_CONFIG.endpoints.post.list,
      {
        page: 0,
        size: 100, // 충분히 큰 값으로 설정
      }
    );

    if (result.success && result.data) {
      let backendPosts: BackendPostResponse[] = [];

      // apiClient.get이 이미 data 필드를 추출하므로, result.data는 { content: [...] } 형태
      // Page 객체인지 배열인지 확인
      if (result.data && typeof result.data === 'object' && 'content' in result.data) {
        // Page 객체
        backendPosts = (result.data as BackendPageResponse).content || [];
      } else if (Array.isArray(result.data)) {
        // 배열
        backendPosts = result.data;
      }
      
      // 디버깅: 첫 번째 인증글 확인
      const firstVerification = backendPosts.find(p => p.postType === 'VERIFICATION');
      if (firstVerification) {
        console.log('[getPosts] 첫 번째 인증글:', {
          id: firstVerification.id,
          title: firstVerification.title,
          missionTagTitle: firstVerification.missionTag?.title,
        });
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

      // 백엔드 응답을 프론트엔드 형식으로 변환 (isAuthor 포함)
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
  isAuthor?: boolean; // 본인 댓글 여부 (백엔드에서 제공, userId 기반)
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
      // 백엔드 응답을 프론트엔드 형식으로 변환 (isAuthor 포함)
      const comment: CommunityComment = {
        id: result.data.id.toString(),
        comment_id: result.data.id.toString(),
        post_id: postId,
        content: result.data.content,
        author: result.data.userId.toString(),
        author_id: result.data.userId.toString(),
        userId: result.data.userId,
        author_nickname: result.data.userNickname,
        created_at: result.data.createdAt,
        parent_comment_id: result.data.parentId?.toString(),
        isAuthor: result.data.isAuthor, // 백엔드에서 제공하는 본인 댓글 여부
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
  isAuthor?: boolean; // 본인 댓글 여부 (백엔드에서 제공, userId 기반)
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
  author_id: comment.userId.toString(), // 작성자 ID (레거시 호환)
  userId: comment.userId, // 백엔드 userId 직접 사용
  author_nickname: comment.userNickname,
  created_at: comment.createdAt,
  updated_at: comment.updatedAt,
  parent_comment_id: comment.parentId?.toString(),
  isAuthor: comment.isAuthor, // 백엔드에서 제공하는 본인 댓글 여부 (userId 기반)
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
): Promise<ServiceResult<{ isLiked: boolean; likeCount: number; verified?: boolean; status?: string }>> => {
  try {
    // 백엔드 좋아요 토글 API 호출
    // 백엔드에서 좋아요 3개 이상 시 자동으로 status = "APPROVED"로 변경하고 UserMission.status = COMPLETED로 변경
    const result = await apiClient.post<{ isLiked: boolean; likeCount: number; verified?: boolean; status?: string }>(
      `/community/posts/${postId}/like`
    );

    if (result.success && result.data) {
      return {
        success: true,
        data: {
          isLiked: result.data.isLiked,
          likeCount: result.data.likeCount,
          verified: result.data.verified,
          status: result.data.status,
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
