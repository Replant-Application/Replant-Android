/**
 * 미션 관련 API 인터페이스
 * Mission (시스템 미션), CustomMission, UserMission, Verification 포함
 */

import { apiClient } from './client';
import { API_CONFIG } from '../config/apiConfig';
import { ServiceResult } from '../types';

// ============================================
// 타입 정의 (백엔드 enum과 동기화)
// ============================================

// 미션 타입: OFFICIAL(공식 미션), CUSTOM(커스텀 미션)
export type MissionType = 'OFFICIAL' | 'CUSTOM';

// 미션 카테고리: DAILY_LIFE(일상), GROWTH(성장), EXERCISE(운동), STUDY(학습), HEALTH(건강), RELATIONSHIP(관계)
export type MissionCategory = 'DAILY_LIFE' | 'GROWTH' | 'EXERCISE' | 'STUDY' | 'HEALTH' | 'RELATIONSHIP';

export type VerificationType = 'COMMUNITY' | 'GPS' | 'TIME';
export type UserMissionStatus = 'ASSIGNED' | 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'FAILED';
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type VoteType = 'APPROVE' | 'REJECT';

// 사용자 맞춤 필터링 타입
export type WorryType = 'RE_EMPLOYMENT' | 'JOB_PREPARATION' | 'ENTRANCE_EXAM' | 'ADVANCEMENT' | 'RETURN_TO_SCHOOL' | 'RELATIONSHIP' | 'SELF_MANAGEMENT';
export type AgeRange = 'LATE_TEENS' | 'EARLY_TWENTIES' | 'MID_TWENTIES' | 'LATE_TWENTIES' | 'EARLY_THIRTIES' | 'MID_THIRTIES' | 'LATE_THIRTIES' | 'FORTIES_PLUS';
export type GenderType = 'MALE' | 'FEMALE' | 'ALL';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';
export type PlaceType = 'HOME' | 'OUTDOOR' | 'INDOOR';

// ============================================
// 통합 미션 (Mission) - 공식/커스텀 미션 통합
// ============================================

/**
 * 통합 미션 인터페이스
 * missionType으로 OFFICIAL(공식 미션)과 CUSTOM(커스텀 미션) 구분
 */
export interface Mission {
  id: number;
  title: string;
  description: string;
  missionType: MissionType;  // OFFICIAL | CUSTOM
  category?: MissionCategory;  // 미션 카테고리
  verificationType: VerificationType;
  requiredMinutes?: number;
  expReward: number;
  badgeDurationDays: number;

  // 공통 필드
  worryType?: WorryType;
  difficultyLevel?: DifficultyLevel;

  // 공식 미션 전용 필드 (OFFICIAL)
  reviewCount?: number;
  qnaCount?: number;
  ageRanges?: AgeRange[];
  genderType?: GenderType;
  regionType?: string;
  placeType?: PlaceType;

  // 커스텀 미션 전용 필드 (CUSTOM)
  creatorId?: number;
  creatorNickname?: string;
  isChallenge?: boolean;   // 챌린지 미션 여부
  challengeDays?: number;  // 챌린지 기간 (일수) - 챌린지 미션일 때만
  deadlineDays?: number;   // 완료 기한 (일수) - 일반 미션일 때만
  durationDays?: number;
  isPublic?: boolean;
  participantCount?: number;
  completionCount?: number;
  createdAt?: string;
}

export interface MissionListResponse {
  content: Mission[];
  totalElements: number;
  totalPages: number;
  number: number;
}

// 하위 호환성을 위한 별칭
export type SystemMission = Mission;
export type CustomMission = Mission;
export type SystemMissionListResponse = MissionListResponse;
export type CustomMissionListResponse = MissionListResponse;

/**
 * 시스템 미션 목록 조회
 * GET /api/missions
 */
export const getSystemMissions = async (params?: {
  category?: MissionCategory;
  verificationType?: VerificationType;
  page?: number;
  size?: number;
}): Promise<ServiceResult<SystemMissionListResponse>> => {
  return apiClient.get<SystemMissionListResponse>(API_CONFIG.endpoints.mission.list, params);
};

/**
 * 사용자 맞춤 미션 목록 조회 (필터링)
 * GET /api/missions/filtered
 */
export const getFilteredSystemMissions = async (params?: {
  category?: MissionCategory;
  verificationType?: VerificationType;
  worryType?: WorryType;
  ageRange?: AgeRange;
  genderType?: GenderType;
  regionType?: string;
  difficultyLevel?: DifficultyLevel;
  page?: number;
  size?: number;
}): Promise<ServiceResult<SystemMissionListResponse>> => {
  return apiClient.get<SystemMissionListResponse>(API_CONFIG.endpoints.mission.filtered, params);
};

/**
 * 시스템 미션 상세 조회
 * GET /api/missions/{missionId}
 */
export const getSystemMission = async (
  missionId: number
): Promise<ServiceResult<SystemMission>> => {
  const endpoint = API_CONFIG.endpoints.mission.detail.replace(':missionId', String(missionId));
  return apiClient.get<SystemMission>(endpoint);
};

// ============================================
// 시스템 미션 리뷰
// ============================================

export interface MissionReview {
  id: number;
  userId: number;
  userNickname: string;
  userProfileImg?: string;
  content: string;
  rating?: number; // 1-5 별점
  createdAt: string;
}

export interface MissionReviewListResponse {
  content: MissionReview[];
  totalElements: number;
  totalPages: number;
  number: number;
}

/**
 * 미션 리뷰 목록 조회
 * GET /api/missions/{missionId}/reviews
 */
export const getMissionReviews = async (
  missionId: number,
  params?: { page?: number; size?: number }
): Promise<ServiceResult<MissionReviewListResponse>> => {
  const endpoint = API_CONFIG.endpoints.mission.reviews.replace(':missionId', String(missionId));
  return apiClient.get<MissionReviewListResponse>(endpoint, params);
};

/**
 * 미션 리뷰 작성
 * POST /api/missions/{missionId}/reviews
 * 인증 필요, 뱃지 필요
 */
export const createMissionReview = async (
  missionId: number,
  data: { content: string; rating?: number }
): Promise<ServiceResult<MissionReview>> => {
  const endpoint = API_CONFIG.endpoints.mission.createReview.replace(':missionId', String(missionId));
  // rating이 없으면 기본값 5 설정
  const requestData = {
    content: data.content,
    rating: data.rating ?? 5,
  };
  return apiClient.post<MissionReview>(endpoint, requestData);
};

// ============================================
// 시스템 미션 QnA
// ============================================

export interface MissionQnA {
  id: number;
  questionerId: number;
  questionerNickname: string;
  question: string;
  isResolved: boolean;
  answerCount: number;
  createdAt: string;
}

export interface MissionQnADetail extends MissionQnA {
  answers: MissionQnAAnswer[];
}

export interface MissionQnAAnswer {
  id: number;
  answererId: number;
  answererNickname: string;
  content: string;
  isAccepted: boolean;
  createdAt: string;
}

export interface MissionQnAListResponse {
  content: MissionQnA[];
  totalElements: number;
  totalPages: number;
  number: number;
}

/**
 * 미션 QnA 목록 조회
 * GET /api/missions/{missionId}/qna
 */
export const getMissionQnAs = async (
  missionId: number,
  params?: { page?: number; size?: number }
): Promise<ServiceResult<MissionQnAListResponse>> => {
  const endpoint = API_CONFIG.endpoints.mission.qnaList.replace(':missionId', String(missionId));
  return apiClient.get<MissionQnAListResponse>(endpoint, params);
};

/**
 * 미션 QnA 상세 조회
 * GET /api/missions/{missionId}/qna/{qnaId}
 */
export const getMissionQnADetail = async (
  missionId: number,
  qnaId: number
): Promise<ServiceResult<MissionQnADetail>> => {
  const endpoint = API_CONFIG.endpoints.mission.qnaDetail
    .replace(':missionId', String(missionId))
    .replace(':qnaId', String(qnaId));
  return apiClient.get<MissionQnADetail>(endpoint);
};

/**
 * 미션 QnA 질문 작성
 * POST /api/missions/{missionId}/qna
 * 인증 필요, 뱃지 불필요
 */
export const createMissionQuestion = async (
  missionId: number,
  data: { question: string }
): Promise<ServiceResult<MissionQnA>> => {
  const endpoint = API_CONFIG.endpoints.mission.createQuestion.replace(':missionId', String(missionId));
  return apiClient.post<MissionQnA>(endpoint, data);
};

/**
 * 미션 QnA 답변 작성
 * POST /api/missions/{missionId}/qna/{qnaId}/answers
 * 인증 필요, 뱃지 필요
 */
export const createMissionAnswer = async (
  missionId: number,
  qnaId: number,
  data: { content: string }
): Promise<ServiceResult<MissionQnAAnswer>> => {
  const endpoint = API_CONFIG.endpoints.mission.createAnswer
    .replace(':missionId', String(missionId))
    .replace(':qnaId', String(qnaId));
  return apiClient.post<MissionQnAAnswer>(endpoint, data);
};

/**
 * 미션 QnA 답변 채택
 * PUT /api/missions/{missionId}/qna/{qnaId}/answers/{answerId}/accept
 * 질문자만 가능
 */
export const acceptMissionAnswer = async (
  missionId: number,
  qnaId: number,
  answerId: number
): Promise<ServiceResult<{ id: number; qnaId: number; isAccepted: boolean; message: string }>> => {
  const endpoint = API_CONFIG.endpoints.mission.acceptAnswer
    .replace(':missionId', String(missionId))
    .replace(':qnaId', String(qnaId))
    .replace(':answerId', String(answerId));
  return apiClient.put(endpoint);
};

// ============================================
// 커스텀 미션 생성 요청
// ============================================

export interface CreateMissionRequest {
  title: string;
  description: string;
  category?: MissionCategory;
  verificationType: VerificationType;
  requiredMinutes?: number;
  expReward: number;
  badgeDurationDays: number;
  // 커스텀 미션 필드
  durationDays?: number;
  isPublic?: boolean;
  worryType?: WorryType;
  difficultyLevel?: DifficultyLevel;
  isChallenge?: boolean;   // 챌린지 미션 여부
  challengeDays?: number;  // 챌린지 기간 (일수) - 챌린지 미션일 때만
  deadlineDays?: number;   // 완료 기한 (일수) - 일반 미션일 때만
}

// 하위 호환성을 위한 별칭
export type CreateCustomMissionRequest = CreateMissionRequest;

/**
 * 커스텀 미션 목록 조회
 * GET /api/custom-missions
 */
export const getCustomMissions = async (params?: {
  verificationType?: VerificationType;
  page?: number;
  size?: number;
}): Promise<ServiceResult<MissionListResponse>> => {
  return apiClient.get<MissionListResponse>(API_CONFIG.endpoints.customMission.list, params);
};

/**
 * 커스텀 미션 상세 조회
 * GET /api/custom-missions/{customMissionId}
 */
export const getCustomMission = async (
  customMissionId: number
): Promise<ServiceResult<Mission>> => {
  const endpoint = API_CONFIG.endpoints.customMission.detail.replace(':customMissionId', String(customMissionId));
  return apiClient.get<Mission>(endpoint);
};

/**
 * 커스텀 미션 생성
 * POST /api/custom-missions
 * 인증 필요
 */
export const createCustomMission = async (
  data: CreateMissionRequest
): Promise<ServiceResult<Mission>> => {
  return apiClient.post<Mission>(API_CONFIG.endpoints.customMission.create, data);
};

/**
 * 커스텀 미션 수정
 * PUT /api/custom-missions/{customMissionId}
 * 생성자만 가능
 */
export const updateCustomMission = async (
  customMissionId: number,
  data: Partial<CreateMissionRequest>
): Promise<ServiceResult<Mission>> => {
  const endpoint = API_CONFIG.endpoints.customMission.update.replace(':customMissionId', String(customMissionId));
  return apiClient.put<Mission>(endpoint, data);
};

/**
 * 커스텀 미션 삭제
 * DELETE /api/custom-missions/{customMissionId}
 * 생성자만 가능
 */
export const deleteCustomMission = async (
  customMissionId: number
): Promise<ServiceResult<{ message: string }>> => {
  const endpoint = API_CONFIG.endpoints.customMission.delete.replace(':customMissionId', String(customMissionId));
  return apiClient.delete(endpoint);
};

// ============================================
// 내 미션 (UserMission)
// ============================================

export interface UserMission {
  id: number;
  missionType: MissionType; // OFFICIAL | CUSTOM
  mission?: Mission;  // 통합된 미션 (공식/커스텀 모두)
  // 하위 호환성을 위해 유지
  customMission?: Mission;
  assignedAt: string;
  dueDate: string;
  status: UserMissionStatus;
  completedAt?: string; // 완료 날짜 (ISO string)
  verification?: MissionVerification;
}

export interface UserMissionListResponse {
  content: UserMission[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface MissionVerification {
  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsDistanceMeters?: number;
  timeStartedAt?: string;
  timeEndedAt?: string;
  timeActualMinutes?: number;
  verifiedAt: string;
}

export interface VerifyMissionRequest {
  type: 'GPS' | 'TIME';
  latitude?: number;
  longitude?: number;
  startedAt?: string;
  endedAt?: string;
}

export interface VerifyMissionResponse {
  userMissionId: number;
  status: UserMissionStatus;
  verification: MissionVerification;
  rewards: {
    expEarned: number;
    badge?: {
      id: number;
      expiresAt: string;
    };
  };
  recommendation?: {
    id: number;
    recommendedUserId: number;
    recommendedUserNickname: string;
  };
}

/**
 * 내 미션 목록 조회
 * GET /api/missions/my
 * 인증 필요
 */
export const getUserMissions = async (params?: {
  status?: UserMissionStatus;
  missionType?: 'SYSTEM' | 'CUSTOM';
  page?: number;
  size?: number;
}): Promise<ServiceResult<UserMissionListResponse>> => {
  return apiClient.get<UserMissionListResponse>(API_CONFIG.endpoints.userMission.list, params);
};

/**
 * 내 미션 상세 조회
 * GET /api/missions/my/{userMissionId}
 * 인증 필요
 */
export const getUserMission = async (
  userMissionId: number
): Promise<ServiceResult<UserMission>> => {
  const endpoint = API_CONFIG.endpoints.userMission.detail.replace(':userMissionId', String(userMissionId));
  return apiClient.get<UserMission>(endpoint);
};

/**
 * 커스텀 미션 추가 (내 미션에)
 * POST /api/missions/my/custom
 * 인증 필요
 */
export const addCustomMissionToMyMissions = async (data: {
  customMissionId: number;
}): Promise<ServiceResult<UserMission>> => {
  return apiClient.post<UserMission>(API_CONFIG.endpoints.userMission.addCustom, data);
};

/**
 * 시스템 미션 추가 (내 미션에 할당)
 * POST /api/missions/my
 * 인증 필요
 */
export const addSystemMissionToMyMissions = async (data: {
  missionId: number;
}): Promise<ServiceResult<UserMission>> => {
  return apiClient.post<UserMission>(API_CONFIG.endpoints.userMission.add, data);
};

/**
 * 미션 인증 (GPS/TIME)
 * POST /api/missions/my/{userMissionId}/verify
 * 인증 필요
 */
export const verifyUserMission = async (
  userMissionId: number,
  data: VerifyMissionRequest
): Promise<ServiceResult<VerifyMissionResponse>> => {
  const endpoint = API_CONFIG.endpoints.userMission.verify.replace(':userMissionId', String(userMissionId));
  return apiClient.post<VerifyMissionResponse>(endpoint, data);
};

// ============================================
// 인증 게시판 (Verification)
// ============================================

export interface VerificationPost {
  id: number;
  userId: number;
  userNickname: string;
  userProfileImg?: string;
  userMissionId: number;
  missionType: MissionType; // OFFICIAL | CUSTOM
  mission?: {
    id: number;
    title: string;
    category?: MissionCategory;
  };
  // 하위 호환성을 위해 유지 (mission으로 통합됨)
  customMission?: {
    id: number;
    title: string;
  };
  missionTag?: {
    id: number;
    title: string;
    type: 'OFFICIAL' | 'CUSTOM';
  };
  title?: string; // API 응답에 직접 포함된 제목 필드 (missionTag.title과 동일)
  missionTitle?: string; // 하위 호환성을 위해 유지
  content: string;
  imageUrls: string[];
  status: VerificationStatus;
  approveCount?: number; // API 응답에는 likeCount로 올 수 있음
  likeCount?: number; // API 응답 필드명
  rejectCount?: number;
  commentCount: number;
  createdAt: string;
  myVote?: VoteType;
}

export interface VerificationPostListResponse {
  content: VerificationPost[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface CreateVerificationRequest {
  userMissionId: number;
  content: string;
  imageUrls: string[];
}

export interface VoteVerificationResponse {
  verificationId: number;
  vote: VoteType;
  approveCount: number;
  rejectCount: number;
  status: VerificationStatus;
  message: string;
}

/**
 * 인증글 목록 조회
 * GET /api/verifications
 */
export const getVerifications = async (params?: {
  status?: VerificationStatus;
  missionId?: number;
  customMissionId?: number;
  page?: number;
  size?: number;
}): Promise<ServiceResult<VerificationPostListResponse>> => {
  return apiClient.get<VerificationPostListResponse>(API_CONFIG.endpoints.verification.list, params);
};

/**
 * 인증글 상세 조회
 * GET /api/verifications/{verificationId}
 */
export const getVerification = async (
  verificationId: number
): Promise<ServiceResult<VerificationPost>> => {
  const endpoint = API_CONFIG.endpoints.verification.detail.replace(':verificationId', String(verificationId));
  return apiClient.get<VerificationPost>(endpoint);
};

/**
 * 인증글 작성
 * POST /api/verifications
 * 인증 필요
 */
export const createVerification = async (
  data: CreateVerificationRequest
): Promise<ServiceResult<VerificationPost>> => {
  return apiClient.post<VerificationPost>(API_CONFIG.endpoints.verification.create, data);
};

/**
 * 인증글 수정
 * PUT /api/verifications/{verificationId}
 * PENDING 상태만 가능
 */
export const updateVerification = async (
  verificationId: number,
  data: { content?: string; imageUrls?: string[] }
): Promise<ServiceResult<VerificationPost>> => {
  const endpoint = API_CONFIG.endpoints.verification.update.replace(':verificationId', String(verificationId));
  return apiClient.put<VerificationPost>(endpoint, data);
};

/**
 * 인증글 삭제
 * DELETE /api/verifications/{verificationId}
 * PENDING 상태만 가능
 */
export const deleteVerification = async (
  verificationId: number
): Promise<ServiceResult<{ message: string }>> => {
  const endpoint = API_CONFIG.endpoints.verification.delete.replace(':verificationId', String(verificationId));
  return apiClient.delete(endpoint);
};

/**
 * 인증 투표 (좋아요 API)
 * POST /api/verifications/{verificationId}/votes
 * 본인 글 투표 불가
 * 
 * 응답의 verified 필드를 확인하여 인증 완료 상태를 즉시 반영
 */
export const voteVerification = async (
  verificationId: number,
  data: { vote: VoteType }
): Promise<ServiceResult<VoteVerificationResponse>> => {
  // 인증글 좋아요 API 호출
  // 백엔드에서 좋아요 3개 이상 시 자동으로 status = "APPROVED"로 변경
  const endpoint = API_CONFIG.endpoints.verification.vote.replace(':verificationId', String(verificationId));
  const result = await apiClient.post<{ isLiked: boolean; likeCount: number; verified: boolean }>(
    endpoint
  );

  if (result.success && result.data) {
    // verified 필드 확인하여 인증 완료 여부 판단
    const isVerified = result.data.verified === true;
    const likeCount = result.data.likeCount;
    
    // 디버깅: 좋아요 수와 verified 상태 확인
    console.log('[voteVerification] 좋아요 응답:', {
      verificationId,
      likeCount,
      verified: isVerified,
      shouldBeApproved: likeCount >= 3,
    });
    
    // 좋아요가 3개 이상인데 verified가 false인 경우 경고
    if (likeCount >= 3 && !isVerified) {
      console.warn('[voteVerification] 좋아요 3개 이상인데 verified=false:', {
        verificationId,
        likeCount,
        verified: isVerified,
      });
    }
    
    // 좋아요 결과를 VoteVerificationResponse 형태로 변환
    return {
      success: true,
      data: {
        verificationId,
        vote: result.data.isLiked ? 'APPROVE' : 'REJECT',
        approveCount: likeCount,
        rejectCount: 0, // 좋아요 시스템에서는 reject count가 없음
        status: isVerified ? 'APPROVED' : 'PENDING',
        message: result.data.isLiked 
          ? (isVerified ? '좋아요를 눌렀습니다. 인증이 완료되었습니다!' : '좋아요를 눌렀습니다.')
          : '좋아요를 취소했습니다.',
      },
    };
  }

  return {
    success: false,
    error: result.error || '투표 처리에 실패했습니다.',
  };
};

// ============================================
// 인증 관련
// ============================================

export interface VerificationRequirements {
  verificationType: VerificationType;
  requiredMinutes?: number;
}

/**
 * 미션 인증 요구사항 조회
 * 미션의 인증 타입과 필요 조건 반환
 */
export const getVerificationRequirements = async (
  userMissionId: number
): Promise<ServiceResult<VerificationRequirements>> => {
  const endpoint = API_CONFIG.endpoints.userMission.detail.replace(':userMissionId', String(userMissionId));
  const result = await apiClient.get<UserMission>(endpoint);

  if (!result.success || !result.data) {
    return { success: false, error: result.error || '미션 정보를 가져올 수 없습니다.' };
  }

  const mission = result.data.mission || result.data.customMission;
  if (!mission) {
    return { success: false, error: '미션 정보가 없습니다.' };
  }

  return {
    success: true,
    data: {
      verificationType: mission.verificationType,
      requiredMinutes: mission.requiredMinutes,
    },
  };
};

/**
 * GPS로 미션 인증
 * userMissionId와 현재 위치로 인증
 */
export const verifyMissionByGPS = async (
  userMissionId: number,
  data: { location: { latitude: number; longitude: number }; timestamp: string }
): Promise<ServiceResult<VerifyMissionResponse>> => {
  const verifyRequest: VerifyMissionRequest = {
    type: 'GPS',
    latitude: data.location.latitude,
    longitude: data.location.longitude,
  };

  return verifyUserMission(userMissionId, verifyRequest);
};

/**
 * TIME으로 미션 인증
 * userMissionId와 시작/종료 시간으로 인증
 */
export const verifyMissionByTime = async (
  userMissionId: number,
  data: { startedAt: string; endedAt: string }
): Promise<ServiceResult<VerifyMissionResponse>> => {
  const verifyRequest: VerifyMissionRequest = {
    type: 'TIME',
    startedAt: data.startedAt,
    endedAt: data.endedAt,
  };

  return verifyUserMission(userMissionId, verifyRequest);
};

// ============================================
// 새로운 인증 API (/verifications/gps, /verifications/time)
// ============================================

export interface GpsVerifyResponse {
  success: boolean;
  message: string;
  expReward: number;
}

export interface TimeVerifyResponse {
  success: boolean;
  message: string;
  expReward: number;
}

/**
 * GPS 인증 (백엔드 /api/verifications/gps)
 * POST /api/verifications/gps
 */
export const verifyByGps = async (
  userMissionId: number,
  latitude: number,
  longitude: number
): Promise<ServiceResult<GpsVerifyResponse>> => {
  return apiClient.post<GpsVerifyResponse>(API_CONFIG.endpoints.verification.gps, {
    userMissionId,
    latitude,
    longitude,
  });
};

/**
 * 시간 인증 (백엔드 /api/verifications/time)
 * POST /api/verifications/time
 */
export const verifyByTime = async (
  userMissionId: number
): Promise<ServiceResult<TimeVerifyResponse>> => {
  return apiClient.post<TimeVerifyResponse>(API_CONFIG.endpoints.verification.time, {
    userMissionId,
  });
};

// ============================================
// 인증글 댓글 API
// ============================================

export interface VerificationComment {
  comment_id: string;
  author: string;
  author_nickname: string;
  content: string;
  created_at: string;
  updated_at?: string;
  parent_comment_id?: string;
  replies?: VerificationComment[];
}

export interface VerificationCommentListResponse {
  content: VerificationComment[];
  totalElements: number;
  totalPages: number;
  number: number;
}

// 백엔드 CommentResponse 타입
interface BackendCommentResponse {
  id: number;
  userId: number;
  userNickname: string;
  userProfileImg?: string;
  content: string;
  parentId?: number;
  replies?: BackendCommentResponse[];
  replyCount: number;
  createdAt: string;
  updatedAt?: string;
}

// 백엔드 응답을 프론트엔드 형식으로 변환
const transformComment = (comment: BackendCommentResponse): VerificationComment => ({
  comment_id: String(comment.id),
  author: String(comment.userId),
  author_nickname: comment.userNickname,
  content: comment.content,
  created_at: comment.createdAt,
  updated_at: comment.updatedAt,
  parent_comment_id: comment.parentId ? String(comment.parentId) : undefined,
  replies: comment.replies?.map(transformComment),
});

/**
 * 인증글 댓글 목록 조회
 * GET /api/verifications/{verificationId}/comments
 */
export const getVerificationComments = async (
  verificationId: number,
  page: number = 0,
  size: number = 20
): Promise<ServiceResult<VerificationCommentListResponse>> => {
  const endpoint = `/verifications/${verificationId}/comments?page=${page}&size=${size}`;
  const result = await apiClient.get<{
    content: BackendCommentResponse[];
    totalElements: number;
    totalPages: number;
    number: number;
  }>(endpoint);

  if (result.success && result.data) {
    return {
      success: true,
      data: {
        content: result.data.content.map(transformComment),
        totalElements: result.data.totalElements,
        totalPages: result.data.totalPages,
        number: result.data.number,
      },
    };
  }
  return { success: false, error: result.error };
};

/**
 * 인증글 댓글 작성
 * POST /api/verifications/{verificationId}/comments
 */
export const createVerificationComment = async (
  verificationId: number,
  content: string,
  parentId?: string
): Promise<ServiceResult<VerificationComment>> => {
  const endpoint = `/verifications/${verificationId}/comments`;
  const result = await apiClient.post<BackendCommentResponse>(endpoint, {
    content,
    parentId: parentId ? Number(parentId) : undefined,
  });

  if (result.success && result.data) {
    return { success: true, data: transformComment(result.data) };
  }
  return { success: false, error: result.error };
};

/**
 * 인증글 댓글 수정
 * PUT /api/verifications/{verificationId}/comments/{commentId}
 */
export const updateVerificationComment = async (
  verificationId: number,
  commentId: string,
  content: string
): Promise<ServiceResult<VerificationComment>> => {
  const endpoint = `/verifications/${verificationId}/comments/${commentId}`;
  const result = await apiClient.put<BackendCommentResponse>(endpoint, { content });

  if (result.success && result.data) {
    return { success: true, data: transformComment(result.data) };
  }
  return { success: false, error: result.error };
};

/**
 * 인증글 댓글 삭제
 * DELETE /api/verifications/{verificationId}/comments/{commentId}
 */
export const deleteVerificationComment = async (
  verificationId: number,
  commentId: string
): Promise<ServiceResult<{ message: string }>> => {
  const endpoint = `/verifications/${verificationId}/comments/${commentId}`;
  return apiClient.delete(endpoint);
};

/**
 * 인증글 댓글 수 조회
 * GET /api/verifications/{verificationId}/comments/count
 */
export const getVerificationCommentCount = async (
  verificationId: number
): Promise<ServiceResult<{ count: number }>> => {
  const endpoint = `/verifications/${verificationId}/comments/count`;
  return apiClient.get<{ count: number }>(endpoint);
};

// ============================================
// 미션 그룹 (같은 미션 수행자 게시판)
// ============================================

export interface MissionGroup {
  mission_id: string;
  mission_title: string;
  mission_description: string;
  mission_emoji: string;
  member_count: number;
  post_count: number;
  verification_type: string;
}

export interface MissionGroupPost {
  post_id: string;
  user_id: string;
  user_nickname: string;
  user_profile_img?: string;
  title: string;
  content: string;
  image_urls: string[];
  created_at: string;
  comment_count: number;
  like_count: number;
}

/**
 * 내가 완료한 미션 그룹 목록 조회
 * GET /api/user-missions/groups
 */
export const getMissionGroups = async (): Promise<ServiceResult<MissionGroup[]>> => {
  // 완료된 미션 목록 조회
  const result = await getUserMissions({ status: 'COMPLETED' });

  if (!result.success || !result.data) {
    return { success: false, error: result.error || '미션 그룹을 불러올 수 없습니다.' };
  }

  // 미션별로 그룹화
  const groupMap = new Map<string, MissionGroup>();

  for (const userMission of result.data.content) {
    const mission = userMission.mission || userMission.customMission;
    if (!mission) continue;

    const missionId = String(mission.id);
    const existing = groupMap.get(missionId);

    if (existing) {
      existing.member_count++;
    } else {
      groupMap.set(missionId, {
        mission_id: missionId,
        mission_title: mission.title,
        mission_description: mission.description || '',
        mission_emoji: getMissionEmoji(mission.title),
        member_count: 1,
        post_count: 0, // 서버에서 별도 조회 필요
        verification_type: mission.verificationType || 'COMMUNITY',
      });
    }
  }

  return { success: true, data: Array.from(groupMap.values()) };
};

/**
 * 특정 미션의 게시글 조회
 * GET /api/posts?missionId={missionId}
 */
export const getPostsByMission = async (
  missionId: string
): Promise<ServiceResult<MissionGroupPost[]>> => {
  const { getPosts } = await import('./communityApi');
  const result = await getPosts({ missionId: Number(missionId) });

  if (!result.success || !result.data) {
    return { success: false, error: result.error || '게시글을 불러올 수 없습니다.' };
  }

  const posts: MissionGroupPost[] = result.data.content.map(post => ({
    post_id: String(post.id),
    user_id: String(post.userId),
    user_nickname: post.userNickname,
    user_profile_img: post.userProfileImg,
    title: post.title,
    content: post.content,
    image_urls: post.imageUrls,
    created_at: post.createdAt,
    comment_count: post.commentCount,
    like_count: 0, // 게시글에는 좋아요 기능이 없음
  }));

  return { success: true, data: posts };
};

/**
 * 미션 제목으로 이모지 반환
 */
function getMissionEmoji(title: string): string {
  if (title.includes('운동') || title.includes('헬스') || title.includes('걷기')) return '🏃';
  if (title.includes('독서') || title.includes('책')) return '📚';
  if (title.includes('물') || title.includes('마시')) return '💧';
  if (title.includes('명상') || title.includes('휴식')) return '🧘';
  if (title.includes('아침') || title.includes('기상')) return '🌅';
  if (title.includes('영어') || title.includes('단어') || title.includes('외국어')) return '📝';
  if (title.includes('잠') || title.includes('수면')) return '😴';
  if (title.includes('식사') || title.includes('밥')) return '🍽️';
  if (title.includes('저축') || title.includes('돈')) return '💰';
  if (title.includes('공부')) return '📖';
  return '🎯';
}

/**
 * 인증 상태 확인
 * 미션 ID로 해당 미션의 인증글 상태 확인
 */
export const checkVerificationStatus = async (
  missionId: string
): Promise<ServiceResult<{ verified: boolean; status?: VerificationStatus }>> => {
  try {
    const result = await getVerifications({ missionId: Number(missionId) });

    if (!result.success || !result.data) {
      return { success: false, error: result.error || '인증 상태를 확인할 수 없습니다.' };
    }

    const verifications = result.data.content;
    if (!verifications || verifications.length === 0) {
      return { success: true, data: { verified: false } };
    }

    // 가장 최근 인증글의 상태 확인
    const latestVerification = verifications[0];
    if (!latestVerification) {
      return { success: true, data: { verified: false } };
    }

    return {
      success: true,
      data: {
        verified: latestVerification.status === 'APPROVED',
        status: latestVerification.status,
      },
    };
  } catch (error) {
    return { success: false, error: '인증 상태 확인 중 오류가 발생했습니다.' };
  }
};

// ============================================
// 기상 미션 API (Wakeup Mission)
// ============================================

export type WakeupTimeSlot = 'SLOT_6_8' | 'SLOT_8_10' | 'SLOT_10_12';

export interface WakeupMissionSetting {
  id: number;
  userId: number;
  timeSlot: WakeupTimeSlot;
  weekNumber: number;
  year: number;
  createdAt: string;
}

export interface WakeupMissionSettingRequest {
  timeSlot: WakeupTimeSlot;
}

export interface NextWeekSetupInfo {
  weekNumber: number;
  year: number;
  isAlreadySet: boolean;
  currentSetting?: WakeupMissionSetting;
  availableTimeSlots: WakeupTimeSlot[];
}

export interface WakeupVerificationResult {
  canVerify: boolean;
  currentTimeSlot?: WakeupTimeSlot;
  settingTimeSlot?: WakeupTimeSlot;
  message: string;
  userMissionId?: number; // 자동으로 찾은 userMissionId
  assignedAt?: string; // 할당 시간
}

/**
 * 현재 활성화된 기상 미션 조회
 * GET /api/missions/my/wakeup/current
 * 인증 필요
 */
export interface WakeupCurrentMissionResponse {
  userMissionId: number;
  assignedAt: string;
  timeRemaining: number; // 초 단위
  canVerify: boolean;
  message?: string;
}

export const getCurrentWakeupMission = async (): Promise<ServiceResult<WakeupCurrentMissionResponse>> => {
  return apiClient.get<WakeupCurrentMissionResponse>(API_CONFIG.endpoints.userMission.wakeupCurrent);
};

/**
 * 기상 미션 시간대 설정
 * POST /api/missions/my/wakeup/settings
 * 인증 필요
 */
export const setWakeupTime = async (
  data: WakeupMissionSettingRequest
): Promise<ServiceResult<WakeupMissionSetting>> => {
  return apiClient.post<WakeupMissionSetting>(API_CONFIG.endpoints.userMission.wakeupSettings, data);
};

/**
 * 기상 미션 시간대 수정
 * PUT /api/missions/my/wakeup/settings/{settingId}
 * 인증 필요
 */
export const updateWakeupTime = async (
  settingId: number,
  timeSlot: WakeupTimeSlot
): Promise<ServiceResult<WakeupMissionSetting>> => {
  const endpoint = API_CONFIG.endpoints.userMission.wakeupSettingDetail.replace(':settingId', String(settingId));
  return apiClient.put<WakeupMissionSetting>(endpoint, null, { timeSlot });
};

/**
 * 현재 주차 기상 미션 설정 조회
 * GET /api/missions/my/wakeup/settings/current
 * 인증 필요
 */
export const getCurrentWeekWakeupSetting = async (): Promise<ServiceResult<WakeupMissionSetting>> => {
  return apiClient.get<WakeupMissionSetting>(API_CONFIG.endpoints.userMission.wakeupCurrentWeek);
};

/**
 * 특정 주차 기상 미션 설정 조회
 * GET /api/missions/my/wakeup/settings?weekNumber=&year=
 * 인증 필요
 */
export const getWeekWakeupSetting = async (
  weekNumber: number,
  year: number
): Promise<ServiceResult<WakeupMissionSetting>> => {
  return apiClient.get<WakeupMissionSetting>(API_CONFIG.endpoints.userMission.wakeupSettings, { weekNumber, year });
};

/**
 * 다음 주차 기상 미션 설정 정보
 * GET /api/missions/my/wakeup/settings/next-week-info
 * 인증 필요
 */
export const getNextWeekSetupInfo = async (): Promise<ServiceResult<NextWeekSetupInfo>> => {
  return apiClient.get<NextWeekSetupInfo>(API_CONFIG.endpoints.userMission.wakeupNextWeekInfo);
};

/**
 * 기상 미션 인증 시간 확인
 * GET /api/missions/my/wakeup/verify-time
 * GET /api/missions/my/wakeup/verify-time?userMissionId=177
 * 인증 필요
 * @param userMissionId - 선택적 파라미터. 제공되지 않으면 자동으로 찾음
 */
export const verifyWakeupTime = async (userMissionId?: number): Promise<ServiceResult<WakeupVerificationResult>> => {
  const params = userMissionId ? { userMissionId } : undefined;
  return apiClient.get<WakeupVerificationResult>(API_CONFIG.endpoints.userMission.wakeupVerifyTime, params);
};

/**
 * 미션 수행 이력 조회
 * GET /api/missions/my/history
 * 인증 필요
 */
export const getMissionHistory = async (params?: {
  page?: number;
  size?: number;
}): Promise<ServiceResult<UserMissionListResponse>> => {
  return apiClient.get<UserMissionListResponse>(API_CONFIG.endpoints.userMission.history, params);
};

// ============================================
// 캘린더용 미션 조회
// ============================================

/**
 * 특정 날짜의 미션 조회 (캘린더용)
 * GET /api/missions/my/calendar/date?date=2026-01-17
 * 인증 필요
 * 특정 날짜에 할당된 모든 미션 조회 (완료 여부 무관)
 * assignedAt이 해당 날짜인 미션 반환
 * 상태: ASSIGNED, PENDING, COMPLETED 모두 포함
 */
export const getMissionsByDate = async (
  date: string // YYYY-MM-DD 형식
): Promise<ServiceResult<UserMission[]>> => {
  return apiClient.get<UserMission[]>(API_CONFIG.endpoints.userMission.calendarDate, { date });
};

/**
 * 날짜 범위의 미션 조회 (월별 캘린더용)
 * GET /api/missions/my/calendar/range?startDate=2026-01-01&endDate=2026-01-31
 * 인증 필요
 * 기간 내 할당된 모든 미션 반환 (완료 여부 무관)
 * assignedAt 기준으로 조회
 */
export const getMissionsByRange = async (
  startDate: string, // YYYY-MM-DD 형식
  endDate: string    // YYYY-MM-DD 형식
): Promise<ServiceResult<UserMission[]>> => {
  return apiClient.get<UserMission[]>(API_CONFIG.endpoints.userMission.calendarRange, {
    startDate,
    endDate,
  });
};

// ============================================
// 돌발 미션 설정
// ============================================

export interface SpontaneousMissionSetupRequest {
  sleepTime: string; // "HH:mm" 형식
  wakeTime: string; // "HH:mm" 형식
  breakfastTime: string; // "HH:mm" 형식
  lunchTime: string; // "HH:mm" 형식
  dinnerTime: string; // "HH:mm" 형식
}

export interface SpontaneousMissionSetupResponse {
  isSpontaneousMissionSetupCompleted: boolean;
  sleepTime: string;
  wakeTime: string;
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
}

/**
 * 돌발 미션 설정 조회
 * GET /api/spontaneous-missions/setup
 * 인증 필요
 */
export const getSpontaneousMissionSetup = async (): Promise<ServiceResult<SpontaneousMissionSetupResponse>> => {
  return apiClient.get<SpontaneousMissionSetupResponse>(API_CONFIG.endpoints.spontaneousMission.setup);
};

/**
 * 돌발 미션 설정 제출
 * POST /api/spontaneous-missions/setup
 * 인증 필요
 */
export const setupSpontaneousMission = async (
  data: SpontaneousMissionSetupRequest
): Promise<ServiceResult<SpontaneousMissionSetupResponse>> => {
  return apiClient.post<SpontaneousMissionSetupResponse>(API_CONFIG.endpoints.spontaneousMission.setup, data);
};

/**
 * 돌발 미션 설정 수정
 * PUT /api/spontaneous-missions/setup
 * 인증 필요
 */
export const updateSpontaneousMissionSetup = async (
  data: SpontaneousMissionSetupRequest
): Promise<ServiceResult<SpontaneousMissionSetupResponse>> => {
  return apiClient.put<SpontaneousMissionSetupResponse>(API_CONFIG.endpoints.spontaneousMission.setup, data);
};
