/**
 * AdminUserDetailScreen 비즈니스 로직
 * 유저 상세 정보 로드 및 활성화/비활성화 처리
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAdmin, MemberInfo } from '../../hooks/useAdmin';

interface AdminUserDetailScreenContainerProps {
  userId: number;
  navigation: any;
}

export const useAdminUserDetailScreenContainer = ({
  userId,
  navigation,
}: AdminUserDetailScreenContainerProps) => {
  const { getUserDetail, deactivateUser, activateUser, loading, error } = useAdmin();
  const [user, setUser] = useState<MemberInfo | null>(null);

  /**
   * 유저 상세 정보 로드
   * - getUserDetail API 호출
   */
  const loadUserDetail = useCallback(async () => {
    const result = await getUserDetail(userId);
    if (result.success && result.data) {
      setUser(result.data);
    }
  }, [userId, getUserDetail]);

  useEffect(() => {
    loadUserDetail();
  }, [loadUserDetail]);

  /**
   * 유저 수정 화면으로 이동
   */
  const handleEdit = useCallback(() => {
    if (user) {
      navigation.navigate('AdminUserEdit', { userId: user.id });
    }
  }, [user, navigation]);

  /**
   * 유저 활성화/비활성화 토글
   * - 확인 Alert 표시
   * - activateUser 또는 deactivateUser API 호출
   * - 성공/실패 Alert 표시
   * - 데이터 새로고침
   */
  const handleToggleActive = useCallback(async () => {
    if (!user) return;

    const isInactive = user.status === 'INACTIVE';
    const action = isInactive ? '활성화' : '비활성화';
    Alert.alert(
      `유저 ${action}`,
      `이 유저를 ${action}하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: action,
          style: isInactive ? 'default' : 'destructive',
          onPress: async () => {
            const result = isInactive
              ? await activateUser(user.id)
              : await deactivateUser(user.id);

            if (result.success) {
              Alert.alert('성공', `유저가 ${action}되었습니다.`);
              loadUserDetail();
            } else {
              Alert.alert('오류', result.error || `${action}에 실패했습니다.`);
            }
          },
        },
      ]
    );
  }, [user, activateUser, deactivateUser, loadUserDetail]);

  return {
    user,
    loading,
    error,
    handleEdit,
    handleToggleActive,
  };
};
