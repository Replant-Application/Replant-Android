/**
 * 일기 관련 타입 정의
 */

import { BaseEntity, Emotion, ServiceResult } from './index';

// 일기 엔티티
export interface Diary extends BaseEntity {
  diary_id: string;
  title: string;
  content: string;
  emotion: Emotion;
  intensity: number; // 1-10
  mood_score: number; // 1-10
  tags: string[];
  weather?: string;
  location?: string;
  photos: string[];
  is_private: boolean;
  created_by: string;
}

// 일기 생성 데이터
export interface DiaryData {
  title: string;
  content: string;
  emotion: Emotion;
  intensity: number;
  mood_score: number;
  tags: string[];
  weather?: string;
  location?: string;
  photos: string[];
  is_private: boolean;
}

// 일기 수정 데이터
export interface DiaryUpdateData extends Partial<DiaryData> {
  updated_at: string;
}

// 일기 훅 반환 타입
export interface UseDiaryReturn {
  diaries: Diary[];
  loading: boolean;
  error: string | null;
  loadDiaries: () => Promise<void>;
  createDiary: (diaryData: DiaryData) => Promise<ServiceResult<Diary>>;
  updateDiary: (diaryId: string, updateData: DiaryUpdateData) => Promise<ServiceResult<Diary>>;
  deleteDiary: (diaryId: string) => Promise<ServiceResult<void>>;
  getDiaryById: (diaryId: string) => Diary | null;
  getDiariesByEmotion: (emotion: Emotion) => Diary[];
  getDiariesByDateRange: (startDate: string, endDate: string) => Diary[];
}

// 일기 통계
export interface DiaryStats {
  total_diaries: number;
  average_mood_score: number;
  most_common_emotion: Emotion;
  emotion_distribution: Record<Emotion, number>;
  writing_streak: number;
  longest_streak: number;
  last_entry_date: string | null;
}

// 일기 필터 옵션
export interface DiaryFilterOptions {
  emotion?: Emotion;
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
  moodScore?: {
    min: number;
    max: number;
  };
  isPrivate?: boolean;
}

// 일기 검색 옵션
export interface DiarySearchOptions {
  query: string;
  fields: ('title' | 'content' | 'tags')[];
  caseSensitive?: boolean;
}

// 일기 내보내기 옵션
export interface DiaryExportOptions {
  format: 'json' | 'csv' | 'pdf';
  dateRange?: {
    start: string;
    end: string;
  };
  includePhotos?: boolean;
  includeMetadata?: boolean;
}
