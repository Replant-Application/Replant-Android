/**
 * 나만의 미션 생성
 * @param {Object} missionData - 미션 데이터
 * @param {string} missionData.title - 미션 제목
 * @param {string} missionData.description - 미션 설명
 * @param {string} missionData.emoji - 이모지
 * @param {string} missionData.difficulty - 난이도
 * @param {number} missionData.experience - 경험치
 * @param {string} nickname - 사용자 닉네임
 * @returns {Object} 결과 객체
 */

import { getData, setData, getStorageKeys } from './storage';
import { logError } from '../utils/logger';
import { Mission, MissionData, ServiceResult } from '../types';

/**
 * 나만의 미션 생성
 */
export const createCustomMission = async (
  missionData: MissionData,
  nickname: string
): Promise<ServiceResult<Mission>> => {
  try {
    const storageKeys = getStorageKeys(nickname);
    const missions: Mission[] = await getData(storageKeys.MISSIONS) || [];

    // 새로운 미션 ID 생성
    const customMissions: Mission[] = missions.filter(m => m.is_custom);
    const newId: number = customMissions.length + 1;
    const missionId: string = `custom_${newId}`;

    const newMission: Mission = {
      id: Date.now(), // 고유 ID
      mission_id: missionId,
      title: missionData.title,
      description: missionData.description,
      emoji: missionData.emoji,
      difficulty: missionData.difficulty,
      experience: missionData.experience,
      category_id: 'custom',
      is_custom: true,
      created_by: nickname,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed: false,
      completed_at: undefined,
      photo_url: undefined
    };

    const updatedMissions: Mission[] = [...missions, newMission];
    await setData(storageKeys.MISSIONS, updatedMissions);

    return {
      success: true,
      data: newMission
    };
  } catch (error) {
    logError('나만의 미션 생성 실패', error as Error, { missionData, nickname });
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

/**
 * 나만의 미션 수정
 */
export const updateCustomMission = async (
  missionId: string,
  updateData: Partial<MissionData>,
  nickname: string
): Promise<ServiceResult<Mission>> => {
  try {
    const storageKeys = getStorageKeys(nickname);
    const missions: Mission[] = await getData(storageKeys.MISSIONS) || [];

    const missionIndex: number = missions.findIndex(m => m.mission_id === missionId && m.is_custom);
    if (missionIndex === -1) {
      throw new Error('미션을 찾을 수 없습니다.');
    }

    const mission = missions[missionIndex];
    if (!mission) {
      throw new Error('미션을 찾을 수 없습니다.');
    }

    const updatedMission: Mission = {
      ...mission,
      ...updateData,
      updated_at: new Date().toISOString(),
      id: mission.id,
      mission_id: mission.mission_id
    };

    missions[missionIndex] = updatedMission;
    await setData(storageKeys.MISSIONS, missions);

    return {
      success: true,
      data: updatedMission
    };
  } catch (error) {
    logError('나만의 미션 수정 실패', error as Error, { missionId, updateData, nickname });
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

/**
 * 나만의 미션 삭제
 */
export const deleteCustomMission = async (
  missionId: string,
  nickname: string
): Promise<ServiceResult<void>> => {
  try {
    const storageKeys = getStorageKeys(nickname);
    const missions: Mission[] = await getData(storageKeys.MISSIONS) || [];

    const filteredMissions: Mission[] = missions.filter(m => !(m.mission_id === missionId && m.is_custom));

    if (filteredMissions.length === missions.length) {
      throw new Error('미션을 찾을 수 없습니다.');
    }

    await setData(storageKeys.MISSIONS, filteredMissions);

    return {
      success: true
    };
  } catch (error) {
    logError('나만의 미션 삭제 실패', error as Error, { missionId, nickname });
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

/**
 * 나만의 미션 목록 조회
 */
export const getCustomMissions = async (nickname: string): Promise<Mission[]> => {
  try {
    const storageKeys = getStorageKeys(nickname);
    const missions: Mission[] = await getData(storageKeys.MISSIONS) || [];

    return missions.filter(m => m.is_custom);
  } catch (error) {
    logError('나만의 미션 목록 조회 실패', error as Error, { nickname });
    return [];
  }
};
