/**
 * 앱 상수 정의
 */

// 네비게이션 상수
export const SCREEN_NAMES: Record<string, string> = {
  START: 'Start',
  NICKNAME: 'Nickname',
  HOME: 'Home',
  DIARY: 'Diary',
  MISSION: 'Mission',
  CUSTOM_MISSION_CREATE: 'CustomMissionCreate',
  COUNSELING_SELECT: 'CounselingSelect',
  CHATBOT: 'ChatBot',
  PLACES_SEARCH: 'PlacesSearch',
  CHARACTER_DETAIL: 'CharacterDetail',
  SETTINGS: 'Settings',
  INFO: 'Info',
  PHOTO_SELECT: 'PhotoSelect',
  COMMUNITY: 'Community',
  COMMUNITY_POST_CREATE: 'CommunityPostCreate',
  COMMUNITY_POST_EDIT: 'CommunityPostEdit',
  COMMUNITY_POST_DETAIL: 'CommunityPostDetail',
} as const;
