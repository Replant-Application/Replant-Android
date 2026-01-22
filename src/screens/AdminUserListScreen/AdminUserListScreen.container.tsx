/**
 * AdminUserListScreen 비즈니스 로직
 * 유저 목록 로드, 검색, 필터링 처리
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAdmin, MemberInfo } from '../../hooks/useAdmin';

interface AdminUserListScreenContainerProps {
  navigation: any;
}

type FilterType = 'all' | 'active' | 'inactive';

export const useAdminUserListScreenContainer = ({ navigation }: AdminUserListScreenContainerProps) => {
  const { getAllUsers, loading, error } = useAdmin();
  const [users, setUsers] = useState<MemberInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [page] = useState(1);
  const limit = 20;

  /**
   * 유저 목록 로드
   * - getAllUsers API 호출
   */
  const loadUsers = useCallback(async () => {
    const result = await getAllUsers({ page, limit });
    if (result.success && result.data) {
      setUsers(result.data);
    }
  }, [page, limit, getAllUsers]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  /**
   * 필터링된 유저 목록 계산
   * - 검색어 필터 (닉네임, 이메일)
   * - 상태 필터 (전체, 활성, 비활성)
   */
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // 검색 필터
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          user.nickname.toLowerCase().includes(query) ||
          (user.email && user.email.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // 상태 필터 (status 필드 사용)
      if (filter === 'active') {
        return user.status === 'ACTIVE';
      }
      if (filter === 'inactive') {
        return user.status === 'INACTIVE';
      }

      return true;
    });
  }, [users, searchQuery, filter]);

  /**
   * 검색어 변경 핸들러
   */
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  /**
   * 필터 변경 핸들러
   */
  const handleFilterChange = useCallback((newFilter: FilterType) => {
    setFilter(newFilter);
  }, []);

  /**
   * 유저 상세 화면으로 이동
   */
  const handleUserPress = useCallback((userId: number) => {
    navigation.navigate('AdminUserDetail', { userId });
  }, [navigation]);

  return {
    filteredUsers,
    searchQuery,
    filter,
    loading,
    error,
    handleSearchChange,
    handleFilterChange,
    handleUserPress,
  };
};
