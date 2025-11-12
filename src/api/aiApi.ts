/**
 * AI API 인터페이스
 * 백엔드 연동 시 실제 구현 필요
 */

import { apiClient } from './client';
import { API_CONFIG } from '../config/apiConfig';
import { ServiceResult } from '../types';

/**
 * LLM 호출
 * POST /ai/llm
 */
export const callLLM = async (data: { 
  message: string;
  context?: string;
  conversationId?: string;
}): Promise<ServiceResult<{ response: string; conversationId: string }>> => {
  // TODO: 백엔드 개발자가 실제 구현
  return apiClient.post<{ response: string; conversationId: string }>(API_CONFIG.endpoints.ai.llmCall, data);
};

/**
 * LLM 결과 송출
 * POST /ai/llm/result
 */
export const sendLLMResult = async (data: { 
  conversationId: string;
  result: string;
  feedback?: string;
}): Promise<ServiceResult<void>> => {
  // TODO: 백엔드 개발자가 실제 구현
  return apiClient.post<void>(API_CONFIG.endpoints.ai.llmResult, data);
};

/**
 * 이미지 분석
 * POST /ai/image
 */
export const analyzeImage = async (data: { 
  imageUrl: string;
  analysisType?: 'emotion' | 'object' | 'scene';
}): Promise<ServiceResult<{ 
  analysis: string;
  tags?: string[];
  emotions?: string[];
}>> => {
  // TODO: 백엔드 개발자가 실제 구현
  return apiClient.post<{ 
    analysis: string;
    tags?: string[];
    emotions?: string[];
  }>(API_CONFIG.endpoints.ai.imageAnalysis, data);
};

