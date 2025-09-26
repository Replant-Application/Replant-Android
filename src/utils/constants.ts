/**
 * 앱 상수 정의
 */

import { ScreenNames, MissionCategory } from '../types';

// 앱 설정
export const APP_CONFIG = {
  APP_NAME: 'Replant',
  VERSION: '1.0.0',
} as const;

// 네비게이션 상수
export const SCREEN_NAMES: Record<string, string> = {
  START: 'Start',
  NICKNAME: 'Nickname',
  HOME: 'Home',
  DIARY: 'Diary',
  MISSION: 'Mission',
  CUSTOM_MISSION_CREATE: 'CustomMissionCreate',
  CHATBOT: 'ChatBot',
  CHARACTER_GUIDE: 'CharacterGuide',
  CHARACTER_DETAIL: 'CharacterDetail',
  SETTINGS: 'Settings',
} as const;

// 미션 카테고리 (3개로 축소)
export const MISSION_CATEGORIES: Record<string, MissionCategory> = {
  SELF_MANAGEMENT: 'self_management',
  COMMUNICATION: 'communication', 
  CAREER: 'career',
} as const;

// 감정 태그
export const EMOTION_TAGS: readonly string[] = [
  '행복', '슬픔', '화남', '불안', '평온', '흥분', '피곤', '에너지'
] as const;

// 미션 난이도
export const MISSION_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
} as const;

// 미션 경험치 (난이도별)
export const MISSION_EXPERIENCE = {
  easy: 50,
  medium: 100,
  hard: 200,
} as const;

// 캐릭터 레벨별 경험치 요구량
export const LEVEL_EXPERIENCE_REQUIREMENTS = {
  1: 0,
  2: 100,
  3: 250,
  4: 450,
  5: 700,
  6: 1000,
  7: 1350,
  8: 1750,
  9: 2200,
  10: 2700,
} as const;

// 스토리지 키
export const STORAGE_KEYS = {
  USER: 'user',
  CHARACTERS: 'characters',
  MISSIONS: 'missions',
  DIARIES: 'diaries',
  SETTINGS: 'settings',
  PREFERENCES: 'preferences',
} as const;

// API 엔드포인트 (향후 확장용)
export const API_ENDPOINTS = {
  BASE_URL: 'https://api.replant.com',
  AUTH: '/auth',
  USERS: '/users',
  MISSIONS: '/missions',
  CHARACTERS: '/characters',
  DIARIES: '/diaries',
} as const;

// 앱 테마
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
} as const;

// 언어 설정
export const LANGUAGE = {
  KOREAN: 'ko',
  ENGLISH: 'en',
} as const;
