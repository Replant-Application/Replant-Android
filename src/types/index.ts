/**
 * 공통 타입 정의
 * 프로젝트 전체에서 사용되는 기본 타입들
 */

// 기본 서비스 결과 타입
export interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// 로딩 상태 타입
export interface LoadingState {
  loading: boolean;
  error: string | null;
}

// 기본 엔티티 타입
export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

// 난이도 타입
export type Difficulty = 'easy' | 'medium' | 'hard';

// 버튼 변형 타입
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

// 버튼 크기 타입
export type ButtonSize = 'sm' | 'base' | 'lg';

// 카테고리 타입
export type MissionCategory = 'self_management' | 'communication' | 'career' | 'custom';

// 감정 타입
export type Emotion = 'happy' | 'excited' | 'calm' | 'grateful' | 'sad' | 'angry' | 'anxious' | 'tired';

// 네비게이션 관련 타입
export interface NavigationProps {
  navigation: any; // React Navigation 타입은 나중에 정확히 정의
}

// 스타일 관련 타입
export interface StyleProps {
  style?: any;
  textStyle?: any;
}

// 재사용 가능한 컴포넌트 Props
export interface BaseComponentProps {
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
}

// Mission 관련 타입
export interface Mission {
  id: number;
  mission_id: string;
  title: string;
  description: string;
  emoji: string;
  difficulty: Difficulty;
  experience: number;
  category_id: MissionCategory;
  is_custom?: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  completed: boolean;
  completed_at?: string | undefined;
  photo_url?: string | undefined;
  category?: MissionCategory; // 하위 호환성을 위해
}

export interface MissionData {
  title: string;
  description: string;
  emoji: string;
  difficulty: Difficulty;
  experience: number;
  category_id: MissionCategory;
  is_custom?: boolean;
  created_by?: string;
}

export interface MissionCompletionResult {
  success: boolean;
  experienceGained: number;
  experience?: number;
  levelUp: boolean;
  newLevel?: number;
  unlocked?: boolean;
  error?: string;
}

// Character 관련 타입
export interface Character {
  id: string;
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
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface CharacterData {
  name: string;
  level: number;
  experience: number;
  category_id: MissionCategory;
  description?: string;
  emoji?: string;
  category?: string;
}

export interface ExperienceResult {
  success: boolean;
  experienceGained: number;
  levelUp: boolean;
  newLevel?: number;
  error?: string | undefined;
}

export interface LevelUpResult {
  success: boolean;
  oldLevel: number;
  newLevel: number;
  experienceGained: number;
  experience?: number;
  levelUp?: boolean;
  character?: Character;
  error?: string;
}

// User 관련 타입
export interface User {
  id: string;
  nickname: string;
  created_at?: string;
  updated_at?: string;
}

// Diary 관련 타입
export interface Diary {
  id: string;
  date: string;
  emotion: Emotion;
  content: string;
  created_at?: string;
  updated_at?: string;
  diary_id?: string;
}

export interface DiaryData {
  date: string;
  emotion: Emotion;
  content: string;
  title?: string;
  intensity?: number;
  mood_score?: number;
  tags?: string[];
  weather?: string;
  location?: string;
  photos?: string[];
  is_private?: boolean;
}

// Hooks 반환 타입
export interface UseMissionReturn {
  missions: Mission[];
  loading: boolean;
  error: string | null;
  completeMissionWithPhoto: (missionId: string, photoUrl: string | null) => Promise<MissionCompletionResult>;
  uncompleteMission: (missionId: string) => Promise<ServiceResult>;
  createCustomMission: (missionData: MissionData) => Promise<ServiceResult>;
  updateCustomMission: (missionId: string, missionData: MissionData) => Promise<ServiceResult>;
  deleteCustomMission: (missionId: string) => Promise<ServiceResult>;
}

export interface UseCharacterReturn {
  characters: Character[];
  representativeCharacter: Character | null;
  loading: boolean;
  error: string | null;
  addExperienceByCategory: (category: MissionCategory, experience: number) => Promise<ExperienceResult>;
  setRepresentative: (characterId: string) => Promise<ServiceResult>;
  createCharacter: (characterData: CharacterData) => Promise<ServiceResult>;
  updateCharacter: (characterId: string, characterData: CharacterData) => Promise<ServiceResult>;
  deleteCharacter: (characterId: string) => Promise<ServiceResult>;
}

export interface UseDiaryReturn {
  diaries: Diary[];
  loading: boolean;
  error: string | null;
  loadDiaries: () => Promise<void>;
  saveDiary: (diaryData: DiaryData) => Promise<ServiceResult>;
  updateDiary: (diaryId: string, diaryData: DiaryData) => Promise<ServiceResult>;
  deleteDiary: (diaryId: string) => Promise<ServiceResult>;
}

// Screen Names 타입
export enum ScreenNames {
  START = 'Start',
  NICKNAME = 'Nickname',
  HOME = 'Home',
  MISSION = 'Mission',
  DIARY = 'Diary',
  CHARACTER_GUIDE = 'CharacterGuide',
  CHARACTER_DETAIL = 'CharacterDetail',
  SETTINGS = 'Settings',
  CUSTOM_MISSION_CREATE = 'CustomMissionCreate',
  CHATBOT = 'ChatBot',
}
