/**
 * FindIdResultScreen 비즈니스 로직
 * 이메일 마스킹 및 네비게이션 처리
 */

import { useEffect } from 'react';
import { SCREEN_NAMES } from '../../utils/constants';

interface FindIdResultScreenContainerProps {
  email: string;
  onNavigate: (screen: string, params?: any) => void;
}

/**
 * 이메일 마스킹 처리
 * @param email - 마스킹할 이메일
 * @returns 마스킹된 이메일
 */
const maskEmail = (email: string): string => {
  if (!email) return '아이디를 찾을 수 없습니다.';
  const [localPart, domain] = email.split('@');
  if (!domain) return email;
  
  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }
  return `${localPart.substring(0, 2)}***@${domain}`;
};

/**
 * FindIdResultScreen Container Hook
 * 비즈니스 로직을 처리하고 UI에 필요한 데이터와 핸들러를 제공
 */
export const useFindIdResultScreenContainer = ({
  email,
  onNavigate,
}: FindIdResultScreenContainerProps) => {
  // 이메일 마스킹 처리
  const maskedEmail = maskEmail(email);

  // email이 없으면 아이디 찾기 화면으로 돌아가기
  useEffect(() => {
    if (!email) {
      onNavigate(SCREEN_NAMES.FIND_ID as string);
    }
  }, [email, onNavigate]);

  // 네비게이션 핸들러
  const handleGoBack = () => {
    onNavigate(SCREEN_NAMES.FIND_ID as string);
  };

  const handleGoToLogin = () => {
    onNavigate(SCREEN_NAMES.LOGIN as string);
  };

  const handleGoToFindPassword = () => {
    onNavigate(SCREEN_NAMES.FIND_PASSWORD as string);
  };

  return {
    maskedEmail,
    handleGoBack,
    handleGoToLogin,
    handleGoToFindPassword,
  };
};
