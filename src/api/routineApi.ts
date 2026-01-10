import apiClient from './apiClient';

// 루틴 타입
export type RoutineType =
  | 'WAKE_UP_TIME'       // 기상 시간
  | 'DAILY_PLACE'        // 매일 갈 장소
  | 'WEEKLY_RESOLUTION'  // 이번 주 다짐
  | 'MONTHLY_RESOLUTION' // 이번 달 다짐
  | 'EXERCISE_TARGET'    // 운동 목표
  | 'STUDY_TARGET'       // 학습 목표
  | 'CUSTOM';            // 사용자 정의

// 주기 타입
export type PeriodType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'NONE';

// 루틴 응답 타입
export interface UserRoutine {
  id: number;
  routineType: RoutineType;
  routineTypeName: string;
  periodType: PeriodType;
  periodTypeName: string;
  periodStart: string | null;
  periodEnd: string | null;
  valueText: string | null;
  valueTime: string | null; // HH:mm:ss 형식
  valueNumber: number | null;
  valueLatitude: number | null;
  valueLongitude: number | null;
  notificationEnabled: boolean;
  notificationTime: string | null; // HH:mm:ss 형식
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

// 루틴 요청 타입
export interface UserRoutineRequest {
  routineType: RoutineType;
  periodType?: PeriodType;
  periodStart?: string;
  valueText?: string;
  valueTime?: string; // HH:mm:ss 형식
  valueNumber?: number;
  valueLatitude?: number;
  valueLongitude?: number;
  notificationEnabled?: boolean;
  notificationTime?: string; // HH:mm:ss 형식
}

// 루틴 타입 정보
export interface RoutineTypeInfo {
  type: RoutineType;
  displayName: string;
  defaultPeriodType: PeriodType;
}

// API 응답 타입
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// 루틴 타입 목록 조회
export const getRoutineTypes = async (): Promise<RoutineTypeInfo[]> => {
  const response = await apiClient.get<ApiResponse<RoutineTypeInfo[]>>('/api/routines/types');
  return response.data.data;
};

// 활성 루틴 전체 조회
export const getActiveRoutines = async (): Promise<UserRoutine[]> => {
  const response = await apiClient.get<ApiResponse<UserRoutine[]>>('/api/routines');
  return response.data.data;
};

// 주기별 활성 루틴 조회
export const getRoutinesByPeriod = async (periodType: PeriodType): Promise<UserRoutine[]> => {
  const response = await apiClient.get<ApiResponse<UserRoutine[]>>(`/api/routines/period/${periodType}`);
  return response.data.data;
};

// 특정 타입 활성 루틴 조회
export const getRoutineByType = async (routineType: RoutineType): Promise<UserRoutine | null> => {
  const response = await apiClient.get<ApiResponse<UserRoutine | null>>(`/api/routines/type/${routineType}`);
  return response.data.data;
};

// 루틴 히스토리 조회
export const getRoutineHistory = async (
  routineType: RoutineType,
  page: number = 0,
  size: number = 10
): Promise<{ content: UserRoutine[]; totalElements: number; totalPages: number }> => {
  const response = await apiClient.get<ApiResponse<{ content: UserRoutine[]; totalElements: number; totalPages: number }>>(
    `/api/routines/type/${routineType}/history`,
    { params: { page, size } }
  );
  return response.data.data;
};

// 루틴 저장 (생성 또는 업데이트)
export const saveRoutine = async (request: UserRoutineRequest): Promise<UserRoutine> => {
  const response = await apiClient.post<ApiResponse<UserRoutine>>('/api/routines', request);
  return response.data.data;
};

// 루틴 삭제
export const deleteRoutine = async (routineId: number): Promise<void> => {
  await apiClient.delete(`/api/routines/${routineId}`);
};

// 루틴 알림 토글
export const toggleRoutineNotification = async (routineId: number, enabled: boolean): Promise<UserRoutine> => {
  const response = await apiClient.patch<ApiResponse<UserRoutine>>(
    `/api/routines/${routineId}/notification`,
    null,
    { params: { enabled } }
  );
  return response.data.data;
};

// 루틴 타입별 아이콘 반환
export const getRoutineIcon = (routineType: RoutineType): string => {
  switch (routineType) {
    case 'WAKE_UP_TIME':
      return '⏰';
    case 'DAILY_PLACE':
      return '📍';
    case 'WEEKLY_RESOLUTION':
      return '📝';
    case 'MONTHLY_RESOLUTION':
      return '🎯';
    case 'EXERCISE_TARGET':
      return '💪';
    case 'STUDY_TARGET':
      return '📚';
    case 'CUSTOM':
      return '✨';
    default:
      return '📋';
  }
};

// 시간 문자열 변환 (HH:mm:ss -> HH:mm)
export const formatTimeDisplay = (time: string | null): string => {
  if (!time) return '';
  const parts = time.split(':');
  return `${parts[0]}:${parts[1]}`;
};

// 시간 문자열 변환 (HH:mm -> HH:mm:ss)
export const formatTimeForApi = (time: string): string => {
  return time.includes(':') && time.split(':').length === 2 ? `${time}:00` : time;
};
