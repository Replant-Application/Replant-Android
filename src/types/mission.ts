/**
 * 미션 관련 타입 정의
 */

import { BaseEntity, Difficulty, MissionCategory, ServiceResult } from './index';

// 미션 데이터 (생성/수정 시 사용)
export interface MissionData {
  title: string;
  description: string;
  emoji: string;
  difficulty: Difficulty;
  experience: number;
  category_id: string;
}

// 미션 엔티티
export interface Mission extends BaseEntity {
  mission_id: string;
  title: string;
  description: string;
  emoji: string;
  difficulty: Difficulty;
  experience: number;
  category: string;
  category_id: MissionCategory;
  is_custom: boolean;
  created_by?: string;
  completed: boolean;
  completed_at: string | null;
  photo_url: string | null;
}

// 미션 완료 결과
export interface MissionCompletionResult {
  success: boolean;
  experience?: number;
  levelUp?: boolean;
  newLevel?: number;
  unlocked?: boolean;
  error?: string;
}

// 미션 서비스 함수 타입
export type CreateCustomMission = (
  missionData: MissionData,
  nickname: string
) => Promise<ServiceResult<Mission>>;

export type UpdateCustomMission = (
  missionId: string,
  updateData: Partial<MissionData>,
  nickname: string
) => Promise<ServiceResult<Mission>>;

export type DeleteCustomMission = (
  missionId: string,
  nickname: string
) => Promise<ServiceResult<void>>;

export type GetCustomMissions = (
  nickname: string
) => Promise<Mission[]>;

// 미션 훅 반환 타입
export interface UseMissionReturn {
  missions: Mission[];
  loading: boolean;
  error: string | null;
  loadMissions: () => Promise<void>;
  completeMissionWithPhoto: (
    missionId: string,
    photoUrl: string | null
  ) => Promise<MissionCompletionResult>;
  uncompleteMission: (missionId: string) => Promise<ServiceResult<void>>;
}

// 미션 카테고리 정보
export interface MissionCategoryInfo {
  id: MissionCategory;
  name: string;
  emoji: string;
}
