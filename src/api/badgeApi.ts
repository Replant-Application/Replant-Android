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
 */
export const getMyBadges = async (): Promise<ServiceResult<BadgeListResponse>> => {
  return apiClient.get<BadgeListResponse>(API_CONFIG.endpoints.badge.list);
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
