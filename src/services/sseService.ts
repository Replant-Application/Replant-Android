/**
 * SSE (Server-Sent Events) 서비스
 * react-native-sse를 사용한 실시간 알림 수신
 */

import { Platform } from 'react-native';
import EventSource, { EventSourceListener } from 'react-native-sse';
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
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 3000; // 3초
  private isConnecting = false;

  /**
   * SSE 연결 시작
   */
  async connect(): Promise<boolean> {
    if (this.isConnecting) {
      console.log('[SSE] 이미 연결 중입니다.');
      return false;
    }

    try {
      const token = await getAccessToken();
      if (!token) {
        console.log('[SSE] 토큰 없음, 연결 중단');
        return false;
      }

      // 기존 연결이 있으면 종료
      this.disconnect();

      // SSE 엔드포인트 URL 생성
      let baseUrl = API_BASE_URL || 'http://localhost:8080/api';
      // Android 에뮬레이터에서 localhost를 10.0.2.2로 변환
      if (Platform.OS === 'android' && baseUrl.includes('localhost')) {
        baseUrl = baseUrl.replace('localhost', '10.0.2.2');
      }
      // /api를 제거하고 /sse/connect 추가 (SSE는 별도 경로)
      const sseUrl = baseUrl.replace('/api', '') + '/sse/connect';

      console.log('[SSE] 연결 시도:', sseUrl);

      this.isConnecting = true;

      // react-native-sse를 사용한 연결
      const options = {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        debug: __DEV__, // 개발 모드에서만 디버그 활성화
      };

      const eventSource = new EventSource(sseUrl, options);

      // 모든 이벤트를 로깅하기 위한 전역 리스너
      eventSource.addEventListener('open', () => {
        console.log('[SSE] ✅ 연결 열림 (open 이벤트)');
      });

      // 이벤트 리스너 설정
      const listener: EventSourceListener = (event) => {
        const eventAny = event as any;
        console.log('[SSE] ========== 이벤트 수신 ==========');
        console.log('[SSE] 이벤트 타입:', event.type);
        console.log('[SSE] 이벤트 데이터:', eventAny.data);
        console.log('[SSE] 전체 이벤트:', event);
        console.log('[SSE] 이벤트 키:', Object.keys(event));
        console.log('[SSE] =================================');

        if (event.type === 'open') {
          console.log('[SSE] 연결 성공');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.handlers.onConnect?.();
        } else if (event.type === 'message') {
          const messageEvent = event as any;
          console.log('[SSE] message 이벤트 처리 시작');
          console.log('[SSE] messageEvent.data:', messageEvent.data);
          console.log('[SSE] messageEvent.data 타입:', typeof messageEvent.data);
          try {
            let data = messageEvent.data;
            if (typeof data === 'string') {
              console.log('[SSE] 문자열 데이터 파싱 시도:', data);
              data = JSON.parse(data);
              console.log('[SSE] 파싱된 데이터:', data);
            }
            console.log('[SSE] 최종 알림 데이터:', data);
            console.log('[SSE] onNotification 핸들러 호출');
            this.handlers.onNotification?.(data);
            console.log('[SSE] onNotification 핸들러 호출 완료');
          } catch (error) {
            console.error('[SSE] 메시지 파싱 실패:', messageEvent.data, error);
            // 파싱 실패해도 문자열로 전달
            console.log('[SSE] 원본 데이터로 알림 전달');
            this.handlers.onNotification?.(messageEvent.data);
          }
        } else if (event.type === 'error') {
          // error 이벤트는 ErrorEvent, TimeoutEvent, ExceptionEvent를 포함할 수 있음
          const errorEvent = event as any;
          if (errorEvent.error) {
            // ExceptionEvent인 경우
            console.error('[SSE] 예외 발생:', errorEvent.message, errorEvent.error);
            this.handlers.onError?.(errorEvent.error || new Error(errorEvent.message || 'SSE 예외'));
          } else {
            // ErrorEvent 또는 TimeoutEvent인 경우
            console.error('[SSE] 연결 에러:', errorEvent.message);
            this.handlers.onError?.(new Error(errorEvent.message || 'SSE 연결 에러'));
          }
          this.isConnecting = false;
          // 에러 발생 시 재연결 시도
          this.scheduleReconnect();
        } else {
          // 커스텀 이벤트 타입 처리 (예: 'notification', 'diary', 'mission' 등)
          const customEvent = event as any;
          console.log('[SSE] ========== 커스텀 이벤트 수신 ==========');
          console.log('[SSE] 커스텀 이벤트 타입:', event.type);
          console.log('[SSE] 커스텀 이벤트 데이터:', customEvent.data);
          console.log('[SSE] 커스텀 이벤트 전체:', customEvent);
          console.log('[SSE] 커스텀 이벤트 키:', Object.keys(customEvent));
          console.log('[SSE] =======================================');
          
          try {
            let data = customEvent.data;
            if (data && typeof data === 'string') {
              console.log('[SSE] 커스텀 이벤트 문자열 파싱 시도:', data);
              data = JSON.parse(data);
              console.log('[SSE] 파싱된 커스텀 이벤트 데이터:', data);
            }
            console.log('[SSE] 커스텀 이벤트 최종 데이터:', data);
            console.log('[SSE] 커스텀 이벤트 onNotification 핸들러 호출');
            this.handlers.onNotification?.(data);
            console.log('[SSE] 커스텀 이벤트 onNotification 핸들러 호출 완료');
          } catch (error) {
            console.error('[SSE] 커스텀 이벤트 파싱 실패:', customEvent.data, error);
            console.log('[SSE] 커스텀 이벤트 원본 데이터로 알림 전달');
            this.handlers.onNotification?.(customEvent.data);
          }
        }
      };

      // 이벤트 리스너 등록
      eventSource.addEventListener('open', listener);
      eventSource.addEventListener('message', listener);
      eventSource.addEventListener('error', listener);
      
      // 백엔드가 보낼 수 있는 커스텀 이벤트 타입들도 등록
      // 백엔드가 'diary', 'notification', 'mission' 등의 커스텀 이벤트 타입을 사용할 수 있음
      // react-native-sse는 커스텀 이벤트 타입을 동적으로 등록할 수 있음
      const customEventTypes = ['diary', 'notification', 'mission', 'MISSION', 'DIARY', 'NOTIFICATION'];
      customEventTypes.forEach(eventType => {
        try {
          (eventSource as any).addEventListener(eventType, listener);
          console.log(`[SSE] ✅ 커스텀 이벤트 타입 등록 성공: ${eventType}`);
        } catch (error) {
          console.warn(`[SSE] ⚠️ 커스텀 이벤트 타입 등록 실패 (${eventType}):`, error);
        }
      });
      
      // 모든 이벤트를 캐치하기 위해 'message' 이벤트도 처리 (백엔드가 커스텀 타입 대신 message로 보낼 수 있음)
      console.log('[SSE] ✅ 모든 이벤트 리스너 등록 완료');
      
      console.log('[SSE] 이벤트 리스너 등록 완료');

      this.eventSource = eventSource;
      return true;
    } catch (error) {
      console.error('[SSE] 연결 초기화 실패:', error);
      this.isConnecting = false;
      this.handlers.onError?.(error);
      // 초기화 실패 시 재연결 시도
      this.scheduleReconnect();
      return false;
    }
  }

  /**
   * 재연결 스케줄링
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[SSE] 최대 재연결 시도 횟수 초과. SSE 연결을 포기합니다.');
      return;
    }

    // 이미 재연결이 예약되어 있으면 취소
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    console.log(`[SSE] ${delay}ms 후 재연결 시도 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch((error) => {
        console.error('[SSE] 재연결 실패:', error);
      });
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
      try {
        this.eventSource.removeAllEventListeners();
        this.eventSource.close();
      } catch (error) {
        console.warn('[SSE] 연결 종료 중 에러 (무시):', error);
      }
      this.eventSource = null;
    }

    this.reconnectAttempts = 0;
    this.isConnecting = false;
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
    return this.eventSource !== null;
  }
}

// 싱글톤 인스턴스
export const sseService = new SSEService();
