/**
 * 사용자 API 인터페이스
 * 백엔드 연동 시 실제 구현 필요
 */

import { apiClient } from './client';
import { API_CONFIG } from '../config/apiConfig';
import { ServiceResult } from '../types';

/**
 * 마이페이지
 * POST /user
 */
export const getMyPage = async (): Promise<ServiceResult<{
  id: number;
  nickname: string;
  email?: string;
  profileImage?: string;
  stats?: {
    completedMissions: number;
    totalExperience: number;
  };
}>> => {
  // TODO: 백엔드 개발자가 실제 구현
  return apiClient.post(API_CONFIG.endpoints.user.myPage);
};

/**
 * 비밀번호 변경
 * POST /user/password
 */
export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}): Promise<ServiceResult<void>> => {
  // TODO: 백엔드 개발자가 실제 구현
  return apiClient.post<void>(API_CONFIG.endpoints.user.changePassword, data);
};

/**
 * 내 정보 수정
 * POST /user
 */
export const updateProfile = async (data: {
  nickname?: string;
  email?: string;
  profileImage?: string;
}): Promise<ServiceResult<{
  id: number;
  nickname: string;
  email?: string;
  profileImage?: string;
}>> => {
  // TODO: 백엔드 개발자가 실제 구현
  return apiClient.post(API_CONFIG.endpoints.user.updateProfile, data);
};

/**
 * 캘린더 추가
 * POST /user/calendar
 */
export const addCalendar = async (data: {
  date: string;
  content: string;
  emotion?: string;
}): Promise<ServiceResult<{
  id: string;
  date: string;
  content: string;
}>> => {
  // TODO: 백엔드 개발자가 실제 구현
  return apiClient.post(API_CONFIG.endpoints.user.addCalendar, data);
};

/**
 * 캘린더 수정
 * PATCH /user/calendar/:id
 */
export const updateCalendar = async (id: string, data: {
  content?: string;
  emotion?: string;
}): Promise<ServiceResult<{
  id: string;
  date: string;
  content: string;
}>> => {
  // TODO: 백엔드 개발자가 실제 구현
  const endpoint = API_CONFIG.endpoints.user.updateCalendar.replace(':id', id);
  return apiClient.patch(endpoint, data);
};

