/**
 * API 클라이언트 인터페이스
 * 백엔드 연동 시 실제 구현 필요
 */

import { API_CONFIG } from '../config/apiConfig';
import { ServiceResult } from '../types';
import { getAccessToken, saveTokens } from '../utils/tokenStorage';
import { refreshToken as refreshTokenApi } from './authApi';

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
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
    _options: ApiRequestOptions = {}
  ): Promise<ServiceResult<T>> {
    try {
      // URL 구성 (params가 있으면 query string 추가)
      let url = `${this.baseURL}${endpoint}`;
      if (options.params) {
        const queryString = new URLSearchParams(
          Object.entries(options.params).reduce((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
          }, {} as Record<string, string>)
        ).toString();
        url = `${url}?${queryString}`;
      }

      // 헤더 구성
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

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
      return {
        success: false,
        error: data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`,
        data: data as T,
      };
    } catch (error) {
      // 네트워크 에러 등
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      };
    }
  }

  /**
   * GET 요청
   */
  async get<T>(endpoint: string, params?: Record<string, string | number>): Promise<ServiceResult<T>> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ServiceResult<T>> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ServiceResult<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ServiceResult<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body });
  }

  /**
   * DELETE 요청
   */
  async delete<T>(endpoint: string): Promise<ServiceResult<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// 싱글톤 인스턴스
export const apiClient = new ApiClient();
