/**
 * MissionHistoryScreen 비즈니스 로직
 * 미션 이력 로드, 필터링, 페이지네이션, 통계 계산
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getUserMissions, UserMission, UserMissionStatus } from '../../api/missionApi';
import { colors } from '../../utils/designTokens';

interface MissionHistoryScreenContainerProps {
  navigation: any;
}

type FilterType = 'all' | 'completed' | 'expired';

export const useMissionHistoryScreenContainer = ({
  navigation: _navigation,
}: MissionHistoryScreenContainerProps) => {
  const [missions, setMissions] = useState<UserMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  /**
   * 미션 이력 조회
   * - getUserMissions API 호출
   * - 페이지네이션 처리
   */
  const fetchHistory = useCallback(async (pageNum: number = 0, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNum === 0) {
        setLoading(true);
      }

      const result = await getUserMissions({ page: pageNum, size: 20 });

      if (result.success && result.data) {
        const newMissions = result.data.content;
        if (isRefresh || pageNum === 0) {
          setMissions(newMissions);
        } else {
          setMissions(prev => [...prev, ...newMissions]);
        }
        setHasMore(result.data.number < result.data.totalPages - 1);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('미션 이력 조회 실패:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(0);
  }, [fetchHistory]);

  /**
   * 새로고침
   */
  const handleRefresh = useCallback(() => {
    fetchHistory(0, true);
  }, [fetchHistory]);

  /**
   * 더 불러오기
   */
  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchHistory(page + 1);
    }
  }, [hasMore, loading, page, fetchHistory]);

  /**
   * 필터 변경
   */
  const handleFilterChange = useCallback((newFilter: FilterType) => {
    setFilter(newFilter);
  }, []);

  /**
   * 필터링된 미션 목록
   */
  const filteredMissions = useMemo(() => {
    if (filter === 'all') return missions;
    if (filter === 'completed') return missions.filter(m => m.status === 'COMPLETED');
    if (filter === 'expired') return missions.filter(m => m.status === 'EXPIRED');
    return missions;
  }, [missions, filter]);

  /**
   * 통계 계산
   */
  const stats = useMemo(() => {
    const completedCount = missions.filter(m => m.status === 'COMPLETED').length;
    const expiredCount = missions.filter(m => m.status === 'EXPIRED').length;
    const successRate = missions.length > 0
      ? Math.round((completedCount / missions.length) * 100)
      : 0;

    return {
      completed: completedCount,
      expired: expiredCount,
      successRate,
    };
  }, [missions]);

  /**
   * 상태 색상 가져오기
   */
  const getStatusColor = useCallback((status: UserMissionStatus) => {
    switch (status) {
      case 'COMPLETED': return colors.success;
      case 'EXPIRED': return colors.error;
      case 'ASSIGNED': return colors.info;
      case 'PENDING': return colors.warning;
      default: return colors.text.secondary;
    }
  }, []);

  /**
   * 상태 텍스트 가져오기
   */
  const getStatusText = useCallback((status: UserMissionStatus) => {
    switch (status) {
      case 'COMPLETED': return '완료';
      case 'EXPIRED': return '만료';
      case 'ASSIGNED': return '진행중';
      case 'PENDING': return '인증대기';
      default: return status;
    }
  }, []);

  return {
    missions: filteredMissions,
    loading,
    refreshing,
    filter,
    stats,
    hasMore,
    handleRefresh,
    handleLoadMore,
    handleFilterChange,
    getStatusColor,
    getStatusText,
  };
};
