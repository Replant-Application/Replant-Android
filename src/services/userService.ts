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
    // 모든 미션 사용 (7개)
    const essentialIds: string[] = ['1', '2', '3', '4', '5', '6', '7'];
    const selectedTemplates = missionTemplates.filter((t: any) => essentialIds.includes(t.mission_id));
    const missions = selectedTemplates.map((template: any) => ({
      id: `mission_${Date.now()}_${template.mission_id}`,
      mission_id: template.mission_id,
      title: template.title,
      description: template.description,
      emoji: template.emoji,
      category_id: 'growth',
      difficulty: template.difficulty,
      experience: template.experience,
      completed: false
    }));
    await setData(storageKeys.MISSIONS, missions);

    // 캐릭터 템플릿에서 초기 캐릭터 생성 (단일 캐릭터)
    // 항상 JSON 파일에서 최신 템플릿 로드
    const characterTemplatesData = require('../data/characterTemplates.json');
    await setData(storageKeys.CHARACTER_TEMPLATES, characterTemplatesData);
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

    // 다이어리는 빈 배열로 시작
    await setData(storageKeys.DIARIES, []);

    // 대표 캐릭터 설정 (단일: growth)
    await setData(storageKeys.REPRESENTATIVE_CHARACTER, 'growth');
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
