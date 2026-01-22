/**
 * OAuthCompleteSignUpScreen 비즈니스 로직
 * OAuth 회원가입 완료 - 추가 정보 입력 및 회원가입 완료 처리
 */

import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { RegionInfo } from '../../api/authApi';
import { apiClient } from '../../api/client';
import { useUser } from '../../contexts/UserContext';
import { SCREEN_NAMES } from '../../utils/constants';

interface OAuthCompleteSignUpScreenContainerProps {
  onNavigate: (screen: string) => void;
  route?: {
    params?: {
      email?: string;
      nickname?: string;
      provider?: string;
    };
  };
}

interface FormErrors {
  nickname: string;
  phone: string;
  gender: string;
  region: string;
  birthYear: string;
}

export const useOAuthCompleteSignUpScreenContainer = ({
  onNavigate,
  route,
}: OAuthCompleteSignUpScreenContainerProps) => {
  const { login, refreshUser } = useUser();
  const [nickname, setNickname] = useState(route?.params?.nickname || '');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 성별, 지역, 출생연도 상태
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | null>(null);
  const [region, setRegion] = useState<string | null>(null);
  const [regionName, setRegionName] = useState<string>('');
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [birthYear, setBirthYear] = useState<number | null>(null);
  const [showBirthYearModal, setShowBirthYearModal] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({
    nickname: '',
    phone: '',
    gender: '',
    region: '',
    birthYear: '',
  });

  /**
   * 지역 목록 (백엔드 MetropolitanArea enum과 동일)
   */
  const regions: RegionInfo[] = useMemo(
    () => [
      { code: 'SEOUL', name: '서울특별시' },
      { code: 'BUSAN', name: '부산광역시' },
      { code: 'DAEGU', name: '대구광역시' },
      { code: 'INCHEON', name: '인천광역시' },
      { code: 'GWANGJU', name: '광주광역시' },
      { code: 'DAEJEON', name: '대전광역시' },
      { code: 'ULSAN', name: '울산광역시' },
      { code: 'SEJONG', name: '세종특별자치시' },
      { code: 'GYEONGGI', name: '경기도' },
      { code: 'GANGWON', name: '강원특별자치도' },
      { code: 'CHUNGBUK', name: '충청북도' },
      { code: 'CHUNGNAM', name: '충청남도' },
      { code: 'JEONBUK', name: '전북특별자치도' },
      { code: 'JEONNAM', name: '전라남도' },
      { code: 'GYEONGBUK', name: '경상북도' },
      { code: 'GYEONGNAM', name: '경상남도' },
      { code: 'JEJU', name: '제주특별자치도' },
    ],
    []
  );

  /**
   * 출생연도 목록 생성 (1950년 ~ 현재년도 - 14세)
   */
  const birthYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 14 - 1950 + 1 }, (_, i) => currentYear - 14 - i);
  }, []);

  /**
   * 전화번호 유효성 검사
   */
  const validatePhone = useCallback((phone: string): boolean => {
    const phoneRegex = /^01[016789][0-9]{7,8}$/;
    return phoneRegex.test(phone.replace(/-/g, ''));
  }, []);

  /**
   * 닉네임 변경 핸들러
   */
  const handleNicknameChange = useCallback(
    (text: string) => {
      setNickname(text);
      if (errors.nickname) {
        setErrors(prev => ({ ...prev, nickname: '' }));
      }
    },
    [errors.nickname]
  );

  /**
   * 전화번호 변경 핸들러
   */
  const handlePhoneChange = useCallback(
    (text: string) => {
      setPhone(text);
      if (errors.phone) {
        setErrors(prev => ({ ...prev, phone: '' }));
      }
    },
    [errors.phone]
  );

  /**
   * 성별 선택 핸들러
   */
  const handleGenderSelect = useCallback(
    (selectedGender: 'MALE' | 'FEMALE') => {
      setGender(selectedGender);
      if (errors.gender) {
        setErrors(prev => ({ ...prev, gender: '' }));
      }
    },
    [errors.gender]
  );

  /**
   * 지역 선택 핸들러
   */
  const handleRegionSelect = useCallback(
    (selectedRegion: string, selectedRegionName: string) => {
      setRegion(selectedRegion);
      setRegionName(selectedRegionName);
      setShowRegionModal(false);
      if (errors.region) {
        setErrors(prev => ({ ...prev, region: '' }));
      }
    },
    [errors.region]
  );

  /**
   * 출생연도 선택 핸들러
   */
  const handleBirthYearSelect = useCallback(
    (selectedYear: number) => {
      setBirthYear(selectedYear);
      setShowBirthYearModal(false);
      if (errors.birthYear) {
        setErrors(prev => ({ ...prev, birthYear: '' }));
      }
    },
    [errors.birthYear]
  );

  /**
   * 지역 모달 토글
   */
  const handleToggleRegionModal = useCallback(() => {
    setShowBirthYearModal(false);
    setShowRegionModal(prev => !prev);
  }, []);

  /**
   * 출생연도 모달 토글
   */
  const handleToggleBirthYearModal = useCallback(() => {
    setShowRegionModal(false);
    setShowBirthYearModal(prev => !prev);
  }, []);

  /**
   * 회원가입 완료 처리
   * - 유효성 검사
   * - 사용자 정보 업데이트 API 호출
   * - 로그인 처리 및 홈 화면으로 이동
   */
  const handleComplete = useCallback(async () => {
    // 에러 초기화
    setErrors({
      nickname: '',
      phone: '',
      gender: '',
      region: '',
      birthYear: '',
    });

    let hasError = false;
    const newErrors: FormErrors = {
      nickname: '',
      phone: '',
      gender: '',
      region: '',
      birthYear: '',
    };

    // 유효성 검사
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
      // 사용자 정보 업데이트 API 호출 (PUT /api/users/me)
      const result = await apiClient.put('/users/me', {
        nickname: nickname,
        phone: phone.replace(/-/g, ''),
        gender: gender,
        region: region,
        birthYear: birthYear,
      });

      if (result.success) {
        // 로그인 처리 및 사용자 정보 새로고침
        await login(nickname);
        await refreshUser();

        Alert.alert('환영합니다!', '회원정보 입력이 완료되었습니다.\n홈 화면으로 이동합니다.', [
          {
            text: '확인',
            onPress: () => onNavigate(SCREEN_NAMES.HOME as string),
          },
        ]);
      } else {
        Alert.alert('오류', result.error || '정보 저장에 실패했습니다.\n잠시 후 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('오류', '정보 저장 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  }, [nickname, phone, gender, region, birthYear, validatePhone, login, refreshUser, onNavigate]);

  /**
   * 건너뛰기 처리
   * - 기본 정보로 바로 홈으로 이동
   */
  const handleSkip = useCallback(async () => {
    await login(nickname || route?.params?.email || '사용자');
    await refreshUser();
    onNavigate(SCREEN_NAMES.HOME as string);
  }, [nickname, route?.params?.email, login, refreshUser, onNavigate]);

  return {
    nickname,
    phone,
    gender,
    region,
    regionName,
    birthYear,
    isLoading,
    errors,
    showRegionModal,
    showBirthYearModal,
    regions,
    birthYears,
    handleNicknameChange,
    handlePhoneChange,
    handleGenderSelect,
    handleRegionSelect,
    handleBirthYearSelect,
    handleToggleRegionModal,
    handleToggleBirthYearModal,
    handleComplete,
    handleSkip,
  };
};
