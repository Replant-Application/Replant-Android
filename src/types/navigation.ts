/**
 * 네비게이션 관련 타입 정의
 */

import { Character } from './character';

// 화면 이름 enum
export enum ScreenNames {
  START = 'Start',
  NICKNAME = 'Nickname',
  HOME = 'Home',
  DIARY = 'Diary',
  MISSION = 'Mission',
  CUSTOM_MISSION_CREATE = 'CustomMissionCreate',
  CHATBOT = 'ChatBot',
  CHARACTER_GUIDE = 'CharacterGuide',
  CHARACTER_DETAIL = 'CharacterDetail',
  SETTINGS = 'Settings',
}

// React Navigation용 RootStackParamList
export type RootStackParamList = {
  Start: undefined;
  Nickname: undefined;
  Home: undefined;
  Diary: undefined;
  Mission: undefined;
  CustomMissionCreate: undefined;
  ChatBot: undefined;
  CharacterGuide: undefined;
  CharacterDetail: {
    character: Character;
  };
  Settings: undefined;
};

// 네비게이션 파라미터 타입
export interface NavigationParams {
  [ScreenNames.START]: undefined;
  [ScreenNames.NICKNAME]: undefined;
  [ScreenNames.HOME]: undefined;
  [ScreenNames.DIARY]: undefined;
  [ScreenNames.MISSION]: undefined;
  [ScreenNames.CUSTOM_MISSION_CREATE]: undefined;
  [ScreenNames.CHATBOT]: undefined;
  [ScreenNames.CHARACTER_GUIDE]: undefined;
  [ScreenNames.CHARACTER_DETAIL]: {
    characterId: string;
  };
  [ScreenNames.SETTINGS]: undefined;
}

// 네비게이션 Props 타입
export interface NavigationProps<T extends keyof NavigationParams = keyof NavigationParams> {
  navigation: {
    navigate: (screen: T, params?: NavigationParams[T]) => void;
    goBack: () => void;
    reset: (state: any) => void;
    canGoBack: () => boolean;
  };
  route?: {
    params: NavigationParams[T];
    key: string;
    name: T;
  };
}

// 탭 네비게이션 타입
export interface TabNavigationItem {
  name: string;
  label: string;
  icon: string;
  screen: keyof NavigationParams;
}

// 네비게이션 상태 타입
export interface NavigationState {
  currentScreen: keyof NavigationParams;
  previousScreen?: keyof NavigationParams;
  navigationHistory: (keyof NavigationParams)[];
}

// 네비게이션 액션 타입
export type NavigationAction = 
  | { type: 'NAVIGATE'; payload: { screen: keyof NavigationParams; params?: any } }
  | { type: 'GO_BACK' }
  | { type: 'RESET'; payload: { screen: keyof NavigationParams } };

// 네비게이션 컨텍스트 타입
export interface NavigationContextType {
  state: NavigationState;
  navigate: (screen: keyof NavigationParams, params?: any) => void;
  goBack: () => void;
  reset: (screen: keyof NavigationParams) => void;
}
