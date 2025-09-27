import AsyncStorage from '@react-native-async-storage/async-storage';
import { getData, setData, getStorageKeys } from './storage';
import { logError } from '../utils/logger';
import { ServiceResult, Character } from '../types';
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

// 닉네임 중복 확인
export const checkNicknameDuplicate = async (nickname: string): Promise<boolean> => {
  try {
    const storageKeys = getStorageKeys(nickname);
    const existingNickname: string | null = await AsyncStorage.getItem(storageKeys.USER_NICKNAME);
    return existingNickname === nickname;
  } catch (error) {
    logError('닉네임 중복 확인 실패', error as Error, { nickname });
    return false;
  }
};

// 닉네임으로 사용자 생성
export const createUserWithNickname = async (
  nickname: string,
  _deviceId: string
): Promise<ServiceResult<{ userId: string; nickname: string }>> => {
  try {
    // 닉네임 중복 확인
    const isDuplicate: boolean = await checkNicknameDuplicate(nickname);
    if (isDuplicate) {
      throw new Error('이미 사용 중인 닉네임입니다.');
    }

    // 닉네임 저장
    const storageKeys = getStorageKeys(nickname);
    await AsyncStorage.setItem(storageKeys.USER_NICKNAME, nickname);

    // 사용자 데이터 초기화
    const userId: string = `user_${Date.now()}`;
    await initializeUserData(userId, nickname);

    return {
      success: true,
      data: {
        userId,
        nickname
      }
    };
  } catch (error) {
    logError('사용자 생성 실패', error as Error, { nickname });
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

// 닉네임으로 사용자 조회
export const getUserByNickname = async (nickname: string): Promise<string | null> => {
  try {
    const storageKeys = getStorageKeys(nickname);
    const storedNickname: string | null = await AsyncStorage.getItem(storageKeys.USER_NICKNAME);
    if (storedNickname === nickname) {
      return `user_${Date.now()}`; // 임시 사용자 ID
    }
    return null;
  } catch (error) {
    logError('사용자 조회 실패', error as Error, { nickname });
    return null;
  }
};

// 기존 사용자 데이터 마이그레이션 (3개 카테고리 유지)
export const migrateUserData = async (
  nickname: string
): Promise<ServiceResult<{ message: string; migratedMissions: number }>> => {
  try {
    const storageKeys = getStorageKeys(nickname);

    // 기존 미션 데이터 가져오기
    const existingMissions: any[] = await getData(storageKeys.MISSIONS) || [];
    if (existingMissions.length === 0) {
      return {
        success: true,
        data: {
          message: '마이그레이션할 데이터가 없습니다.',
          migratedMissions: 0
        }
      };
    }

    // 유효한 카테고리만 유지 (self_management, communication, career)
    const validCategories: string[] = ['self_management', 'communication', 'career'];
    const migratedMissions = existingMissions.map(mission => ({
      ...mission,
      category_id: validCategories.includes(mission.category_id) ? mission.category_id : 'career'
    }));

    await setData(storageKeys.MISSIONS, migratedMissions);

    // 캐릭터 데이터는 레벨 기반이므로 변경 없음

    return {
      success: true,
      data: {
        message: '데이터 마이그레이션이 완료되었습니다.',
        migratedMissions: migratedMissions.length
      }
    };
  } catch (error) {
    logError('데이터 마이그레이션 실패', error as Error, { nickname });
    return {
      success: false,
      error: (error as Error).message
    };
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

    // 항상 JSON 파일에서 최신 템플릿 로드
    const missionTemplates = require('../data/missionTemplates.json');
    // 템플릿에서 미션 생성 (전체 템플릿 데이터 사용)
    const missions = missionTemplates.map((template: any) => ({
      id: `mission_${Date.now()}_${template.id}`,
      mission_id: template.mission_id,
      title: template.title,
      description: template.description,
      emoji: template.emoji,
      category_id: template.category_id,
      difficulty: template.difficulty,
      experience: template.experience,
      completed: false
    }));
    await setData(storageKeys.MISSIONS, missions);

    // 캐릭터 템플릿에서 초기 캐릭터 생성
    // 항상 JSON 파일에서 최신 템플릿 로드
    const characterTemplatesData = require('../data/characterTemplates.json');
    await setData(storageKeys.CHARACTER_TEMPLATES, characterTemplatesData);
    const characterTemplates: any[] = characterTemplatesData;
    if (characterTemplates.length > 0) {
      // 4개 카테고리별 캐릭터 생성 (custom 포함)
      const initialCharacters: Character[] = [
        {
          id: `character_${Date.now()}_self_management`,
          character_id: `character_${Date.now()}_self_management`,
          user_id: userId,
          name: generateUserCharacterName(userId, 'self_management'),
          title: characterTemplates[0].title,
          description: getCategoryDescription('self_management'),
          emoji: characterTemplates[0].emoji || '🌱',
          level: 1,
          experience: 0,
          max_experience: 100,
          total_experience: 0,
          unlocked: true,
          unlocked_date: new Date().toISOString(),
          category_id: 'self_management',
          completed_missions: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: `character_${Date.now()}_communication`,
          character_id: `character_${Date.now()}_communication`,
          user_id: userId,
          name: generateUserCharacterName(userId, 'communication'),
          title: characterTemplates[0].title,
          description: getCategoryDescription('communication'),
          emoji: characterTemplates[0].emoji || '🌱',
          level: 1,
          experience: 0,
          max_experience: 100,
          total_experience: 0,
          unlocked: true,
          unlocked_date: new Date().toISOString(),
          category_id: 'communication',
          completed_missions: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: `character_${Date.now()}_career`,
          character_id: `character_${Date.now()}_career`,
          user_id: userId,
          name: generateUserCharacterName(userId, 'career'),
          title: characterTemplates[0].title,
          description: getCategoryDescription('career'),
          emoji: characterTemplates[0].emoji || '🌱',
          level: 1,
          experience: 0,
          max_experience: 100,
          total_experience: 0,
          unlocked: true,
          unlocked_date: new Date().toISOString(),
          category_id: 'career',
          completed_missions: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: `character_${Date.now()}_custom`,
          character_id: `character_${Date.now()}_custom`,
          user_id: userId,
          name: generateUserCharacterName(userId, 'custom'),
          title: '나만의 동반자',
          description: getCategoryDescription('custom'),
          emoji: '⭐',
          level: 1,
          experience: 0,
          max_experience: 100,
          total_experience: 0,
          unlocked: true,
          unlocked_date: new Date().toISOString(),
          category_id: 'custom',
          completed_missions: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      await setData(storageKeys.CHARACTERS, initialCharacters);
    }

    // 다이어리는 빈 배열로 시작
    await setData(storageKeys.DIARIES, []);

    // 대표 캐릭터 설정 (초기에는 자기관리 캐릭터)
    await setData(storageKeys.REPRESENTATIVE_CHARACTER, 'self_management');
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
