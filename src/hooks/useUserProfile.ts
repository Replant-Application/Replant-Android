/**
 * 사용자 프로필 관리 Hook
 * 프로필 정보 조회 및 수정 기능 제공
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getUserProfile, updateUserInfo } from '../services/userService';
import { useUser } from '../contexts/UserContext';
import { logError } from '../utils/logger';
import { UserProfile, UseUserProfileReturn, UserInfoUpdateData, ServiceResult } from '../types';

export const useUserProfile = (): UseUserProfileReturn => {
  const { currentNickname } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 프로필 로드
  const loadProfile = useCallback(async (): Promise<void> => {
    if (!currentNickname) return;

    try {
      setLoading(true);
      setError(null);

      const result = await getUserProfile(currentNickname);
      
      if (result.success && result.data) {
        setProfile(result.data);
      } else {
        setError(result.error || '프로필을 불러올 수 없습니다.');
      }
    } catch (loadError) {
      logError('프로필 로드 실패', loadError as Error, { currentNickname });
      setError((loadError as Error).message);
    } finally {
      setLoading(false);
    }
  }, [currentNickname]);

  // 초기 로드
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // 사용자 정보 수정
  const updateUserInfoHandler = useCallback(async (
    data: UserInfoUpdateData
  ): Promise<ServiceResult<void>> => {
    if (!currentNickname) {
      return { success: false, error: '사용자 정보가 없습니다.' };
    }

    try {
      const result = await updateUserInfo(currentNickname, data);
      
      if (result.success) {
        // 프로필 다시 로드
        await loadProfile();
      }
      
      return result;
    } catch (updateError) {
      logError('사용자 정보 수정 실패', updateError as Error, { currentNickname, data });
      return {
        success: false,
        error: (updateError as Error).message,
      };
    }
  }, [currentNickname, loadProfile]);

  // 메모이제이션된 반환 객체
  return useMemo(() => ({
    profile,
    loading,
    error,
    loadProfile,
    updateUserInfo: updateUserInfoHandler,
  }), [
    profile,
    loading,
    error,
    loadProfile,
    updateUserInfoHandler,
  ]);
};

