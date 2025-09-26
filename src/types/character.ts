/**
 * 캐릭터 관련 타입 정의
 */

import { BaseEntity, Emotion, ServiceResult } from './index';

// 캐릭터 엔티티
export interface Character extends BaseEntity {
  character_id: string;
  name: string;
  title: string;
  description: string;
  emoji: string;
  level: number;
  experience: number;
  total_experience: number;
  max_experience: number;
  unlocked: boolean;
  unlocked_date?: string;
  category: string;
  category_id: string;
  completed_missions: number;
}

// 캐릭터 생성 데이터
export interface CharacterData {
  name: string;
  description: string;
  emoji: string;
  category: string;
  category_id: string;
}

// 캐릭터 레벨업 결과
export interface LevelUpResult {
  success: boolean;
  newLevel: number;
  experience: number;
  maxExperience: number;
  unlocked?: boolean;
  error?: string;
}

// 경험치 추가 결과
export interface ExperienceResult {
  success: boolean;
  experience: number;
  levelUp: boolean;
  newLevel?: number;
  error?: string;
}

// 캐릭터 훅 반환 타입
export interface UseCharacterReturn {
  characters: Character[];
  representativeCharacter: Character | null;
  loading: boolean;
  error: string | null;
  loadCharacters: () => Promise<void>;
  addExperienceByCategory: (
    category: string,
    experience: number
  ) => Promise<ExperienceResult>;
  setRepresentativeCharacter: (characterId: string) => Promise<ServiceResult<void>>;
}

// 캐릭터 카테고리 정보
export interface CharacterCategoryInfo {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

// 캐릭터 감정 상태
export interface CharacterEmotion {
  character_id: string;
  emotion: Emotion;
  intensity: number; // 1-10
  timestamp: string;
}
