/**
 * 알림 API 인터페이스
 */

import { apiClient } from './client';
import { API_CONFIG } from '../config/apiConfig';
import { ServiceResult } from '../types';

// ============================================
// 타입 정의 (백엔드 NotificationType enum과 동기화)
// ============================================

/**
 * 알림 타입 - 백엔드 NotificationType enum과 일치
 * @see Replant-BE/domain/notification/enums/NotificationType.java
 */
export type NotificationType =
  // 미션 관련
  | 'MISSION_ASSIGNED'       // 미션 배정
  // 댓글 관련
  | 'COMMENT'                // 일반 게시글 댓글
  | 'REPLY'                  // 일반 게시글 대댓글
  | 'VERIFICATION_COMMENT'   // 인증글 댓글
  | 'VERIFICATION_REPLY'     // 인증글 대댓글
  // 인증 관련
  | 'VERIFICATION_APPROVED'  // 인증 승인
  | 'VERIFICATION_REJECTED'  // 인증 거절
  | 'VOTE'                   // 투표
  // 기타
  | 'DIARY'                  // 다이어리
  | 'REPORT'                 // 신고
  | 'RECOMMENDATION'         // 추천 (구: USER_RECOMMENDED)
  | 'CHAT_MESSAGE'           // 채팅 메시지
  | 'SYSTEM'                 // 시스템 알림
  | 'CUSTOM'                 // 커스텀 알림
  // 프론트엔드 전용 (레거시 호환)
  | 'BADGE_EXPIRING'         // 배지 만료 예정
  | 'QNA_ANSWERED'           // QnA 답변
  | 'QNA_ACCEPTED';          // QnA 채택

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  content: string;
  referenceType?: string;
  referenceId?: number;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  content: Notification[];
  totalElements: number;
  totalPages: number;
  number: number;
  unreadCount: number;
}

export interface ReadNotificationResponse {
  id: number;
  isRead: boolean;
  message: string;
}

export interface ReadAllNotificationsResponse {
  readCount: number;
  message: string;
}

export interface RegisterFcmTokenRequest {
  fcmToken: string;
}

export interface RegisterFcmTokenResponse {
  message: string;
}

// ============================================
// 알림 API
// ============================================

/**
 * 알림 목록 조회
 * GET /api/notifications
 * 인증 필요
 */
export const getNotifications = async (params?: {
  isRead?: boolean;
  page?: number;
  size?: number;
}): Promise<ServiceResult<NotificationListResponse>> => {
  return apiClient.get<NotificationListResponse>(API_CONFIG.endpoints.notification.list, params);
};

/**
 * 알림 읽음 처리
 * PUT /api/notifications/{notificationId}/read
 * 인증 필요
 */
export const markNotificationAsRead = async (
  notificationId: number
): Promise<ServiceResult<ReadNotificationResponse>> => {
  const endpoint = API_CONFIG.endpoints.notification.read.replace(
    ':notificationId',
    String(notificationId)
  );
  return apiClient.put<ReadNotificationResponse>(endpoint);
};

/**
 * 전체 알림 읽음 처리
 * PUT /api/notifications/read-all
 * 인증 필요
 */
export const markAllNotificationsAsRead = async (): Promise<
  ServiceResult<ReadAllNotificationsResponse>
> => {
  return apiClient.put<ReadAllNotificationsResponse>(API_CONFIG.endpoints.notification.readAll);
};

/**
 * 알림 삭제
 * DELETE /api/notifications/{notificationId}
 * 인증 필요
 */
export const deleteNotification = async (
  notificationId: number
): Promise<ServiceResult<{ message: string }>> => {
  const endpoint = API_CONFIG.endpoints.notification.delete.replace(
    ':notificationId',
    String(notificationId)
  );
  return apiClient.delete<{ message: string }>(endpoint);
};

/**
 * FCM 토큰 등록
 * POST /api/notifications/fcm/token
 * 인증 필요
 */
export const registerFcmToken = async (
  fcmToken: string
): Promise<ServiceResult<RegisterFcmTokenResponse>> => {
  return apiClient.post<RegisterFcmTokenResponse>(
    API_CONFIG.endpoints.notification.registerFcmToken,
    { fcmToken }
  );
};
