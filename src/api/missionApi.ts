/**
 * 미션 관련 API 인터페이스
 * Mission (시스템 미션), CustomMission, UserMission, Verification 포함
 */

import { apiClient } from './client';
import { API_CONFIG } from '../config/apiConfig';
import { ServiceResult } from '../types';

// ============================================
// 타입 정의
// ============================================

export type MissionType = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type VerificationType = 'COMMUNITY' | 'GPS' | 'TIME';
export type UserMissionStatus = 'ASSIGNED' | 'PENDING' | 'COMPLETED' | 'EXPIRED';
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type VoteType = 'APPROVE' | 'REJECT';

// 사용자 맞춤 필터링 타입
export type WorryType = 'RE_EMPLOYMENT' | 'JOB_PREPARATION' | 'ENTRANCE_EXAM' | 'ADVANCEMENT' | 'RETURN_TO_SCHOOL' | 'RELATIONSHIP' | 'SELF_MANAGEMENT';
export type AgeRange = 'LATE_TEENS' | 'EARLY_TWENTIES' | 'MID_TWENTIES' | 'LATE_TWENTIES' | 'EARLY_THIRTIES' | 'MID_THIRTIES' | 'LATE_THIRTIES' | 'FORTIES_PLUS';
export type GenderType = 'MALE' | 'FEMALE' | 'ALL';
export type DifficultyLevel = 'LEVEL1' | 'LEVEL2' | 'LEVEL3';
export type PlaceType = 'HOME' | 'OUTDOOR' | 'INDOOR';

// ============================================
// 시스템 미션 (Mission)
// ============================================

export interface SystemMission {
  id: number;
  title: string;
  description: string;
  type: MissionType;
  verificationType: VerificationType;
  requiredMinutes?: number;
  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsRadiusMeters?: number;
  expReward: number;
  badgeDurationDays: number;
  reviewCount?: number;
  qnaCount?: number;
  // 사용자 맞춤 필드
  worryType?: WorryType;
  ageRanges?: AgeRange[];
  genderType?: GenderType;
  regionType?: string;
  placeType?: PlaceType;
  difficultyLevel?: DifficultyLevel;
}

export interface SystemMissionListResponse {
  content: SystemMission[];
  totalElements: number;
  totalPages: number;
  number: number;
}

/**
 * 시스템 미션 목록 조회
 * GET /api/missions
 */
export const getSystemMissions = async (params?: {
  type?: MissionType;
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
  type?: MissionType;
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
  data: { content: string }
): Promise<ServiceResult<MissionReview>> => {
  const endpoint = API_CONFIG.endpoints.mission.createReview.replace(':missionId', String(missionId));
  return apiClient.post<MissionReview>(endpoint, data);
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
// 커스텀 미션 (CustomMission)
// ============================================

export interface CustomMission {
  id: number;
  title: string;
  description: string;
  creatorId: number;
  creatorNickname: string;
  durationDays: number;
  isPublic: boolean;
  verificationType: VerificationType;
  requiredMinutes?: number;
  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsRadiusMeters?: number;
  expReward: number;
  badgeDurationDays: number;
  participantCount?: number;
  completionCount?: number;
  createdAt: string;
}

export interface CustomMissionListResponse {
  content: CustomMission[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface CreateCustomMissionRequest {
  title: string;
  description: string;
  durationDays: number;
  isPublic: boolean;
  verificationType: VerificationType;
  requiredMinutes?: number;
  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsRadiusMeters?: number;
  expReward: number;
  badgeDurationDays: number;
}

/**
 * 커스텀 미션 목록 조회
 * GET /api/custom-missions
 */
export const getCustomMissions = async (params?: {
  verificationType?: VerificationType;
  page?: number;
  size?: number;
}): Promise<ServiceResult<CustomMissionListResponse>> => {
  return apiClient.get<CustomMissionListResponse>(API_CONFIG.endpoints.customMission.list, params);
};

/**
 * 커스텀 미션 상세 조회
 * GET /api/custom-missions/{customMissionId}
 */
export const getCustomMission = async (
  customMissionId: number
): Promise<ServiceResult<CustomMission>> => {
  const endpoint = API_CONFIG.endpoints.customMission.detail.replace(':customMissionId', String(customMissionId));
  return apiClient.get<CustomMission>(endpoint);
};

/**
 * 커스텀 미션 생성
 * POST /api/custom-missions
 * 인증 필요
 */
export const createCustomMission = async (
  data: CreateCustomMissionRequest
): Promise<ServiceResult<CustomMission>> => {
  return apiClient.post<CustomMission>(API_CONFIG.endpoints.customMission.create, data);
};

/**
 * 커스텀 미션 수정
 * PUT /api/custom-missions/{customMissionId}
 * 생성자만 가능
 */
export const updateCustomMission = async (
  customMissionId: number,
  data: Partial<CreateCustomMissionRequest>
): Promise<ServiceResult<CustomMission>> => {
  const endpoint = API_CONFIG.endpoints.customMission.update.replace(':customMissionId', String(customMissionId));
  return apiClient.put<CustomMission>(endpoint, data);
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
  missionType: 'SYSTEM' | 'CUSTOM';
  mission?: SystemMission;
  customMission?: CustomMission;
  assignedAt: string;
  dueDate: string;
  status: UserMissionStatus;
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
 * GET /api/user-missions
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
 * GET /api/user-missions/{userMissionId}
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
 * POST /api/user-missions
 * 인증 필요
 */
export const addCustomMissionToMyMissions = async (data: {
  customMissionId: number;
}): Promise<ServiceResult<UserMission>> => {
  return apiClient.post<UserMission>(API_CONFIG.endpoints.userMission.add, data);
};

/**
 * 미션 인증 (GPS/TIME)
 * POST /api/user-missions/{userMissionId}/verify
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
  missionType: 'SYSTEM' | 'CUSTOM';
  mission?: {
    id: number;
    title: string;
    type?: MissionType;
  };
  missionTitle: string;
  content: string;
  imageUrls: string[];
  status: VerificationStatus;
  approveCount: number;
  rejectCount: number;
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
 * 인증 투표
 * POST /api/verifications/{verificationId}/votes
 * 본인 글 투표 불가
 */
export const voteVerification = async (
  verificationId: number,
  data: { vote: VoteType }
): Promise<ServiceResult<VoteVerificationResponse>> => {
  const endpoint = API_CONFIG.endpoints.verification.vote.replace(':verificationId', String(verificationId));
  return apiClient.post<VoteVerificationResponse>(endpoint, data);
};

// ============================================
// GPS 인증 관련
// ============================================

export interface VerificationRequirements {
  verificationType: VerificationType;
  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsRadiusMeters?: number;
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
      gpsLatitude: mission.gpsLatitude,
      gpsLongitude: mission.gpsLongitude,
      gpsRadiusMeters: mission.gpsRadiusMeters,
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

// ============================================
// 직접 인증 API (GPS/시간)
// ============================================

export interface DirectVerificationResponse {
  success: boolean;
  message: string;
  expReward: number;
}

/**
 * GPS 직접 인증
 * POST /api/verifications/gps
 */
export const verifyByGps = async (
  userMissionId: number,
  latitude: number,
  longitude: number
): Promise<ServiceResult<DirectVerificationResponse>> => {
  return apiClient.post<DirectVerificationResponse>(API_CONFIG.endpoints.verification.gps, {
    userMissionId,
    latitude,
    longitude,
  });
};

/**
 * 시간 직접 인증
 * POST /api/verifications/time
 */
export const verifyByTime = async (
  userMissionId: number
): Promise<ServiceResult<DirectVerificationResponse>> => {
  return apiClient.post<DirectVerificationResponse>(API_CONFIG.endpoints.verification.time, {
    userMissionId,
  });
};

// ============================================
// 파일 업로드 (S3)
// ============================================

export interface UploadedFileInfo {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  contentType: string;
}

/**
 * 파일 업로드 (S3)
 * POST /api/files/upload
 * 인증 필요
 */
export const uploadFile = async (
  file: { uri: string; name: string; type: string }
): Promise<ServiceResult<UploadedFileInfo>> => {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any);

  return apiClient.upload<UploadedFileInfo>(API_CONFIG.endpoints.file.upload, formData);
};

/**
 * 파일 삭제 (S3)
 * DELETE /api/files/{fileName}
 * 인증 필요
 */
export const deleteFile = async (
  fileName: string
): Promise<ServiceResult<{ message: string }>> => {
  const endpoint = API_CONFIG.endpoints.file.delete.replace(':fileName', fileName);
  return apiClient.delete(endpoint);
};
