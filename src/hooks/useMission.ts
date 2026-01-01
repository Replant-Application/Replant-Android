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
import { getData, setData, updateData, getStorageKeys } from '../services';
import { createCustomMission as createCustomMissionService, updateCustomMission as updateCustomMissionService, deleteCustomMission as deleteCustomMissionService, deleteMissionPhoto as deleteMissionPhotoService } from '../services/missionService';
import { useUser } from '../contexts/UserContext';
import { logError } from '../utils/logger';
import { sortMissionsByTitle, removeDuplicateMissions } from '../utils/missionUtils';
import { Mission, MissionData, UseMissionReturn, MissionCompletionResult, ServiceResult, ExperienceResult, MissionCategory } from '../types';
import { getSystemMissions, SystemMission, MissionType } from '../api/missionApi';

/**
 * 백엔드 시스템 미션을 로컬 미션 형식으로 변환
 */
const transformSystemMission = (systemMission: SystemMission, missionType: MissionType): Mission => {
  const getMissionEmoji = (title: string): string => {
    if (title.includes('운동') || title.includes('헬스') || title.includes('걷기')) return '🏃';
    if (title.includes('독서') || title.includes('책')) return '📚';
    if (title.includes('물') || title.includes('마시')) return '💧';
    if (title.includes('명상') || title.includes('휴식')) return '🧘';
    if (title.includes('아침') || title.includes('기상')) return '🌅';
    if (title.includes('영어') || title.includes('단어') || title.includes('외국어')) return '📝';
    if (title.includes('잠') || title.includes('수면')) return '😴';
    if (title.includes('식사') || title.includes('밥')) return '🍽️';
    if (title.includes('저축') || title.includes('돈')) return '💰';
    if (title.includes('공부')) return '📖';
    return '🎯';
  };

  return {
    id: systemMission.id.toString(),
    mission_id: systemMission.id.toString(),
    title: systemMission.title,
    description: systemMission.description,
    emoji: getMissionEmoji(systemMission.title),
    experience: systemMission.expReward || 10,
    category_id: 'growth',
    type: missionType,
    completed: false,
    created_at: new Date().toISOString(),
    is_custom: false,
    verification_type: systemMission.verificationType,
  };
};

export const useMission = (
  addExperienceByCategory?: (categoryId: MissionCategory, experience: number) => Promise<ExperienceResult>
): UseMissionReturn => {
  const { currentNickname } = useUser();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 미션 데이터 로드 - 백엔드 API에서 불러옴
  const loadMissions = useCallback(async (): Promise<void> => {
    if (!currentNickname) return;

    try {
      setLoading(true);
      setError(null);

      const storageKeys = getStorageKeys(currentNickname);

      // 로컬 스토리지에서 기존 미션 상태 가져오기 (완료 상태 보존용)
      const localMissions: Mission[] = await getData(storageKeys.MISSIONS) || [];
      const localMissionMap = new Map<string, Mission>();
      localMissions.forEach(m => localMissionMap.set(m.mission_id, m));

      // 백엔드 API에서 DAILY, WEEKLY, MONTHLY 미션 불러오기
      const missionTypes: MissionType[] = ['DAILY', 'WEEKLY', 'MONTHLY'];
      const allMissions: Mission[] = [];

      for (const missionType of missionTypes) {
        try {
          const result = await getSystemMissions({ type: missionType, size: 50 });

          if (result.success && result.data && result.data.content) {
            const transformedMissions = result.data.content.map(systemMission => {
              const transformed = transformSystemMission(systemMission, missionType);

              // 로컬에 저장된 완료 상태 병합
              const localMission = localMissionMap.get(transformed.mission_id);
              if (localMission) {
                return {
                  ...transformed,
                  completed: localMission.completed,
                  completed_at: localMission.completed_at,
                  photo_url: localMission.photo_url,
                  verified: localMission.verified,
                  verification_method: localMission.verification_method,
                };
              }
              return transformed;
            });

            allMissions.push(...transformedMissions);
          }
        } catch (apiError) {
          logError(`${missionType} 미션 API 호출 실패`, apiError as Error, { missionType });
        }
      }

      // API에서 미션을 불러오지 못한 경우 로컬 데이터 사용
      let finalMissions: Mission[];
      if (allMissions.length > 0) {
        // 커스텀 미션 유지 (is_custom이 true인 것들)
        const customMissions = localMissions.filter(m => m.is_custom === true);
        finalMissions = [...allMissions, ...customMissions];

        // 새로운 미션 목록을 로컬 스토리지에 저장
        await setData(storageKeys.MISSIONS, finalMissions);
      } else {
        // API 실패 시 로컬 데이터 사용
        finalMissions = localMissions;
      }

      // 단일 카테고리로 normalize
      const normalizedMissions: Mission[] = finalMissions.map(m => ({
        ...m,
        category_id: 'growth'
      }));

      // 중복 제거 및 정렬
      const uniqueMissions = removeDuplicateMissions(normalizedMissions);
      const sortedMissions = sortMissionsByTitle(uniqueMissions);

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

  // 미션에 사진만 저장 (완료하지 않음)
  const saveMissionPhoto = useCallback(async (
    missionId: string,
    photoUrl: string
  ): Promise<ServiceResult<void>> => {
    if (!currentNickname) {
      return { success: false, error: '사용자 정보가 없습니다.' };
    }

    try {
      const storageKeys = getStorageKeys(currentNickname);
      const missionsData: Mission[] = await getData(storageKeys.MISSIONS) || [];
      const mission: Mission | undefined = missionsData.find(m => m.mission_id === missionId);

      if (!mission) {
        logError('미션을 찾을 수 없음', new Error('Mission not found'), {
          missionId,
          availableMissionIds: missionsData.map(m => m.mission_id),
          totalMissions: missionsData.length
        });
        return { success: false, error: '미션을 찾을 수 없습니다.' };
      }

      const updatedMission: Mission = {
        ...mission,
        photo_url: photoUrl,
        updated_at: new Date().toISOString()
      };

      const updatedMissions = missionsData.map(m =>
        m.mission_id === missionId ? updatedMission : m
      );
      await setData(storageKeys.MISSIONS, updatedMissions);

      setMissions(prev =>
        prev.map(m =>
          m.mission_id === missionId
            ? updatedMission
            : m
        )
      );

      return { success: true };
    } catch (err) {
      logError('사진 저장 실패', err as Error, { missionId, photoUrl });
      return { success: false, error: (err as Error).message };
    }
  }, [currentNickname]);

  // 미션 사진 삭제
  const deleteMissionPhoto = useCallback(async (
    missionId: string
  ): Promise<ServiceResult<void>> => {
    if (!currentNickname) {
      return { success: false, error: '사용자 정보가 없습니다.' };
    }

    try {
      const result = await deleteMissionPhotoService(missionId, currentNickname);

      if (result.success) {
        setMissions(prev =>
          prev.map(m =>
            m.mission_id === missionId
              ? { ...m, photo_url: undefined, updated_at: new Date().toISOString() }
              : m
          )
        );
      }

      return result;
    } catch (err) {
      logError('미션 사진 삭제 실패', err as Error, { missionId, currentNickname });
      return { success: false, error: (err as Error).message };
    }
  }, [currentNickname]);

  // 미션 완료 (사진 포함)
  const completeMissionWithPhoto = useCallback(async (
    missionId: string,
    photoUrl: string | null
  ): Promise<MissionCompletionResult> => {
    if (!currentNickname) {
      return { success: false, experienceGained: 0, levelUp: false, error: '사용자 정보가 없습니다.' };
    }

    try {
      const mission: Mission | undefined = missions.find(m => m.mission_id === missionId);
      if (!mission) {
        throw new Error('미션을 찾을 수 없습니다.');
      }

      const updatedMission: Mission = {
        ...mission,
        completed: true,
        completed_at: new Date().toISOString(),
        photo_url: photoUrl || undefined,
        verified: false,
        verification_method: undefined,
      };

      const storageKeys = getStorageKeys(currentNickname);
      const missionsData: Mission[] = await getData(storageKeys.MISSIONS) || [];
      const updatedMissions = missionsData.map(m =>
        m.mission_id === missionId ? updatedMission : m
      );
      await setData(storageKeys.MISSIONS, updatedMissions);

      setMissions(prev =>
        prev.map(m =>
          m.mission_id === missionId
            ? updatedMission
            : m
        )
      );

      let experienceResult: ExperienceResult | null = null;
      if (addExperienceByCategory && mission.category_id) {
        experienceResult = await addExperienceByCategory(mission.category_id, mission.experience);
      }

      return {
        success: true,
        experienceGained: experienceResult?.experienceGained || mission.experience,
        levelUp: experienceResult?.levelUp || false,
        newLevel: experienceResult?.newLevel,
        unlocked: false
      };
    } catch (completeError) {
      logError('미션 완료 실패', completeError as Error, { missionId, photoUrl });
      return { success: false, experienceGained: 0, levelUp: false, error: (completeError as Error).message };
    }
  }, [missions, addExperienceByCategory, currentNickname]);

  // 미션 완료 취소
  const uncompleteMission = useCallback(async (missionId: string): Promise<ServiceResult<void>> => {
    if (!currentNickname) {
      return { success: false, error: '사용자 정보가 없습니다.' };
    }

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

      const storageKeys = getStorageKeys(currentNickname);
      await updateData(storageKeys.MISSIONS, mission.id, updatedMission);

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

  // 커스텀 미션 생성
  const createCustomMission = useCallback(async (missionData: MissionData): Promise<ServiceResult> => {
    if (!currentNickname) {
      return { success: false, error: '사용자 정보가 없습니다.' };
    }

    try {
      const result = await createCustomMissionService(missionData, currentNickname);

      if (result.success && result.data) {
        setMissions(prev => [...prev, result.data!]);
      }

      return result;
    } catch (createError) {
      logError('커스텀 미션 생성 실패', createError as Error, { missionData, currentNickname });
      return { success: false, error: (createError as Error).message };
    }
  }, [currentNickname]);

  // 커스텀 미션 업데이트
  const updateCustomMission = useCallback(async (missionId: string, missionData: MissionData): Promise<ServiceResult> => {
    if (!currentNickname) {
      return { success: false, error: '사용자 정보가 없습니다.' };
    }

    try {
      const result = await updateCustomMissionService(missionId, missionData, currentNickname);

      if (result.success && result.data) {
        setMissions(prev =>
          prev.map(m =>
            m.mission_id === missionId
              ? result.data!
              : m
          )
        );
      }

      return result;
    } catch (updateError) {
      logError('커스텀 미션 업데이트 실패', updateError as Error, { missionId, missionData, currentNickname });
      return { success: false, error: (updateError as Error).message };
    }
  }, [currentNickname]);

  // 커스텀 미션 삭제
  const deleteCustomMission = useCallback(async (missionId: string): Promise<ServiceResult> => {
    if (!currentNickname) {
      return { success: false, error: '사용자 정보가 없습니다.' };
    }

    try {
      const result = await deleteCustomMissionService(missionId, currentNickname);

      if (result.success) {
        setMissions(prev => prev.filter(m => m.mission_id !== missionId));
      }

      return result;
    } catch (deleteError) {
      logError('커스텀 미션 삭제 실패', deleteError as Error, { missionId, currentNickname });
      return { success: false, error: (deleteError as Error).message };
    }
  }, [currentNickname]);

  return useMemo(() => ({
    missions,
    loading,
    error,
    loadMissions,
    saveMissionPhoto,
    deleteMissionPhoto,
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
    saveMissionPhoto,
    deleteMissionPhoto,
    completeMissionWithPhoto,
    uncompleteMission,
    createCustomMission,
    updateCustomMission,
    deleteCustomMission,
  ]);
};
