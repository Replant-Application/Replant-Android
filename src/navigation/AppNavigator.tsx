import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform, BackHandler, ToastAndroid, Animated, Easing } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { SCREEN_NAMES } from '../utils/constants';
import { colors, spacing, typography } from '../utils/designTokens';
import { RootStackParamList } from '../types/navigation';
import { apiClient } from '../api/client';
import { logout } from '../services/authService';
import AlertModal from '../components/ui/AlertModal';

// 화면 컴포넌트들
import StartScreen from '../screens/StartScreen';
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
import StatisticsScreen from '../screens/StatisticsScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminUserListScreen from '../screens/AdminUserListScreen';
import AdminUserDetailScreen from '../screens/AdminUserDetailScreen';
import AdminUserEditScreen from '../screens/AdminUserEditScreen';
import MissionGroupScreen from '../screens/MissionGroupScreen';
import MissionDetailScreen from '../screens/MissionDetailScreen';
import BadgeDetailScreen from '../screens/BadgeDetailScreen';
import VerificationPostCreateScreen from '../screens/VerificationPostCreateScreen';
import NotificationScreen from '../screens/NotificationScreen';

// 간단한 상태 기반 네비게이션 (React Navigation 없이)
const AppNavigator = () => {
  const { isLoggedIn, isLoading, logout: userLogout } = useUser();
  const [currentScreen, setCurrentScreen] = useState(SCREEN_NAMES.START);
  const [navigationParams, setNavigationParams] = useState({});
  const [backPressedOnce, setBackPressedOnce] = useState(false);
  const [showTokenExpiredModal, setShowTokenExpiredModal] = useState(false);
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

  // 토큰 만료 콜백 설정
  useEffect(() => {
    apiClient.setOnTokenExpiredCallback(() => {
      setShowTokenExpiredModal(true);
    });
  }, []);

  // 토큰 만료 모달 닫기 및 로그아웃 처리
  const handleTokenExpiredClose = useCallback(async () => {
    setShowTokenExpiredModal(false);
    await logout();
    await userLogout();
    setCurrentScreen(SCREEN_NAMES.START);
  }, [userLogout]);

  // 화면 전환 애니메이션 (모든 hooks는 조건부 렌더링 이전에 위치해야 함)
  useEffect(() => {
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
  }, [currentScreen, fadeAnim, slideAnim]);

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
      } else if (currentScreen === SCREEN_NAMES.COUNSELING_SELECT || currentScreen === SCREEN_NAMES.INFO) {
        setCurrentScreen(SCREEN_NAMES.SETTINGS);
      } else if (currentScreen === SCREEN_NAMES.PHOTO_SELECT || currentScreen === SCREEN_NAMES.MISSION_DETAIL || currentScreen === SCREEN_NAMES.BADGE_DETAIL || currentScreen === SCREEN_NAMES.VERIFICATION_POST_CREATE) {
        setCurrentScreen(SCREEN_NAMES.MISSION);
      } else if (
        currentScreen === SCREEN_NAMES.COMMUNITY_POST_CREATE ||
        currentScreen === SCREEN_NAMES.COMMUNITY_POST_DETAIL ||
        currentScreen === SCREEN_NAMES.COMMUNITY_POST_EDIT ||
        currentScreen === SCREEN_NAMES.MISSION_GROUP
      ) {
        setCurrentScreen(SCREEN_NAMES.COMMUNITY);
      } else if (
        currentScreen === SCREEN_NAMES.MY_PAGE ||
        currentScreen === SCREEN_NAMES.CALENDAR
      ) {
        setCurrentScreen(SCREEN_NAMES.SETTINGS);
      } else if (currentScreen === SCREEN_NAMES.NOTIFICATION) {
        setCurrentScreen(SCREEN_NAMES.HOME);
      } else {
        setCurrentScreen(SCREEN_NAMES.HOME);
      }
      setNavigationParams({});
      return true;
    });

    return () => backHandler.remove();
  }, [currentScreen, isLoggedIn, backPressedOnce, isMainTabScreen]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require('../assets/images/Replant_Loading.png')}
          style={styles.loadingImage}
          resizeMode="contain"
        />
      </View>
    );
  }

  // 로그인하지 않은 경우 - 인증 화면들
  if (!isLoggedIn) {
    const renderAuthScreen = () => {
      switch (currentScreen) {
        case SCREEN_NAMES.START:
          return <StartScreen onNavigate={setCurrentScreen} />;
        case SCREEN_NAMES.SIGNUP:
          return <SignUpScreen onNavigate={setCurrentScreen} />;
        case SCREEN_NAMES.LOGIN:
          return <LoginScreen onNavigate={setCurrentScreen} />;
        case SCREEN_NAMES.NICKNAME:
          return <NicknameScreen onNavigate={setCurrentScreen} />;
        default:
          return <StartScreen onNavigate={setCurrentScreen} />;
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
  const navigate = (screenName: keyof RootStackParamList, params: any = {}) => {
    setCurrentScreen(screenName);
    setNavigationParams(params);
  };

  const goBack = () => {
    // 화면별 뒤로가기 목적지 정의
    if (currentScreen === SCREEN_NAMES.PLACES_SEARCH) {
      setCurrentScreen(SCREEN_NAMES.COUNSELING_SELECT);
    } else if (currentScreen === SCREEN_NAMES.COUNSELING_SELECT || currentScreen === SCREEN_NAMES.INFO) {
      setCurrentScreen(SCREEN_NAMES.SETTINGS);
    } else if (currentScreen === SCREEN_NAMES.PHOTO_SELECT || currentScreen === SCREEN_NAMES.MISSION_DETAIL || currentScreen === SCREEN_NAMES.BADGE_DETAIL || currentScreen === SCREEN_NAMES.VERIFICATION_POST_CREATE) {
      setCurrentScreen(SCREEN_NAMES.MISSION);
    } else if (
      currentScreen === SCREEN_NAMES.COMMUNITY_POST_CREATE ||
      currentScreen === SCREEN_NAMES.COMMUNITY_POST_DETAIL ||
      currentScreen === SCREEN_NAMES.COMMUNITY_POST_EDIT ||
      currentScreen === SCREEN_NAMES.MISSION_GROUP
    ) {
      setCurrentScreen(SCREEN_NAMES.COMMUNITY);
    } else if (
      currentScreen === SCREEN_NAMES.MY_PAGE ||
      currentScreen === SCREEN_NAMES.CALENDAR
    ) {
      setCurrentScreen(SCREEN_NAMES.SETTINGS);
    } else if (currentScreen === SCREEN_NAMES.NOTIFICATION) {
      setCurrentScreen(SCREEN_NAMES.HOME);
    } else {
      setCurrentScreen(SCREEN_NAMES.HOME);
    }
    setNavigationParams({});
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
    const route = {
      params: navigationParams || {},
      key: currentScreen,
      name: currentScreen
    } as any;

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
        return <CalendarScreen />;
      case SCREEN_NAMES.STATISTICS:
        return <StatisticsScreen navigation={navigation} />;
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

      {/* 토큰 만료 모달 */}
      <AlertModal
        visible={showTokenExpiredModal}
        title="세션이 만료되었습니다"
        message="로그인 세션이 만료되었습니다. 다시 로그인해주세요."
        buttonText="확인"
        onClose={handleTokenExpiredClose}
      />

      {/* 하단 탭 네비게이션 */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, currentScreen === SCREEN_NAMES.HOME && styles.activeTab]}
          onPress={() => setCurrentScreen(SCREEN_NAMES.HOME)}
          activeOpacity={0.7}
        >
          <Image
            source={require('../assets/images/home.png')}
            style={[
              styles.tabIconImage,
              currentScreen === SCREEN_NAMES.HOME && styles.tabIconImageActive
            ]}
            resizeMode="contain"
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
        >
          <Image
            source={require('../assets/images/goal.png')}
            style={[
              styles.tabIconImage,
              currentScreen === SCREEN_NAMES.MISSION && styles.tabIconImageActive
            ]}
            resizeMode="contain"
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
        >
          <Image
            source={require('../assets/images/chat.png')}
            style={[
              styles.tabIconImage,
              currentScreen === SCREEN_NAMES.COMMUNITY && styles.tabIconImageActive
            ]}
            resizeMode="contain"
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
        >
          <Image
            source={require('../assets/images/books.png')}
            style={[
              styles.tabIconImage,
              currentScreen === SCREEN_NAMES.DIARY && styles.tabIconImageActive
            ]}
            resizeMode="contain"
          />
          <Text style={[
            styles.tabLabel,
            currentScreen === SCREEN_NAMES.DIARY && styles.tabLabelActive
          ]}>다이어리</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, currentScreen === SCREEN_NAMES.SETTINGS && styles.activeTab]}
          onPress={() => setCurrentScreen(SCREEN_NAMES.SETTINGS)}
          activeOpacity={0.7}
        >
          <Image
            source={require('../assets/images/settings.png')}
            style={[
              styles.tabIconImage,
              currentScreen === SCREEN_NAMES.SETTINGS && styles.tabIconImageActive
            ]}
            resizeMode="contain"
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
    backgroundColor: colors.background.primary,
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
    paddingTop: spacing[3],
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
    paddingVertical: spacing[2],
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: colors.green[50],
  },
  tabIconImage: {
    width: 24,
    height: 24,
    marginBottom: spacing[1],
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
  },
  tabLabelActive: {
    color: colors.green[600],
    fontWeight: typography.fontWeight.bold,
  },
});

export default AppNavigator;
