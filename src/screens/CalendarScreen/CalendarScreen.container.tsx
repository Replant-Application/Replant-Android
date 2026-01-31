/**
 * CalendarScreen 비즈니스 로직
 * 캘린더 날짜 관리, 월별 미션 로드, 날짜별 미션 그룹화
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getMissionsByRange, getMissionsByDate, UserMission } from '../../api/missionApi';
import { formatDateYYYYMMDD, normalizeDate } from '../../utils/dateUtils';
import { logError } from '../../utils/logger';

interface CalendarScreenContainerProps {
  navigation?: {
    goBack?: () => void;
  };
}

export const useCalendarScreenContainer = ({ navigation: _navigation }: CalendarScreenContainerProps) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(formatDateYYYYMMDD(today));
  
  // 백엔드에서 해당 월의 미션 가져오기 (생성된 날짜 기준)
  const [allMissions, setAllMissions] = useState<UserMission[]>([]);
  const [loadingMissions, setLoadingMissions] = useState(false);

  /**
   * 현재 월의 시작일과 종료일 계산
   */
  const getMonthRange = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = formatDateYYYYMMDD(firstDay);
    const endDate = formatDateYYYYMMDD(lastDay);
    return { startDate, endDate };
  }, [currentYear, currentMonth]);

  /**
   * 월별 미션 로드
   * - getMissionsByRange API 호출
   */
  useEffect(() => {
    const loadMonthMissions = async () => {
      setLoadingMissions(true);
      try {
        const { startDate, endDate } = getMonthRange;
        const result = await getMissionsByRange(startDate, endDate);
        
          if (result.success && result.data) {
            // 배열인지 확인하고 돌발 미션만 제외 (커스텀 미션 포함)
            if (Array.isArray(result.data)) {
              const filteredMissions = result.data.filter(um => {
                if (um.isSpontaneous === true) return false;
                return !!(um.mission || um.customMission);
              });
              setAllMissions(filteredMissions);
          } else {
            setAllMissions([]);
          }
        } else {
          setAllMissions([]);
        }
      } catch (err) {
        logError('미션 로딩 실패', err as Error);
        setAllMissions([]);
      } finally {
        setLoadingMissions(false);
      }
    };
    loadMonthMissions();
  }, [getMonthRange]);

  /**
   * 미션을 생성된 날짜(assignedAt) 기준으로 날짜별로 그룹화
   */
  const missionsByDate = useMemo(() => {
    const grouped: Record<string, UserMission[]> = {};
    
    // 백엔드에서 가져온 모든 미션들을 assignedAt 기준으로 그룹화
    allMissions.forEach(userMission => {
      if (userMission.assignedAt) {
        // 배열 형태 날짜 처리 (normalizeDate 사용)
        const normalizedDate = normalizeDate(userMission.assignedAt as any);
        if (normalizedDate) {
          const date = normalizedDate.split('T')[0];
          if (date) {
            if (!grouped[date]) {
              grouped[date] = [];
            }
            grouped[date].push(userMission);
          }
        }
      }
    });
    
    return grouped;
  }, [allMissions]);

  /**
   * 현재 월의 날짜 배열 생성
   */
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{ date: number; dateString: string | undefined; isCurrentMonth: boolean }> = [];

    // 이전 달의 마지막 날들
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = prevMonthLastDay - i;
      const dateString = formatDateYYYYMMDD(new Date(currentYear, currentMonth - 1, date));
      days.push({ date, dateString, isCurrentMonth: false });
    }

    // 현재 달의 날들
    for (let i = 1; i <= daysInMonth; i++) {
      const dateString = formatDateYYYYMMDD(new Date(currentYear, currentMonth, i));
      days.push({ date: i, dateString, isCurrentMonth: true });
    }

    // 다음 달의 첫 날들 (캘린더를 채우기 위해)
    const remainingDays = 42 - days.length; // 6주 * 7일
    for (let i = 1; i <= remainingDays; i++) {
      const dateString = formatDateYYYYMMDD(new Date(currentYear, currentMonth + 1, i));
      days.push({ date: i, dateString, isCurrentMonth: false });
    }

    return days;
  }, [currentYear, currentMonth]);

  /**
   * 월 이동
   */
  const changeMonth = useCallback((direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  }, [currentMonth, currentYear]);

  /**
   * 날짜 클릭 처리
   * - 특정 날짜의 미션을 새로 불러오기
   * - 선택한 날짜가 현재 월 범위 밖이면 해당 날짜의 미션만 로드
   */
  const handleDatePress = useCallback(async (dateString: string | undefined) => {
    if (!dateString) return;
    setSelectedDate(dateString);
    
    // 선택한 날짜가 현재 월 범위 밖이면 해당 날짜의 미션만 로드
    const selectedDateObj = new Date(dateString + 'T00:00:00');
    const isInCurrentMonth = 
      selectedDateObj.getFullYear() === currentYear &&
      selectedDateObj.getMonth() === currentMonth;
    
    if (!isInCurrentMonth) {
      try {
        const result = await getMissionsByDate(dateString);
        
        if (result.success && result.data && Array.isArray(result.data)) {
          // 해당 날짜의 미션만 추가/업데이트 (돌발 미션 제외, 커스텀 미션 포함)
          const filteredNewMissions = result.data.filter(um => {
            if (um.isSpontaneous === true) return false;
            return !!(um.mission || um.customMission);
          });
          
          setAllMissions(prev => {
            const filtered = prev.filter(m => {
              if (!m.assignedAt) return true; // assignedAt이 없으면 유지
              // 배열 형태 날짜 처리 (normalizeDate 사용)
              const normalizedDate = normalizeDate(m.assignedAt as any);
              if (!normalizedDate) return true;
              const missionDate = normalizedDate.split('T')[0];
              return missionDate !== dateString;
            });
            return [...filtered, ...filteredNewMissions];
          });
        }
      } catch (err) {
        logError('날짜별 미션 로딩 실패', err as Error);
      }
    }
  }, [currentYear, currentMonth]);

  /**
   * 선택된 날짜의 미션
   */
  const selectedDayMissions = useMemo(() => {
    return selectedDate ? missionsByDate[selectedDate] || [] : [];
  }, [selectedDate, missionsByDate]);

  return {
    currentMonth,
    currentYear,
    selectedDate,
    loadingMissions,
    calendarDays,
    missionsByDate,
    selectedDayMissions,
    changeMonth,
    handleDatePress,
  };
};
