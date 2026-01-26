/**
 * 통합 비동기 작업 처리 Hook
 * 
 * 로딩 상태와 에러 처리를 통합한 비동기 작업 관리 훅
 * useErrorHandler와 함께 사용하여 완전한 비동기 작업 처리
 * 
 * @example
 * ```tsx
 * const { execute, loading, error } = useAsyncOperation(
 *   async () => {
 *     const result = await someApiCall();
 *     if (!result.success) {
 *       throw new Error(result.error);
 *     }
 *     return result.data;
 *   },
 *   {
 *     onSuccess: (data) => {
 *       console.log('성공:', data);
 *     },
 *     onError: (error) => {
 *       console.log('에러:', error);
 *     }
 *   }
 * );
 * 
 * // 사용
 * const handleAction = async () => {
 *   const data = await execute();
 *   if (data) {
 *     // 성공 처리
 *   }
 * };
 * ```
 */

import { useState, useCallback } from 'react';
import { useErrorHandler, UseErrorHandlerOverrides } from './useErrorHandler';
import { ServiceResult } from '../types';

interface UseAsyncOperationOptions<T> {
  /**
   * 성공 시 호출되는 콜백
   */
  onSuccess?: (data: T) => void;

  /**
   * 에러 시 호출되는 콜백
   */
  onError?: (error: string) => void;

  /**
   * 에러를 자동으로 표시할지 여부 (기본값: true)
   */
  showError?: boolean;

  /**
   * 에러 발생 컨텍스트 (로깅용)
   */
  context?: string;

  /**
   * useErrorHandler에 전달할 오버라이드 (커스텀 모달 사용 시)
   */
  errorHandlerOverrides?: UseErrorHandlerOverrides;
}

interface UseAsyncOperationReturn<T> {
  /**
   * 비동기 작업 실행 함수
   * @returns 성공 시 데이터, 실패 시 undefined
   */
  execute: () => Promise<T | undefined>;
  
  /**
   * 로딩 상태
   */
  loading: boolean;
  
  /**
   * 에러 메시지 (에러 발생 시)
   */
  error: string | null;
  
  /**
   * 에러 상태 초기화
   */
  resetError: () => void;
}

/**
 * 통합 비동기 작업 처리 Hook
 * 
 * @param operation - 실행할 비동기 작업 함수
 * @param options - 옵션 (onSuccess, onError, showError, context)
 * @returns execute 함수, loading 상태, error 상태, resetError 함수
 */
export const useAsyncOperation = <T,>(
  operation: () => Promise<ServiceResult<T>>,
  options?: UseAsyncOperationOptions<T>
): UseAsyncOperationReturn<T> => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    onSuccess,
    onError,
    showError = true,
    context,
    errorHandlerOverrides,
  } = options || {};

  const { showError: showErrorAlert, handleApiError } = useErrorHandler(errorHandlerOverrides);

  /**
   * 에러 상태 초기화
   */
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * 비동기 작업 실행
   */
  const execute = useCallback(async (): Promise<T | undefined> => {
    setLoading(true);
    setError(null);

    try {
      const result = await operation();

      if (result.success && result.data !== undefined) {
        onSuccess?.(result.data);
        return result.data;
      } else {
        const errorMessage = result.error || '작업에 실패했습니다.';
        setError(errorMessage);

        if (showError) {
          handleApiError(result, context);
        }

        onError?.(errorMessage);
        return undefined;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';

      setError(errorMessage);

      if (showError) {
        showErrorAlert(
          err instanceof Error ? err : new Error(errorMessage),
          context
        );
      }

      onError?.(errorMessage);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [operation, onSuccess, onError, showError, context, handleApiError, showErrorAlert]);

  return {
    execute,
    loading,
    error,
    resetError,
  };
};
