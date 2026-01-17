/**
 * WakeUpMissionContext
 * 기상 미션 인증을 위한 userMissionId를 전역으로 관리
 * FCM 알림에서 받은 userMissionId를 저장하고 WakeUpVerificationScreen에서 사용
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// 타입 정의
// ============================================

interface WakeUpMissionContextType {
  // 현재 활성화된 기상 미션 ID
  currentWakeUpMissionId: number | null;
  
  // userMissionId 설정
  setWakeUpMissionId: (userMissionId: number | null) => Promise<void>;
  
  // userMissionId 가져오기
  getWakeUpMissionId: () => Promise<number | null>;
  
  // userMissionId 초기화
  clearWakeUpMissionId: () => Promise<void>;
}

// ============================================
// Context 생성
// ============================================

const WakeUpMissionContext = createContext<WakeUpMissionContextType | null>(null);

// ============================================
// Provider 컴포넌트
// ============================================

interface WakeUpMissionProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = '@replant:wakeUpMissionId';

export const WakeUpMissionProvider: React.FC<WakeUpMissionProviderProps> = ({ children }) => {
  const [currentWakeUpMissionId, setCurrentWakeUpMissionId] = useState<number | null>(null);

  // AsyncStorage에서 userMissionId 로드
  React.useEffect(() => {
    const loadStoredMissionId = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const missionId = Number(stored);
          if (!isNaN(missionId) && missionId > 0) {
            console.log('[WakeUpMissionContext] 저장된 userMissionId 로드:', missionId);
            setCurrentWakeUpMissionId(missionId);
          }
        }
      } catch (error) {
        console.error('[WakeUpMissionContext] 저장된 userMissionId 로드 실패:', error);
      }
    };
    
    loadStoredMissionId();
  }, []);

  // userMissionId 설정 (메모리 + AsyncStorage)
  const setWakeUpMissionId = useCallback(async (userMissionId: number | null) => {
    try {
      if (userMissionId && userMissionId > 0) {
        console.log('[WakeUpMissionContext] userMissionId 설정:', userMissionId);
        setCurrentWakeUpMissionId(userMissionId);
        await AsyncStorage.setItem(STORAGE_KEY, String(userMissionId));
      } else {
        console.log('[WakeUpMissionContext] userMissionId 초기화');
        setCurrentWakeUpMissionId(null);
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('[WakeUpMissionContext] userMissionId 설정 실패:', error);
    }
  }, []);

  // userMissionId 가져오기
  const getWakeUpMissionId = useCallback(async (): Promise<number | null> => {
    try {
      // 먼저 메모리에서 확인
      if (currentWakeUpMissionId) {
        return currentWakeUpMissionId;
      }
      
      // 메모리에 없으면 AsyncStorage에서 확인
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const missionId = Number(stored);
        if (!isNaN(missionId) && missionId > 0) {
          setCurrentWakeUpMissionId(missionId);
          return missionId;
        }
      }
      
      return null;
    } catch (error) {
      console.error('[WakeUpMissionContext] userMissionId 가져오기 실패:', error);
      return null;
    }
  }, [currentWakeUpMissionId]);

  // userMissionId 초기화
  const clearWakeUpMissionId = useCallback(async () => {
    try {
      console.log('[WakeUpMissionContext] userMissionId 초기화');
      setCurrentWakeUpMissionId(null);
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('[WakeUpMissionContext] userMissionId 초기화 실패:', error);
    }
  }, []);

  const value: WakeUpMissionContextType = {
    currentWakeUpMissionId,
    setWakeUpMissionId,
    getWakeUpMissionId,
    clearWakeUpMissionId,
  };

  return (
    <WakeUpMissionContext.Provider value={value}>
      {children}
    </WakeUpMissionContext.Provider>
  );
};

// ============================================
// Hook
// ============================================

export const useWakeUpMission = (): WakeUpMissionContextType => {
  const context = useContext(WakeUpMissionContext);
  if (!context) {
    throw new Error('useWakeUpMission must be used within a WakeUpMissionProvider');
  }
  return context;
};

export default WakeUpMissionContext;
