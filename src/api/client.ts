/**
 * API 클라이언트 인터페이스
 * 백엔드 연동 시 실제 구현 필요
 */

import { API_CONFIG } from '../config/apiConfig';
import { ServiceResult } from '../types';

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

  constructor(baseURL: string = API_CONFIG.baseURL) {
    this.baseURL = baseURL;
  }

  /**
   * 액세스 토큰 설정
   */
  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  /**
   * API 요청 실행
   */
  async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
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
        return {
          success: true,
          data: data as T,
        };
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
}

// 싱글톤 인스턴스
export const apiClient = new ApiClient();

