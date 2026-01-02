import { getData, setData, getStorageKeys } from './storage';
import { logError } from '../utils/logger';
import { ServiceResult, Character, UserProfile, UserInfoUpdateData, CalendarEvent, CalendarEventData, User, Mission, Diary, CommunityPost } from '../types';
import { generateUserCharacterName } from '../utils/characterNameGenerator';

// 카테고리별 캐릭터 설명
const getCategoryDescription = (categoryId: string): string => {
  switch (categoryId) {
    case 'self_management':
      return '매일 조금씩 성장하며 나만의 길을 찾아가요';
    case 'communication':
      return '따뜻한 대화로 세상을 더 아름답게 만들어가요';
    case 'career':
      return '꿈을 현실로 만드는 과정을 즐기고 있어요';
    case 'custom':
      return '나만의 특별한 여정을 함께 걸어가요';
    default:
      return '꾸준한 성장을 통해 더욱 빛나고 있어요';
  }
};

// 사용자 데이터 초기화
export const initializeUserData = async (
  userId: string,
  nickname: string
): Promise<ServiceResult<{ message: string }>> => {
  try {
    // 미션 템플릿에서 초기 미션 생성
    const storageKeys = getStorageKeys(nickname);

    // 미션은 백엔드 API에서 불러옴 (더미 데이터 로딩 제거됨)
    // useMission hook에서 API를 통해 미션을 로드함

    // 캐릭터 템플릿 저장 (템플릿은 항상 업데이트)
    const characterTemplatesData = require('../data/characterTemplates.json');
    await setData(storageKeys.CHARACTER_TEMPLATES, characterTemplatesData);

    // 기존 캐릭터 데이터 확인
    const existingCharacters = await getData(storageKeys.CHARACTERS);

    // 기존 캐릭터가 없거나 빈 배열인 경우에만 초기 캐릭터 생성
    if (!existingCharacters || (Array.isArray(existingCharacters) && existingCharacters.length === 0)) {
      const characterTemplates: any[] = characterTemplatesData;
      if (characterTemplates.length > 0) {
        const now = Date.now();
        const initialCharacter: Character = {
          id: `character_${now}_growth`,
          character_id: `character_${now}_growth`,
          user_id: userId,
          name: generateUserCharacterName(userId, 'growth'),
          title: characterTemplates[0].title,
          description: getCategoryDescription('growth'),
          emoji: characterTemplates[0].emoji || '🌱',
          level: 1,
          experience: 0,
          max_experience: 100,
          total_experience: 0,
          unlocked: true,
          unlocked_date: new Date().toISOString(),
          category_id: 'growth',
          completed_missions: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        await setData(storageKeys.CHARACTERS, [initialCharacter]);
      }
    }

    // 다이어리는 기존 데이터가 있으면 유지, 없으면 빈 배열로 시작
    const existingDiaries = await getData(storageKeys.DIARIES);
    if (!existingDiaries || (Array.isArray(existingDiaries) && existingDiaries.length === 0)) {
      await setData(storageKeys.DIARIES, []);
    }

    return {
      success: true,
      data: {
        message: '사용자 데이터가 초기화되었습니다.'
      }
    };
  } catch (error) {
    logError('사용자 데이터 초기화 실패', error as Error, { userId, nickname });
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

/**
 * 사용자 프로필 조회 (통계 포함)
 */
export const getUserProfile = async (nickname: string): Promise<ServiceResult<UserProfile>> => {
  try {
    const storageKeys = getStorageKeys(nickname);

    // User 정보 로드
    const userData: User | null = await getData(storageKeys.USER);
    if (!userData) {
      return { success: false, error: '사용자 정보를 찾을 수 없습니다.' };
    }

    // 캐릭터 정보 로드
    const characters: Character[] = await getData(storageKeys.CHARACTERS) || [];
    const character = characters.length > 0 ? characters[0] : null;

    // 미션 통계
    const missions: Mission[] = await getData(storageKeys.MISSIONS) || [];
    const completedMissions = missions.filter(m => m.completed).length;

    // 경험치 통계 (캐릭터의 total_experience 사용)
    const totalExperience = (character && 'total_experience' in character) ? character.total_experience || 0 : 0;

    // 다이어리 통계
    const diaries: Diary[] = await getData(storageKeys.DIARIES) || [];
    const diaryCount = diaries.length;

    // 커뮤니티 게시글 통계
    const posts: CommunityPost[] = await getData(storageKeys.COMMUNITY_POSTS) || [];
    const userPosts = posts.filter(p => p.author === nickname);
    const postCount = userPosts.length;

    const profile: UserProfile = {
      nickname: userData.nickname,
      createdAt: userData.createdAt || new Date().toISOString(),
      character: character || null,
      stats: {
        completedMissions,
        totalExperience,
        diaryCount,
        postCount,
      },
    };

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    logError('사용자 프로필 조회 실패', error as Error, { nickname });
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

/**
 * 사용자 정보 수정
 */
export const updateUserInfo = async (
  nickname: string,
  data: UserInfoUpdateData
): Promise<ServiceResult<void>> => {
  try {
    const storageKeys = getStorageKeys(nickname);
    const userData: User | null = await getData(storageKeys.USER);

    if (!userData) {
      return { success: false, error: '사용자 정보를 찾을 수 없습니다.' };
    }

    // 닉네임 변경은 UserContext의 updateNickname을 사용해야 함
    if (data.nickname && data.nickname !== nickname) {
      return { success: false, error: '닉네임 변경은 설정 화면에서 해주세요.' };
    }

    // 프로필 이미지는 추후 구현 (현재는 User 타입에 없음)
    // TODO: User 타입에 profileImage 필드 추가 시 구현

    return { success: true };
  } catch (error) {
    logError('사용자 정보 수정 실패', error as Error, { nickname, data });
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

/**
 * 캘린더 이벤트 조회
 */
export const getCalendarEvents = async (nickname: string): Promise<ServiceResult<CalendarEvent[]>> => {
  try {
    const storageKeys = getStorageKeys(nickname);
    const events: CalendarEvent[] = await getData(storageKeys.CALENDAR_EVENTS) || [];

    // 날짜순 정렬
    const sortedEvents = events.sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      success: true,
      data: sortedEvents,
    };
  } catch (error) {
    logError('캘린더 이벤트 조회 실패', error as Error, { nickname });
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

/**
 * 캘린더 이벤트 추가
 */
export const addCalendarEvent = async (
  nickname: string,
  eventData: CalendarEventData
): Promise<ServiceResult<CalendarEvent>> => {
  try {
    const storageKeys = getStorageKeys(nickname);
    const events: CalendarEvent[] = await getData(storageKeys.CALENDAR_EVENTS) || [];

    const newEvent: CalendarEvent = {
      id: `event_${Date.now()}`,
      title: eventData.title,
      description: eventData.description,
      date: eventData.date,
      time: eventData.time,
      created_at: new Date().toISOString(),
    };

    const updatedEvents = [...events, newEvent];
    await setData(storageKeys.CALENDAR_EVENTS, updatedEvents);

    return {
      success: true,
      data: newEvent,
    };
  } catch (error) {
    logError('캘린더 이벤트 추가 실패', error as Error, { nickname, eventData });
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

/**
 * 캘린더 이벤트 수정
 */
export const updateCalendarEvent = async (
  nickname: string,
  eventId: string,
  eventData: Partial<CalendarEventData>
): Promise<ServiceResult<CalendarEvent>> => {
  try {
    const storageKeys = getStorageKeys(nickname);
    const events: CalendarEvent[] = await getData(storageKeys.CALENDAR_EVENTS) || [];

    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) {
      return { success: false, error: '이벤트를 찾을 수 없습니다.' };
    }

    const existingEvent = events[eventIndex];
    if (!existingEvent) {
      return { success: false, error: '이벤트를 찾을 수 없습니다.' };
    }

    const updatedEvent: CalendarEvent = {
      id: existingEvent.id,
      title: eventData.title ?? existingEvent.title,
      description: eventData.description ?? existingEvent.description,
      date: eventData.date ?? existingEvent.date,
      time: eventData.time ?? existingEvent.time,
      created_at: existingEvent.created_at,
      updated_at: new Date().toISOString(),
    };

    const updatedEvents = [...events];
    updatedEvents[eventIndex] = updatedEvent;
    await setData(storageKeys.CALENDAR_EVENTS, updatedEvents);

    return {
      success: true,
      data: updatedEvent,
    };
  } catch (error) {
    logError('캘린더 이벤트 수정 실패', error as Error, { nickname, eventId, eventData });
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

/**
 * 캘린더 이벤트 삭제
 */
export const deleteCalendarEvent = async (
  nickname: string,
  eventId: string
): Promise<ServiceResult<void>> => {
  try {
    const storageKeys = getStorageKeys(nickname);
    const events: CalendarEvent[] = await getData(storageKeys.CALENDAR_EVENTS) || [];

    const filteredEvents = events.filter(e => e.id !== eventId);

    if (filteredEvents.length === events.length) {
      return { success: false, error: '이벤트를 찾을 수 없습니다.' };
    }

    await setData(storageKeys.CALENDAR_EVENTS, filteredEvents);

    return { success: true };
  } catch (error) {
    logError('캘린더 이벤트 삭제 실패', error as Error, { nickname, eventId });
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};
