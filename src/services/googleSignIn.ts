/**
 * Google Sign-In 서비스
 * Google OAuth 로그인 처리
 */

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '@env';

/**
 * Google Sign-In 초기화
 */
export const initializeGoogleSignIn = () => {
  if (!GOOGLE_WEB_CLIENT_ID) {
    console.warn('GOOGLE_WEB_CLIENT_ID is not configured. Google Sign-In will not work.');
    return;
  }

  try {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
    });
  } catch (error) {
    console.warn('Google Sign-In configuration failed:', error);
  }
};

/**
 * Google 로그인
 * @returns Google Access Token
 */
export const signInWithGoogle = async (): Promise<string | null> => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();

    // Get access token
    const tokens = await GoogleSignin.getTokens();
    return tokens.accessToken;
  } catch (error: any) {
    // 사용자가 로그인을 취소한 경우는 에러가 아님
    const errorCode = error?.code || '';
    const errorMessage = error?.message || error?.toString() || '';
    
    // 구글 로그인 취소 에러 코드: SIGN_IN_CANCELLED (12501)
    if (errorCode === '12501' || errorCode === 'SIGN_IN_CANCELLED' || 
        errorMessage.includes('cancelled') || errorMessage.includes('canceled')) {
      console.log('Google login cancelled by user');
      return null; // 에러 메시지 없이 null 반환
    }
    
    // "non-recoverable sign in failure" 에러는 설정 문제일 가능성이 높음
    if (errorMessage.includes('non-recoverable') || errorMessage.includes('SIGN_IN_FAILED')) {
      console.error('Google Sign-In Configuration Error:', {
        code: errorCode,
        message: errorMessage,
        hint: 'Check if GOOGLE_WEB_CLIENT_ID is correctly configured and SHA-1 certificate is registered in Google Cloud Console'
      });
    } else {
    console.error('Google Sign-In Error:', error);
    }
    return null;
  }
};

/**
 * Google 로그아웃
 */
export const signOutFromGoogle = async (): Promise<void> => {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.error('Google Sign-Out Error:', error);
  }
};

/**
 * 현재 Google 로그인 상태 확인
 */
export const isGoogleSignedIn = async (): Promise<boolean> => {
  try {
    const user = await GoogleSignin.getCurrentUser();
    return user !== null;
  } catch (error) {
    console.error('Google Sign-In status check error:', error);
    return false;
  }
};
