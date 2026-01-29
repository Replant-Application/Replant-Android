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
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  const contextPrefix = context ? `[${context}]` : '';
  
  // 전체 필터링 시작 로그
  if (context) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${contextPrefix} 필터링 시작`);
    console.log(`${contextPrefix} 전체 투두리스트 수: ${todoLists.length}`);
    console.log(`${contextPrefix} 오늘 날짜: ${todayYear}-${String(todayMonth + 1).padStart(2, '0')}-${String(todayDate).padStart(2, '0')}`);
    console.log(`${contextPrefix} 오늘 날짜 (Date 객체):`, today.toISOString());
    console.log(`${'='.repeat(60)}\n`);
  }

  const filtered = todoLists.filter(todoList => {
    // createdAt이 없는 경우
    if (!todoList.createdAt) {
      if (context) {
        console.log(`${contextPrefix} ❌ 투두리스트 ${todoList.id} (${todoList.title}): createdAt 없음`);
      }
      return false;
    }
    
    // 날짜 정규화 (배열 형태 처리)
    const normalizedDate = normalizeDate(todoList.createdAt);
    if (!normalizedDate) {
      if (context) {
        console.log(`${contextPrefix} ❌ 투두리스트 ${todoList.id} (${todoList.title}): 날짜 정규화 실패`, {
          createdAt: todoList.createdAt,
          type: typeof todoList.createdAt,
          isArray: Array.isArray(todoList.createdAt)
        });
      }
      return false;
    }
    
    const createdDate = new Date(normalizedDate);
    if (isNaN(createdDate.getTime())) {
      if (context) {
        console.warn(`${contextPrefix} ❌ 투두리스트 ${todoList.id} (${todoList.title}): 잘못된 날짜 형식`, {
          createdAt: todoList.createdAt,
          normalizedDate
        });
      }
      return false;
    }

    // 년/월/일 단위로 비교 (타임존 문제 방지)
    const createdYear = createdDate.getFullYear();
    const createdMonth = createdDate.getMonth();
    const createdDay = createdDate.getDate();

    // 오늘 날짜이고 완료되지 않은 투두리스트만
    const isToday = createdYear === todayYear && 
                    createdMonth === todayMonth && 
                    createdDay === todayDate;
    const isNotCompleted = todoList.status === 'ACTIVE' && todoList.completedCount < todoList.totalCount;

    // 상세 디버그 로그
    if (context) {
      const matchStatus = isToday && isNotCompleted ? '✅ 통과' : '❌ 제외';
      console.log(`${contextPrefix} ${matchStatus} 투두리스트 ${todoList.id}:`, {
        title: todoList.title,
        createdAt_원본: todoList.createdAt,
        createdAt_타입: typeof todoList.createdAt,
        createdAt_배열여부: Array.isArray(todoList.createdAt),
        normalizedDate,
        createdDate_ISO: createdDate.toISOString(),
        createdDate_로컬: createdDate.toLocaleString('ko-KR'),
        createdYear,
        createdMonth: `${createdMonth + 1}월`,
        createdDay,
        todayYear,
        todayMonth: `${todayMonth + 1}월`,
        todayDate,
        isToday: isToday ? '✅ 오늘' : '❌ 오늘 아님',
        status: todoList.status,
        completedCount: todoList.completedCount,
        totalCount: todoList.totalCount,
        isNotCompleted: isNotCompleted ? '✅ 미완료' : '❌ 완료됨',
        최종결과: isToday && isNotCompleted ? '✅ 포함' : '❌ 제외'
      });
    }

    return isToday && isNotCompleted;
  });

  // 필터링 결과 요약
  if (context) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${contextPrefix} 필터링 완료`);
    console.log(`${contextPrefix} 필터링 전: ${todoLists.length}개`);
    console.log(`${contextPrefix} 필터링 후: ${filtered.length}개`);
    console.log(`${contextPrefix} 제외된 항목: ${todoLists.length - filtered.length}개`);
    if (filtered.length > 0) {
      console.log(`${contextPrefix} 포함된 투두리스트:`, filtered.map(tl => `ID:${tl.id} "${tl.title}"`).join(', '));
    }
    console.log(`${'='.repeat(60)}\n`);
  }

  return filtered;
};
