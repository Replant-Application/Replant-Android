/**
 * StatisticsScreen 비즈니스 로직
 * 통계 데이터 계산, 필터링, 날짜 관리
 */

import { useState, useMemo, useCallback } from 'react';
import { useMission } from '../../hooks/useMission';

interface StatisticsScreenContainerProps {
  navigation: any;
}

type TabType = 'monthly' | 'weekly';
type CategoryFilter = 'all' | 'health' | 'selfcare' | 'daily' | 'regular';

export const useStatisticsScreenContainer = ({
  navigation,
}: StatisticsScreenContainerProps) => {
  const { missions } = useMission();
  const [activeTab, setActiveTab] = useState<TabType>('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');

  /**
   * 월 이동
   */
  const changeMonth = useCallback((direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedMonth === 1) {
        setSelectedMonth(12);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 12) {
        setSelectedMonth(1);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  }, [selectedMonth, selectedYear]);

  /**
   * 탭 변경
   */
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  /**
   * 카테고리 변경
   */
  const handleCategoryChange = useCallback((category: CategoryFilter) => {
    setSelectedCategory(category);
  }, []);

  /**
   * 선택된 월의 미션 완료 데이터 계산
   */
  const monthlyStats = useMemo(() => {
    const year = selectedYear;
    const month = selectedMonth;
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // 선택된 월의 시작일과 종료일
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // 카테고리 필터링
    let filteredMissions = missions;
    if (selectedCategory !== 'all') {
      // 카테고리 매핑 (실제 카테고리 ID에 맞게 조정 필요)
      filteredMissions = missions; // 일단 전체 미션 사용
    }

    // 각 미션별로 해당 월의 완료 일자 계산
    const missionStats = filteredMissions.map(mission => {
      const completedDays: number[] = [];
      
      if (mission.completed_at) {
        const completedDate = new Date(mission.completed_at);
        if (completedDate >= startDate && completedDate <= endDate) {
          completedDays.push(completedDate.getDate());
        }
      }

      // 반복 미션의 경우 (매일 완료 가능한 미션)
      // 실제로는 미션 히스토리 데이터가 필요하지만, 여기서는 예시로 처리
      const completionRate = daysInMonth > 0 
        ? Math.round((completedDays.length / daysInMonth) * 100) 
        : 0;

      return {
        mission,
        completedDays,
        completionRate,
        totalDays: daysInMonth,
      };
    });

    // 전체 목표 달성률 계산
    const totalCompletionRate = missionStats.length > 0
      ? Math.round(
          missionStats.reduce((sum, stat) => sum + stat.completionRate, 0) / 
          missionStats.length
        )
      : 0;

    return {
      missionStats,
      totalCompletionRate,
      daysInMonth,
    };
  }, [missions, selectedYear, selectedMonth, selectedCategory]);

  /**
   * 캘린더 그리드 데이터 생성
   * - 완료된 날짜 정보를 기반으로 그리드 데이터 생성
   */
  const generateCalendarGridData = useCallback((completedDays: number[], daysInMonth: number) => {
    const dayColors = ['#FFE066', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181'];
    const gridData: Array<{
      day: number;
      isCompleted: boolean;
      color?: string;
    }> = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const isCompleted = completedDays.includes(day);
      const colorIndex = completedDays.indexOf(day) % dayColors.length;
      gridData.push({
        day,
        isCompleted,
        color: isCompleted ? dayColors[colorIndex] : undefined,
      });
    }

    return gridData;
  }, []);

  return {
    activeTab,
    selectedYear,
    selectedMonth,
    selectedCategory,
    monthlyStats,
    changeMonth,
    handleTabChange,
    handleCategoryChange,
    generateCalendarGridData,
  };
};
