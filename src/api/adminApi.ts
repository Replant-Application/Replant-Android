/**
 * 관리자 API 인터페이스
 * 관리자 권한이 필요한 기능
 */

import { apiClient } from './client';
import { API_CONFIG } from '../config/apiConfig';
import { ServiceResult } from '../types';

// ============================================
// 타입 정의
// ============================================

/**
 * 회원 정보
 */
export interface Member {
  id: number;
  email: string;
  nickname: string;
  birthDate?: string;
  gender?: 'MALE' | 'FEMALE';
  profileImg?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

/**
 * 회원 목록 응답
 */
export interface MemberListResponse {
  content: Member[];
  totalElements: number;
  totalPages: number;
  number: number;
}

/**
 * 회원 상세 정보
 */
export interface MemberDetail extends Member {
  reant?: {
    id: number;
    name: string;
    level: number;
    exp: number;
  };
  statistics: {
    totalMissions: number;
    completedMissions: number;
    activeBadges: number;
    totalPosts: number;
  };
}

/**
 * 카드 정보
 */
export interface Card {
  id: number;
  cardNumber: string;
  cardType: string;
  issuer: string;
  holderName: string;
  createdAt: string;
}

/**
 * 카드 목록 응답
 */
export interface CardListResponse {
  cards: Card[];
  totalCount: number;
}

/**
 * 커스텀 알림 전송 요청
 */
export interface SendCustomNotificationRequest {
  userId: number;
  title: string;
  content: string;
  referenceType?: string;
  referenceId?: number;
}

/**
 * 일기 알림 전송 요청
 */
export interface SendDiaryNotificationRequest {
  userId: number;
}

/**
 * 리포트 알림 전송 요청
 */
export interface SendReportNotificationRequest {
  userId: number;
}

/**
 * 알림 전송 응답
 */
export interface SendNotificationResponse {
  notificationId: number;
  userId: number;
  message: string;
}

// ============================================
// 회원 관리 API
// ============================================

/**
 * 전체 회원 조회
 * GET /admin/members
 * 관리자 권한 필요
 */
export const getMembers = async (params?: {
  page?: number;
  size?: number;
  role?: string;
  isActive?: boolean;
}): Promise<ServiceResult<MemberListResponse>> => {
  return apiClient.get<MemberListResponse>(API_CONFIG.endpoints.admin.members, params);
};

/**
 * 특정 회원 상세 조회
 * GET /admin/members/{memberId}
 * 관리자 권한 필요
 *
 * @param memberId 회원 ID
 */
export const getMemberDetail = async (
  memberId: number
): Promise<ServiceResult<MemberDetail>> => {
  const endpoint = API_CONFIG.endpoints.admin.memberDetail.replace(
    ':memberId',
    String(memberId)
  );
  return apiClient.get<MemberDetail>(endpoint);
};

// ============================================
// 카드 관리 API
// ============================================

/**
 * 전체 카드 조회
 * GET /admin/card
 * 관리자 권한 필요
 */
export const getCards = async (): Promise<ServiceResult<CardListResponse>> => {
  return apiClient.get<CardListResponse>(API_CONFIG.endpoints.admin.cards);
};

// ============================================
// 알림 전송 API
// ============================================

/**
 * 특정 사용자에게 커스텀 알림 전송
 * POST /admin/send/custom
 * 관리자 권한 필요
 *
 * @param data 알림 데이터
 */
export const sendCustomNotification = async (
  data: SendCustomNotificationRequest
): Promise<ServiceResult<SendNotificationResponse>> => {
  return apiClient.post<SendNotificationResponse>(
    API_CONFIG.endpoints.admin.sendCustomNotification,
    data
  );
};

/**
 * 특정 사용자에게 일기 알림 전송
 * POST /admin/send/diary
 * 관리자 권한 필요
 *
 * @param data 사용자 ID
 */
export const sendDiaryNotification = async (
  data: SendDiaryNotificationRequest
): Promise<ServiceResult<SendNotificationResponse>> => {
  return apiClient.post<SendNotificationResponse>(
    API_CONFIG.endpoints.admin.sendDiaryNotification,
    data
  );
};

/**
 * 특정 사용자에게 리포트 알림 전송
 * POST /admin/send/report
 * 관리자 권한 필요
 *
 * @param data 사용자 ID
 */
export const sendReportNotification = async (
  data: SendReportNotificationRequest
): Promise<ServiceResult<SendNotificationResponse>> => {
  return apiClient.post<SendNotificationResponse>(
    API_CONFIG.endpoints.admin.sendReportNotification,
    data
  );
};
