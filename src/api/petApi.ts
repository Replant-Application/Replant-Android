/**
 * 펫 API 인터페이스
 * 백엔드 연동 시 실제 구현 필요
 */

import { apiClient } from './client';
import { API_CONFIG } from '../config/apiConfig';
import { ServiceResult, Character } from '../types';

/**
 * 펫 이름 선택
 * POST /pet
 */
export const selectPetName = async (data: { name: string; character_id?: string }): Promise<ServiceResult<Character>> => {
  // TODO: 백엔드 개발자가 실제 구현
  return apiClient.post<Character>(API_CONFIG.endpoints.pet.selectName, data);
};

/**
 * 펫 진화
 * POST /pet/evolve
 */
export const evolvePet = async (data: { character_id: string }): Promise<ServiceResult<Character>> => {
  // TODO: 백엔드 개발자가 실제 구현
  return apiClient.post<Character>(API_CONFIG.endpoints.pet.evolve, data);
};

/**
 * 펫 이미지 다운로드
 * POST /pet/image/download
 */
export const downloadPetImage = async (data: { character_id: string; level?: number }): Promise<ServiceResult<{ imageUrl: string }>> => {
  // TODO: 백엔드 개발자가 실제 구현
  return apiClient.post<{ imageUrl: string }>(API_CONFIG.endpoints.pet.downloadImage, data);
};

/**
 * 펫 이미지 불러오기
 * GET /pet/image
 */
export const getPetImage = async (characterId: string): Promise<ServiceResult<{ imageUrl: string }>> => {
  // TODO: 백엔드 개발자가 실제 구현
  return apiClient.get<{ imageUrl: string }>(API_CONFIG.endpoints.pet.getImage, { character_id: characterId });
};

/**
 * 펫 이름 불러오기
 * GET /pet/name
 */
export const getPetName = async (characterId?: string): Promise<ServiceResult<{ name: string }>> => {
  // TODO: 백엔드 개발자가 실제 구현
  const params = characterId ? { character_id: characterId } : undefined;
  return apiClient.get<{ name: string }>(API_CONFIG.endpoints.pet.getName, params);
};

/**
 * 사용자 통계 저장
 * POST /pet/stats
 */
export const saveUserStats = async (data: { 
  completed_missions?: number;
  total_experience?: number;
  level?: number;
}): Promise<ServiceResult<void>> => {
  // TODO: 백엔드 개발자가 실제 구현
  return apiClient.post<void>(API_CONFIG.endpoints.pet.saveStats, data);
};

/**
 * 사용자 통계 불러오기
 * GET /pet/stats
 */
export const getUserStats = async (): Promise<ServiceResult<{
  completed_missions: number;
  total_experience: number;
  level: number;
}>> => {
  // TODO: 백엔드 개발자가 실제 구현
  return apiClient.get<{
    completed_missions: number;
    total_experience: number;
    level: number;
  }>(API_CONFIG.endpoints.pet.getStats);
};

