import { loadTemplates } from './templateService';
import { logError } from '../utils/logger';
import { ServiceResult, Mission, Character } from '../types';

// 앱 초기화
export const initializeApp = async (): Promise<ServiceResult<{
  message: string;
  templates: {
    missionTemplates: Mission[];
    characterTemplates: Character[];
  };
}>> => {
  try {
    // 템플릿 데이터 로드
    const templateResult = await loadTemplates();

    if (!templateResult.success) {
      throw new Error(templateResult.error);
    }

    return {
      success: true,
      data: {
        message: '앱이 초기화되었습니다.',
        templates: {
          missionTemplates: templateResult.data?.missionTemplates || [],
          characterTemplates: templateResult.data?.characterTemplates || []
        }
      }
    };
  } catch (error) {
    logError('앱 초기화 실패', error as Error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
};
