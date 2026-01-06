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
import { deleteMissionPhoto as deleteMissionPhotoService } from '../services/missionService';
import { useUser } from '../contexts/UserContext';
import { logError } from '../utils/logger';
import { sortMissionsByTitle, removeDuplicateMissions } from '../utils/missionUtils';
import { Mission, MissionData, UseMissionReturn, MissionCompletionResult, ServiceResult, ExperienceResult, MissionCategory } from '../types';
import {
  getSystemMissions,
  getUserMissions,
  getCustomMissions,
  createCustomMission as createCustomMissionApi,
  updateCustomMission as updateCustomMissionApi,
  deleteCustomMission as deleteCustomMissionApi,
  SystemMission,
  CustomMission,
  UserMission,
  MissionType,
  CreateCustomMissionRequest,
} from '../api/missionApi';
import { uploadMissionVerifyPhoto } from '../api/fileApi';

/**
 * 미션 제목으로 이모지 반환
 */
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

/**
 * 백엔드 시스템 미션을 로컬 미션 형식으로 변환
 */
const transformSystemMission = (systemMission: SystemMission, missionType: MissionType): Mission => {
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

/**
 * 백엔드 커스텀 미션을 로컬 미션 형식으로 변환
 */
const transformCustomMission = (customMission: CustomMission): Mission => {
  return {
    id: customMission.id,
    mission_id: `custom_${customMission.id}`,
    title: customMission.title,
    description: customMission.description,
    emoji: getMissionEmoji(customMission.title),
    experience: customMission.expReward || 10,
    category_id: 'growth',
    type: 'DAILY' as MissionType, // 커스텀 미션은 기본 DAILY
    difficulty: 'medium' as const,
    completed: false,
    created_at: customMission.createdAt,
    is_custom: true,
    verification_type: customMission.verificationType || 'COMMUNITY',
  };
};

/**
 * 백엔드 UserMission을 로컬 미션 형식으로 변환
 */
const transformUserMission = (userMission: UserMission): Mission => {
  const mission = userMission.mission || userMission.customMission;
  if (!mission) {
    throw new Error('UserMission has no mission data');
  }

  const isCustom = userMission.missionType === 'CUSTOM';
  const missionType = userMission.mission?.type || 'DAILY';

  return {
    id: userMission.id,
    mission_id: isCustom ? `custom_${mission.id}` : mission.id.toString(),
    user_mission_id: userMission.id, // 백엔드 UserMission ID 저장
    title: mission.title,
    description: mission.description,
    emoji: getMissionEmoji(mission.title),
    experience: mission.expReward || 10,
    category_id: 'growth',
    type: missionType as MissionType,
    difficulty: 'medium' as const,
    completed: userMission.status === 'COMPLETED',
    completed_at: userMission.status === 'COMPLETED' ? userMission.verification?.verifiedAt : undefined,
    created_at: userMission.assignedAt,
    due_date: userMission.dueDate,
    is_custom: isCustom,
    verification_type: mission.verificationType || 'COMMUNITY',
    verified: userMission.status === 'COMPLETED',
  };
};

export const useMission = (
  addExperienceByCategory?: (categoryId: MissionCategory, experience: number) => Promise<ExperienceResult>
): UseMissionReturn => {
  const { currentNickname } = useUser();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 미션 데이터 로드 (백엔드 API 사용)
  const loadMissions = useCallback(async (): Promise<void> => {
    if (!currentNickname) return;

    try {
      setLoading(true);
      setError(null);

      const allMissions: Mission[] = [];

      // 1. 시스템 미션 불러오기 (DAILY, WEEKLY, MONTHLY)
      const [dailyResult, weeklyResult, monthlyResult] = await Promise.all([
        getSystemMissions({ type: 'DAILY', size: 50 }),
        getSystemMissions({ type: 'WEEKLY', size: 50 }),
        getSystemMissions({ type: 'MONTHLY', size: 50 }),
      ]);

      if (dailyResult.success && dailyResult.data) {
        allMissions.push(...dailyResult.data.content.map(m => transformSystemMission(m, 'DAILY')));
      }
      if (weeklyResult.success && weeklyResult.data) {
        allMissions.push(...weeklyResult.data.content.map(m => transformSystemMission(m, 'WEEKLY')));
      }
      if (monthlyResult.success && monthlyResult.data) {
        allMissions.push(...monthlyResult.data.content.map(m => transformSystemMission(m, 'MONTHLY')));
      }

      // 2. 사용자 미션 목록 불러오기 (할당된 미션, 완료된 미션 포함)
      const userMissionsResult = await getUserMissions({ size: 100 });
      if (userMissionsResult.success && userMissionsResult.data) {
        // 사용자 미션 상태를 시스템 미션에 반영
        const userMissionMap = new Map<string, UserMission>();
        userMissionsResult.data.content.forEach(um => {
          const mission = um.mission || um.customMission;
          if (mission) {
            const key = um.missionType === 'CUSTOM' ? `custom_${mission.id}` : mission.id.toString();
            userMissionMap.set(key, um);
          }
        });

        // 시스템 미션에 사용자 상태 반영
        allMissions.forEach(m => {
          const userMission = userMissionMap.get(m.mission_id);
          if (userMission) {
            m.user_mission_id = userMission.id;
            m.completed = userMission.status === 'COMPLETED';
            m.verified = userMission.status === 'COMPLETED';
            m.due_date = userMission.dueDate;
            if (userMission.verification?.verifiedAt) {
              m.completed_at = userMission.verification.verifiedAt;
            }
          }
        });
      }

      // 3. 커스텀 미션 불러오기
      const customMissionsResult = await getCustomMissions({ size: 50 });
      if (customMissionsResult.success && customMissionsResult.data) {
        allMissions.push(...customMissionsResult.data.content.map(transformCustomMission));
      }

      // 중복 제거 및 정렬
      const uniqueMissions = removeDuplicateMissions(allMissions);
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
        photo_url: s3PhotoUrl,
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

  // 커스텀 미션 생성 (백엔드 API 사용)
  const createCustomMission = useCallback(async (missionData: MissionData): Promise<ServiceResult> => {
    if (!currentNickname) {
      return { success: false, error: '사용자 정보가 없습니다.' };
    }

    try {
      // 백엔드 API 형식으로 변환
      const createRequest: CreateCustomMissionRequest = {
        title: missionData.title,
        description: missionData.description || '',
        durationDays: missionData.durationDays || 7,
        isPublic: missionData.isPublic ?? true,
        verificationType: (missionData.verificationType as 'COMMUNITY' | 'GPS' | 'TIME') || 'COMMUNITY',
        expReward: missionData.experience || 10,
        badgeDurationDays: missionData.badgeDurationDays || 7,
      };

      const result = await createCustomMissionApi(createRequest);

      if (result.success && result.data) {
        // 새 미션을 로컬 형식으로 변환하여 추가
        const newMission = transformCustomMission(result.data);
        setMissions(prev => [...prev, newMission]);
        return { success: true, data: newMission };
      }

      return { success: false, error: result.error || '커스텀 미션 생성에 실패했습니다.' };
    } catch (createError) {
      logError('커스텀 미션 생성 실패', createError as Error, { missionData, currentNickname });
      return { success: false, error: (createError as Error).message };
    }
  }, [currentNickname]);

  // 커스텀 미션 업데이트 (백엔드 API 사용)
  const updateCustomMission = useCallback(async (missionId: string, missionData: MissionData): Promise<ServiceResult> => {
    if (!currentNickname) {
      return { success: false, error: '사용자 정보가 없습니다.' };
    }

    try {
      // missionId에서 숫자 ID 추출 (custom_123 형식)
      const numericId = missionId.startsWith('custom_')
        ? parseInt(missionId.replace('custom_', ''), 10)
        : parseInt(missionId, 10);

      const updateData: Partial<CreateCustomMissionRequest> = {
        title: missionData.title,
        description: missionData.description,
        isPublic: missionData.isPublic,
        expReward: missionData.experience,
      };

      const result = await updateCustomMissionApi(numericId, updateData);

      if (result.success && result.data) {
        const updatedMission = transformCustomMission(result.data);
        setMissions(prev =>
          prev.map(m =>
            m.mission_id === missionId ? updatedMission : m
          )
        );
        return { success: true, data: updatedMission };
      }

      return { success: false, error: result.error || '커스텀 미션 수정에 실패했습니다.' };
    } catch (updateError) {
      logError('커스텀 미션 업데이트 실패', updateError as Error, { missionId, missionData, currentNickname });
      return { success: false, error: (updateError as Error).message };
    }
  }, [currentNickname]);

  // 커스텀 미션 삭제 (백엔드 API 사용)
  const deleteCustomMission = useCallback(async (missionId: string): Promise<ServiceResult> => {
    if (!currentNickname) {
      return { success: false, error: '사용자 정보가 없습니다.' };
    }

    try {
      // missionId에서 숫자 ID 추출
      const numericId = missionId.startsWith('custom_')
        ? parseInt(missionId.replace('custom_', ''), 10)
        : parseInt(missionId, 10);

      const result = await deleteCustomMissionApi(numericId);

      if (result.success) {
        setMissions(prev => prev.filter(m => m.mission_id !== missionId));
        return { success: true };
      }

      return { success: false, error: result.error || '커스텀 미션 삭제에 실패했습니다.' };
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
