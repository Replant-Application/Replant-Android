/**
 * 캘린더 관리 Hook
 * 캘린더 이벤트 조회, 추가, 수정, 삭제 기능 제공
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getCalendarEvents,
  addCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '../services/userService';
import { useUser } from '../contexts/UserContext';
import { logError } from '../utils/logger';
import {
  CalendarEvent,
  CalendarEventData,
  UseCalendarReturn,
  ServiceResult,
} from '../types';

export const useCalendar = (): UseCalendarReturn => {
  const { currentNickname } = useUser();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 이벤트 로드
  const loadEvents = useCallback(async (): Promise<void> => {
    if (!currentNickname) return;

    try {
      setLoading(true);
      setError(null);

      const result = await getCalendarEvents(currentNickname);
      
      if (result.success && result.data) {
        setEvents(result.data);
      } else {
        setError(result.error || '이벤트를 불러올 수 없습니다.');
      }
    } catch (loadError) {
      logError('캘린더 이벤트 로드 실패', loadError as Error, { currentNickname });
      setError((loadError as Error).message);
    } finally {
      setLoading(false);
    }
  }, [currentNickname]);

  // 초기 로드
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // 이벤트 추가
  const addEvent = useCallback(async (
    eventData: CalendarEventData
  ): Promise<ServiceResult<CalendarEvent>> => {
    if (!currentNickname) {
      return { success: false, error: '사용자 정보가 없습니다.' };
    }

    try {
      const result = await addCalendarEvent(currentNickname, eventData);
      
      if (result.success && result.data) {
        // 이벤트 목록 다시 로드
        await loadEvents();
      }
      
      return result;
    } catch (addError) {
      logError('이벤트 추가 실패', addError as Error, { currentNickname, eventData });
      return {
        success: false,
        error: (addError as Error).message,
      };
    }
  }, [currentNickname, loadEvents]);

  // 이벤트 수정
  const updateEvent = useCallback(async (
    eventId: string,
    eventData: Partial<CalendarEventData>
  ): Promise<ServiceResult<CalendarEvent>> => {
    if (!currentNickname) {
      return { success: false, error: '사용자 정보가 없습니다.' };
    }

    try {
      const result = await updateCalendarEvent(currentNickname, eventId, eventData);
      
      if (result.success) {
        // 이벤트 목록 다시 로드
        await loadEvents();
      }
      
      return result;
    } catch (updateError) {
      logError('이벤트 수정 실패', updateError as Error, { currentNickname, eventId, eventData });
      return {
        success: false,
        error: (updateError as Error).message,
      };
    }
  }, [currentNickname, loadEvents]);

  // 이벤트 삭제
  const deleteEvent = useCallback(async (
    eventId: string
  ): Promise<ServiceResult<void>> => {
    if (!currentNickname) {
      return { success: false, error: '사용자 정보가 없습니다.' };
    }

    try {
      const result = await deleteCalendarEvent(currentNickname, eventId);
      
      if (result.success) {
        // 이벤트 목록 다시 로드
        await loadEvents();
      }
      
      return result;
    } catch (deleteError) {
      logError('이벤트 삭제 실패', deleteError as Error, { currentNickname, eventId });
      return {
        success: false,
        error: (deleteError as Error).message,
      };
    }
  }, [currentNickname, loadEvents]);

  // 날짜별 이벤트 조회
  const getEventsByDate = useCallback((date: string): CalendarEvent[] => {
    return events.filter(event => event.date === date);
  }, [events]);

  // 메모이제이션된 반환 객체
  return useMemo(() => ({
    events,
    loading,
    error,
    loadEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsByDate,
  }), [
    events,
    loading,
    error,
    loadEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsByDate,
  ]);
};

