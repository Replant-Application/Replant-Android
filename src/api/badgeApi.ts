/**
 * 뱃지 API 인터페이스
 */

import { apiClient } from './client';
import { API_CONFIG } from '../config/apiConfig';
import { ServiceResult } from '../types';
import { MissionType } from './missionApi';

// ============================================
// 타입 정의
// ============================================

export interface Badge {
  id: number;
  missionType: 'SYSTEM' | 'CUSTOM';
  mission?: {
    id: number;
    title: string;
  };
  customMission?: {
    id: number;
    title: string;
  };
  issuedAt: string;
  expiresAt: string;
  remainingDays?: number;
  isExpired?: boolean;
}

// 백엔드는 Badge 배열을 직접 반환
export interface BadgeListResponse {
  badges: Badge[];
  totalCount: number;
}

export interface BadgeHistoryResponse {
  content: Badge[];
  totalElements: number;
  totalPages: number;
  number: number;
}

// ============================================
// 뱃지 API
// ============================================

/**
 * 내 유효 뱃지 목록 조회
 * GET /api/badges
 * 인증 필요
 * 백엔드: List<BadgeResponse> 반환 (배열 직접 반환)
 */
export const getMyBadges = async (): Promise<ServiceResult<BadgeListResponse>> => {
  // 백엔드가 배열을 직접 반환하므로 변환 필요
  const result = await apiClient.get<Badge[]>(API_CONFIG.endpoints.badge.list);

  if (result.success && result.data) {
    // 배열을 BadgeListResponse 형식으로 변환
    return {
      success: true,
      data: {
        badges: result.data,
        totalCount: result.data.length,
      },
    };
  }

  return {
    success: result.success,
    error: result.error,
    data: undefined,
  };
};

/**
 * 뱃지 히스토리 조회
 * GET /api/badges/history
 * 인증 필요
 * 만료된 뱃지 포함
 */
export const getBadgeHistory = async (params?: {
  page?: number;
  size?: number;
}): Promise<ServiceResult<BadgeHistoryResponse>> => {
  return apiClient.get<BadgeHistoryResponse>(API_CONFIG.endpoints.badge.history, params);
};
