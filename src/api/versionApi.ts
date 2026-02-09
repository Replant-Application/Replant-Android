/**
 * 버전 체크 API
 * FCM으로 통일된 업데이트 알림 시스템
 * 인증이 필요 없는 공개 API이므로 직접 fetch 사용
 */

import { API_CONFIG } from '../config/apiConfig';
import { ServiceResult } from '../types';

export interface VersionCheckRequest {
  currentVersion: string;
}

export interface VersionCheckResponse {
  isRequired: boolean;
  isRecommended: boolean;
  message: string;
  storeUrl: string;
  minVersion: string;
  latestVersion: string;
}

/**
 * 앱 버전 체크 (인증 불필요)
 * POST /api/v1/version/check
 */
export const checkVersion = async (
  currentVersion: string
): Promise<ServiceResult<VersionCheckResponse>> => {
  try {
    const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.version.check}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ currentVersion }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    
    // 백엔드 응답 형식에 맞게 변환 (data 필드에서 추출)
    // Jackson: boolean getter isRequired() → "required", 일부 설정은 "isRequired"도 사용
    if (data.data) {
      const raw = data.data as Record<string, unknown>;
      return {
        success: true,
        data: {
          isRequired: raw.required ?? raw.isRequired ?? false,
          isRecommended: raw.recommended ?? raw.isRecommended ?? false,
          message: data.data.message || '',
          storeUrl: data.data.storeUrl || '',
          minVersion: data.data.minVersion || '',
          latestVersion: data.data.latestVersion || '',
        },
      };
    }

    return {
      success: false,
      error: '응답 형식이 올바르지 않습니다.',
    };
  } catch (error) {
    console.error('[VersionAPI] 버전 체크 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '버전 체크 중 오류가 발생했습니다.',
    };
  }
};
