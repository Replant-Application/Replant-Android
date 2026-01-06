import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorageKeys, initializeUserData } from '../services';
import { getDeviceId } from '../services/storage';
import { logError, logUserAction } from '../utils/logger';
import { executeWithErrorHandling } from '../utils/errorHandler';
import { User } from '../types';
import { checkAutoLogin, getUserInfo, clearAuthData } from '../utils/tokenStorage';
import { apiClient } from '../api/client';

// UserContext 타입 정의
interface UserContextType {
  user: User | null;
  currentNickname: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (nickname: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateNickname: (newNickname: string) => Promise<{ success: boolean; error?: string }>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentNickname, setCurrentNickname] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 사용자 정보 로드
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      // 자동 로그인 체크 (로그인 유지가 false면 토큰 삭제)
      const shouldAutoLogin = await checkAutoLogin();

      // 저장된 사용자 정보 확인 (API 토큰 기반)
      const storedUserInfo = await getUserInfo();
      if (shouldAutoLogin && storedUserInfo) {
        // API 기반 로그인 유지
        const nickname = storedUserInfo.nickname;
        const storageKeys = getStorageKeys(nickname);

        // 백엔드에서 받은 role 사용 (ADMIN -> admin 변환)
        const backendRole = storedUserInfo.role?.toLowerCase() || 'user';
        const role = backendRole === 'admin' ? 'admin' : 'user';

        // User 객체 생성 또는 로드
        let userData: User | null = null;
        const existingData = await AsyncStorage.getItem(storageKeys.USER);
        if (existingData) {
          userData = JSON.parse(existingData);
          // 역할 업데이트
          if (userData && userData.role !== role) {
            userData.role = role;
            await AsyncStorage.setItem(storageKeys.USER, JSON.stringify(userData));
          }
        } else {
          userData = {
            nickname,
            id: `user_${storedUserInfo.id}`,
            createdAt: new Date().toISOString(),
            role
          };
          await AsyncStorage.setItem(storageKeys.USER, JSON.stringify(userData));
        }

        setUser(userData);
        setCurrentNickname(nickname);
        setIsLoading(false);
        return;
      }

      // 기존 기기별 데이터에서 닉네임 찾기 (레거시 지원)
      const deviceId = await getDeviceId();
      const oldNicknameKey = `userNickname_${deviceId}`;
      const nickname = await AsyncStorage.getItem(oldNicknameKey);

      if (nickname) {
        const storageKeys = getStorageKeys(nickname);
        // User 객체 로드 시도
        const userData: User | null = await AsyncStorage.getItem(storageKeys.USER)
          ? JSON.parse(await AsyncStorage.getItem(storageKeys.USER) || 'null')
          : null;

        if (userData) {
          // 기존 User 객체가 있으면 사용 (createdAt 포함)
          // role이 없고 닉네임이 "admin"이면 admin 역할 부여
          if (!userData.role && nickname.toLowerCase() === 'admin') {
            userData.role = 'admin';
            await AsyncStorage.setItem(storageKeys.USER, JSON.stringify(userData));
          }
          setUser(userData);
          setCurrentNickname(nickname);
        } else {
          // 기존 User 객체가 없으면 새로 생성 (기존 사용자 호환성)
          // 닉네임이 "admin"이면 admin 역할 부여
          const role = nickname.toLowerCase() === 'admin' ? 'admin' : 'user';
          const newUser: User = {
            nickname,
            id: `user_${Date.now()}`,
            createdAt: new Date().toISOString(), // 기존 사용자도 현재 시간을 가입일로 설정
            role
          };
          await AsyncStorage.setItem(storageKeys.USER, JSON.stringify(newUser));
          setUser(newUser);
          setCurrentNickname(nickname);
        }
      }
    } catch (error) {
      logError('사용자 정보 로드 실패', error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  // 사용자 로그인 (인증 없이 닉네임만으로)
  const login = useCallback(async (nickname: string) => {
    logUserAction('login_attempt', { nickname });

    const result = await executeWithErrorHandling(async () => {
      const storageKeys = getStorageKeys(nickname);

      // 기존 사용자 확인
      const existingUserData: User | null = await AsyncStorage.getItem(storageKeys.USER)
        ? JSON.parse(await AsyncStorage.getItem(storageKeys.USER) || 'null')
        : null;

      if (existingUserData) {
        // 기존 사용자인 경우 - 데이터 초기화하지 않음
        // role이 없고 닉네임이 "admin"이면 admin 역할 부여
        if (!existingUserData.role && nickname.toLowerCase() === 'admin') {
          existingUserData.role = 'admin';
          await AsyncStorage.setItem(storageKeys.USER, JSON.stringify(existingUserData));
        }
        setUser(existingUserData);
        setCurrentNickname(nickname);
        logUserAction('login_success', { nickname, userId: existingUserData.id, isExistingUser: true });
        return true;
      }

      // 신규 사용자인 경우 - 데이터 초기화
      const userId = `user_${Date.now()}`;
      const createdAt = new Date().toISOString();
      // 닉네임이 "admin"이면 admin 역할 부여
      const role = nickname.toLowerCase() === 'admin' ? 'admin' : 'user';
      const newUser: User = {
        nickname,
        id: userId,
        createdAt,
        role
      };

      // User 객체를 스토리지에 저장
      await AsyncStorage.setItem(storageKeys.USER, JSON.stringify(newUser));

      setUser(newUser);
      setCurrentNickname(nickname);

      // 미션 데이터 초기화 (신규 사용자만)
      await initializeUserData(userId, nickname);

      logUserAction('login_success', { nickname, userId, isExistingUser: false });
      return true;
    }, '사용자 로그인');

    // 에러가 발생해도 강제로 성공 처리
    if (!result.success) {
      const storageKeys = getStorageKeys(nickname);

      // 기존 사용자 확인
      let existingUserData: User | null = null;
      try {
        const userDataString = await AsyncStorage.getItem(storageKeys.USER);
        if (userDataString) {
          existingUserData = JSON.parse(userDataString);
        }
      } catch (error) {
        logError('기존 사용자 확인 실패', error as Error);
      }

      if (existingUserData) {
        // 기존 사용자인 경우
        if (!existingUserData.role && nickname.toLowerCase() === 'admin') {
          existingUserData.role = 'admin';
          try {
            await AsyncStorage.setItem(storageKeys.USER, JSON.stringify(existingUserData));
          } catch (storageError) {
            logError('User 저장 실패', storageError as Error);
          }
        }
        setUser(existingUserData);
        setCurrentNickname(nickname);
      } else {
        // 신규 사용자인 경우
        const userId = `user_${Date.now()}`;
        const createdAt = new Date().toISOString();
        const role = nickname.toLowerCase() === 'admin' ? 'admin' : 'user';
        const newUser: User = {
          nickname,
          id: userId,
          createdAt,
          role
        };

        try {
          await AsyncStorage.setItem(storageKeys.USER, JSON.stringify(newUser));
        } catch (storageError) {
          logError('User 저장 실패', storageError as Error);
        }

        setUser(newUser);
        setCurrentNickname(nickname);

        // 미션 데이터 초기화 (신규 사용자만)
        try {
          await initializeUserData(userId, nickname);
        } catch (initError) {
          logError('데이터 초기화 실패', initError as Error, { nickname, userId });
        }
      }
    }

    return true;
  }, []);

  // 사용자 로그아웃
  const logout = useCallback(async () => {
    try {
      // AsyncStorage에서 닉네임 제거
      if (currentNickname) {
        const storageKeys = getStorageKeys(currentNickname);
        await AsyncStorage.removeItem(storageKeys.USER_NICKNAME);
      }

      // API 토큰 및 사용자 정보 정리
      await clearAuthData();
      apiClient.setAccessToken(null);

      setUser(null);
      setCurrentNickname(null);
    } catch (error) {
      logError('로그아웃 실패', error as Error);
    }
  }, [currentNickname]);

  // 사용자 정보 새로고침
  const refreshUser = useCallback(async () => {
    try {
      if (currentNickname) {
        const storageKeys = getStorageKeys(currentNickname);
        const userData: User | null = await AsyncStorage.getItem(storageKeys.USER)
          ? JSON.parse(await AsyncStorage.getItem(storageKeys.USER) || 'null')
          : null;

        if (userData) {
          setUser(userData);
        }
      }
    } catch (error) {
      logError('사용자 정보 새로고침 실패', error as Error);
    }
  }, [currentNickname]);

  // 닉네임 변경
  const updateNickname = useCallback(async (newNickname: string) => {
    try {
      if (!currentNickname || !newNickname) {
        throw new Error('닉네임이 필요합니다.');
      }

      // 기존 데이터 백업

      // 모든 기존 데이터를 새 닉네임으로 복사
      const allKeys = await AsyncStorage.getAllKeys();
      const userKeys = allKeys.filter(key => key.includes(currentNickname));

      for (const key of userKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          const newKey = key.replace(currentNickname, newNickname);
          await AsyncStorage.setItem(newKey, value);
        }
      }

      // 기존 데이터 삭제
      await AsyncStorage.multiRemove(userKeys);

      // 사용자 정보 업데이트 (기존 createdAt 유지)
      const updatedUser: User = {
        nickname: newNickname,
        id: user?.id || `user_${Date.now()}`,
        createdAt: user?.createdAt || new Date().toISOString()
      };

      // 새 닉네임으로 User 객체 저장
      const newStorageKeys = getStorageKeys(newNickname);
      await AsyncStorage.setItem(newStorageKeys.USER, JSON.stringify(updatedUser));

      setUser(updatedUser);
      setCurrentNickname(newNickname);

      logUserAction('nickname_updated', { oldNickname: currentNickname, newNickname });
      return { success: true };
    } catch (error) {
      logError('닉네임 변경 실패', error as Error);
      return { success: false, error: (error as Error).message };
    }
  }, [currentNickname, user?.id, user?.createdAt]);

  // 메모이제이션된 Context 값
  const value = useMemo(() => ({
    user,
    currentNickname,
    isLoggedIn: !!user,
    login,
    logout,
    refreshUser,
    updateNickname,
    isLoading,
  }), [user, currentNickname, login, logout, refreshUser, updateNickname, isLoading]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
