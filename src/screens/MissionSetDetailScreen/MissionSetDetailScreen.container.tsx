/**
 * MissionSetDetailScreen 비즈니스 로직
 * 미션세트 상세 화면: 미션세트 조회, 좋아요
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import {
  getPublicTodoListDetail,
  MissionSetDetail,
  likeTodoList,
  unlikeTodoList,
} from '../../api/todolistApi';
import { PublicTodoListDetail } from '../../types/todolist';
import { logError } from '../../utils/logger';
import { useUser } from '../../contexts/UserContext';

interface MissionSetDetailScreenContainerProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'MissionSetDetail'>;
}

export const useMissionSetDetailScreenContainer = ({ navigation, route }: MissionSetDetailScreenContainerProps) => {
  const { missionSetId } = route.params as { missionSetId: number };
  const { user, currentUserId } = useUser();

  const [missionSet, setMissionSet] = useState<MissionSetDetail | PublicTodoListDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);

  /**
   * 미션세트 상세 로딩
   * 공개 투두리스트는 getPublicTodoListDetail 사용
   */
  const loadMissionSetDetail = useCallback(async () => {
    try {
      const result = await getPublicTodoListDetail(missionSetId);
      if (result.success && result.data) {
        const publicDetail = result.data;
        const converted: MissionSetDetail = {
          id: publicDetail.id,
          title: publicDetail.title,
          description: publicDetail.description || undefined,
          creatorId: publicDetail.creatorId,
          creatorNickname: publicDetail.creatorNickname,
          isPublic: true,
          missionCount: publicDetail.missionCount || (publicDetail.missions?.length || 0),
          likeCount: publicDetail.likeCount ?? 0,
          isLiked: publicDetail.isLiked ?? false,
          missions: (publicDetail.missions || []).map((mission, index) => ({
            missionId: mission.missionId,
            missionTitle: mission.title,
            displayOrder: mission.displayOrder !== undefined ? mission.displayOrder : index,
            missionType: mission.missionType ?? 'OFFICIAL',
            isCompletedByCreator: mission.isCompletedByCreator ?? mission.isCompleted,
            verificationPostId: mission.verificationPostId,
          })),
          createdAt: publicDetail.createdAt,
        };
        setMissionSet(converted);
      } else {
        Alert.alert('오류', '미션세트를 불러올 수 없습니다.');
        navigation.goBack();
      }
    } catch (error) {
      logError('미션세트 상세 로딩 실패', error as Error);
      Alert.alert('오류', '미션세트를 불러오는 중 문제가 발생했습니다.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [missionSetId, navigation]);

  useEffect(() => {
    loadMissionSetDetail();
  }, [loadMissionSetDetail]);

  /**
   * 좋아요 토글: 이미 좋아요면 취소, 아니면 추가 후 상세 다시 로드
   */
  const handleLike = useCallback(async () => {
    if (!missionSet || liking) return;
    setLiking(true);
    try {
      const result = await likeTodoList(missionSetId);
      if (result.success) {
        await loadMissionSetDetail();
      } else {
        Alert.alert('오류', result.error || '좋아요에 실패했습니다.');
      }
    } catch (error) {
      logError('좋아요 실패', error as Error);
      Alert.alert('오류', '좋아요 중 문제가 발생했습니다.');
    } finally {
      setLiking(false);
    }
  }, [missionSet, missionSetId, liking, loadMissionSetDetail]);

  const handleUnlike = useCallback(async () => {
    if (!missionSet || liking) return;
    setLiking(true);
    try {
      const result = await unlikeTodoList(missionSetId);
      if (result.success) {
        await loadMissionSetDetail();
      } else {
        Alert.alert('오류', result.error || '좋아요 취소에 실패했습니다.');
      }
    } catch (error) {
      logError('좋아요 취소 실패', error as Error);
      Alert.alert('오류', '좋아요 취소 중 문제가 발생했습니다.');
    } finally {
      setLiking(false);
    }
  }, [missionSet, missionSetId, liking, loadMissionSetDetail]);

  const isOwner = useMemo(() => {
    return missionSet && user && currentUserId && missionSet.creatorId === currentUserId;
  }, [missionSet, user, currentUserId]);

  return {
    missionSet,
    loading,
    liking,
    isOwner,
    handleLike,
    handleUnlike,
  };
};
