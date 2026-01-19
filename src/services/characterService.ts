import { getData, setData, getStorageKeys } from './storage';
import { logError } from '../utils/logger';
import { Character, ServiceResult, LevelUpResult } from '../types';

// 캐릭터 자동 레벨업
export const autoLevelupCharacter = async (
  characterId: string,
  experienceGained: number,
  nickname: string
): Promise<LevelUpResult> => {
  try {
    const storageKeys = getStorageKeys(nickname);
    const characters: Character[] = await getData(storageKeys.CHARACTERS) || [];
    const character: Character | undefined = characters.find(c => c.id === characterId);

    if (!character) {
      throw new Error('캐릭터를 찾을 수 없습니다.');
    }

    // 경험치 추가
    // character.experience는 현재 레벨의 경험치 (0-99)
    // character.total_experience는 전체 누적 경험치
    const currentTotalExp = character.total_experience || character.experience || 0;
    const newTotalExp: number = currentTotalExp + experienceGained;

    // 레벨업 계산 (100 경험치당 1레벨)
    const newLevel: number = Math.floor(newTotalExp / 100) + 1;
    const oldLevel: number = character.level || 1;
    const newCurrentLevelExp = newTotalExp % 100; // 현재 레벨에서의 경험치 (0-99)

    // 캐릭터 업데이트
    const updatedCharacter: Character = {
      ...character,
      experience: newCurrentLevelExp, // 현재 레벨의 경험치
      level: newLevel,
      total_experience: newTotalExp  // total_experience는 전체 누적 경험치
    };

    // Character의 id는 string이므로 직접 배열을 업데이트
    const updatedCharacters: Character[] = characters.map(c =>
      c.id === character.id ? updatedCharacter : c
    );
    await setData(storageKeys.CHARACTERS, updatedCharacters);

    return {
      success: true,
      oldLevel,
      newLevel,
      experienceGained,
      experience: newTotalExp,
      levelUp: newLevel > oldLevel,
      character: updatedCharacter
    };
  } catch (error) {
    logError('캐릭터 레벨업 실패', error as Error, { characterId, experienceGained, nickname });
    return {
      success: false,
      oldLevel: 0,
      newLevel: 0,
      experienceGained: 0,
      error: (error as Error).message
    };
  }
};

/**
 * 캐릭터 이름 변경
 */
export const updateCharacterName = async (
  characterId: string,
  newName: string,
  nickname: string
): Promise<ServiceResult<Character>> => {
  try {
    if (!newName || !newName.trim()) {
      return { success: false, error: '캐릭터 이름을 입력해주세요.' };
    }

    const storageKeys = getStorageKeys(nickname);
    const characters: Character[] = await getData(storageKeys.CHARACTERS) || [];
    const character: Character | undefined = characters.find(c => c.id === characterId);

    if (!character) {
      return { success: false, error: '캐릭터를 찾을 수 없습니다.' };
    }

    // 캐릭터 이름 업데이트
    const updatedCharacter: Character = {
      ...character,
      name: newName.trim(),
      updated_at: new Date().toISOString(),
    };

    // 캐릭터 배열 업데이트
    const updatedCharacters: Character[] = characters.map(c =>
      c.id === character.id ? updatedCharacter : c
    );
    await setData(storageKeys.CHARACTERS, updatedCharacters);

    return {
      success: true,
      data: updatedCharacter,
    };
  } catch (error) {
    logError('캐릭터 이름 변경 실패', error as Error, { characterId, newName, nickname });
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};
