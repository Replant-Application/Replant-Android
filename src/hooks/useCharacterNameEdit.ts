/**
 * 캐릭터 이름 변경 Hook
 * 
 * 캐릭터 이름 변경 로직을 관리하는 커스텀 훅
 */

import { useState, useCallback } from 'react';
import { useCharacter } from './useCharacter';
import { useErrorHandler } from './useErrorHandler';
import { Character } from '../types';

interface UseCharacterNameEditReturn {
  /**
   * 이름 변경 모달 표시 여부
   */
  showModal: boolean;
  
  /**
   * 새 이름
   */
  newName: string;
  
  /**
   * 모달 열기
   */
  openModal: (currentName: string) => void;
  
  /**
   * 모달 닫기
   */
  closeModal: () => void;
  
  /**
   * 새 이름 설정
   */
  setName: (name: string) => void;
  
  /**
   * 이름 변경 실행
   */
  handleNameChange: (characterId: string, currentName: string) => Promise<boolean>;
}

/**
 * 캐릭터 이름 변경 Hook
 */
export const useCharacterNameEdit = (): UseCharacterNameEditReturn => {
  const { updateCharacterName, loadCharacters } = useCharacter();
  const { showError, showSuccess, showInfo, handleApiError } = useErrorHandler();
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');

  /**
   * 모달 열기
   */
  const openModal = useCallback((currentName: string) => {
    setNewName(currentName);
    setShowModal(true);
  }, []);

  /**
   * 모달 닫기
   */
  const closeModal = useCallback(() => {
    setShowModal(false);
    setNewName('');
  }, []);

  /**
   * 이름 변경 실행
   */
  const handleNameChange = useCallback(async (
    characterId: string,
    currentName: string
  ): Promise<boolean> => {
    if (!newName.trim()) {
      showError('캐릭터 이름을 입력해주세요.', 'useCharacterNameEdit.handleNameChange');
      return false;
    }

    if (newName.trim() === currentName) {
      showInfo('현재 이름과 동일합니다.');
      closeModal();
      return false;
    }

    try {
      const result = await updateCharacterName(characterId, newName.trim());
      if (result.success && result.data) {
        // loadCharacters를 호출하여 최신 캐릭터 정보 로드
        await loadCharacters();
        showSuccess('캐릭터 이름이 변경되었습니다.');
        closeModal();
        return true;
      } else {
        handleApiError(result, 'useCharacterNameEdit.handleNameChange');
        return false;
      }
    } catch (error) {
      showError(
        error instanceof Error ? error : new Error('이름 변경 중 오류가 발생했습니다.'),
        'useCharacterNameEdit.handleNameChange'
      );
      return false;
    }
  }, [newName, updateCharacterName, loadCharacters, showError, showSuccess, showInfo, handleApiError, closeModal]);

  return {
    showModal,
    newName,
    openModal,
    closeModal,
    setName: setNewName,
    handleNameChange,
  };
};
