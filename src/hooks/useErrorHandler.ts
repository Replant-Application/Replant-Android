/**
 * 통합 에러 처리 Hook
 * 
 * 모든 화면에서 일관된 에러 처리를 위한 커스텀 훅
 * Alert.alert와 console.log/error의 중복 사용을 제거
 * 
 * @example
 * ```tsx
 * const { showError, showSuccess, handleApiError } = useErrorHandler();
 * 
 * // 에러 표시
 * showError('작업에 실패했습니다.');
 * 
 * // API 에러 처리
 * const result = await someApiCall();
 * if (!result.success) {
 *   handleApiError(result);
 * }
 * 
 * // 성공 메시지
 * showSuccess('작업이 완료되었습니다.');
 * ```
 */

import { useCallback } from 'react';
import { Alert } from 'react-native';
import { logError } from '../utils/logger';
import { ServiceResult } from '../types';

interface UseErrorHandlerReturn {
  /**
   * 에러 메시지를 표시합니다
   * @param error - Error 객체 또는 에러 메시지 문자열
   * @param context - 에러 발생 컨텍스트 (로깅용)
   */
  showError: (error: Error | string, context?: string) => void;

  /**
   * 성공 메시지를 표시합니다
   * @param message - 성공 메시지
   * @param title - 알림 제목 (기본값: '성공')
   */
  showSuccess: (message: string, title?: string) => void;

  /**
   * 정보 메시지를 표시합니다
   * @param message - 정보 메시지
   * @param title - 알림 제목 (기본값: '알림')
   */
  showInfo: (message: string, title?: string) => void;

  /**
   * API 응답 결과를 처리하고 에러가 있으면 표시합니다
   * @param result - ServiceResult 타입의 API 응답
   * @param context - 에러 발생 컨텍스트 (로깅용)
   * @returns 에러가 있으면 true, 없으면 false
   */
  handleApiError: <T>(result: ServiceResult<T>, context?: string) => boolean;

  /**
   * 확인 다이얼로그를 표시합니다
   * @param message - 확인 메시지
   * @param onConfirm - 확인 버튼 클릭 시 실행할 함수
   * @param title - 다이얼로그 제목 (기본값: '확인')
   */
  showConfirm: (message: string, onConfirm: () => void, title?: string) => void;
}

/**
 * 통합 에러 처리 Hook
 */
export const useErrorHandler = (): UseErrorHandlerReturn => {
  /**
   * 에러 메시지 표시
   */
  const showError = useCallback((error: Error | string, context?: string) => {
    const message = typeof error === 'string' 
      ? error 
      : error.message || '알 수 없는 오류가 발생했습니다.';
    
    // 에러 로깅
    if (typeof error === 'object' && error instanceof Error) {
      logError(message, error, { context });
    } else {
      logError(message, new Error(message), { context });
    }
    
    // 사용자에게 에러 표시
    Alert.alert('오류', message);
  }, []);

  /**
   * 성공 메시지 표시
   */
  const showSuccess = useCallback((message: string, title: string = '성공') => {
    Alert.alert(title, message);
  }, []);

  /**
   * 정보 메시지 표시
   */
  const showInfo = useCallback((message: string, title: string = '알림') => {
    Alert.alert(title, message);
  }, []);

  /**
   * API 에러 처리
   */
  const handleApiError = useCallback(<T,>(
    result: ServiceResult<T>,
    context?: string
  ): boolean => {
    if (!result.success && result.error) {
      showError(result.error, context || 'API');
      return true; // 에러가 있었음
    }
    return false; // 에러가 없음
  }, [showError]);

  /**
   * 확인 다이얼로그 표시
   */
  const showConfirm = useCallback((
    message: string,
    onConfirm: () => void,
    title: string = '확인'
  ) => {
    Alert.alert(
      title,
      message,
      [
        { text: '취소', style: 'cancel' },
        { text: '확인', onPress: onConfirm }
      ]
    );
  }, []);

  return {
    showError,
    showSuccess,
    showInfo,
    handleApiError,
    showConfirm,
  };
};
