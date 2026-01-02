/**
 * 다이어리 Hook
 * 백엔드 API와 연동하여 다이어리 CRUD 기능 제공
 */

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import { logError } from '../utils/logger';
import { Diary, UseDiaryReturn, ServiceResult, SimpleDiaryData } from '../types';
import {
  getDiaries,
  getDiary as getDiaryApi,
  getDiaryByDate,
  createDiary,
  updateDiary as updateDiaryApi,
  deleteDiary as deleteDiaryApi,
  DiaryResponse,
} from '../api/diaryApi';

/**
 * API 응답을 로컬 Diary 타입으로 변환
 */
const transformDiaryResponse = (response: DiaryResponse): Diary => ({
  id: String(response.id),
  diary_id: String(response.id),
  date: response.date,
  emotion: response.emotion,
  content: response.content,
  weather: response.weather,
  location: response.location,
  photos: response.imageUrls || [],
  is_private: response.isPrivate,
  created_at: response.createdAt,
  updated_at: response.updatedAt,
});

export const useDiary = (): UseDiaryReturn => {
  const { currentNickname, isLoggedIn } = useUser();
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 다이어리 데이터 로드
  const loadDiaries = useCallback(async (): Promise<void> => {
    if (!currentNickname || !isLoggedIn) return;

    try {
      setLoading(true);
      setError(null);

      const result = await getDiaries({ size: 100 });

      if (result.success && result.data) {
        const transformedDiaries = result.data.content.map(transformDiaryResponse);
        // 날짜 기준 내림차순 정렬
        const sortedDiaries = transformedDiaries.sort((a, b) =>
          new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        );
        setDiaries(sortedDiaries);
      } else {
        setError(result.error || '다이어리를 불러올 수 없습니다.');
      }
    } catch (loadError) {
      logError('다이어리 로드 실패', loadError as Error, { currentNickname });
      setError((loadError as Error).message);
    } finally {
      setLoading(false);
    }
  }, [currentNickname, isLoggedIn]);

  // 초기 로드
  useEffect(() => {
    loadDiaries();
  }, [loadDiaries]);

  // 다이어리 저장
  const saveDiary = useCallback(async (diaryData: SimpleDiaryData): Promise<ServiceResult<Diary>> => {
    if (!currentNickname || !isLoggedIn) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    try {
      setLoading(true);

      const result = await createDiary({
        date: diaryData.date,
        emotion: diaryData.emotion as any,
        content: diaryData.content,
        isPrivate: false,
      });

      if (result.success && result.data) {
        const newDiary = transformDiaryResponse(result.data);
        // 로컬 상태 업데이트
        setDiaries(prev => [newDiary, ...prev]);
        return { success: true, data: newDiary };
      }

      return { success: false, error: result.error || '다이어리 저장에 실패했습니다.' };
    } catch (saveError) {
      logError('다이어리 저장 실패', saveError as Error, { diaryData, currentNickname });
      return { success: false, error: (saveError as Error).message };
    } finally {
      setLoading(false);
    }
  }, [currentNickname, isLoggedIn]);

  // 다이어리 수정
  const updateDiary = useCallback(async (
    diaryId: string,
    diaryData: SimpleDiaryData
  ): Promise<ServiceResult<Diary>> => {
    if (!currentNickname || !isLoggedIn) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    try {
      setLoading(true);

      const result = await updateDiaryApi(parseInt(diaryId, 10), {
        date: diaryData.date,
        emotion: diaryData.emotion as any,
        content: diaryData.content,
      });

      if (result.success && result.data) {
        const updatedDiary = transformDiaryResponse(result.data);
        // 로컬 상태 업데이트
        setDiaries(prev =>
          prev.map(diary =>
            diary.id === diaryId ? updatedDiary : diary
          )
        );
        return { success: true, data: updatedDiary };
      }

      return { success: false, error: result.error || '다이어리 수정에 실패했습니다.' };
    } catch (updateError) {
      logError('다이어리 수정 실패', updateError as Error, { diaryId, diaryData, currentNickname });
      return { success: false, error: (updateError as Error).message };
    } finally {
      setLoading(false);
    }
  }, [currentNickname, isLoggedIn]);

  // 다이어리 삭제
  const deleteDiary = useCallback(async (diaryId: string): Promise<ServiceResult<void>> => {
    if (!currentNickname || !isLoggedIn) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    try {
      setLoading(true);

      const result = await deleteDiaryApi(parseInt(diaryId, 10));

      if (result.success) {
        // 로컬 상태 업데이트
        setDiaries(prev => prev.filter(diary => diary.id !== diaryId));
        return { success: true };
      }

      return { success: false, error: result.error || '다이어리 삭제에 실패했습니다.' };
    } catch (deleteError) {
      logError('다이어리 삭제 실패', deleteError as Error, { diaryId, currentNickname });
      return { success: false, error: (deleteError as Error).message };
    } finally {
      setLoading(false);
    }
  }, [currentNickname, isLoggedIn]);

  // 날짜별 다이어리 조회
  const getDiaryByDateLocal = useCallback(async (date: string): Promise<ServiceResult<Diary>> => {
    if (!currentNickname || !isLoggedIn) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    try {
      const result = await getDiaryByDate(date);

      if (result.success && result.data) {
        return { success: true, data: transformDiaryResponse(result.data) };
      }

      return { success: false, error: result.error || '해당 날짜의 다이어리를 찾을 수 없습니다.' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }, [currentNickname, isLoggedIn]);

  return {
    diaries,
    loading,
    error,
    loadDiaries,
    saveDiary,
    updateDiary,
    deleteDiary,
    getDiaryByDate: getDiaryByDateLocal,
  };
};
