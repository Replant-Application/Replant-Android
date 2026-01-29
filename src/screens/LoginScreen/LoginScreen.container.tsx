/**
 * LoginScreen 비즈니스 로직
 * 로그인 화면: 이메일 로그인, OAuth 로그인 (카카오/구글)
 */

import { useState, useRef, useCallback } from 'react';
import { Animated } from 'react-native';
import { login as loginApi } from '../../api/authApi';
import { saveTokens, saveUserInfo, saveKeepLoggedIn } from '../../utils/tokenStorage';
import { apiClient } from '../../api/client';
import { useUser } from '../../contexts/UserContext';
import { signInWithKakao } from '../../services/kakaoSignIn';
import { signInWithGoogle } from '../../services/googleSignIn';
import { loginWithOAuth } from '../../services/authService';
import { SCREEN_NAMES } from '../../utils/constants';

interface LoginScreenContainerProps {
  onNavigate: (screen: string) => void;
}

export const useLoginScreenContainer = ({ onNavigate }: LoginScreenContainerProps) => {
  const { login, refreshUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const modalScaleAnim = useRef(new Animated.Value(0)).current;
  const modalFadeAnim = useRef(new Animated.Value(0)).current;

  /**
   * Alert 모달 표시
   */
  const showAlertModal = useCallback((title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlert(true);
  }, []);

  /**
   * Alert 모달 닫기
   */
  const handleCloseAlert = useCallback(() => {
    setShowAlert(false);
  }, []);

  /**
   * 이메일/비밀번호 로그인
   */
  const handleLogin = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      showAlertModal('오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginApi({
        id: email,
        password: password,
      });

      if (result.success && result.data) {
        const { accessToken, refreshToken, name, tokens } = result.data;

        // 토큰 저장
        const finalAccessToken = tokens?.accessToken || accessToken || '';
        const finalRefreshToken = tokens?.refreshToken || refreshToken || '';

        await saveTokens(finalAccessToken, finalRefreshToken);

        // 로그인 유지 설정 저장
        await saveKeepLoggedIn(keepLoggedIn);

        // 사용자 정보 저장
        await saveUserInfo({
          id: 0,
          email: email,
          nickname: name || email,
        });

        // API 클라이언트에 토큰 설정
        if (finalAccessToken) {
          apiClient.setAccessToken(finalAccessToken);
        }

        // 성공 모달 표시 (로그인 처리는 모달이 닫힐 때)
        setUserName(name || email);
        setShowSuccessModal(true);
        // 모달 애니메이션
        Animated.parallel([
          Animated.spring(modalScaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }),
          Animated.timing(modalFadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        // 에러 메시지를 문자열로 변환
        let errorMessage = '로그인에 실패했습니다.';
        if (result.error) {
          if (typeof result.error === 'string') {
            errorMessage = result.error;
          } else if (typeof result.error === 'object') {
            const errorObj = result.error as any;
            errorMessage = errorObj.message || errorObj.error || errorObj.msg || JSON.stringify(result.error);
          }
        }
        showAlertModal('로그인 실패', errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      // catch 블록의 에러도 문자열로 변환
      let errorMessage = '로그인 중 오류가 발생했습니다.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        const errorObj = error as any;
        errorMessage = errorObj.message || errorObj.error || errorObj.msg || '로그인 중 오류가 발생했습니다.';
      }
      showAlertModal('오류', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [email, password, keepLoggedIn, showAlertModal, modalScaleAnim, modalFadeAnim]);

  /**
   * OAuth 로그인 (카카오/구글)
   */
  const handleOAuthLogin = useCallback(
    async (provider: 'KAKAO' | 'GOOGLE') => {
      console.log(`[LoginScreen] handleOAuthLogin called with provider: ${provider}`);
      if (isLoading) {
        console.log('[LoginScreen] Already loading, returning...');
        return;
      }

      console.log('[LoginScreen] Setting loading state to true');
      setIsLoading(true);

      try {
        // OAuth Provider에서 Access Token 가져오기
        let providerAccessToken: string | null = null;

        if (provider === 'KAKAO') {
          console.log('[LoginScreen] Calling signInWithKakao...');
          providerAccessToken = await signInWithKakao();
          console.log('[LoginScreen] signInWithKakao result:', providerAccessToken ? 'got token' : 'no token');
        } else if (provider === 'GOOGLE') {
          console.log('[LoginScreen] Calling signInWithGoogle...');
          providerAccessToken = await signInWithGoogle();
          console.log('[LoginScreen] signInWithGoogle result:', providerAccessToken ? 'got token' : 'no token');
        }

        if (!providerAccessToken) {
          // 사용자가 취소한 경우는 에러 메시지를 표시하지 않음
          // (카카오 로그인 서비스에서 이미 처리됨)
          setIsLoading(false);
          return;
        }

        // 백엔드 OAuth 로그인 API 호출
        const result = await loginWithOAuth(provider, providerAccessToken);

        if (result.success && result.data) {
          const { user, isNewUser } = result.data;

          // 로그인 유지 설정 저장
          await saveKeepLoggedIn(keepLoggedIn);

          // 신규 사용자인 경우 추가 정보 입력 화면으로 이동
          if (isNewUser) {
            console.log('[LoginScreen] New OAuth user, navigating to OAuthCompleteSignUp');
            onNavigate(
              `${SCREEN_NAMES.OAUTH_COMPLETE_SIGNUP}?email=${encodeURIComponent(user.email)}&nickname=${encodeURIComponent(user.nickname || '')}&provider=${provider}`
            );
            return;
          }

          // 기존 사용자 - 성공 모달 표시
          setUserName(user.nickname || user.email);
          setShowSuccessModal(true);
          // 모달 애니메이션
          Animated.parallel([
            Animated.spring(modalScaleAnim, {
              toValue: 1,
              useNativeDriver: true,
              tension: 50,
              friction: 7,
            }),
            Animated.timing(modalFadeAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
        } else {
          // 백엔드 에러 메시지 추출
          let errorMessage = '로그인에 실패했습니다.';
          if (typeof result.error === 'string') {
            errorMessage = result.error;
          } else if (result.error && typeof result.error === 'object') {
            const errorObj = result.error as any;
            errorMessage = errorObj.message || errorObj.error || errorObj.msg || errorMessage;
          }

          // ACCOUNT-009 에러는 회원가입 실패
          if (errorMessage.includes('회원가입에 실패') || errorMessage.includes('ACCOUNT-009')) {
            errorMessage = '회원가입 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
          }

          showAlertModal('로그인 실패', errorMessage);
        }
      } catch (error) {
        console.error('OAuth login error:', error);
        const errorMessage = error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.';
        showAlertModal('오류', errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, keepLoggedIn, onNavigate, showAlertModal, modalScaleAnim, modalFadeAnim]
  );

  /**
   * 카카오 로그인
   */
  const handleKakaoLogin = useCallback(() => {
    console.log('[LoginScreen] Kakao login button pressed');
    try {
      handleOAuthLogin('KAKAO');
    } catch (error) {
      console.error('[LoginScreen] Error in handleKakaoLogin:', error);
      showAlertModal('오류', '카카오 로그인을 시작할 수 없습니다.');
    }
  }, [handleOAuthLogin, showAlertModal]);

  /**
   * 구글 로그인
   */
  const handleGoogleLogin = useCallback(() => {
    console.log('[LoginScreen] Google login button pressed');
    try {
      handleOAuthLogin('GOOGLE');
    } catch (error) {
      console.error('[LoginScreen] Error in handleGoogleLogin:', error);
      showAlertModal('오류', '구글 로그인을 시작할 수 없습니다.');
    }
  }, [handleOAuthLogin, showAlertModal]);

  /**
   * 성공 모달 닫기 및 로그인 처리
   */
  const handleSuccessModalClose = useCallback(async () => {
    Animated.parallel([
      Animated.timing(modalScaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(modalFadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSuccessModal(false);
      modalScaleAnim.setValue(0);
      modalFadeAnim.setValue(0);
    });
    // 모달이 닫힌 후 로그인 처리
    await login(userName);
    // OAuth 로그인 후 사용자 정보 새로고침
    await refreshUser();
    // AppNavigator의 useEffect가 돌발 미션 설정을 확인하고 적절한 화면으로 이동하도록 함
    // 직접 HOME으로 이동하지 않음
  }, [userName, login, refreshUser, modalScaleAnim, modalFadeAnim]);

  /**
   * 성공 모달 요청 닫기 (뒤로가기 버튼 등)
   */
  const handleSuccessModalRequestClose = useCallback(() => {
    setShowSuccessModal(false);
    onNavigate((SCREEN_NAMES.HOME || 'Home') as string);
  }, [onNavigate]);

  return {
    // State
    email,
    password,
    isLoading,
    keepLoggedIn,
    showSuccessModal,
    userName,
    showAlert,
    alertTitle,
    alertMessage,
    modalScaleAnim,
    modalFadeAnim,
    // Setters
    setEmail,
    setPassword,
    setKeepLoggedIn,
    // Handlers
    handleLogin,
    handleKakaoLogin,
    handleGoogleLogin,
    handleSuccessModalClose,
    handleSuccessModalRequestClose,
    handleCloseAlert,
  };
};
