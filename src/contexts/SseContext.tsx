/**
 * SseContext
 * SSE 연결 상태를 전역으로 관리하는 컨텍스트
 * 로그인 시 SSE 연결, 로그아웃 시 연결 해제
 */

import React, { createContext, useContext, useEffect, useCallback, useState, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { sseService } from '../services/sseService';
import { useOverlay } from './OverlayContext';
import { useUser } from './UserContext';

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

export const SseProvider: React.FC<SseProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastNotification, setLastNotification] = useState<any | null>(null);
  const { setUnreadNotificationCount } = useOverlay();
  const { isLoggedIn } = useUser();

  // 알림 수신 핸들러
  const handleNotification = useCallback((notification: any) => {
    console.log('[SseContext] 알림 수신:', JSON.stringify(notification, null, 2));
    console.log('[SseContext] 알림 타입:', typeof notification);
    console.log('[SseContext] 알림 키:', notification ? Object.keys(notification) : 'null');
    
    setLastNotification(notification);

    // 읽지 않은 알림 카운트 증가
    setUnreadNotificationCount((prev: number) => prev + 1);

    // TODO: 토스트 알림 표시 (선택 사항)
    // showToast(notification.title, notification.content);
  }, [setUnreadNotificationCount]);

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

  // 로그인 상태 변경 시 SSE 연결/해제
  useEffect(() => {
    if (isLoggedIn) {
      console.log('[SseContext] 로그인 감지, SSE 연결 시작');
      connect();
    } else {
      console.log('[SseContext] 로그아웃 감지, SSE 연결 해제');
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isLoggedIn, connect, disconnect]);

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
