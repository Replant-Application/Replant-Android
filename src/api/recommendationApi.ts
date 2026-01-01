/**
 * 유저 추천 API 인터페이스
 */

import { apiClient } from './client';
import { API_CONFIG } from '../config/apiConfig';
import { ServiceResult } from '../types';

// ============================================
// 타입 정의
// ============================================

export type RecommendationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface Recommendation {
  id: number;
  recommendedUser: {
    id: number;
    nickname: string;
    profileImg?: string;
    reant?: {
      name: string;
      level: number;
      stage: 'EGG' | 'BABY' | 'ADULT';
    };
  };
  mission: {
    id: number;
    title: string;
    type: 'SYSTEM' | 'CUSTOM';
  };
  matchReason: {
    ageDiff?: number;
    sameGender?: boolean;
  };
  status: RecommendationStatus;
  expiresAt: string;
  createdAt: string;
}

export interface RecommendationListResponse {
  recommendations: Recommendation[];
  totalCount: number;
}

export interface AcceptRecommendationResponse {
  recommendationId: number;
  status: 'ACCEPTED';
  chatRoom: {
    id: number;
    otherUser: {
      id: number;
      nickname: string;
      profileImg?: string;
    };
    createdAt: string;
  };
  message: string;
}

export interface RejectRecommendationResponse {
  recommendationId: number;
  status: 'REJECTED';
  message: string;
}

// ============================================
// 유저 추천 API
// ============================================

/**
 * 추천 목록 조회
 * GET /api/recommendations
 * 인증 필요
 */
export const getRecommendations = async (params?: {
  status?: RecommendationStatus;
}): Promise<ServiceResult<RecommendationListResponse>> => {
  return apiClient.get<RecommendationListResponse>(API_CONFIG.endpoints.recommendation.list, params);
};

/**
 * 추천 수락
 * POST /api/recommendations/{recommendationId}/accept
 * 인증 필요, 채팅방 자동 생성
 */
export const acceptRecommendation = async (
  recommendationId: number
): Promise<ServiceResult<AcceptRecommendationResponse>> => {
  const endpoint = API_CONFIG.endpoints.recommendation.accept.replace(
    ':recommendationId',
    String(recommendationId)
  );
  return apiClient.post<AcceptRecommendationResponse>(endpoint);
};

/**
 * 추천 거절
 * POST /api/recommendations/{recommendationId}/reject
 * 인증 필요
 */
export const rejectRecommendation = async (
  recommendationId: number
): Promise<ServiceResult<RejectRecommendationResponse>> => {
  const endpoint = API_CONFIG.endpoints.recommendation.reject.replace(
    ':recommendationId',
    String(recommendationId)
  );
  return apiClient.post<RejectRecommendationResponse>(endpoint);
};
