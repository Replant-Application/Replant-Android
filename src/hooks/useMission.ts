/**
 * 미션 관리 Hook
 * 미션 데이터 로드, 미션 완료/취소 등의 기능을 제공
 *
 * @param {Function} addExperienceByCategory - 카테고리별 경험치 추가 함수
 * @returns {Object} 미션 관련 상태와 함수들
 * @returns {Array} missions - 미션 목록
 * @returns {boolean} loading - 로딩 상태
 * @returns {string|null} error - 에러 메시지
 * @returns {Function} loadMissions - 미션 데이터 로드
 * @returns {Function} completeMissionWithPhoto - 미션 완료 (사진 포함)
 * @returns {Function} uncompleteMission - 미션 완료 취소
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getData, updateData, getStorageKeys } from '../services';
import { useUser } from '../contexts/UserContext';
import { logError } from '../utils/logger';
import { Mission, MissionData, UseMissionReturn, MissionCompletionResult, ServiceResult, ExperienceResult, MissionCategory } from '../types';

export const useMission = (
  addExperienceByCategory?: (categoryId: MissionCategory, experience: number) => Promise<ExperienceResult>
): UseMissionReturn => {
  const { currentNickname } = useUser();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 미션 데이터 로드
  const loadMissions = useCallback(async (): Promise<void> => {
    if (!currentNickname) return;

    try {
      setLoading(true);
      setError(null);

      const storageKeys = getStorageKeys(currentNickname);
      const missionsData: Mission[] = await getData(storageKeys.MISSIONS) || [];

      // 중복 제거 (mission_id 기준)
      const uniqueMissions: Mission[] = missionsData.filter((mission, index, self) =>
        index === self.findIndex(m => m.mission_id === mission.mission_id)
      );

      const sortedMissions: Mission[] = uniqueMissions.sort((a, b) =>
        a.title.localeCompare(b.title)
      );

      setMissions(sortedMissions);
    } catch (loadError) {
      logError('미션 로드 실패', loadError as Error, { currentNickname });
      setError((loadError as Error).message);
    } finally {
      setLoading(false);
    }
  }, [currentNickname]);

  // 초기 로드
  useEffect(() => {
    loadMissions();
  }, [loadMissions]);

  // 미션 완료 (사진 포함)
  const completeMissionWithPhoto = useCallback(async (
    missionId: string,
    photoUrl: string | null
  ): Promise<MissionCompletionResult> => {
    try {
      const mission: Mission | undefined = missions.find(m => m.mission_id === missionId);
      if (!mission) {
        throw new Error('미션을 찾을 수 없습니다.');
      }

      // 미션 완료 상태 업데이트
      const updatedMission: Mission = {
        ...mission,
        completed: true,
        completed_at: new Date().toISOString(),
        photo_url: photoUrl || undefined
      };

      const storageKeys = getStorageKeys(currentNickname!);
      await updateData(storageKeys.MISSIONS, mission.id, updatedMission);

      // 로컬 상태 업데이트
      setMissions(prev =>
        prev.map(m =>
          m.mission_id === missionId
            ? updatedMission
            : m
        )
      );

      // 경험치 추가 (캐릭터 시스템과 연동)
      let experienceResult: ExperienceResult | null = null;
      if (addExperienceByCategory && mission.category_id) {
        experienceResult = await addExperienceByCategory(mission.category_id, mission.experience);
      }

      return {
        success: true,
        experienceGained: experienceResult?.experienceGained || mission.experience,
        levelUp: experienceResult?.levelUp || false,
        newLevel: experienceResult?.newLevel,
        unlocked: false // 나중에 캐릭터 해제 로직 추가
      };
    } catch (completeError) {
      logError('미션 완료 실패', completeError as Error, { missionId, photoUrl });
      return { success: false, experienceGained: 0, levelUp: false, error: (completeError as Error).message };
    }
  }, [missions, addExperienceByCategory, currentNickname]);

  // 미션 완료 취소
  const uncompleteMission = useCallback(async (missionId: string): Promise<ServiceResult<void>> => {
    try {
      const mission: Mission | undefined = missions.find(m => m.mission_id === missionId);
      if (!mission) {
        throw new Error('미션을 찾을 수 없습니다.');
      }

      const updatedMission: Mission = {
        ...mission,
        completed: false,
        completed_at: undefined,
        photo_url: undefined
      };

      const storageKeys = getStorageKeys(currentNickname!);
      await updateData(storageKeys.MISSIONS, mission.id, updatedMission);

      // 로컬 상태 업데이트
      setMissions(prev =>
        prev.map(m =>
          m.mission_id === missionId
            ? updatedMission
            : m
        )
      );

      return { success: true };
    } catch (uncompleteError) {
      logError('미션 완료 취소 실패', uncompleteError as Error, { missionId });
      return { success: false, error: (uncompleteError as Error).message };
    }
  }, [missions, currentNickname]);

  // 커스텀 미션 생성 (placeholder)
  const createCustomMission = useCallback(async (_missionData: MissionData): Promise<ServiceResult> => {
    return { success: false, error: '커스텀 미션 생성 기능은 아직 구현되지 않았습니다.' };
  }, []);

  // 커스텀 미션 업데이트 (placeholder)
  const updateCustomMission = useCallback(async (_missionId: string, _missionData: MissionData): Promise<ServiceResult> => {
    return { success: false, error: '커스텀 미션 업데이트 기능은 아직 구현되지 않았습니다.' };
  }, []);

  // 커스텀 미션 삭제 (placeholder)
  const deleteCustomMission = useCallback(async (_missionId: string): Promise<ServiceResult> => {
    return { success: false, error: '커스텀 미션 삭제 기능은 아직 구현되지 않았습니다.' };
  }, []);

  // 메모이제이션된 반환 객체
  return useMemo(() => ({
    missions,
    loading,
    error,
    loadMissions,
    completeMissionWithPhoto,
    uncompleteMission,
    createCustomMission,
    updateCustomMission,
    deleteCustomMission,
  }), [
    missions,
    loading,
    error,
    loadMissions,
    completeMissionWithPhoto,
    uncompleteMission,
    createCustomMission,
    updateCustomMission,
    deleteCustomMission,
  ]);
};
