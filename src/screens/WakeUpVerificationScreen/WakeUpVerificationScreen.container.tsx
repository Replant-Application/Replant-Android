/**
 * WakeUpVerificationScreen 비즈니스 로직
 * 기상 미션 인증 화면: 타이머 관리, 인증 처리, 사운드 제어
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { getUserMission, verifyWakeupTime, getCurrentWakeupMission, UserMission } from '../../api/missionApi';
import { useWakeUpMission } from '../../contexts/WakeUpMissionContext';
import { Audio } from 'expo-av';
import { loadSoundSettings } from '../../utils/soundSettings';

interface WakeUpVerificationScreenContainerProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'WakeUpVerification'>;
}

export const useWakeUpVerificationScreenContainer = ({
  navigation,
  route,
}: WakeUpVerificationScreenContainerProps) => {
  console.log('[WakeUpVerificationScreen] 렌더링, route:', route);
  console.log('[WakeUpVerificationScreen] route?.params:', route?.params);

  // Context에서 userMissionId 가져오기
  const { currentWakeUpMissionId, getWakeUpMissionId, clearWakeUpMissionId } = useWakeUpMission();
  const [userMissionId, setUserMissionId] = useState<number | undefined>(undefined);
  const [userMission, setUserMission] = useState<UserMission | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const isPlayingFastSound = useRef<boolean>(false);
  const expiredLoggedRef = useRef<boolean>(false);

  /**
   * userMissionId 추출 (우선순위: route.params > Context > AsyncStorage)
   */
  useEffect(() => {
    const extractUserMissionId = async () => {
      const params = route?.params;
      console.log('[기상미션] userMissionId 추출 시작 route.params=', JSON.stringify(params), 'contextId=', currentWakeUpMissionId);

      let extractedId: number | undefined;
      let source = '';

      if (params && 'userMissionId' in params && params.userMissionId !== undefined && params.userMissionId !== null) {
        if (typeof params.userMissionId === 'string') {
          extractedId = Number(params.userMissionId);
        } else if (typeof params.userMissionId === 'number') {
          extractedId = params.userMissionId;
        }
        source = 'route.params';
      }
      if (!extractedId && currentWakeUpMissionId) {
        extractedId = currentWakeUpMissionId;
        source = 'Context';
      }
      if (!extractedId) {
        const storedId = await getWakeUpMissionId();
        if (storedId) {
          extractedId = storedId;
          source = 'AsyncStorage';
        }
      }

      if (extractedId !== undefined && !isNaN(extractedId) && extractedId !== 0) {
        console.log('[기상미션] userMissionId 확정', extractedId, '출처=', source);
        setUserMissionId(extractedId);
      } else {
        console.warn('[기상미션] userMissionId 추출 실패 extractedId=', extractedId, 'params=', params, 'contextId=', currentWakeUpMissionId);
        setUserMissionId(undefined);
      }
    };

    extractUserMissionId();
  }, [route?.params, currentWakeUpMissionId, getWakeUpMissionId]);

  /**
   * 타이머 사운드 재생 함수
   */
  const playTimerSound = useCallback(async (isFast: boolean = false) => {
    try {
      // 기존 사운드 완전히 정리
      if (soundRef.current) {
        try {
          await soundRef.current.stopAsync();
        } catch (e) {
          // 이미 정지된 경우 무시
        }
        try {
          await soundRef.current.unloadAsync();
        } catch (e) {
          // 이미 해제된 경우 무시
        }
        soundRef.current = null;
      }
      isPlayingFastSound.current = false;

      const settings = await loadSoundSettings();
      if (settings.effectVolume <= 0) return;

      const soundFile = isFast
        ? require('../../assets/sounds/clock_fast.mp3')
        : require('../../assets/sounds/clock.mp3');

      const { sound } = await Audio.Sound.createAsync(soundFile, {
        shouldPlay: true,
        volume: settings.effectVolume,
        isLooping: true, // 반복 재생
      });

      soundRef.current = sound;
      isPlayingFastSound.current = isFast;
    } catch (error) {
      console.error('[WakeUpVerificationScreen] 타이머 사운드 재생 실패:', error);
    }
  }, []);

  /**
   * 타이머 사운드 정지
   */
  const stopTimerSound = useCallback(async () => {
    try {
      if (soundRef.current) {
        try {
          await soundRef.current.stopAsync();
        } catch (e) {
          // 이미 정지된 경우 무시
        }
        try {
          await soundRef.current.unloadAsync();
        } catch (e) {
          // 이미 해제된 경우 무시
        }
        soundRef.current = null;
      }
      isPlayingFastSound.current = false;
    } catch (error) {
      console.error('[WakeUpVerificationScreen] 타이머 사운드 정지 실패:', error);
    }
  }, []);

  /**
   * 컴포넌트 unmount 시 사운드 정리
   */
  useEffect(() => {
    return () => {
      // 컴포넌트가 unmount될 때 사운드 정리 (비동기이지만 cleanup에서는 즉시 실행)
      if (soundRef.current) {
        soundRef.current.stopAsync().catch(() => {});
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      isPlayingFastSound.current = false;
    };
  }, []);

  /**
   * 미션 데이터 로드
   */
  const loadMissionData = useCallback(async () => {
    if (!userMissionId || userMissionId === 0 || isNaN(userMissionId)) {
      console.error('[WakeUpVerificationScreen] ❌ 유효하지 않은 userMissionId:', userMissionId);
      setLoading(false);
      setErrorMessage('미션 ID가 유효하지 않습니다.');
      setShowErrorModal(true);
      return;
    }

    try {
      setLoading(true);
      console.log('[WakeUpVerificationScreen] 미션 정보 로드 시작, userMissionId:', userMissionId, '타입:', typeof userMissionId);
      const result = await getUserMission(userMissionId);

      console.log('[WakeUpVerificationScreen] 미션 정보 로드 결과:', {
        success: result.success,
        hasData: !!result.data,
        error: result.error,
        assignedAt: result.data?.assignedAt,
        userMissionId: userMissionId,
      });

      if (result.success && result.data) {
        console.log('[WakeUpVerificationScreen] 미션 정보 로드 성공');
        setUserMission(result.data);
      } else {
        // 404 에러인 경우 특별 처리
        const isNotFound =
          result.error?.includes('찾을 수 없습니다') ||
          result.error?.includes('not found') ||
          result.error?.includes('404');

        if (isNotFound) {
          console.error('[WakeUpVerificationScreen] ❌ 미션을 찾을 수 없음 (404):', {
            userMissionId,
            error: result.error,
          });
          setErrorMessage(
            `미션을 찾을 수 없습니다. (ID: ${userMissionId})\n이미 완료되었거나 삭제된 미션일 수 있습니다.`
          );
        } else {
          console.error('[WakeUpVerificationScreen] ❌ 미션 정보 로드 실패:', result.error);
          setErrorMessage(result.error || '미션 정보를 불러올 수 없습니다.');
        }
        setShowErrorModal(true);
      }
    } catch (error: any) {
      console.error('[WakeUpVerificationScreen] 미션 정보 로드 예외:', error);
      const caughtErrorMessage = error?.message || error?.toString() || '알 수 없는 오류';

      // 404 에러 체크
      if (caughtErrorMessage.includes('404') || caughtErrorMessage.includes('찾을 수 없습니다')) {
        setErrorMessage(
          `미션을 찾을 수 없습니다. (ID: ${userMissionId})\n이미 완료되었거나 삭제된 미션일 수 있습니다.`
        );
      } else {
        setErrorMessage('미션 정보를 불러오는 중 문제가 발생했습니다.');
      }
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  }, [userMissionId]);

  /**
   * 화면 진입 시 현재 활성화된 기상 미션 조회 (백엔드 API 사용)
   */
  useEffect(() => {
    const loadCurrentMission = async () => {
      try {
        setLoading(true);
        console.log('[기상미션] API getCurrentWakeupMission 호출');

        const currentResult = await getCurrentWakeupMission();

        console.log('[기상미션] API 응답 success=', currentResult.success, 'hasData=', !!currentResult.data, 'error=', currentResult.error);
        if (currentResult.data) {
          console.log('[기상미션] API data id=', currentResult.data.id, 'assignedAt=', currentResult.data.assignedAt, 'deadlineAt=', (currentResult.data as any).deadlineAt, 'remainingSeconds=', currentResult.data.remainingSeconds, 'canVerify=', currentResult.data.canVerify, 'expired=', (currentResult.data as any).expired);
        }

        if (currentResult.success && currentResult.data) {
          const data = currentResult.data as any;
          // 백엔드 필드: userMissionId, timeRemaining, canVerify (id/remainingSeconds 아님)
          const apiMissionId = data.id ?? data.userMissionId;
          const apiTimeRemaining = data.remainingSeconds ?? data.timeRemaining;
          const apiAssignedAt = data.assignedAt;
          const apiCanVerify = data.canVerify;

          if (apiMissionId) {
            console.log('[기상미션] API missionId 반영', apiMissionId, 'assignedAt=', apiAssignedAt);
            setUserMissionId(apiMissionId);
            if (apiAssignedAt) {
              const mockUserMission: UserMission = {
                id: apiMissionId,
                missionType: 'OFFICIAL',
                assignedAt: apiAssignedAt,
                dueDate: data.deadlineAt,
                status: data.status ?? 'ASSIGNED',
              };
              setUserMission(mockUserMission);
            }
          }
          if (apiTimeRemaining !== undefined) {
            setTimeRemaining(apiTimeRemaining);
            // 알림 후 12시간 이내만 인증 가능. API canVerify 또는 남은 시간으로 만료 판정
            const expired = apiTimeRemaining <= 0 || apiCanVerify === false;
            setIsExpired(expired);
            console.log('[기상미션] 타이머 초기값 remaining=', apiTimeRemaining, 'canVerify=', apiCanVerify, 'expired=', expired);
          }
        } else {
          console.warn('[기상미션] API 조회 실패, 기존 userMissionId로 loadMissionData 시도 userMissionId=', userMissionId);
          if (userMissionId && userMissionId > 0) {
            await loadMissionData();
          } else {
            setErrorMessage(currentResult.error || '현재 활성화된 기상 미션이 없습니다.');
            setShowErrorModal(true);
          }
        }
      } catch (error) {
        console.error('[기상미션] API 조회 예외', error);
        // 예외 발생 시 기존 로직 사용
        if (userMissionId && userMissionId > 0) {
          await loadMissionData();
        } else {
          setErrorMessage('기상 미션 정보를 불러오는 중 문제가 발생했습니다.');
          setShowErrorModal(true);
        }
      } finally {
        setLoading(false);
      }
    };

    loadCurrentMission();
  }, [loadMissionData, userMissionId]); // 화면 진입 시 한 번만 실행

  /**
   * 타이머 설정 (assignedAt 기준으로 계산)
   */
  useEffect(() => {
    // assignedAt이 없으면 타이머 시작하지 않음
    if (!userMission?.assignedAt) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      stopTimerSound();
      return;
    }

    const updateTimer = async () => {
      const assignedTime = new Date(userMission.assignedAt).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - assignedTime) / 1000);
      const remaining = Math.max(0, 12 * 3600 - elapsed); // 알림 후 12시간 이내만 인증 가능
      if (remaining <= 0) {
        if (!expiredLoggedRef.current) {
          expiredLoggedRef.current = true;
          console.log('[기상미션] 타이머 만료(1회 로그) assignedAt=', userMission.assignedAt, 'elapsed초=', elapsed);
        }
        setIsExpired(true);
        setTimeRemaining(0);
        stopTimerSound();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        setIsExpired(false);
        setTimeRemaining(remaining);

        // 10초 이하일 때 빠른 사운드로 변경
        if (remaining <= 10) {
          if (!isPlayingFastSound.current) {
            await playTimerSound(true);
          }
        } else {
          // 10초 초과일 때 일반 사운드 재생
          if (!soundRef.current) {
            await playTimerSound(false);
          } else if (isPlayingFastSound.current) {
            // 빠른 사운드에서 일반 사운드로 변경
            await playTimerSound(false);
          }
        }
      }
    };

    // 이미 타이머가 실행 중이면 정리
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // 기존 사운드 정리
    stopTimerSound();

    // 즉시 한 번 실행
    updateTimer();

    // 타이머 시작 시 사운드 재생 (약간의 지연을 두어 정리 완료 후 재생)
    setTimeout(() => {
      playTimerSound(false);
    }, 200);

    // 1초마다 업데이트
    intervalRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      stopTimerSound();
    };
  }, [userMission?.assignedAt, playTimerSound, stopTimerSound]);

  /**
   * 인증 처리
   */
  const handleVerify = useCallback(async () => {
    if (isExpired || (timeRemaining !== null && timeRemaining <= 0)) {
      setErrorMessage('12시간이 지나 인증할 수 없습니다.');
      setShowErrorModal(true);
      return;
    }

    try {
      setVerifying(true);
      console.log('[기상미션] 인증 요청 userMissionId=', userMissionId, 'isExpired=', isExpired, 'timeRemaining=', timeRemaining);
      const result = await verifyWakeupTime(userMissionId);

      console.log('[기상미션] 인증 응답 success=', result.success, 'error=', result.error, 'data=', result.data ? { canVerify: result.data.canVerify, message: result.data.message } : null);

      if (result.success) {
        console.log('[기상미션] 인증 성공');
        setShowSuccessModal(true);
      } else {
        console.warn('[기상미션] 인증 실패', result.error, result.data?.message);
        setErrorMessage(result.error || result.data?.message || '인증에 실패했습니다.');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('[WakeUpVerificationScreen] 인증 예외:', error);
      setErrorMessage('인증 중 문제가 발생했습니다.');
      setShowErrorModal(true);
    } finally {
      setVerifying(false);
    }
  }, [isExpired, timeRemaining, userMissionId]);

  /**
   * 시간 포맷팅
   */
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  /**
   * 성공 모달 닫기 및 네비게이션
   */
  const handleSuccessModalClose = useCallback(async () => {
    setShowSuccessModal(false);
    // 인증 성공 후 Context 초기화 및 사운드 정지
    await stopTimerSound();
    await clearWakeUpMissionId();
    navigation.goBack();
  }, [stopTimerSound, clearWakeUpMissionId, navigation]);

  /**
   * 에러 모달 닫기 및 네비게이션
   */
  const handleErrorModalClose = useCallback(async () => {
    setShowErrorModal(false);
    // 에러 발생 시 사운드 정지
    await stopTimerSound();
    navigation.goBack();
  }, [stopTimerSound, navigation]);

  return {
    // Data
    userMission,
    // State
    loading,
    verifying,
    timeRemaining,
    isExpired,
    showSuccessModal,
    showErrorModal,
    errorMessage,
    // Handlers
    handleVerify,
    handleSuccessModalClose,
    handleErrorModalClose,
    // Utils
    formatTime,
  };
};
