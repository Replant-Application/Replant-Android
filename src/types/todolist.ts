/**
 * 투두리스트 및 챌린지 관련 타입 정의
 */

// ============================================
// 투두리스트 타입
// ============================================

export type TodoListStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
export type MissionSource = 'RANDOM_OFFICIAL' | 'CUSTOM_SELECTED';

export interface TodoMission {
  id: number;
  missionId: number;
  title: string;
  description: string;
  missionType: string;
  verificationType: string;
  displayOrder: number;
  isCompleted: boolean;
  completedAt: string | null;
  missionSource: MissionSource;
}

export interface TodoList {
  id: number;
  title: string;
  description: string | null;
  completedCount: number;
  totalCount: number;
  progressRate: number;
  canCreateNew: boolean;
  status: TodoListStatus;
  missions?: TodoMission[];
  createdAt: string;
  updatedAt?: string;
}

export interface TodoListInitResponse {
  randomMissions: MissionSimple[];
}

export interface MissionSimple {
  id: number;
  title: string;
  description: string;
  missionType: string;
  verificationType: string;
  category: string;
  expReward: number;
}

export interface TodoListCreateRequest {
  title?: string;
  description?: string;
  randomMissionIds: number[];
  customMissionIds: number[];
}

// ============================================
// 챌린지 타입
// ============================================

export type ChallengeStatus = 'ACTIVE' | 'COMPLETED' | 'FAILED';

export interface ChallengeMission {
  id: number;
  title: string;
  description: string;
  category: string;
  verificationType: string;
  expReward: number;
  challengeDays: number;
}

export interface Challenge {
  id: number;
  missionId: number;
  missionTitle: string;
  missionDescription: string;
  status: ChallengeStatus;
  currentStreak: number;
  totalCompletedDays: number;
  durationDays: number;
  progressRate: number;
  remainingDays: number;
  todayCompleted: boolean;
  startDate: string;
  endDate: string;
  mission?: ChallengeMission;
  lastCompletedDate?: string;
  createdAt?: string;
}

export interface ChallengeStartRequest {
  missionId: number;
  durationDays?: number;
}

// ============================================
// API 응답 타입
// ============================================

export interface CanCreateResponse {
  canCreate: boolean;
  activeTodoListCount: number;
}

export interface ChallengeCountResponse {
  count: number;
}

// ============================================
// 공개 투두리스트 타입 (기존 미션세트 대체)
// ============================================

export interface PublicTodoList {
  id: number;
  title: string;
  description: string | null;
  creatorId: number;
  creatorNickname: string;
  missionCount: number;
  addedCount: number;       // 담은 횟수
  averageRating: number;    // 평균 별점
  reviewCount: number;      // 리뷰 수
  createdAt: string;
}

export interface PublicMissionInfo {
  missionId: number;
  title: string;
  description: string;
  category: string;
  verificationType: string;
  expReward: number;
  displayOrder: number;
}

export interface PublicTodoListDetail extends PublicTodoList {
  missions: PublicMissionInfo[];
  updatedAt: string;
}

export interface TodoListReview {
  id: number;
  todoListId: number;
  userId: number;
  userNickname: string;
  rating: number;
  content: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewRequest {
  rating: number;
  content?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}
