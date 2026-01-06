/**
 * 인증 API 인터페이스
 * 일반 로그인 및 OAuth 기반 인증 시스템
 */

import { apiClient } from './client';
import { API_CONFIG } from '../config/apiConfig';
import { ServiceResult } from '../types';

/**
 * 일반 로그인 요청
 */
export interface LoginRequest {
  id: string;
  password: string;
}

/**
 * 일반 로그인 응답
 */
export interface LoginResponse {
  name: string;
  accessToken?: string;
  refreshToken?: string;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
}

/**
 * 회원가입 요청
 */
export interface JoinRequest {
  id: string;
  password: string;
  name: string;
  phone: string;
}

/**
 * 회원가입 응답
 */
export interface JoinResponse {
  name: string;
  accessToken?: string;
  refreshToken?: string;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
}

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
    birthDate?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    profileImg?: string;
    createdAt?: string;
    role?: 'USER' | 'GRADUATE' | 'CONTRIBUTOR' | 'ADMIN';
  };
  newUser: boolean; // 신규 회원 여부 (백엔드 응답과 일치)
}

/**
 * 토큰 갱신 요청
 */
export interface RefreshTokenRequest {
  accessToken: string;
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
 * 일반 로그인
 * POST /api/auth/login
 *
 * @param data 로그인 정보 (id, password)
 */
export const login = async (
  data: LoginRequest
): Promise<ServiceResult<LoginResponse>> => {
  return apiClient.post<LoginResponse>(API_CONFIG.endpoints.auth.login, data);
};

/**
 * 회원가입
 * POST /api/auth/join
 *
 * @param data 회원가입 정보 (id, password, name, phone)
 */
export const join = async (
  data: JoinRequest
): Promise<ServiceResult<JoinResponse>> => {
  return apiClient.post<JoinResponse>(API_CONFIG.endpoints.auth.join, data);
};

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
  // API 엔드포인트는 소문자로 변환 (kakao, google)
  const providerLower = provider.toLowerCase();
  const endpoint = API_CONFIG.endpoints.auth.oauthLogin.replace(':provider', providerLower);
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
