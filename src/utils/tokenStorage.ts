/**
 * 토큰 저장소
 * AsyncStorage를 사용하여 JWT 토큰을 안전하게 저장/관리
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage 키 상수
const STORAGE_KEYS = {
  ACCESS_TOKEN: '@replant:accessToken',
  REFRESH_TOKEN: '@replant:refreshToken',
  USER_INFO: '@replant:userInfo',
  KEEP_LOGGED_IN: '@replant:keepLoggedIn',
} as const;

/**
 * 사용자 정보 타입
 */
export interface StoredUserInfo {
  id: number;
  email: string;
  nickname: string;
  profileImg?: string;
  role?: string;
  createdAt?: string; // 가입일 (서버에서 가져온 실제 가입일)
}

/**
 * Access Token 저장
 */
export const saveAccessToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  } catch (error) {
    console.error('Failed to save access token:', error);
    throw error;
  }
};

/**
 * Access Token 조회
 */
export const getAccessToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error('Failed to get access token:', error);
    return null;
  }
};

/**
 * Refresh Token 저장
 */
export const saveRefreshToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  } catch (error) {
    console.error('Failed to save refresh token:', error);
    throw error;
  }
};

/**
 * Refresh Token 조회
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error('Failed to get refresh token:', error);
    return null;
  }
};

/**
 * 토큰 쌍 저장 (Access + Refresh)
 */
export const saveTokens = async (
  accessToken: string,
  refreshToken: string
): Promise<void> => {
  try {
    await Promise.all([
      saveAccessToken(accessToken),
      saveRefreshToken(refreshToken),
    ]);
  } catch (error) {
    console.error('Failed to save tokens:', error);
    throw error;
  }
};

/**
 * 사용자 정보 저장
 */
export const saveUserInfo = async (userInfo: StoredUserInfo): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_INFO,
      JSON.stringify(userInfo)
    );
  } catch (error) {
    console.error('Failed to save user info:', error);
    throw error;
  }
};

/**
 * 사용자 정보 조회
 */
export const getUserInfo = async (): Promise<StoredUserInfo | null> => {
  try {
    const userInfoString = await AsyncStorage.getItem(STORAGE_KEYS.USER_INFO);
    if (!userInfoString) {
      return null;
    }
    return JSON.parse(userInfoString);
  } catch (error) {
    console.error('Failed to get user info:', error);
    return null;
  }
};

/**
 * 모든 인증 데이터 제거 (로그아웃 시 사용)
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_INFO,
    ]);
  } catch (error) {
    console.error('Failed to clear auth data:', error);
    throw error;
  }
};

/**
 * 로그인 여부 확인
 */
export const isLoggedIn = async (): Promise<boolean> => {
  try {
    const accessToken = await getAccessToken();
    return !!accessToken;
  } catch (error) {
    console.error('Failed to check login status:', error);
    return false;
  }
};

/**
 * 로그인 유지 설정 저장
 */
export const saveKeepLoggedIn = async (keepLoggedIn: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.KEEP_LOGGED_IN,
      JSON.stringify(keepLoggedIn)
    );
  } catch (error) {
    console.error('Failed to save keep logged in setting:', error);
    throw error;
  }
};

/**
 * 로그인 유지 설정 조회
 */
export const getKeepLoggedIn = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.KEEP_LOGGED_IN);
    if (!value) {
      return false;
    }
    return JSON.parse(value);
  } catch (error) {
    console.error('Failed to get keep logged in setting:', error);
    return false;
  }
};

/**
 * 앱 시작 시 자동 로그인 체크
 * keepLoggedIn이 false이면 토큰 삭제
 */
export const checkAutoLogin = async (): Promise<boolean> => {
  try {
    const keepLoggedIn = await getKeepLoggedIn();
    const accessToken = await getAccessToken();

    if (!keepLoggedIn && accessToken) {
      // 로그인 유지가 false이면 토큰 삭제
      await clearAuthData();
      return false;
    }

    return !!accessToken;
  } catch (error) {
    console.error('Failed to check auto login:', error);
    return false;
  }
};
