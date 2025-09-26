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
