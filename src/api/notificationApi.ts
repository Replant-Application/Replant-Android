/**
 * 알림 API 인터페이스
 */

import { apiClient } from './client';
import { API_CONFIG } from '../config/apiConfig';
import { ServiceResult } from '../types';

// ============================================
// 타입 정의
// ============================================

export type NotificationType =
  | 'MISSION_ASSIGNED'
  | 'VERIFICATION_APPROVED'
  | 'VERIFICATION_REJECTED'
  | 'USER_RECOMMENDED'
  | 'CHAT_MESSAGE'
  | 'BADGE_EXPIRING'
  | 'QNA_ANSWERED'
  | 'QNA_ACCEPTED';

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
