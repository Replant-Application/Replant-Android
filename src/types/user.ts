/**
 * 사용자 관련 타입 정의
 */

import { BaseEntity, Emotion, ServiceResult } from './index';

// 사용자 엔티티
export interface User extends BaseEntity {
  nickname: string;
  email?: string;
  avatar?: string;
  level: number;
  total_experience: number;
  preferences: UserPreferences;
  settings: UserSettings;
}

// 사용자 선호도
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'ko' | 'en';
  notifications: NotificationSettings;
}

// 알림 설정
export interface NotificationSettings {
  mission_reminders: boolean;
  level_up: boolean;
  daily_check_in: boolean;
  weekly_summary: boolean;
}

// 사용자 설정
export interface UserSettings {
  auto_save: boolean;
  backup_enabled: boolean;
  privacy_mode: boolean;
}

// 사용자 컨텍스트 타입
export interface UserContextType {
  user: User | null;
  currentNickname: string | null;
  loading: boolean;
  error: string | null;
  login: (nickname: string) => Promise<ServiceResult<void>>;
  logout: () => Promise<ServiceResult<void>>;
  updateUser: (userData: Partial<User>) => Promise<ServiceResult<void>>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<ServiceResult<void>>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<ServiceResult<void>>;
}

// 로그인 데이터
export interface LoginData {
  nickname: string;
  email?: string;
  remember: boolean;
}

// 사용자 통계
export interface UserStats {
  total_missions: number;
  completed_missions: number;
  completion_rate: number;
  current_streak: number;
  longest_streak: number;
  favorite_category: string;
  total_experience: number;
  level: number;
}

// 사용자 활동 기록
export interface UserActivity {
  id: number;
  user_id: string;
  activity_type: 'mission_completed' | 'level_up' | 'character_unlocked' | 'login' | 'logout';
  description: string;
  metadata?: Record<string, any>;
  timestamp: string;
}
