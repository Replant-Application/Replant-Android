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
  } catch (error) {
    console.error('Google Sign-In Error:', error);
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
  return await GoogleSignin.isSignedIn();
};
