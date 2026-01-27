/**
 * 커뮤니티 (자유 게시판) API 인터페이스
 */

import { apiClient } from './client';
import { API_CONFIG } from '../config/apiConfig';
import { ServiceResult } from '../types';
// ============================================
// 타입 정의 (백엔드 enum과 동기화)
// ============================================

/**
 * 댓글 대상 타입 - 백엔드 CommentTargetType enum과 일치
 * @see Replant-BE/domain/post/enums/CommentTargetType.java
 */
export type CommentTargetType = 'POST' | 'VERIFICATION' | 'QNA' | 'DIARY';

/**
 * 미션 출처 타입 - 백엔드 MissionSource enum과 일치
 * @see Replant-BE/domain/mission/enums/MissionSource.java
 */
export type MissionSource = 'OFFICIAL' | 'CUSTOM';

export interface Post {
  id: number;
  userId: number;
  userNickname: string;
  userProfileImg?: string;
  missionTag?: {
    id: number;
    title: string;
    type: MissionSource; // OFFICIAL | CUSTOM
  };
  title: string;
  content: string;
  imageUrls: string[];
  hasValidBadge: boolean; // 작성자가 미션 배지를 보유중인지
  commentCount: number;
  likeCount?: number;
  isLiked?: boolean;
  isAuthor?: boolean; // 본인 게시글 여부 (백엔드에서 제공, userId 기반)
  createdAt: string;
  updatedAt?: string;
}

export interface PostListResponse {
  content: Post[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface CreatePostRequest {
  missionId?: number; // 시스템 미션 태그
  customMissionId?: number; // 커스텀 미션 태그
  title: string;
  content: string;
  imageUrls: string[];
}

export interface UpdatePostRequest {
  missionId?: number;
  title?: string;
  content?: string;
  imageUrls?: string[];
}

export interface Comment {
  id: number;
  userId: number;
  userNickname: string;
  userProfileImg?: string;
  content: string;
  isAuthor?: boolean; // 본인 댓글 여부 (백엔드에서 제공, userId 기반)
  createdAt: string;
  updatedAt?: string;
  // 일반화된 댓글 대상 (QnA, Diary 등에서 사용)
  targetType?: CommentTargetType;
  targetId?: number;
  parentId?: number; // 대댓글용
}

export interface CommentListResponse {
  content: Comment[];
  totalElements: number;
  totalPages: number;
  number: number;
}

// ============================================
// 게시글 API
// ============================================

/**
 * 게시글 목록 조회
 * GET /api/community/posts
 */
export const getPosts = async (params?: {
  missionId?: number;
  customMissionId?: number;
  badgeOnly?: boolean; // 배지 보유자 글만
  page?: number;
  size?: number;
}): Promise<ServiceResult<PostListResponse>> => {
  return apiClient.get<PostListResponse>(API_CONFIG.endpoints.post.list, params);
};

/**
 * 게시글 상세 조회
 * GET /api/community/posts/{postId}
 */
export const getPost = async (postId: number): Promise<ServiceResult<Post>> => {
  const endpoint = API_CONFIG.endpoints.post.detail.replace(':postId', String(postId));
  return apiClient.get<Post>(endpoint);
};

/**
 * 게시글 작성
 * POST /api/community/posts
 * 인증 필요
 */
export const createPost = async (data: CreatePostRequest): Promise<ServiceResult<Post>> => {
  return apiClient.post<Post>(API_CONFIG.endpoints.post.create, data);
};

/**
 * 게시글 수정
 * PUT /api/community/posts/{postId}
 * 작성자만 가능
 */
export const updatePost = async (
  postId: number,
  data: UpdatePostRequest
): Promise<ServiceResult<Post>> => {
  const endpoint = API_CONFIG.endpoints.post.update.replace(':postId', String(postId));
  return apiClient.put<Post>(endpoint, data);
};

/**
 * 게시글 삭제
 * DELETE /api/community/posts/{postId}
 * 작성자만 가능
 */
export const deletePost = async (postId: number): Promise<ServiceResult<{ message: string }>> => {
  const endpoint = API_CONFIG.endpoints.post.delete.replace(':postId', String(postId));
  return apiClient.delete(endpoint);
};

// ============================================
// 댓글 API
// ============================================

/**
 * 댓글 목록 조회
 * GET /api/community/posts/{postId}/comments
 */
export const getComments = async (
  postId: number,
  params?: { page?: number; size?: number }
): Promise<ServiceResult<CommentListResponse>> => {
  const endpoint = API_CONFIG.endpoints.post.comments.replace(':postId', String(postId));
  return apiClient.get<CommentListResponse>(endpoint, params);
};

/**
 * 댓글 작성
 * POST /api/community/posts/{postId}/comments
 * 인증 필요
 */
export const createComment = async (
  postId: number,
  data: { content: string }
): Promise<ServiceResult<Comment>> => {
  const endpoint = API_CONFIG.endpoints.post.createComment.replace(':postId', String(postId));
  return apiClient.post<Comment>(endpoint, data);
};

/**
 * 댓글 수정
 * PUT /api/community/posts/{postId}/comments/{commentId}
 * 작성자만 가능
 */
export const updateComment = async (
  postId: number,
  commentId: number,
  data: { content: string }
): Promise<ServiceResult<Comment>> => {
  const endpoint = API_CONFIG.endpoints.post.updateComment
    .replace(':postId', String(postId))
    .replace(':commentId', String(commentId));
  return apiClient.put<Comment>(endpoint, data);
};

/**
 * 댓글 삭제
 * DELETE /api/community/posts/{postId}/comments/{commentId}
 * 작성자만 가능
 */
export const deleteComment = async (
  postId: number,
  commentId: number
): Promise<ServiceResult<{ message: string }>> => {
  const endpoint = API_CONFIG.endpoints.post.deleteComment
    .replace(':postId', String(postId))
    .replace(':commentId', String(commentId));
  return apiClient.delete(endpoint);
};

// ============================================
// 좋아요 API
// ============================================

/**
 * 좋아요 응답
 */
export interface LikeResponse {
  isLiked: boolean;
  likeCount: number;
  verified?: boolean; // VERIFICATION 타입일 때만: 이번 좋아요로 인증 완료 여부
}

/**
 * 게시글 좋아요 토글
 * POST /api/community/posts/{postId}/like
 * - 이미 좋아요한 경우 취소
 * - VERIFICATION 타입 게시글의 경우, 좋아요 수가 기준치 이상이면 자동 인증 완료
 */
export const toggleLike = async (postId: number): Promise<ServiceResult<LikeResponse>> => {
  const endpoint = `/community/posts/${postId}/like`;
  return apiClient.post<LikeResponse>(endpoint);
};
