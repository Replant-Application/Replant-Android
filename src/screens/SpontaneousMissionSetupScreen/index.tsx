/**
 * 돌발 미션 설정 온보딩 화면
 * 신규 가입자의 기상, 취침, 식사 시간을 설정합니다.
 * 스텝별로 하나씩 입력하는 온보딩 형식
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { Header, AlertModal } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { 
  setupSpontaneousMission, 
  getSpontaneousMissionSetup, 
  updateSpontaneousMissionSetup 
} from '../../api/missionApi';
import { logError } from '../../utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SCREEN_NAMES } from '../../utils/constants';

interface SpontaneousMissionSetupScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'SpontaneousMissionSetup'>;
}

type Step = 'wake' | 'sleep' | 'breakfast' | 'lunch' | 'dinner';

interface TimeState {
  period: 'AM' | 'PM';
  hour: number;
  minute: number;
}

const STEP_CONFIG: Record<Step, { title: string; description: string }> = {
  wake: {
    title: '기상 시간을 알려주세요',
    description: '평소에 일어나는 시간을 설정해주세요.',
  },
  sleep: {
    title: '취침 시간을 알려주세요',
    description: '평소에 잠드는 시간을 설정해주세요.',
  },
  breakfast: {
    title: '아침 식사 시간을 알려주세요',
    description: '평소에 아침 식사를 하는 시간을 설정해주세요.',
  },
  lunch: {
    title: '점심 식사 시간을 알려주세요',
    description: '평소에 점심 식사를 하는 시간을 설정해주세요.',
  },
  dinner: {
    title: '저녁 식사 시간을 알려주세요',
    description: '평소에 저녁 식사를 하는 시간을 설정해주세요.',
  },
};

const STEPS: Step[] = ['wake', 'sleep', 'breakfast', 'lunch', 'dinner'];

const SpontaneousMissionSetupScreen: React.FC<SpontaneousMissionSetupScreenProps> = ({
  navigation,
  route,
}) => {
  // route가 없거나 params가 없을 수 있으므로 안전하게 처리
  const routeParams = route?.params as any;
  const mode = (routeParams && routeParams.mode) ? routeParams.mode : 'create'; // create: 신규 설정, edit: 수정
  const isEditMode = mode === 'edit';
  
  // navigation이 없으면 기본 navigation 객체 생성
  const safeNavigation = navigation || {
    navigate: () => {},
    goBack: () => {},
  } as any;

  const [currentStep, setCurrentStep] = useState<number>(0);
  
  // currentStep이 유효한 범위 내에 있는지 확인
  const safeCurrentStep = Math.max(0, Math.min(currentStep, STEPS.length - 1));
  const [wakeTime, setWakeTime] = useState<TimeState>({ period: 'AM', hour: 7, minute: 0 });
  const [sleepTime, setSleepTime] = useState<TimeState>({ period: 'PM', hour: 10, minute: 0 });
  const [breakfastTime, setBreakfastTime] = useState<TimeState>({ period: 'AM', hour: 8, minute: 0 });
  const [lunchTime, setLunchTime] = useState<TimeState>({ period: 'PM', hour: 12, minute: 30 });
  const [dinnerTime, setDinnerTime] = useState<TimeState>({ period: 'PM', hour: 7, minute: 0 });
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

  // currentStepKey와 stepConfig를 안전하게 가져오기
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

  // 현재 스텝의 시간 상태 가져오기 (useCallback으로 최적화)
  const getCurrentTime = useCallback((): TimeState => {
    try {
      switch (currentStepKey) {
        case 'wake':
          return wakeTime || { period: 'AM', hour: 7, minute: 0 };
        case 'sleep':
          return sleepTime || { period: 'PM', hour: 10, minute: 0 };
        case 'breakfast':
          return breakfastTime || { period: 'AM', hour: 8, minute: 0 };
        case 'lunch':
          return lunchTime || { period: 'PM', hour: 12, minute: 30 };
        case 'dinner':
          return dinnerTime || { period: 'PM', hour: 7, minute: 0 };
        default:
          // 기본값 반환
          console.warn('[SpontaneousMissionSetupScreen] 알 수 없는 currentStepKey:', currentStepKey);
          return { period: 'AM', hour: 7, minute: 0 };
      }
    } catch (error) {
      logError('getCurrentTime 실패', error as Error);
      console.error('[SpontaneousMissionSetupScreen] getCurrentTime 에러:', error);
      // 기본값 반환
      return { period: 'AM', hour: 7, minute: 0 };
    }
  }, [currentStepKey, wakeTime, sleepTime, breakfastTime, lunchTime, dinnerTime]);

  // 현재 스텝의 시간 상태 설정하기
  const setCurrentTime = (time: TimeState) => {
    try {
      if (!time || typeof time !== 'object') {
        logError('setCurrentTime: 유효하지 않은 time 값', new Error(`time: ${JSON.stringify(time)}`));
        return;
      }
      
      switch (currentStepKey) {
        case 'wake':
          setWakeTime(time);
          break;
        case 'sleep':
          setSleepTime(time);
          break;
        case 'breakfast':
          setBreakfastTime(time);
          break;
        case 'lunch':
          setLunchTime(time);
          break;
        case 'dinner':
          setDinnerTime(time);
          break;
        default:
          logError('setCurrentTime: 알 수 없는 currentStepKey', new Error(`currentStepKey: ${currentStepKey}`));
      }
    } catch (error) {
      logError('setCurrentTime 실패', error as Error);
    }
  };

  // 24시간 형식으로 변환
  const convertTo24Hour = (period: 'AM' | 'PM', hour: number, minute: number): string => {
    let hours24 = hour;
    if (period === 'PM' && hour !== 12) hours24 = hour + 12;
    else if (period === 'AM' && hour === 12) hours24 = 0;
    return `${String(hours24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };

  // 시간 표시 형식
  const formatTimeDisplay = (time: TimeState): string => {
    const periodText = time.period === 'AM' ? '오전' : '오후';
    return `${periodText} ${time.hour}시 ${time.minute > 0 ? `${time.minute}분` : ''}`;
  };

  // 24시간 형식을 TimeState로 변환
  const parse24Hour = (time24: string): TimeState => {
    try {
      if (!time24 || typeof time24 !== 'string') {
        // 기본값 반환
        return { period: 'AM', hour: 7, minute: 0 };
      }
      const [hours, minutes] = time24.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) {
        // 기본값 반환
        return { period: 'AM', hour: 7, minute: 0 };
      }
      const period = hours >= 12 ? 'PM' : 'AM';
      let hour = hours % 12;
      if (hour === 0) hour = 12;
      return { period, hour, minute: minutes || 0 };
    } catch (error) {
      logError('시간 파싱 실패', error as Error);
      // 기본값 반환
      return { period: 'AM', hour: 7, minute: 0 };
    }
  };

  // 수정 모드일 때 기존 설정 불러오기
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
            console.log('[SpontaneousMissionSetupScreen] 데이터 필드 확인:', {
              wakeTime: data.wakeTime,
              sleepTime: data.sleepTime,
              breakfastTime: data.breakfastTime,
              lunchTime: data.lunchTime,
              dinnerTime: data.dinnerTime,
            });
            
            // 시간 데이터가 유효한지 확인 (빈 문자열이나 null도 체크)
            const hasAllTimeFields = 
              data.wakeTime && 
              data.sleepTime && 
              data.breakfastTime && 
              data.lunchTime && 
              data.dinnerTime &&
              typeof data.wakeTime === 'string' &&
              typeof data.sleepTime === 'string' &&
              typeof data.breakfastTime === 'string' &&
              typeof data.lunchTime === 'string' &&
              typeof data.dinnerTime === 'string' &&
              data.wakeTime.trim() !== '' &&
              data.sleepTime.trim() !== '' &&
              data.breakfastTime.trim() !== '' &&
              data.lunchTime.trim() !== '' &&
              data.dinnerTime.trim() !== '';
            
            if (hasAllTimeFields) {
              setWakeTime(parse24Hour(data.wakeTime));
              setSleepTime(parse24Hour(data.sleepTime));
              setBreakfastTime(parse24Hour(data.breakfastTime));
              setLunchTime(parse24Hour(data.lunchTime));
              setDinnerTime(parse24Hour(data.dinnerTime));
              console.log('[SpontaneousMissionSetupScreen] ✅ 설정 로드 완료');
            } else {
              console.warn('[SpontaneousMissionSetupScreen] ⚠️ 설정 데이터가 불완전함:', {
                wakeTime: data.wakeTime || '(없음)',
                sleepTime: data.sleepTime || '(없음)',
                breakfastTime: data.breakfastTime || '(없음)',
                lunchTime: data.lunchTime || '(없음)',
                dinnerTime: data.dinnerTime || '(없음)',
              });
              // 설정 데이터가 불완전하면 자동으로 신규 설정 모드로 전환 (모달 없이)
              console.log('[SpontaneousMissionSetupScreen] 설정 데이터 불완전 → 신규 설정 모드로 자동 전환');
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
            
            console.log('[SpontaneousMissionSetupScreen] 설정 조회 실패:', {
              error: errorMessage,
              isNotFound,
            });
            
            if (isNotFound) {
              // 설정이 없으면 자동으로 신규 설정 모드로 전환 (모달 없이)
              // 탈퇴 후 복구된 사용자일 수 있으므로 자동으로 신규 설정 화면으로 전환
              console.log('[SpontaneousMissionSetupScreen] 설정 없음(404) → 신규 설정 모드로 자동 전환');
              setCurrentStep(0);
            } else {
              // 다른 오류인 경우
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
          
          // 예외가 발생한 경우에도 사용자에게 친절한 메시지 표시
          const errorMessage = error instanceof Error 
            ? error.message 
            : String(error);
          
          const isNetworkError = 
            errorMessage.includes('Network') ||
            errorMessage.includes('network') ||
            errorMessage.includes('네트워크') ||
            errorMessage.includes('fetch');
          
          setAlertModal({
            visible: true,
            title: '오류',
            message: isNetworkError 
              ? '네트워크 연결을 확인해주세요.'
              : '설정을 불러오는 중 오류가 발생했습니다.',
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
        } finally {
          setInitialLoading(false);
        }
      };

      loadExistingSetup();
    } else {
      // 신규 설정 모드일 때는 로딩 완료
      setInitialLoading(false);
    }
  }, [isEditMode, safeNavigation]);

  const handleNext = () => {
    try {
      if (safeCurrentStep < STEPS.length - 1) {
        setCurrentStep(safeCurrentStep + 1);
      } else {
        handleSubmit();
      }
    } catch (error) {
      logError('다음 스텝 이동 실패', error as Error);
    }
  };

  const handlePrev = () => {
    try {
      if (safeCurrentStep > 0) {
        setCurrentStep(safeCurrentStep - 1);
      }
    } catch (error) {
      logError('이전 스텝 이동 실패', error as Error);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const requestData = {
        sleepTime: convertTo24Hour(sleepTime.period, sleepTime.hour, sleepTime.minute),
        wakeTime: convertTo24Hour(wakeTime.period, wakeTime.hour, wakeTime.minute),
        breakfastTime: convertTo24Hour(breakfastTime.period, breakfastTime.hour, breakfastTime.minute),
        lunchTime: convertTo24Hour(lunchTime.period, lunchTime.hour, lunchTime.minute),
        dinnerTime: convertTo24Hour(dinnerTime.period, dinnerTime.hour, dinnerTime.minute),
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
                  safeNavigation.navigate(SCREEN_NAMES.SETTINGS);
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
          // AsyncStorage에 저장 후 명시적으로 홈으로 이동
          await AsyncStorage.setItem('@replant:spontaneousMissionSetupCompleted', String(isCompleted));
          
          // 홈 화면으로 직접 이동
          try {
            if (safeNavigation && typeof safeNavigation.navigate === 'function') {
              safeNavigation.navigate(SCREEN_NAMES.HOME);
            } else {
              // navigation이 없으면 약간의 지연 후 AppNavigator가 감지하도록 함
              setTimeout(() => {
                // AppNavigator의 useEffect가 감지할 수 있도록 함
              }, 500);
            }
          } catch (error) {
            logError('홈 화면 이동 실패', error as Error);
            // 에러 발생 시에도 AsyncStorage는 저장되었으므로 AppNavigator가 감지할 것임
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
  };

  // currentTime을 안전하게 가져오기 (useMemo로 최적화)
  const currentTime = useMemo(() => {
    try {
      const time = getCurrentTime();
      // currentTime이 유효한지 확인
      if (!time || typeof time !== 'object' || !time.period || typeof time.hour !== 'number' || typeof time.minute !== 'number') {
        console.warn('[SpontaneousMissionSetupScreen] currentTime이 유효하지 않음, 기본값 사용');
        return { period: 'AM' as const, hour: 7, minute: 0 };
      }
      return time;
    } catch (error) {
      logError('currentTime 가져오기 실패', error as Error);
      console.error('[SpontaneousMissionSetupScreen] currentTime 계산 중 에러:', error);
      return { period: 'AM' as const, hour: 7, minute: 0 };
    }
  }, [currentStepKey, wakeTime, sleepTime, breakfastTime, lunchTime, dinnerTime, getCurrentTime]);
  
  const ITEM_HEIGHT = 50;
  const VISIBLE_ITEMS = 5;

  // 휠 피커 컴포넌트 (갤럭시 스타일)
  const WheelPicker = ({
    value,
    options,
    onSelect,
    width,
  }: {
    value: string | number;
    options: Array<{ label: string; value: string | number }>;
    onSelect: (value: string | number) => void;
    width?: number;
  }) => {
    const scrollViewRef = useRef<ScrollView>(null);
    const [selectedIndex, setSelectedIndex] = useState(() => {
      const index = options.findIndex(opt => opt.value === value);
      return index >= 0 ? index : 0;
    });

    useEffect(() => {
      const index = options.findIndex(opt => opt.value === value);
      if (index >= 0 && index !== selectedIndex) {
        setSelectedIndex(index);
        scrollToIndex(index, false);
      }
    }, [value]);

    const scrollToIndex = (index: number, animated: boolean = true) => {
      if (scrollViewRef.current) {
        const y = index * ITEM_HEIGHT;
        scrollViewRef.current.scrollTo({ y, animated });
      }
    };

    const handleScroll = (event: any) => {
      const y = event.nativeEvent.contentOffset.y;
      const index = Math.round(y / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, options.length - 1));
      
      if (clampedIndex !== selectedIndex) {
        setSelectedIndex(clampedIndex);
        onSelect(options[clampedIndex].value);
      }
    };

    const handleScrollEnd = (event: any) => {
      const y = event.nativeEvent.contentOffset.y;
      const index = Math.round(y / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, options.length - 1));
      scrollToIndex(clampedIndex, true);
    };

    useEffect(() => {
      scrollToIndex(selectedIndex, false);
    }, []);

    return (
      <View style={[styles.wheelPickerContainer, width && { width }]}>
        {/* 선택 영역 표시 */}
        <View style={styles.wheelPickerSelection} />
        <ScrollView
          ref={scrollViewRef}
          style={styles.wheelPickerScrollView}
          contentContainerStyle={styles.wheelPickerContent}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={16}
        >
          {/* 상단 패딩 */}
          <View style={{ height: ITEM_HEIGHT * 2 }} />
          {options.map((option, index) => {
            const distance = Math.abs(index - selectedIndex);
            const opacity = distance === 0 ? 1 : distance === 1 ? 0.4 : 0.2;
            const scale = distance === 0 ? 1 : 0.9;
            const fontSize = distance === 0 ? typography.fontSize['2xl'] : typography.fontSize.lg;
            
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.wheelPickerItem,
                  { height: ITEM_HEIGHT, opacity, transform: [{ scale }] }
                ]}
                onPress={() => {
                  scrollToIndex(index, true);
                  setSelectedIndex(index);
                  onSelect(option.value);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.wheelPickerItemText, { fontSize }]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
          {/* 하단 패딩 */}
          <View style={{ height: ITEM_HEIGHT * 2 }} />
        </ScrollView>
      </View>
    );
  };

  // 드롭다운 컴포넌트 (레거시 - 제거 예정)
  const Dropdown = ({
    value,
    options,
    onSelect,
    isOpen,
    onToggle,
    width,
  }: {
    value: string | number;
    options: Array<{ label: string; value: string | number }>;
    onSelect: (value: string | number) => void;
    isOpen: boolean;
    onToggle: () => void;
    width?: number;
  }) => (
    <View style={[styles.dropdownContainer, width && { width }]}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.dropdownButtonText}>{value}</Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>
      {isOpen && (
        <View 
          style={styles.dropdownList}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
        >
          <ScrollView
            style={styles.dropdownScrollView}
            contentContainerStyle={styles.dropdownScrollContent}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
            bounces={false}
            scrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.dropdownItem}
                onPress={() => {
                  onSelect(option.value);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownItemText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  if (initialLoading && isEditMode) {
    return (
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>설정을 불러오는 중...</Text>
        </View>
      </ImageBackground>
    );
  }

  // 렌더링 전 안전성 검사
  if (!stepConfig || !currentStepKey) {
    return (
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>초기화 중...</Text>
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
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Header
          title="돌발 미션 설정"
          navigation={safeNavigation}
          showBorder={false}
          showBackButton={isEditMode}
          titleStyle={styles.headerTitle}
        />

        <View style={styles.contentTouchable}>
          <View style={styles.content}>
            {/* 진행 표시 */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {safeCurrentStep + 1} / {STEPS.length}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${((safeCurrentStep + 1) / STEPS.length) * 100}%` },
                  ]}
                />
              </View>
            </View>

            {/* 스텝 내용 */}
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>{stepConfig.title}</Text>
              <Text style={styles.stepDescription}>{stepConfig.description}</Text>

              <View style={styles.timeInputContainer}>
                <View style={styles.timePickerWrapper}>
                  <View style={styles.timePickerRow}>
                    {/* AM/PM */}
                    <WheelPicker
                      value={currentTime.period}
                      options={[
                        { label: '오전', value: 'AM' },
                        { label: '오후', value: 'PM' },
                      ]}
                      onSelect={(value) => {
                        if (value === 'AM' || value === 'PM') {
                          setCurrentTime({ ...currentTime, period: value });
                        }
                      }}
                      width={80}
                    />

                    {/* 시 */}
                    <WheelPicker
                      value={currentTime.hour}
                      options={Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => ({
                        label: `${hour}`,
                        value: hour,
                      }))}
                      onSelect={(value) => {
                        setCurrentTime({ ...currentTime, hour: value as number });
                      }}
                      width={60}
                    />

                    {/* 콜론 */}
                    <View style={styles.timeSeparator}>
                      <Text style={styles.timeSeparatorText}>:</Text>
                    </View>

                    {/* 분 */}
                    <WheelPicker
                      value={currentTime.minute}
                      options={Array.from({ length: 60 }, (_, i) => i).map((minute) => ({
                        label: minute < 10 ? `0${minute}` : `${minute}`,
                        value: minute,
                      }))}
                      onSelect={(value) => {
                        setCurrentTime({ ...currentTime, minute: value as number });
                      }}
                      width={60}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 버튼 영역 */}
        <View style={styles.buttonContainer}>
          <View style={styles.buttonRow}>
            {safeCurrentStep > 0 && (
              <TouchableOpacity
                style={styles.prevButton}
                onPress={handlePrev}
                activeOpacity={0.7}
              >
                <Text style={styles.prevButtonText}>이전</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.nextButton,
                loading && styles.nextButtonDisabled,
                safeCurrentStep === 0 && styles.nextButtonFull,
              ]}
              onPress={handleNext}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.nextButtonText}>
                {loading
                  ? (isEditMode ? '수정 중...' : '저장 중...')
                  : safeCurrentStep === STEPS.length - 1
                  ? (isEditMode ? '수정 완료' : '완료')
                  : '다음'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      
      {/* Alert Modal */}
      <AlertModal
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        onClose={() => {
          if (alertModal.onClose) {
            alertModal.onClose();
          } else {
            setAlertModal({ visible: false, title: '', message: '' });
          }
        }}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  container: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  contentTouchable: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing[4],
    paddingTop: spacing[6],
    justifyContent: 'flex-start',
  },
  progressContainer: {
    marginBottom: spacing[4],
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing[2],
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
  },
  stepContainer: {
    alignItems: 'center',
    marginTop: spacing[2],
  },
  stepTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[2],
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize['2xl']),
  },
  stepDescription: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing[6],
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base) * 1.5,
  },
  timeInputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  timePickerRow: {
    flexDirection: 'row',
    gap: spacing[2],
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  timeSeparator: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 250,
    paddingHorizontal: spacing[2],
  },
  timeSeparatorText: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  wheelPickerContainer: {
    height: 250,
    position: 'relative',
    overflow: 'hidden',
  },
  wheelPickerSelection: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 50,
    marginTop: -25,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: borderRadius.sm,
    zIndex: 1,
    pointerEvents: 'none',
  },
  wheelPickerScrollView: {
    flex: 1,
  },
  wheelPickerContent: {
    paddingVertical: 0,
  },
  wheelPickerItem: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
  },
  wheelPickerItemText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    textAlign: 'center',
  },
  timePickerWrapper: {
    width: '100%',
  },
  dropdownWrapper: {
    position: 'relative',
    zIndex: 1,
  },
  dropdownWrapperOpen: {
    zIndex: 1000,
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    minHeight: 48,
    minWidth: 80,
  },
  dropdownButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  dropdownArrow: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginLeft: spacing[2],
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.sm,
    marginTop: spacing[1],
    maxHeight: 200,
    zIndex: 1000,
    elevation: 3,
  },
  dropdownScrollView: {
    maxHeight: 200,
    flexGrow: 0,
  },
  dropdownScrollContent: {
    paddingVertical: spacing[1],
  },
  dropdownItem: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  dropdownItemText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  buttonContainer: {
    padding: spacing[4],
    paddingBottom: spacing[6],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  prevButton: {
    flex: 1,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.sm,
    paddingVertical: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  nextButton: {
    flex: 1,
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.sm,
    paddingVertical: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonDisabled: {
    backgroundColor: colors.gray[300],
    opacity: 0.6,
  },
  nextButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
});

export default SpontaneousMissionSetupScreen;
