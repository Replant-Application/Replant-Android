/**
 * 투두리스트 API
 * 백엔드 TodoListController와 연동
 *
 * 기존 missionSetApi.ts 기능을 통합 (하위 호환성 유지)
 */

import { apiClient } from './client';
import { ServiceResult } from '../types';
import {
  TodoList,
  TodoListInitResponse,
  TodoListCreateRequest,
  MissionSimple,
  CanCreateResponse,
  PublicTodoList,
  PublicTodoListDetail,
  TodoListReview,
  ReviewRequest,
  PageResponse
} from '../types/todolist';

// ============================================
// 기존 MissionSet 타입 정의 (하위 호환성)
// ============================================

export interface MissionSetMission {
  missionId: number;
  missionTitle: string;
  displayOrder: number;
}

export interface MissionSetSimple {
  id: number;
  title: string;
  description?: string;
  creatorId: number;
  creatorNickname: string;
  isPublic: boolean;
  missionCount: number;
  addedCount: number;
  averageRating: number;
  createdAt: string;
}

export interface MissionSetDetail extends MissionSetSimple {
  missions: MissionSetMission[];
}

export interface MissionSetListResponse {
  content: MissionSetSimple[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface CreateMissionSetRequest {
  title: string;
  description?: string;
  isPublic: boolean;
  missionIds?: number[];
}

export interface UpdateMissionSetRequest {
  title?: string;
  description?: string;
  isPublic?: boolean;
}

export interface MissionSetReview {
  id: number;
  missionSetId: number;
  missionSetTitle: string;
  user: {
    id: number;
    nickname: string;
  };
  rating: number;
  content?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MissionSetReviewListResponse {
  content: MissionSetReview[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface CreateReviewRequest {
  rating: number;
  content?: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  content?: string;
}

// ============================================
// API 함수
// ============================================

/**
 * 투두리스트 초기화 - 랜덤 공식 미션 3개 조회
 * POST /api/todolists/init
 */
export const initTodoList = async (): Promise<ServiceResult<TodoListInitResponse>> => {
  return apiClient.post<TodoListInitResponse>('/todolists/init');
};

/**
 * 선택 가능한 미션 목록 조회 (공식 + 커스텀)
 * GET /api/todolists/selectable-missions
 */
export const getSelectableMissions = async (): Promise<ServiceResult<MissionSimple[]>> => {
  return apiClient.get<MissionSimple[]>('/todolists/selectable-missions');
};

/**
 * 랜덤 미션 리롤 - 기존 미션을 제외하고 새로운 랜덤 미션 1개 조회
 * POST /api/todolists/reroll-mission
 */
export const rerollRandomMission = async (
  excludeMissionIds: number[]
): Promise<ServiceResult<MissionSimple>> => {
  return apiClient.post<MissionSimple>('/todolists/reroll-mission', {
    excludeMissionIds,
  });
};

/**
 * 투두리스트 생성
 * POST /api/todolists
 */
export const createTodoList = async (
  data: TodoListCreateRequest
): Promise<ServiceResult<TodoList>> => {
  return apiClient.post<TodoList>('/todolists', data);
};

/**
 * 전체 투두리스트 목록 조회 (페이징)
 * GET /api/todolists?page=0&size=20
 */
export const getTodoLists = async (
  page: number = 0,
  size: number = 20
): Promise<ServiceResult<{ content: TodoList[]; totalPages: number; totalElements: number }>> => {
  return apiClient.get(`/todolists?page=${page}&size=${size}`);
};

/**
 * 진행중 투두리스트 목록 조회 (진행중 탭)
 * GET /api/todolists/active
 */
export const getActiveTodoLists = async (): Promise<ServiceResult<TodoList[]>> => {
  return apiClient.get<TodoList[]>('/todolists/active');
};

/**
 * 완료된 투두리스트 목록 조회 (완료 탭)
 * GET /api/todolists/completed
 */
export const getCompletedTodoLists = async (
  page: number = 0,
  size: number = 20
): Promise<ServiceResult<{ content: TodoList[]; totalPages: number; totalElements: number }>> => {
  return apiClient.get(`/todolists/completed?page=${page}&size=${size}`);
};

/**
 * 투두리스트 상세 조회 (시간대 포함)
 * GET /api/todolists/{todoListId}
 */
export const getTodoListDetail = async (
  todoListId: number
): Promise<ServiceResult<TodoList>> => {
  return apiClient.get<TodoList>(`/todolists/${todoListId}`);
};

/**
 * 미션 시간대 수정
 * PATCH /api/todolists/{todoListId}/missions/{missionId}/schedule
 */
export const updateMissionSchedule = async (
  todoListId: number,
  missionId: number,
  data: { startTime: string; endTime: string }
): Promise<ServiceResult<TodoList>> => {
  return apiClient.patch<TodoList>(`/todolists/${todoListId}/missions/${missionId}/schedule`, data);
};

/**
 * 투두리스트 미션 완료
 * PUT /api/todolists/{todoListId}/missions/{missionId}/complete
 */
export const completeTodoMission = async (
  todoListId: number,
  missionId: number
): Promise<ServiceResult<TodoList>> => {
  return apiClient.put<TodoList>(`/todolists/${todoListId}/missions/${missionId}/complete`);
};

/**
 * 새 투두리스트 생성 가능 여부 확인
 * GET /api/todolists/can-create
 */
export const canCreateNewTodoList = async (): Promise<ServiceResult<CanCreateResponse>> => {
  return apiClient.get<CanCreateResponse>('/todolists/can-create');
};

/**
 * 투두리스트 보관
 * PUT /api/todolists/{todoListId}/archive
 */
export const archiveTodoList = async (
  todoListId: number
): Promise<ServiceResult<void>> => {
  return apiClient.put<void>(`/todolists/${todoListId}/archive`);
};

// ============================================
// 투두 공유 관련 API
// ============================================

/**
 * 공유 가능한 투두리스트 목록 조회
 * GET /api/todolists/shareable
 * 비공개 상태인 내 투두리스트만 조회
 */
export const getShareableTodoLists = async (): Promise<ServiceResult<TodoList[]>> => {
  return apiClient.get<TodoList[]>('/todolists/shareable');
};

/**
 * 투두리스트 공유 (공개로 전환)
 * PUT /api/todolists/{todoListId}/share
 */
export const shareTodoList = async (
  todoListId: number
): Promise<ServiceResult<TodoList>> => {
  return apiClient.put<TodoList>(`/todolists/${todoListId}/share`);
};

/**
 * 투두리스트 공유 해제 (비공개로 전환)
 * PUT /api/todolists/{todoListId}/unshare
 */
export const unshareTodoList = async (
  todoListId: number
): Promise<ServiceResult<TodoList>> => {
  return apiClient.put<TodoList>(`/todolists/${todoListId}/unshare`);
};

// ============================================
// 공개 투두리스트 API (기존 미션세트 기능 대체)
// ============================================

/**
 * 공개 투두리스트 목록 조회
 * GET /api/todolists/public
 * @param sortBy - 정렬 기준 ('popular' | 'latest')
 */
export const getPublicTodoLists = async (
  page: number = 0,
  size: number = 20,
  sortBy: 'popular' | 'latest' = 'popular'
): Promise<ServiceResult<PageResponse<PublicTodoList>>> => {
  return apiClient.get(`/todolists/public?page=${page}&size=${size}&sortBy=${sortBy}`);
};

/**
 * 공개 투두리스트 검색
 * GET /api/todolists/public/search
 */
export const searchPublicTodoLists = async (
  keyword: string,
  page: number = 0,
  size: number = 20,
  sortBy: 'popular' | 'latest' = 'popular'
): Promise<ServiceResult<PageResponse<PublicTodoList>>> => {
  return apiClient.get(`/todolists/public/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}&sortBy=${sortBy}`);
};

/**
 * 공개 투두리스트 상세 조회
 * GET /api/todolists/public/{todoListId}
 */
export const getPublicTodoListDetail = async (
  todoListId: number
): Promise<ServiceResult<PublicTodoListDetail>> => {
  return apiClient.get<PublicTodoListDetail>(`/todolists/public/${todoListId}`);
};

/**
 * 투두리스트 담기 (다른 사용자의 공개 투두리스트 복사)
 * POST /api/todolists/{todoListId}/copy
 */
export const copyTodoList = async (
  todoListId: number
): Promise<ServiceResult<TodoList>> => {
  return apiClient.post<TodoList>(`/todolists/${todoListId}/copy`);
};

// ============================================
// 투두리스트 리뷰 API
// ============================================

/**
 * 투두리스트 리뷰 작성
 * POST /api/todolists/{todoListId}/reviews
 */
export const createTodoListReview = async (
  todoListId: number,
  data: ReviewRequest
): Promise<ServiceResult<TodoListReview>> => {
  return apiClient.post<TodoListReview>(`/todolists/${todoListId}/reviews`, data);
};

/**
 * 투두리스트 리뷰 목록 조회
 * GET /api/todolists/{todoListId}/reviews
 */
export const getTodoListReviews = async (
  todoListId: number,
  page: number = 0,
  size: number = 10
): Promise<ServiceResult<PageResponse<TodoListReview>>> => {
  return apiClient.get(`/todolists/${todoListId}/reviews?page=${page}&size=${size}`);
};

// ============================================
// 기존 MissionSet API 함수 (하위 호환성 별칭)
// ============================================

/**
 * 공개 투두리스트 목록 조회 (getMissionSets 별칭)
 * GET /api/todolists/public
 */
export const getMissionSets = async (params?: {
  page?: number;
  size?: number;
  sortBy?: 'popular' | 'latest';
}): Promise<ServiceResult<MissionSetListResponse>> => {
  return apiClient.get<MissionSetListResponse>('/todolists/public', params);
};

/**
 * 내 투두리스트 목록 조회 (getMyMissionSets 별칭)
 * GET /api/todolists
 */
export const getMyMissionSets = async (params?: {
  page?: number;
  size?: number;
}): Promise<ServiceResult<MissionSetListResponse>> => {
  return apiClient.get<MissionSetListResponse>('/todolists', params);
};

/**
 * 투두리스트 검색 (searchMissionSets 별칭)
 * GET /api/todolists/public/search
 */
export const searchMissionSets = async (params: {
  keyword: string;
  page?: number;
  size?: number;
  sortBy?: 'popular' | 'latest';
}): Promise<ServiceResult<MissionSetListResponse>> => {
  return apiClient.get<MissionSetListResponse>('/todolists/public/search', params);
};

/**
 * 투두리스트 상세 조회 (getMissionSetDetail 별칭)
 * GET /api/todolists/:id
 */
export const getMissionSetDetail = async (
  id: number
): Promise<ServiceResult<MissionSetDetail>> => {
  return apiClient.get<MissionSetDetail>(`/todolists/${id}`);
};

/**
 * 투두리스트 생성 (createMissionSet 별칭)
 * POST /api/todolists
 */
export const createMissionSet = async (
  data: CreateMissionSetRequest
): Promise<ServiceResult<MissionSetDetail>> => {
  return apiClient.post<MissionSetDetail>('/todolists', data);
};

/**
 * 투두리스트 수정 (updateMissionSet 별칭)
 * PUT /api/todolists/:id
 */
export const updateMissionSet = async (
  id: number,
  data: UpdateMissionSetRequest
): Promise<ServiceResult<MissionSetDetail>> => {
  return apiClient.put<MissionSetDetail>(`/todolists/${id}`, data);
};

/**
 * 투두리스트 삭제 (deleteMissionSet 별칭)
 * DELETE /api/todolists/:id
 */
export const deleteMissionSet = async (
  id: number
): Promise<ServiceResult<{ message: string }>> => {
  return apiClient.delete<{ message: string }>(`/todolists/${id}`);
};

/**
 * 투두리스트에 미션 추가 (addMissionToSet 별칭)
 * POST /api/todolists/:id/missions
 */
export const addMissionToSet = async (
  setId: number,
  missionId: number
): Promise<ServiceResult<MissionSetDetail>> => {
  return apiClient.post<MissionSetDetail>(`/todolists/${setId}/missions`, { missionId });
};

/**
 * 투두리스트에서 미션 제거 (removeMissionFromSet 별칭)
 * DELETE /api/todolists/:id/missions/:missionId
 */
export const removeMissionFromSet = async (
  setId: number,
  missionId: number
): Promise<ServiceResult<MissionSetDetail>> => {
  return apiClient.delete<MissionSetDetail>(`/todolists/${setId}/missions/${missionId}`);
};

/**
 * 투두리스트 미션 순서 변경 (reorderMissions 별칭)
 * PUT /api/todolists/:id/missions/reorder
 */
export const reorderMissions = async (
  setId: number,
  missionIds: number[]
): Promise<ServiceResult<MissionSetDetail>> => {
  return apiClient.put<MissionSetDetail>(`/todolists/${setId}/missions/reorder`, { missionIds });
};

/**
 * 투두리스트 담기/복사 (copyMissionSet 별칭)
 * POST /api/todolists/:id/copy
 */
export const copyMissionSet = async (
  id: number
): Promise<ServiceResult<MissionSetDetail>> => {
  return apiClient.post<MissionSetDetail>(`/todolists/${id}/copy`);
};

/**
 * 리뷰 작성 (createReview 별칭)
 * POST /api/todolists/:todoListId/reviews
 */
export const createReview = async (
  missionSetId: number,
  data: CreateReviewRequest
): Promise<ServiceResult<MissionSetReview>> => {
  return apiClient.post<MissionSetReview>(`/todolists/${missionSetId}/reviews`, data);
};

/**
 * 리뷰 목록 조회 (getReviews 별칭)
 * GET /api/todolists/:todoListId/reviews
 */
export const getReviews = async (
  missionSetId: number,
  params?: { page?: number; size?: number }
): Promise<ServiceResult<MissionSetReviewListResponse>> => {
  return apiClient.get<MissionSetReviewListResponse>(`/todolists/${missionSetId}/reviews`, params);
};

/**
 * 내 리뷰 조회 (getMyReview 별칭)
 * GET /api/todolists/:todoListId/reviews/my
 */
export const getMyReview = async (
  missionSetId: number
): Promise<ServiceResult<MissionSetReview | null>> => {
  return apiClient.get<MissionSetReview | null>(`/todolists/${missionSetId}/reviews/my`);
};

/**
 * 리뷰 수정 (updateReview 별칭)
 * PUT /api/todolists/reviews/:reviewId
 */
export const updateReview = async (
  reviewId: number,
  data: UpdateReviewRequest
): Promise<ServiceResult<MissionSetReview>> => {
  return apiClient.put<MissionSetReview>(`/todolists/reviews/${reviewId}`, data);
};

/**
 * 리뷰 삭제 (deleteReview 별칭)
 * DELETE /api/todolists/reviews/:reviewId
 */
export const deleteReview = async (
  reviewId: number
): Promise<ServiceResult<{ message: string }>> => {
  return apiClient.delete<{ message: string }>(`/todolists/reviews/${reviewId}`);
};
