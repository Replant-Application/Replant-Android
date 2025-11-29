/**
 * 관리자 기능 훅
 * 유저 관리 기능 제공
 */

import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getData, setData, getStorageKeys } from '../services/storage';
import { logError } from '../utils/logger';
import { ServiceResult, User } from '../types';
import { UserInfo, UpdateUserRequest } from '../api/manageApi';

const ADMIN_USERS_KEY = 'admin_users';

/**
 * 관리자 훅
 */
export const useAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 전체 유저 목록 조회
   * AsyncStorage에서 user_로 시작하는 모든 키를 찾아서 실제 유저 데이터 수집
   */
  const getAllUsers = useCallback(async (params?: { page?: number; limit?: number }): Promise<ServiceResult<UserInfo[]>> => {
    setLoading(true);
    setError(null);

    try {
      // AsyncStorage의 모든 키 가져오기
      const allKeys = await AsyncStorage.getAllKeys();

      // user_로 시작하는 키들 필터링 (실제 유저 데이터)
      const userKeys = allKeys.filter(key => key.startsWith('user_') && !key.includes('userNickname'));

      // 각 유저 데이터 수집
      const users: UserInfo[] = [];
      for (const key of userKeys) {
        try {
          const userDataString = await AsyncStorage.getItem(key);
          if (userDataString) {
            const userData: User = JSON.parse(userDataString);

            users.push({
              id: parseInt(userData.id.replace('user_', ''), 10) || Date.now(),
              nickname: userData.nickname,
              email: undefined,
              username: userData.nickname,
              role: userData.role || 'user',
              isActive: true,
              createdAt: userData.createdAt,
            });
          }
        } catch (parseError) {
          logError(`유저 데이터 파싱 실패 (${key})`, parseError as Error);
        }
      }

      // 가입일 기준 정렬 (최신순)
      users.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      // 페이지네이션 처리
      const page = params?.page || 1;
      const limit = params?.limit || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = users.slice(startIndex, endIndex);

      return {
        success: true,
        data: paginatedUsers,
      };
    } catch (err) {
      const errorMessage = '유저 목록을 불러오는데 실패했습니다.';
      logError(errorMessage, err as Error);
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 유저 상세 조회
   */
  const getUserDetail = useCallback(async (id: number): Promise<ServiceResult<UserInfo>> => {
    setLoading(true);
    setError(null);

    try {
      // 모든 유저 목록 가져오기
      const allUsersResult = await getAllUsers({ page: 1, limit: 1000 });

      if (!allUsersResult.success || !allUsersResult.data) {
        return {
          success: false,
          error: '유저 목록을 불러올 수 없습니다.',
        };
      }

      const user = allUsersResult.data.find(u => u.id === id);

      if (!user) {
        return {
          success: false,
          error: '유저를 찾을 수 없습니다.',
        };
      }

      return {
        success: true,
        data: {
          id: user.id,
          username: user.username || '',
          nickname: user.nickname || '',
          role: user.role || 'user',
          email: user.email,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      };
    } catch (err) {
      const errorMessage = '유저 정보를 불러오는데 실패했습니다.';
      logError(errorMessage, err as Error);
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, [getAllUsers]);

  /**
   * 유저 수정
   */
  const updateUser = useCallback(async (id: number, data: UpdateUserRequest): Promise<ServiceResult<UserInfo>> => {
    setLoading(true);
    setError(null);

    try {
      const users: UserInfo[] = await getData(ADMIN_USERS_KEY) || [];
      const userIndex = users.findIndex(u => u.id === id);

      if (userIndex === -1) {
        return {
          success: false,
          error: '유저를 찾을 수 없습니다.',
        };
      }

      // 유저 정보 업데이트
      const existingUser = users[userIndex];
      if (!existingUser) {
        return {
          success: false,
          error: '유저를 찾을 수 없습니다.',
        };
      }

      users[userIndex] = {
        id: existingUser.id,
        username: existingUser.username || '',
        nickname: (data.nickname ?? existingUser.nickname) || '',
        role: (data.role ?? existingUser.role) || 'user',
        email: data.email ?? existingUser.email,
        isActive: existingUser.isActive,
        createdAt: existingUser.createdAt,
      };

      await setData(ADMIN_USERS_KEY, users);

      return {
        success: true,
        data: users[userIndex],
      };
    } catch (err) {
      const errorMessage = '유저 정보를 수정하는데 실패했습니다.';
      logError(errorMessage, err as Error);
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 유저 비활성화
   */
  const deactivateUser = useCallback(async (id: number): Promise<ServiceResult<UserInfo>> => {
    return updateUser(id, { isActive: false } as any);
  }, [updateUser]);

  /**
   * 유저 활성화
   */
  const activateUser = useCallback(async (id: number): Promise<ServiceResult<UserInfo>> => {
    return updateUser(id, { isActive: true } as any);
  }, [updateUser]);

  /**
   * 전체 유저 삭제
   * 모든 유저 데이터와 관련 데이터를 삭제합니다
   */
  const deleteAllUsers = useCallback(async (): Promise<ServiceResult<{ deletedCount: number }>> => {
    setLoading(true);
    setError(null);

    try {
      // AsyncStorage의 모든 키 가져오기
      const allKeys = await AsyncStorage.getAllKeys();

      // 삭제할 키들 필터링
      const keysToDelete: string[] = [];

      // user_로 시작하는 키들 (유저 기본 정보)
      const userKeys = allKeys.filter(key => key.startsWith('user_') && !key.includes('userNickname'));
      keysToDelete.push(...userKeys);

      // 각 유저의 관련 데이터 키들 찾기
      for (const userKey of userKeys) {
        const nickname = userKey.replace('user_', '');
        const storageKeys = getStorageKeys(nickname);

        // 유저별 데이터 키들 추가
        if (allKeys.includes(storageKeys.MISSIONS)) keysToDelete.push(storageKeys.MISSIONS);
        if (allKeys.includes(storageKeys.DIARIES)) keysToDelete.push(storageKeys.DIARIES);
        if (allKeys.includes(storageKeys.CHARACTERS)) keysToDelete.push(storageKeys.CHARACTERS);
        if (allKeys.includes(storageKeys.SETTINGS)) keysToDelete.push(storageKeys.SETTINGS);
        if (allKeys.includes(storageKeys.PREFERENCES)) keysToDelete.push(storageKeys.PREFERENCES);
        if (allKeys.includes(storageKeys.USER_LIKES)) keysToDelete.push(storageKeys.USER_LIKES);
        if (allKeys.includes(storageKeys.USER_SCRAPS)) keysToDelete.push(storageKeys.USER_SCRAPS);
        if (allKeys.includes(storageKeys.CALENDAR_EVENTS)) keysToDelete.push(storageKeys.CALENDAR_EVENTS);
        if (allKeys.includes(storageKeys.AI_ANALYSIS_RESULTS)) keysToDelete.push(storageKeys.AI_ANALYSIS_RESULTS);
      }

      // userNickname_으로 시작하는 키들도 삭제
      const nicknameKeys = allKeys.filter(key => key.startsWith('userNickname_'));
      keysToDelete.push(...nicknameKeys);

      // 중복 제거
      const uniqueKeysToDelete = [...new Set(keysToDelete)];

      // 모든 키 삭제
      await AsyncStorage.multiRemove(uniqueKeysToDelete);

      const deletedCount = userKeys.length;

      return {
        success: true,
        data: { deletedCount },
      };
    } catch (err) {
      const errorMessage = '전체 유저 삭제에 실패했습니다.';
      logError(errorMessage, err as Error);
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getAllUsers,
    getUserDetail,
    updateUser,
    deactivateUser,
    activateUser,
    deleteAllUsers,
  };
};
