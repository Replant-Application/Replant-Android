import { useState, useEffect, useCallback } from 'react';
import { getData, addData, updateData, deleteData, getStorageKeys } from '../services';
import { useUser } from '../contexts/UserContext';
import { logError } from '../utils/logger';
import { Diary, UseDiaryReturn, DiaryData, ServiceResult, SimpleDiaryData } from '../types';

export const useDiary = (): UseDiaryReturn => {
  const { currentNickname } = useUser();
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 다이어리 데이터 로드
  const loadDiaries = useCallback(async (): Promise<void> => {
    if (!currentNickname) return;

    try {
      setLoading(true);
      setError(null);

      const storageKeys = getStorageKeys(currentNickname);
      const diariesData: Diary[] = await getData(storageKeys.DIARIES) || [];
      const sortedDiaries: Diary[] = diariesData.sort((a, b) =>
        new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      );

      setDiaries(sortedDiaries);
    } catch (loadError) {
      logError('다이어리 로드 실패', loadError as Error, { currentNickname });
      setError((loadError as Error).message);
    } finally {
      setLoading(false);
    }
  }, [currentNickname]);

  // 초기 로드
  useEffect(() => {
    loadDiaries();
  }, [loadDiaries]);

  // 다이어리 저장
  const saveDiary = useCallback(async (diaryData: SimpleDiaryData): Promise<ServiceResult<Diary>> => {
    try {
      setLoading(true);

      const storageKeys = getStorageKeys(currentNickname!);
      const newDiary: Diary = await addData(storageKeys.DIARIES, {
        id: `diary_${Date.now()}`,
        date: diaryData.date,
        emotion: diaryData.emotion,
        content: diaryData.content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        weather: undefined,
        location: undefined,
        photos: [],
        is_private: false,
        created_by: currentNickname!
      }) as unknown as Diary;

      // 로컬 상태 업데이트
      setDiaries(prev => [newDiary, ...prev]);

      return { success: true, data: newDiary };
    } catch (saveError) {
      logError('다이어리 저장 실패', saveError as Error, { diaryData, currentNickname });
      throw saveError;
    } finally {
      setLoading(false);
    }
  }, [currentNickname]);

  // 다이어리 수정
  const updateDiary = useCallback(async (
    diaryId: string,
    diaryData: SimpleDiaryData
  ): Promise<ServiceResult<Diary>> => {
    try {
      setLoading(true);

      const storageKeys = getStorageKeys(currentNickname!);
      const updatedDiary: Diary = await updateData(storageKeys.DIARIES, parseInt(diaryId), {
        id: parseInt(diaryId),
        ...diaryData
      }) as unknown as Diary;

      // 로컬 상태 업데이트
      setDiaries(prev =>
        prev.map(diary =>
          diary.id === diaryId ? updatedDiary : diary
        )
      );

      return { success: true, data: updatedDiary };
    } catch (updateError) {
      logError('다이어리 수정 실패', updateError as Error, { diaryId, diaryData, currentNickname });
      throw updateError;
    } finally {
      setLoading(false);
    }
  }, [currentNickname]);

  // 다이어리 삭제
  const deleteDiary = useCallback(async (diaryId: string): Promise<ServiceResult<void>> => {
    try {
      setLoading(true);

      const storageKeys = getStorageKeys(currentNickname!);
      await deleteData(storageKeys.DIARIES, parseInt(diaryId));

      // 로컬 상태 업데이트
      setDiaries(prev => prev.filter(diary => diary.id !== diaryId));

      return { success: true };
    } catch (deleteError) {
      logError('다이어리 삭제 실패', deleteError as Error, { diaryId, currentNickname });
      throw deleteError;
    } finally {
      setLoading(false);
    }
  }, [currentNickname]);

  // 다이어리 ID로 조회
  const getDiaryById = useCallback((diaryId: string): Diary | null => {
    return diaries.find(diary => diary.diary_id === diaryId) || null;
  }, [diaries]);

  // 감정별 다이어리 조회
  const getDiariesByEmotion = useCallback((emotion: string): Diary[] => {
    return diaries.filter(diary => diary.emotion === emotion);
  }, [diaries]);

  // 날짜 범위별 다이어리 조회
  const getDiariesByDateRange = useCallback((startDate: string, endDate: string): Diary[] => {
    return diaries.filter(diary => {
      const diaryDate = new Date(diary.created_at || '');
      const start = new Date(startDate);
      const end = new Date(endDate);
      return diaryDate >= start && diaryDate <= end;
    });
  }, [diaries]);

  return {
    diaries,
    loading,
    error,
    loadDiaries,
    saveDiary: saveDiary as (data: any) => Promise<any>,
    updateDiary: updateDiary as (id: string, data: any) => Promise<any>,
    deleteDiary,
  };
};
