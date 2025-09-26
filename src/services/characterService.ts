import { getData, updateData, setData, getStorageKeys } from './storage';
import { logError } from '../utils/logger';
import { Character, CharacterData, ServiceResult, ExperienceResult, LevelUpResult } from '../types';

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
    const newExperience: number = (character.experience || 0) + experienceGained;
    
    // 레벨업 계산 (100 경험치당 1레벨)
    const newLevel: number = Math.floor(newExperience / 100) + 1;
    const oldLevel: number = character.level || 1;
    
    // 캐릭터 업데이트
    const updatedCharacter: Character = {
      ...character,
      experience: newExperience,
      level: newLevel,
      total_experience: (character.total_experience || 0) + experienceGained
    };
    
    await updateData(storageKeys.CHARACTERS, character.id, updatedCharacter);
    
    return {
      success: true,
      newLevel,
      experience: newExperience,
      levelUp: newLevel > oldLevel,
      character: updatedCharacter
    };
  } catch (error) {
    logError('캐릭터 레벨업 실패', error as Error, { characterId, experienceGained, nickname });
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

// 캐릭터 생성
export const createCharacter = async (
  characterData: CharacterData, 
  nickname: string
): Promise<ServiceResult<Character>> => {
  try {
    const storageKeys = getStorageKeys(nickname);
    const characters: Character[] = await getData(storageKeys.CHARACTERS) || [];
    
    const newCharacter: Character = {
      id: Date.now(),
      character_id: `character_${Date.now()}`,
      name: characterData.name,
      description: characterData.description,
      emoji: characterData.emoji,
      level: 1,
      experience: 0,
      max_experience: 100,
      unlocked: false,
      category: characterData.category,
      category_id: characterData.category_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const updatedCharacters: Character[] = [...characters, newCharacter];
    await setData(storageKeys.CHARACTERS, updatedCharacters);
    
    return {
      success: true,
      data: newCharacter
    };
  } catch (error) {
    logError('캐릭터 생성 실패', error as Error, { characterData, nickname });
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

// 캐릭터 조회
export const getCharacters = async (nickname: string): Promise<Character[]> => {
  try {
    const storageKeys = getStorageKeys(nickname);
    const characters: Character[] = await getData(storageKeys.CHARACTERS) || [];
    return characters;
  } catch (error) {
    logError('캐릭터 조회 실패', error as Error, { nickname });
    return [];
  }
};

// 대표 캐릭터 설정
export const setRepresentativeCharacter = async (
  characterId: string, 
  nickname: string
): Promise<ServiceResult<void>> => {
  try {
    const storageKeys = getStorageKeys(nickname);
    await setData(storageKeys.REPRESENTATIVE_CHARACTER, characterId);
    
    return {
      success: true
    };
  } catch (error) {
    logError('대표 캐릭터 설정 실패', error as Error, { characterId, nickname });
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

// 대표 캐릭터 조회
export const getRepresentativeCharacter = async (nickname: string): Promise<Character | null> => {
  try {
    const storageKeys = getStorageKeys(nickname);
    const representativeId: string = await getData(storageKeys.REPRESENTATIVE_CHARACTER) || '';
    const characters: Character[] = await getData(storageKeys.CHARACTERS) || [];
    
    return characters.find(c => c.character_id === representativeId) || null;
  } catch (error) {
    logError('대표 캐릭터 조회 실패', error as Error, { nickname });
    return null;
  }
};
