/**
 * 인증 API 인터페이스
 * 백엔드 연동 시 실제 구현 필요
 */

import { apiClient } from './client';
import { API_CONFIG } from '../config/apiConfig';
import { ServiceResult } from '../types';

/**
 * 로그인 요청 데이터
 */
export interface SignInRequest {
  username: string;
  password: string;
}

/**
 * 로그인 응답 데이터
 */
export interface SignInResponse {
  accessToken: string;
  user: {
    id: number;
    nickname: string;
    role: string;
  };
}

/**
 * 회원가입 요청 데이터
 */
export interface SignUpRequest {
  username: string;
  password: string;
  nickname?: string;
}

/**
 * 회원가입 응답 데이터
 */
export interface SignUpResponse {
  accessToken: string;
  user: {
    id: number;
    nickname: string;
    role: string;
  };
}

/**
 * 현재 사용자 정보 응답
 */
export interface MeResponse {
  id: number;
  nickname: string;
  role: string;
}

/**
 * 회원가입
 * POST /auth/signup
 */
export const signUp = async (data: SignUpRequest): Promise<ServiceResult<SignUpResponse>> => {
  // TODO: 백엔드 개발자가 실제 구현
  return apiClient.post<SignUpResponse>(API_CONFIG.endpoints.auth.signup, data);
};

/**
 * 로그인
 * POST /auth/singin
 */
export const signIn = async (data: SignInRequest): Promise<ServiceResult<SignInResponse>> => {
  // TODO: 백엔드 개발자가 실제 구현
  return apiClient.post<SignInResponse>(API_CONFIG.endpoints.auth.signin, data);
};

/**
 * 로그아웃
 * POST /auth/signout
 */
export const signOut = async (): Promise<ServiceResult<void>> => {
  // TODO: 백엔드 개발자가 실제 구현
  return apiClient.post<void>(API_CONFIG.endpoints.auth.signout);
};

/**
 * 토큰 갱신
 * POST /auth/refresh
 */
export const refreshToken = async (): Promise<ServiceResult<{ accessToken: string }>> => {
  // TODO: 백엔드 개발자가 실제 구현
  return apiClient.post<{ accessToken: string }>(API_CONFIG.endpoints.auth.refresh);
};

/**
 * 아이디 찾기
 * POST /auth/find-username
 */
export const findUsername = async (data: { email?: string; phone?: string }): Promise<ServiceResult<{ username: string }>> => {
  // TODO: 백엔드 개발자가 실제 구현
  return apiClient.post<{ username: string }>(API_CONFIG.endpoints.auth.findUsername, data);
};

/**
 * 비밀번호 재설정 요청
 * POST /auth/reset-password
 */
export const requestPasswordReset = async (data: { username: string; email?: string }): Promise<ServiceResult<void>> => {
  // TODO: 백엔드 개발자가 실제 구현
  return apiClient.post<void>(API_CONFIG.endpoints.auth.resetPassword, data);
};

/**
 * 비밀번호 재설정 확인
 * POST /auth/reset-password/confirm
 */
export const confirmPasswordReset = async (data: { token: string; newPassword: string }): Promise<ServiceResult<void>> => {
  // TODO: 백엔드 개발자가 실제 구현
  return apiClient.post<void>(API_CONFIG.endpoints.auth.resetPasswordConfirm, data);
};

/**
 * 현재 사용자 정보 조회
 * GET /auth/me
 */
export const getMe = async (): Promise<ServiceResult<MeResponse>> => {
  // TODO: 백엔드 개발자가 실제 구현
  return apiClient.get<MeResponse>(API_CONFIG.endpoints.auth.me);
};

