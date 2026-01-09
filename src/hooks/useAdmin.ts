/**
 * 관리자 기능 훅
 * 백엔드 AdminController API와 연동
 */

import { useState, useCallback } from 'react';
import { apiClient } from '../api/client';
import { logError } from '../utils/logger';
import { ServiceResult } from '../types';

// ============================================
// 타입 정의
// ============================================

/**
 * 회원 정보 - 백엔드 UserResponseDto와 매칭
 */
export interface MemberInfo {
  id: number;
  email: string;
  nickname: string;
  phone?: string;
  birthDate?: string;
  gender?: 'MALE' | 'FEMALE';
  profileImg?: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';  // 백엔드 status 필드
  isActive?: boolean;  // 하위 호환성을 위해 유지
  createdAt: string;
  lastLoginAt?: string;
  totalMissionsCompleted?: number;
  totalExpGained?: number;
}

/**
 * 회원 상세 정보 (통계 포함)
 */
export interface MemberDetail extends MemberInfo {
  reant?: {
    level?: number;
    exp?: number;
  };
  statistics?: {
    missionCount?: number;
    postCount?: number;
    diaryCount?: number;
  };
}

// ============================================
// 관리자 훅
// ============================================

export const useAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 전체 회원 목록 조회
   * GET /admin/members
   */
  const getAllUsers = useCallback(async (params?: { page?: number; limit?: number }): Promise<ServiceResult<MemberInfo[]>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.get<MemberInfo[]>('/admin/members', {
        page: params?.page || 0,
        size: params?.limit || 50,
      });

      if (result.success) {
        return {
          success: true,
          data: result.data || [],
        };
      }

      return {
        success: false,
        error: result.error || '회원 목록을 불러오는데 실패했습니다.',
      };
    } catch (err) {
      const errorMessage = '회원 목록을 불러오는데 실패했습니다.';
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
   * 회원 상세 조회
   * GET /admin/members/:id
   */
  const getUserDetail = useCallback(async (id: number): Promise<ServiceResult<MemberDetail>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.get<MemberDetail>(`/admin/members/${id}`);

      if (result.success && result.data) {
        return {
          success: true,
          data: result.data,
        };
      }

      return {
        success: false,
        error: result.error || '회원 정보를 불러오는데 실패했습니다.',
      };
    } catch (err) {
      const errorMessage = '회원 정보를 불러오는데 실패했습니다.';
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
   * 회원 역할 변경
   * PATCH /admin/members/:id/role?role=xxx
   */
  const updateUserRole = useCallback(async (id: number, role: string): Promise<ServiceResult<MemberInfo>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.patch<MemberInfo>(`/admin/members/${id}/role?role=${role}`);

      if (result.success && result.data) {
        return {
          success: true,
          data: result.data,
        };
      }

      return {
        success: false,
        error: result.error || '역할 변경에 실패했습니다.',
      };
    } catch (err) {
      const errorMessage = '역할 변경에 실패했습니다.';
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
   * 커스텀 알림 전송
   * POST /admin/send/custom
   */
  const sendCustomNotification = useCallback(async (memberId: string, message: string): Promise<ServiceResult<{ message: string }>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.post<{ message: string }>('/admin/send/custom', {
        memberId,
        message,
      });

      if (result.success) {
        return {
          success: true,
          data: result.data,
        };
      }

      return {
        success: false,
        error: result.error || '알림 전송에 실패했습니다.',
      };
    } catch (err) {
      const errorMessage = '알림 전송에 실패했습니다.';
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
   * 일기 알림 전송
   * POST /admin/send/diary
   */
  const sendDiaryNotification = useCallback(async (memberId: string): Promise<ServiceResult<{ message: string }>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.post<{ message: string }>('/admin/send/diary', {
        memberId,
      });

      if (result.success) {
        return {
          success: true,
          data: result.data,
        };
      }

      return {
        success: false,
        error: result.error || '일기 알림 전송에 실패했습니다.',
      };
    } catch (err) {
      const errorMessage = '일기 알림 전송에 실패했습니다.';
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
   * 리포트 알림 전송
   * POST /admin/send/report
   */
  const sendReportNotification = useCallback(async (memberId: string): Promise<ServiceResult<{ message: string }>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.post<{ message: string }>('/admin/send/report', {
        memberId,
      });

      if (result.success) {
        return {
          success: true,
          data: result.data,
        };
      }

      return {
        success: false,
        error: result.error || '리포트 알림 전송에 실패했습니다.',
      };
    } catch (err) {
      const errorMessage = '리포트 알림 전송에 실패했습니다.';
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
   * 미션 수 조회
   * GET /admin/mission-count
   */
  const getMissionCount = useCallback(async (): Promise<ServiceResult<number>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.get<number>('/admin/mission-count');

      if (result.success) {
        return {
          success: true,
          data: result.data || 0,
        };
      }

      return {
        success: false,
        error: result.error || '미션 수 조회에 실패했습니다.',
      };
    } catch (err) {
      const errorMessage = '미션 수 조회에 실패했습니다.';
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
   * 미션 데이터 초기화
   * POST /admin/reset-missions
   */
  const resetMissions = useCallback(async (): Promise<ServiceResult<{ message: string }>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.post<{ message: string }>('/admin/reset-missions');

      if (result.success) {
        return {
          success: true,
          data: result.data,
        };
      }

      return {
        success: false,
        error: result.error || '미션 초기화에 실패했습니다.',
      };
    } catch (err) {
      const errorMessage = '미션 초기화에 실패했습니다.';
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
   * 관리자 설정
   * POST /admin/setup-admin?email=xxx
   */
  const setupAdmin = useCallback(async (email: string): Promise<ServiceResult<{ message: string }>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.post<{ message: string }>(`/admin/setup-admin?email=${encodeURIComponent(email)}`);

      if (result.success) {
        return {
          success: true,
          data: result.data,
        };
      }

      return {
        success: false,
        error: result.error || '관리자 설정에 실패했습니다.',
      };
    } catch (err) {
      const errorMessage = '관리자 설정에 실패했습니다.';
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
   * 회원 비활성화
   * PATCH /admin/members/:id/status?status=INACTIVE
   */
  const deactivateUser = useCallback(async (id: number): Promise<ServiceResult<MemberInfo>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.patch<MemberInfo>(`/admin/members/${id}/status?status=INACTIVE`);

      if (result.success && result.data) {
        return {
          success: true,
          data: result.data,
        };
      }

      return {
        success: false,
        error: result.error || '회원 비활성화에 실패했습니다.',
      };
    } catch (err) {
      const errorMessage = '회원 비활성화에 실패했습니다.';
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
   * 회원 활성화
   * PATCH /admin/members/:id/status?status=ACTIVE
   */
  const activateUser = useCallback(async (id: number): Promise<ServiceResult<MemberInfo>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.patch<MemberInfo>(`/admin/members/${id}/status?status=ACTIVE`);

      if (result.success && result.data) {
        return {
          success: true,
          data: result.data,
        };
      }

      return {
        success: false,
        error: result.error || '회원 활성화에 실패했습니다.',
      };
    } catch (err) {
      const errorMessage = '회원 활성화에 실패했습니다.';
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
   * 전체 회원 삭제 (개발용)
   * DELETE /admin/members/all
   */
  const deleteAllUsers = useCallback(async (): Promise<ServiceResult<{ deletedCount: number }>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.delete<{ deletedCount: number }>('/admin/members/all');

      if (result.success) {
        return {
          success: true,
          data: result.data,
        };
      }

      return {
        success: false,
        error: result.error || '회원 전체 삭제에 실패했습니다.',
      };
    } catch (err) {
      const errorMessage = '회원 전체 삭제에 실패했습니다.';
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
    updateUserRole,
    deactivateUser,
    activateUser,
    deleteAllUsers,
    sendCustomNotification,
    sendDiaryNotification,
    sendReportNotification,
    getMissionCount,
    resetMissions,
    setupAdmin,
  };
};
