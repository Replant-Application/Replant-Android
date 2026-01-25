/**
 * AdminUserEditScreen 비즈니스 로직
 * 유저 정보 로드 및 수정 처리
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAdmin } from '../../hooks/useAdmin';
import { UserInfo, updateUser } from '../../api/manageApi';

interface AdminUserEditScreenContainerProps {
  userId: number;
  navigation: any;
}

export const useAdminUserEditScreenContainer = ({
  userId,
  navigation,
}: AdminUserEditScreenContainerProps) => {
  const { getUserDetail, loading, error } = useAdmin();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');

  /**
   * 유저 상세 정보 로드
   * - getUserDetail API 호출
   * - MemberDetail을 UserInfo로 변환
   * - 폼 필드 초기화
   */
  const loadUserDetail = useCallback(async () => {
    const result = await getUserDetail(userId);
    if (result.success && result.data) {
      const userData = result.data;
      // MemberDetail을 UserInfo로 변환
      const userInfo: UserInfo = {
        id: userData.id,
        username: userData.username || userData.nickname || '',
        nickname: userData.nickname,
        role: userData.role,
        email: userData.email,
        isActive: userData.status === 'ACTIVE' || userData.isActive,
        createdAt: userData.createdAt,
      };
      setUser(userInfo);
      setNickname(userData.nickname || '');
      setEmail(userData.email || '');
      setRole(userData.role || 'user');
    }
  }, [userId, getUserDetail]);

  useEffect(() => {
    loadUserDetail();
  }, [loadUserDetail]);

  /**
   * 닉네임 변경 핸들러
   */
  const handleNicknameChange = useCallback((text: string) => {
    setNickname(text);
  }, []);

  /**
   * 이메일 변경 핸들러
   */
  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
  }, []);

  /**
   * 역할 변경 핸들러
   */
  const handleRoleChange = useCallback((newRole: string) => {
    setRole(newRole);
  }, []);

  /**
   * 유저 정보 저장
   * - 유효성 검사 (닉네임 필수)
   * - updateUser API 호출
   * - 성공/실패 Alert 표시
   * - 이전 화면으로 이동
   */
  const handleSave = useCallback(async () => {
    if (!nickname.trim()) {
      Alert.alert('오류', '닉네임을 입력해주세요.');
      return;
    }

    const result = await updateUser(userId, {
      nickname: nickname.trim(),
      email: email.trim() || undefined,
      role: role as any,
    });

    if (result.success) {
      Alert.alert('성공', '유저 정보가 수정되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('오류', result.error || '유저 정보 수정에 실패했습니다.');
    }
  }, [nickname, email, role, userId, navigation]);

  return {
    user,
    nickname,
    email,
    role,
    loading,
    error,
    handleNicknameChange,
    handleEmailChange,
    handleRoleChange,
    handleSave,
  };
};
