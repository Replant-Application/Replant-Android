/**
 * 캐릭터 관리 Hook
 * 캐릭터 데이터 로드, 경험치 추가 등의 기능을 제공
 *
 * @returns {Object} 캐릭터 관련 상태와 함수들
 * @returns {Array} characters - 캐릭터 목록
 * @returns {Object} selectedCharacter - 선택된 캐릭터
 * @returns {boolean} loading - 로딩 상태
 * @returns {string|null} error - 에러 메시지
 * @returns {Function} loadCharacters - 캐릭터 데이터 로드
 * @returns {Function} addExperienceByCategory - 카테고리별 경험치 추가
 * @returns {Function} selectCharacter - 캐릭터 선택
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getData, getStorageKeys, autoLevelupCharacter, setData } from '../services';
import { updateCharacterName as updateCharacterNameService } from '../services/characterService';
import { useUser } from '../contexts/UserContext';
import { logError } from '../utils/logger';
import { Character, UseCharacterReturn, ExperienceResult, ServiceResult, MissionCategory } from '../types';

export const useCharacter = (): UseCharacterReturn => {
  const { currentNickname } = useUser();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
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

      // 단일 캐릭터로 병합 (기존 다중 카테고리 데이터를 통합)
      let sortedCharacters: Character[] = updatedCharacters.sort((a, b) => a.level - b.level);
      const hasNonGrowthCategory = sortedCharacters.some(c => c.category_id !== 'growth');
      if (sortedCharacters.length !== 1 || hasNonGrowthCategory) {
        const totalExperience: number = sortedCharacters.reduce((sum, c) => sum + (c.experience || 0), 0);
        const newLevel: number = Math.floor(totalExperience / 100) + 1;
        const now = Date.now();
        const unifiedCharacter: Character = {
          id: `character_${now}_growth`,
          character_id: `character_${now}_growth`,
          name: sortedCharacters[0]?.name || '나의 동반자',
          title: sortedCharacters[0]?.title || '성장하는 동반자',
          description: sortedCharacters[0]?.description || '성장 여정을 함께해요',
          emoji: sortedCharacters[0]?.emoji || '🌱',
          level: newLevel,
          experience: totalExperience,
          total_experience: totalExperience,
          max_experience: 100,
          unlocked: true,
          unlocked_date: new Date().toISOString(),
          category_id: 'growth',
          completed_missions: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        await setData(storageKeys.CHARACTERS, [unifiedCharacter]);
        sortedCharacters = [unifiedCharacter];
      }

      // 업데이트된 캐릭터 데이터가 있으면 저장소에 저장
      if (updatedCharacters.some((char, index) => char !== charactersData[index])) {
        await setData(storageKeys.CHARACTERS, updatedCharacters);
      }

      // 캐릭터 설정
      setCharacters(sortedCharacters);

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
    categoryId: MissionCategory,
    experience: number
  ): Promise<ExperienceResult> => {
    if (!currentNickname) {
      return { success: false, experienceGained: 0, levelUp: false, error: '사용자 정보가 없습니다.' };
    }

    try {
      // 해당 카테고리의 캐릭터 찾기
      const character: Character | undefined = characters.find(char => char.category_id === categoryId);
      if (!character) return { success: false, experienceGained: 0, levelUp: false, error: '캐릭터를 찾을 수 없습니다.' };

      // autoLevelupCharacter 함수 사용
      const result = await autoLevelupCharacter(character.id, experience, currentNickname);

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

  // 캐릭터 이름 변경
  const updateCharacterName = useCallback(async (
    characterId: string,
    newName: string
  ): Promise<ServiceResult<Character>> => {
    if (!currentNickname) {
      return { success: false, error: '사용자 정보가 없습니다.' };
    }

    try {
      const result = await updateCharacterNameService(characterId, newName, currentNickname);
      
      if (result.success && result.data) {
        // 로컬 상태 업데이트
        setCharacters(prev =>
          prev.map(char =>
            char.id === characterId
              ? result.data!
              : char
          )
        );

        // 선택된 캐릭터도 업데이트
        if (selectedCharacter && selectedCharacter.id === characterId) {
          setSelectedCharacter(result.data);
        }
      }
      
      return result;
    } catch (updateError) {
      logError('캐릭터 이름 변경 실패', updateError as Error, { characterId, newName, currentNickname });
      return {
        success: false,
        error: (updateError as Error).message,
      };
    }
  }, [currentNickname, selectedCharacter]);

  // 메모이제이션된 반환 객체
  return useMemo(() => ({
    characters,
    selectedCharacter,
    loading,
    error,
    loadCharacters,
    addExperienceByCategory,
    selectCharacter,
    updateCharacterName,
  }), [
    characters,
    selectedCharacter,
    loading,
    error,
    loadCharacters,
    addExperienceByCategory,
    selectCharacter,
    updateCharacterName,
  ]);
};
