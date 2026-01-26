/**
 * TodoListScreen 비즈니스 로직
 * 투두리스트 화면: 투두리스트 목록 조회, 필터링, 상태 관리
 */

import { useState, useEffect, useCallback } from 'react';
import { getActiveTodoLists, getTodoLists, canCreateNewTodoList } from '../../api/todolistApi';
import { TodoList, CanCreateResponse } from '../../types/todolist';
import { SCREEN_NAMES } from '../../utils/constants';
import { filterTodayActiveTodoLists } from '../../utils/todolistUtils';

interface TodoListScreenContainerProps {
  navigation: any;
  route?: any;
}

export const useTodoListScreenContainer = ({ navigation, route }: TodoListScreenContainerProps) => {
  const [activeTodoLists, setActiveTodoLists] = useState<TodoList[]>([]);
  const [completedTodoLists, setCompletedTodoLists] = useState<TodoList[]>([]);
  const [incompleteTodoLists, setIncompleteTodoLists] = useState<TodoList[]>([]);
  const [canCreate, setCanCreate] = useState<CanCreateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'incomplete'>('active');

  /**
   * 데이터 로드
   */
  const loadData = useCallback(async () => {
    try {
      const [activeResult, allResult, canCreateResult] = await Promise.all([
        getActiveTodoLists(),
        getTodoLists(0, 50),
        canCreateNewTodoList(),
      ]);

      console.log('[TodoListScreen] getActiveTodoLists 응답:', JSON.stringify(activeResult, null, 2));

      if (activeResult.success && activeResult.data) {
        console.log('[TodoListScreen] activeResult.data:', activeResult.data);
        console.log('[TodoListScreen] activeResult.data 타입:', Array.isArray(activeResult.data) ? '배열' : typeof activeResult.data);
        const allActiveLists = Array.isArray(activeResult.data) ? activeResult.data : [];

        // 오늘 날짜인 투두리스트만 "진행중"에 표시
        // 과거 날짜의 미완료 투두리스트는 제외
        const todayActiveLists = filterTodayActiveTodoLists(allActiveLists, 'TodoListScreen');

        setActiveTodoLists(todayActiveLists);
      } else {
        console.log('[TodoListScreen] activeResult 실패:', activeResult.error);
      }

      if (allResult.success && allResult.data) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 완료된 투두리스트만 "완료" 탭에 표시
        const completed = allResult.data.content.filter(todo => todo.status === 'COMPLETED' || todo.status === 'ARCHIVED');
        setCompletedTodoLists(completed);

        // 과거 날짜의 미완료 투두리스트는 별도로 분리
        const incomplete = allResult.data.content.filter(todo => {
          if (!todo.createdAt) return false;
          const createdDate = new Date(todo.createdAt);
          createdDate.setHours(0, 0, 0, 0);
          const isPastDate = createdDate.getTime() < today.getTime();
          const isNotCompleted = todo.status === 'ACTIVE' && todo.completedCount < todo.totalCount;

          return isPastDate && isNotCompleted;
        });
        setIncompleteTodoLists(incomplete);
      }

      if (canCreateResult.success && canCreateResult.data) {
        setCanCreate(canCreateResult.data);
      }
    } catch (error) {
      console.error('Failed to load todo lists:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /**
   * 초기 데이터 로드
   */
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * route.params.refresh가 있으면 데이터 새로고침
   */
  useEffect(() => {
    if (route?.params?.refresh) {
      // 백엔드 트랜잭션이 완료될 시간을 주기 위해 약간의 딜레이 추가
      const timer = setTimeout(() => {
        console.log('[TodoListScreen] refresh 플래그 감지, 데이터 새로고침');
        loadData();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [route?.params?.refresh, loadData]);

  /**
   * 새로고침 핸들러
   */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  /**
   * 투두리스트 생성 화면으로 이동
   */
  const handleCreateTodoList = useCallback(() => {
    // canCreate는 항상 true이므로 제한 없이 생성 가능
    navigation.navigate(SCREEN_NAMES.TODO_LIST_CREATE);
  }, [navigation]);

  /**
   * 투두리스트 상세 화면으로 이동
   */
  const handleTodoListPress = useCallback(
    (todoList: TodoList) => {
      navigation.navigate(SCREEN_NAMES.TODO_LIST_DETAIL, { todoListId: todoList.id });
    },
    [navigation]
  );

  /**
   * 현재 탭에 따른 목록 반환
   */
  const currentList = activeTab === 'active' ? activeTodoLists : activeTab === 'completed' ? completedTodoLists : incompleteTodoLists;

  return {
    // Data
    activeTodoLists,
    completedTodoLists,
    incompleteTodoLists,
    canCreate,
    currentList,
    // State
    loading,
    refreshing,
    activeTab,
    // Setters
    setActiveTab,
    // Handlers
    handleCreateTodoList,
    handleTodoListPress,
    onRefresh,
  };
};
