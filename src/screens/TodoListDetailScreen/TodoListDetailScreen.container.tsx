/**
 * TodoListDetailScreen 비즈니스 로직
 * 투두리스트 상세 화면: 미션 완료, 투두리스트 보관, 진행률 관리
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { SCREEN_NAMES } from '../../utils/constants';
import { getTodoListDetail, completeTodoMission, archiveTodoList, canCreateNewTodoList } from '../../api/todolistApi';
import { TodoList, TodoMission } from '../../types/todolist';
import { getVerifications } from '../../api/missionApi';

interface TodoListDetailScreenContainerProps {
  navigation: any;
  route: {
    params: {
      todoListId: number;
    };
  };
}

export const useTodoListDetailScreenContainer = ({ navigation, route }: TodoListDetailScreenContainerProps) => {
  const { todoListId } = route.params;
  const { showError, showSuccess, handleApiError } = useErrorHandler();

  const [todoList, setTodoList] = useState<TodoList | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completingMissionId, setCompletingMissionId] = useState<number | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [canCreate, setCanCreate] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [hasShownCompleteModal, setHasShownCompleteModal] = useState(false);

  /**
   * 모든 미션이 완료되었는지 확인
   */
  const checkAllMissionsCompleted = useCallback((todoList: TodoList): boolean => {
    return todoList.missions ? todoList.missions.every(mission => mission.isCompleted) : todoList.completedCount > 0 && todoList.completedCount === todoList.totalCount;
  }, []);

  /**
   * 투두리스트가 오늘 생성되었는지 확인
   */
  const checkIsTodayCreated = useCallback((todoList: TodoList): boolean => {
    if (!todoList.createdAt) return false;
    const createdDate = new Date(todoList.createdAt);
    const today = new Date();
    return (
      createdDate.getFullYear() === today.getFullYear() &&
      createdDate.getMonth() === today.getMonth() &&
      createdDate.getDate() === today.getDate()
    );
  }, []);

  /**
   * 완료 모달 표시 여부 확인 및 설정
   */
  const checkAndShowCompleteModal = useCallback(
    (todoList: TodoList) => {
      const allMissionsCompleted = checkAllMissionsCompleted(todoList);
      const isTodayCreated = checkIsTodayCreated(todoList);

      if (allMissionsCompleted && isTodayCreated && !hasShownCompleteModal) {
        setShowCompleteModal(true);
        setHasShownCompleteModal(true);
      }
    },
    [checkAllMissionsCompleted, checkIsTodayCreated, hasShownCompleteModal]
  );

  /**
   * 데이터 로드
   */
  const loadData = useCallback(async () => {
    try {
      const [detailResult, canCreateResult] = await Promise.all([getTodoListDetail(todoListId), canCreateNewTodoList()]);

      if (detailResult.success && detailResult.data) {
        const todoList = detailResult.data;
        setTodoList(todoList);

        // 완료 모달 표시 확인
        checkAndShowCompleteModal(todoList);

        // 필수 미션 중 인증 완료되었지만 아직 투두리스트에서 완료되지 않은 미션 확인
        if (todoList.missions) {
          const incompleteRequiredMissions = todoList.missions.filter(
            mission => (mission.missionType === 'OFFICIAL' || mission.missionSource === 'RANDOM_OFFICIAL') && !mission.isCompleted
          );

          let hasVerifiedMission = false;
          for (const mission of incompleteRequiredMissions) {
            try {
              // 해당 미션의 인증 완료 상태 확인
              const verificationResult = await getVerifications({
                missionId: mission.missionId,
                status: 'APPROVED',
                page: 0,
                size: 1,
              });

              if (verificationResult.success && verificationResult.data && verificationResult.data.content && verificationResult.data.content.length > 0) {
                console.log('[TodoListDetailScreen] 인증 완료된 미션 발견:', {
                  missionId: mission.missionId,
                  missionTitle: mission.title,
                });
                hasVerifiedMission = true;
              }
            } catch (error) {
              console.error('[TodoListDetailScreen] 미션 인증 상태 확인 중 오류:', error);
            }
          }

          // 인증 완료된 미션이 있으면 투두리스트를 다시 조회하여 최신 상태 반영
          if (hasVerifiedMission) {
            console.log('[TodoListDetailScreen] 인증 완료된 미션이 있으므로 투두리스트 재조회');
            setTimeout(async () => {
              const refreshResult = await getTodoListDetail(todoListId);
              if (refreshResult.success && refreshResult.data) {
                const refreshedTodoList = refreshResult.data;
                setTodoList(refreshedTodoList);
                console.log('[TodoListDetailScreen] 투두리스트 최신 상태 반영 완료');

                // 완료 모달 표시 확인
                checkAndShowCompleteModal(refreshedTodoList);
              }
            }, 500); // 백엔드 처리 시간을 고려하여 약간의 지연
          }
        }
      } else {
        console.error('[TodoListDetailScreen] 투두리스트 상세 조회 실패:', detailResult.error);
        // 500 에러인 경우 사용자에게 알림
        if (detailResult.error?.includes('서버 오류') || detailResult.error?.includes('500')) {
          showError(new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'), 'TodoListDetailScreen.loadData');
        }
      }

      if (canCreateResult.success && canCreateResult.data) {
        setCanCreate(canCreateResult.data.canCreate);
      }
    } catch (error) {
      console.error('[TodoListDetailScreen] Failed to load todo list detail:', error);
      showError(error instanceof Error ? error : new Error('투두리스트를 불러오는 중 오류가 발생했습니다.'), 'TodoListDetailScreen.loadData');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [todoListId, checkAndShowCompleteModal, showError]);

  /**
   * 초기 데이터 로드
   */
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * 화면 포커스 시 최신 상태 다시 조회
   */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });

    return unsubscribe;
  }, [navigation, loadData]);

  /**
   * 새로고침 핸들러
   */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  /**
   * 미션 완료 처리
   */
  const handleCompleteMission = useCallback(
    async (mission: TodoMission) => {
      // 필수 미션(공식 미션)은 인증이 필요함
      const isRequiredMission = mission.missionType === 'OFFICIAL' || mission.missionSource === 'RANDOM_OFFICIAL';

      if (isRequiredMission) {
        // 필수 미션은 인증 화면으로 이동
        navigation.navigate(SCREEN_NAMES.MISSION_DETAIL as any, {
          missionId: mission.missionId.toString(),
        });
        return;
      }

      // 커스텀 미션은 바로 완료 처리
      setCompletingMissionId(mission.missionId);
      try {
        const result = await completeTodoMission(todoListId, mission.missionId);
        if (result.success && result.data) {
          const updatedTodoList = result.data;
          setTodoList(updatedTodoList);

          // 완료 모달 표시 확인
          checkAndShowCompleteModal(updatedTodoList);

          const canCreateResult = await canCreateNewTodoList();
          if (canCreateResult.success && canCreateResult.data) {
            setCanCreate(canCreateResult.data.canCreate);
          }
        } else {
          handleApiError(result, 'TodoListDetailScreen.handleCompleteMission');
        }
      } catch (error) {
        showError(error instanceof Error ? error : new Error('미션 완료에 실패했습니다.'), 'TodoListDetailScreen.handleCompleteMission');
      } finally {
        setCompletingMissionId(null);
      }
    },
    [todoListId, navigation, checkAndShowCompleteModal, handleApiError, showError]
  );

  /**
   * 투두리스트 보관
   */
  const handleArchive = useCallback(async () => {
    Alert.alert(
      '투두리스트 보관',
      '이 투두리스트를 보관하시겠습니까?\n보관된 투두리스트는 더 이상 수정할 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '보관',
          onPress: async () => {
            setArchiving(true);
            try {
              const result = await archiveTodoList(todoListId);
              if (result.success) {
                showSuccess('투두리스트가 보관되었습니다.');
                navigation.goBack();
              } else {
                handleApiError(result, 'TodoListDetailScreen.handleArchive');
              }
            } catch (error) {
              showError(error instanceof Error ? error : new Error('보관에 실패했습니다.'), 'TodoListDetailScreen.handleArchive');
            } finally {
              setArchiving(false);
            }
          },
        },
      ]
    );
  }, [todoListId, navigation, handleApiError, showError, showSuccess]);

  /**
   * 새 투두리스트 생성 화면으로 이동
   */
  const handleCreateNew = useCallback(() => {
    navigation.navigate(SCREEN_NAMES.TODO_LIST_CREATE);
  }, [navigation]);

  /**
   * 완료 모달 닫기
   */
  const handleCompleteModalClose = useCallback(() => {
    setShowCompleteModal(false);
  }, []);

  /**
   * 진행률 계산
   */
  const progressData = useMemo(() => {
    if (!todoList) return { actualCompletedCount: 0, actualTotalCount: 0, progressPercent: 0 };

    const actualCompletedCount = todoList.missions ? todoList.missions.filter(mission => mission.isCompleted).length : todoList.completedCount;
    const actualTotalCount = todoList.missions ? todoList.missions.length : todoList.totalCount;
    const progressPercent = actualTotalCount > 0 ? Math.round((actualCompletedCount / actualTotalCount) * 100) : 0;

    return { actualCompletedCount, actualTotalCount, progressPercent };
  }, [todoList]);

  return {
    // Data
    todoList,
    canCreate,
    // State
    loading,
    refreshing,
    completingMissionId,
    archiving,
    showCompleteModal,
    // Progress
    ...progressData,
    // Handlers
    handleCompleteMission,
    handleArchive,
    handleCreateNew,
    handleCompleteModalClose,
    onRefresh,
  };
};
