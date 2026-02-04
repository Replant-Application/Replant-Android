/**
 * 투두리스트 관련 유틸리티 함수
 */

import { TodoList } from '../types/todolist';
import { normalizeDate } from './dateUtils';

/**
 * 오늘 또는 어제 날짜인 진행중 투두리스트만 필터링 (홈 화면용)
 * @param todoLists - 필터링할 투두리스트 배열
 * @param context - 디버그 로그를 위한 컨텍스트 이름 (선택사항)
 * @returns 오늘 또는 어제 날짜이고 완료되지 않은 투두리스트 배열
 */
export const filterTodayAndYesterdayActiveTodoLists = (
  todoLists: TodoList[],
  context?: string
): TodoList[] => {
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayYear = yesterday.getFullYear();
  const yesterdayMonth = yesterday.getMonth();
  const yesterdayDate = yesterday.getDate();

  const contextPrefix = context ? `[${context}]` : '';
  if (context) {
    console.log(`${contextPrefix} 오늘+어제 필터: 오늘 ${todayYear}-${String(todayMonth + 1).padStart(2, '0')}-${String(todayDate).padStart(2, '0')}, 어제 ${yesterdayYear}-${String(yesterdayMonth + 1).padStart(2, '0')}-${String(yesterdayDate).padStart(2, '0')}`);
  }

  const filtered = todoLists.filter(todoList => {
    if (!todoList.createdAt) return false;
    const normalizedDate = normalizeDate(todoList.createdAt);
    if (!normalizedDate) return false;
    const createdDate = new Date(normalizedDate);
    if (isNaN(createdDate.getTime())) return false;

    const createdYear = createdDate.getFullYear();
    const createdMonth = createdDate.getMonth();
    const createdDay = createdDate.getDate();

    const isToday = createdYear === todayYear && createdMonth === todayMonth && createdDay === todayDate;
    const isYesterday = createdYear === yesterdayYear && createdMonth === yesterdayMonth && createdDay === yesterdayDate;
    const isNotCompleted = todoList.status === 'ACTIVE' && todoList.completedCount < todoList.totalCount;

    return (isToday || isYesterday) && isNotCompleted;
  });

  if (context) {
    console.log(`${contextPrefix} 오늘+어제 진행중 필터 후: ${filtered.length}개`);
  }
  return filtered;
};

/**
 * 날짜가 오늘 또는 어제인지 확인 (createdAt 기준)
 */
export const isTodayOrYesterday = (createdAt: string | number | number[] | undefined): boolean => {
  if (createdAt === undefined || createdAt === null) return false;
  const normalizedDate = normalizeDate(
    typeof createdAt === 'number' ? String(createdAt) : createdAt
  );
  if (!normalizedDate) return false;
  const createdDate = new Date(normalizedDate);
  if (isNaN(createdDate.getTime())) return false;

  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayYear = yesterday.getFullYear();
  const yesterdayMonth = yesterday.getMonth();
  const yesterdayDate = yesterday.getDate();

  const createdYear = createdDate.getFullYear();
  const createdMonth = createdDate.getMonth();
  const createdDay = createdDate.getDate();

  const isToday = createdYear === todayYear && createdMonth === todayMonth && createdDay === todayDate;
  const isYesterday = createdYear === yesterdayYear && createdMonth === yesterdayMonth && createdDay === yesterdayDate;
  return isToday || isYesterday;
};
