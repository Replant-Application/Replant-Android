/**
 * MyProgressDetailScreen 비즈니스 로직
 * 나의 진행률 상세 화면: 배지 목록
 */

import { useState, useEffect, useCallback } from 'react';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { getMyBadges, Badge } from '../../api/badgeApi';
import { logError } from '../../utils/logger';

interface MyProgressDetailScreenContainerProps {
  navigation: NavigationProp<RootStackParamList>;
}

export const useMyProgressDetailScreenContainer = ({ navigation }: MyProgressDetailScreenContainerProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const [validBadges, setValidBadges] = useState<Badge[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(true);


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
    badgesLoading,
    // Handlers
    onRefresh,
    handleBadgePress,
  };
};
