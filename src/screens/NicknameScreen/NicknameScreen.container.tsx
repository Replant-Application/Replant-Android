/**
 * NicknameScreen 비즈니스 로직
 * 닉네임 유효성 검사 및 로그인 처리
 */

import { useState } from 'react';
import { Alert } from 'react-native';
import { useUser } from '../../contexts/UserContext';
import { SCREEN_NAMES } from '../../utils/constants';

interface NicknameScreenContainerProps {
  onNavigate: (screen: string) => void;
}

/**
 * 닉네임 유효성 검사
 * @param nickname - 검사할 닉네임
 * @returns 에러 메시지 (유효하면 null)
 */
const validateNickname = (nickname: string): string | null => {
  if (!nickname.trim()) {
    return '닉네임을 입력해주세요.';
  }

  if (nickname.length < 2) {
    return '닉네임은 2글자 이상 입력해주세요.';
  }

  if (nickname.length > 20) {
    return '닉네임은 20글자 이하로 입력해주세요.';
  }

  return null;
};

/**
 * NicknameScreen Container Hook
 * 비즈니스 로직을 처리하고 UI에 필요한 데이터와 핸들러를 제공
 */
export const useNicknameScreenContainer = ({
  onNavigate,
}: NicknameScreenContainerProps) => {
  const { login } = useUser();
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 소셜 로그인 화면으로 돌아가기
  const handleGoBackToSocialLogin = () => {
    if (onNavigate) {
      const loginScreen = SCREEN_NAMES.LOGIN;
      if (loginScreen) {
        onNavigate(loginScreen);
      }
    }
  };

  // 닉네임 제출 처리
  const handleSubmit = async () => {
    // 닉네임 유효성 검사
    const validationError = validateNickname(nickname);
    if (validationError) {
      Alert.alert('오류', validationError);
      return;
    }

    setIsLoading(true);

    try {
      // 간단한 로그인 처리 (인증 없이)
      await login(nickname);
      // 성공 시 자동으로 홈 화면으로 이동
    } catch (error) {
      Alert.alert('오류', (error as Error).message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    nickname,
    setNickname,
    isLoading,
    handleGoBackToSocialLogin,
    handleSubmit,
  };
};
