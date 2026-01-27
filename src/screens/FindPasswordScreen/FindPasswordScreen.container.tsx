/**
 * FindPasswordScreen 비즈니스 로직
 * 비밀번호 찾기 단계별 처리: 이메일 인증, 임시 비밀번호 발급
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { sendVerification, verifyEmail, genPassword, GenPasswordRequest } from '../../api/authApi';
import { SCREEN_NAMES } from '../../utils/constants';

interface FindPasswordScreenContainerProps {
  onNavigate: (screen: string, params?: any) => void;
}

type Step = 'email' | 'verification' | 'complete';

interface PasswordErrors {
  email: string;
  verificationCode: string;
}

export const useFindPasswordScreenContainer = ({
  onNavigate,
}: FindPasswordScreenContainerProps) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<PasswordErrors>({
    email: '',
    verificationCode: '',
  });

  /**
   * 이메일 유효성 검사
   */
  const validateEmail = useCallback((emailValue: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/;
    return emailRegex.test(emailValue);
  }, []);

  /**
   * 인증번호 유효성 검사
   */
  const validateVerificationCode = useCallback((code: string): boolean => {
    return /^\d{6}$/.test(code);
  }, []);

  /**
   * 이메일 변경 핸들러
   */
  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  }, [errors.email]);

  /**
   * 인증번호 변경 핸들러
   */
  const handleVerificationCodeChange = useCallback((text: string) => {
    // 숫자만 입력 가능
    const numericText = text.replace(/[^0-9]/g, '');
    setVerificationCode(numericText);
    if (errors.verificationCode) {
      setErrors(prev => ({ ...prev, verificationCode: '' }));
    }
  }, [errors.verificationCode]);

  /**
   * 1단계: 이메일 입력 및 인증번호 발송
   * - 이메일 유효성 검사
   * - sendVerification API 호출
   * - 성공 시 2단계로 이동
   */
  const handleSendVerification = useCallback(async () => {
    setErrors({ email: '', verificationCode: '' });

    // 이메일 검증
    if (!email.trim()) {
      setErrors({ email: '이메일을 입력해주세요.', verificationCode: '' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: '올바른 이메일 형식으로 입력해주세요.', verificationCode: '' });
      return;
    }

    setIsLoading(true);

    try {
      const result = await sendVerification({ email });

      if (result.success && result.data) {
        // 인증번호 발송 성공 → 2단계로 이동
        setStep('verification');
        Alert.alert('인증번호 발송', '이메일로 인증번호를 보냈습니다. 인증번호를 입력해주세요.');
      } else {
        // 에러 메시지 추출
        let errorMessage = '인증번호 발송에 실패했습니다.';
        if (result.error) {
          if (typeof result.error === 'string') {
            errorMessage = result.error;
          } else if (typeof result.error === 'object') {
            const errorObj = result.error as any;
            errorMessage = errorObj.message || errorObj.error || errorMessage;
          }
        }
        setErrors({ email: errorMessage, verificationCode: '' });
      }
    } catch (error) {
      console.error('Send verification error:', error);
      setErrors({ email: '인증번호 발송 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', verificationCode: '' });
    } finally {
      setIsLoading(false);
    }
  }, [email, validateEmail]);

  /**
   * 2단계: 인증번호 확인
   * - 인증번호 유효성 검사
   * - verifyEmail API 호출
   * - 성공 시 3단계로 이동
   */
  const handleVerifyEmail = useCallback(async () => {
    setErrors({ email: '', verificationCode: '' });

    // 인증번호 검증
    if (!verificationCode.trim()) {
      setErrors({ email: '', verificationCode: '인증번호를 입력해주세요.' });
      return;
    }

    if (!validateVerificationCode(verificationCode)) {
      setErrors({ email: '', verificationCode: '인증번호는 6자리 숫자로 입력해주세요.' });
      return;
    }

    setIsLoading(true);

    try {
      const result = await verifyEmail({
        email,
        code: verificationCode,
      });

      if (result.success && result.data !== undefined) {
        if (result.data === true) {
          // 인증 성공 → 3단계로 이동
          setStep('complete');
          Alert.alert('인증 완료', '이메일 인증이 완료되었습니다.\n임시 비밀번호를 발급받으세요.');
        } else {
          // 인증 실패 (data가 false)
          setErrors({ email: '', verificationCode: '인증번호가 올바르지 않습니다.' });
        }
      } else {
        // 에러 메시지 추출
        let errorMessage = '인증번호가 올바르지 않습니다.';
        if (result.error) {
          if (typeof result.error === 'string') {
            errorMessage = result.error;
          } else if (typeof result.error === 'object') {
            const errorObj = result.error as any;
            errorMessage = errorObj.message || errorObj.error || errorMessage;
          }
        }
        setErrors({ email: '', verificationCode: errorMessage });
      }
    } catch (error) {
      console.error('Verify email error:', error);
      setErrors({ email: '', verificationCode: '인증번호 확인 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.' });
    } finally {
      setIsLoading(false);
    }
  }, [email, verificationCode, validateVerificationCode]);

  /**
   * 3단계: 임시 비밀번호 발급
   * - genPassword API 호출
   * - 성공 시 Alert 표시 및 로그인 화면으로 이동
   */
  const handleGenPassword = useCallback(async () => {
    setIsLoading(true);

    try {
      const requestData: GenPasswordRequest = {
        id: email,
        name: email.split('@')[0] || email,
      };
      
      const result = await genPassword(requestData);

      if (result.success && result.data) {
        // 임시 비밀번호 발급 성공
        const tempPassword = result.data.temporaryPassword;
        const message = tempPassword
          ? `임시 비밀번호가 발급되었습니다.\n\n임시 비밀번호: ${tempPassword}\n\n로그인 후 비밀번호를 변경해주세요.`
          : result.data.message || '임시 비밀번호가 발급되었습니다.\n이메일을 확인해주세요.';

        Alert.alert('비밀번호 발급 완료', message, [
          {
            text: '확인',
            onPress: () => {
              // 로그인 화면으로 이동
              onNavigate(SCREEN_NAMES.LOGIN as string);
            },
          },
        ]);
      } else {
        // 에러 메시지 추출
        let errorMessage = '임시 비밀번호 발급에 실패했습니다.';
        if (result.error) {
          if (typeof result.error === 'string') {
            errorMessage = result.error;
          } else if (typeof result.error === 'object') {
            const errorObj = result.error as any;
            errorMessage = errorObj.message || errorObj.error || errorMessage;
          }
        }
        Alert.alert('오류', errorMessage);
      }
    } catch (error) {
      console.error('Gen password error:', error);
      Alert.alert('오류', '임시 비밀번호 발급 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  }, [email, onNavigate]);

  /**
   * 단계 초기화 (처음부터 다시 시작)
   */
  const handleReset = useCallback(() => {
    setStep('email');
    setEmail('');
    setVerificationCode('');
    setErrors({ email: '', verificationCode: '' });
  }, []);

  /**
   * 로그인 화면으로 이동
   */
  const handleGoToLogin = useCallback(() => {
    onNavigate(SCREEN_NAMES.LOGIN as string);
  }, [onNavigate]);

  return {
    step,
    email,
    verificationCode,
    isLoading,
    errors,
    handleEmailChange,
    handleVerificationCodeChange,
    handleSendVerification,
    handleVerifyEmail,
    handleGenPassword,
    handleReset,
    handleGoToLogin,
  };
};
