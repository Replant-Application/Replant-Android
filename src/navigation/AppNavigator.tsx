import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform, BackHandler, ToastAndroid, Animated, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../contexts/UserContext';
import { useSse } from '../contexts/SseContext';
import { useWakeUpMission } from '../contexts/WakeUpMissionContext';
import { SCREEN_NAMES } from '../utils/constants';
import { colors, spacing, typography } from '../utils/designTokens';
import { getOptimizedLineHeight } from '../utils/textStyles';
import { RootStackParamList } from '../types/navigation';
import { apiClient } from '../api/client';
import { logout } from '../services/authService';
import { backgroundMusicService } from '../services/backgroundMusicService';
import { playButtonSound } from '../utils/soundUtils';
import { getSpontaneousMissionSetup } from '../api/missionApi';

// 화면 컴포넌트들
import OnboardingScreen from '../screens/OnboardingScreen';
import SignUpScreen from '../screens/SignUpScreen';
import LoginScreen from '../screens/LoginScreen';
import NicknameScreen from '../screens/NicknameScreen';
import HomeScreen from '../screens/HomeScreen';
import DiaryScreen from '../screens/DiaryScreen';
import MissionScreen from '../screens/MissionScreen';
import CustomMissionCreateScreen from '../screens/CustomMissionCreateScreen';
import CounselingSelectScreen from '../screens/CounselingSelectScreen';
import PlacesSearchScreen from '../screens/PlacesSearchScreen';
import CharacterDetailScreen from '../screens/CharacterDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import InfoScreen from '../screens/InfoScreen';
import PhotoSelectScreen from '../screens/PhotoSelectScreen';
import CommunityScreen from '../screens/CommunityScreen';
import CommunityPostCreateScreen from '../screens/CommunityPostCreateScreen';
import CommunityPostDetailScreen from '../screens/CommunityPostDetailScreen';
import CommunityPostEditScreen from '../screens/CommunityPostEditScreen';
import MyPageScreen from '../screens/MyPageScreen';
import CalendarScreen from '../screens/CalendarScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminUserListScreen from '../screens/AdminUserListScreen';
import AdminUserDetailScreen from '../screens/AdminUserDetailScreen';
import AdminUserEditScreen from '../screens/AdminUserEditScreen';
import MissionGroupScreen from '../screens/MissionGroupScreen';
import MissionDetailScreen from '../screens/MissionDetailScreen';
import BadgeDetailScreen from '../screens/BadgeDetailScreen';
import VerificationPostCreateScreen from '../screens/VerificationPostCreateScreen';
import NotificationScreen from '../screens/NotificationScreen';
import FindIdScreen from '../screens/FindIdScreen';
import FindIdResultScreen from '../screens/FindIdResultScreen';
import FindPasswordScreen from '../screens/FindPasswordScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import SoundSettingsScreen from '../screens/SoundSettingsScreen';
import MissionSetListScreen from '../screens/MissionSetListScreen';
import MissionSetCreateScreen from '../screens/MissionSetCreateScreen';
import MissionSetDetailScreen from '../screens/MissionSetDetailScreen';
import MyMissionSetsScreen from '../screens/MyMissionSetsScreen';
import MyProgressDetailScreen from '../screens/MyProgressDetailScreen';
import RoutineSettingScreen from '../screens/RoutineSettingScreen';
import TodoListScreen from '../screens/TodoListScreen';
import TodoListCreateScreen from '../screens/TodoListCreateScreen';
import TodoListDetailScreen from '../screens/TodoListDetailScreen';
import OAuthCompleteSignUpScreen from '../screens/OAuthCompleteSignUpScreen';
import SpontaneousMissionSetupScreen from '../screens/SpontaneousMissionSetupScreen';
import WakeUpVerificationScreen from '../screens/WakeUpVerificationScreen';

// 간단한 상태 기반 네비게이션 (React Navigation 없이)
const AppNavigator = () => {
  const { isLoggedIn, isLoading, logout: userLogout } = useUser();
  const { lastNotification } = useSse();
  const { setWakeUpMissionId } = useWakeUpMission();
  const [currentScreen, setCurrentScreen] = useState<string | null>(null);
  const [navigationParams, setNavigationParams] = useState({});
  const navigationParamsRef = useRef<any>({}); // params를 즉시 저장하기 위한 ref
  const [backPressedOnce, setBackPressedOnce] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const processedNotificationIdRef = useRef<number | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // 메인 탭 화면인지 확인
  const isMainTabScreen = useCallback((screen: string) => {
    return [
      SCREEN_NAMES.HOME,
      SCREEN_NAMES.MISSION,
      SCREEN_NAMES.COMMUNITY,
      SCREEN_NAMES.DIARY,
      SCREEN_NAMES.SETTINGS,
    ].includes(screen);
  }, []);

  // 온보딩 체크 및 초기 화면 결정
  useEffect(() => {
    const checkOnboardingAndSetScreen = async () => {
      if (!isLoggedIn) {
        // 항상 온보딩 표시 (건너뛰기 버튼으로 로그인 화면으로 이동 가능)
        setCurrentScreen(SCREEN_NAMES.ONBOARDING);
      }
      setIsCheckingOnboarding(false);
    };

    if (!isLoading) {
      checkOnboardingAndSetScreen();
    }
  }, [isLoading, isLoggedIn]);

  // 로그인 상태 변경 감지 - 로그인 성공 시 돌발 미션 설정 확인 후 화면 전환
  useEffect(() => {
    const checkSpontaneousMissionSetup = async () => {
      if (isLoggedIn && !isLoading && !isCheckingOnboarding) {
        // 설문 화면에 있으면 절대 다른 화면으로 이동하지 않음 (완료 버튼을 눌러야만 이동)
        if (currentScreen === SCREEN_NAMES.SPONTANEOUS_MISSION_SETUP) {
          console.log('[AppNavigator] 설문 화면에 있음 - 모든 체크 건너뛰기 (완료 전까지 이동 금지)');
          return;
        }
        
        // 알림 화면이나 다른 상세 화면에 있으면 이동하지 않음
        if (currentScreen && currentScreen !== SCREEN_NAMES.LOGIN && !isMainTabScreen(currentScreen)) {
          console.log('[AppNavigator] 상세 화면에 있음 - 체크 건너뛰기:', currentScreen);
          return;
        }
        
        // currentScreen이 이미 설정되어 있고 메인 탭 화면이면 건너뛰기 (이미 홈에 있음)
        // 단, 로그인 직후가 아닌 경우에만 (로그인 직후에는 currentScreen이 null이거나 로그인 화면일 수 있음)
        if (currentScreen && isMainTabScreen(currentScreen) && currentScreen !== SCREEN_NAMES.LOGIN) {
          console.log('[AppNavigator] 이미 메인 탭 화면에 있음 - 체크 건너뛰기');
          return;
        }
        
        try {
          // 백엔드 API에서 돌발 미션 설정 조회
          const result = await getSpontaneousMissionSetup();
          
          console.log('[AppNavigator] 돌발 미션 설정 확인:', { 
            success: result.success,
            hasData: !!result.data,
            hasWakeTime: !!result.data?.wakeTime,
            hasSleepTime: !!result.data?.sleepTime,
            hasBreakfastTime: !!result.data?.breakfastTime,
            hasLunchTime: !!result.data?.lunchTime,
            hasDinnerTime: !!result.data?.dinnerTime,
            isCompleted: result.data?.isSpontaneousMissionSetupCompleted,
            error: result.error,
            currentScreen,
            isLoggedIn,
            isLoading,
            isCheckingOnboarding
          });
          
          // 신규 가입자 판단: DB에 설정이 없으면 신규 가입자
          // 설정이 있다는 것 = wakeTime, sleepTime, breakfastTime, lunchTime, dinnerTime 중 하나라도 있으면 기존 사용자
          const hasSetupData = result.success && result.data && (
            result.data.wakeTime || 
            result.data.sleepTime || 
            result.data.breakfastTime || 
            result.data.lunchTime || 
            result.data.dinnerTime
          );
          
          if (!hasSetupData) {
            // DB에 설정이 없으면 신규 가입자 - 설문 화면으로 이동
            console.log('[AppNavigator] ✅ 신규 가입자 (DB에 설정 없음) - 설문 화면으로 이동');
            try {
              setCurrentScreen(SCREEN_NAMES.SPONTANEOUS_MISSION_SETUP);
            } catch (error) {
              console.error('[AppNavigator] 설문 화면 이동 실패:', error);
              // 에러 발생 시 홈으로 이동
              setCurrentScreen(SCREEN_NAMES.HOME);
            }
          } else {
            // DB에 설정이 있으면 기존 사용자 - 홈 화면으로 이동
            console.log('[AppNavigator] ✅ 기존 사용자 (DB에 설정 있음) - 홈 화면으로 이동');
            try {
              setCurrentScreen(SCREEN_NAMES.HOME);
            } catch (error) {
              console.error('[AppNavigator] 홈 화면 이동 실패:', error);
            }
          }
        } catch (error) {
          console.error('[AppNavigator] Failed to check spontaneous mission setup:', error);
          // 에러 발생 시 설문 화면으로 이동 (신규 가입자로 간주)
          console.log('[AppNavigator] ⚠️ 에러 발생 - 신규 가입자로 간주하여 설문 화면으로 이동');
          setCurrentScreen(SCREEN_NAMES.SPONTANEOUS_MISSION_SETUP);
        }
      }
    };

    // 설문 화면에 있을 때는 절대 실행하지 않음
    if (currentScreen === SCREEN_NAMES.SPONTANEOUS_MISSION_SETUP) {
      console.log('[AppNavigator] 설문 화면에 있음 - checkSpontaneousMissionSetup 건너뛰기');
      return;
    }
    
    checkSpontaneousMissionSetup();
  }, [isLoggedIn, isLoading, isCheckingOnboarding, currentScreen, isMainTabScreen]);

  // AsyncStorage 변경 감지 (설정 완료 후 홈으로 이동)
  // 주의: 이 useEffect는 완료 후에만 실행되도록 설문 화면에서 직접 호출하지 않음
  useEffect(() => {
    if (!isLoggedIn || isLoading || isCheckingOnboarding) return;
    
    // 설문 화면에 있을 때는 체크하지 않음 (완료 버튼을 눌러야만 이동)
    if (currentScreen === SCREEN_NAMES.SPONTANEOUS_MISSION_SETUP) {
      return;
    }

    const checkSetupStatus = async () => {
      try {
        const setupCompleted = await AsyncStorage.getItem('@replant:spontaneousMissionSetupCompleted');
        // 설정이 완료되었고 현재 설문 화면에 있으면 홈으로 이동
        if (setupCompleted === 'true' && currentScreen === SCREEN_NAMES.SPONTANEOUS_MISSION_SETUP) {
          console.log('[AppNavigator] 설정 완료 감지 - 홈으로 이동');
          setCurrentScreen(SCREEN_NAMES.HOME);
        }
      } catch (error) {
        console.error('Failed to check setup status:', error);
      }
    };

    // 주기적으로 확인 (설정 완료 감지용) - 하지만 설문 화면에서는 실행 안 함
    const interval = setInterval(checkSetupStatus, 1000);
    return () => clearInterval(interval);
  }, [isLoggedIn, isLoading, isCheckingOnboarding, currentScreen]);

  // 토큰 만료 콜백 설정 - 바로 로그아웃 처리
  useEffect(() => {
    apiClient.setOnTokenExpiredCallback(async () => {
    await logout();
    await userLogout();
    setCurrentScreen(SCREEN_NAMES.LOGIN);
    });
  }, [userLogout]);

  // 배경음악 초기화
  useEffect(() => {
    backgroundMusicService.initialize();
    // cleanup에서 unload 호출하지 않음 (ExoPlayer 스레드 에러 방지)
    // 앱 종료 시 OS가 자동으로 리소스를 정리함
    return () => {
      // 에러가 발생해도 앱이 크래시되지 않도록 try-catch로 감싸기
      try {
        backgroundMusicService.stop().catch(() => {
          // 에러 무시
        });
      } catch (error) {
        // 에러 무시
      }
    };
  }, []);

  // SSE 알림 수신 시 화면 라우팅 처리
  useEffect(() => {
    console.log('[AppNavigator] 알림 체크:', { lastNotification: !!lastNotification, isLoggedIn });
    
    if (!lastNotification || !isLoggedIn) {
      return;
    }

    console.log('[AppNavigator] 알림 상세:', JSON.stringify(lastNotification, null, 2));

    // 이미 처리한 알림인지 확인
    const notificationId = lastNotification.id || lastNotification.notificationId;
    if (notificationId && notificationId === processedNotificationIdRef.current) {
      console.log('[AppNavigator] 이미 처리한 알림:', notificationId);
      return;
    }

    const type = lastNotification.type || '';
    const title = lastNotification.title || '';
    const content = lastNotification.content || '';
    console.log('[AppNavigator] 알림 타입:', type);
    console.log('[AppNavigator] 알림 제목:', title);
    console.log('[AppNavigator] 알림 내용:', content);

    // 기상 미션 알림 처리 (SPONTANEOUS_WAKE_UP)
    if (type === 'SPONTANEOUS_WAKE_UP') {
      console.log('[AppNavigator] ✅ 기상 미션 알림 수신 (SSE/FCM)');
      console.log('[AppNavigator] 알림 전체 데이터:', JSON.stringify(lastNotification, null, 2));
      console.log('[AppNavigator] 알림 키:', Object.keys(lastNotification || {}));
      
      // userMissionId 추출 (우선순위: userMissionId > referenceId)
      // FCM 알림의 경우 문자열로 올 수 있으므로 숫자로 변환 필요
      let userMissionId = lastNotification.userMissionId || lastNotification.referenceId;
      
      console.log('[AppNavigator] 추출 전 userMissionId:', userMissionId);
      console.log('[AppNavigator] userMissionId 타입:', typeof userMissionId);
      console.log('[AppNavigator] lastNotification.userMissionId:', lastNotification.userMissionId);
      console.log('[AppNavigator] lastNotification.referenceId:', lastNotification.referenceId);
      
      if (!userMissionId) {
        console.error('[AppNavigator] ❌ userMissionId가 없습니다.');
        console.error('[AppNavigator] 알림 데이터 구조:', {
          hasUserMissionId: !!lastNotification.userMissionId,
          hasReferenceId: !!lastNotification.referenceId,
          notificationKeys: Object.keys(lastNotification || {}),
          fullNotification: lastNotification
        });
        return;
      }

      // userMissionId를 number로 변환 (문자열일 수 있음)
      const missionId = typeof userMissionId === 'string' 
        ? (userMissionId.trim() ? Number(userMissionId.trim()) : null)
        : userMissionId;
      
      console.log('[AppNavigator] 변환 후 missionId:', missionId, '타입:', typeof missionId);
      
      if (!missionId || isNaN(missionId) || missionId === 0) {
        console.error('[AppNavigator] ❌ 유효하지 않은 userMissionId:', {
          missionId,
          originalValue: userMissionId,
          type: typeof userMissionId,
          isNaN: isNaN(missionId),
          isZero: missionId === 0
        });
        return;
      }

      console.log('[AppNavigator] 기상 미션 인증 화면으로 이동, userMissionId:', missionId);
      
      // Context에 userMissionId 저장 (전역 상태로 관리) - 비동기 처리
      setWakeUpMissionId(missionId).then(() => {
        console.log('[AppNavigator] ✅ Context에 userMissionId 저장 완료:', missionId);
      }).catch((error) => {
        console.error('[AppNavigator] ❌ Context 저장 실패:', error);
        // Context 저장 실패해도 계속 진행
      });
      
      // 네비게이션 파라미터로도 전달 (이중 보장)
      console.log('[AppNavigator] navigate 호출 전, params 객체:', { userMissionId: missionId });
      processedNotificationIdRef.current = notificationId || null;
      navigate(SCREEN_NAMES.WAKE_UP_VERIFICATION, { userMissionId: missionId });
      console.log('[AppNavigator] navigate 호출 후');
      return;
    }

    // 투두리스트 작성 알림인지 확인
    const titleLower = title.toLowerCase();
    const contentLower = content.toLowerCase();
    const isTodoNotification = 
      title === '투두리스트 작성 알림' || 
      title.includes('투두리스트') ||
      title.includes('투두') ||
      titleLower.includes('todo') ||
      contentLower.includes('투두리스트') ||
      contentLower.includes('todo');
    
    console.log('[AppNavigator] 투두리스트 알림 여부:', isTodoNotification);
    
    if (isTodoNotification) {
      console.log('[AppNavigator] ✅ 투두리스트 작성 알림 수신, 투두리스트 작성 화면으로 이동');
      processedNotificationIdRef.current = notificationId || null;
      setCurrentScreen(SCREEN_NAMES.TODO_LIST_CREATE);
    } else {
      console.log('[AppNavigator] ⚠️ 특별 처리할 알림이 아님, 무시');
    }
  }, [lastNotification, isLoggedIn]);

  // 화면 변경 시 배경음악 재생
  useEffect(() => {
    if (currentScreen && isLoggedIn) {
      backgroundMusicService.playForScreen(currentScreen);
    } else {
      backgroundMusicService.stop();
    }
  }, [currentScreen, isLoggedIn]);

  // 화면 전환 애니메이션 (메인 탭 화면 간 전환은 제외)
  useEffect(() => {
    // 메인 탭 화면 간 전환은 애니메이션 없이 즉시 전환
    if (currentScreen && isMainTabScreen(currentScreen)) {
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
      return;
    }
    
    // 초기값 설정 (새 화면이 약간 아래에서 시작)
    fadeAnim.setValue(0.5);
    slideAnim.setValue(10);
    
    // 부드러운 페이드와 슬라이드 인 (더 자연스러운 전환)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentScreen, fadeAnim, slideAnim, isMainTabScreen]);

  // 뒤로가기 버튼 처리
  useEffect(() => {
    if (Platform.OS !== 'android' || !isLoggedIn) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // 메인 탭 화면이면 두 번 눌러서 종료
      if (currentScreen && isMainTabScreen(currentScreen)) {
        if (backPressedOnce) {
          BackHandler.exitApp();
          return true;
        }
        setBackPressedOnce(true);
        ToastAndroid.show('뒤로가기를 한번 더 누르면 앱이 종료됩니다.', ToastAndroid.SHORT);
        setTimeout(() => setBackPressedOnce(false), 2000);
        return true;
      }

      // 상세 화면이면 goBack 호출
      // 화면별 뒤로가기 목적지 정의
      if (currentScreen === SCREEN_NAMES.PLACES_SEARCH) {
        setCurrentScreen(SCREEN_NAMES.COUNSELING_SELECT);
      } else if (currentScreen === SCREEN_NAMES.COUNSELING_SELECT || currentScreen === SCREEN_NAMES.INFO || currentScreen === SCREEN_NAMES.SOUND_SETTINGS) {
        setCurrentScreen(SCREEN_NAMES.SETTINGS);
      } else if (currentScreen === SCREEN_NAMES.PHOTO_SELECT || currentScreen === SCREEN_NAMES.MISSION_DETAIL || currentScreen === SCREEN_NAMES.BADGE_DETAIL || currentScreen === SCREEN_NAMES.VERIFICATION_POST_CREATE) {
        setCurrentScreen(SCREEN_NAMES.MISSION);
      } else if (
        currentScreen === SCREEN_NAMES.COMMUNITY_POST_CREATE ||
        currentScreen === SCREEN_NAMES.COMMUNITY_POST_DETAIL ||
        currentScreen === SCREEN_NAMES.COMMUNITY_POST_EDIT ||
        currentScreen === SCREEN_NAMES.MISSION_GROUP ||
        currentScreen === SCREEN_NAMES.MISSION_SET_LIST ||
        currentScreen === SCREEN_NAMES.MISSION_SET_CREATE ||
        currentScreen === SCREEN_NAMES.MISSION_SET_DETAIL ||
        currentScreen === SCREEN_NAMES.MY_MISSION_SETS
      ) {
        setCurrentScreen(SCREEN_NAMES.COMMUNITY);
      } else if (
        currentScreen === SCREEN_NAMES.MY_PAGE ||
        currentScreen === SCREEN_NAMES.CALENDAR
      ) {
        setCurrentScreen(SCREEN_NAMES.SETTINGS);
      } else if (currentScreen === SCREEN_NAMES.NOTIFICATION || currentScreen === SCREEN_NAMES.MY_PROGRESS_DETAIL || currentScreen === 'RoutineSetting') {
        setCurrentScreen(SCREEN_NAMES.HOME);
      } else if (currentScreen === SCREEN_NAMES.TODO_LIST || currentScreen === SCREEN_NAMES.TODO_LIST_CREATE) {
        setCurrentScreen(SCREEN_NAMES.HOME);
      } else if (currentScreen === SCREEN_NAMES.TODO_LIST_DETAIL) {
        setCurrentScreen(SCREEN_NAMES.TODO_LIST);
      } else if (currentScreen === SCREEN_NAMES.WAKE_UP_VERIFICATION) {
        setCurrentScreen(SCREEN_NAMES.HOME);
      } else if (currentScreen === SCREEN_NAMES.SPONTANEOUS_MISSION_SETUP) {
        setCurrentScreen(SCREEN_NAMES.HOME);
      } else {
        setCurrentScreen(SCREEN_NAMES.HOME);
      }
      setNavigationParams({});
      return true;
    });

    return () => backHandler.remove();
  }, [currentScreen, isLoggedIn, backPressedOnce, isMainTabScreen]);

  if (isLoading || isCheckingOnboarding || currentScreen === null) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require('../assets/images/Replant_Loading.png')}
          style={styles.loadingImage}
          resizeMode="contain"
          accessibilityLabel="로딩 중"
        />
      </View>
    );
  }

  // 로그인하지 않은 경우 - 인증 화면들
  if (!isLoggedIn) {
    // onNavigate 확장: params도 받을 수 있도록
    const onNavigateWithParams = (screen: string, params?: any) => {
      setCurrentScreen(screen);
      if (params) {
        setNavigationParams(params);
      }
    };

    // 쿼리스트링 파싱을 위한 네비게이션 처리
    const handleAuthNavigate = (screenWithParams: string) => {
      // 쿼리스트링 형태 파싱 (예: OAuthCompleteSignUp?email=xxx&nickname=yyy)
      const [screenName, queryString] = screenWithParams.split('?');
      const params: Record<string, string> = {};

      if (queryString) {
        queryString.split('&').forEach(param => {
          const [key, value] = param.split('=');
          if (key && value) {
            params[key] = decodeURIComponent(value);
          }
        });
      }

      setCurrentScreen(screenName);
      setNavigationParams(params);
    };

    const renderAuthScreen = () => {
      const route = {
        params: navigationParams || {},
        key: currentScreen,
        name: currentScreen
      } as any;

      switch (currentScreen) {
        case SCREEN_NAMES.ONBOARDING:
          return <OnboardingScreen onNavigate={handleAuthNavigate} />;
        case SCREEN_NAMES.SIGNUP:
          return <SignUpScreen onNavigate={handleAuthNavigate} />;
        case SCREEN_NAMES.LOGIN:
          return <LoginScreen onNavigate={handleAuthNavigate} />;
        case SCREEN_NAMES.NICKNAME:
          return <NicknameScreen onNavigate={handleAuthNavigate} />;
        case SCREEN_NAMES.FIND_ID:
          return <FindIdScreen onNavigate={onNavigateWithParams} />;
        case SCREEN_NAMES.FIND_ID_RESULT:
          return <FindIdResultScreen onNavigate={onNavigateWithParams} route={route} />;
        case SCREEN_NAMES.FIND_PASSWORD:
          return <FindPasswordScreen onNavigate={onNavigateWithParams} />;
        case SCREEN_NAMES.OAUTH_COMPLETE_SIGNUP:
          return <OAuthCompleteSignUpScreen onNavigate={handleAuthNavigate} route={route} />;
        case SCREEN_NAMES.SPONTANEOUS_MISSION_SETUP: {
          const navigationForSetup = {
            navigate: (screen: string, params?: any) => {
              setCurrentScreen(screen);
              if (params) {
                setNavigationParams(params);
              }
            },
            goBack: () => {
              // 설문 화면에서는 뒤로가기 불가 (완료해야 함)
            },
          } as any;
          return <SpontaneousMissionSetupScreen navigation={navigationForSetup} route={route} />;
        }
        default:
          return <LoginScreen onNavigate={handleAuthNavigate} />;
      }
    };

    return (
      <View style={styles.container}>
        <Animated.View 
          style={[
            styles.screenContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          {renderAuthScreen()}
        </Animated.View>
      </View>
    );
  }

  // 네비게이션 함수
  const navigate = async (screenName: keyof RootStackParamList | string, params: any = {}) => {
    console.log('[AppNavigator] navigate 호출:', screenName, params);
    console.log('[AppNavigator] params 타입:', typeof params, 'params 내용:', JSON.stringify(params));
    try {
      // ref에 즉시 저장 (상태 업데이트 전에 사용 가능)
      navigationParamsRef.current = params || {};
      // params를 먼저 설정한 후 화면을 변경하여 race condition 방지
      setNavigationParams(params || {});
      setCurrentScreen(screenName as string);
      console.log('[AppNavigator] navigate 완료:', screenName, 'params 설정됨:', params);
      console.log('[AppNavigator] navigationParamsRef.current:', navigationParamsRef.current);
    } catch (error) {
      console.error('[AppNavigator] navigate 실패:', error);
    }
  };

  const goBack = () => {
    // 화면별 뒤로가기 목적지 정의
    if (currentScreen === SCREEN_NAMES.PLACES_SEARCH) {
      setCurrentScreen(SCREEN_NAMES.COUNSELING_SELECT);
    } else if (currentScreen === SCREEN_NAMES.COUNSELING_SELECT || currentScreen === SCREEN_NAMES.INFO || currentScreen === SCREEN_NAMES.SOUND_SETTINGS || currentScreen === SCREEN_NAMES.CHANGE_PASSWORD) {
      setCurrentScreen(SCREEN_NAMES.SETTINGS);
    } else if (currentScreen === SCREEN_NAMES.PHOTO_SELECT || currentScreen === SCREEN_NAMES.MISSION_DETAIL || currentScreen === SCREEN_NAMES.BADGE_DETAIL || currentScreen === SCREEN_NAMES.VERIFICATION_POST_CREATE) {
      setCurrentScreen(SCREEN_NAMES.MISSION);
    } else if (
      currentScreen === SCREEN_NAMES.COMMUNITY_POST_CREATE ||
      currentScreen === SCREEN_NAMES.COMMUNITY_POST_DETAIL ||
      currentScreen === SCREEN_NAMES.COMMUNITY_POST_EDIT ||
      currentScreen === SCREEN_NAMES.MISSION_GROUP ||
      currentScreen === SCREEN_NAMES.VERIFICATION_POST_DETAIL ||
      currentScreen === SCREEN_NAMES.MISSION_SET_LIST ||
        currentScreen === SCREEN_NAMES.MISSION_SET_CREATE ||
        currentScreen === SCREEN_NAMES.MISSION_SET_DETAIL ||
        currentScreen === SCREEN_NAMES.MY_MISSION_SETS
    ) {
      setCurrentScreen(SCREEN_NAMES.COMMUNITY);
    } else if (
      currentScreen === SCREEN_NAMES.MY_PAGE ||
      currentScreen === SCREEN_NAMES.CALENDAR
    ) {
      setCurrentScreen(SCREEN_NAMES.SETTINGS);
    } else if (currentScreen === SCREEN_NAMES.NOTIFICATION || currentScreen === SCREEN_NAMES.MY_PROGRESS_DETAIL || currentScreen === 'RoutineSetting') {
      setCurrentScreen(SCREEN_NAMES.HOME);
    } else if (currentScreen === SCREEN_NAMES.TODO_LIST || currentScreen === SCREEN_NAMES.TODO_LIST_CREATE) {
      setCurrentScreen(SCREEN_NAMES.HOME);
    } else if (currentScreen === SCREEN_NAMES.TODO_LIST_DETAIL) {
      setCurrentScreen(SCREEN_NAMES.TODO_LIST);
    } else if (currentScreen === SCREEN_NAMES.WAKE_UP_VERIFICATION) {
      setCurrentScreen(SCREEN_NAMES.HOME);
    } else if (currentScreen === SCREEN_NAMES.SPONTANEOUS_MISSION_SETUP) {
      setCurrentScreen(SCREEN_NAMES.HOME);
    } else {
      setCurrentScreen(SCREEN_NAMES.HOME);
    }
    setNavigationParams({});
    navigationParamsRef.current = {}; // ref도 초기화
  };

  // 로그인한 경우 - 간단한 탭 네비게이션
  const renderScreen = () => {
    const navigation = {
      navigate: navigate as any,
      goBack,
      isFocused: () => true,
      dispatch: () => {},
      navigateDeprecated: () => {},
      preload: () => {},
      addListener: () => () => {},
      removeListener: () => () => {},
      getParent: () => null,
    } as any;
    // navigationParams를 깊은 복사하여 route 객체 생성 (참조 문제 방지)
    // ref에서도 확인하여 상태 업데이트 지연 문제 해결
    const stateParams = navigationParams && typeof navigationParams === 'object' 
      ? { ...navigationParams } 
      : (navigationParams || {});
    const refParams = navigationParamsRef.current && typeof navigationParamsRef.current === 'object'
      ? { ...navigationParamsRef.current }
      : (navigationParamsRef.current || {});
    
    // ref에 params가 있고 state에 없으면 ref 사용 (상태 업데이트 지연 대응)
    const routeParams = Object.keys(stateParams).length > 0 ? stateParams : refParams;
    
    const route = {
      params: routeParams,
      key: currentScreen,
      name: currentScreen
    } as any;
    
    // 디버깅: WAKE_UP_VERIFICATION 화면일 때 파라미터 로그
    if (currentScreen === SCREEN_NAMES.WAKE_UP_VERIFICATION) {
      console.log('[AppNavigator] WAKE_UP_VERIFICATION 화면 렌더링');
      console.log('[AppNavigator] navigationParams (state):', navigationParams);
      console.log('[AppNavigator] navigationParamsRef.current (ref):', navigationParamsRef.current);
      console.log('[AppNavigator] routeParams (최종):', routeParams);
      console.log('[AppNavigator] route.params:', route.params);
      console.log('[AppNavigator] route.params.userMissionId:', route.params?.userMissionId);
      console.log('[AppNavigator] route.params.userMissionId 타입:', typeof route.params?.userMissionId);
    }

    switch (currentScreen) {
      case SCREEN_NAMES.HOME:
        return <HomeScreen navigation={navigation} />;
      case SCREEN_NAMES.DIARY:
        return <DiaryScreen />;
      case SCREEN_NAMES.MISSION:
        return <MissionScreen navigation={navigation} route={route} />;
      case SCREEN_NAMES.CUSTOM_MISSION_CREATE:
        return <CustomMissionCreateScreen navigation={navigation} route={route} />;
      case SCREEN_NAMES.COUNSELING_SELECT:
        return <CounselingSelectScreen navigation={navigation} />;
      case SCREEN_NAMES.PLACES_SEARCH:
        return <PlacesSearchScreen navigation={navigation} />;
      case SCREEN_NAMES.CHARACTER_DETAIL:
        return <CharacterDetailScreen navigation={navigation} route={route} />;
      case SCREEN_NAMES.SETTINGS:
        return <SettingsScreen navigation={navigation} />;
      case SCREEN_NAMES.INFO:
        return <InfoScreen navigation={navigation} route={route} />;
      case SCREEN_NAMES.PHOTO_SELECT:
        return <PhotoSelectScreen navigation={navigation} route={route} />;
      case SCREEN_NAMES.COMMUNITY:
        return <CommunityScreen navigation={navigation} />;
      case SCREEN_NAMES.COMMUNITY_POST_CREATE:
        return <CommunityPostCreateScreen navigation={navigation} route={route} />;
      case SCREEN_NAMES.COMMUNITY_POST_DETAIL:
        return <CommunityPostDetailScreen navigation={navigation} route={route} />;
      case SCREEN_NAMES.COMMUNITY_POST_EDIT:
        return <CommunityPostEditScreen navigation={navigation} route={route} />;
      case SCREEN_NAMES.MY_PAGE:
        return <MyPageScreen navigation={navigation} />;
      case SCREEN_NAMES.CALENDAR:
        return <CalendarScreen navigation={navigation} />;
      case SCREEN_NAMES.ADMIN_DASHBOARD:
        return <AdminDashboardScreen navigation={navigation} />;
      case SCREEN_NAMES.ADMIN_USER_LIST:
        return <AdminUserListScreen navigation={navigation} />;
      case SCREEN_NAMES.ADMIN_USER_DETAIL:
        return <AdminUserDetailScreen navigation={navigation} route={route} />;
      case SCREEN_NAMES.ADMIN_USER_EDIT:
        return <AdminUserEditScreen navigation={navigation} route={route} />;
      case SCREEN_NAMES.MISSION_GROUP:
        return <MissionGroupScreen navigation={navigation} />;
      case SCREEN_NAMES.MISSION_DETAIL:
        return <MissionDetailScreen navigation={navigation} route={route} />;
      case SCREEN_NAMES.BADGE_DETAIL:
        return <BadgeDetailScreen navigation={navigation} route={route} />;
      case SCREEN_NAMES.VERIFICATION_POST_CREATE:
        return <VerificationPostCreateScreen navigation={navigation} route={route} />;
      case SCREEN_NAMES.NOTIFICATION:
        return <NotificationScreen navigation={navigation} />;
      case SCREEN_NAMES.SOUND_SETTINGS:
        return <SoundSettingsScreen navigation={navigation} />;
      case SCREEN_NAMES.CHANGE_PASSWORD:
        return <ChangePasswordScreen navigation={navigation} />;
      case SCREEN_NAMES.MISSION_SET_LIST:
        return <MissionSetListScreen navigation={navigation} />;
      case SCREEN_NAMES.MISSION_SET_CREATE:
        return <MissionSetCreateScreen navigation={navigation} />;
      case SCREEN_NAMES.MISSION_SET_DETAIL:
        return <MissionSetDetailScreen navigation={navigation} route={route} />;
      case SCREEN_NAMES.MY_MISSION_SETS:
        return <MyMissionSetsScreen navigation={navigation} />;
      case SCREEN_NAMES.MY_PROGRESS_DETAIL:
        return <MyProgressDetailScreen navigation={navigation} />;
      case 'RoutineSetting':
        return <RoutineSettingScreen navigation={navigation} />;
      case SCREEN_NAMES.TODO_LIST:
        return <TodoListScreen navigation={navigation} route={route} />;
      case SCREEN_NAMES.TODO_LIST_CREATE:
        return <TodoListCreateScreen navigation={navigation} />;
      case SCREEN_NAMES.TODO_LIST_DETAIL:
        return <TodoListDetailScreen navigation={navigation} route={route} />;
      case SCREEN_NAMES.SPONTANEOUS_MISSION_SETUP:
        try {
          return <SpontaneousMissionSetupScreen navigation={navigation} route={route} />;
        } catch (error) {
          console.error('[AppNavigator] SpontaneousMissionSetupScreen 렌더링 실패:', error);
          // 에러 발생 시 홈으로 이동
          setCurrentScreen(SCREEN_NAMES.HOME);
          return null;
        }
      case SCREEN_NAMES.WAKE_UP_VERIFICATION:
        return <WakeUpVerificationScreen navigation={navigation} route={route} />;
      default:
        return <HomeScreen navigation={navigation} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* 메인 화면 */}
      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>

      {/* 하단 탭 네비게이션 */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, currentScreen === SCREEN_NAMES.HOME && styles.activeTab]}
          onPress={() => setCurrentScreen(SCREEN_NAMES.HOME)}
          activeOpacity={0.7}
          accessibilityRole="tab"
          accessibilityLabel="홈"
          accessibilityState={{ selected: currentScreen === SCREEN_NAMES.HOME }}
        >
          <Image
            source={require('../assets/images/home.png')}
            style={[
              styles.tabIconImage,
              currentScreen === SCREEN_NAMES.HOME && styles.tabIconImageActive
            ]}
            resizeMode="contain"
            accessibilityElementsHidden={true}
          />
          <Text style={[
            styles.tabLabel,
            currentScreen === SCREEN_NAMES.HOME && styles.tabLabelActive
          ]}>홈</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, currentScreen === SCREEN_NAMES.MISSION && styles.activeTab]}
          onPress={() => setCurrentScreen(SCREEN_NAMES.MISSION)}
          activeOpacity={0.7}
          accessibilityRole="tab"
          accessibilityLabel="미션"
          accessibilityState={{ selected: currentScreen === SCREEN_NAMES.MISSION }}
        >
          <Image
            source={require('../assets/images/goal.png')}
            style={[
              styles.tabIconImage,
              currentScreen === SCREEN_NAMES.MISSION && styles.tabIconImageActive
            ]}
            resizeMode="contain"
            accessibilityElementsHidden={true}
          />
          <Text style={[
            styles.tabLabel,
            currentScreen === SCREEN_NAMES.MISSION && styles.tabLabelActive
          ]}>미션</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, currentScreen === SCREEN_NAMES.COMMUNITY && styles.activeTab]}
          onPress={() => setCurrentScreen(SCREEN_NAMES.COMMUNITY)}
          activeOpacity={0.7}
          accessibilityRole="tab"
          accessibilityLabel="커뮤니티"
          accessibilityState={{ selected: currentScreen === SCREEN_NAMES.COMMUNITY }}
        >
          <Image
            source={require('../assets/images/chat.png')}
            style={[
              styles.tabIconImage,
              currentScreen === SCREEN_NAMES.COMMUNITY && styles.tabIconImageActive
            ]}
            resizeMode="contain"
            accessibilityElementsHidden={true}
          />
          <Text style={[
            styles.tabLabel,
            currentScreen === SCREEN_NAMES.COMMUNITY && styles.tabLabelActive
          ]}>커뮤니티</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, currentScreen === SCREEN_NAMES.DIARY && styles.activeTab]}
          onPress={() => setCurrentScreen(SCREEN_NAMES.DIARY)}
          activeOpacity={0.7}
          accessibilityRole="tab"
          accessibilityLabel="감정일기"
          accessibilityState={{ selected: currentScreen === SCREEN_NAMES.DIARY }}
        >
          <Image
            source={require('../assets/images/books.png')}
            style={[
              styles.tabIconImage,
              currentScreen === SCREEN_NAMES.DIARY && styles.tabIconImageActive
            ]}
            resizeMode="contain"
            accessibilityElementsHidden={true}
          />
          <Text style={[
            styles.tabLabel,
            currentScreen === SCREEN_NAMES.DIARY && styles.tabLabelActive
          ]}>감정일기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, currentScreen === SCREEN_NAMES.SETTINGS && styles.activeTab]}
          onPress={() => setCurrentScreen(SCREEN_NAMES.SETTINGS)}
          activeOpacity={0.7}
          accessibilityRole="tab"
          accessibilityLabel="설정"
          accessibilityState={{ selected: currentScreen === SCREEN_NAMES.SETTINGS }}
        >
          <Image
            source={require('../assets/images/settings.png')}
            style={[
              styles.tabIconImage,
              currentScreen === SCREEN_NAMES.SETTINGS && styles.tabIconImageActive
            ]}
            resizeMode="contain"
            accessibilityElementsHidden={true}
          />
          <Text style={[
            styles.tabLabel,
            currentScreen === SCREEN_NAMES.SETTINGS && styles.tabLabelActive
          ]}>설정</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingImage: {
    width: 200,
    height: 200,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'android' ? spacing[12] : spacing[5], // Android 네비게이션 바 대응 (48px)
    paddingTop: spacing[2],
    paddingHorizontal: spacing[2],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[1],
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: colors.green[50],
  },
  tabIconImage: {
    width: 24,
    height: 24,
    marginBottom: 2,
    opacity: 0.6,
  },
  tabIconImageActive: {
    opacity: 1,
    tintColor: colors.green[600],
  },
  tabLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
    includeFontPadding: false,
  },
  tabLabelActive: {
    color: colors.green[600],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
    includeFontPadding: false,
  },
});

export default AppNavigator;
