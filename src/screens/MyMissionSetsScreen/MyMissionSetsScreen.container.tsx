/**
 * MyMissionSetsScreen 비즈니스 로직
 * 내 미션세트 목록 로드, 삭제 처리
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { getMyMissionSets, deleteMissionSet, MissionSetSimple } from '../../api/todolistApi';
import { logError } from '../../utils/logger';
import { SCREEN_NAMES } from '../../utils/constants';

interface MyMissionSetsScreenContainerProps {
  navigation: any;
}

export const useMyMissionSetsScreenContainer = ({
  navigation,
}: MyMissionSetsScreenContainerProps) => {
  const [missionSets, setMissionSets] = useState<MissionSetSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * 내 미션세트 목록 로딩
   * - getMyMissionSets API 호출
   */
  const loadMyMissionSets = useCallback(async () => {
    try {
      const result = await getMyMissionSets({ page: 0, size: 100 });
      if (result.success && result.data) {
        setMissionSets(result.data.content);
      }
    } catch (error) {
      logError('내 미션세트 로딩 실패', error as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMyMissionSets();
  }, [loadMyMissionSets]);

  /**
   * Pull-to-Refresh
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMyMissionSets();
    setRefreshing(false);
  }, [loadMyMissionSets]);

  /**
   * 미션세트 삭제
   * - 확인 Alert 표시
   * - deleteMissionSet API 호출
   * - 성공/실패 Alert 표시
   * - 목록에서 제거
   */
  const handleDelete = useCallback((missionSet: MissionSetSimple) => {
    Alert.alert(
      '삭제 확인',
      `"${missionSet.title}" 투두리스트를 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteMissionSet(missionSet.id);
              if (result.success) {
                setMissionSets(prev => prev.filter(ms => ms.id !== missionSet.id));
                Alert.alert('완료', '투두리스트가 삭제되었습니다.');
              } else {
                Alert.alert('오류', result.error || '삭제에 실패했습니다.');
              }
            } catch (error) {
              logError('미션세트 삭제 실패', error as Error);
              Alert.alert('오류', '삭제 중 문제가 발생했습니다.');
            }
          },
        },
      ]
    );
  }, []);

  /**
   * 미션세트 상세 보기
   */
  const handleDetail = useCallback((missionSet: MissionSetSimple) => {
    navigation.navigate(SCREEN_NAMES.MISSION_SET_DETAIL as any, {
      missionSetId: missionSet.id,
    });
  }, [navigation]);

  /**
   * 미션세트 생성 화면으로 이동
   */
  const handleCreate = useCallback(() => {
    navigation.navigate(SCREEN_NAMES.MISSION_SET_CREATE as any);
  }, [navigation]);

  /**
   * 별점 렌더링
   */
  const renderStars = useCallback((rating: number) => {
    const fullStars = Math.floor(rating);
    const stars = [];

    for (let i = 0; i < 5; i++) {
      stars.push(i < fullStars ? '★' : '☆');
    }

    return stars.join('');
  }, []);

  return {
    missionSets,
    loading,
    refreshing,
    onRefresh,
    handleDelete,
    handleDetail,
    handleCreate,
    renderStars,
  };
};
