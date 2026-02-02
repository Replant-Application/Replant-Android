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

    // 경험치 추가 (백엔드 Reant.java와 동일 공식)
    // 총 누적 경험치 = 100*(level-1)*level/2 + exp(현재 레벨 진행분), 다음 레벨 필요 = level*100
    const level = character.level ?? 1;
    const currentExp = character.experience ?? 0;
    const currentTotalExp =
      character.total_experience ??
      (level > 1 ? 100 * ((level - 1) * level / 2) : 0) + currentExp;
    const newTotalExp: number = currentTotalExp + experienceGained;
    const oldLevel = level;

    // 총 누적 → 레벨·현재진행분 계산 (백엔드 checkLevelUp 로직과 동일)
    let remaining = newTotalExp;
    let newLevel = 1;
    while (newLevel * 100 <= remaining) {
      remaining -= newLevel * 100;
      newLevel += 1;
    }
    const newCurrentLevelExp = remaining;

    const updatedCharacter: Character = {
      ...character,
      experience: newCurrentLevelExp,
      level: newLevel,
      total_experience: newTotalExp,
      max_experience: newLevel * 100,
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
