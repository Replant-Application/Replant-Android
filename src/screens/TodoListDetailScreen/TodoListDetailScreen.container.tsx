/**
 * TodoListDetailScreen 비즈니스 로직
 * 투두리스트 상세 화면: 미션 완료, 투두리스트 보관, 진행률 관리
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import * as Location from 'expo-location';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { SCREEN_NAMES } from '../../utils/constants';
import { getTodoListDetail, completeTodoMission, archiveTodoList, canCreateNewTodoList, updateMissionSet } from '../../api/todolistApi';
import { TodoList, TodoMission } from '../../types/todolist';
import { useUser } from '../../contexts/UserContext';
import {
  getVerifications,
  getUserMissions,
  addSystemMissionToMyMissions,
  verifyByGps,
  verifyByTime,
} from '../../api/missionApi';

interface TodoListDetailScreenContainerProps {
  navigation: any;
  route: {
    params: {
      todoListId: number | string;
    };
  };
}

export const useTodoListDetailScreenContainer = ({ navigation, route }: TodoListDetailScreenContainerProps) => {
  const { todoListId } = route.params;
  const { currentUserId } = useUser();

  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const handleCloseAlert = useCallback(() => setShowAlert(false), []);

  const [showArchiveConfirmModal, setShowArchiveConfirmModal] = useState(false);

  const errorHandlerOverrides = useMemo(
    () => ({
      onShowError: (t: string, m: string) => {
        setAlertTitle(t);
        setAlertMessage(m);
        setShowAlert(true);
      },
      onShowSuccess: (t: string, m: string) => {
        setAlertTitle(t);
        setAlertMessage(m);
        setShowAlert(true);
      },
      onShowInfo: (t: string, m: string) => {
        setAlertTitle(t);
        setAlertMessage(m);
        setShowAlert(true);
      },
    }),
    []
  );
  const { showError, showSuccess, showInfo, handleApiError } = useErrorHandler(errorHandlerOverrides);

  const [todoList, setTodoList] = useState<TodoList | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completingMissionId, setCompletingMissionId] = useState<number | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [canCreate, setCanCreate] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [hasShownCompleteModal, setHasShownCompleteModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

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
    const id =
      todoListId != null && todoListId !== '' && String(todoListId) !== 'undefined' ? Number(todoListId) : NaN;
    if (Number.isNaN(id) || id <= 0) {
      console.warn('[TodoListDetailScreen] loadData: 유효하지 않은 todoListId', todoListId);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const [detailResult, canCreateResult] = await Promise.all([getTodoListDetail(id), canCreateNewTodoList()]);

      if (detailResult.success && detailResult.data) {
        const todoList = detailResult.data;
        // 디버깅: isVerified 필드 확인
        if (todoList.missions) {
          todoList.missions.forEach((mission, index) => {
            console.log(`[TodoListDetailScreen] 미션 ${index + 1}:`, {
              title: mission.title,
              missionType: mission.missionType,
              isCompleted: mission.isCompleted,
              isVerified: (mission as any).isVerified,
            });
          });
        }
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
              const refreshResult = await getTodoListDetail(id);
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
   * user_mission_id 확보: getUserMissions에서 검색, 없으면 addSystemMissionToMyMissions
   */
  const getOrAssignUserMissionId = useCallback(async (missionId: number): Promise<number | null> => {
    const listRes = await getUserMissions({ status: 'ASSIGNED', missionType: 'SYSTEM', size: 100 });
    if (listRes.success && listRes.data?.content) {
      const found = listRes.data.content.find(um => um.mission?.id === missionId);
      if (found) return found.id;
    }
    const assignRes = await addSystemMissionToMyMissions({ missionId });
    if (assignRes.success && assignRes.data) return assignRes.data.id;
    return null;
  }, []);

  /**
   * 미션 완료 처리
   * - 공식 미션: 인증 플로우(COMMUNITY→VerificationPostCreate, GPS/TIME→verify API)로 이동 후, GPS/TIME 성공 시 completeTodoMission
   * - 커스텀 미션: 즉시 completeTodoMission
   */
  const handleCompleteMission = useCallback(
    async (mission: TodoMission) => {
      const isRequiredMission = mission.missionType === 'OFFICIAL' || mission.missionSource === 'RANDOM_OFFICIAL';

      if (isRequiredMission) {
        setCompletingMissionId(mission.missionId);
        try {
          const userMissionId = await getOrAssignUserMissionId(mission.missionId);
          if (!userMissionId) {
            showError(new Error('미션을 시작할 수 없습니다. 잠시 후 다시 시도해주세요.'), 'TodoListDetailScreen.handleCompleteMission');
            return;
          }

          const vt = (mission.verificationType || '').toUpperCase();
          if (vt === 'COMMUNITY') {
            navigation.navigate(SCREEN_NAMES.VERIFICATION_POST_CREATE as any, {
              userMissionId,
              missionId: String(mission.missionId),
              missionTitle: mission.title || '미션',
              missionEmoji: '🎯',
              photoUrl: undefined,
              todoListId: Number(todoListId), // 투두리스트 ID 전달
            });
            return;
          }
          if (vt === 'GPS') {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
              showInfo('위치 권한이 필요합니다.', '권한 필요');
              return;
            }
            const location = await Location.getCurrentPositionAsync({});
            const result = await verifyByGps(userMissionId, location.coords.latitude, location.coords.longitude);
            if (result.success) {
              showSuccess(`+${result.data?.expReward || 50} EXP를 획득했습니다!`, 'GPS 인증 완료');
              const completeRes = await completeTodoMission(Number(todoListId), mission.missionId);
              if (completeRes.success && completeRes.data) {
                setTodoList(completeRes.data);
                checkAndShowCompleteModal(completeRes.data);
              } else if (!completeRes.success) {
                handleApiError(completeRes, 'TodoListDetailScreen.handleCompleteMission.GPS.complete');
              }
              const canCreateResult = await canCreateNewTodoList();
              if (canCreateResult.success && canCreateResult.data) setCanCreate(canCreateResult.data.canCreate);
            } else {
              handleApiError(result, 'TodoListDetailScreen.handleCompleteMission.GPS');
            }
            return;
          }
          if (vt === 'TIME') {
            const result = await verifyByTime(userMissionId);
            if (result.success) {
              showSuccess(`+${result.data?.expReward || 50} EXP를 획득했습니다!`, '시간 인증 완료');
              const completeRes = await completeTodoMission(Number(todoListId), mission.missionId);
              if (completeRes.success && completeRes.data) {
                setTodoList(completeRes.data);
                checkAndShowCompleteModal(completeRes.data);
              } else if (!completeRes.success) {
                handleApiError(completeRes, 'TodoListDetailScreen.handleCompleteMission.TIME.complete');
              }
              const canCreateResult = await canCreateNewTodoList();
              if (canCreateResult.success && canCreateResult.data) setCanCreate(canCreateResult.data.canCreate);
            } else {
              handleApiError(result, 'TodoListDetailScreen.handleCompleteMission.TIME');
            }
            return;
          }
          showError(new Error('지원하지 않는 인증 방식입니다.'), 'TodoListDetailScreen.handleCompleteMission');
        } catch (error) {
          showError(
            error instanceof Error ? error : new Error('인증을 시작하는 중 문제가 발생했습니다.'),
            'TodoListDetailScreen.handleCompleteMission'
          );
        } finally {
          setCompletingMissionId(null);
        }
        return;
      }

      // 커스텀 미션은 바로 완료 처리
      setCompletingMissionId(mission.missionId);
      try {
        const result = await completeTodoMission(Number(todoListId), mission.missionId);
        if (result.success && result.data) {
          const updatedTodoList = result.data;
          setTodoList(updatedTodoList);
          checkAndShowCompleteModal(updatedTodoList);
          const canCreateResult = await canCreateNewTodoList();
          if (canCreateResult.success && canCreateResult.data) setCanCreate(canCreateResult.data.canCreate);
        } else {
          handleApiError(result, 'TodoListDetailScreen.handleCompleteMission');
        }
      } catch (error) {
        showError(error instanceof Error ? error : new Error('미션 완료에 실패했습니다.'), 'TodoListDetailScreen.handleCompleteMission');
      } finally {
        setCompletingMissionId(null);
      }
    },
    [
      todoListId,
      navigation,
      getOrAssignUserMissionId,
      checkAndShowCompleteModal,
      handleApiError,
      showError,
      showSuccess,
      showInfo,
    ]
  );

  /**
   * 투두리스트 보관 확인 모달 열기
   */
  const handleArchive = useCallback(() => {
    setShowArchiveConfirmModal(true);
  }, []);

  /**
   * 보관 확인 모달: 보관 실행
   */
  const handleArchiveConfirm = useCallback(async () => {
    setShowArchiveConfirmModal(false);
    setArchiving(true);
    try {
      const result = await archiveTodoList(Number(todoListId));
      if (result.success) {
        showSuccess('투두리스트가 보관되었습니다.');
        navigation.goBack();
      } else {
        handleApiError(result, 'TodoListDetailScreen.handleArchiveConfirm');
      }
    } catch (error) {
      showError(error instanceof Error ? error : new Error('보관에 실패했습니다.'), 'TodoListDetailScreen.handleArchiveConfirm');
    } finally {
      setArchiving(false);
    }
  }, [todoListId, navigation, handleApiError, showError, showSuccess]);

  /**
   * 보관 확인 모달: 취소
   */
  const handleArchiveConfirmCancel = useCallback(() => {
    setShowArchiveConfirmModal(false);
  }, []);

  /**
   * 투두리스트 삭제 확인 모달 열기
   */
  const handleDelete = useCallback(() => {
    setShowDeleteConfirmModal(true);
  }, []);

  /**
   * 공유 해제 확인 모달: 공유 해제 실행 (isPublic을 false로 변경)
   */
  const handleDeleteConfirm = useCallback(async () => {
    if (!todoList) return;
    
    setShowDeleteConfirmModal(false);
    setDeleting(true);
    try {
      // isPublic만 false로 변경 (title, description은 그대로 유지)
      const result = await updateMissionSet(Number(todoListId), {
        title: todoList.title,
        description: todoList.description || undefined,
        isPublic: false,
      });
      if (result.success && result.data) {
        showSuccess('커뮤니티 공유 게시판에서 제거되었습니다.');
        // 투두리스트 정보 업데이트
        loadData();
      } else {
        handleApiError(result, 'TodoListDetailScreen.handleDeleteConfirm');
      }
    } catch (error) {
      showError(error instanceof Error ? error : new Error('공유 해제에 실패했습니다.'), 'TodoListDetailScreen.handleDeleteConfirm');
    } finally {
      setDeleting(false);
    }
  }, [todoListId, todoList, loadData, handleApiError, showError, showSuccess]);

  /**
   * 삭제 확인 모달: 취소
   */
  const handleDeleteConfirmCancel = useCallback(() => {
    setShowDeleteConfirmModal(false);
  }, []);

  /**
   * 본인이 만든 투두리스트인지 확인
   */
  const isOwner = useMemo(() => {
    return todoList && currentUserId && todoList.creatorId === currentUserId;
  }, [todoList, currentUserId]);

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
    deleting,
    isOwner,
    showCompleteModal,
    showAlert,
    alertTitle,
    alertMessage,
    handleCloseAlert,
    showArchiveConfirmModal,
    handleArchiveConfirm,
    handleArchiveConfirmCancel,
    showDeleteConfirmModal,
    handleDelete,
    handleDeleteConfirm,
    handleDeleteConfirmCancel,
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
