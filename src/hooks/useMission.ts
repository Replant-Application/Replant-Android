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
import { sortMissionsByTitle } from '../utils/missionUtils';
import { Mission, MissionData, UseMissionReturn, MissionCompletionResult, ServiceResult, ExperienceResult, MissionCategory, MissionStatus } from '../types';
import {
  createCustomMission as createCustomMissionApi,
  updateCustomMission as updateCustomMissionApi,
  deleteCustomMission as deleteCustomMissionApi,
  Mission as ApiMission,
  MissionCategory as ApiMissionCategory,
  CreateMissionRequest,
  UserMission,
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
 * 백엔드 미션을 로컬 미션 형식으로 변환 (공식/커스텀 통합)
 */
const transformApiMission = (apiMission: ApiMission): Mission => {
  const isCustom = apiMission.missionType === 'CUSTOM';

  return {
    id: apiMission.id,
    mission_id: isCustom ? `custom_${apiMission.id}` : apiMission.id.toString(),
    title: apiMission.title,
    description: apiMission.description,
    emoji: getMissionEmoji(apiMission.title),
    experience: isCustom ? 0 : (apiMission.expReward || 10),
    category_id: 'growth',
    category: apiMission.category || 'DAILY_LIFE',
    missionType: apiMission.missionType,
    difficulty: 'medium' as const,
    completed: false,
    created_at: apiMission.createdAt || new Date().toISOString(),
    is_custom: isCustom,
    verification_type: apiMission.verificationType || 'COMMUNITY',
  };
};

/**
 * UserMission을 Mission 타입으로 변환
 * getUserMissions API 응답을 미션 탭에서 사용할 수 있도록 변환
 */
const transformUserMissionToMission = (userMission: UserMission): Mission | null => {
  try {
    // mission 필드 사용 (통합됨)
    // missionType이 OFFICIAL이면 mission, CUSTOM이면 customMission 사용
    const mission = userMission.mission || userMission.customMission;
    if (!mission) {
      console.warn('[transformUserMissionToMission] UserMission에 mission 데이터가 없습니다:', userMission);
      return null;
    }

    const isCustom = userMission.missionType === 'CUSTOM';
    
    // UserMission의 status를 그대로 사용 (ASSIGNED, PENDING, COMPLETED 등)
    const status: MissionStatus = userMission.status;
    
    // completed는 COMPLETED 상태일 때만 true
    const completed = userMission.status === 'COMPLETED';
    
    // verified는 COMPLETED 상태일 때만 true (인증 완료)
    // PENDING 상태는 인증 대기 중이므로 verified = false
    const verified = userMission.status === 'COMPLETED';

    return {
      id: userMission.id,
      mission_id: isCustom ? `custom_${mission.id}` : mission.id.toString(),
      user_mission_id: userMission.id,
      title: mission.title,
      description: mission.description || '',
      emoji: getMissionEmoji(mission.title),
      experience: isCustom ? 0 : (mission.expReward || 10),
      category_id: (mission.category?.toLowerCase() as MissionCategory) || 'growth',
      category: mission.category || 'DAILY_LIFE',
      missionType: userMission.missionType,
      status,
      difficulty: 'medium' as const,
      completed,
      completed_at: userMission.completedAt || (completed ? userMission.verification?.verifiedAt : undefined),
      created_at: userMission.assignedAt,
      due_date: userMission.dueDate,
      is_custom: isCustom,
      verification_type: mission.verificationType || 'COMMUNITY',
      verified,
    };
  } catch (e) {
    console.error('[transformUserMissionToMission] 변환 실패:', e);
    return null;
  }
};

export const useMission = (
  addExperienceByCategory?: (categoryId: MissionCategory, experience: number) => Promise<ExperienceResult>
): UseMissionReturn => {
  const { currentNickname } = useUser();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 미션 데이터 로드 (모든 상태의 미션 가져오기)
  // 진행중(ASSIGNED), 인증대기(PENDING), 완료(COMPLETED) 상태의 모든 미션 조회
  const loadMissions = useCallback(async (): Promise<void> => {
    if (!currentNickname) return;

    try {
      setLoading(true);
      setError(null);

      const allMissions: Mission[] = [];

      // getUserMissions API로 모든 미션 가져오기
      const { getUserMissions } = await import('../api/missionApi');
      
      // 모든 상태의 미션을 가져오기 위해 페이지네이션 처리
      let page = 0;
      const size = 100; // 한 번에 많이 가져오기
      let hasMore = true;

      while (hasMore) {
        try {
          const result = await getUserMissions({ 
            page, 
            size,
            // status 필터 없이 모든 상태 가져오기
          });

          if (result.success && result.data?.content) {
            const userMissions = result.data.content;
            
            // UserMission을 Mission으로 변환
            for (const userMission of userMissions) {
              try {
                const mission = transformUserMissionToMission(userMission);
                if (mission) {
                  allMissions.push(mission);
                }
              } catch (e) {
                logError('UserMission 변환 실패', e as Error, { userMissionId: userMission.id });
              }
            }

            // 다음 페이지 확인
            hasMore = page < result.data.totalPages - 1;
            page++;
          } else {
            hasMore = false;
            if (result.error) {
              console.error('[useMission] getUserMissions API 오류:', result.error);
            }
          }
        } catch (e) {
          logError('미션 목록 조회 실패', e as Error, { page });
          hasMore = false;
        }
      }

      console.log('[useMission] 로드된 미션:', {
        totalCount: allMissions.length,
        completed: allMissions.filter(m => m.status === 'COMPLETED').length,
        pending: allMissions.filter(m => m.status === 'PENDING').length,
        assigned: allMissions.filter(m => m.status === 'ASSIGNED').length,
        expired: allMissions.filter(m => m.status === 'EXPIRED').length,
        failed: allMissions.filter(m => m.status === 'FAILED').length,
      });

      // 정렬
      const sortedMissions = sortMissionsByTitle(allMissions);

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

  // 미션에 사진 저장 (S3 업로드 후 URL 저장) - 단일 사진 (하위 호환성 유지)
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
        photo_url: s3PhotoUrl, // 하위 호환성 유지
        images: [s3PhotoUrl], // images 배열에도 저장
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

  // 미션에 여러 사진 저장 (S3 업로드된 URL 배열 저장)
  const saveMissionPhotos = useCallback(async (
    missionId: string,
    photoUrls: string[]
  ): Promise<ServiceResult<void>> => {
    if (!currentNickname) {
      return { success: false, error: '사용자 정보가 없습니다.' };
    }

    if (!photoUrls || photoUrls.length === 0) {
      return { success: false, error: '저장할 사진이 없습니다.' };
    }

    try {
      // 로컬 스토리지에 S3 URL 배열 저장
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
        images: photoUrls, // 다중 이미지 배열 저장
        photo_url: photoUrls[0], // 첫 번째 이미지를 photo_url에도 저장 (하위 호환성)
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
      logError('사진 저장 실패', err as Error, { missionId, photoUrls });
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
              ? { ...m, photo_url: undefined, images: undefined, updated_at: new Date().toISOString() }
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

      // 투두리스트 미션인 경우 completeTodoMission API 호출
       
      if (mission.todoListId) {
        const { completeTodoMission } = await import('../api/todolistApi');
        const numericMissionId = parseInt(mission.mission_id.replace(/^custom_/, ''), 10);
        if (isNaN(numericMissionId)) {
          throw new Error('미션 ID가 올바르지 않습니다.');
        }
        
        const result = await completeTodoMission(mission.todoListId, numericMissionId);
        if (!result.success) {
          throw new Error(result.error || '미션 완료에 실패했습니다.');
        }
        
        // 미션 목록 새로고침
        await loadMissions();
        
        // 경험치 추가 (캐릭터 시스템과 연동)
        const verificationType = mission.verification_type || 'COMMUNITY';
        const isCustomMission = mission.missionType === 'CUSTOM' || mission.is_custom === true;
        let experienceResult: ExperienceResult | null = null;

        if (!isCustomMission && verificationType !== 'COMMUNITY') {
          // 공식 미션이고 COMMUNITY 타입이 아닌 경우에만 즉시 XP 지급
          if (addExperienceByCategory && mission.category_id) {
            experienceResult = await addExperienceByCategory(mission.category_id, mission.experience);
          }
        }

        return {
          success: true,
          experienceGained: experienceResult?.experienceGained || (verificationType === 'COMMUNITY' ? 0 : mission.experience),
          levelUp: experienceResult?.levelUp || false,
          newLevel: experienceResult?.newLevel,
          unlocked: false,
          pendingVerification: verificationType === 'COMMUNITY'
        };
      }

      // 기존 로직 (로컬 스토리지 기반 - 하위 호환성 유지)
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
      // 커스텀 미션은 경험치 지급 없음
      const verificationType = mission.verification_type || 'COMMUNITY';
      const isCustomMission = mission.missionType === 'CUSTOM' || mission.is_custom === true;
      let experienceResult: ExperienceResult | null = null;

      if (!isCustomMission && verificationType !== 'COMMUNITY') {
        // 공식 미션이고 COMMUNITY 타입이 아닌 경우에만 즉시 XP 지급
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
  }, [missions, addExperienceByCategory, currentNickname, loadMissions]);

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
        photo_url: undefined,
        images: undefined
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
      // difficulty를 DifficultyLevel로 변환
      const difficultyMap: Record<string, 'EASY' | 'MEDIUM' | 'HARD'> = {
        'easy': 'EASY',
        'medium': 'MEDIUM',
        'hard': 'HARD',
      };
      const difficultyLevel = missionData.difficulty ? difficultyMap[missionData.difficulty] : undefined;

      // 백엔드 API 형식으로 변환
      const createRequest: CreateMissionRequest = {
        title: missionData.title,
        description: missionData.description || '',
        durationDays: missionData.durationDays || 1,
        isPublic: missionData.isPublic ?? true,
        verificationType: (missionData.verificationType as 'COMMUNITY' | 'GPS' | 'TIME') || 'COMMUNITY',
        expReward: 0, // 커스텀 미션은 경험치 지급 없음
        badgeDurationDays: missionData.badgeDurationDays || 3,
        // 추가 필드
        worryType: missionData.worryType as any,
        category: missionData.category as ApiMissionCategory,  // 미션 카테고리 (DAILY_LIFE, GROWTH 등)
        difficultyLevel: difficultyLevel,
        challengeDays: missionData.challengeDays || 1,
        deadlineDays: missionData.deadlineDays || 3,
      };

      const result = await createCustomMissionApi(createRequest);

      if (result.success && result.data) {
        // 새 미션을 로컬 형식으로 변환하여 추가
        const newMission = transformApiMission(result.data);
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

      const updateRequest: Partial<CreateMissionRequest> = {
        title: missionData.title,
        description: missionData.description,
        isPublic: missionData.isPublic,
        expReward: missionData.experience,
      };

      const result = await updateCustomMissionApi(numericId, updateRequest);

      if (result.success && result.data) {
        const updatedMission = transformApiMission(result.data);
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
    saveMissionPhotos,
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
    saveMissionPhotos,
    deleteMissionPhoto,
    completeMissionWithPhoto,
    uncompleteMission,
    createCustomMission,
    updateCustomMission,
    deleteCustomMission,
  ]);
};
