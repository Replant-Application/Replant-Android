import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { SCREEN_NAMES } from '../utils/constants';
import { colors, spacing, typography } from '../utils/designTokens';

// 화면 컴포넌트들
import StartScreen from '../screens/StartScreen';
import NicknameScreen from '../screens/NicknameScreen';
import HomeScreen from '../screens/HomeScreen';
import DiaryScreen from '../screens/DiaryScreen';
import MissionScreen from '../screens/MissionScreen';
import CustomMissionCreateScreen from '../screens/CustomMissionCreateScreen';
import ChatBotScreen from '../screens/ChatBotScreen';
import CharacterGuideScreen from '../screens/CharacterGuideScreen';
import CharacterDetailScreen from '../screens/CharacterDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';

interface NavigationParams {
  [key: string]: any;
}

interface Navigation {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
}

// 간단한 상태 기반 네비게이션 (React Navigation 없이)
const AppNavigator: React.FC = () => {
  const { isLoggedIn, isLoading } = useUser();
  const [currentScreen, setCurrentScreen] = useState<string>(SCREEN_NAMES.START);
  const [navigationParams, setNavigationParams] = useState<NavigationParams>({});

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>로딩 중...</Text>
      </View>
    );
  }

  // 로그인하지 않은 경우 - 인증 화면들
  if (!isLoggedIn) {
    const renderAuthScreen = (): React.ReactNode => {
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

  // 네비게이션 객체 생성
  const navigation: Navigation = {
    navigate: (screen: string, params?: any) => {
      setCurrentScreen(screen);
      setNavigationParams(params || {});
    },
    goBack: () => {
      // 간단한 뒤로가기 로직 (필요에 따라 확장)
      if (currentScreen !== SCREEN_NAMES.HOME) {
        setCurrentScreen(SCREEN_NAMES.HOME);
        setNavigationParams({});
      }
    }
  };

  // 메인 화면 렌더링
  const renderScreen = (): React.ReactNode => {
    switch (currentScreen) {
      case SCREEN_NAMES.HOME:
        return <HomeScreen navigation={navigation} />;
      case SCREEN_NAMES.DIARY:
        return <DiaryScreen navigation={navigation} />;
      case SCREEN_NAMES.MISSION:
        return <MissionScreen navigation={navigation} />;
      case SCREEN_NAMES.CUSTOM_MISSION_CREATE:
        return <CustomMissionCreateScreen navigation={navigation} />;
      case SCREEN_NAMES.CHATBOT:
        return <ChatBotScreen navigation={navigation} />;
      case SCREEN_NAMES.CHARACTER_GUIDE:
        return <CharacterGuideScreen navigation={navigation} />;
      case SCREEN_NAMES.CHARACTER_DETAIL:
        return <CharacterDetailScreen navigation={navigation} route={{ params: navigationParams }} />;
      case SCREEN_NAMES.SETTINGS:
        return <SettingsScreen navigation={navigation} />;
      default:
        return <HomeScreen navigation={navigation} />;
    }
  };

  // 하단 네비게이션 탭
  const renderBottomTabs = (): React.ReactNode => {
    const tabs = [
      { id: SCREEN_NAMES.HOME, label: '홈', icon: '🏠' },
      { id: SCREEN_NAMES.MISSION, label: '미션', icon: '🎯' },
      { id: SCREEN_NAMES.DIARY, label: '다이어리', icon: '📝' },
      { id: SCREEN_NAMES.CHATBOT, label: '상담', icon: '🤖' },
      { id: SCREEN_NAMES.SETTINGS, label: '설정', icon: '⚙️' },
    ];

    return (
      <View style={styles.bottomTabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              currentScreen === tab.id && styles.activeTab
            ]}
            onPress={() => navigation.navigate(tab.id)}
          >
            <Text style={[
              styles.tabIcon,
              currentScreen === tab.id && styles.activeTabIcon
            ]}>
              {tab.icon}
            </Text>
            <Text style={[
              styles.tabLabel,
              currentScreen === tab.id && styles.activeTabLabel
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>
      {renderBottomTabs()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  screenContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  bottomTabs: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingBottom: spacing[2],
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
  },
  activeTab: {
    backgroundColor: colors.primary[100],
  },
  tabIcon: {
    fontSize: typography.fontSize.lg,
    marginBottom: spacing[1],
  },
  activeTabIcon: {
    color: colors.primary[500],
  },
  tabLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  activeTabLabel: {
    color: colors.primary[500],
    fontWeight: typography.fontWeight.bold,
  },
});

export default AppNavigator;
