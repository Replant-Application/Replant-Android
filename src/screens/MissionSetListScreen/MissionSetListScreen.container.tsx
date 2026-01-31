/**
 * MissionSetListScreen 비즈니스 로직
 * 공개 투두리스트 목록 로드, 검색, 공유 처리
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  getPublicTodoLists,
  searchPublicTodoLists,
  getShareableTodoLists,
  shareTodoList,
  getCompletedTodoLists
} from '../../api/todolistApi';
import { PublicTodoList, TodoList } from '../../types/todolist';
import { logError } from '../../utils/logger';

interface MissionSetListScreenContainerProps {
  navigation: any;
}

export const useMissionSetListScreenContainer = ({
  navigation: _navigation,
}: MissionSetListScreenContainerProps) => {
  const [publicTodoLists, setPublicTodoLists] = useState<PublicTodoList[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // 공유 모달 관련 상태
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [myTodoLists, setMyTodoLists] = useState<TodoList[]>([]);
  const [loadingMyTodoLists, setLoadingMyTodoLists] = useState(false);

  /**
   * 검색어 디바운싱 (300ms)
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  /**
   * 공개 투두리스트 목록 로딩
   * - 검색어가 있으면 searchPublicTodoLists 호출
   * - 없으면 getPublicTodoLists 호출
   */
  const loadPublicTodoLists = useCallback(async () => {
    try {
      let result;
      if (debouncedSearchQuery.trim()) {
        result = await searchPublicTodoLists(debouncedSearchQuery, 0, 50);
      } else {
        result = await getPublicTodoLists(0, 50);
      }

      if (result.success && result.data) {
        setPublicTodoLists(result.data.content);
      }
    } catch (error) {
      logError('공개 투두리스트 로딩 실패', error as Error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery]);

  useEffect(() => {
    loadPublicTodoLists();
  }, [loadPublicTodoLists]);

  /**
   * Pull-to-Refresh
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPublicTodoLists();
    setRefreshing(false);
  }, [loadPublicTodoLists]);

  /**
   * 검색어 변경 핸들러
   */
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  /**
   * 공유 모달 열기 - 내 투두리스트 로드 (완료된 투두리스트 포함)
   */
  const openShareModal = useCallback(async () => {
    setShareModalVisible(true);
    setLoadingMyTodoLists(true);
    try {
      // 공유 가능한 투두리스트와 완료된 투두리스트를 모두 가져와서 합치기
      const [shareableResult, completedResult] = await Promise.all([
        getShareableTodoLists(),
        getCompletedTodoLists(0, 100)
      ]);

      const allTodoLists: TodoList[] = [];
      
      // 공유 가능한 투두리스트 추가
      if (shareableResult.success && shareableResult.data) {
        allTodoLists.push(...shareableResult.data);
      }
      
      // 완료된 투두리스트 추가 (중복 제거)
      if (completedResult.success && completedResult.data) {
        const existingIds = new Set(allTodoLists.map(tl => tl.id));
        completedResult.data.content.forEach(todoList => {
          if (!existingIds.has(todoList.id)) {
            allTodoLists.push(todoList);
          }
        });
      }

      setMyTodoLists(allTodoLists);
    } catch (error) {
      logError('내 투두리스트 로딩 실패', error as Error);
    } finally {
      setLoadingMyTodoLists(false);
    }
  }, []);

  /**
   * 공유 모달 닫기
   */
  const closeShareModal = useCallback(() => {
    setShareModalVisible(false);
  }, []);

  /**
   * 투두리스트 공유하기 (공개로 변경)
   * - 확인 Alert 표시
   * - shareTodoList API 호출
   * - 성공/실패 Alert 표시
   * - 목록 새로고침
   */
  const handleShare = useCallback(async (todoList: TodoList) => {
    Alert.alert(
      '공유 확인',
      `"${todoList.title}" 투두리스트를 공유하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '공유',
          onPress: async () => {
            try {
              const result = await shareTodoList(todoList.id);
              if (result.success) {
                Alert.alert('공유 완료', `"${todoList.title}" 투두리스트가 공유되었습니다.`);
                setShareModalVisible(false);
                // 목록 새로고침
                loadPublicTodoLists();
              } else {
                Alert.alert('공유 실패', result.error || '공유에 실패했습니다.');
              }
            } catch (error) {
              logError('투두리스트 공유 실패', error as Error);
              Alert.alert('오류', '공유 중 문제가 발생했습니다.');
            }
          },
        },
      ]
    );
  }, [loadPublicTodoLists]);

  return {
    publicTodoLists,
    loading,
    refreshing,
    searchQuery,
    shareModalVisible,
    myTodoLists,
    loadingMyTodoLists,
    handleSearchChange,
    onRefresh,
    openShareModal,
    closeShareModal,
    handleShare,
  };
};
