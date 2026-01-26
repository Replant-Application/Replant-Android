/**
 * 식사 로그 관련 API
 * 식사 미션 조회, 인증, 통계 등
 */

import { apiClient } from './client';
import { ServiceResult } from '../types';

// ============================================
// 타입 정의
// ============================================

/**
 * 식사 타입
 */
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

/**
 * 식사 로그 상태
 */
export type MealLogStatus = 'PENDING' | 'VERIFIED' | 'EXPIRED';

/**
 * 식사 로그 인터페이스
 */
export interface MealLog {
  id: number;
  userId: number;
  mealType: MealType;
  title?: string;
  content?: string;
  imageUrls?: string[];
  tasteRating?: number; // 1-5
  status: MealLogStatus;
  missionId?: number;
  userMissionId?: number;
  verifiedAt?: string;
  expiredAt?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * 현재 진행 중인 식사 미션 응답
 */
export interface CurrentMealMissionResponse {
  mealLog: MealLog | null;
  mealType: MealType;
  remainingTime?: number; // 남은 시간 (초)
  isExpired: boolean;
}

/**
 * 식사 인증 요청
 */
export interface VerifyMealRequest {
  title: string;
  description: string;
  rating: number; // 1-5
  imageUrls?: string[];
}

/**
 * 식사 인증 응답
 */
export interface VerifyMealResponse {
  mealLog: MealLog;
  experienceGained: number;
  levelUp?: boolean;
  newLevel?: number;
}

/**
 * 일별 식사 기록 응답
 */
export interface DailyMealLogsResponse {
  date: string;
  mealLogs: MealLog[];
  completedCount: number;
  totalCount: number;
}

/**
 * 날짜 범위 조회 응답
 */
export interface MealLogsRangeResponse {
  startDate: string;
  endDate: string;
  mealLogs: MealLog[];
  totalCount: number;
}

/**
 * 식사 통계 응답
 */
export interface MealStatsResponse {
  totalMeals: number;
  verifiedMeals: number;
  averageTasteRating: number;
  completionRate: number;
  streakDays: number;
  mealTypeStats: {
    mealType: MealType;
    count: number;
    averageRating: number;
  }[];
  weeklyStats?: {
    week: string;
    count: number;
  }[];
}

// ============================================
// API 함수
// ============================================

/**
 * 현재 진행 중인 식사 미션 조회
 * GET /api/meal-logs/current
 */
export async function getCurrentMealMission(): Promise<ServiceResult<CurrentMealMissionResponse>> {
  return apiClient.get<CurrentMealMissionResponse>('/meal-logs/current');
}

/**
 * 식사 인증
 * POST /api/meal-logs/{id}/verify
 */
export async function verifyMeal(
  id: number,
  request: VerifyMealRequest
): Promise<ServiceResult<VerifyMealResponse>> {
  return apiClient.post<VerifyMealResponse>(`/meal-logs/${id}/verify`, request);
}

/**
 * 일별 식사 기록 조회
 * GET /api/meal-logs/daily
 * @param date - 조회할 날짜 (YYYY-MM-DD 형식, 기본값: 오늘)
 */
export async function getDailyMealLogs(
  date?: string
): Promise<ServiceResult<DailyMealLogsResponse>> {
  const params: Record<string, string> = {};
  if (date) {
    params.date = date;
  }
  return apiClient.get<DailyMealLogsResponse>('/meal-logs/daily', params);
}

/**
 * 날짜 범위로 식사 기록 조회
 * GET /api/meal-logs/range
 * @param startDate - 시작 날짜 (YYYY-MM-DD)
 * @param endDate - 종료 날짜 (YYYY-MM-DD)
 */
export async function getMealLogsRange(
  startDate: string,
  endDate: string
): Promise<ServiceResult<MealLogsRangeResponse>> {
  return apiClient.get<MealLogsRangeResponse>('/meal-logs/range', {
    startDate,
    endDate,
  });
}

/**
 * 식사 통계 조회
 * GET /api/meal-logs/stats
 * @param period - 통계 기간 (week, month, all)
 */
export async function getMealStats(
  period?: 'week' | 'month' | 'all'
): Promise<ServiceResult<MealStatsResponse>> {
  const params: Record<string, string> = {};
  if (period) {
    params.period = period;
  }
  return apiClient.get<MealStatsResponse>('/meal-logs/stats', params);
}

/**
 * 식사 로그 상세 조회
 * GET /api/meal-logs/{id}
 */
export async function getMealLogDetail(
  id: number
): Promise<ServiceResult<MealLog>> {
  return apiClient.get<MealLog>(`/meal-logs/${id}`);
}
