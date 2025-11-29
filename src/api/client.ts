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
   * TODO: 실제 HTTP 요청 구현 필요
   */
  async request<T>(
    endpoint: string,
    _options: ApiRequestOptions = {}
  ): Promise<ServiceResult<T>> {
    // TODO: 백엔드 개발자가 실제 구현
    // 예시:
    // const url = `${this.baseURL}${endpoint}`;
    // const headers = {
    //   'Content-Type': 'application/json',
    //   ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
    //   ...options.headers,
    // };
    //
    // const response = await fetch(url, {
    //   method: options.method || 'GET',
    //   headers,
    //   body: options.body ? JSON.stringify(options.body) : undefined,
    // });
    //
    // const data = await response.json();
    // return { success: response.ok, data, error: response.ok ? undefined : data.message };

    return {
      success: false,
      error: 'API 클라이언트가 구현되지 않았습니다.',
    };
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
