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
import CharacterGuideScreen from '../screens/CharacterGuideScreen';
import CharacterDetailScreen from '../screens/CharacterDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';

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
          return <NicknameScreen onNavigate={() => setCurrentScreen(SCREEN_NAMES.HOME)} />;
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
    // 간단한 뒤로가기 로직 (홈으로)
    setCurrentScreen(SCREEN_NAMES.HOME);
    setNavigationParams({});
  };

  // 로그인한 경우 - 간단한 탭 네비게이션
  const renderScreen = () => {
    const navigation = {
      navigate: navigate as any,
      goBack
    };
    const route = {
      params: navigationParams,
      key: 'CharacterDetail',
      name: 'CharacterDetail'
    };

    switch (currentScreen) {
      case SCREEN_NAMES.HOME:
        return <HomeScreen navigation={navigation} />;
      case SCREEN_NAMES.DIARY:
        return <DiaryScreen />;
      case SCREEN_NAMES.MISSION:
        return <MissionScreen navigation={navigation} />;
      case SCREEN_NAMES.CUSTOM_MISSION_CREATE:
        return <CustomMissionCreateScreen navigation={navigation} />;
      case SCREEN_NAMES.COUNSELING_SELECT:
        return <CounselingSelectScreen navigation={navigation} />;
      case SCREEN_NAMES.CHATBOT:
        return <ChatBotScreen navigation={navigation} />;
      case SCREEN_NAMES.PLACES_SEARCH:
        return <PlacesSearchScreen navigation={navigation} />;
      case SCREEN_NAMES.CHARACTER_GUIDE:
        return <CharacterGuideScreen navigation={navigation} />;
      case SCREEN_NAMES.CHARACTER_DETAIL:
        return <CharacterDetailScreen navigation={navigation} route={route} />;
      case SCREEN_NAMES.SETTINGS:
        return <SettingsScreen />;
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
          style={[styles.tab, currentScreen === SCREEN_NAMES.DIARY && styles.activeTab]}
          onPress={() => setCurrentScreen(SCREEN_NAMES.DIARY)}
        >
          <Text style={styles.tabIcon}>📝</Text>
          <Text style={styles.tabLabel}>다이어리</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, currentScreen === SCREEN_NAMES.COUNSELING_SELECT && styles.activeTab]}
          onPress={() => setCurrentScreen(SCREEN_NAMES.COUNSELING_SELECT)}
        >
          <Text style={styles.tabIcon}>🤖</Text>
          <Text style={styles.tabLabel}>상담</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, currentScreen === SCREEN_NAMES.CHARACTER_GUIDE && styles.activeTab]}
          onPress={() => setCurrentScreen(SCREEN_NAMES.CHARACTER_GUIDE)}
        >
          <Text style={styles.tabIcon}>📚</Text>
          <Text style={styles.tabLabel}>도감</Text>
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
