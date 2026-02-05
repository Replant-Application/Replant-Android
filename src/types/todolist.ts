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
  scheduledStartTime?: string | null;
  scheduledEndTime?: string | null;
  isVerified?: boolean; // 인증 완료 여부 (공식 미션의 경우만 의미 있음)
  userMissionStatus?: string | null; // UserMission의 상태 (ASSIGNED, PENDING, COMPLETED)
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
  creatorId?: number;
  creatorNickname?: string;
  isPublic?: boolean;
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
  missionSchedules?: Record<string, { startTime: string; endTime: string }>;
}

// ============================================
// API 응답 타입
// ============================================

export interface CanCreateResponse {
  canCreate: boolean;
  activeTodoListCount: number;
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
  likeCount: number;       // 좋아요 수
  isLiked?: boolean;       // 현재 사용자 좋아요 여부
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
  /** OFFICIAL(공식) | CUSTOM(커스텀) - 미션 타입 */
  missionType?: string;
  /** 공유한 사용자(작성자)가 해당 미션을 완료했는지 여부 (API는 isCompleted 로 내려줄 수 있음) */
  isCompletedByCreator?: boolean;
  /** 백엔드 API 응답 필드명 - isCompletedByCreator 로 매핑해서 사용 */
  isCompleted?: boolean;
  /** 작성자가 해당 미션을 완료했을 때의 인증 게시글 ID (공개 상세에서만) */
  verificationPostId?: number;
}

export interface PublicTodoListDetail extends PublicTodoList {
  missions: PublicMissionInfo[];
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}
