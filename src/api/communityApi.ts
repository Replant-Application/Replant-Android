/**
 * 커뮤니티 API 인터페이스
 * 백엔드 연동 시 실제 구현 필요
 */

import { apiClient } from './client';
import { API_CONFIG } from '../config/apiConfig';
import { ServiceResult, CommunityPost, CommunityComment, CommunityPostData } from '../types';

/**
 * 게시글 작성
 * POST /community
 */
export const createPost = async (data: CommunityPostData): Promise<ServiceResult<CommunityPost>> => {
  // TODO: 백엔드 개발자가 실제 구현
  return apiClient.post<CommunityPost>(API_CONFIG.endpoints.community.createPost, data);
};

/**
 * 게시글 수정
 * PATCH /community/:id
 */
export const updatePost = async (id: string, data: Partial<CommunityPostData>): Promise<ServiceResult<CommunityPost>> => {
  // TODO: 백엔드 개발자가 실제 구현
  const endpoint = API_CONFIG.endpoints.community.updatePost.replace(':id', id);
  return apiClient.patch<CommunityPost>(endpoint, data);
};

/**
 * 게시글 삭제
 * POST /community/:id (명세서에 POST로 명시됨)
 */
export const deletePost = async (id: string): Promise<ServiceResult<void>> => {
  // TODO: 백엔드 개발자가 실제 구현
  const endpoint = API_CONFIG.endpoints.community.deletePost.replace(':id', id);
  return apiClient.post<void>(endpoint);
};

/**
 * 댓글 작성
 * POST /community/:postId/comments
 */
export const createComment = async (postId: string, data: { content: string; parent_comment_id?: string }): Promise<ServiceResult<CommunityComment>> => {
  // TODO: 백엔드 개발자가 실제 구현
  const endpoint = API_CONFIG.endpoints.community.createComment.replace(':postId', postId);
  return apiClient.post<CommunityComment>(endpoint, data);
};

/**
 * 댓글 수정
 * PATCH /community/:postId/comments/:id
 */
export const updateComment = async (postId: string, commentId: string, data: { content: string }): Promise<ServiceResult<CommunityComment>> => {
  // TODO: 백엔드 개발자가 실제 구현
  let endpoint = API_CONFIG.endpoints.community.updateComment.replace(':postId', postId);
  endpoint = endpoint.replace(':id', commentId);
  return apiClient.patch<CommunityComment>(endpoint, data);
};

/**
 * 댓글 삭제
 * DELETE /community/:postId/comments/:id
 */
export const deleteComment = async (postId: string, commentId: string): Promise<ServiceResult<void>> => {
  // TODO: 백엔드 개발자가 실제 구현
  let endpoint = API_CONFIG.endpoints.community.deleteComment.replace(':postId', postId);
  endpoint = endpoint.replace(':id', commentId);
  return apiClient.delete<void>(endpoint);
};

/**
 * 좋아요
 * POST /community/:id/like
 */
export const likePost = async (id: string): Promise<ServiceResult<void>> => {
  // TODO: 백엔드 개발자가 실제 구현
  const endpoint = API_CONFIG.endpoints.community.like.replace(':id', id);
  return apiClient.post<void>(endpoint);
};

/**
 * 좋아요 취소
 * POST /community/:id/unlike
 */
export const unlikePost = async (id: string): Promise<ServiceResult<void>> => {
  // TODO: 백엔드 개발자가 실제 구현
  const endpoint = API_CONFIG.endpoints.community.unlike.replace(':id', id);
  return apiClient.post<void>(endpoint);
};

/**
 * 스크랩
 * POST /community/:id/scrap
 */
export const scrapPost = async (id: string): Promise<ServiceResult<void>> => {
  // TODO: 백엔드 개발자가 실제 구현
  const endpoint = API_CONFIG.endpoints.community.scrap.replace(':id', id);
  return apiClient.post<void>(endpoint);
};

/**
 * 필터링
 * GET /community/filter
 */
export const filterPosts = async (params: { category?: string; sortBy?: 'latest' | 'popular' }): Promise<ServiceResult<CommunityPost[]>> => {
  // TODO: 백엔드 개발자가 실제 구현
  return apiClient.get<CommunityPost[]>(API_CONFIG.endpoints.community.filter, params);
};

/**
 * 검색
 * GET /community/search
 */
export const searchPosts = async (query: string): Promise<ServiceResult<CommunityPost[]>> => {
  // TODO: 백엔드 개발자가 실제 구현
  return apiClient.get<CommunityPost[]>(API_CONFIG.endpoints.community.search, { q: query });
};

/**
 * 게시판 불러오기
 * GET /community
 */
export const getPosts = async (params?: { page?: number; limit?: number }): Promise<ServiceResult<CommunityPost[]>> => {
  // TODO: 백엔드 개발자가 실제 구현
  return apiClient.get<CommunityPost[]>(API_CONFIG.endpoints.community.getPosts, params);
};

/**
 * 게시글 불러오기
 * GET /community/:id
 */
export const getPost = async (id: string): Promise<ServiceResult<CommunityPost>> => {
  // TODO: 백엔드 개발자가 실제 구현
  const endpoint = API_CONFIG.endpoints.community.getPost.replace(':id', id);
  return apiClient.get<CommunityPost>(endpoint);
};

/**
 * 댓글 불러오기
 * GET /community/:id/comments
 */
export const getComments = async (postId: string): Promise<ServiceResult<CommunityComment[]>> => {
  // TODO: 백엔드 개발자가 실제 구현
  const endpoint = API_CONFIG.endpoints.community.getComments.replace(':id', postId);
  return apiClient.get<CommunityComment[]>(endpoint);
};

