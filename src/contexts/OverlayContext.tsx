/**
 * OverlayContext
 * 알림, 채팅 등 오버레이 모달 상태를 전역으로 관리하는 컨텍스트
 *
 * 기존 코드를 수정하지 않고 새로운 오버레이 시스템을 추가
 */

import React, { createContext, useContext, useState, useCallback, ReactNode, SetStateAction } from 'react';

// ============================================
// 타입 정의
// ============================================

type OverlayType = 'notification' | 'chat' | null;

interface OverlayPosition {
  top: number;
  right: number;
}

interface OverlayContextType {
  // 현재 열린 오버레이
  activeOverlay: OverlayType;

  // 오버레이 위치 (아이콘 기준)
  overlayPosition: OverlayPosition;

  // 오버레이 열기/닫기
  openOverlay: (type: OverlayType, position?: OverlayPosition) => void;
  closeOverlay: () => void;
  toggleOverlay: (type: OverlayType, position?: OverlayPosition) => void;

  // 읽지 않은 카운트
  unreadNotificationCount: number;
  unreadChatCount: number;
  setUnreadNotificationCount: (count: number | ((prev: number) => number)) => void;
  setUnreadChatCount: (count: number | ((prev: number) => number)) => void;
}

// ============================================
// Context 생성
// ============================================

const OverlayContext = createContext<OverlayContextType | null>(null);

// ============================================
// Provider 컴포넌트
// ============================================

interface OverlayProviderProps {
  children: ReactNode;
}

export const OverlayProvider: React.FC<OverlayProviderProps> = ({ children }) => {
  const [activeOverlay, setActiveOverlay] = useState<OverlayType>(null);
  const [overlayPosition, setOverlayPosition] = useState<OverlayPosition>({ top: 100, right: 16 });
  const [unreadNotificationCount, setUnreadNotificationCountState] = useState(0);
  const [unreadChatCount, setUnreadChatCountState] = useState(0);

  // 타입 안전한 setter 함수
  const setUnreadNotificationCount = useCallback((value: number | ((prev: number) => number)) => {
    setUnreadNotificationCountState(value as SetStateAction<number>);
  }, []);

  const setUnreadChatCount = useCallback((value: number | ((prev: number) => number)) => {
    setUnreadChatCountState(value as SetStateAction<number>);
  }, []);

  const openOverlay = useCallback((type: OverlayType, position?: OverlayPosition) => {
    if (position) {
      setOverlayPosition(position);
    }
    setActiveOverlay(type);
  }, []);

  const closeOverlay = useCallback(() => {
    setActiveOverlay(null);
  }, []);

  const toggleOverlay = useCallback((type: OverlayType, position?: OverlayPosition) => {
    if (activeOverlay === type) {
      setActiveOverlay(null);
    } else {
      if (position) {
        setOverlayPosition(position);
      }
      setActiveOverlay(type);
    }
  }, [activeOverlay]);

  const value: OverlayContextType = {
    activeOverlay,
    overlayPosition,
    openOverlay,
    closeOverlay,
    toggleOverlay,
    unreadNotificationCount,
    unreadChatCount,
    setUnreadNotificationCount,
    setUnreadChatCount,
  };

  return (
    <OverlayContext.Provider value={value}>
      {children}
    </OverlayContext.Provider>
  );
};

// ============================================
// Hook
// ============================================

export const useOverlay = (): OverlayContextType => {
  const context = useContext(OverlayContext);
  if (!context) {
    throw new Error('useOverlay must be used within an OverlayProvider');
  }
  return context;
};

export default OverlayContext;
