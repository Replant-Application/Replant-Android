/**
 * API 클라이언트 인터페이스
 * 백엔드 연동 시 실제 구현 필요
 */

import { API_CONFIG } from '../config/apiConfig';
import { ServiceResult } from '../types';
import { getAccessToken, saveTokens } from '../utils/tokenStorage';
import { refreshToken as refreshTokenApi } from './authApi';

/**
 * API 요청 옵션
 */
export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number>;
}

/**
 * API 클라이언트 인터페이스
 * TODO: 백엔드 개발자가 실제 fetch/axios 구현 필요
 */
export class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(baseURL: string = API_CONFIG.baseURL) {
    this.baseURL = baseURL;
    // 초기화 시 저장된 토큰 로드
    this.loadAccessToken();
  }

  /**
   * 저장된 Access Token 로드
   */
  private async loadAccessToken(): Promise<void> {
    try {
      const token = await getAccessToken();
      if (token) {
        this.accessToken = token;
      }
    } catch (error) {
      console.error('Failed to load access token:', error);
    }
  }

  /**
   * 액세스 토큰 설정
   */
  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  /**
   * 토큰 갱신 대기열에 구독자 추가
   */
  private subscribeTokenRefresh(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback);
  }

  /**
   * 토큰 갱신 완료 알림
   */
  private onTokenRefreshed(token: string): void {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  /**
   * 토큰 갱신 처리
   */
  private async handleTokenRefresh(): Promise<string | null> {
    if (this.isRefreshing) {
      // 이미 토큰 갱신 중이면 대기
      return new Promise((resolve) => {
        this.subscribeTokenRefresh((token: string) => {
          resolve(token);
        });
      });
    }

    this.isRefreshing = true;

    try {
      const { getRefreshToken } = await import('../utils/tokenStorage');
      const refreshToken = await getRefreshToken();

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const result = await refreshTokenApi({ refreshToken });

      if (result.success && result.data) {
        const { accessToken, refreshToken: newRefreshToken } = result.data;
        await saveTokens(accessToken, newRefreshToken);
        this.setAccessToken(accessToken);
        this.onTokenRefreshed(accessToken);
        return accessToken;
      }

      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // 토큰 갱신 실패 시 로그아웃 처리
      const { clearAuthData } = await import('../utils/tokenStorage');
      await clearAuthData();
      return null;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * API 요청 실행
   */
  async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ServiceResult<T>> {
    // URL 구성 (params가 있으면 query string 추가)
    let url = `${this.baseURL}${endpoint}`;
    if (options.params) {
      // undefined 값은 쿼리 파라미터에서 제외
      const filteredParams = Object.entries(options.params).filter(
        ([_, value]) => value !== undefined && value !== null
      );
      if (filteredParams.length > 0) {
        const queryString = new URLSearchParams(
          filteredParams.reduce((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
          }, {} as Record<string, string>)
        ).toString();
        url = `${url}?${queryString}`;
      }
    }

    try {

      // 헤더 구성
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      };

      // CORS를 위한 Origin 헤더 추가 (필요시)
      // Android 에뮬레이터에서 localhost로 요청할 때 서버가 인식할 수 있도록
      if (url.includes('10.0.2.2')) {
        headers['Origin'] = 'http://localhost:8081';
      }

      // 토큰이 있으면 Authorization 헤더 추가
      if (this.accessToken) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
      }

      // fetch 요청
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      // 응답 처리
      let data: any = null;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            data = text;
          }
        }
      }

      // 성공 응답
      if (response.ok) {
        // 백엔드가 { data: {...}, message: "...", code: ... } 형태로 응답하는 경우
        // data 필드를 추출하여 반환
        if (data && typeof data === 'object' && 'data' in data) {
          return {
            success: true,
            data: data.data as T,
          };
        }
        return {
          success: true,
          data: data as T,
        };
      }

      // 401 Unauthorized - 토큰 갱신 후 재시도
      if (response.status === 401 && !url.includes('/auth/refresh')) {
        const newToken = await this.handleTokenRefresh();
        if (newToken) {
          // 새 토큰으로 재시도
          return this.request<T>(endpoint, options);
        }
      }

      // 에러 응답
      // 403, 404 등 다양한 HTTP 에러에 대한 상세 메시지 제공
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      // HTML 응답인 경우 파싱 시도
      if (typeof data === 'string' && data.includes('<html>')) {
        // HTML에서 에러 메시지 추출 시도
        const titleMatch = data.match(/<title>(.*?)<\/title>/i);
        const h2Match = data.match(/<h2>(.*?)<\/h2>/i);
        if (titleMatch && titleMatch[1]) {
          errorMessage = titleMatch[1];
        } else if (h2Match && h2Match[1]) {
          errorMessage = h2Match[1];
        } else {
          errorMessage = '서버에서 HTML 에러 페이지를 반환했습니다. API 엔드포인트가 올바른지 확인하세요.';
        }
      } else if (data) {
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (typeof data === 'object') {
          errorMessage = data?.message || data?.error || data?.msg || data?.detail || errorMessage;
        }
      }
      
      console.error('[API Client] Error response:', {
        status: response.status,
        statusText: response.statusText,
        url,
        contentType: response.headers.get('content-type'),
        dataPreview: typeof data === 'string' ? data.substring(0, 200) : data,
      });
      
      return {
        success: false,
        error: errorMessage,
        data: data as T,
      };
    } catch (error) {
      // 네트워크 에러 등
      console.error('[API Client] Request failed:', {
        url,
        method: options.method || 'GET',
        error: error instanceof Error ? error.message : String(error),
        errorType: error instanceof TypeError ? 'NetworkError' : 'UnknownError',
      });
      
      // 네트워크 에러인 경우 더 자세한 메시지 제공
      let errorMessage = '알 수 없는 오류가 발생했습니다.';
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = '네트워크 연결에 실패했습니다. 인터넷 연결을 확인하거나 서버가 실행 중인지 확인해주세요.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * GET 요청
   */
  async get<T>(endpoint: string, params?: Record<string, string | number>): Promise<ServiceResult<T>> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  /**
   * POST 요청
   */
  async post<T>(endpoint: string, body?: any): Promise<ServiceResult<T>> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  /**
   * PUT 요청
   */
  async put<T>(endpoint: string, body?: any): Promise<ServiceResult<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  /**
   * PATCH 요청
   */
  async patch<T>(endpoint: string, body?: any): Promise<ServiceResult<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body });
  }

  /**
   * DELETE 요청
   */
  async delete<T>(endpoint: string): Promise<ServiceResult<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * 파일 업로드 (FormData)
   */
  async upload<T>(endpoint: string, formData: FormData): Promise<ServiceResult<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;

      // 헤더 구성 (Content-Type은 FormData에서 자동 설정됨)
      const headers: Record<string, string> = {};

      // 토큰이 있으면 Authorization 헤더 추가
      if (this.accessToken) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
      }

      // fetch 요청
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      // 응답 처리
      let data: any = null;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            data = text;
          }
        }
      }

      // 성공 응답
      if (response.ok) {
        if (data && typeof data === 'object' && 'data' in data) {
          return {
            success: true,
            data: data.data as T,
          };
        }
        return {
          success: true,
          data: data as T,
        };
      }

      // 401 Unauthorized - 토큰 갱신 후 재시도
      if (response.status === 401) {
        const newToken = await this.handleTokenRefresh();
        if (newToken) {
          return this.upload<T>(endpoint, formData);
        }
      }

      // 에러 응답
      return {
        success: false,
        error: data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '파일 업로드 중 오류가 발생했습니다.',
      };
    }
  }
}

// 싱글톤 인스턴스
export const apiClient = new ApiClient();

