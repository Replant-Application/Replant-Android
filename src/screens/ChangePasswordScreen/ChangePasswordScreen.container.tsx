/**
 * ChangePasswordScreen 비즈니스 로직
 * 비밀번호 변경 유효성 검사 및 API 호출
 */

import { useState } from 'react';
import { Alert } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { resetPassword, ResetPasswordRequest } from '../../api/authApi';
import { getUserInfo } from '../../utils/tokenStorage';
import { RootStackParamList } from '../../types/navigation';

interface ChangePasswordScreenContainerProps {
  navigation: NavigationProp<RootStackParamList>;
}

interface PasswordErrors {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * 비밀번호 유효성 검증
 */
const validatePassword = (password: string): string => {
  if (!password) {
    return '비밀번호를 입력해주세요.';
  }
  if (password.length < 8) {
    return '비밀번호는 8자 이상이어야 합니다.';
  }
  return '';
};

/**
 * 새 비밀번호와 확인 비밀번호 일치 확인
 */
const validateConfirmPassword = (newPwd: string, confirmPwd: string): string => {
  if (!confirmPwd) {
    return '비밀번호 확인을 입력해주세요.';
  }
  if (newPwd !== confirmPwd) {
    return '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.';
  }
  return '';
};

/**
 * ChangePasswordScreen Container Hook
 * 비즈니스 로직을 처리하고 UI에 필요한 데이터와 핸들러를 제공
 */
export const useChangePasswordScreenContainer = ({
  navigation,
}: ChangePasswordScreenContainerProps) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<PasswordErrors>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // 전체 폼 검증
  const validateForm = (): boolean => {
    const newErrors: PasswordErrors = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    // 현재 비밀번호 검증
    newErrors.oldPassword = validatePassword(oldPassword);

    // 새 비밀번호 검증
    newErrors.newPassword = validatePassword(newPassword);

    // 확인 비밀번호 검증
    newErrors.confirmPassword = validateConfirmPassword(newPassword, confirmPassword);

    // 새 비밀번호와 현재 비밀번호가 같은지 확인
    if (oldPassword && newPassword && oldPassword === newPassword) {
      newErrors.newPassword = '새 비밀번호는 현재 비밀번호와 달라야 합니다.';
    }

    setErrors(newErrors);

    return !newErrors.oldPassword && !newErrors.newPassword && !newErrors.confirmPassword;
  };

  // 비밀번호 변경 처리
  const handleChangePassword = async () => {
    // 폼 검증
    if (!validateForm()) {
      return;
    }

    // 사용자 이메일 가져오기
    let userEmail = '';
    try {
      const userInfo = await getUserInfo();
      if (userInfo?.email) {
        userEmail = userInfo.email;
      } else {
        Alert.alert('오류', '사용자 정보를 가져올 수 없습니다. 다시 로그인해주세요.');
        return;
      }
    } catch (error) {
      Alert.alert('오류', '사용자 정보를 가져오는 중 오류가 발생했습니다.');
      return;
    }

    setIsLoading(true);

    try {
      const requestData: ResetPasswordRequest = {
        id: userEmail,
        oldPassword: oldPassword.trim(),
        newPassword: newPassword.trim(),
      };

      const result = await resetPassword(requestData);

      if (result.success) {
        Alert.alert(
          '완료',
          '비밀번호가 성공적으로 변경되었습니다.',
          [
            {
              text: '확인',
              onPress: () => {
                // 입력 필드 초기화
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setErrors({ oldPassword: '', newPassword: '', confirmPassword: '' });
                // 이전 화면으로 돌아가기
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        // 에러 코드에 따른 메시지 처리
        let errorMessage = '비밀번호 변경에 실패했습니다.';

        if (result.error) {
          const errorStr =
            typeof result.error === 'string' ? result.error : JSON.stringify(result.error);

          // 백엔드 에러 코드 매핑
          if (
            errorStr.includes('ACCOUNT-011') ||
            errorStr.includes('비밀번호가 틀립니다') ||
            errorStr.includes('기존 비밀번호가 일치하지 않습니다')
          ) {
            errorMessage = '현재 비밀번호가 일치하지 않습니다.';
            setErrors((prev) => ({ ...prev, oldPassword: errorMessage }));
          } else if (
            errorStr.includes('ACCOUNT-020') ||
            errorStr.includes('동일합니다') ||
            errorStr.includes('새 비밀번호가 기존 비밀번호와 동일')
          ) {
            errorMessage = '새 비밀번호는 현재 비밀번호와 달라야 합니다.';
            setErrors((prev) => ({ ...prev, newPassword: errorMessage }));
          } else if (
            errorStr.includes('ACCOUNT-010') ||
            errorStr.includes('존재하지 않습니다') ||
            errorStr.includes('회원 정보를 찾을 수 없습니다')
          ) {
            errorMessage = '회원 정보를 찾을 수 없습니다.';
          } else if (errorStr.includes('ACCOUNT-007') || errorStr.includes('필수 요소')) {
            errorMessage = '모든 필드를 입력해주세요.';
          } else {
            errorMessage =
              typeof result.error === 'string'
                ? result.error
                : '비밀번호 변경에 실패했습니다.';
          }
        }

        Alert.alert('오류', errorMessage);
      }
    } catch (error) {
      console.error('비밀번호 변경 오류:', error);
      Alert.alert('오류', '비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 현재 비밀번호 변경 핸들러
  const handleOldPasswordChange = (text: string) => {
    setOldPassword(text);
    if (errors.oldPassword) {
      setErrors((prev) => ({ ...prev, oldPassword: '' }));
    }
  };

  // 새 비밀번호 변경 핸들러
  const handleNewPasswordChange = (text: string) => {
    setNewPassword(text);
    if (errors.newPassword) {
      setErrors((prev) => ({ ...prev, newPassword: '' }));
    }
    // 확인 비밀번호와 일치 여부 재확인
    if (confirmPassword && text !== confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.',
      }));
    } else if (confirmPassword && text === confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: '' }));
    }
  };

  // 확인 비밀번호 변경 핸들러
  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: '' }));
    }
    // 새 비밀번호와 일치 여부 확인
    if (newPassword && text !== newPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.',
      }));
    } else if (newPassword && text === newPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: '' }));
    }
  };

  return {
    oldPassword,
    newPassword,
    confirmPassword,
    isLoading,
    errors,
    handleOldPasswordChange,
    handleNewPasswordChange,
    handleConfirmPasswordChange,
    handleChangePassword,
  };
};
