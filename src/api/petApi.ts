/**
 * 펫 (Reant) API 인터페이스
 */

import { apiClient } from './client';
import { API_CONFIG } from '../config/apiConfig';
import { ServiceResult } from '../types';

/**
 * 펫 정보 조회 응답
 */
export interface ReantResponse {
  id: number;
  name: string;
  level: number;
  exp: number;
  stage: 'EGG' | 'BABY' | 'ADULT';
  appearance: {
    color: string;
    accessory?: string;
  };
  nextLevelExp: number;
}

/**
 * 펫 정보 수정 요청
 */
export interface UpdateReantRequest {
  name?: string;
  appearance?: {
    color?: string;
    accessory?: string;
  };
}

/**
 * 펫 정보 수정 응답
 */
export interface UpdateReantResponse {
  id: number;
  name: string;
  level: number;
  exp: number;
  stage: 'EGG' | 'BABY' | 'ADULT';
  appearance: {
    color: string;
    accessory?: string;
  };
}

/**
 * 내 펫 조회
 * GET /api/reant
 * 인증 필요
 */
export const getMyReant = async (): Promise<ServiceResult<ReantResponse>> => {
  return apiClient.get<ReantResponse>(API_CONFIG.endpoints.reant.get);
};

/**
 * 펫 정보 수정
 * PUT /api/reant
 * 인증 필요
 *
 * @param data 수정할 펫 정보 (이름, 외형)
 */
export const updateReant = async (
  data: UpdateReantRequest
): Promise<ServiceResult<UpdateReantResponse>> => {
  return apiClient.put<UpdateReantResponse>(API_CONFIG.endpoints.reant.update, data);
};

