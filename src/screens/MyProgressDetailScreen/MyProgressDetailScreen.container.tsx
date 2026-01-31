/**
 * MyProgressDetailScreen 비즈니스 로직
 * 나의 진행률 상세 화면: 배지 목록
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { getMyBadges, Badge } from '../../api/badgeApi';
import { logError } from '../../utils/logger';

const BADGES_PAGE_SIZE = 9;

interface MyProgressDetailScreenContainerProps {
  navigation: NavigationProp<RootStackParamList>;
}

export const useMyProgressDetailScreenContainer = ({ navigation }: MyProgressDetailScreenContainerProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const [validBadges, setValidBadges] = useState<Badge[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);


  /**
   * 배지 로딩
   */
  const loadBadges = useCallback(async () => {
    try {
      setBadgesLoading(true);
      const result = await getMyBadges();

      if (result.success && result.data) {
        setValidBadges(result.data.badges || []);
      }
    } catch (error) {
      logError('배지 로딩 실패', error as Error);
    } finally {
      setBadgesLoading(false);
    }
  }, []);

  /**
   * 초기 데이터 로딩
   */
  useEffect(() => {
    loadBadges();
  }, [loadBadges]);

  /**
   * 새로고침
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBadges();
    setRefreshing(false);
  }, [loadBadges]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(validBadges.length / BADGES_PAGE_SIZE)),
    [validBadges.length]
  );

  const displayedBadges = useMemo(
    () =>
      validBadges.slice(
        currentPage * BADGES_PAGE_SIZE,
        (currentPage + 1) * BADGES_PAGE_SIZE
      ),
    [validBadges, currentPage]
  );

  useEffect(() => {
    if (currentPage >= totalPages) setCurrentPage(Math.max(0, totalPages - 1));
  }, [totalPages, currentPage]);

  const handleNextPage = useCallback(() => {
    setCurrentPage((p) => Math.min(p + 1, totalPages - 1));
  }, [totalPages]);

  const handlePrevPage = useCallback(() => {
    setCurrentPage((p) => Math.max(0, p - 1));
  }, []);

  /**
   * 배지 클릭 핸들러
   */
  const handleBadgePress = useCallback(
    (badge: Badge) => {
      navigation.navigate('BadgeDetail', { badge });
    },
    [navigation]
  );

  return {
    // State
    refreshing,
    validBadges,
    displayedBadges,
    badgesLoading,
    currentPage,
    totalPages,
    // Handlers
    onRefresh,
    handleBadgePress,
    handleNextPage,
    handlePrevPage,
  };
};
