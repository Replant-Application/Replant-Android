/**
 * 네비게이션 관련 타입 정의
 */

import { ScreenNames } from './index';

// React Navigation용 RootStackParamList
export type RootStackParamList = {
  Start: undefined;
  Nickname: undefined;
  Home: undefined;
  Diary: undefined;
  Mission: {
    activeTab?: 'myMission' | 'missionGroup'; // 미션 도감에서 돌아올 때 탭 복원용
    missionGroupTab?: 'official' | 'custom'; // 미션 도감 내부 탭 복원용 (공식/커스텀)
    selectedFilter?: 'inProgress' | 'pendingVerification' | 'completed'; // 나의 미션 탭에서 돌아올 때 필터 복원용
  };
  CustomMissionCreate: {
    generatedMission?: any;
    mode?: 'create' | 'edit';  // 생성 또는 수정 모드
    missionId?: number;        // 수정 모드일 때 미션 ID
    missionData?: {            // 수정 모드일 때 기존 미션 데이터
      title: string;
      description: string;
      category?: string;
      verificationType?: string;
      isChallenge?: boolean;
      challengeDays?: number;
      deadlineDays?: number;
      expReward?: number;
      isPublic?: boolean;
      worryType?: string;
    };
  };
  CounselingSelect: undefined;
  PlacesSearch: undefined;
  Settings: undefined;
  Info: {
    title: string;
    content: string;
  };
  Community: undefined;
  CommunityPostCreate: {
    type?: 'GENERAL' | 'VERIFICATION'; // 게시글 타입
    userMissionId?: number; // 인증글 작성 시 필요한 UserMission ID
    missionId?: string;
    missionTitle?: string;
    missionEmoji?: string;
    photoUrl?: string;
  };
  CommunityPostDetail: {
    postId: string;
    returnScreen?: 'Community' | 'TodoList' | 'MissionSetList'; // 뒤로가기 시 복원할 화면
    activeTab?: 'all' | 'todo-share'; // Community로 돌아갈 때 활성화할 탭
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
    returnTab?: 'myMission' | 'missionGroup'; // 뒤로가기 시 복원할 탭
    missionGroupTab?: 'official' | 'custom'; // 미션 도감 탭에서 왔을 경우, 공식/커스텀 탭 복원
    selectedFilter?: 'inProgress' | 'pendingVerification' | 'completed'; // 나의 미션 탭에서 왔을 경우, 필터 복원
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
  FindId: undefined;
  FindIdResult: {
    email: string; // 마스킹된 이메일
  };
  FindPassword: undefined;
  ChangePassword: undefined;
  SoundSettings: undefined;
  MyProgressDetail: undefined;
  OAuthCompleteSignUp: {
    email?: string;
    nickname?: string;
    provider?: string;
  };
  SpontaneousMissionSetup: {
    mode?: 'create' | 'edit'; // create: 신규 설정, edit: 수정
  };
  WakeUpVerification: {
    userMissionId: number;
  };
  MissionSetDetail: {
    missionSetId: number;
    returnScreen?: 'TodoList' | 'Community' | 'MissionSetList'; // 뒤로가기 시 복원할 화면
    activeTab?: 'all' | 'todo-share'; // Community로 돌아갈 때 활성화할 탭
  };
};

// 네비게이션 파라미터 타입
export interface NavigationParams {
  [ScreenNames.NICKNAME]: undefined;
  [ScreenNames.HOME]: undefined;
  [ScreenNames.DIARY]: undefined;
  [ScreenNames.MISSION]: undefined;
  [ScreenNames.CUSTOM_MISSION_CREATE]: {
    generatedMission?: any;
  };
  [ScreenNames.COUNSELING_SELECT]: undefined;
  [ScreenNames.PLACES_SEARCH]: undefined;
  [ScreenNames.SETTINGS]: undefined;
  [ScreenNames.INFO]: {
    title: string;
    content: string;
  };
  [ScreenNames.COMMUNITY]: {
    activeTab?: 'all' | 'todo-share'; // 초기 활성 탭
  };
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
  [ScreenNames.FIND_ID]: undefined;
  [ScreenNames.FIND_ID_RESULT]: {
    email: string; // 마스킹된 이메일
  };
  [ScreenNames.FIND_PASSWORD]: undefined;
  [ScreenNames.CHANGE_PASSWORD]: undefined;
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

// 히스토리 엔트리 타입
export interface HistoryEntry {
  screen: string;           // 화면 이름
  params: any;              // 화면 파라미터
  timestamp: number;        // 전환 시각 (디버깅용)
}
