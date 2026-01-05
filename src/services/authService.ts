/**
 * 인증 서비스
 * OAuth 로그인 및 토큰 관리
 */

import { apiClient } from '../api/client';
import { oauthLogin, logout as logoutApi, OAuthProvider } from '../api/authApi';
import {
  saveTokens,
  saveUserInfo,
  clearAuthData,
  isLoggedIn,
  getUserInfo,
  StoredUserInfo,
} from '../utils/tokenStorage';
import { ServiceResult } from '../types';

/**
 * OAuth 로그인 처리
 *
 * @param provider OAuth Provider (KAKAO, GOOGLE, APPLE, NAVER)
 * @param providerAccessToken OAuth Provider로부터 받은 Access Token
 * @returns 로그인 결과 (성공 시 사용자 정보 및 신규 가입 여부)
 */
export const loginWithOAuth = async (
  provider: OAuthProvider,
  providerAccessToken: string
): Promise<
  ServiceResult<{
    user: StoredUserInfo;
    isNewUser: boolean;
  }>
> => {
  try {
    // 백엔드 OAuth 로그인 API 호출
    const result = await oauthLogin(provider, {
      accessToken: providerAccessToken,
    });

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || '로그인에 실패했습니다.',
      };
    }

    const { accessToken, refreshToken, user, newUser } = result.data;

    // 토큰 저장
    await saveTokens(accessToken, refreshToken);

    // 사용자 정보 저장
    await saveUserInfo(user);

    // API 클라이언트에 토큰 설정
    apiClient.setAccessToken(accessToken);

    return {
      success: true,
      data: {
        user,
        isNewUser: newUser, // 백엔드의 newUser를 isNewUser로 변환
      },
    };
  } catch (error) {
    console.error('OAuth login error:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : '로그인 중 오류가 발생했습니다.',
    };
  }
};

/**
 * 로그아웃 처리
 */
export const logout = async (): Promise<ServiceResult<void>> => {
  try {
    // 백엔드 로그아웃 API 호출 (토큰 무효화)
    await logoutApi();

    // 로컬 저장소의 인증 데이터 제거
    await clearAuthData();

    // API 클라이언트 토큰 제거
    apiClient.setAccessToken(null);

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error('Logout error:', error);
    // 에러가 발생해도 로컬 데이터는 제거
    await clearAuthData();
    apiClient.setAccessToken(null);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : '로그아웃 중 오류가 발생했습니다.',
    };
  }
};

/**
 * 로그인 상태 확인
 */
export const checkLoginStatus = async (): Promise<boolean> => {
  return isLoggedIn();
};

/**
 * 현재 로그인한 사용자 정보 조회
 */
export const getCurrentUser = async (): Promise<StoredUserInfo | null> => {
  return getUserInfo();
};

/**
 * 자동 로그인 처리
 * 앱 시작 시 저장된 토큰으로 자동 로그인
 */
export const initializeAuth = async (): Promise<boolean> => {
  try {
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
      return false;
    }

    // 저장된 토큰을 API 클라이언트에 설정
    // ApiClient 생성자에서 자동으로 로드되므로 별도 처리 불필요
    return true;
  } catch (error) {
    console.error('Auth initialization error:', error);
    return false;
  }
};
