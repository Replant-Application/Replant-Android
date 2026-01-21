/**
 * 기상 미션 인증 화면
 * 10분 이내에 인증 버튼을 눌러야 함
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ImageBackground,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { Header, AlertModal } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { getUserMission, verifyWakeupTime, getCurrentWakeupMission } from '../../api/missionApi';
import { UserMission } from '../../api/missionApi';
import { useWakeUpMission } from '../../contexts/WakeUpMissionContext';
import { Audio } from 'expo-av';
import { loadSoundSettings } from '../../utils/soundSettings';

interface WakeUpVerificationScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'WakeUpVerification'>;
}

const WakeUpVerificationScreen: React.FC<WakeUpVerificationScreenProps> = ({
  navigation,
  route,
}) => {
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

  // userMissionId 추출 (우선순위: route.params > Context > AsyncStorage)
  useEffect(() => {
    const extractUserMissionId = async () => {
      const params = route?.params;
      console.log('[WakeUpVerificationScreen] userMissionId 추출 시작');
      console.log('[WakeUpVerificationScreen] route.params:', params);
      console.log('[WakeUpVerificationScreen] Context currentWakeUpMissionId:', currentWakeUpMissionId);
      
      let extractedId: number | undefined = undefined;
      
      // 1순위: route.params에서 추출
      if (params && 'userMissionId' in params && params.userMissionId !== undefined && params.userMissionId !== null) {
        if (typeof params.userMissionId === 'string') {
          extractedId = Number(params.userMissionId);
        } else if (typeof params.userMissionId === 'number') {
          extractedId = params.userMissionId;
        }
        console.log('[WakeUpVerificationScreen] ✅ route.params에서 추출:', extractedId);
      }
      
      // 2순위: Context에서 가져오기
      if (!extractedId && currentWakeUpMissionId) {
        extractedId = currentWakeUpMissionId;
        console.log('[WakeUpVerificationScreen] ✅ Context에서 추출:', extractedId);
      }
      
      // 3순위: AsyncStorage에서 가져오기 (Context가 아직 로드되지 않았을 수 있음)
      if (!extractedId) {
        const storedId = await getWakeUpMissionId();
        if (storedId) {
          extractedId = storedId;
          console.log('[WakeUpVerificationScreen] ✅ AsyncStorage에서 추출:', extractedId);
        }
      }
      
      // 유효성 검사
      if (extractedId !== undefined && !isNaN(extractedId) && extractedId !== 0) {
        console.log('[WakeUpVerificationScreen] ✅ userMissionId 설정:', extractedId);
        setUserMissionId(extractedId);
      } else {
        console.error('[WakeUpVerificationScreen] ❌ userMissionId 추출 실패:', {
          extractedId,
          routeParams: params && 'userMissionId' in params ? params.userMissionId : undefined,
          contextId: currentWakeUpMissionId,
        });
        setUserMissionId(undefined);
      }
    };
    
    extractUserMissionId();
  }, [route?.params, currentWakeUpMissionId, getWakeUpMissionId]);

  // 화면 진입 시 현재 활성화된 기상 미션 조회 (백엔드 API 사용)
  useEffect(() => {
    const loadCurrentMission = async () => {
      try {
        setLoading(true);
        console.log('[WakeUpVerificationScreen] 현재 활성화된 기상 미션 조회 시작');
        
        // 백엔드 API로 현재 활성화된 기상 미션 조회
        const currentResult = await getCurrentWakeupMission();
        
        console.log('[WakeUpVerificationScreen] 현재 기상 미션 조회 결과:', {
          success: currentResult.success,
          hasData: !!currentResult.data,
          error: currentResult.error,
          userMissionId: currentResult.data?.userMissionId,
          timeRemaining: currentResult.data?.timeRemaining,
          canVerify: currentResult.data?.canVerify,
        });
        
        if (currentResult.success && currentResult.data) {
          const { userMissionId: apiMissionId, assignedAt, timeRemaining: apiTimeRemaining, canVerify: apiCanVerify } = currentResult.data;
          
          // API에서 받은 userMissionId 설정
          if (apiMissionId) {
            console.log('[WakeUpVerificationScreen] ✅ API에서 userMissionId 받음:', apiMissionId);
            setUserMissionId(apiMissionId);
            
            // 상세 미션 정보 로드
            const detailResult = await getUserMission(apiMissionId);
            if (detailResult.success && detailResult.data) {
              setUserMission(detailResult.data);
            }
          }
          
          // API에서 받은 시간 정보는 참고용으로만 사용
          // 실제 타이머는 userMission.assignedAt이 설정되면 useEffect에서 자동으로 시작됨
          if (apiTimeRemaining !== undefined) {
            // 초기값만 설정 (타이머가 자동으로 업데이트함)
            setTimeRemaining(apiTimeRemaining);
            setIsExpired(apiTimeRemaining <= 0);
          }
          // assignedAt은 userMission에 포함되어 있으므로 타이머 useEffect가 처리함
        } else {
          // API 조회 실패 시 기존 로직 사용 (userMissionId가 있으면)
          console.log('[WakeUpVerificationScreen] ⚠️ 현재 기상 미션 조회 실패, 기존 로직 사용');
          if (userMissionId && userMissionId > 0) {
            await loadMissionData();
          } else {
            setErrorMessage(currentResult.error || '현재 활성화된 기상 미션이 없습니다.');
            setShowErrorModal(true);
          }
        }
      } catch (error) {
        console.error('[WakeUpVerificationScreen] 현재 기상 미션 조회 예외:', error);
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
  }, []); // 화면 진입 시 한 번만 실행

  // 타이머 사운드 재생 함수
  const playTimerSound = async (isFast: boolean = false) => {
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
  };

  // 타이머 사운드 정지
  const stopTimerSound = async () => {
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
  };

  // 컴포넌트 unmount 시 사운드 정리
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

  // 타이머 설정 (assignedAt 기준으로 계산)
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
      const elapsed = Math.floor((now - assignedTime) / 1000); // 초 단위
      const remaining = 600 - elapsed; // 10분 = 600초

      if (remaining <= 0) {
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
  }, [userMission?.assignedAt]); // assignedAt이 변경될 때만 재시작

  const loadMissionData = async () => {
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
        console.log('[WakeUpVerificationScreen] ✅ 미션 정보 로드 성공');
        setUserMission(result.data);
      } else {
        // 404 에러인 경우 특별 처리
        const isNotFound = result.error?.includes('찾을 수 없습니다') || 
                          result.error?.includes('not found') ||
                          result.error?.includes('404');
        
        if (isNotFound) {
          console.error('[WakeUpVerificationScreen] ❌ 미션을 찾을 수 없음 (404):', {
            userMissionId,
            error: result.error,
          });
          setErrorMessage(`미션을 찾을 수 없습니다. (ID: ${userMissionId})\n이미 완료되었거나 삭제된 미션일 수 있습니다.`);
        } else {
          console.error('[WakeUpVerificationScreen] ❌ 미션 정보 로드 실패:', result.error);
          setErrorMessage(result.error || '미션 정보를 불러올 수 없습니다.');
        }
        setShowErrorModal(true);
      }
    } catch (error: any) {
      console.error('[WakeUpVerificationScreen] 미션 정보 로드 예외:', error);
      const errorMessage = error?.message || error?.toString() || '알 수 없는 오류';
      
      // 404 에러 체크
      if (errorMessage.includes('404') || errorMessage.includes('찾을 수 없습니다')) {
        setErrorMessage(`미션을 찾을 수 없습니다. (ID: ${userMissionId})\n이미 완료되었거나 삭제된 미션일 수 있습니다.`);
      } else {
        setErrorMessage('미션 정보를 불러오는 중 문제가 발생했습니다.');
      }
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (isExpired || (timeRemaining !== null && timeRemaining <= 0)) {
      Alert.alert('시간 초과', '10분이 지나 인증할 수 없습니다.');
      return;
    }

    try {
      setVerifying(true);
      // userMissionId가 있으면 전달, 없으면 백엔드에서 자동으로 찾음
      console.log('[WakeUpVerificationScreen] 인증 요청, userMissionId:', userMissionId || '없음 (자동 조회)');
      const result = await verifyWakeupTime(userMissionId); // userMissionId는 선택적

      console.log('[WakeUpVerificationScreen] 인증 응답 전체:', JSON.stringify(result, null, 2));
      console.log('[WakeUpVerificationScreen] 인증 응답 요약:', {
        success: result.success,
        hasData: !!result.data,
        canVerify: result.data?.canVerify,
        message: result.data?.message,
        error: result.error,
      });

      // 백엔드가 성공했다면 (result.success === true) 인증 성공으로 처리
      // canVerify는 인증 가능 여부를 나타내는 것이지, 실제 인증 성공 여부가 아닐 수 있음
      if (result.success) {
        // result.success가 true면 백엔드에서 성공한 것으로 간주
        // canVerify가 false여도 백엔드가 성공했다면 성공으로 처리
        console.log('[WakeUpVerificationScreen] ✅ 백엔드 인증 성공 (result.success === true)');
        setShowSuccessModal(true);
      } else {
        // result.success가 false면 실제 실패
        console.error('[WakeUpVerificationScreen] ❌ API 호출 실패:', result.error);
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
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const mission = userMission?.mission || userMission?.customMission;

  if (loading) {
    return (
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <Header title="기상 미션 인증" navigation={navigation} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
            <Text style={styles.loadingText}>미션 정보를 불러오는 중...</Text>
          </View>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Header title="기상 미션 인증" navigation={navigation} />

        <View style={styles.content}>
          {/* 미션 정보 카드 */}
          <View style={styles.missionCard}>
            <View style={styles.missionHeader}>
              <Text style={styles.emoji}>🌅</Text>
              <View style={styles.missionInfo}>
                <Text style={styles.missionTitle}>
                  {mission?.title || '기상 미션'}
                </Text>
                <Text style={styles.missionDescription}>
                  {mission?.description || '기상 미션을 완료하세요!'}
                </Text>
              </View>
            </View>
          </View>

          {/* 타이머 카드 */}
          <View style={styles.timerCard}>
            <Text style={styles.timerLabel}>남은 시간</Text>
            <View style={styles.timerDisplay}>
              {/* 디지털 타이머 스타일 */}
              <View style={styles.timerContainer}>
                <View style={[
                  styles.timerScreen,
                  isExpired && styles.timerScreenExpired,
                  timeRemaining !== null && timeRemaining <= 10 && !isExpired && styles.timerScreenWarning,
                ]}>
                  <View style={styles.timerDigits}>
                    {timeRemaining !== null && !isExpired ? (
                      <>
                        <View style={styles.digitGroup}>
                          <Text style={[
                            styles.digit,
                            timeRemaining <= 10 && styles.digitWarning,
                          ]}>
                            {Math.floor(timeRemaining / 60).toString().padStart(2, '0')}
                          </Text>
                          <Text style={styles.colon}>:</Text>
                          <Text style={[
                            styles.digit,
                            timeRemaining <= 10 && styles.digitWarning,
                          ]}>
                            {(timeRemaining % 60).toString().padStart(2, '0')}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <Text style={styles.expiredText}>시간 초과</Text>
                    )}
                  </View>
                </View>
              </View>
              {!isExpired && timeRemaining !== null && timeRemaining > 0 && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { width: `${(timeRemaining / 600) * 100}%` },
                        timeRemaining <= 10 && styles.progressFillWarning,
                      ]} 
                    />
                  </View>
                </View>
              )}
            </View>
            {isExpired && (
              <Text style={styles.expiredMessage}>
                10분이 지나 인증할 수 없습니다.
              </Text>
            )}
            {timeRemaining !== null && timeRemaining <= 10 && !isExpired && (
              <Text style={styles.warningMessage}>
                ⏰ 시간이 얼마 남지 않았습니다!
              </Text>
            )}
          </View>

          {/* 인증 버튼 */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (isExpired || verifying || (timeRemaining !== null && timeRemaining <= 0)) && styles.verifyButtonDisabled,
            ]}
            onPress={handleVerify}
            disabled={isExpired || verifying || (timeRemaining !== null && timeRemaining <= 0)}
            activeOpacity={0.7}
          >
            {verifying ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.verifyButtonText}>
                {isExpired ? '시간 초과' : '인증하기'}
              </Text>
            )}
          </TouchableOpacity>

          {/* 안내 메시지 */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              • 10분 이내에 인증 버튼을 눌러주세요{'\n'}
              • 인증글 작성 없이 버튼만 누르면 경험치를 받을 수 있습니다
            </Text>
          </View>
        </View>
      </View>

      {/* 성공 모달 */}
      <AlertModal
        visible={showSuccessModal}
        title="인증 완료! 🌅"
        message="기상 미션 인증이 완료되었습니다!"
        buttonText="확인"
        onClose={async () => {
          setShowSuccessModal(false);
          // 인증 성공 후 Context 초기화 및 사운드 정지
          await stopTimerSound();
          await clearWakeUpMissionId();
          navigation.goBack();
        }}
      />

      {/* 에러 모달 */}
      <AlertModal
        visible={showErrorModal}
        title="오류"
        message={errorMessage || '미션 정보를 불러올 수 없습니다.'}
        buttonText="확인"
        onClose={async () => {
          setShowErrorModal(false);
          // 에러 발생 시 사운드 정지
          await stopTimerSound();
          navigation.goBack();
        }}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing[4],
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  content: {
    flex: 1,
    padding: spacing[4],
    justifyContent: 'center',
  },
  missionCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginRight: spacing[4],
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.primary,
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  missionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm) * 1.4,
  },
  timerCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[5],
    marginBottom: spacing[4],
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.primary,
    marginBottom: spacing[4],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  timerDisplay: {
    width: '100%',
    alignItems: 'center',
  },
  timerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  timerScreen: {
    backgroundColor: '#1a1a1a',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[6],
    paddingHorizontal: spacing[6],
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.green[500],
    borderStyle: 'solid',
  },
  timerScreenWarning: {
    borderColor: colors.error[500],
    backgroundColor: '#2a1a1a',
  },
  timerScreenExpired: {
    borderColor: colors.error[500],
    backgroundColor: '#2a1a1a',
  },
  timerDigits: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: {
    fontSize: 48,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.green[500],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: 56,
    letterSpacing: 4,
    textShadowColor: colors.green[500],
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  digitWarning: {
    color: colors.error[500],
    textShadowColor: colors.error[500],
    textShadowRadius: 15,
  },
  colon: {
    fontSize: 48,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.green[500],
    marginHorizontal: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: 56,
  },
  expiredText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.error[500],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xl),
  },
  progressContainer: {
    width: '100%',
    marginTop: spacing[2],
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.green[500],
    borderRadius: borderRadius.full,
  },
  progressFillWarning: {
    backgroundColor: colors.warning,
  },
  expiredMessage: {
    marginTop: spacing[3],
    fontSize: typography.fontSize.sm,
    color: colors.error[500],
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  warningMessage: {
    marginTop: spacing[3],
    fontSize: typography.fontSize.sm,
    color: colors.warning,
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  verifyButton: {
    backgroundColor: colors.green[500],
    borderRadius: borderRadius.base,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
    minHeight: 40,
  },
  verifyButtonDisabled: {
    backgroundColor: colors.gray[400],
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.white,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  infoContainer: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.base,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm) * 1.5,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    textAlign: 'center',
  },
});

export default WakeUpVerificationScreen;
