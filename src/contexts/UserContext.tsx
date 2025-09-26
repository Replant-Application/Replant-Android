import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorageKeys, initializeUserData } from '../services';
import { getDeviceId } from '../services/storage';
import { logError, logInfo, logUserAction } from '../utils/logger';
import { executeWithErrorHandling } from '../utils/errorHandler';

interface User {
  nickname: string;
  id: string;
}

interface UserContextType {
  user: User | null;
  currentNickname: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (nickname: string) => Promise<void>;
  logout: () => Promise<void>;
  updateNickname: (newNickname: string) => Promise<{ success: boolean; error?: string }>;
}

interface UserProviderProps {
  children: ReactNode;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentNickname, setCurrentNickname] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 사용자 정보 로드
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async (): Promise<void> => {
    try {
      // 기존 기기별 데이터에서 닉네임 찾기
      const deviceId = await getDeviceId();
      const oldNicknameKey = `userNickname_${deviceId}`;
      const nickname = await AsyncStorage.getItem(oldNicknameKey);
      
      if (nickname) {
        setUser({ 
          nickname, 
          id: `user_${Date.now()}` 
        });
        setCurrentNickname(nickname);
      }
    } catch (error) {
      logError('사용자 정보 로드 실패', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 사용자 로그인 (인증 없이 닉네임만으로)
  const login = useCallback(async (nickname: string): Promise<void> => {
    const result = await executeWithErrorHandling(
      async () => {
        // 기기 ID 생성
        const deviceId = await getDeviceId();
        
        // 사용자 데이터 초기화
        await initializeUserData(deviceId, nickname);
        
        // 사용자 정보 저장
        const userData = {
          nickname,
          id: `user_${Date.now()}`
        };
        
        setUser(userData);
        setCurrentNickname(nickname);
        
        // 기기별 닉네임 저장 (기존 방식과 호환)
        await AsyncStorage.setItem(`userNickname_${deviceId}`, nickname);
        
        logUserAction('사용자 로그인', { nickname });
      },
      '사용자 로그인'
    );
    
    if (!result.success) {
      throw new Error(result.error || '로그인에 실패했습니다.');
    }
  }, []);

  // 사용자 로그아웃
  const logout = useCallback(async (): Promise<void> => {
    const result = await executeWithErrorHandling(
      async () => {
        // 사용자 정보 초기화
        setUser(null);
        setCurrentNickname(null);
        
        // 기기별 닉네임 삭제
        const deviceId = await getDeviceId();
        await AsyncStorage.removeItem(`userNickname_${deviceId}`);
        
        logUserAction('사용자 로그아웃', {});
      },
      '사용자 로그아웃'
    );
    
    if (!result.success) {
      logError('로그아웃 실패', result.error);
    }
  }, []);

  // 닉네임 업데이트
  const updateNickname = useCallback(async (newNickname: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: '로그인이 필요합니다.' };
      }

      if (newNickname.trim() === user.nickname) {
        return { success: false, error: '현재 닉네임과 동일합니다.' };
      }

      // 닉네임 유효성 검사
      if (newNickname.trim().length < 2) {
        return { success: false, error: '닉네임은 2글자 이상이어야 합니다.' };
      }

      if (newNickname.trim().length > 20) {
        return { success: false, error: '닉네임은 20글자 이하여야 합니다.' };
      }

      // 기기 ID 가져오기
      const deviceId = await getDeviceId();
      
      // 기존 닉네임 키 삭제
      await AsyncStorage.removeItem(`userNickname_${deviceId}`);
      
      // 새 닉네임 저장
      await AsyncStorage.setItem(`userNickname_${deviceId}`, newNickname.trim());
      
      // 사용자 정보 업데이트
      const updatedUser = {
        ...user,
        nickname: newNickname.trim()
      };
      
      setUser(updatedUser);
      setCurrentNickname(newNickname.trim());
      
      logUserAction('닉네임 변경', { 
        oldNickname: user.nickname, 
        newNickname: newNickname.trim() 
      });
      
      return { success: true };
    } catch (error) {
      logError('닉네임 업데이트 실패', error);
      return { success: false, error: '닉네임 변경 중 오류가 발생했습니다.' };
    }
  }, [user]);

  // 로그인 상태 계산
  const isLoggedIn = useMemo(() => {
    return user !== null && currentNickname !== null;
  }, [user, currentNickname]);

  const contextValue: UserContextType = {
    user,
    currentNickname,
    isLoggedIn,
    isLoading,
    login,
    logout,
    updateNickname,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};
