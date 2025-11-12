/**
 * 관리자 기능 훅
 * 유저 관리 기능 제공
 */

import { useState, useCallback } from 'react';
import { getData, setData } from '../services/storage';
import { logError } from '../utils/logger';
import { ServiceResult } from '../types';
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
   */
  const getAllUsers = useCallback(async (params?: { page?: number; limit?: number }): Promise<ServiceResult<UserInfo[]>> => {
    setLoading(true);
    setError(null);

    try {
      // 로컬 저장소에서 유저 목록 가져오기
      const users: UserInfo[] = await getData(ADMIN_USERS_KEY) || [];

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
      const users: UserInfo[] = await getData(ADMIN_USERS_KEY) || [];
      const user = users.find(u => u.id === id);

      if (!user) {
        return {
          success: false,
          error: '유저를 찾을 수 없습니다.',
        };
      }

      return {
        success: true,
        data: user,
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
  }, []);

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
      users[userIndex] = {
        ...users[userIndex],
        ...data,
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

  return {
    loading,
    error,
    getAllUsers,
    getUserDetail,
    updateUser,
    deactivateUser,
    activateUser,
  };
};

