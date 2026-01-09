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

/**
 * 이메일 인증번호 발송 요청
 */
export interface SendVerificationRequest {
  email: string;
}

/**
 * 이메일 인증번호 발송 응답
 */
export interface SendVerificationResponse {
  message: string;
}

/**
 * 이메일 인증번호 확인 요청
 * Swagger 스펙: { email: string, code: string }
 */
export interface VerifyEmailRequest {
  email: string;
  code: string; // verificationCode가 아니라 code
}

/**
 * 이메일 인증번호 확인 응답
 * Swagger 스펙: { data: boolean, message: string, error: {...} }
 * apiClient가 data.data를 추출하므로, result.data는 boolean이 됨
 */
export type VerifyEmailResponse = boolean; // apiClient가 data.data를 추출하므로 boolean

/**
 * 비밀번호 재설정 (임시 비밀번호 발급) 요청
 * Swagger 스펙: { id: string (이메일), name: string }
 * TODO: 백엔드 스펙 변경 시 name을 선택사항으로 변경 가능
 */
export interface GenPasswordRequest {
  id: string; // 이메일 주소
  name: string; // 이름 (현재 필수, 향후 선택사항으로 변경 가능)
}

/**
 * 비밀번호 재설정 (임시 비밀번호 발급) 응답
 */
export interface GenPasswordResponse {
  message: string;
  temporaryPassword?: string;
}

/**
 * 비밀번호 변경 요청
 * 백엔드 DTO와 일치: id (이메일), oldPassword, newPassword
 */
export interface ResetPasswordRequest {
  id: string;              // 회원 ID (이메일) - 백엔드의 memberId와 매핑
  oldPassword: string;     // 현재 비밀번호 - 백엔드의 oldPassword와 일치
  newPassword: string;     // 새 비밀번호
}

/**
 * 비밀번호 변경 응답
 */
export interface ResetPasswordResponse {
  message: string;
}

/**
 * 아이디 찾기 요청
 * 닉네임과 전화번호 또는 이메일
 */
export interface SearchIdRequest {
  nickname: string; // 필수: 닉네임
  phone?: string; // 선택: 전화번호
  email?: string; // 선택: 이메일 (phone 또는 email 중 하나 필수)
}

/**
 * 이메일 인증번호 발송
 * POST /api/auth/send-verification
 *
 * @param data 이메일 주소
 */
export const sendVerification = async (
  data: SendVerificationRequest
): Promise<ServiceResult<SendVerificationResponse>> => {
  return apiClient.post<SendVerificationResponse>(
    API_CONFIG.endpoints.auth.sendVerification,
    data
  );
};

/**
 * 이메일 인증번호 확인
 * POST /api/auth/verify-email
 *
 * @param data 이메일과 인증번호
 */
export const verifyEmail = async (
  data: VerifyEmailRequest
): Promise<ServiceResult<VerifyEmailResponse>> => {
  return apiClient.post<VerifyEmailResponse>(
    API_CONFIG.endpoints.auth.verifyEmail,
    data
  );
};

/**
 * 비밀번호 재설정 (임시 비밀번호 발급)
 * PATCH /api/auth/genPw
 * Swagger 스펙: 이름과 이메일로 본인 확인 후 임시 비밀번호를 이메일로 발송
 *
 * @param data 이메일(id)과 이름(name)
 */
export const genPassword = async (
  data: GenPasswordRequest
): Promise<ServiceResult<GenPasswordResponse>> => {
  return apiClient.patch<GenPasswordResponse>(
    API_CONFIG.endpoints.auth.genPw,
    data
  );
};

/**
 * 비밀번호 변경
 * PATCH /api/auth/resetPw
 * 기존 비밀번호를 확인하고 새 비밀번호로 변경합니다.
 *
 * @param data 비밀번호 변경 요청 정보 (id: 이메일, oldPassword: 현재 비밀번호, newPassword: 새 비밀번호)
 * @returns 비밀번호 변경 결과
 */
export const resetPassword = async (
  data: ResetPasswordRequest
): Promise<ServiceResult<ResetPasswordResponse>> => {
  return apiClient.patch<ResetPasswordResponse>(
    API_CONFIG.endpoints.auth.resetPw,
    data
  );
};

/**
 * 아이디 찾기
 * GET /api/auth/searchId
 * 닉네임과 전화번호 또는 이메일을 query parameter로 전달, 응답은 string (마스킹된 이메일)
 *
 * @param params 닉네임과 전화번호 또는 이메일
 */
export const searchId = async (
  params: SearchIdRequest
): Promise<ServiceResult<string>> => {
  // nickname과 phone 또는 email을 query parameter로 전달
  const queryParams: Record<string, string | number> = {
    nickname: params.nickname,
  };
  if (params.phone) {
    queryParams.phone = params.phone;
  }
  if (params.email) {
    queryParams.email = params.email;
  }
  return apiClient.get<string>(
    API_CONFIG.endpoints.auth.searchId,
    queryParams
  );
};
