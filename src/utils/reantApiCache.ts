/**
 * Reant API 호출 캐싱 유틸리티
 * /api/reant 엔드포인트의 중복 호출을 방지하기 위한 캐싱 로직
 */

import { getMyReant, ReantResponse } from '../api/reantApi';
import { ServiceResult } from '../types';

// API 호출 캐싱을 위한 전역 변수
let lastReantApiCallTime = 0;
let lastReantApiCallPromise: Promise<ServiceResult<ReantResponse>> | null = null;
const REANT_API_CACHE_MS = 2000; // 2초 캐시

/**
 * Reant API를 호출하되, 최근 호출이 있으면 캐시된 결과를 재사용
 * @param forceRefresh 캐시를 무시하고 강제로 새로고침할지 여부
 * @returns Reant API 응답
 */
export const getMyReantCached = async (forceRefresh: boolean = false): Promise<ServiceResult<ReantResponse>> => {
  const now = Date.now();
  
  // 강제 새로고침이 아니고, 캐시된 호출이 있고 최근에 호출했다면 재사용
  if (!forceRefresh && lastReantApiCallPromise && (now - lastReantApiCallTime) < REANT_API_CACHE_MS) {
    return lastReantApiCallPromise;
  }
  
  // 새로운 API 호출
  lastReantApiCallTime = now;
  lastReantApiCallPromise = getMyReant();
  return lastReantApiCallPromise;
};

/**
 * 캐시를 무효화 (다음 호출 시 새로운 API 호출)
 */
export const invalidateReantCache = (): void => {
  lastReantApiCallTime = 0;
  lastReantApiCallPromise = null;
};
