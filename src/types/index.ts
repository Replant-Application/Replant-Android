/**
 * 공통 타입 정의
 * 프로젝트 전체에서 사용되는 기본 타입들
 */

export interface ServiceResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// 로딩 상태 타입
export interface LoadingState {
  loading: boolean;
  error: string | null;
}

// 난이도 타입
export type Difficulty = 'easy' | 'medium' | 'hard';

// 버튼 변형 타입
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

// 버튼 크기 타입
export type ButtonSize = 'sm' | 'base' | 'lg';

// 카테고리 타입
export type MissionCategory = 'growth';

// 감정 타입
export type Emotion = 'happy' | 'excited' | 'calm' | 'grateful' | 'sad' | 'angry' | 'anxious' | 'tired';

// 미션 상태 타입
export type MissionStatus = 'ASSIGNED' | 'PENDING' | 'COMPLETED' | 'EXPIRED';

/**
 * 미션 출처 타입 - 백엔드 MissionSource enum과 일치
 * @see Replant-BE/domain/mission/enums/MissionSource.java
 */
export type MissionSource = 'OFFICIAL' | 'CUSTOM';

/**
 * 댓글 대상 타입 - 백엔드 CommentTargetType enum과 일치
 * @see Replant-BE/domain/post/enums/CommentTargetType.java
 */
export type CommentTargetType = 'POST' | 'VERIFICATION' | 'QNA' | 'DIARY';

// Mission 관련 타입
export interface Mission {
  id: number;
  mission_id: string;
  user_mission_id?: number; // 백엔드 UserMission ID
  title: string;
  description: string;
  emoji: string;
  difficulty: Difficulty;
  experience: number;
  category_id: MissionCategory;
  type?: 'DAILY' | 'WEEKLY' | 'MONTHLY'; // 미션 타입
  status?: MissionStatus; // 백엔드 UserMission 상태 (ASSIGNED, PENDING, COMPLETED, EXPIRED)
  mission_source?: MissionSource; // 미션 출처 (OFFICIAL / CUSTOM)
  is_custom?: boolean; // @deprecated - mission_source 사용 권장
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  due_date?: string; // 마감일
  completed: boolean;
  completed_at?: string | undefined;
  photo_url?: string | undefined;
  // 인증 타입 (COMMUNITY, GPS, TIME)
  verification_type?: 'COMMUNITY' | 'GPS' | 'TIME';
  // 인증 관련 필드
  verification_method?: 'like' | 'gps' | 'manual';
  verified?: boolean;
  verified_at?: string;
  related_post_id?: string; // 좋아요 인증인 경우 게시글 ID
  verification_requirements?: VerificationRequirements;
}

// 템플릿 전용 타입 (사용자 인스턴스 필드 제외)
export interface MissionTemplate {
  mission_id: string;
  title: string;
  description: string;
  emoji: string;
  difficulty: Difficulty;
  experience: number;
}

export interface MissionData {
  title: string;
  description?: string;
  emoji?: string;
  difficulty?: Difficulty;
  experience?: number;
  category_id?: MissionCategory;
  is_custom?: boolean;
  created_by?: string;
  // 백엔드 API 필드
  durationDays?: number;
  isPublic?: boolean;
  verificationType?: 'COMMUNITY' | 'GPS' | 'TIME';
  badgeDurationDays?: number;
}

export interface MissionCompletionResult {
  success: boolean;
  experienceGained: number;
  experience?: number;
  levelUp: boolean;
  newLevel?: number;
  unlocked?: boolean;
  error?: string;
  pendingVerification?: boolean; // COMMUNITY 인증 타입 - 좋아요 인증 대기 중
}

// Character 관련 타입
export interface Character {
  id: string;
  character_id: string;
  name: string;
  title: string;
  description: string;
  emoji: string;
  level: number;
  experience: number;
  total_experience: number;
  max_experience: number;
  unlocked: boolean;
  unlocked_date?: string;
  category_id: string;
  completed_missions: number;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface CharacterData {
  name: string;
  level: number;
  experience: number;
  category_id: MissionCategory;
  description?: string;
  emoji?: string;
}

export interface ExperienceResult {
  success: boolean;
  experienceGained: number;
  levelUp: boolean;
  newLevel?: number;
  error?: string | undefined;
}

export interface LevelUpResult {
  success: boolean;
  oldLevel: number;
  newLevel: number;
  experienceGained: number;
  experience?: number;
  levelUp?: boolean;
  character?: Character;
  error?: string;
}

// User 관련 타입 (UserContext와 일치)
export interface User {
  id: string;
  nickname: string;
  createdAt?: string; // 가입일
  role?: string; // 사용자 역할 (user, admin 등)
}

// Diary 관련 타입
export interface Diary {
  id: string;
  date: string;
  emotion: Emotion;
  content: string;
  created_at?: string;
  updated_at?: string;
  diary_id?: string;
}

export interface DiaryData {
  date: string;
  emotion: Emotion;
  content: string;
  title?: string;
  intensity?: number;
  mood_score?: number;
  tags?: string[];
  weather?: string;
  location?: string;
  photos?: string[];
  is_private?: boolean;
}

// 간단한 일기 데이터 타입 (중복 제거용)
export interface SimpleDiaryData {
  date: string;
  emotion: string;
  content: string;
}

// 커뮤니티 관련 타입
export interface CommunityPost {
  id: string;
  post_id: string;
  mission_id: string; // 완료한 미션 ID
  mission_title: string; // 미션 제목
  mission_emoji: string; // 미션 이모지
  title: string; // 게시글 제목 (미션 제목을 기본값으로 사용 가능)
  content: string; // 사용자가 작성한 내용
  author: string;
  author_id: string; // 작성자 ID
  author_nickname: string;
  created_at: string;
  updated_at?: string;
  like_count: number;
  comment_count: number;
  scrap_count: number;
  images?: string[]; // 미션 인증 사진
  tags?: string[];
  category?: string;
  is_liked?: boolean; // 현재 사용자가 좋아요 했는지
  is_scrapped?: boolean; // 현재 사용자가 스크랩 했는지
  verified?: boolean; // 인증 완료 여부 (false일 때만 수정/삭제 가능)
}

export interface CommunityComment {
  id: string;
  comment_id: string;
  post_id: string;
  content: string;
  author: string;
  author_nickname: string;
  created_at: string;
  updated_at?: string;
  parent_comment_id?: string; // 대댓글용
}

export interface CommunityPostData {
  mission_id: string; // 완료한 미션 ID
  mission_title: string; // 미션 제목
  mission_emoji: string; // 미션 이모지
  title?: string; // 게시글 제목 (선택사항, 없으면 미션 제목 사용)
  content: string; // 사용자가 작성한 내용
  images?: string[]; // 미션 인증 사진
  tags?: string[];
  category?: string;
}

// Hooks 반환 타입
export interface UseMissionReturn {
  missions: Mission[];
  loading: boolean;
  error: string | null;
  loadMissions: () => Promise<void>;
  saveMissionPhoto: (missionId: string, photoUrl: string) => Promise<ServiceResult<void>>;
  deleteMissionPhoto: (missionId: string) => Promise<ServiceResult<void>>;
  completeMissionWithPhoto: (missionId: string, photoUrl: string | null) => Promise<MissionCompletionResult>;
  uncompleteMission: (missionId: string) => Promise<ServiceResult>;
  createCustomMission: (missionData: MissionData) => Promise<ServiceResult>;
  updateCustomMission: (missionId: string, missionData: MissionData) => Promise<ServiceResult>;
  deleteCustomMission: (missionId: string) => Promise<ServiceResult>;
}

export interface UseCharacterReturn {
  characters: Character[];
  selectedCharacter: Character | null;
  loading: boolean;
  error: string | null;
  loadCharacters: () => Promise<void>;
  addExperienceByCategory: (categoryId: MissionCategory, experience: number) => Promise<ExperienceResult>;
  selectCharacter: (character: Character) => void;
  updateCharacterName: (characterId: string, newName: string) => Promise<ServiceResult<Character>>;
}

export interface UseDiaryReturn {
  diaries: Diary[];
  loading: boolean;
  error: string | null;
  loadDiaries: () => Promise<void>;
  saveDiary: (diaryData: SimpleDiaryData) => Promise<ServiceResult<Diary>>;
  updateDiary: (diaryId: string, diaryData: SimpleDiaryData) => Promise<ServiceResult<Diary>>;
  deleteDiary: (diaryId: string) => Promise<ServiceResult<void>>;
}

// 커뮤니티 Hook 반환 타입
export interface UseCommunityReturn {
  posts: CommunityPost[];
  loading: boolean;
  error: string | null;
  loadPosts: () => Promise<void>;
  createPost: (postData: CommunityPostData) => Promise<ServiceResult<CommunityPost>>;
  updatePost: (postId: string, postData: Partial<CommunityPostData>) => Promise<ServiceResult<CommunityPost>>;
  deletePost: (postId: string) => Promise<ServiceResult<void>>;
  toggleLike: (postId: string) => Promise<ServiceResult<void>>;
  searchPosts: (query: string) => CommunityPost[];
  filterPosts: (category?: string, sortBy?: 'latest' | 'popular') => CommunityPost[];
}

export interface UseCommunityPostReturn {
  post: CommunityPost | null;
  comments: CommunityComment[];
  loading: boolean;
  error: string | null;
  loadPost: () => Promise<void>;
  loadComments: () => Promise<void>;
  toggleLike: () => Promise<ServiceResult<void>>;
  createComment: (content: string, parentCommentId?: string) => Promise<ServiceResult<CommunityComment>>;
  updateComment: (commentId: string, content: string) => Promise<ServiceResult<CommunityComment>>;
  deleteComment: (commentId: string) => Promise<ServiceResult<void>>;
}

// 사용자 프로필 관련 타입
export interface UserProfile {
  nickname: string;
  createdAt: string;
  character: Character | null;
  stats: {
    completedMissions: number;
    totalExperience: number;
    diaryCount: number;
    postCount: number;
    badgeCount?: number;
  };
}

export interface UserInfoUpdateData {
  nickname?: string;
  profileImage?: string;
}

// 캘린더 관련 타입
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO date string (YYYY-MM-DD)
  time?: string; // Optional time (HH:mm)
  created_at: string;
  updated_at?: string;
}

export interface CalendarEventData {
  title: string;
  description?: string;
  date: string;
  time?: string;
}

// 사용자 프로필 Hook 반환 타입
export interface UseUserProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  loadProfile: () => Promise<void>;
  updateUserInfo: (data: UserInfoUpdateData) => Promise<ServiceResult<void>>;
}

// 캘린더 Hook 반환 타입
export interface UseCalendarReturn {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  loadEvents: () => Promise<void>;
  addEvent: (eventData: CalendarEventData) => Promise<ServiceResult<CalendarEvent>>;
  updateEvent: (eventId: string, eventData: Partial<CalendarEventData>) => Promise<ServiceResult<CalendarEvent>>;
  deleteEvent: (eventId: string) => Promise<ServiceResult<void>>;
  getEventsByDate: (date: string) => CalendarEvent[];
}

// 인증 관련 타입
export type VerificationMethod = 'like' | 'gps' | 'manual';

export interface MissionVerificationStatus {
  verified: boolean;
  verification_method?: VerificationMethod;
  like_count?: number;
  required_likes?: number;
  related_post_id?: string;
  verified_at?: string;
}

export interface GPSVerificationData {
  location: { lat: number; lng: number };
  timestamp: string;
}

export interface VerificationRequirements {
  required_location?: { lat: number; lng: number; radius: number };
  required_time?: { start: string; end: string };
}

// 미션 그룹 관련 타입
export interface MissionGroup {
  mission_id: string;
  mission_title: string;
  mission_emoji: string;
  completed_at: string;
  post_count: number; // 해당 미션 완료자 게시글 수
  member_count: number; // 해당 미션 완료자 수
}

// Screen Names 타입
export enum ScreenNames {
  START = 'Start',
  NICKNAME = 'Nickname',
  HOME = 'Home',
  MISSION = 'Mission',
  DIARY = 'Diary',
  CHARACTER_DETAIL = 'CharacterDetail',
  SETTINGS = 'Settings',
  CUSTOM_MISSION_CREATE = 'CustomMissionCreate',
  COUNSELING_SELECT = 'CounselingSelect',
  PLACES_SEARCH = 'PlacesSearch',
  INFO = 'Info',
  PHOTO_SELECT = 'PhotoSelect',
  COMMUNITY = 'Community',
  COMMUNITY_POST_CREATE = 'CommunityPostCreate',
  COMMUNITY_POST_EDIT = 'CommunityPostEdit',
  COMMUNITY_POST_DETAIL = 'CommunityPostDetail',
  MY_PAGE = 'MyPage',
  CALENDAR = 'Calendar',
  STATISTICS = 'Statistics',
  MISSION_GROUP = 'MissionGroup',
  ADMIN_DASHBOARD = 'AdminDashboard',
  ADMIN_USER_LIST = 'AdminUserList',
  ADMIN_USER_DETAIL = 'AdminUserDetail',
  ADMIN_USER_EDIT = 'AdminUserEdit',
}
