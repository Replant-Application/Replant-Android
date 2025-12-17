/**
 * 채팅 API 인터페이스
 */

import { apiClient } from './client';
import { API_CONFIG } from '../config/apiConfig';
import { ServiceResult } from '../types';

// ============================================
// 타입 정의
// ============================================

export interface ChatRoom {
  id: number;
  otherUser: {
    id: number;
    nickname: string;
    profileImg?: string;
  };
  matchedMission?: {
    id: number;
    title: string;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
    isRead: boolean;
  };
  unreadCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface ChatRoomListResponse {
  rooms: ChatRoom[];
  totalCount: number;
}

export interface ChatMessage {
  id: number;
  senderId: number;
  content: string;
  isRead: boolean;
  isMine: boolean;
  createdAt: string;
}

export interface ChatMessageListResponse {
  messages: ChatMessage[];
  hasMore: boolean;
}

export interface SendMessageResponse {
  id: number;
  roomId: number;
  senderId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface ReadMessagesResponse {
  roomId: number;
  readCount: number;
  message: string;
}

// ============================================
// 채팅 API
// ============================================

/**
 * 채팅방 목록 조회
 * GET /api/chat/rooms
 * 인증 필요
 */
export const getChatRooms = async (): Promise<ServiceResult<ChatRoomListResponse>> => {
  return apiClient.get<ChatRoomListResponse>(API_CONFIG.endpoints.chat.rooms);
};

/**
 * 채팅방 상세 조회
 * GET /api/chat/rooms/{roomId}
 * 인증 필요
 */
export const getChatRoom = async (roomId: number): Promise<ServiceResult<ChatRoom>> => {
  const endpoint = API_CONFIG.endpoints.chat.roomDetail.replace(':roomId', String(roomId));
  return apiClient.get<ChatRoom>(endpoint);
};

/**
 * 메시지 목록 조회
 * GET /api/chat/rooms/{roomId}/messages
 * 인증 필요
 * 커서 기반 페이지네이션
 */
export const getChatMessages = async (
  roomId: number,
  params?: {
    before?: number; // 이 메시지 ID 이전 메시지 조회
    size?: number;
  }
): Promise<ServiceResult<ChatMessageListResponse>> => {
  const endpoint = API_CONFIG.endpoints.chat.messages.replace(':roomId', String(roomId));
  return apiClient.get<ChatMessageListResponse>(endpoint, params);
};

/**
 * 메시지 전송
 * POST /api/chat/rooms/{roomId}/messages
 * 인증 필요, 활성 채팅방만 가능
 */
export const sendMessage = async (
  roomId: number,
  data: { content: string }
): Promise<ServiceResult<SendMessageResponse>> => {
  const endpoint = API_CONFIG.endpoints.chat.sendMessage.replace(':roomId', String(roomId));
  return apiClient.post<SendMessageResponse>(endpoint, data);
};

/**
 * 메시지 읽음 처리
 * PUT /api/chat/rooms/{roomId}/messages/read
 * 인증 필요
 */
export const markMessagesAsRead = async (
  roomId: number
): Promise<ServiceResult<ReadMessagesResponse>> => {
  const endpoint = API_CONFIG.endpoints.chat.readMessages.replace(':roomId', String(roomId));
  return apiClient.put<ReadMessagesResponse>(endpoint);
};
