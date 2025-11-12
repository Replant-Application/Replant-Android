/**
 * 관리자 API 인터페이스
 * 백엔드 연동 시 실제 구현 필요
 */

import { apiClient } from './client';
import { API_CONFIG } from '../config/apiConfig';
import { ServiceResult } from '../types';

/**
 * 유저 정보
 */
export interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  role: string;
  email?: string;
  isActive?: boolean;
  createdAt?: string;
}

/**
 * 유저 수정 요청 데이터
 */
export interface UpdateUserRequest {
  nickname?: string;
  role?: string;
  email?: string;
}

/**
 * 유저 수정
 * PATCH /manag/users/:id
 */
export const updateUser = async (id: number, data: UpdateUserRequest): Promise<ServiceResult<UserInfo>> => {
  // TODO: 백엔드 개발자가 실제 구현
  const endpoint = API_CONFIG.endpoints.manage.updateUser.replace(':id', id.toString());
  return apiClient.patch<UserInfo>(endpoint, data);
};

/**
 * 유저 비활성화
 * PATCH /manag/users/:id (비활성화 플래그)
 */
export const deactivateUser = async (id: number): Promise<ServiceResult<UserInfo>> => {
  // TODO: 백엔드 개발자가 실제 구현
  const endpoint = API_CONFIG.endpoints.manage.deactivateUser.replace(':id', id.toString());
  return apiClient.patch<UserInfo>(endpoint, { isActive: false });
};

/**
 * 전체 유저 목록
 * GET /manag/users
 */
export const getAllUsers = async (params?: { page?: number; limit?: number }): Promise<ServiceResult<UserInfo[]>> => {
  // TODO: 백엔드 개발자가 실제 구현
  return apiClient.get<UserInfo[]>(API_CONFIG.endpoints.manage.getAllUsers, params);
};

/**
 * 유저 상세 조회
 * GET /manag/users/:id
 */
export const getUserDetail = async (id: number): Promise<ServiceResult<UserInfo>> => {
  // TODO: 백엔드 개발자가 실제 구현
  const endpoint = API_CONFIG.endpoints.manage.getUserDetail.replace(':id', id.toString());
  return apiClient.get<UserInfo>(endpoint);
};

