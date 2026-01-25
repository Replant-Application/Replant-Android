/**
 * 다이어리 Hook
 * 백엔드 API와 연동하여 다이어리 CRUD 기능 제공
 */

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import { logError } from '../utils/logger';
import { normalizeDate } from '../utils/dateUtils';
import { Diary, UseDiaryReturn, ServiceResult, SimpleDiaryData, Emotion } from '../types';
import {
  getDiaries,
  getDiaryByDate,
  createDiary,
  updateDiary as updateDiaryApi,
  deleteDiary as deleteDiaryApi,
  DiaryResponse,
  DiaryRequest,
} from '../api/diaryApi';

/**
 * 한국어 감정을 영어 Emotion 타입으로 변환
 */
const mapKoreanEmotionToEnglish = (koreanEmotion: string): Emotion => {
  const emotionMap: Record<string, Emotion> = {
    '행복': 'happy',
    '기쁨': 'happy',
    '사랑': 'happy',
    '만족': 'happy',
    '감사': 'grateful',
    '희망': 'happy',
    '평온': 'calm',
    '평화': 'calm',
    '흥분': 'excited',
    '자신감': 'excited',
    '열정': 'excited',
    '용기': 'excited',
    '긍정': 'happy',
    '슬픔': 'sad',
    '우울': 'sad',
    '외로움': 'sad',
    '피곤': 'tired',
    '지루함': 'tired',
    '화남': 'angry',
    '짜증': 'angry',
    '불안': 'anxious',
    '걱정': 'anxious',
    '스트레스': 'anxious',
  };
  return emotionMap[koreanEmotion] || 'happy'; // 기본값은 'happy'
};

/**
 * API 응답을 로컬 Diary 타입으로 변환
 */
const transformDiaryResponse = (response: DiaryResponse): Diary => {
  // emotions 배열에서 첫 번째 감정을 사용하거나, emotion 필드가 있으면 사용
  let emotion: Emotion = 'happy'; // 기본값
  if (response.emotion) {
    emotion = response.emotion;
  } else if (response.emotions && response.emotions.length > 0) {
    // 한국어 감정을 영어로 변환
    emotion = mapKoreanEmotionToEnglish(response.emotions[0]);
  }

  // 날짜 정규화 (배열 형태 처리)
  const normalizedDate = normalizeDate(response.date as any);

  return {
    id: String(response.id),
    diary_id: String(response.id),
    date: normalizedDate,
    emotion,
    content: response.content,
    mood: response.mood,
    emotions: response.emotions,
    emotionFactors: response.emotionFactors,
    weather: response.weather,
    location: response.location,
    photos: response.imageUrls || [],
    is_private: response.isPrivate ?? false,
  };
};

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
          new Date(b.date).getTime() - new Date(a.date).getTime()
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

      // API 스펙에 맞게 데이터 구성
      // emotions 배열의 첫 번째 감정을 emotion 필드로 변환
      const primaryEmotion = diaryData.emotions?.[0]
        ? mapKoreanEmotionToEnglish(diaryData.emotions[0])
        : 'happy';

      const requestData: DiaryRequest = {
        date: diaryData.date,
        emotion: primaryEmotion,
        mood: diaryData.mood ?? 50, // 기본값 50
        emotions: diaryData.emotions ?? [],
        emotionFactors: diaryData.emotionFactors ?? [],
        content: diaryData.content,
      };

      const result = await createDiary(requestData);

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

      // API 스펙에 맞게 데이터 구성
      // emotions 배열의 첫 번째 감정을 emotion 필드로 변환
      const primaryEmotion = diaryData.emotions?.[0]
        ? mapKoreanEmotionToEnglish(diaryData.emotions[0])
        : 'happy';

      const requestData: DiaryRequest = {
        date: diaryData.date,
        emotion: primaryEmotion,
        mood: diaryData.mood ?? 50, // 기본값 50
        emotions: diaryData.emotions ?? [],
        emotionFactors: diaryData.emotionFactors ?? [],
        content: diaryData.content,
      };

      const result = await updateDiaryApi(parseInt(diaryId, 10), requestData);

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
