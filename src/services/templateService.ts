// 템플릿 서비스 - JSON 파일에서 직접 로드
import { logError } from '../utils/logger';
import { Mission, Character } from '../types';
import { ServiceResult } from '../types';

// 미션 템플릿 로드
export const loadMissionTemplates = async (): Promise<Mission[]> => {
  try {
    // 항상 JSON 파일에서 최신 템플릿 로드
    const missionTemplatesData = require('../data/missionTemplates.json');
    return missionTemplatesData;
  } catch (error) {
    logError('미션 템플릿 로드 실패', error as Error);
    return [];
  }
};

// 캐릭터 템플릿 로드
export const loadCharacterTemplates = async (): Promise<Character[]> => {
  try {
    // 항상 JSON 파일에서 최신 템플릿 로드
    const characterTemplatesData = require('../data/characterTemplates.json');
    return characterTemplatesData;
  } catch (error) {
    logError('캐릭터 템플릿 로드 실패', error as Error);
    return [];
  }
};

// 모든 템플릿 로드
export const loadTemplates = async (): Promise<ServiceResult<{
  missionTemplates: Mission[];
  characterTemplates: Character[];
}>> => {
  try {
    const missionTemplates: Mission[] = await loadMissionTemplates();
    const characterTemplates: Character[] = await loadCharacterTemplates();

    return {
      success: true,
      data: {
        missionTemplates,
        characterTemplates
      }
    };
  } catch (error) {
    logError('템플릿 로드 실패', error as Error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
};
