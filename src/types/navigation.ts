/**
 * 네비게이션 관련 타입 정의
 */

import { Character, ScreenNames } from './index';

// React Navigation용 RootStackParamList
export type RootStackParamList = {
  Start: undefined;
  Nickname: undefined;
  Home: undefined;
  Diary: undefined;
  Mission: {
    selectedPhotoUri?: string;
    missionId?: string;
    timestamp?: number;
    analysisResult?: { verified: boolean } | null;
  };
  CustomMissionCreate: {
    generatedMission?: any;
  };
  CounselingSelect: undefined;
  PlacesSearch: undefined;
  CharacterDetail: {
    character: Character;
  };
  Settings: undefined;
  Info: {
    title: string;
    content: string;
  };
  PhotoSelect: {
    onPhotoSelected?: (photoUri: string) => void;
    missionId?: string;
    missionTitle?: string;
  };
  Community: undefined;
  CommunityPostCreate: {
    missionId: string;
    missionTitle: string;
    missionEmoji: string;
    photoUrl?: string;
  };
  CommunityPostDetail: {
    postId: string;
  };
  CommunityPostEdit: {
    postId: string;
  };
  MyPage: undefined;
  Calendar: undefined;
  Statistics: undefined;
  AdminDashboard: undefined;
  AdminUserList: undefined;
  AdminUserDetail: {
    userId: number;
  };
  AdminUserEdit: {
    userId: number;
  };
  MissionGroup: undefined;
  Notification: undefined;
  MissionDetail: {
    missionId: string;
  };
  BadgeDetail: {
    badge: {
      id: number;
      missionType: 'SYSTEM' | 'CUSTOM';
      mission?: { id: number; title: string };
      customMission?: { id: number; title: string };
      issuedAt: string;
      expiresAt: string;
      remainingDays?: number;
      isExpired?: boolean;
    };
  };
  VerificationPostCreate: {
    userMissionId: number;
    missionId: string;
    missionTitle: string;
    missionEmoji?: string;
    photoUrl?: string;
    mode?: 'create' | 'edit';
    verificationId?: number;
    initialContent?: string;
  };
  VerificationPostDetail: {
    verificationId: number;
  };
  Login: undefined;
  SignUp: undefined;
};

// 네비게이션 파라미터 타입
export interface NavigationParams {
  [ScreenNames.START]: undefined;
  [ScreenNames.NICKNAME]: undefined;
  [ScreenNames.HOME]: undefined;
  [ScreenNames.DIARY]: undefined;
  [ScreenNames.MISSION]: undefined;
  [ScreenNames.CUSTOM_MISSION_CREATE]: {
    generatedMission?: any;
  };
  [ScreenNames.COUNSELING_SELECT]: undefined;
  [ScreenNames.PLACES_SEARCH]: undefined;
  [ScreenNames.CHARACTER_DETAIL]: {
    character: Character;
  };
  [ScreenNames.SETTINGS]: undefined;
  [ScreenNames.INFO]: {
    title: string;
    content: string;
  };
  [ScreenNames.PHOTO_SELECT]: {
    onPhotoSelected?: (photoUri: string) => void;
    missionId?: string;
    missionTitle?: string;
  };
  [ScreenNames.COMMUNITY]: undefined;
  [ScreenNames.COMMUNITY_POST_CREATE]: {
    missionId: string;
    missionTitle: string;
    missionEmoji: string;
    photoUrl?: string;
  };
  [ScreenNames.COMMUNITY_POST_DETAIL]: {
    postId: string;
  };
  [ScreenNames.COMMUNITY_POST_EDIT]: {
    postId: string;
  };
  [ScreenNames.MY_PAGE]: undefined;
  [ScreenNames.CALENDAR]: undefined;
  [ScreenNames.STATISTICS]: undefined;
  [ScreenNames.ADMIN_DASHBOARD]: undefined;
  [ScreenNames.ADMIN_USER_LIST]: undefined;
  [ScreenNames.ADMIN_USER_DETAIL]: {
    userId: number;
  };
  [ScreenNames.ADMIN_USER_EDIT]: {
    userId: number;
  };
  [ScreenNames.MISSION_GROUP]: undefined;
  [ScreenNames.NOTIFICATION]: undefined;
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
