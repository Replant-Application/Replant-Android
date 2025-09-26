/**
 * 캐릭터 관리 Hook
 * 캐릭터 데이터 로드, 경험치 추가, 대표 캐릭터 설정 등의 기능을 제공
 * 
 * @returns {Object} 캐릭터 관련 상태와 함수들
 * @returns {Array} characters - 캐릭터 목록
 * @returns {Object} selectedCharacter - 선택된 캐릭터
 * @returns {Object} representativeCharacter - 대표 캐릭터
 * @returns {boolean} loading - 로딩 상태
 * @returns {string|null} error - 에러 메시지
 * @returns {Function} loadCharacters - 캐릭터 데이터 로드
 * @returns {Function} addExperienceByCategory - 카테고리별 경험치 추가
 * @returns {Function} selectCharacter - 캐릭터 선택
 * @returns {Function} setRepresentative - 대표 캐릭터 설정
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getData, getStorageKeys, autoLevelupCharacter, setData } from '../services';
import { useUser } from '../contexts/UserContext';
import { logError } from '../utils/logger';
import { Character, CharacterData, UseCharacterReturn, ExperienceResult, ServiceResult } from '../types';

export const useCharacter = (): UseCharacterReturn => {
  const { currentNickname } = useUser();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [representativeCharacter, setRepresentativeCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 캐릭터 데이터 로드
  const loadCharacters = useCallback(async (): Promise<void> => {
    if (!currentNickname) return;
    
    try {
      setLoading(true);
      setError(null);

      const storageKeys = getStorageKeys(currentNickname);
      const charactersData: Character[] = await getData(storageKeys.CHARACTERS) || [];
      
      // 해제일이 없는 캐릭터들에 대해 현재 시간으로 설정
      const updatedCharacters: Character[] = charactersData.map(character => {
        if (!character.unlocked_date) {
          return {
            ...character,
            unlocked_date: new Date().toISOString()
          };
        }
        return character;
      });
      
      const sortedCharacters: Character[] = updatedCharacters.sort((a, b) => a.level - b.level);

      // 업데이트된 캐릭터 데이터가 있으면 저장소에 저장
      if (updatedCharacters.some((char, index) => char !== charactersData[index])) {
        await setData(storageKeys.CHARACTERS, updatedCharacters);
      }

      // 대표 캐릭터 로드
      let representativeCategory: string = 'self_management'; // 기본값
      try {
        const storedCategory: string = await getData(storageKeys.REPRESENTATIVE_CHARACTER) || '';
        if (storedCategory) {
          representativeCategory = storedCategory; // JSON.parse 제거 - 문자열이므로
        }
      } catch (error) {
        // 에러 무시
      }
      
      const representativeChar: Character | undefined = sortedCharacters.find(char => 
        char.category_id === representativeCategory
      );
      
      
      // 캐릭터와 대표 캐릭터를 동시에 설정
      setCharacters(sortedCharacters);
      
      // 대표 캐릭터 설정 (안전한 fallback)
      if (representativeChar) {
        setRepresentativeCharacter(representativeChar);
      } else if (sortedCharacters.length > 0) {
        // 자기관리 캐릭터를 찾지 못하면 첫 번째 캐릭터 사용
        setRepresentativeCharacter(sortedCharacters[0] || null);
      } else {
        // 캐릭터가 아예 없으면 null
        setRepresentativeCharacter(null);
      }
      
      // 선택된 캐릭터가 없으면 첫 번째 캐릭터 선택
      if (sortedCharacters.length > 0 && !selectedCharacter) {
        setSelectedCharacter(sortedCharacters[0] || null);
      }
      
      // 모든 설정이 완료된 후 로딩 종료
      setLoading(false);
    } catch (loadError) {
      logError('캐릭터 로드 실패', loadError as Error, { currentNickname });
      setError((loadError as Error).message);
      setLoading(false);
    }
  }, [selectedCharacter, currentNickname]);

  // 초기 로드
  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  // 경험치 추가 (카테고리별)
  const addExperienceByCategory = useCallback(async (
    categoryId: string, 
    experience: number
  ): Promise<any> => {
    try {
      // 해당 카테고리의 캐릭터 찾기
      const character: Character | undefined = characters.find(char => char.category_id === categoryId);
      if (!character) return { success: false, experienceGained: 0, levelUp: false, error: '캐릭터를 찾을 수 없습니다.' };

      // autoLevelupCharacter 함수 사용
      const result = await autoLevelupCharacter(character.id, experience, currentNickname!);
      
      if (result.success) {
        // 로컬 상태 업데이트
        setCharacters(prev => 
          prev.map(char => 
            char.id === character.id 
              ? result.character!
              : char
          )
        );

        // 선택된 캐릭터도 업데이트
        if (selectedCharacter && selectedCharacter.id === character.id) {
          setSelectedCharacter(result.character!);
        }
      }

      return {
        success: result.success,
        experienceGained: result.experienceGained,
        levelUp: result.levelUp || false,
        newLevel: result.newLevel,
        error: result.error || undefined
      };
    } catch (expError) {
      logError('경험치 추가 실패', expError as Error, { categoryId, experience });
      return { success: false, experienceGained: 0, levelUp: false, error: (expError as Error).message };
    }
  }, [characters, selectedCharacter, currentNickname]);

  // 캐릭터 선택
  const selectCharacter = useCallback((character: Character): void => {
    setSelectedCharacter(character);
  }, []);

  // 대표 캐릭터 설정
  const setRepresentative = useCallback(async (categoryId: string): Promise<ServiceResult<void>> => {
    try {
      const storageKeys = getStorageKeys(currentNickname!);
      await setData(storageKeys.REPRESENTATIVE_CHARACTER, categoryId);
      
      const representativeChar: Character | undefined = characters.find(char => char.category_id === categoryId);
      if (representativeChar) {
        setRepresentativeCharacter(representativeChar);
      }
      
      return { success: true };
    } catch (error) {
      logError('대표 캐릭터 설정 실패', error as Error, { categoryId });
      return { success: false, error: (error as Error).message };
    }
  }, [characters, currentNickname]);

  // 캐릭터 생성 (placeholder)
  const createCharacter = useCallback(async (characterData: CharacterData): Promise<ServiceResult> => {
    return { success: false, error: '캐릭터 생성 기능은 아직 구현되지 않았습니다.' };
  }, []);

  // 캐릭터 업데이트 (placeholder)
  const updateCharacter = useCallback(async (characterId: string, characterData: CharacterData): Promise<ServiceResult> => {
    return { success: false, error: '캐릭터 업데이트 기능은 아직 구현되지 않았습니다.' };
  }, []);

  // 캐릭터 삭제 (placeholder)
  const deleteCharacter = useCallback(async (characterId: string): Promise<ServiceResult> => {
    return { success: false, error: '캐릭터 삭제 기능은 아직 구현되지 않았습니다.' };
  }, []);

  // 메모이제이션된 반환 객체
  return useMemo(() => ({
    characters,
    selectedCharacter,
    representativeCharacter,
    loading,
    error,
    loadCharacters,
    addExperienceByCategory,
    selectCharacter,
    setRepresentative,
    createCharacter,
    updateCharacter,
    deleteCharacter,
  }), [
    characters,
    selectedCharacter,
    representativeCharacter,
    loading,
    error,
    loadCharacters,
    addExperienceByCategory,
    selectCharacter,
    setRepresentative,
  ]);
};
