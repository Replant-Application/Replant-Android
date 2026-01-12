/**
 * 챌린지 API
 * 백엔드 ChallengeController와 연동
 */

import { apiClient } from './client';
import { ServiceResult } from '../types';
import {
  Challenge,
  ChallengeStartRequest,
  ChallengeCountResponse
} from '../types/todolist';

// ============================================
// API 함수
// ============================================

/**
 * 챌린지 시작
 * POST /api/challenges
 */
export const startChallenge = async (
  data: ChallengeStartRequest
): Promise<ServiceResult<Challenge>> => {
  return apiClient.post<Challenge>('/challenges', data);
};

/**
 * 활성 챌린지 목록 조회
 * GET /api/challenges/active
 */
export const getActiveChallenges = async (): Promise<ServiceResult<Challenge[]>> => {
  return apiClient.get<Challenge[]>('/challenges/active');
};

/**
 * 모든 챌린지 목록 조회
 * GET /api/challenges
 */
export const getAllChallenges = async (): Promise<ServiceResult<Challenge[]>> => {
  return apiClient.get<Challenge[]>('/challenges');
};

/**
 * 챌린지 상세 조회
 * GET /api/challenges/{challengeId}
 */
export const getChallengeDetail = async (
  challengeId: number
): Promise<ServiceResult<Challenge>> => {
  return apiClient.get<Challenge>(`/challenges/${challengeId}`);
};

/**
 * 오늘 챌린지 완료
 * PUT /api/challenges/{challengeId}/complete
 */
export const completeTodayChallenge = async (
  challengeId: number
): Promise<ServiceResult<Challenge>> => {
  return apiClient.put<Challenge>(`/challenges/${challengeId}/complete`);
};

/**
 * 활성 챌린지 개수 조회
 * GET /api/challenges/count
 */
export const getActiveChallengeCount = async (): Promise<ServiceResult<ChallengeCountResponse>> => {
  return apiClient.get<ChallengeCountResponse>('/challenges/count');
};
