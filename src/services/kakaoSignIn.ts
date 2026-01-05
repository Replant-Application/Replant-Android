/**
 * Kakao Sign-In 서비스
 * Kakao OAuth 로그인 처리
 */

/**
 * Kakao 로그인
 * @returns Kakao Access Token
 */
export const signInWithKakao = async (): Promise<string | null> => {
  console.log('[Kakao] Starting login process...');
  try {
    // 동적 import를 사용하여 모듈이 없을 경우를 처리
    let kakaoLogin;
    try {
      console.log('[Kakao] Attempting to require @react-native-seoul/kakao-login...');
      kakaoLogin = require('@react-native-seoul/kakao-login');
      console.log('[Kakao] Module loaded successfully, type:', typeof kakaoLogin);
      console.log('[Kakao] Module keys:', kakaoLogin ? Object.keys(kakaoLogin) : 'null');
    } catch (moduleError: any) {
      console.error('[Kakao] Failed to load Kakao login module:', {
        error: moduleError,
        message: moduleError?.message,
        stack: moduleError?.stack,
        name: moduleError?.name
      });
      throw new Error(`카카오 로그인 모듈을 로드할 수 없습니다: ${moduleError?.message || '알 수 없는 오류'}`);
    }
    
    if (!kakaoLogin) {
      console.error('[Kakao] Kakao login module is null');
      return null;
    }

    console.log('[Kakao] Available keys:', Object.keys(kakaoLogin));

    // loginWithKakaoAccount 함수 호출
    const loginFunction = kakaoLogin.loginWithKakaoAccount;
    if (!loginFunction || typeof loginFunction !== 'function') {
      console.error('[Kakao] loginWithKakaoAccount function is not available');
      return null;
    }

    console.log('[Kakao] Calling loginWithKakaoAccount() function...');
    try {
      // loginWithKakaoAccount() 함수 호출 - 이 함수는 OAuth 흐름을 시작하고 Promise를 반환
      const loginResult = await loginFunction();
      console.log('[Kakao] loginWithKakaoAccount() completed, result:', loginResult ? JSON.stringify(loginResult).substring(0, 200) : 'null');
      
      // loginResult에서 accessToken 추출 시도
      if (loginResult && typeof loginResult === 'object') {
        const token = loginResult.accessToken || loginResult.token || loginResult.access_token;
        if (token) {
          console.log('[Kakao] Access token found in login result');
          return token;
        }
      }
      
      // loginResult에 토큰이 없으면 getAccessToken()으로 토큰 가져오기
      console.log('[Kakao] No token in login result, trying getAccessToken()...');
      const token = await kakaoLogin.getAccessToken();
      console.log('[Kakao] Access token received:', token ? 'found' : 'not found');
      
      if (token) {
        return token;
      }
      
      console.log('[Kakao] No access token available');
      return null;
    } catch (loginError: any) {
      // 사용자가 로그인을 취소한 경우는 에러가 아님
      const errorMessage = loginError?.message || loginError?.toString() || '';
      const errorCode = loginError?.code || '';
      
      if (errorCode === 'CANCELLED' || 
          errorCode === 'RNKakaoLogins' ||
          errorMessage.includes('user cancelled') || 
          errorMessage.includes('cancelled') || 
          errorMessage.includes('UserCancel') ||
          errorMessage.includes('사용자가 취소')) {
        console.log('[Kakao] Login cancelled by user');
        return null; // 에러 메시지 없이 null 반환
      }
      
      console.error('[Kakao] Error during login call:', {
        error: loginError,
        message: errorMessage,
        code: errorCode,
        stack: loginError?.stack
      });
      throw loginError;
    }
  } catch (error: any) {
    // 사용자가 로그인을 취소한 경우는 에러가 아님
    const errorMessage = error?.message || error?.toString() || '';
    const errorCode = error?.code || '';
    
    if (errorCode === 'CANCELLED' || 
        errorMessage.includes('user cancelled') || 
        errorMessage.includes('cancelled') || 
        errorMessage.includes('UserCancel') ||
        errorMessage.includes('사용자가 취소')) {
      console.log('Kakao login cancelled by user');
      return null; // 에러 메시지 없이 null 반환
    }
    
    console.error('Kakao Sign-In Error:', {
      code: errorCode,
      message: errorMessage,
      error: error
    });
    return null;
  }
};

/**
 * Kakao 로그아웃
 */
export const signOutFromKakao = async (): Promise<void> => {
  try {
    const kakaoLogin = require('@react-native-seoul/kakao-login');
    if (kakaoLogin && kakaoLogin.logout) {
      await kakaoLogin.logout();
    }
  } catch (error) {
    console.error('Kakao Sign-Out Error:', error);
  }
};

/**
 * 현재 Kakao 로그인 상태 확인
 */
export const isKakaoSignedIn = async (): Promise<boolean> => {
  try {
    const kakaoLogin = require('@react-native-seoul/kakao-login');
    if (kakaoLogin && kakaoLogin.getProfile) {
      await kakaoLogin.getProfile();
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

