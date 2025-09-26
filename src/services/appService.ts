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

// 앱 데이터 초기화 (모든 데이터 삭제)
export const resetAppData = async (): Promise<ServiceResult<{ message: string }>> => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    
    // 모든 데이터 삭제
    await AsyncStorage.multiRemove([
      'missions',
      'diaries', 
      'characters',
      'userNickname',
      'mission_templates',
      'character_templates'
    ]);
    
    return {
      success: true,
      data: {
        message: '앱 데이터가 초기화되었습니다.'
      }
    };
  } catch (error) {
    logError('앱 데이터 초기화 실패', error as Error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
};
