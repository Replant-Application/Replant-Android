/**
 * MyProgressDetailScreen 비즈니스 로직
 * 나의 진행률 상세 화면: 뱃지 목록, 완료된 미션 리스트 (페이지네이션)
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { getMyBadges, Badge } from '../../api/badgeApi';
import { getMissionHistory, UserMission } from '../../api/missionApi';
import { logError } from '../../utils/logger';
import { Mission } from '../../types';
import { spacing } from '../../utils/designTokens';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEMS_PER_PAGE = 5;

interface MyProgressDetailScreenContainerProps {
  navigation: NavigationProp<RootStackParamList>;
}

export const useMyProgressDetailScreenContainer = ({ navigation }: MyProgressDetailScreenContainerProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const [validBadges, setValidBadges] = useState<Badge[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(true);
  const [completedMissions, setCompletedMissions] = useState<Mission[]>([]);
  const [missionsLoading, setMissionsLoading] = useState(true);
  const [currentMissionPage, setCurrentMissionPage] = useState(0);
  const missionFlatListRef = useRef<any>(null);

  /**
   * UserMission을 Mission 타입으로 변환
   */
  const transformUserMissionToMission = useCallback((userMission: UserMission): Mission | null => {
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
   * 뱃지 로딩
   */
  const loadBadges = useCallback(async () => {
    try {
      setBadgesLoading(true);
      const result = await getMyBadges();

      if (result.success && result.data) {
        setValidBadges(result.data.badges || []);
      }
    } catch (error) {
      logError('뱃지 로딩 실패', error as Error);
    } finally {
      setBadgesLoading(false);
    }
  }, []);

  /**
   * 완료된 미션 로딩 (백엔드 API 사용)
   */
  const loadCompletedMissions = useCallback(async () => {
    try {
      setMissionsLoading(true);
      const result = await getMissionHistory({ page: 0, size: 100 });

      if (result.success && result.data) {
        // UserMission을 Mission으로 변환하고 인증 완료된 것만 필터링
        const transformed = result.data.content.map(transformUserMissionToMission).filter((m): m is Mission => m !== null);
        setCompletedMissions(transformed);
      }
    } catch (error) {
      logError('완료된 미션 로딩 실패', error as Error);
    } finally {
      setMissionsLoading(false);
    }
  }, [transformUserMissionToMission]);

  /**
   * 초기 데이터 로딩
   */
  useEffect(() => {
    loadBadges();
    loadCompletedMissions();
  }, [loadBadges, loadCompletedMissions]);

  /**
   * 새로고침
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadBadges(), loadCompletedMissions()]);
    setRefreshing(false);
  }, [loadBadges, loadCompletedMissions]);

  /**
   * 뱃지 클릭 핸들러
   */
  const handleBadgePress = useCallback(
    (badge: Badge) => {
      navigation.navigate('BadgeDetail', { badge });
    },
    [navigation]
  );

  /**
   * 미션 클릭 핸들러
   */
  const handleMissionPress = useCallback(
    (mission: Mission) => {
      navigation.navigate('MissionDetail' as any, { missionId: mission.mission_id || String(mission.id) });
    },
    [navigation]
  );

  /**
   * 페이지 수 계산
   */
  const totalMissionPages = useMemo(() => {
    return Math.ceil(completedMissions.length / ITEMS_PER_PAGE);
  }, [completedMissions.length]);

  /**
   * 페이지별 미션 데이터 생성
   */
  const missionPages = useMemo(() => {
    const pages: Mission[][] = [];
    for (let i = 0; i < completedMissions.length; i += ITEMS_PER_PAGE) {
      pages.push(completedMissions.slice(i, i + ITEMS_PER_PAGE));
    }
    return pages.length > 0 ? pages : [[]];
  }, [completedMissions]);

  /**
   * 미션 페이지 변경 핸들러
   */
  const onMissionPageChange = useCallback((event: any) => {
    const pageIndex = Math.round(event.nativeEvent.contentOffset.x / (SCREEN_WIDTH - spacing[8]));
    setCurrentMissionPage(pageIndex);
  }, []);

  /**
   * 페이지 이동
   */
  const goToMissionPage = useCallback(
    (pageIndex: number) => {
      if (pageIndex >= 0 && pageIndex < totalMissionPages) {
        missionFlatListRef.current?.scrollToIndex({ index: pageIndex, animated: true });
        setCurrentMissionPage(pageIndex);
      }
    },
    [totalMissionPages]
  );

  return {
    // State
    refreshing,
    validBadges,
    badgesLoading,
    completedMissions,
    missionsLoading,
    currentMissionPage,
    missionFlatListRef,
    // Computed
    totalMissionPages,
    missionPages,
    // Handlers
    onRefresh,
    handleBadgePress,
    handleMissionPress,
    onMissionPageChange,
    goToMissionPage,
  };
};
