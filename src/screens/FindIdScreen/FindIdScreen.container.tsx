/**
 * FindIdScreen 비즈니스 로직
 * 아이디 찾기 유효성 검사 및 API 호출
 */

import { useState } from 'react';
import { SCREEN_NAMES } from '../../utils/constants';
import { searchId } from '../../api/authApi';

interface FindIdScreenContainerProps {
  onNavigate: (screen: string, params?: any) => void;
}

/**
 * 이메일 유효성 검사
 */
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/;
  return emailRegex.test(email);
};

/**
 * 전화번호 유효성 검사
 */
const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^01[016789][0-9]{7,8}$/;
  return phoneRegex.test(phone.replace(/-/g, ''));
};

/**
 * 입력 타입 자동 감지
 */
const detectInputType = (text: string): 'phone' | 'email' => {
  // @가 포함되어 있으면 이메일
  if (text.includes('@')) {
    return 'email';
  }
  // 숫자만 있으면 전화번호
  if (/^\d+$/.test(text.replace(/-/g, ''))) {
    return 'phone';
  }
  // 기본값은 전화번호
  return 'phone';
};

/**
 * FindIdScreen Container Hook
 * 비즈니스 로직을 처리하고 UI에 필요한 데이터와 핸들러를 제공
 */
export const useFindIdScreenContainer = ({ onNavigate }: FindIdScreenContainerProps) => {
  const [nickname, setNickname] = useState('');
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState<'phone' | 'email'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 입력 타입 자동 감지 및 업데이트
  const handleInputChange = (text: string) => {
    setInput(text);
    if (error) {
      setError('');
    }
    // 입력 타입 자동 감지
    const type = detectInputType(text);
    setInputType(type);
  };

  // 닉네임 변경 핸들러
  const handleNicknameChange = (text: string) => {
    setNickname(text);
    if (error) {
      setError('');
    }
  };

  // 아이디 찾기 처리
  const handleFindId = async () => {
    // 에러 초기화
    setError('');

    // 입력값 검증
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    if (!input.trim()) {
      setError('전화번호 또는 이메일을 입력해주세요.');
      return;
    }

    const detectedType = detectInputType(input);

    // 타입별 검증
    if (detectedType === 'email') {
      if (!validateEmail(input)) {
        setError('올바른 이메일 형식으로 입력해주세요.');
        return;
      }
    } else {
      if (!validatePhone(input)) {
        setError('올바른 전화번호 형식으로 입력해주세요. (예: 01012345678)');
        return;
      }
    }

    setIsLoading(true);

    try {
      const result = await searchId({
        nickname: nickname.trim(),
        [detectedType === 'phone' ? 'phone' : 'email']: input.replace(/-/g, ''),
      });

      if (result.success && result.data) {
        // 아이디 찾기 성공 - 결과 화면으로 이동 (마스킹된 이메일 전달)
        // result.data는 string (마스킹된 이메일)
        onNavigate(SCREEN_NAMES.FIND_ID_RESULT as string, {
          email: result.data,
        });
      } else {
        // 에러 메시지 추출
        let errorMessage = '아이디 찾기에 실패했습니다.';
        if (result.error) {
          if (typeof result.error === 'string') {
            errorMessage = result.error;
          } else if (typeof result.error === 'object') {
            const errorObj = result.error as any;
            errorMessage = errorObj.message || errorObj.error || errorMessage;
          }
        }
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Find ID error:', err);
      setError('아이디 찾기 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 로그인 화면으로 돌아가기
  const handleGoToLogin = () => {
    onNavigate(SCREEN_NAMES.LOGIN as string);
  };

  return {
    nickname,
    input,
    inputType,
    isLoading,
    error,
    handleNicknameChange,
    handleInputChange,
    handleFindId,
    handleGoToLogin,
  };
};
