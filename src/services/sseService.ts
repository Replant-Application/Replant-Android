/**
 * SSE (Server-Sent Events) 서비스
 * 실시간 알림 수신을 위한 SSE 연결 관리
 */

import { API_BASE_URL } from '@env';
import { getAccessToken } from '../utils/tokenStorage';

type SSEEventHandler = (data: any) => void;

interface SSEHandlers {
  onNotification?: SSEEventHandler;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

class SSEService {
  private eventSource: EventSource | null = null;
  private handlers: SSEHandlers = {};
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3초

  /**
   * SSE 연결 시작
   */
  async connect(): Promise<boolean> {
    try {
      const token = await getAccessToken();
      if (!token) {
        console.log('[SSE] 토큰 없음, 연결 중단');
        return false;
      }

      // 기존 연결이 있으면 종료
      this.disconnect();

      // SSE 엔드포인트 URL 생성
      const baseUrl = API_BASE_URL || 'http://localhost:8080/api';
      // /api를 제거하고 /sse/connect 추가 (SSE는 별도 경로)
      const sseUrl = baseUrl.replace('/api', '') + '/sse/connect';

      console.log('[SSE] 연결 시도:', sseUrl);

      // EventSource는 헤더 설정이 불가하므로 URL 파라미터로 토큰 전달
      // 또는 fetch를 사용한 SSE 구현 필요
      // React Native에서는 EventSource polyfill 또는 fetch 기반 구현 사용

      // fetch 기반 SSE 구현
      this.startFetchSSE(sseUrl, token);
      return true;
    } catch (error) {
      console.error('[SSE] 연결 실패:', error);
      this.handlers.onError?.(error);
      return false;
    }
  }

  /**
   * fetch 기반 SSE 연결 (React Native 호환)
   */
  private async startFetchSSE(url: string, token: string): Promise<void> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`SSE 연결 실패: ${response.status}`);
      }

      console.log('[SSE] 연결 성공');
      this.reconnectAttempts = 0;
      this.handlers.onConnect?.();

      // 스트림 읽기
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body reader를 생성할 수 없습니다');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('[SSE] 스트림 종료');
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          this.processLine(line);
        }
      }

      // 연결 종료 시 재연결 시도
      this.handlers.onDisconnect?.();
      this.scheduleReconnect();
    } catch (error) {
      console.error('[SSE] 스트림 에러:', error);
      this.handlers.onError?.(error);
      this.scheduleReconnect();
    }
  }

  /**
   * SSE 메시지 라인 처리
   */
  private processLine(line: string): void {
    if (line.startsWith('event:')) {
      // 이벤트 타입은 다음 data 라인과 함께 처리
      return;
    }

    if (line.startsWith('data:')) {
      const data = line.substring(5).trim();
      if (data) {
        try {
          const parsed = JSON.parse(data);
          console.log('[SSE] 알림 수신:', parsed);
          this.handlers.onNotification?.(parsed);
        } catch {
          // JSON이 아닌 경우 문자열로 전달
          console.log('[SSE] 메시지 수신:', data);
        }
      }
    }
  }

  /**
   * 재연결 스케줄링
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[SSE] 최대 재연결 시도 횟수 초과');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    console.log(`[SSE] ${delay}ms 후 재연결 시도 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * SSE 연결 종료
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.reconnectAttempts = 0;
    console.log('[SSE] 연결 종료');
  }

  /**
   * 이벤트 핸들러 설정
   */
  setHandlers(handlers: SSEHandlers): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  /**
   * 알림 핸들러만 설정
   */
  onNotification(handler: SSEEventHandler): void {
    this.handlers.onNotification = handler;
  }

  /**
   * 연결 상태 확인
   */
  isConnected(): boolean {
    return this.eventSource !== null || this.reconnectAttempts > 0;
  }
}

// 싱글톤 인스턴스
export const sseService = new SSEService();
