/**
 * AdminDashboardScreen 비즈니스 로직
 * 관리자 대시보드 데이터 로드 및 통계 계산
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAdmin, MemberInfo } from '../../hooks/useAdmin';

interface AdminDashboardScreenContainerProps {
  navigation: any;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
}

export const useAdminDashboardScreenContainer = ({ navigation }: AdminDashboardScreenContainerProps) => {
  const { getAllUsers, deleteAllUsers, loading, error } = useAdmin();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
  });
  const [recentUsers, setRecentUsers] = useState<MemberInfo[]>([]);

  /**
   * 대시보드 데이터 로드
   * - 전체 유저 목록 조회
   * - 통계 계산 (전체, 활성, 비활성)
   * - 최근 가입 유저 정렬 (최근 5명)
   */
  const loadDashboardData = useCallback(async () => {
    const result = await getAllUsers({ page: 1, limit: 100 });
    if (result.success && result.data) {
      const users = result.data;
      const activeUsers = users.filter(u => u.status === 'ACTIVE').length;
      const inactiveUsers = users.filter(u => u.status === 'INACTIVE').length;

      setStats({
        totalUsers: users.length,
        activeUsers,
        inactiveUsers,
      });

      // 최근 가입 유저 (최근 5명)
      const sorted = [...users].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      setRecentUsers(sorted.slice(0, 5));
    }
  }, [getAllUsers]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  /**
   * 모든 유저 삭제 처리
   * - 확인 Alert 표시
   * - deleteAllUsers API 호출
   * - 성공/실패 Alert 표시
   * - 데이터 새로고침
   */
  const handleDeleteAllUsers = useCallback(() => {
    Alert.alert(
      '⚠️ 경고',
      `모든 유저 데이터가 삭제됩니다.\n\n이 작업은 되돌릴 수 없습니다.\n정말로 모든 유저를 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteAllUsers();
              if (result.success) {
                Alert.alert(
                  '✅ 완료',
                  `${result.data?.deletedCount || 0}명의 유저가 삭제되었습니다.`
                );
                // 데이터 새로고침
                loadDashboardData();
              } else {
                Alert.alert('오류', result.error || '유저 삭제에 실패했습니다.');
              }
            } catch (err) {
              Alert.alert('오류', '유저 삭제 중 오류가 발생했습니다.');
            }
          }
        }
      ]
    );
  }, [deleteAllUsers, loadDashboardData]);

  /**
   * 유저 상세 화면으로 이동
   */
  const handleUserPress = useCallback((userId: number) => {
    navigation.navigate('AdminUserDetail', { userId });
  }, [navigation]);

  return {
    stats,
    recentUsers,
    loading,
    error,
    handleDeleteAllUsers,
    handleUserPress,
  };
};
