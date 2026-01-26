/**
 * 투두리스트 관련 유틸리티 함수
 */

import { TodoList } from '../types/todolist';
import { normalizeDate } from './dateUtils';

/**
 * 오늘 날짜인 진행중 투두리스트만 필터링
 * 
 * @param todoLists - 필터링할 투두리스트 배열
 * @param context - 디버그 로그를 위한 컨텍스트 이름 (선택사항)
 * @returns 오늘 날짜이고 완료되지 않은 투두리스트 배열
 * 
 * @example
 * const activeTodoLists = filterTodayActiveTodoLists(allTodoLists, 'HomeScreen');
 */
export const filterTodayActiveTodoLists = (
  todoLists: TodoList[],
  context?: string
): TodoList[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return todoLists.filter(todoList => {
    if (!todoList.createdAt) return false;
    
    // 날짜 정규화 (배열 형태 처리)
    const normalizedDate = normalizeDate(todoList.createdAt);
    if (!normalizedDate) return false;
    
    const createdDate = new Date(normalizedDate);
    if (isNaN(createdDate.getTime())) {
      const contextPrefix = context ? `[${context}]` : '';
      console.warn(`${contextPrefix} 잘못된 날짜 형식:`, todoList.createdAt);
      return false;
    }
    createdDate.setHours(0, 0, 0, 0);

    // 오늘 날짜이고 완료되지 않은 투두리스트만
    const isToday = createdDate.getTime() === today.getTime();
    const isNotCompleted = todoList.status === 'ACTIVE' && todoList.completedCount < todoList.totalCount;

    // 디버그 로그 (context가 제공된 경우에만)
    if (context) {
      console.log(`[${context}] 투두리스트 ${todoList.id} 필터링:`, {
        title: todoList.title,
        createdAt: todoList.createdAt,
        normalizedDate,
        createdDate: createdDate.toISOString(),
        isToday,
        isNotCompleted,
        matches: isToday && isNotCompleted
      });
    }

    return isToday && isNotCompleted;
  });
};
