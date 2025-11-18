/**
 * 미션 API 인터페이스
 * 백엔드 연동 시 실제 구현 필요
 */

import { apiClient } from './client';
import { API_CONFIG } from '../config/apiConfig';
import { ServiceResult, Mission, MissionData, MissionVerificationStatus, VerificationRequirements, GPSVerificationData } from '../types';

/**
 * 미션 추가
 * POST /mission
 */
export const createMission = async (data: MissionData): Promise<ServiceResult<Mission>> => {
  // TODO: 백엔드 개발자가 실제 구현
  return apiClient.post<Mission>(API_CONFIG.endpoints.mission.create, data);
};

/**
 * 미션 수정
 * PATCH /mission/:id
 */
export const updateMission = async (id: string, data: Partial<MissionData>): Promise<ServiceResult<Mission>> => {
  // TODO: 백엔드 개발자가 실제 구현
  const endpoint = API_CONFIG.endpoints.mission.update.replace(':id', id);
  return apiClient.patch<Mission>(endpoint, data);
};

/**
 * 미션 삭제
 * POST /mission/:id (명세서에 POST로 명시됨)
 */
export const deleteMission = async (id: string): Promise<ServiceResult<void>> => {
  // TODO: 백엔드 개발자가 실제 구현
  const endpoint = API_CONFIG.endpoints.mission.delete.replace(':id', id);
  return apiClient.post<void>(endpoint);
};

/**
 * 미션 인증
 * POST /mission/:id/verify
 */
export const verifyMission = async (id: string, data: { photoUrl?: string }): Promise<ServiceResult<Mission>> => {
  // TODO: 백엔드 개발자가 실제 구현
  const endpoint = API_CONFIG.endpoints.mission.verify.replace(':id', id);
  return apiClient.post<Mission>(endpoint, data);
};

/**
 * 미션 수행 여부 반환
 * GET /mission/:id/completion
 */
export const checkMissionCompletion = async (id: string): Promise<ServiceResult<{ completed: boolean }>> => {
  // TODO: 백엔드 개발자가 실제 구현
  const endpoint = API_CONFIG.endpoints.mission.checkCompletion.replace(':id', id);
  return apiClient.get<{ completed: boolean }>(endpoint);
};

/**
 * 일일 미션 불러오기
 * GET /mission/daily
 */
export const getDailyMissions = async (date?: string): Promise<ServiceResult<Mission[]>> => {
  // TODO: 백엔드 개발자가 실제 구현
  const params = date ? { date } : undefined;
  return apiClient.get<Mission[]>(API_CONFIG.endpoints.mission.getDailyMissions, params);
};

/**
 * 수행한 미션 불러오기
 * GET /mission/completed
 */
export const getCompletedMissions = async (): Promise<ServiceResult<Mission[]>> => {
  // TODO: 백엔드 개발자가 실제 구현
  return apiClient.get<Mission[]>(API_CONFIG.endpoints.mission.getCompletedMissions);
};

/**
 * to-do list 저장
 * POST /mission/todo
 */
export const saveTodoList = async (data: { missions: string[] }): Promise<ServiceResult<void>> => {
  // TODO: 백엔드 개발자가 실제 구현
  return apiClient.post<void>(API_CONFIG.endpoints.mission.saveTodoList, data);
};

/**
 * to-do list 불러오기
 * GET /mission/todo
 */
export const getTodoList = async (): Promise<ServiceResult<{ missions: string[] }>> => {
  // TODO: 백엔드 개발자가 실제 구현
  return apiClient.get<{ missions: string[] }>(API_CONFIG.endpoints.mission.getTodoList);
};

/**
 * 인증 상태 확인
 * GET /mission/:id/verification-status
 */
export const checkVerificationStatus = async (missionId: string): Promise<ServiceResult<MissionVerificationStatus>> => {
  // TODO: 백엔드 개발자가 실제 구현
  const endpoint = API_CONFIG.endpoints.mission.verificationStatus.replace(':id', missionId);
  return apiClient.get<MissionVerificationStatus>(endpoint);
};

/**
 * 좋아요 기반 인증 요청
 * POST /mission/:id/verify-by-likes
 */
export const verifyMissionByLikes = async (missionId: string, postId: string): Promise<ServiceResult<Mission>> => {
  // TODO: 백엔드 개발자가 실제 구현
  const endpoint = API_CONFIG.endpoints.mission.verifyByLikes.replace(':id', missionId);
  return apiClient.post<Mission>(endpoint, { postId });
};

/**
 * 인증 요구사항 조회
 * GET /mission/:id/verification-requirements
 */
export const getVerificationRequirements = async (missionId: string): Promise<ServiceResult<VerificationRequirements>> => {
  // TODO: 백엔드 개발자가 실제 구현
  const endpoint = API_CONFIG.endpoints.mission.verificationRequirements.replace(':id', missionId);
  return apiClient.get<VerificationRequirements>(endpoint);
};

/**
 * GPS 기반 인증 요청
 * POST /mission/:id/verify-by-gps
 */
export const verifyMissionByGPS = async (missionId: string, data: GPSVerificationData): Promise<ServiceResult<Mission>> => {
  // TODO: 백엔드 개발자가 실제 구현
  const endpoint = API_CONFIG.endpoints.mission.verifyByGPS.replace(':id', missionId);
  return apiClient.post<Mission>(endpoint, data);
};


