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
import { Mission, MissionData, UseMissionReturn, MissionCompletionResult, ServiceResult, ExperienceResult, MissionCategory, MissionStatus, MissionType } from '../types';
import { TodoMission } from '../types/todolist';
import {
  getUserMissions,
  createCustomMission as createCustomMissionApi,
  updateCustomMission as updateCustomMissionApi,
  deleteCustomMission as deleteCustomMissionApi,
  Mission as ApiMission,
  UserMission,
  MissionCategory as ApiMissionCategory,
  CreateMissionRequest,
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
 * 백엔드 UserMission을 로컬 미션 형식으로 변환
 */
const transformUserMission = (userMission: UserMission): Mission => {
  // mission 필드 사용 (통합됨)
  const mission = userMission.mission || userMission.customMission;
  if (!mission) {
    throw new Error('UserMission has no mission data');
  }

  const isCustom = userMission.missionType === 'CUSTOM';

  return {
    id: userMission.id,
    mission_id: isCustom ? `custom_${mission.id}` : mission.id.toString(),
    user_mission_id: userMission.id,
    title: mission.title,
    description: mission.description,
    emoji: getMissionEmoji(mission.title),
    experience: isCustom ? 0 : (mission.expReward || 10),
    category_id: 'growth',
    category: mission.category || 'DAILY_LIFE',
    missionType: userMission.missionType,
    status: userMission.status,
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

/**
 * TodoMission을 Mission 타입으로 변환
 * 투두리스트의 미션을 미션 탭에서 사용할 수 있도록 변환
 */
const transformTodoMissionToMission = (
  todoMission: TodoMission,
  todoListId?: number
): Mission | null => {
  try {
    const isCustom = todoMission.missionType === 'CUSTOM';
    
    // TodoMission의 상태를 Mission의 status로 변환
    // UserMission의 status를 우선적으로 사용 (가장 정확함)
    // isCompleted === true → COMPLETED
    // userMissionStatus가 있으면 그대로 사용
    // userMissionStatus가 없으면 기본값 ASSIGNED (백엔드에서 ASSIGNED로 생성되므로)
    let status: MissionStatus = 'ASSIGNED';
    if (todoMission.isCompleted) {
      status = 'COMPLETED';
    } else if (todoMission.userMissionStatus) {
      // 백엔드의 UserMission 상태를 그대로 사용 (ASSIGNED, PENDING, COMPLETED 등)
      status = todoMission.userMissionStatus as MissionStatus;
      console.log(`[transformTodoMissionToMission] userMissionStatus 사용: ${todoMission.title} -> ${status}`, {
        userMissionStatus: todoMission.userMissionStatus,
        isCompleted: todoMission.isCompleted,
        isVerified: todoMission.isVerified
      });
    } else {
      // userMissionStatus가 없으면 기본값 ASSIGNED (백엔드에서 ASSIGNED로 생성되므로)
      status = 'ASSIGNED';
      console.log(`[transformTodoMissionToMission] userMissionStatus 없음, 기본값 ASSIGNED: ${todoMission.title}`, {
        userMissionStatus: todoMission.userMissionStatus,
        isVerified: todoMission.isVerified,
        isCompleted: todoMission.isCompleted
      });
    }
    
    return {
      id: todoMission.id,
      mission_id: isCustom ? `custom_${todoMission.missionId}` : todoMission.missionId.toString(),
      title: todoMission.title,
      description: todoMission.description,
      emoji: getMissionEmoji(todoMission.title),
      experience: isCustom ? 0 : 10, // TodoMission에는 expReward가 없으므로 기본값 사용
      category_id: 'growth',
      category: 'DAILY_LIFE',
      missionType: todoMission.missionType as MissionType,
      status,
      difficulty: 'medium' as const,
      completed: todoMission.isCompleted,
      completed_at: todoMission.completedAt || undefined,
      is_custom: isCustom,
      verification_type: (todoMission.verificationType || 'COMMUNITY') as 'COMMUNITY' | 'GPS' | 'TIME',
      verified: todoMission.isVerified === true,
      // 투두리스트 정보 저장 (미션 완료 시 필요)
      todoListId: todoListId,
    };
  } catch (e) {
    console.error('[transformTodoMissionToMission] 변환 실패:', e);
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

  // 미션 데이터 로드 (투두리스트에서 가져오기)
  // 홈 화면과 동일하게 오늘 만든 투두리스트의 미션만 표시
  // 캘린더용 과거 미션 조회는 /api/missions/my/calendar/date 또는 /range 사용
  const loadMissions = useCallback(async (): Promise<void> => {
    if (!currentNickname) return;

    try {
      setLoading(true);
      setError(null);

      const allMissions: Mission[] = [];

      // 오늘 만든 투두리스트 가져오기 (홈 화면과 동일한 로직)
      const { getActiveTodoLists } = await import('../api/todolistApi');
      const { filterTodayActiveTodoLists } = await import('../utils/todolistUtils');
      const { getTodoListDetail } = await import('../api/todolistApi');
      
      const todoListResult = await getActiveTodoLists();
      if (todoListResult?.success && Array.isArray(todoListResult.data)) {
        // 오늘 만든 투두리스트만 필터링
        const todayTodoLists = filterTodayActiveTodoLists(todoListResult.data, 'useMission');
        
        // 각 투두리스트의 미션 가져오기
        const missionMap = new Map<string, Mission>(); // mission_id로 중복 제거
        
        for (const todoList of todayTodoLists) {
          try {
            const detailResult = await getTodoListDetail(todoList.id);
            if (detailResult?.success && detailResult.data?.missions) {
              // 디버깅: API 응답 확인
              console.log(`[useMission] 투두리스트 ${todoList.id} 미션 데이터:`, 
                detailResult.data.missions.map((m: any) => ({
                  title: m.title,
                  userMissionStatus: m.userMissionStatus,
                  isVerified: m.isVerified,
                  isCompleted: m.isCompleted
                }))
              );
              
              // 투두리스트의 미션을 Mission 형식으로 변환
              for (const todoMission of detailResult.data.missions) {
                try {
                  const mission = transformTodoMissionToMission(todoMission, todoList.id);
                  if (mission) {
                    // 같은 미션이 여러 투두리스트에 포함되어 있을 수 있으므로 중복 제거
                    // mission_id를 키로 사용하여 가장 최신 상태 유지
                    const existingMission = missionMap.get(mission.mission_id);
                    if (!existingMission || (mission.completed && !existingMission.completed)) {
                      // 기존 미션이 없거나, 새 미션이 완료된 상태면 업데이트
                      missionMap.set(mission.mission_id, mission);
                    }
                  }
                } catch (e) {
                  logError('TodoMission 변환 실패', e as Error, { todoMissionId: todoMission.id });
                }
              }
            }
          } catch (e) {
            logError('투두리스트 상세 조회 실패', e as Error, { todoListId: todoList.id });
          }
        }
        
        // Map을 배열로 변환
        allMissions.push(...Array.from(missionMap.values()));
        
        console.log('[useMission] 투두리스트에서 로드된 미션:', {
          todoListCount: todayTodoLists.length,
          missionCount: allMissions.length,
          completed: allMissions.filter(m => m.completed).length,
          pending: allMissions.filter(m => m.status === 'PENDING').length,
          assigned: allMissions.filter(m => m.status === 'ASSIGNED').length,
        });
      }

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

      const updateData: Partial<CreateMissionRequest> = {
        title: missionData.title,
        description: missionData.description,
        isPublic: missionData.isPublic,
        expReward: missionData.experience,
      };

      const result = await updateCustomMissionApi(numericId, updateData);

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
