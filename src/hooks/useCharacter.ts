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
import { getMyReant, updateReant, ReantResponse } from '../api/reantApi';

export const useCharacter = (): UseCharacterReturn => {
  const { currentNickname } = useUser();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Reant 정보를 Character 형태로 변환
  const convertReantToCharacter = useCallback((reant: ReantResponse): Character => {
    // 백엔드의 exp는 전체 누적 경험치
    // experience는 현재 레벨의 경험치 (0-99)
    // total_experience는 전체 누적 경험치
    const totalExp = reant.exp;
    const currentLevelExp = totalExp % 100; // 현재 레벨에서의 경험치
    // 백엔드 레벨을 신뢰하지 않고, 항상 total_experience 기반으로 레벨 계산
    // 경험치 0-99 = 레벨 1, 100-199 = 레벨 2, 200-299 = 레벨 3, ...
    const calculatedLevel = Math.floor(totalExp / 100) + 1;
    // 백엔드 레벨과 계산된 레벨 중 더 높은 값을 사용 (백엔드가 업데이트 안 된 경우 대비)
    const level = Math.max(reant.level || 1, calculatedLevel);
    
    return {
      id: `reant_${reant.id}`,
      character_id: `reant_${reant.id}`,
      name: reant.name,
      title: '성장하는 동반자',
      description: '성장 여정을 함께해요',
      emoji: '🌱',
      level: level,
      experience: currentLevelExp, // 현재 레벨의 경험치 (0-99)
      total_experience: totalExp, // 전체 누적 경험치
      max_experience: 100, // 다음 레벨까지 필요한 경험치 (항상 100)
      unlocked: true,
      unlocked_date: reant.createdAt,
      category_id: 'growth',
      completed_missions: 0,
      created_at: reant.createdAt,
      updated_at: reant.updatedAt,
    };
  }, []);

  // 캐릭터 데이터 로드 (백엔드 Reant와 동기화)
  const loadCharacters = useCallback(async (): Promise<void> => {
    if (!currentNickname) return;

    try {
      setLoading(true);
      setError(null);

      // 백엔드에서 Reant 정보 가져오기 시도
      const reantResult = await getMyReant();

      if (reantResult.success && reantResult.data) {
        // 백엔드 Reant 정보를 Character 형태로 변환
        const reantCharacter = convertReantToCharacter(reantResult.data);

        // 로컬 스토리지에도 동기화
        const storageKeys = getStorageKeys(currentNickname);
        await setData(storageKeys.CHARACTERS, [reantCharacter]);

        setCharacters([reantCharacter]);
        if (!selectedCharacter) {
          setSelectedCharacter(reantCharacter);
        } else {
          // 선택된 캐릭터도 업데이트
          setSelectedCharacter(reantCharacter);
        }
        setLoading(false);
        return;
      }

      // 백엔드 연결 실패 시 로컬 스토리지에서 로드 (폴백)
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
        // total_experience를 우선 사용, 없으면 experience를 사용
        const totalExperience: number = sortedCharacters.reduce((sum, c) => {
          return sum + (c.total_experience || c.experience || 0);
        }, 0);
        const newLevel: number = Math.floor(totalExperience / 100) + 1;
        const currentLevelExp = totalExperience % 100; // 현재 레벨의 경험치
        const now = Date.now();
        const unifiedCharacter: Character = {
          id: `character_${now}_growth`,
          character_id: `character_${now}_growth`,
          name: sortedCharacters[0]?.name || '나의 동반자',
          title: sortedCharacters[0]?.title || '성장하는 동반자',
          description: sortedCharacters[0]?.description || '성장 여정을 함께해요',
          emoji: sortedCharacters[0]?.emoji || '🌱',
          level: newLevel,
          experience: currentLevelExp, // 현재 레벨의 경험치 (0-99)
          total_experience: totalExperience, // 전체 누적 경험치
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
  }, [currentNickname, convertReantToCharacter]);

  // 초기 로드 (currentNickname이 변경될 때만)
  useEffect(() => {
    if (currentNickname) {
      loadCharacters();
    }
  }, [currentNickname]);

  // 경험치 추가 (카테고리별) - 백엔드 연동
  // 주의: 미션 완료 시 백엔드에서 자동으로 경험치를 지급하므로,
  // 이 함수는 UI에서 즉각적인 피드백을 주고 백엔드와 동기화합니다.
  const addExperienceByCategory = useCallback(async (
    categoryId: MissionCategory,
    experience: number
  ): Promise<ExperienceResult> => {
    if (!currentNickname) {
      return { success: false, experienceGained: 0, levelUp: false, error: '사용자 정보가 없습니다.' };
    }

    try {
      // 현재 캐릭터 정보
      const character: Character | undefined = characters.find(char => char.category_id === categoryId);
      if (!character) return { success: false, experienceGained: 0, levelUp: false, error: '캐릭터를 찾을 수 없습니다.' };

      const oldLevel = character.level;

      // 백엔드에서 최신 Reant 정보 가져오기 (미션 완료 API에서 이미 경험치가 지급됨)
      const reantResult = await getMyReant();

      if (reantResult.success && reantResult.data) {
        const updatedCharacter = convertReantToCharacter(reantResult.data);
        const newLevel = updatedCharacter.level;
        const levelUp = newLevel > oldLevel;

        // 로컬 상태 업데이트
        setCharacters([updatedCharacter]);
        setSelectedCharacter(updatedCharacter);

        // 로컬 스토리지에도 동기화
        const storageKeys = getStorageKeys(currentNickname);
        await setData(storageKeys.CHARACTERS, [updatedCharacter]);

        return {
          success: true,
          experienceGained: experience,
          levelUp,
          newLevel,
        };
      }

      // 백엔드 연결 실패 시 로컬에서 처리 (폴백)
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
  }, [characters, selectedCharacter, currentNickname, convertReantToCharacter]);

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
