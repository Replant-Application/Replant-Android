/**
 * Chat API
 * 백엔드 ChatController와 연동
 */

import { apiClient } from './client';
import { ServiceResult } from '../types';

// ============================================
// 타입 정의
// ============================================

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  message: string;
  reantName: string;
  provider?: string;
  timestamp?: string;
}

export interface ChatStatusResponse {
  todayCount: number;
  dailyLimit: number;
  remaining: number;
}

// ============================================
// API 함수
// ============================================

/**
 * 채팅 메시지 전송
 * POST /api/chat
 */
export const sendChatMessage = async (
  message: string
): Promise<ServiceResult<ChatResponse>> => {
  try {
    // LLM(Gemini 등) 응답 대기 가능하도록 타임아웃 60초 (기본 10초는 짧아서 TimeoutError 발생)
    const response = await apiClient.post<ChatResponse>(
      '/chat',
      { message },
      { timeout: 60000 }
    );
    if (!response.success) {
      return {
        success: false,
        error: response.error || '메시지 전송에 실패했습니다.',
      };
    }
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error('[chatApi] sendChatMessage 실패:', error);

    // 429 에러 (일일 한도 초과)
    if (error.response?.status === 429) {
      return {
        success: false,
        error: '오늘의 채팅 횟수를 모두 사용했어요. 내일 다시 만나요!',
      };
    }

    return {
      success: false,
      error: error.response?.data?.message || '메시지 전송에 실패했습니다.',
    };
  }
};

/**
 * 오늘 채팅 현황 조회
 * GET /api/chat/status
 */
export const getChatStatus = async (): Promise<ServiceResult<ChatStatusResponse>> => {
  try {
    const response = await apiClient.get<ChatStatusResponse>('/chat/status');

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error('[chatApi] getChatStatus 실패:', error);

    return {
      success: false,
      error: error.response?.data?.message || '채팅 현황 조회에 실패했습니다.',
    };
  }
};
