/**
 * Reant(펫/캐릭터) API
 * 백엔드 ReantController와 연동
 */

import { apiClient } from './client';
import { ServiceResult } from '../types';

// ============================================
// 타입 정의
// ============================================

export type ReantStage = 'EGG' | 'BABY' | 'TEEN' | 'ADULT';

export interface ReantResponse {
  id: number;
  name: string;
  level: number;
  exp: number;
  nextLevelExp?: number;
  stage: ReantStage;
  maxLevel: number;
  mood: number;
  health: number;
  hunger: number;
  appearance?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ReantStatusResponse {
  id: number;
  name: string;
  level: number;
  exp: number;
  stage: ReantStage;
  mood: number;
  health: number;
  hunger: number;
  nextLevelExp: number;
  expProgress: number; // 현재 레벨 진행률 (0-100%)
}

export interface ReantUpdateRequest {
  name?: string;
  appearance?: Record<string, any>;
}

// ============================================
// API 함수
// ============================================

/**
 * 내 펫 조회
 * GET /api/reant
 */
export const getMyReant = async (): Promise<ServiceResult<ReantResponse>> => {
  return apiClient.get<ReantResponse>('/reant');
};

/**
 * 펫 정보 수정
 * PUT /api/reant
 */
export const updateReant = async (
  data: ReantUpdateRequest
): Promise<ServiceResult<ReantResponse>> => {
  return apiClient.put<ReantResponse>('/reant', data);
};

/**
 * 펫 상태 조회
 * GET /api/reant/status
 */
export const getReantStatus = async (): Promise<ServiceResult<ReantStatusResponse>> => {
  return apiClient.get<ReantStatusResponse>('/reant/status');
};
