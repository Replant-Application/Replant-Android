/**
 * 인증 API 인터페이스
 * OAuth 기반 인증 시스템
 */

import { apiClient } from './client';
import { API_CONFIG } from '../config/apiConfig';
import { ServiceResult } from '../types';

/**
 * OAuth Provider 타입
 */
export type OAuthProvider = 'KAKAO' | 'GOOGLE' | 'APPLE' | 'NAVER';

/**
 * OAuth 로그인/회원가입 요청
 */
export interface OAuthLoginRequest {
  accessToken: string; // OAuth Provider의 Access Token
}

/**
 * OAuth 로그인/회원가입 응답
 */
export interface OAuthLoginResponse {
  accessToken: string; // JWT Access Token
  refreshToken: string; // JWT Refresh Token
  user: {
    id: number;
    email: string;
    nickname: string;
    profileImg?: string;
  };
  isNewUser: boolean; // 신규 회원 여부
}

/**
 * 토큰 갱신 요청
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * 토큰 갱신 응답
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * 로그아웃 응답
 */
export interface LogoutResponse {
  message: string;
}

/**
 * OAuth 로그인/회원가입
 * POST /api/auth/oauth/{provider}
 *
 * @param provider OAuth Provider (KAKAO, GOOGLE, APPLE, NAVER)
 * @param data OAuth Access Token
 */
export const oauthLogin = async (
  provider: OAuthProvider,
  data: OAuthLoginRequest
): Promise<ServiceResult<OAuthLoginResponse>> => {
  const endpoint = API_CONFIG.endpoints.auth.oauthLogin.replace(':provider', provider);
  return apiClient.post<OAuthLoginResponse>(endpoint, data);
};

/**
 * 토큰 갱신
 * POST /api/auth/refresh
 *
 * @param data Refresh Token
 */
export const refreshToken = async (
  data: RefreshTokenRequest
): Promise<ServiceResult<RefreshTokenResponse>> => {
  return apiClient.post<RefreshTokenResponse>(API_CONFIG.endpoints.auth.refresh, data);
};

/**
 * 로그아웃
 * POST /api/auth/logout
 * 인증 필요
 */
export const logout = async (): Promise<ServiceResult<LogoutResponse>> => {
  return apiClient.post<LogoutResponse>(API_CONFIG.endpoints.auth.logout);
};

