/**
 * 다이어리 API
 */

import { apiClient } from './client';
import { API_CONFIG } from '../config/apiConfig';
import { ServiceResult } from '../types';

// ============================================
// 타입 정의
// ============================================

export type EmotionType = 'happy' | 'excited' | 'calm' | 'grateful' | 'sad' | 'angry' | 'anxious' | 'tired';

export interface DiaryResponse {
  id: number;
  date: string;
  emotion: EmotionType;
  content: string;
  weather?: string;
  location?: string;
  imageUrls: string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface DiaryRequest {
  date: string;
  emotion: EmotionType;
  content: string;
  weather?: string;
  location?: string;
  imageUrls?: string[];
  isPrivate?: boolean;
}

export interface DiaryListResponse {
  content: DiaryResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface DiaryStatsResponse {
  totalCount: number;
  emotionStats: Record<string, number>;
}

// ============================================
// API 함수
// ============================================

/**
 * 다이어리 목록 조회
 * GET /api/diaries
 */
export const getDiaries = async (params?: {
  page?: number;
  size?: number;
}): Promise<ServiceResult<DiaryListResponse>> => {
  return apiClient.get<DiaryListResponse>(API_CONFIG.endpoints.diary.list, params);
};

/**
 * 다이어리 상세 조회
 * GET /api/diaries/{diaryId}
 */
export const getDiary = async (diaryId: number): Promise<ServiceResult<DiaryResponse>> => {
  const endpoint = API_CONFIG.endpoints.diary.detail.replace(':diaryId', String(diaryId));
  return apiClient.get<DiaryResponse>(endpoint);
};

/**
 * 날짜별 다이어리 조회
 * GET /api/diaries/by-date
 */
export const getDiaryByDate = async (date: string): Promise<ServiceResult<DiaryResponse>> => {
  return apiClient.get<DiaryResponse>(API_CONFIG.endpoints.diary.byDate, { date });
};

/**
 * 기간별 다이어리 조회
 * GET /api/diaries/range
 */
export const getDiariesByRange = async (
  startDate: string,
  endDate: string
): Promise<ServiceResult<DiaryResponse[]>> => {
  return apiClient.get<DiaryResponse[]>(API_CONFIG.endpoints.diary.range, { startDate, endDate });
};

/**
 * 다이어리 생성
 * POST /api/diaries
 */
export const createDiary = async (data: DiaryRequest): Promise<ServiceResult<DiaryResponse>> => {
  return apiClient.post<DiaryResponse>(API_CONFIG.endpoints.diary.create, data);
};

/**
 * 다이어리 수정
 * PUT /api/diaries/{diaryId}
 */
export const updateDiary = async (
  diaryId: number,
  data: DiaryRequest
): Promise<ServiceResult<DiaryResponse>> => {
  const endpoint = API_CONFIG.endpoints.diary.update.replace(':diaryId', String(diaryId));
  return apiClient.put<DiaryResponse>(endpoint, data);
};

/**
 * 다이어리 삭제
 * DELETE /api/diaries/{diaryId}
 */
export const deleteDiary = async (diaryId: number): Promise<ServiceResult<{ message: string }>> => {
  const endpoint = API_CONFIG.endpoints.diary.delete.replace(':diaryId', String(diaryId));
  return apiClient.delete(endpoint);
};

/**
 * 다이어리 통계 조회
 * GET /api/diaries/stats
 */
export const getDiaryStats = async (): Promise<ServiceResult<DiaryStatsResponse>> => {
  return apiClient.get<DiaryStatsResponse>(API_CONFIG.endpoints.diary.stats);
};
