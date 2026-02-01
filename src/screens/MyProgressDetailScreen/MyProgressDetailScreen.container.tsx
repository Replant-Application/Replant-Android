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
   * UserMission을 Mission 타입으로 변환
   */
  const transformUserMissionToMission = useCallback((userMission: UserMission): Mission | null => {
    // 돌발 미션은 제외
    if (userMission.isSpontaneous === true || userMission.mission === null) {
      return null;
    }
    
    const mission = userMission.mission || userMission.customMission;
    if (!mission) return null;

    // 인증이 완료된 미션만 변환 (verification이 있고 verifiedAt이 있는 경우)
    if (!userMission.verification || !userMission.verification.verifiedAt) {
      return null;
    }

    // 카테고리 매핑
    const categoryMap: Record<string, string> = {
      'DAILY_LIFE': 'growth',
      'GROWTH': 'growth',
      'EXERCISE': 'growth',
      'STUDY': 'growth',
      'HEALTH': 'growth',
      'RELATIONSHIP': 'growth',
    };
    const categoryId = categoryMap[mission.category || 'GROWTH'] || 'growth';

    return {
      id: mission.id,
      mission_id: String(mission.id),
      user_mission_id: userMission.id,
      title: mission.title,
      description: mission.description,
      emoji: '🎯',
      difficulty: (mission.difficultyLevel?.toLowerCase() as any) || 'medium',
      experience: mission.expReward || 50,
      category_id: categoryId as any,
      category: mission.category,
      status: userMission.status,
      missionType: userMission.missionType,
      is_custom: userMission.missionType === 'CUSTOM',
      created_at: userMission.assignedAt,
      due_date: userMission.dueDate,
      completed: true,
      completed_at: userMission.verification.verifiedAt,
      verified: true,
      verified_at: userMission.verification.verifiedAt,
      verification_type: mission.verificationType,
    };
  }, []);

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
