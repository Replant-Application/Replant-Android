/**
 * MissionSetCreateScreen 비즈니스 로직
 * 미션세트 생성 화면: 미션 선택, 미션세트 생성
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { createMissionSet } from '../../api/todolistApi';
import { getUserMissions, UserMission } from '../../api/missionApi';
import { logError } from '../../utils/logger';

interface MissionSetCreateScreenContainerProps {
  navigation: NavigationProp<RootStackParamList>;
}

export const useMissionSetCreateScreenContainer = ({ navigation }: MissionSetCreateScreenContainerProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [selectedMissionIds, setSelectedMissionIds] = useState<number[]>([]);
  const [myMissions, setMyMissions] = useState<UserMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /**
   * 내 미션 목록 로딩
   */
  const loadMyMissions = useCallback(async () => {
    try {
      const result = await getUserMissions({ page: 0, size: 100 });
      if (result.success && result.data) {
        setMyMissions(result.data.content);
      }
    } catch (error) {
      logError('내 미션 로딩 실패', error as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 초기 데이터 로드
   */
  useEffect(() => {
    loadMyMissions();
  }, [loadMyMissions]);

  /**
   * 미션 선택/해제
   */
  const toggleMission = useCallback((missionId: number) => {
    setSelectedMissionIds(prev => {
      if (prev.includes(missionId)) {
        return prev.filter(id => id !== missionId);
      } else {
        return [...prev, missionId];
      }
    });
  }, []);

  /**
   * 미션세트 생성
   */
  const handleCreate = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }

    if (selectedMissionIds.length === 0) {
      Alert.alert('알림', '최소 1개 이상의 미션을 선택해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await createMissionSet({
        title: title.trim(),
        description: description.trim() || undefined,
        isPublic,
        missionIds: selectedMissionIds,
      });

      if (result.success) {
        Alert.alert('완료', '미션세트가 생성되었습니다.', [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('오류', result.error || '미션세트 생성에 실패했습니다.');
      }
    } catch (error) {
      logError('미션세트 생성 실패', error as Error);
      Alert.alert('오류', '미션세트 생성 중 문제가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  }, [title, description, isPublic, selectedMissionIds, navigation]);

  /**
   * 미션 제목 가져오기
   */
  const getMissionTitle = useCallback((userMission: UserMission): string => {
    const mission = userMission.mission || userMission.customMission;
    return mission?.title || '제목 없음';
  }, []);

  /**
   * 미션 ID 가져오기
   */
  const getMissionId = useCallback((userMission: UserMission): number => {
    const mission = userMission.mission || userMission.customMission;
    return mission?.id || 0;
  }, []);

  return {
    // Data
    myMissions,
    // State
    title,
    description,
    isPublic,
    selectedMissionIds,
    loading,
    submitting,
    // Setters
    setTitle,
    setDescription,
    setIsPublic,
    // Handlers
    toggleMission,
    handleCreate,
    // Utils
    getMissionTitle,
    getMissionId,
  };
};
