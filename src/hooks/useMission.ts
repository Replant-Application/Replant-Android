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
import { uploadMissionVerifyPhoto } from '../api/fileApi';

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
    id: systemMission.id,
    mission_id: systemMission.id.toString(),
    title: systemMission.title,
    description: systemMission.description,
    emoji: getMissionEmoji(systemMission.title),
    experience: systemMission.expReward || 10,
    category_id: 'growth',
    type: missionType,
    difficulty: 'medium' as const,
    completed: false,
    created_at: new Date().toISOString(),
    is_custom: false,
    verification_type: systemMission.verificationType || 'COMMUNITY',
  };
};

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

      // 단일 카테고리로 normalize
      const normalizedMissions: Mission[] = missionsData.map(m => ({
        ...m,
        category_id: 'growth'
      }));

      // category_id가 변경된 경우에만 저장 (JSON.stringify 비교 최적화)
      const needsUpdate = missionsData.some(mission => mission.category_id !== 'growth');
      if (needsUpdate) {
        await setData(storageKeys.MISSIONS, normalizedMissions);
      }

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

  // 미션에 사진 저장 (S3 업로드 후 URL 저장)
  const saveMissionPhoto = useCallback(async (
    missionId: string,
    photoUri: string
  ): Promise<ServiceResult<void>> => {
    if (!currentNickname) {
      return { success: false, error: '사용자 정보가 없습니다.' };
    }

    try {
      // 1. S3에 사진 업로드
      const fileName = `mission_${missionId}_${Date.now()}.jpg`;
      const uploadResult = await uploadMissionVerifyPhoto({
        uri: photoUri,
        type: 'image/jpeg',
        name: fileName,
      });

      if (!uploadResult.success || !uploadResult.data) {
        logError('S3 업로드 실패', new Error(uploadResult.error || 'Unknown error'), { missionId, photoUri });
        return { success: false, error: uploadResult.error || 'S3 업로드에 실패했습니다.' };
      }

      const s3PhotoUrl = uploadResult.data.fileUrl;

      // 2. 로컬 스토리지에 S3 URL 저장
      const storageKeys = getStorageKeys(currentNickname);
      // 스토리지에서 직접 미션 찾기 (로컬 스토리지만 사용)
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

      // 사진만 저장 (완료 상태는 변경하지 않음)
      const updatedMission: Mission = {
        ...mission,
        photo_url: s3PhotoUrl,
        updated_at: new Date().toISOString()
      };

      const updatedMissions = missionsData.map(m =>
        m.mission_id === missionId ? updatedMission : m
      );
      await setData(storageKeys.MISSIONS, updatedMissions);

      // 로컬 상태 업데이트
      setMissions(prev =>
        prev.map(m =>
          m.mission_id === missionId
            ? updatedMission
            : m
        )
      );

      return { success: true };
    } catch (err) {
      logError('사진 저장 실패', err as Error, { missionId, photoUri });
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
        // 로컬 상태 업데이트
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

      // 미션 완료 상태 업데이트
      // 인증은 아직 안 된 상태이므로 verified는 false로 명시적 설정
      const updatedMission: Mission = {
        ...mission,
        completed: true,
        completed_at: new Date().toISOString(),
        photo_url: photoUrl || undefined,
        verified: false, // 미션 완료 시점에는 아직 인증 안 됨
        verification_method: undefined, // 인증 방법도 아직 선택 안 됨
      };

      const storageKeys = getStorageKeys(currentNickname);
      // mission_id로 찾아서 업데이트 (더 안전함)
      const missionsData: Mission[] = await getData(storageKeys.MISSIONS) || [];
      const updatedMissions = missionsData.map(m =>
        m.mission_id === missionId ? updatedMission : m
      );
      await setData(storageKeys.MISSIONS, updatedMissions);

      // 로컬 상태 업데이트
      setMissions(prev =>
        prev.map(m =>
          m.mission_id === missionId
            ? updatedMission
            : m
        )
      );

      // 경험치 추가 (캐릭터 시스템과 연동)
      // COMMUNITY 인증 타입은 좋아요를 받은 후에 XP 지급
      const verificationType = mission.verification_type || 'COMMUNITY';
      let experienceResult: ExperienceResult | null = null;

      if (verificationType !== 'COMMUNITY') {
        // COMMUNITY 타입이 아닌 경우에만 즉시 XP 지급
        if (addExperienceByCategory && mission.category_id) {
          experienceResult = await addExperienceByCategory(mission.category_id, mission.experience);
        }
      }

      return {
        success: true,
        experienceGained: experienceResult?.experienceGained || (verificationType === 'COMMUNITY' ? 0 : mission.experience),
        levelUp: experienceResult?.levelUp || false,
        newLevel: experienceResult?.newLevel,
        unlocked: false, // 나중에 캐릭터 해제 로직 추가
        pendingVerification: verificationType === 'COMMUNITY'
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

  // 커스텀 미션 생성
  const createCustomMission = useCallback(async (missionData: MissionData): Promise<ServiceResult> => {
    if (!currentNickname) {
      return { success: false, error: '사용자 정보가 없습니다.' };
    }

    try {
      const result = await createCustomMissionService(missionData, currentNickname);

      if (result.success && result.data) {
        // 로컬 상태에 새 미션 추가
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
        // 로컬 상태 업데이트
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
        // 로컬 상태에서 미션 제거
        setMissions(prev => prev.filter(m => m.mission_id !== missionId));
      }

      return result;
    } catch (deleteError) {
      logError('커스텀 미션 삭제 실패', deleteError as Error, { missionId, currentNickname });
      return { success: false, error: (deleteError as Error).message };
    }
  }, [currentNickname]);

  // 메모이제이션된 반환 객체
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
