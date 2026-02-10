/**
 * 사용자 API 인터페이스
 */

import { apiClient } from './client';
import { API_CONFIG } from '../config/apiConfig';
import { ServiceResult, type MissionCategoryType } from '../types';

/**
 * 고민 종류 (미션 필터링용)
 */
export type WorryType =
  | 'RE_EMPLOYMENT'    // 재취업
  | 'JOB_PREPARATION'  // 취업준비
  | 'ENTRANCE_EXAM'    // 입시
  | 'ADVANCEMENT'      // 진학
  | 'RETURN_TO_SCHOOL' // 복학
  | 'RELATIONSHIP'     // 연애
  | 'SELF_MANAGEMENT'; // 자기계발

/**
 * 선호 장소 타입
 */
export type PlaceType = 'HOME' | 'OUTDOOR' | 'INDOOR';

/**
 * 내 정보 조회 응답
 */
export interface MyInfoResponse {
  id: number;
  email: string;
  nickname: string;
  birthDate?: string; // ISO 8601 형식 (YYYY-MM-DD)
  gender?: 'MALE' | 'FEMALE';
  profileImg?: string;
  createdAt: string;
  // ============ 사용자 맞춤 정보 필드들 ============
  worryType?: WorryType;
  region?: string;
  preferredPlaceType?: PlaceType;
  /** 필수 미션용 선호 카테고리 (다중 선택) */
  preferredMissionCategories?: MissionCategoryType[] | null;
}

/** 내 정보 수정 요청 */
export interface UpdateMyInfoRequest {
  nickname?: string;
  birthDate?: string; // ISO 8601 형식 (YYYY-MM-DD)
  gender?: 'MALE' | 'FEMALE';
  profileImg?: string;
  // ============ 사용자 맞춤 정보 필드들 ============
  worryType?: WorryType;
  region?: string;
  preferredPlaceType?: PlaceType;
  preferredMissionCategories?: MissionCategoryType[] | null;
}

/**
 * 내 정보 수정 응답
 */
export interface UpdateMyInfoResponse {
  id: number;
  email: string;
  nickname: string;
  birthDate?: string;
  gender?: 'MALE' | 'FEMALE';
  profileImg?: string;
  createdAt: string;
  // ============ 사용자 맞춤 정보 필드들 ============
  worryType?: WorryType;
  region?: string;
  preferredPlaceType?: PlaceType;
  preferredMissionCategories?: MissionCategoryType[] | null;
}

/**
 * 다른 유저 프로필 조회 응답
 */
export interface UserProfileResponse {
  id: number;
  nickname: string;
  profileImg?: string;
  reant?: {
    name: string;
    level: number;
  };
}

/**
 * 내 정보 조회
 * GET /api/users/me
 * 인증 필요
 */
export const getMyInfo = async (): Promise<ServiceResult<MyInfoResponse>> => {
  return apiClient.get<MyInfoResponse>(API_CONFIG.endpoints.user.me);
};

/**
 * 내 정보 수정
 * PUT /api/users/me
 * 인증 필요
 *
 * @param data 수정할 사용자 정보
 */
export const updateMyInfo = async (
  data: UpdateMyInfoRequest
): Promise<ServiceResult<UpdateMyInfoResponse>> => {
  return apiClient.put<UpdateMyInfoResponse>(API_CONFIG.endpoints.user.updateMe, data);
};

/**
 * 다른 유저 프로필 조회
 * GET /api/users/{userId}
 * 공개 정보만 조회
 *
 * @param userId 조회할 사용자 ID
 */
export const getUserProfile = async (
  userId: number
): Promise<ServiceResult<UserProfileResponse>> => {
  const endpoint = API_CONFIG.endpoints.user.getUser.replace(':userId', String(userId));
  return apiClient.get<UserProfileResponse>(endpoint);
};

/**
 * 회원 탈퇴
 * DELETE /api/users/me
 * Soft Delete 방식으로 처리되며, 개인정보는 마스킹됩니다.
 */
export const deleteMyAccount = async (): Promise<ServiceResult<void>> => {
  return apiClient.delete<void>(API_CONFIG.endpoints.user.deleteMe);
};

/**
 * 계정 복구
 * POST /api/users/me/restore
 * 탈퇴한 계정을 복구합니다. 탈퇴 후 30일 이내에만 복구 가능합니다.
 */
export const restoreMyAccount = async (): Promise<ServiceResult<void>> => {
  return apiClient.post<void>(API_CONFIG.endpoints.user.restoreMe);
};

/**
 * 사용자 통계 조회 응답
 * 백엔드 응답 필드명: completedMissionsCount, postsCount, diariesCount, badgesCount, approvedVerificationsCount
 */
export interface UserStatsResponse {
  completedMissionsCount: number; // 완료한 미션 수 (돌발 미션 제외)
  postsCount: number; // 작성한 게시글 수 (GENERAL 타입만)
  diariesCount: number; // 작성한 다이어리 수
  badgesCount: number; // 획득한 배지 수
  approvedVerificationsCount?: number; // 승인된 인증글 수 (선택적)
  // totalExperience는 Reant API에서 가져오므로 여기서는 제외
}

/**
 * 사용자 통계 조회
 * GET /api/users/me/stats
 * 통계만 필요한 경우 대량 조회 대신 이 API 사용
 */
export const getMyStats = async (): Promise<ServiceResult<UserStatsResponse>> => {
  return apiClient.get<UserStatsResponse>(API_CONFIG.endpoints.user.stats);
};

