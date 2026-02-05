/**
 * SseContext
 * SSE 연결 상태를 전역으로 관리하는 컨텍스트
 * 로그인 시 SSE 연결, 로그아웃 시 연결 해제
 */

import React, { createContext, useContext, useEffect, useCallback, useState, useRef, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { sseService } from '../services/sseService';
import { useOverlay } from './OverlayContext';
import { useUser } from './UserContext';
import { getNotifications } from '../api/notificationApi';

// ============================================
// 타입 정의
// ============================================

interface SseContextType {
  // SSE 연결 상태
  isConnected: boolean;

  // 수동 연결/해제
  connect: () => Promise<void>;
  disconnect: () => void;

  // 마지막 수신 알림
  lastNotification: any | null;

  // FCM 알림 처리 (외부에서 호출 가능)
  handleFcmNotification: (notification: any) => void;
}

// ============================================
// Context 생성
// ============================================

const SseContext = createContext<SseContextType | null>(null);

// ============================================
// Provider 컴포넌트
// ============================================

interface SseProviderProps {
  children: ReactNode;
}

/** 동일 알림으로 간주하는 시간(ms). SSE/FCM 중복 수신 시 한 번만 +1 */
const NOTIFICATION_DEDUP_MS = 3000;

export const SseProvider: React.FC<SseProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastNotification, setLastNotification] = useState<any | null>(null);
  const { setUnreadNotificationCount } = useOverlay();
  const { isLoggedIn } = useUser();

  /** 마지막으로 배지 +1 했을 때의 알림 키와 시각 (SSE/FCM 중복 수신 방지) */
  const lastIncrementedKeyRef = useRef<string | null>(null);
  const lastIncrementedAtRef = useRef<number>(0);

  /**
   * 동일 알림이 짧은 시간 안에 또 오면 +1 하지 않음.
   * 키: id 우선, 없으면 title_content
   */
  const tryIncrementUnreadCount = useCallback(
    (notification: any) => {
      const id = notification?.id ?? notification?.notificationId;
      const title = notification?.title ?? '';
      const content = notification?.content ?? notification?.message ?? '';
      const key = id != null ? String(id) : `${title}_${content}`;
      const now = Date.now();

      if (
        lastIncrementedKeyRef.current === key &&
        now - lastIncrementedAtRef.current < NOTIFICATION_DEDUP_MS
      ) {
        console.log('[SseContext] 동일 알림 중복 수신, 배지 +1 생략:', key);
        return;
      }

      lastIncrementedKeyRef.current = key;
      lastIncrementedAtRef.current = now;
      setUnreadNotificationCount((prev: number) => prev + 1);
    },
    [setUnreadNotificationCount]
  );

  // 알림 수신 핸들러 (SSE용)
  const handleNotification = useCallback(
    (notification: any) => {
      console.log('[SseContext] ========== SSE 알림 수신 ==========');
      console.log('[SseContext] 알림 전체:', JSON.stringify(notification, null, 2));
      console.log('[SseContext] 알림 타입:', typeof notification);
      console.log('[SseContext] 알림 키:', notification ? Object.keys(notification) : 'null');
      console.log('[SseContext] 알림 title:', notification?.title);
      console.log('[SseContext] 알림 content:', notification?.content);
      console.log('[SseContext] 알림 type:', notification?.type);
      console.log('[SseContext] =================================');

      setLastNotification(notification);
      tryIncrementUnreadCount(notification);
    },
    [tryIncrementUnreadCount]
  );

  // FCM 알림 수신 핸들러 (외부에서 호출 가능)
  const handleFcmNotification = useCallback(
    (notification: any) => {
      console.log('[SseContext] ========== FCM 알림 수신 ==========');
      console.log('[SseContext] FCM 알림 전체:', JSON.stringify(notification, null, 2));

      // FCM 알림 데이터 구조 변환
      const data = notification.data || notification;
      const notificationType = data.type || '';

      // 업데이트 알림인 경우 별도 처리 (일반 알림 카운트에 포함하지 않음)
      if (notificationType === 'APP_UPDATE') {
        console.log('[SseContext] 업데이트 알림 수신 - AppNavigator에서 처리');
        const updateNotification = {
          id: data.id || Date.now(),
          title: data.title || notification.notification?.title || '업데이트 알림',
          content: data.content || notification.notification?.body || data.message || '',
          type: 'APP_UPDATE',
          isRequired: data.isRequired === 'true' || data.isRequired === true,
          message: data.message || '',
          storeUrl: data.storeUrl || '',
        };
        setLastNotification(updateNotification);
        return; // 업데이트 알림은 일반 알림 카운트에 포함하지 않음
      }

      // 일반 알림 처리
      const userMissionId = data.userMissionId || data.referenceId;
      const referenceId = data.referenceId || data.userMissionId;

      console.log('[SseContext] FCM data 추출:', {
        'data.userMissionId': data.userMissionId,
        'data.referenceId': data.referenceId,
        '추출된 userMissionId': userMissionId,
        '추출된 referenceId': referenceId,
      });

      const fcmNotification = {
        id: data.id || data.notificationId || Date.now(),
        title: data.title || notification.notification?.title || '',
        content: data.content || notification.notification?.body || '',
        type: notificationType,
        userMissionId: userMissionId,
        referenceId: referenceId,
        referenceType: data.referenceType || '',
        createdAt: data.createdAt || new Date().toISOString(),
        isRead: false,
      };

      console.log('[SseContext] 변환된 FCM 알림:', JSON.stringify(fcmNotification, null, 2));
      console.log('[SseContext] =================================');

      setLastNotification(fcmNotification);
      tryIncrementUnreadCount(fcmNotification);
    },
    [tryIncrementUnreadCount]
  );

  // SSE 연결
  const connect = useCallback(async () => {
    sseService.setHandlers({
      onNotification: handleNotification,
      onConnect: () => {
        console.log('[SseContext] SSE 연결됨');
        setIsConnected(true);
      },
      onDisconnect: () => {
        console.log('[SseContext] SSE 연결 끊김');
        setIsConnected(false);
      },
      onError: (error) => {
        // 에러를 경고로만 표시 (앱은 계속 작동)
        console.warn('[SseContext] SSE 에러 (앱은 정상 작동):', error);
        setIsConnected(false);
      },
    });

    // SSE 연결 실패해도 앱이 계속 작동하도록
    try {
      await sseService.connect();
    } catch (error) {
      console.warn('[SseContext] SSE 연결 실패 (앱은 정상 작동):', error);
    }
  }, [handleNotification]);

  // SSE 연결 해제
  const disconnect = useCallback(() => {
    sseService.disconnect();
    setIsConnected(false);
  }, []);

  // 초기 읽지 않은 알림 개수 로드
  const loadInitialNotificationCount = useCallback(async () => {
    try {
      const result = await getNotifications({ size: 1 });
      if (result.success && result.data) {
        const unreadCount = result.data.unreadCount || 0;
        console.log('[SseContext] 초기 읽지 않은 알림 개수:', unreadCount);
        setUnreadNotificationCount(unreadCount);
      }
    } catch (error) {
      console.warn('[SseContext] 초기 알림 개수 로드 실패:', error);
    }
  }, [setUnreadNotificationCount]);

  // 로그인 상태 변경 시 SSE 연결/해제 및 초기 알림 개수 로드
  useEffect(() => {
    if (isLoggedIn) {
      console.log('[SseContext] 로그인 감지, SSE 연결 시작');
      // 초기 알림 개수 로드
      loadInitialNotificationCount();
      // SSE 연결
      connect();
    } else {
      console.log('[SseContext] 로그아웃 감지, SSE 연결 해제');
      disconnect();
      // 로그아웃 시 알림 개수 초기화
      setUnreadNotificationCount(0);
    }

    return () => {
      disconnect();
    };
  }, [isLoggedIn, connect, disconnect, loadInitialNotificationCount, setUnreadNotificationCount]);

  // 앱 상태 변경 시 SSE 재연결
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isLoggedIn && !isConnected) {
        console.log('[SseContext] 앱 포그라운드 복귀, SSE 재연결');
        connect();
      } else if (nextAppState === 'background') {
        console.log('[SseContext] 앱 백그라운드 진입');
        // 백그라운드에서도 연결 유지 (OS에 따라 다름)
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isLoggedIn, isConnected, connect]);

  const value: SseContextType = {
    isConnected,
    connect,
    disconnect,
    lastNotification,
    handleFcmNotification,
  };

  return (
    <SseContext.Provider value={value}>
      {children}
    </SseContext.Provider>
  );
};

// ============================================
// Hook
// ============================================

export const useSse = (): SseContextType => {
  const context = useContext(SseContext);
  if (!context) {
    throw new Error('useSse must be used within a SseProvider');
  }
  return context;
};

export default SseContext;
