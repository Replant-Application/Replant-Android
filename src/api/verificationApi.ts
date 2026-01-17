/**
 * 인증 게시판 (Verification) API 인터페이스
 */

import { apiClient } from './client';
import { API_CONFIG } from '../config/apiConfig';
import { ServiceResult } from '../types';

// ============================================
// 타입 정의
// ============================================

/**
 * 미션 태그 정보
 */
export interface MissionTag {
  id: number;
  title: string;
  type: 'OFFICIAL' | 'CUSTOM';
}

/**
 * 인증 게시글
 */
export interface VerificationPost {
  id: number;
  postType: 'VERIFICATION';
  userId: number;
  userNickname: string;
  userProfileImg?: string;
  missionTag?: MissionTag;
  title?: string; // API 응답에 직접 포함된 제목 필드 (missionTag.title과 동일)
  content: string;
  imageUrls: string[];
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
  status: 'PENDING' | 'APPROVED';
  verifiedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * 인증 게시글 목록 응답
 */
export interface VerificationListResponse {
  content: VerificationPost[];
  totalElements: number;
  totalPages: number;
  number: number;
}

/**
 * 인증글 작성 요청
 */
export interface CreateVerificationRequest {
  userMissionId: number;
  content: string;
  imageUrls?: string[];
}

/**
 * 좋아요/투표 응답
 */
export interface VoteResponse {
  isLiked: boolean;
  likeCount: number;
  verified: boolean; // 이번 좋아요로 인증이 완료되었는지
}

// ============================================
// 인증 게시판 API
// ============================================

/**
 * 인증글 목록 조회
 * GET /api/verifications
 */
export const getVerificationPosts = async (params?: {
  status?: 'PENDING' | 'APPROVED';
  page?: number;
  size?: number;
}): Promise<ServiceResult<VerificationListResponse>> => {
  return apiClient.get<VerificationListResponse>(API_CONFIG.endpoints.verification.list, params);
};

/**
 * 인증글 상세 조회
 * GET /api/verifications/{verificationId}
 */
export const getVerificationPost = async (verificationId: number): Promise<ServiceResult<VerificationPost>> => {
  const endpoint = API_CONFIG.endpoints.verification.detail.replace(':verificationId', String(verificationId));
  return apiClient.get<VerificationPost>(endpoint);
};

/**
 * 인증글 작성
 * POST /api/verifications
 * 인증 필요
 */
export const createVerificationPost = async (data: CreateVerificationRequest): Promise<ServiceResult<VerificationPost>> => {
  // 디버깅: API 호출 전 로그
  console.log('[createVerificationPost] API 호출:', {
    endpoint: API_CONFIG.endpoints.verification.create,
    userMissionId: data.userMissionId,
    hasContent: !!data.content,
    imageUrlsCount: data.imageUrls?.length || 0,
  });
  
  return apiClient.post<VerificationPost>(API_CONFIG.endpoints.verification.create, data);
};

/**
 * 인증글에 좋아요/투표
 * POST /api/verifications/{verificationId}/votes
 * 좋아요 수가 기준치 이상이면 자동 인증 완료
 */
export const voteVerification = async (verificationId: number): Promise<ServiceResult<VoteResponse>> => {
  const endpoint = API_CONFIG.endpoints.verification.vote.replace(':verificationId', String(verificationId));
  return apiClient.post<VoteResponse>(endpoint);
};
