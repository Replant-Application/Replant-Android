import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { SCREEN_NAMES } from '../utils/constants';
import { colors, spacing, typography } from '../utils/designTokens';
import { RootStackParamList } from '../types/navigation';

// 화면 컴포넌트들
import StartScreen from '../screens/StartScreen';
import NicknameScreen from '../screens/NicknameScreen';
import HomeScreen from '../screens/HomeScreen';
import DiaryScreen from '../screens/DiaryScreen';
import MissionScreen from '../screens/MissionScreen';
import CustomMissionCreateScreen from '../screens/CustomMissionCreateScreen';
import CounselingSelectScreen from '../screens/CounselingSelectScreen';
import ChatBotScreen from '../screens/ChatBotScreen';
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
import AIMissionGenerateScreen from '../screens/AIMissionGenerateScreen';

// 간단한 상태 기반 네비게이션 (React Navigation 없이)
const AppNavigator = () => {
  const { isLoggedIn, isLoading } = useUser();
  const [currentScreen, setCurrentScreen] = useState(SCREEN_NAMES.START);
  const [navigationParams, setNavigationParams] = useState({});

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>로딩 중...</Text>
      </View>
    );
  }

  // 로그인하지 않은 경우 - 인증 화면들
  if (!isLoggedIn) {
    const renderAuthScreen = () => {
      switch (currentScreen) {
        case SCREEN_NAMES.START:
          return <StartScreen onNavigate={setCurrentScreen} />;
        case SCREEN_NAMES.NICKNAME:
          return <NicknameScreen onNavigate={setCurrentScreen} />;
        default:
          return <StartScreen onNavigate={setCurrentScreen} />;
      }
    };

    return (
      <View style={styles.container}>
        <View style={styles.screenContainer}>
          {renderAuthScreen()}
        </View>
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
    if (currentScreen === SCREEN_NAMES.CHATBOT || currentScreen === SCREEN_NAMES.PLACES_SEARCH) {
      setCurrentScreen(SCREEN_NAMES.COUNSELING_SELECT);
    } else if (currentScreen === SCREEN_NAMES.COUNSELING_SELECT || currentScreen === SCREEN_NAMES.INFO) {
      setCurrentScreen(SCREEN_NAMES.SETTINGS);
    } else if (currentScreen === SCREEN_NAMES.PHOTO_SELECT) {
      setCurrentScreen(SCREEN_NAMES.MISSION);
    } else if (currentScreen === SCREEN_NAMES.AI_MISSION_GENERATE) {
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
      case SCREEN_NAMES.CHATBOT:
        return <ChatBotScreen navigation={navigation} />;
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
      case SCREEN_NAMES.AI_MISSION_GENERATE:
        return <AIMissionGenerateScreen navigation={navigation} />;
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
        >
          <Text style={styles.tabIcon}>🏠</Text>
          <Text style={styles.tabLabel}>홈</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, currentScreen === SCREEN_NAMES.MISSION && styles.activeTab]}
          onPress={() => setCurrentScreen(SCREEN_NAMES.MISSION)}
        >
          <Text style={styles.tabIcon}>🎯</Text>
          <Text style={styles.tabLabel}>미션</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, currentScreen === SCREEN_NAMES.COMMUNITY && styles.activeTab]}
          onPress={() => setCurrentScreen(SCREEN_NAMES.COMMUNITY)}
        >
          <Text style={styles.tabIcon}>💬</Text>
          <Text style={styles.tabLabel}>커뮤니티</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, currentScreen === SCREEN_NAMES.COUNSELING_SELECT && styles.activeTab]}
          onPress={() => setCurrentScreen(SCREEN_NAMES.COUNSELING_SELECT)}
        >
          <Text style={styles.tabIcon}>🤖</Text>
          <Text style={styles.tabLabel}>상담</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, currentScreen === SCREEN_NAMES.DIARY && styles.activeTab]}
          onPress={() => setCurrentScreen(SCREEN_NAMES.DIARY)}
        >
          <Text style={styles.tabIcon}>📝</Text>
          <Text style={styles.tabLabel}>다이어리</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, currentScreen === SCREEN_NAMES.SETTINGS && styles.activeTab]}
          onPress={() => setCurrentScreen(SCREEN_NAMES.SETTINGS)}
        >
          <Text style={styles.tabIcon}>⚙️</Text>
          <Text style={styles.tabLabel}>설정</Text>
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
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingBottom: spacing[5],
    paddingTop: spacing[2],
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  activeTab: {
    backgroundColor: colors.background.secondary,
  },
  tabIcon: {
    fontSize: typography.fontSize.xl,
    marginBottom: spacing[1],
  },
  tabLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
});

export default AppNavigator;
