/**
 * 투두리스트 API
 * 백엔드 TodoListController와 연동
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
 * 선택 가능한 커스텀 미션 목록 조회
 * GET /api/todolists/selectable-missions
 */
export const getSelectableMissions = async (): Promise<ServiceResult<MissionSimple[]>> => {
  return apiClient.get<MissionSimple[]>('/todolists/selectable-missions');
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
 * 내 투두리스트 목록 조회
 * GET /api/todolists
 */
export const getTodoLists = async (
  page: number = 0,
  size: number = 20
): Promise<ServiceResult<{ content: TodoList[]; totalPages: number; totalElements: number }>> => {
  return apiClient.get(`/todolists?page=${page}&size=${size}`);
};

/**
 * 활성 투두리스트 목록 조회
 * GET /api/todolists/active
 */
export const getActiveTodoLists = async (): Promise<ServiceResult<TodoList[]>> => {
  return apiClient.get<TodoList[]>('/todolists/active');
};

/**
 * 투두리스트 상세 조회
 * GET /api/todolists/{todoListId}
 */
export const getTodoListDetail = async (
  todoListId: number
): Promise<ServiceResult<TodoList>> => {
  return apiClient.get<TodoList>(`/todolists/${todoListId}`);
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
