/**
 * SignUpScreen 비즈니스 로직
 * 회원가입 화면: 이메일 인증, 회원가입
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { join, sendVerification, verifyEmail } from '../../api/authApi';
import { saveTokens, saveUserInfo } from '../../utils/tokenStorage';
import { apiClient } from '../../api/client';
import { useUser } from '../../contexts/UserContext';
import { Gender } from '../../types/screens/auth';
import { getBirthYears } from '../../constants/screens/auth';

interface SignUpScreenContainerProps {
  onNavigate: (screen: string) => void;
}

export const useSignUpScreenContainer = ({ onNavigate: _onNavigate }: SignUpScreenContainerProps) => {
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [showVerificationCodeInput, setShowVerificationCodeInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState<number>(0); // 타이머 초 단위
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showVerificationCompleteModal, setShowVerificationCompleteModal] = useState(false);
  const [showSignUpCompleteModal, setShowSignUpCompleteModal] = useState(false);

  // 성별, 지역, 출생연도 상태
  const [gender, setGender] = useState<Gender | null>(null);
  const [region, setRegion] = useState<string | null>(null);
  const [regionName, setRegionName] = useState<string>('');
  const [showRegionModal, setShowRegionModal] = useState(false);

  const [birthYear, setBirthYear] = useState<number | null>(null);
  const [showBirthYearModal, setShowBirthYearModal] = useState(false);

  // 출생연도 목록
  const birthYears = getBirthYears();

  const [errors, setErrors] = useState<SignUpErrors>({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    phone: '',
    verificationCode: '',
    gender: '',
    region: '',
    birthYear: '',
  });

  // 타이머 카운트다운
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  /**
   * 이메일 유효성 검사
   */
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/;
    return emailRegex.test(email);
  }, []);

  /**
   * 전화번호 유효성 검사
   */
  const validatePhone = useCallback((phone: string): boolean => {
    const phoneRegex = /^01[016789][0-9]{7,8}$/;
    return phoneRegex.test(phone.replace(/-/g, ''));
  }, []);

  /**
   * 인증번호 유효성 검사
   */
  const validateVerificationCode = useCallback((code: string): boolean => {
    return /^\d{6}$/.test(code);
  }, []);

  /**
   * 이메일 인증번호 발송
   */
  const handleSendVerification = useCallback(async () => {
    setErrors({ ...errors, email: '', verificationCode: '' });
    setIsEmailVerified(false);
    setVerificationCode('');
    setShowVerificationCodeInput(false);
    setTimer(0);

    // 이메일 검증
    if (!email.trim()) {
      setErrors({ ...errors, email: '이메일을 입력해주세요.', verificationCode: '' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ ...errors, email: '올바른 이메일 형식으로 입력해주세요.', verificationCode: '' });
      return;
    }

    setIsSendingVerification(true);

    try {
      const result = await sendVerification({ email });

      if (result.success && result.data) {
        setShowVerificationCodeInput(true);
        setTimer(180); // 3분(180초) 타이머 시작
        setShowVerificationModal(true);
      } else {
        let errorMessage = '인증번호 발송에 실패했습니다.';
        if (result.error) {
          if (typeof result.error === 'string') {
            errorMessage = result.error;
          } else if (typeof result.error === 'object') {
            const errorObj = result.error as any;
            errorMessage = errorObj.message || errorObj.error || errorMessage;
          }
        }
        setErrors({ ...errors, email: errorMessage, verificationCode: '' });
      }
    } catch (error) {
      console.error('Send verification error:', error);
      setErrors({ ...errors, email: '인증번호 발송 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', verificationCode: '' });
    } finally {
      setIsSendingVerification(false);
    }
  }, [email, errors, validateEmail]);

  /**
   * 이메일 인증번호 확인
   */
  const handleVerifyEmail = useCallback(async () => {
    setErrors({ ...errors, email: '', verificationCode: '' });

    // 인증번호 검증
    if (!verificationCode.trim()) {
      setErrors({ ...errors, email: '', verificationCode: '인증번호를 입력해주세요.' });
      return;
    }

    if (!validateVerificationCode(verificationCode)) {
      setErrors({ ...errors, email: '', verificationCode: '인증번호는 6자리 숫자로 입력해주세요.' });
      return;
    }

    setIsVerifyingCode(true);

    try {
      const result = await verifyEmail({
        email,
        code: verificationCode,
      });

      if (result.success && result.data !== undefined) {
        if (result.data === true) {
          setIsEmailVerified(true);
          setTimer(0);
          setShowVerificationCompleteModal(true);
        } else {
          setErrors({ ...errors, email: '', verificationCode: '인증번호가 올바르지 않습니다.' });
        }
      } else {
        let errorMessage = '인증번호가 올바르지 않습니다.';
        if (result.error) {
          if (typeof result.error === 'string') {
            errorMessage = result.error;
          } else if (typeof result.error === 'object') {
            const errorObj = result.error as any;
            errorMessage = errorObj.message || errorObj.error || errorMessage;
          }
        }
        setErrors({ ...errors, email: '', verificationCode: errorMessage });
      }
    } catch (error) {
      console.error('Verify email error:', error);
      setErrors({ ...errors, email: '', verificationCode: '인증번호 확인 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.' });
    } finally {
      setIsVerifyingCode(false);
    }
  }, [email, verificationCode, errors, validateVerificationCode]);

  /**
   * 회원가입
   */
  const handleSignUp = useCallback(async () => {
    // 에러 초기화
    setErrors({
      email: '',
      password: '',
      confirmPassword: '',
      nickname: '',
      phone: '',
      verificationCode: '',
      gender: '',
      region: '',
      birthYear: '',
    });

    let hasError = false;
    const newErrors: SignUpErrors = {
      email: '',
      password: '',
      confirmPassword: '',
      nickname: '',
      phone: '',
      verificationCode: '',
      gender: '',
      region: '',
      birthYear: '',
    };

    // 유효성 검사
    if (!email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
      hasError = true;
    } else if (!validateEmail(email)) {
      newErrors.email = '올바른 이메일 형식으로 입력해주세요.';
      hasError = true;
    } else if (!isEmailVerified) {
      newErrors.email = '이메일 인증을 완료해주세요.';
      hasError = true;
    }

    if (!password.trim()) {
      newErrors.password = '비밀번호를 입력해주세요.';
      hasError = true;
    } else if (password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상 입력해주세요.';
      hasError = true;
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
      hasError = true;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
      hasError = true;
    }

    if (!nickname.trim()) {
      newErrors.nickname = '닉네임을 입력해주세요.';
      hasError = true;
    } else if (nickname.length < 2 || nickname.length > 20) {
      newErrors.nickname = '닉네임은 2~20자 사이로 입력해주세요.';
      hasError = true;
    }

    if (!phone.trim()) {
      newErrors.phone = '전화번호를 입력해주세요.';
      hasError = true;
    } else if (!validatePhone(phone)) {
      newErrors.phone = '올바른 전화번호 형식으로 입력해주세요. (예: 01012345678)';
      hasError = true;
    }

    if (!gender) {
      newErrors.gender = '성별을 선택해주세요.';
      hasError = true;
    }

    if (!region) {
      newErrors.region = '지역을 선택해주세요.';
      hasError = true;
    }

    if (!birthYear) {
      newErrors.birthYear = '출생연도를 선택해주세요.';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const result = await join({
        id: email,
        password: password,
        name: nickname,
        phone: phone.replace(/-/g, ''),
        gender: gender || undefined,
        region: region || undefined,
        birthYear: birthYear || undefined,
      });

      if (result.success && result.data) {
        const { accessToken, refreshToken, name, tokens } = result.data;

        // 토큰 저장
        const finalAccessToken = tokens?.accessToken || accessToken || '';
        const finalRefreshToken = tokens?.refreshToken || refreshToken || '';

        if (finalAccessToken && finalRefreshToken) {
          await saveTokens(finalAccessToken, finalRefreshToken);
        }

        // 사용자 정보 저장
        await saveUserInfo({
          id: 0,
          email: email,
          nickname: name,
        });

        // API 클라이언트에 토큰 설정
        apiClient.setAccessToken(finalAccessToken || null);

        // 회원가입 완료 모달 표시 (로그인 처리 전에 먼저 표시)
        setShowSignUpCompleteModal(true);
      } else {
        Alert.alert('회원가입 실패', result.error || '회원가입에 실패했습니다.\n잠시 후 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('SignUp error:', error);
      Alert.alert('오류', '회원가입 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, confirmPassword, nickname, phone, gender, region, birthYear, isEmailVerified, validateEmail, validatePhone]);

  /**
   * 이메일 변경 핸들러
   */
  const handleEmailChange = useCallback(
    (text: string) => {
      setEmail(text);
      setIsEmailVerified(false);
      setVerificationCode('');
      setShowVerificationCodeInput(false);
      setTimer(0);
      if (errors.email) {
        setErrors({ ...errors, email: '', verificationCode: '' });
      }
    },
    [errors]
  );

  /**
   * 인증번호 변경 핸들러
   */
  const handleVerificationCodeChange = useCallback(
    (text: string) => {
      setVerificationCode(text);
      if (errors.verificationCode) {
        setErrors({ ...errors, verificationCode: '' });
      }
    },
    [errors]
  );

  /**
   * 성별 변경 핸들러
   */
  const handleGenderChange = useCallback(
    (g: Gender) => {
      setGender(g);
      if (errors.gender) {
        setErrors({ ...errors, gender: '' });
      }
    },
    [errors]
  );

  /**
   * 지역 변경 핸들러
   */
  const handleRegionChange = useCallback(
    (code: string, name: string) => {
      setRegion(code);
      setRegionName(name);
      if (errors.region) {
        setErrors({ ...errors, region: '' });
      }
    },
    [errors]
  );

  /**
   * 출생연도 변경 핸들러
   */
  const handleBirthYearChange = useCallback(
    (year: number) => {
      setBirthYear(year);
      if (errors.birthYear) {
        setErrors({ ...errors, birthYear: '' });
      }
    },
    [errors]
  );

  /**
   * 회원가입 완료 모달 닫기 및 로그인 처리
   */
  const handleSignUpCompleteModalClose = useCallback(async () => {
    setShowSignUpCompleteModal(false);
    // 모달이 닫힌 후 로그인 처리
    try {
      await login(nickname);
    } catch (error) {
      console.error('Login error after signup:', error);
    }
    // AppNavigator의 useEffect가 돌발 미션 설정을 확인하고 적절한 화면으로 이동하도록 함
    // 직접 HOME으로 이동하지 않음
  }, [nickname, login]);

  return {
    // State
    email,
    password,
    confirmPassword,
    nickname,
    phone,
    verificationCode,
    isEmailVerified,
    isSendingVerification,
    isVerifyingCode,
    showVerificationCodeInput,
    isLoading,
    timer,
    showVerificationModal,
    showVerificationCompleteModal,
    showSignUpCompleteModal,
    gender,
    region,
    regionName,
    showRegionModal,
    birthYear,
    showBirthYearModal,
    birthYears,
    errors,
    // Setters
    setEmail: handleEmailChange,
    setPassword,
    setConfirmPassword,
    setNickname,
    setPhone,
    setVerificationCode: handleVerificationCodeChange,
    setGender: handleGenderChange,
    setRegion: handleRegionChange,
    setShowRegionModal,
    setBirthYear: handleBirthYearChange,
    setShowBirthYearModal,
    // Handlers
    handleSendVerification,
    handleVerifyEmail,
    handleSignUp,
    handleSignUpCompleteModalClose,
    // Validators
    validateEmail,
    validatePhone,
    validateVerificationCode,
    // Modal handlers
    setShowVerificationModal,
    setShowVerificationCompleteModal,
  };
};
