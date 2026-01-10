/**
 * 미션세트(투두리스트) API
 * 백엔드 MissionSetController와 연동
 */

import { apiClient } from './client';
import { ServiceResult } from '../types';

// ============================================
// 타입 정의
// ============================================

export interface MissionSetMission {
  missionId: number;
  missionTitle: string;
  displayOrder: number;
}

export interface MissionSetSimple {
  id: number;
  title: string;
  description?: string;
  creatorId: number;
  creatorNickname: string;
  isPublic: boolean;
  missionCount: number;
  addedCount: number;
  averageRating: number;
  createdAt: string;
}

export interface MissionSetDetail extends MissionSetSimple {
  missions: MissionSetMission[];
}

export interface MissionSetListResponse {
  content: MissionSetSimple[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface CreateMissionSetRequest {
  title: string;
  description?: string;
  isPublic: boolean;
  missionIds?: number[];
}

export interface UpdateMissionSetRequest {
  title?: string;
  description?: string;
  isPublic?: boolean;
}

// ============================================
// API 함수
// ============================================

/**
 * 공개 미션세트 목록 조회 (담은수+평점순)
 * GET /api/mission-sets
 */
export const getMissionSets = async (params?: {
  page?: number;
  size?: number;
}): Promise<ServiceResult<MissionSetListResponse>> => {
  return apiClient.get<MissionSetListResponse>('/mission-sets', params);
};

/**
 * 내 미션세트 목록 조회
 * GET /api/mission-sets/my
 */
export const getMyMissionSets = async (params?: {
  page?: number;
  size?: number;
}): Promise<ServiceResult<MissionSetListResponse>> => {
  return apiClient.get<MissionSetListResponse>('/mission-sets/my', params);
};

/**
 * 미션세트 검색
 * GET /api/mission-sets/search
 */
export const searchMissionSets = async (params: {
  keyword: string;
  page?: number;
  size?: number;
}): Promise<ServiceResult<MissionSetListResponse>> => {
  return apiClient.get<MissionSetListResponse>('/mission-sets/search', params);
};

/**
 * 미션세트 상세 조회
 * GET /api/mission-sets/:id
 */
export const getMissionSetDetail = async (
  id: number
): Promise<ServiceResult<MissionSetDetail>> => {
  return apiClient.get<MissionSetDetail>(`/mission-sets/${id}`);
};

/**
 * 미션세트 생성
 * POST /api/mission-sets
 */
export const createMissionSet = async (
  data: CreateMissionSetRequest
): Promise<ServiceResult<MissionSetDetail>> => {
  return apiClient.post<MissionSetDetail>('/mission-sets', data);
};

/**
 * 미션세트 수정
 * PUT /api/mission-sets/:id
 */
export const updateMissionSet = async (
  id: number,
  data: UpdateMissionSetRequest
): Promise<ServiceResult<MissionSetDetail>> => {
  return apiClient.put<MissionSetDetail>(`/mission-sets/${id}`, data);
};

/**
 * 미션세트 삭제
 * DELETE /api/mission-sets/:id
 */
export const deleteMissionSet = async (
  id: number
): Promise<ServiceResult<{ message: string }>> => {
  return apiClient.delete<{ message: string }>(`/mission-sets/${id}`);
};

/**
 * 미션세트에 미션 추가
 * POST /api/mission-sets/:id/missions
 */
export const addMissionToSet = async (
  setId: number,
  missionId: number
): Promise<ServiceResult<MissionSetDetail>> => {
  return apiClient.post<MissionSetDetail>(`/mission-sets/${setId}/missions`, { missionId });
};

/**
 * 미션세트에서 미션 제거
 * DELETE /api/mission-sets/:id/missions/:missionId
 */
export const removeMissionFromSet = async (
  setId: number,
  missionId: number
): Promise<ServiceResult<MissionSetDetail>> => {
  return apiClient.delete<MissionSetDetail>(`/mission-sets/${setId}/missions/${missionId}`);
};

/**
 * 미션세트 미션 순서 변경
 * PUT /api/mission-sets/:id/missions/reorder
 */
export const reorderMissions = async (
  setId: number,
  missionIds: number[]
): Promise<ServiceResult<MissionSetDetail>> => {
  return apiClient.put<MissionSetDetail>(`/mission-sets/${setId}/missions/reorder`, { missionIds });
};

/**
 * 미션세트 담기 (복사)
 * POST /api/mission-sets/:id/copy
 */
export const copyMissionSet = async (
  id: number
): Promise<ServiceResult<MissionSetDetail>> => {
  return apiClient.post<MissionSetDetail>(`/mission-sets/${id}/copy`);
};

// ============================================
// 리뷰 관련 타입 정의
// ============================================

export interface MissionSetReview {
  id: number;
  missionSetId: number;
  missionSetTitle: string;
  user: {
    id: number;
    nickname: string;
  };
  rating: number;
  content?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MissionSetReviewListResponse {
  content: MissionSetReview[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface CreateReviewRequest {
  rating: number;
  content?: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  content?: string;
}

// ============================================
// 리뷰 API 함수
// ============================================

/**
 * 리뷰 작성
 * POST /api/mission-sets/:missionSetId/reviews
 */
export const createReview = async (
  missionSetId: number,
  data: CreateReviewRequest
): Promise<ServiceResult<MissionSetReview>> => {
  return apiClient.post<MissionSetReview>(`/mission-sets/${missionSetId}/reviews`, data);
};

/**
 * 리뷰 목록 조회
 * GET /api/mission-sets/:missionSetId/reviews
 */
export const getReviews = async (
  missionSetId: number,
  params?: { page?: number; size?: number }
): Promise<ServiceResult<MissionSetReviewListResponse>> => {
  return apiClient.get<MissionSetReviewListResponse>(`/mission-sets/${missionSetId}/reviews`, params);
};

/**
 * 내 리뷰 조회
 * GET /api/mission-sets/:missionSetId/reviews/my
 */
export const getMyReview = async (
  missionSetId: number
): Promise<ServiceResult<MissionSetReview | null>> => {
  return apiClient.get<MissionSetReview | null>(`/mission-sets/${missionSetId}/reviews/my`);
};

/**
 * 리뷰 수정
 * PUT /api/mission-sets/reviews/:reviewId
 */
export const updateReview = async (
  reviewId: number,
  data: UpdateReviewRequest
): Promise<ServiceResult<MissionSetReview>> => {
  return apiClient.put<MissionSetReview>(`/mission-sets/reviews/${reviewId}`, data);
};

/**
 * 리뷰 삭제
 * DELETE /api/mission-sets/reviews/:reviewId
 */
export const deleteReview = async (
  reviewId: number
): Promise<ServiceResult<{ message: string }>> => {
  return apiClient.delete<{ message: string }>(`/mission-sets/reviews/${reviewId}`);
};
