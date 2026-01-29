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
 * 식사 미션 상태 (MealLogResponse.Status)
 */
export type MealMissionStatus = 'ASSIGNED' | 'COMPLETED' | 'FAILED' | 'SKIPPED';

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
  status: MealLogStatus | MealMissionStatus; // MealLogStatus 또는 MealMissionStatus ('ASSIGNED' | 'COMPLETED' | 'FAILED' | 'SKIPPED')
  missionId?: number;
  userMissionId?: number;
  verifiedAt?: string;
  expiredAt?: string;
  createdAt: string;
  updatedAt?: string;
  // 식사 미션 상세 조회 시 추가 필드
  expired?: boolean;
  canVerify?: boolean;
  mealTypeDisplay?: string; // "아침", "점심", "저녁" 등
  remainingSeconds?: number; // 남은 시간 (초)
}

/**
 * 현재 진행 중인 식사 미션 응답
 * GET /api/meal-logs/current
 * 응답이 null이면 204 No Content 반환
 * 미션이 있으면 다음 필드 반환
 */
export interface CurrentMealMissionResponse {
  id: number;
  mealType: MealType;
  mealTypeDisplay: string; // "아침", "점심", "저녁" 등
  status: MealMissionStatus; // 'ASSIGNED' | 'COMPLETED' | 'FAILED' | 'SKIPPED'
  expired: boolean;
  canVerify: boolean;
  remainingSeconds: number; // 남은 시간 (초)
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
 * 응답이 null이면 204 No Content 반환 (미션이 없음)
 * 미션이 있으면 CurrentMealMissionResponse 반환
 */
export async function getCurrentMealMission(): Promise<ServiceResult<CurrentMealMissionResponse | null>> {
  const result = await apiClient.get<CurrentMealMissionResponse | null>('/meal-logs/current');
  
  // 204 No Content인 경우 (data가 null)
  if (result.success && result.data === null) {
    return {
      success: true,
      data: null, // 미션이 없음을 나타냄
    };
  }
  
  return result;
}

/**
 * 식사 미션 상태 확인 및 에러 메시지 생성
 * @param mealMission - 현재 식사 미션 응답 (null이면 미션이 없음)
 * @returns 에러 메시지 또는 null (정상)
 */
export function validateMealMission(mealMission: CurrentMealMissionResponse | null): string | null {
  if (!mealMission) {
    return null; // 미션이 없는 것은 정상
  }
  
  // expired: true 또는 canVerify: false면 "만료된 미션"
  if (mealMission.expired === true || mealMission.canVerify === false) {
    return '만료된 미션입니다.';
  }
  
  // status: "COMPLETED"면 "이미 완료된 미션"
  if (mealMission.status === 'COMPLETED') {
    return '이미 완료된 미션입니다.';
  }
  
  // status: "FAILED"면 "만료된 미션"
  if (mealMission.status === 'FAILED') {
    return '만료된 미션입니다.';
  }
  
  return null; // 정상
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
