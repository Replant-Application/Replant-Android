/**
 * SpontaneousMissionSetupScreen 비즈니스 로직
 * 돌발 미션 설정: 일단 기상 시간만 설정 (취침·식사는 비노출)
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import {
  setupSpontaneousMission,
  getSpontaneousMissionSetup,
  updateSpontaneousMissionSetup,
} from '../../api/missionApi';
import { logError } from '../../utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SCREEN_NAMES } from '../../utils/constants';

interface SpontaneousMissionSetupScreenContainerProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'SpontaneousMissionSetup'>;
}

export type Step = 'wake';

export interface TimeState {
  period: 'AM' | 'PM';
  hour: number;
  minute: number;
}

export const STEP_CONFIG: Record<Step, { title: string; description: string }> = {
  wake: {
    title: '기상 시간을 알려주세요',
    description: '평소에 일어나는 시간을 설정해주세요.',
  },
};

export const STEPS: Step[] = ['wake'];

export const useSpontaneousMissionSetupScreenContainer = ({
  navigation,
  route,
}: SpontaneousMissionSetupScreenContainerProps) => {
  // route가 없거나 params가 없을 수 있으므로 안전하게 처리
  const routeParams = route?.params as any;
  const mode = routeParams && routeParams.mode ? routeParams.mode : 'create'; // create: 신규 설정, edit: 수정
  const isEditMode = mode === 'edit';

  // navigation이 없으면 기본 navigation 객체 생성
  const safeNavigation = useMemo(
    () => navigation || { navigate: () => {}, goBack: () => {} } as any,
    [navigation]
  );

  const [currentStep, setCurrentStep] = useState<number>(0);

  // currentStep이 유효한 범위 내에 있는지 확인
  const safeCurrentStep = Math.max(0, Math.min(currentStep, STEPS.length - 1));
  const [wakeTime, setWakeTime] = useState<TimeState>({ period: 'AM', hour: 7, minute: 0 });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onClose?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  /**
   * currentStepKey와 stepConfig를 안전하게 가져오기
   */
  const currentStepKey = useMemo(() => {
    try {
      const step = STEPS[safeCurrentStep];
      return step || STEPS[0];
    } catch (error) {
      logError('currentStepKey 계산 실패', error as Error);
      return STEPS[0];
    }
  }, [safeCurrentStep]);

  const stepConfig = useMemo(() => {
    try {
      const config = STEP_CONFIG[currentStepKey];
      return config || STEP_CONFIG[STEPS[0]];
    } catch (error) {
      logError('stepConfig 계산 실패', error as Error);
      return STEP_CONFIG[STEPS[0]];
    }
  }, [currentStepKey]);

  /**
   * 현재 스텝의 시간 상태 가져오기
   */
  const getCurrentTime = useCallback((): TimeState => {
    return wakeTime || { period: 'AM', hour: 7, minute: 0 };
  }, [wakeTime]);

  /**
   * 현재 스텝의 시간 상태 설정하기
   */
  const setCurrentTime = useCallback((time: TimeState) => {
    if (time && typeof time === 'object') setWakeTime(time);
  }, []);

  /**
   * 24시간 형식으로 변환
   */
  const convertTo24Hour = useCallback((period: 'AM' | 'PM', hour: number, minute: number): string => {
    let hours24 = hour;
    if (period === 'PM' && hour !== 12) hours24 = hour + 12;
    else if (period === 'AM' && hour === 12) hours24 = 0;
    return `${String(hours24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }, []);

  /**
   * 시간 표시 형식
   */
  const formatTimeDisplay = useCallback((time: TimeState): string => {
    const periodText = time.period === 'AM' ? '오전' : '오후';
    return `${periodText} ${time.hour}시 ${time.minute > 0 ? `${time.minute}분` : ''}`;
  }, []);

  /**
   * 24시간 형식을 TimeState로 변환
   */
  const parse24Hour = useCallback((time24: string): TimeState => {
    try {
      if (!time24 || typeof time24 !== 'string') {
        return { period: 'AM', hour: 7, minute: 0 };
      }
      const [hours, minutes] = time24.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) {
        return { period: 'AM', hour: 7, minute: 0 };
      }
      const period = hours >= 12 ? 'PM' : 'AM';
      let hour = hours % 12;
      if (hour === 0) hour = 12;
      return { period, hour, minute: minutes || 0 };
    } catch (error) {
      logError('시간 파싱 실패', error as Error);
      return { period: 'AM', hour: 7, minute: 0 };
    }
  }, []);

  /**
   * 수정 모드일 때 기존 설정 불러오기
   */
  useEffect(() => {
    if (isEditMode) {
      const loadExistingSetup = async () => {
        try {
          setInitialLoading(true);
          console.log('[SpontaneousMissionSetupScreen] 기존 설정 조회 시작');
          const result = await getSpontaneousMissionSetup();

          console.log('[SpontaneousMissionSetupScreen] API 응답:', {
            success: result.success,
            hasData: !!result.data,
            error: result.error,
          });

          if (result.success && result.data) {
            const data = result.data;
            console.log('[SpontaneousMissionSetupScreen] 받은 설정 데이터:', data);

            const hasWakeTime =
              data.wakeTime &&
              typeof data.wakeTime === 'string' &&
              data.wakeTime.trim() !== '';

            if (hasWakeTime) {
              setWakeTime(parse24Hour(data.wakeTime));
              console.log('[SpontaneousMissionSetupScreen] 설정 로드 완료');
            } else {
              console.warn('[SpontaneousMissionSetupScreen] ⚠️ 기상 시간 없음');
              setCurrentStep(0);
            }
          } else {
            // 설정이 없거나 조회 실패
            const errorMessage = result.error || '';
            const isNotFound =
              errorMessage.includes('404') ||
              errorMessage.includes('Not Found') ||
              errorMessage.includes('찾을 수 없습니다') ||
              errorMessage.toLowerCase().includes('not found');

            if (isNotFound) {
              console.log('[SpontaneousMissionSetupScreen] 설정 없음(404) → 신규 설정 모드로 자동 전환');
              setCurrentStep(0);
            } else {
              setAlertModal({
                visible: true,
                title: '오류',
                message: errorMessage || '설정을 불러올 수 없습니다.',
                onClose: () => {
                  setAlertModal({ visible: false, title: '', message: '' });
                  try {
                    if (safeNavigation && typeof safeNavigation.goBack === 'function') {
                      safeNavigation.goBack();
                    }
                  } catch (error) {
                    logError('뒤로가기 실패', error as Error);
                  }
                },
              });
            }
          }
        } catch (error) {
          console.error('[SpontaneousMissionSetupScreen] 예외 발생:', error);
          logError('돌발 미션 설정 조회 실패', error as Error);

          const errorMessage = error instanceof Error ? error.message : String(error);
          const isNetworkError =
            errorMessage.includes('Network') ||
            errorMessage.includes('network') ||
            errorMessage.includes('네트워크') ||
            errorMessage.includes('fetch');

          setAlertModal({
            visible: true,
            title: '오류',
            message: isNetworkError ? '네트워크 연결을 확인해주세요.' : '설정을 불러오는 중 오류가 발생했습니다.',
            onClose: () => {
              setAlertModal({ visible: false, title: '', message: '' });
              try {
                if (safeNavigation && typeof safeNavigation.goBack === 'function') {
                  safeNavigation.goBack();
                }
              } catch (err) {
                logError('뒤로가기 실패', err as Error);
              }
            },
          });
        } finally {
          setInitialLoading(false);
        }
      };

      loadExistingSetup();
    } else {
      // 신규 설정 모드일 때는 로딩 완료
      setInitialLoading(false);
    }
  }, [isEditMode, safeNavigation, parse24Hour]);

  /**
   * 설정 제출
   */
  const handleSubmit = useCallback(async () => {
    try {
      setLoading(true);

      const requestData = {
        wakeTime: convertTo24Hour(wakeTime.period, wakeTime.hour, wakeTime.minute),
      };

      const result = isEditMode
        ? await updateSpontaneousMissionSetup(requestData)
        : await setupSpontaneousMission(requestData);

      if (result.success && result.data) {
        // API 응답에서 설정 완료 여부 확인
        const isCompleted = result.data.isSpontaneousMissionSetupCompleted ?? true;

        // 설정 완료 여부를 로컬 스토리지에 저장
        await AsyncStorage.setItem('@replant:spontaneousMissionSetupCompleted', String(isCompleted));

        // 수정 모드일 때는 설정 화면으로 이동, 신규 설정일 때는 홈으로 이동
        if (isEditMode) {
          setAlertModal({
            visible: true,
            title: '완료',
            message: '설정이 수정되었습니다.',
            onClose: () => {
              setAlertModal({ visible: false, title: '', message: '' });
              try {
                if (safeNavigation && typeof safeNavigation.navigate === 'function') {
                  safeNavigation.navigate(SCREEN_NAMES.SETTINGS as any);
                } else if (safeNavigation && typeof safeNavigation.goBack === 'function') {
                  safeNavigation.goBack();
                }
              } catch (error) {
                logError('설정 화면 이동 실패', error as Error);
              }
            },
          });
        } else {
          // 신규 설정 완료 후 홈 화면으로 직접 이동
          await AsyncStorage.setItem('@replant:spontaneousMissionSetupCompleted', String(isCompleted));

          try {
            if (safeNavigation && typeof safeNavigation.navigate === 'function') {
              safeNavigation.navigate(SCREEN_NAMES.HOME as any);
            }
          } catch (error) {
            logError('홈 화면 이동 실패', error as Error);
          }
        }
      } else {
        // 에러 메시지 처리
        const errorMessage = result.error || (isEditMode ? '설정 수정에 실패했습니다.' : '설정 저장에 실패했습니다.');
        setAlertModal({
          visible: true,
          title: '오류',
          message: errorMessage,
          onClose: () => {
            setAlertModal({ visible: false, title: '', message: '' });
          },
        });
      }
    } catch (error) {
      logError('돌발 미션 설정 실패', error as Error);
      setAlertModal({
        visible: true,
        title: '오류',
        message: '설정 저장 중 오류가 발생했습니다.',
        onClose: () => {
          setAlertModal({ visible: false, title: '', message: '' });
        },
      });
    } finally {
      setLoading(false);
    }
  }, [isEditMode, wakeTime, convertTo24Hour, safeNavigation]);

  /**
   * 다음 스텝으로 이동
   */
  const handleNext = useCallback(() => {
    try {
      if (safeCurrentStep < STEPS.length - 1) {
        setCurrentStep(safeCurrentStep + 1);
      } else {
        handleSubmit();
      }
    } catch (error) {
      logError('다음 스텝 이동 실패', error as Error);
    }
  }, [safeCurrentStep, handleSubmit]);

  /**
   * 이전 스텝으로 이동
   */
  const handlePrev = useCallback(() => {
    try {
      if (safeCurrentStep > 0) {
        setCurrentStep(safeCurrentStep - 1);
      }
    } catch (error) {
      logError('이전 스텝 이동 실패', error as Error);
    }
  }, [safeCurrentStep]);

  /**
   * currentTime을 안전하게 가져오기
   */
  const currentTime = useMemo(() => {
    try {
      const time = getCurrentTime();
      if (
        !time ||
        typeof time !== 'object' ||
        !time.period ||
        typeof time.hour !== 'number' ||
        typeof time.minute !== 'number'
      ) {
        console.warn('[SpontaneousMissionSetupScreen] currentTime이 유효하지 않음, 기본값 사용');
        return { period: 'AM' as const, hour: 7, minute: 0 };
      }
      return time;
    } catch (error) {
      logError('currentTime 가져오기 실패', error as Error);
      return { period: 'AM' as const, hour: 7, minute: 0 };
    }
  }, [getCurrentTime]);

  /**
   * Alert 모달 닫기
   */
  const handleCloseAlert = useCallback(() => {
    if (alertModal.onClose) {
      alertModal.onClose();
    } else {
      setAlertModal({ visible: false, title: '', message: '' });
    }
  }, [alertModal]);

  return {
    // Constants
    STEPS,
    STEP_CONFIG,
    // Route params
    isEditMode,
    safeNavigation,
    // State
    currentStep: safeCurrentStep,
    currentStepKey,
    stepConfig,
    currentTime,
    wakeTime,
    loading,
    initialLoading,
    alertModal,
    // Setters
    setCurrentTime,
    // Handlers
    handleNext,
    handlePrev,
    handleSubmit,
    handleCloseAlert,
    // Utils
    formatTimeDisplay,
  };
};
