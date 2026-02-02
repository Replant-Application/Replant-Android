/**
 * TodoListScreen 비즈니스 로직
 * 투두리스트 화면: 투두리스트 목록 조회, 필터링, 상태 관리
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { getActiveTodoLists, getTodoLists, canCreateNewTodoList, deleteMissionSet } from '../../api/todolistApi';
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
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [todoListToDelete, setTodoListToDelete] = useState<TodoList | null>(null);

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

      if (activeResult.success && activeResult.data) {
        const allActiveLists = Array.isArray(activeResult.data) ? activeResult.data : [];

        // 오늘 날짜인 투두리스트만 "진행중"에 표시
        // 과거 날짜의 미완료 투두리스트는 제외
        const todayActiveLists = filterTodayActiveTodoLists(allActiveLists, 'TodoListScreen');

        setActiveTodoLists(todayActiveLists);
      } else {
        console.error('[TodoListScreen] activeResult 실패:', activeResult.error);
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
   * route.params.activeTab이 있으면 해당 탭으로 복원
   */
  useEffect(() => {
    if (route?.params?.refresh) {
      // 백엔드 트랜잭션이 완료될 시간을 주기 위해 약간의 딜레이 추가
      const timer = setTimeout(() => {
        loadData();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [route?.params?.refresh, loadData]);

  /**
   * route.params.activeTab이 있으면 해당 탭으로 복원
   */
  useEffect(() => {
    if (route?.params?.activeTab) {
      const tab = route.params.activeTab as 'active' | 'completed' | 'incomplete';
      if (tab === 'active' || tab === 'completed' || tab === 'incomplete') {
        console.log('[TodoListScreen] activeTab 복원:', tab);
        setActiveTab(tab);
      }
    }
  }, [route?.params?.activeTab]);

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
      navigation.navigate(SCREEN_NAMES.TODO_LIST_DETAIL, { 
        todoListId: todoList.id,
        activeTab: activeTab, // 현재 활성화된 탭 전달
      });
    },
    [navigation, activeTab]
  );

  /**
   * 투두리스트 삭제 확인 모달 열기 (⋯ 메뉴에서 호출)
   */
  const handleDeleteTodoList = useCallback((todoList: TodoList) => {
    setTodoListToDelete(todoList);
    setShowDeleteConfirmModal(true);
  }, []);

  /**
   * 삭제 확인 모달: 삭제 실행
   */
  const handleDeleteConfirm = useCallback(async () => {
    if (!todoListToDelete) return;
    setShowDeleteConfirmModal(false);
    const target = todoListToDelete;
    setTodoListToDelete(null);
    const result = await deleteMissionSet(target.id);
    if (result.success) {
      loadData();
    } else {
      Alert.alert('오류', result.error || '삭제에 실패했습니다.');
    }
  }, [todoListToDelete, loadData]);

  /**
   * 삭제 확인 모달: 취소
   */
  const handleDeleteConfirmCancel = useCallback(() => {
    setShowDeleteConfirmModal(false);
    setTodoListToDelete(null);
  }, []);

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
    handleDeleteTodoList,
    showDeleteConfirmModal,
    handleDeleteConfirm,
    handleDeleteConfirmCancel,
    onRefresh,
  };
};
