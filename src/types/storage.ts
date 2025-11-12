/**
 * 스토리지 관련 타입 정의
 */

// 스토리지 키 타입
export interface StorageKeys {
  USER: string;
  CHARACTERS: string;
  MISSIONS: string;
  DIARIES: string;
  SETTINGS: string;
  PREFERENCES: string;
  USER_NICKNAME: string;
  CHARACTER_TEMPLATES: string;
  MISSION_TEMPLATES: string;
  COMMUNITY_POSTS: string;
  COMMUNITY_COMMENTS: string;
  USER_LIKES: string;
  USER_SCRAPS: string;
  CALENDAR_EVENTS: string;
  AI_ANALYSIS_RESULTS: string;
}

// 스토리지 서비스 함수 타입
export type GetData<T = any> = (key: string) => Promise<T | null>;
export type SetData<T = any> = (key: string, data: T) => Promise<void>;
export type RemoveData = (key: string) => Promise<void>;
export type ClearData = () => Promise<void>;

// 스토리지 업데이트 함수 타입
export type UpdateData<T = any> = (key: string, id: number, data: T) => Promise<void>;

// 스토리지 키 생성 함수 타입
export type GetStorageKeys = (nickname: string) => StorageKeys;

// 스토리지 서비스 인터페이스
export interface StorageService {
  getData: GetData;
  setData: SetData;
  removeData: RemoveData;
  clearData: ClearData;
  updateData: UpdateData;
  getStorageKeys: GetStorageKeys;
}

// 스토리지 에러 타입
export interface StorageError {
  code: string;
  message: string;
  key?: string;
  data?: any;
}

// 스토리지 결과 타입
export interface StorageResult<T = any> {
  success: boolean;
  data?: T;
  error?: StorageError;
}

// 스토리지 설정 타입
export interface StorageConfig {
  prefix: string;
  encryption: boolean;
  compression: boolean;
  maxSize: number;
  backupEnabled: boolean;
}

// 스토리지 통계 타입
export interface StorageStats {
  totalKeys: number;
  totalSize: number;
  lastBackup: string | null;
  errorCount: number;
  successRate: number;
}
