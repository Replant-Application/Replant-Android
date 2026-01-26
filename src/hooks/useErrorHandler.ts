/**
 * 통합 에러 처리 Hook
 *
 * 모든 화면에서 일관된 에러 처리를 위한 커스텀 훅
 * Alert.alert와 console.log/error의 중복 사용을 제거
 *
 * overrides를 넘기면 AlertModal/ConfirmModal 등 커스텀 모달로 표시 가능.
 * overrides 없으면 기존대로 Alert.alert 사용.
 *
 * @example
 * ```tsx
 * // 기본 (Alert.alert)
 * const { showError, handleApiError } = useErrorHandler();
 *
 * // 커스텀 모달 연동
 * const { showError, handleApiError } = useErrorHandler({
 *   onShowError: (t, m) => { setAlertTitle(t); setAlertMessage(m); setShowAlert(true); },
 * });
 * ```
 */

import { useCallback } from 'react';
import { Alert } from 'react-native';
import { logError } from '../utils/logger';
import { ServiceResult } from '../types';

/**
 * 커스텀 모달로 표시할 때 사용하는 오버라이드.
 * 각 콜백이 있으면 해당 콜백 사용 (로깅은 hook 내부에서 유지), 없으면 Alert.alert.
 */
export interface UseErrorHandlerOverrides {
  onShowError?: (title: string, message: string) => void;
  onShowSuccess?: (title: string, message: string) => void;
  onShowInfo?: (title: string, message: string) => void;
  /**
   * 확인 다이얼로그. 화면에서 ConfirmModal을 띄우고, 확인 시 onConfirm 호출.
   */
  onShowConfirm?: (title: string, message: string, onConfirm: () => void) => void;
}

interface UseErrorHandlerReturn {
  showError: (error: Error | string, context?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  handleApiError: <T>(result: ServiceResult<T>, context?: string) => boolean;
  showConfirm: (message: string, onConfirm: () => void, title?: string) => void;
}

/**
 * 통합 에러 처리 Hook
 * @param overrides - 커스텀 모달용 콜백. 없거나 해당 콜백 없으면 Alert.alert 사용.
 */
export const useErrorHandler = (overrides?: UseErrorHandlerOverrides): UseErrorHandlerReturn => {
  const showError = useCallback(
    (error: Error | string, context?: string) => {
      const message =
        typeof error === 'string' ? error : error.message || '알 수 없는 오류가 발생했습니다.';

      if (typeof error === 'object' && error instanceof Error) {
        logError(message, error, { context });
      } else {
        logError(message, new Error(message), { context });
      }

      if (overrides?.onShowError) {
        overrides.onShowError('오류', message);
      } else {
        Alert.alert('오류', message);
      }
    },
    [overrides]
  );

  const showSuccess = useCallback(
    (message: string, title: string = '성공') => {
      if (overrides?.onShowSuccess) {
        overrides.onShowSuccess(title, message);
      } else {
        Alert.alert(title, message);
      }
    },
    [overrides]
  );

  const showInfo = useCallback(
    (message: string, title: string = '알림') => {
      if (overrides?.onShowInfo) {
        overrides.onShowInfo(title, message);
      } else {
        Alert.alert(title, message);
      }
    },
    [overrides]
  );

  const handleApiError = useCallback(
    <T,>(result: ServiceResult<T>, context?: string): boolean => {
      if (!result.success && result.error) {
        showError(result.error, context || 'API');
        return true;
      }
      return false;
    },
    [showError]
  );

  const showConfirm = useCallback(
    (message: string, onConfirm: () => void, title: string = '확인') => {
      if (overrides?.onShowConfirm) {
        overrides.onShowConfirm(title, message, onConfirm);
      } else {
        Alert.alert(title, message, [
          { text: '취소', style: 'cancel' },
          { text: '확인', onPress: onConfirm },
        ]);
      }
    },
    [overrides]
  );

  return {
    showError,
    showSuccess,
    showInfo,
    handleApiError,
    showConfirm,
  };
};
