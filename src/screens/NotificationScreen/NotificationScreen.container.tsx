/**
 * NotificationScreen 비즈니스 로직
 * 알림 목록 로드, 필터링, 읽음/삭제 처리, SSE 연동
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification,
  type Notification as NotificationType
} from '../../api/notificationApi';
import { getUserMission, getCurrentSpontaneousMissions, getCurrentWakeupMission } from '../../api/missionApi';
import { getMealLogDetail } from '../../api/mealLogApi';
import { SCREEN_NAMES } from '../../utils/constants';
import { useSse } from '../../contexts/SseContext';
import { removeDuplicates } from '../../utils/arrayUtils';
import { sortByDate } from '../../utils/dateUtils';
import { useOverlay } from '../../contexts/OverlayContext';

interface NotificationScreenContainerProps {
  navigation: any;
}

export const useNotificationScreenContainer = ({
  navigation,
}: NotificationScreenContainerProps) => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  // AlertModal 상태
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // AlertModal 표시 함수
  const showAlertModal = useCallback((title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlert(true);
  }, []);

  // AlertModal 닫기
  const handleAlertClose = useCallback(() => {
    setShowAlert(false);
  }, []);
  
  // Context
  const sseContext = useSse();
  const overlayContext = useOverlay();
  
  const lastNotification = sseContext?.lastNotification || null;
  const lastNotificationIdRef = useRef<any>(null);

  // navigation 안전 처리
  const safeNavigation = useMemo(
    () => navigation || { navigate: () => {}, goBack: () => {} } as any,
    [navigation]
  );

  /**
   * 알림 목록 조회
   * - getNotifications API 호출
   * - 중복 제거 및 정렬
   * - 읽지 않은 알림 개수 업데이트
   */
  const fetchNotifications = useCallback(async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log('[NotificationScreen] 알림 목록 조회 시작, filter:', filter);
      const result = await getNotifications({ isRead: filter === 'unread' ? false : undefined });
      
      if (result.success && result.data) {
        // 서버에서 받은 읽지 않은 알림 개수로 배지 카운트 업데이트
        const unreadCount = result.data.unreadCount || 0;
        if (overlayContext?.setUnreadNotificationCount && typeof overlayContext.setUnreadNotificationCount === 'function') {
          try {
            overlayContext.setUnreadNotificationCount(unreadCount);
            console.log('[NotificationScreen] 읽지 않은 알림 개수 업데이트:', unreadCount);
          } catch (error) {
            console.warn('[NotificationScreen] 알림 개수 업데이트 실패:', error);
          }
        }
        
        // ID 기준으로 중복 제거
        const notificationsList = result.data.content || [];
        console.log('[NotificationScreen] 받은 알림 개수:', notificationsList.length);
        
        const uniqueNotifications = removeDuplicates(notificationsList, notification => notification.id);
        console.log('[NotificationScreen] 중복 제거 후 알림 개수:', uniqueNotifications.length);
        
        // ID 기준으로 정렬 (최신순)
        const sortedNotifications = sortByDate(uniqueNotifications, notification => notification.createdAt, 'desc');
        
        console.log('[NotificationScreen] 정렬 후 알림 목록 설정');
        
        // 백엔드에서 가져온 알림과 기존 알림 병합 (임시 알림 유지)
        setNotifications(prev => {
          // 백엔드에서 가져온 알림의 ID 목록
          const backendIds = new Set(sortedNotifications.map(n => n.id));
          
          // 임시 알림(백엔드에 없는 알림)은 유지
          const tempNotifications = prev.filter(n => {
            if (backendIds.has(n.id)) {
              return false;
            }
            const hasDuplicate = sortedNotifications.some(backendNotif => 
              backendNotif.title === n.title && 
              backendNotif.content === n.content
            );
            return !hasDuplicate;
          });
          
          // 백엔드 알림과 임시 알림 병합
          const merged = [...sortedNotifications, ...tempNotifications];
          
          // ID 기준으로 중복 제거
          const seenIds = new Set<number>();
          const seenKeys = new Set<string>();
          const final = merged.filter(notification => {
            if (notification.id) {
              if (seenIds.has(notification.id)) {
                return false;
              }
              seenIds.add(notification.id);
              return true;
            }
            const key = `${notification.title}_${notification.content}`;
            if (seenKeys.has(key)) {
              return false;
            }
            seenKeys.add(key);
            return true;
          });
          
          // 날짜 기준 정렬 (최신순)
          const finalSorted = sortByDate(final, notification => notification.createdAt, 'desc');
          
          console.log('[NotificationScreen] 병합 후 알림 개수:', finalSorted.length);
          return finalSorted;
        });
      } else {
        console.warn('[NotificationScreen] 알림 조회 실패:', result.error);
        if (result.error && result.error.includes('네트워크')) {
          setNotifications([]);
        }
      }
    } catch (error) {
      console.error('[NotificationScreen] 알림 조회 예외:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, overlayContext]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  /**
   * SSE로 새 알림을 받았을 때 즉시 알림 목록에 추가
   */
  useEffect(() => {
    if (!lastNotification) {
      return undefined;
    }
    
    const notificationKey = lastNotification.id 
      || lastNotification.notificationId 
      || `${lastNotification.title || ''}_${lastNotification.message || ''}`;
    
    console.log('[NotificationScreen] ========== 새 알림 수신 ==========');
    console.log('[NotificationScreen] lastNotification:', lastNotification);
    console.log('[NotificationScreen] notificationKey:', notificationKey);
    
    if (notificationKey !== lastNotificationIdRef.current) {
      lastNotificationIdRef.current = notificationKey;
      
      const newNotification: NotificationType = {
        id: lastNotification.id || Date.now(),
        type: (lastNotification.type || 'MISSION_ASSIGNED') as any,
        title: lastNotification.title || '알림',
        content: lastNotification.message || lastNotification.content || '',
        referenceType: lastNotification.referenceType,
        referenceId: lastNotification.referenceId,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      
      console.log('[NotificationScreen] 새 알림 즉시 추가:', newNotification);
      
      setNotifications(prev => {
        const now = Date.now();
        const isDuplicate = prev.some(n => {
          const timeDiff = Math.abs(now - new Date(n.createdAt).getTime());
          return (
            n.title === newNotification.title && 
            n.content === newNotification.content &&
            timeDiff < 1000
          );
        });
        
        if (isDuplicate) {
          console.log('[NotificationScreen] ⚠️ 1초 이내 동일 알림 감지, 추가하지 않음');
          return prev;
        }
        
        const updated = [newNotification, ...prev];
        const unique = removeDuplicates(updated, notification => notification.id);
        const uniqueSorted = sortByDate(unique, notification => notification.createdAt, 'desc');
        
        return uniqueSorted;
      });
      
      const timeoutId = setTimeout(() => {
        console.log('[NotificationScreen] 백엔드 동기화를 위한 새로고침 (2초 후)');
        fetchNotifications(true);
      }, 2000);
      
      return () => {
        clearTimeout(timeoutId);
      };
    } else {
      console.log('[NotificationScreen] ⚠️ 동일한 알림이므로 추가하지 않음');
      return undefined;
    }
  }, [lastNotification, fetchNotifications]);

  /**
   * 새로고침
   */
  const handleRefresh = useCallback(() => {
    console.log('[NotificationScreen] 수동 새로고침 시작');
    lastNotificationIdRef.current = null;
    fetchNotifications(true);
  }, [fetchNotifications]);

  /**
   * 필터 변경
   */
  const handleFilterChange = useCallback((newFilter: 'all' | 'unread') => {
    setFilter(newFilter);
  }, []);

  /**
   * 알림 읽음 처리
   */
  const handleMarkAsRead = useCallback(async (notificationId: number) => {
    try {
      let wasUnread = false;
      
      setNotifications(prev => {
        const notification = prev.find(n => n.id === notificationId);
        wasUnread = notification ? !notification.isRead : false;
        return prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n);
      });
      
      await markNotificationAsRead(notificationId);
      
      if (wasUnread && overlayContext?.setUnreadNotificationCount) {
        overlayContext.setUnreadNotificationCount((prev: number) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('읽음 처리 실패:', error);
    }
  }, [overlayContext]);

  /**
   * 전체 읽음 처리
   */
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('전체 읽음 처리 실패:', error);
    }
  }, []);

  /**
   * 알림 삭제
   */
  const handleDeleteNotification = useCallback(async (notificationId: number) => {
    try {
      console.log('[NotificationScreen] 알림 삭제 시도:', notificationId);
      const result = await deleteNotification(notificationId);
      if (result.success) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        console.log('[NotificationScreen] 알림 삭제 성공');
      } else {
        console.error('[NotificationScreen] 알림 삭제 실패:', result.error);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error('[NotificationScreen] 알림 삭제 예외:', error);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }
  }, []);

  /**
   * 알림 클릭 처리
   * - 읽음 처리
   * - 알림 타입에 따라 적절한 화면으로 이동
   */
  const handleNotificationPress = useCallback(async (notification: NotificationType) => {
    console.log('[NotificationScreen] ========== 알림 클릭 ==========');
    console.log('[NotificationScreen] 알림 전체:', JSON.stringify(notification, null, 2));
    
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }

    const { referenceType, referenceId, type, title, content } = notification;

    // MEAL_LOG 타입 알림 처리
    if (referenceType === 'MEAL_LOG' && referenceId) {
      console.log('[NotificationScreen] MEAL_LOG 알림 클릭:', referenceId);
      
      try {
        const mealLogId = typeof referenceId === 'string' ? Number(referenceId) : referenceId;
        
        if (!mealLogId || isNaN(mealLogId) || mealLogId <= 0) {
          console.error('[NotificationScreen] 유효하지 않은 mealLogId:', referenceId);
          showAlertModal('오류', '미션 정보가 올바르지 않습니다.');
          return;
        }

        // 미션 상태 조회
        const mealLogResult = await getMealLogDetail(mealLogId);
        
        if (!mealLogResult.success || !mealLogResult.data) {
          console.error('[NotificationScreen] 식사 로그 조회 실패:', mealLogResult.error);
          showAlertModal('오류', mealLogResult.error || '미션 정보를 불러올 수 없습니다.');
          return;
        }

        const mealLog = mealLogResult.data;
        console.log('[NotificationScreen] 식사 로그 상태:', {
          id: mealLog.id,
          status: mealLog.status,
          expired: mealLog.expired,
          canVerify: mealLog.canVerify,
        });

        // 상태에 따라 처리
        if (mealLog.status === 'COMPLETED') {
          // 이미 완료된 미션
          showAlertModal('알림', '이미 완료된 미션입니다.');
          return;
        } else if (mealLog.expired === true || mealLog.canVerify === false) {
          // 만료된 미션
          showAlertModal('알림', '만료된 미션입니다.');
          return;
        } else if (mealLog.status === 'ASSIGNED' && mealLog.canVerify === true) {
          // 인증 가능한 미션 → 게시글 작성 화면으로 이동
          console.log('[NotificationScreen] 식사 미션 인증 화면으로 이동, mealLogId:', mealLogId);
          safeNavigation.navigate(SCREEN_NAMES.COMMUNITY_POST_CREATE as any, {
            type: 'VERIFICATION',
            mealLogId: mealLogId,
            userMissionId: mealLog.userMissionId,
            missionId: mealLog.mealType || 'MEAL',
            missionTitle: mealLog.mealTypeDisplay || `${mealLog.mealType} 식사 미션`,
            missionEmoji: '🍽️',
          });
          return;
        } else {
          // 기타 상태
          showAlertModal('알림', '이미 수행한 미션이거나 만료된 미션입니다.');
          return;
        }
      } catch (error) {
        console.error('[NotificationScreen] MEAL_LOG 알림 처리 중 오류:', error);
        showAlertModal('오류', '미션 정보를 불러오는 중 문제가 발생했습니다.');
        return;
      }
    }

    // 돌발 미션 알림 처리
    if (type === 'SPONTANEOUS_WAKE_UP' || type === 'SPONTANEOUS_MEAL' || type === 'SPONTANEOUS_DIARY') {
      console.log('[NotificationScreen] 돌발 미션 알림 클릭:', type, 'referenceType:', referenceType);
      
      if (!referenceId) {
        console.error('[NotificationScreen] ❌ referenceId가 없습니다.');
        return;
      }

      try {
        if (type === 'SPONTANEOUS_WAKE_UP') {
          // 기상 미션 → 현재 진행 중인 미션 확인
          const currentWakeupResult = await getCurrentWakeupMission();
          
          const missionId = typeof referenceId === 'string' ? Number(referenceId) : referenceId;
          
          // 백엔드 API가 아직 구현되지 않은 경우 referenceId만으로 진행 (하위 호환성)
          if (!currentWakeupResult.success || !currentWakeupResult.data) {
            console.log('[NotificationScreen] 기상 미션 API 미구현 또는 미션 없음, referenceId로 진행:', missionId);
            // 백엔드가 구현되지 않은 경우에도 알림으로 받은 referenceId를 사용하여 진행
            safeNavigation.navigate(SCREEN_NAMES.WAKE_UP_VERIFICATION as any, {
              userMissionId: missionId,
            });
            return;
          }
          
          const wakeupMission = currentWakeupResult.data;
          
          // 미션 ID가 일치하고 완료되지 않은 경우만 이동
          if (wakeupMission.id === missionId && wakeupMission.status !== 'COMPLETED' && wakeupMission.canVerify) {
            console.log('[NotificationScreen] 기상 미션 인증 화면으로 이동, missionId:', missionId);
            safeNavigation.navigate(SCREEN_NAMES.WAKE_UP_VERIFICATION as any, {
              userMissionId: missionId,
            });
          } else {
            showAlertModal('알림', '이미 수행한 미션이거나 만료된 미션입니다.');
          }
        } else if (type === 'SPONTANEOUS_MEAL') {
          // 식사 미션 → 돌발 미션 API 사용
          // 주의: referenceType이 "SPONTANEOUS_MISSION"으로 변경되었고, referenceId는 spontaneous_mission의 ID
          console.log('[NotificationScreen] 식사 미션 처리, referenceType:', referenceType, 'referenceId:', referenceId);
          
          // 현재 진행 중인 식사 미션 조회하여 미션 정보 가져오기
          const currentMissionsResult = await getCurrentSpontaneousMissions();
          
          const missionId = typeof referenceId === 'string' ? Number(referenceId) : referenceId;
          
          let mealMission = null;
          if (currentMissionsResult.success && currentMissionsResult.data && currentMissionsResult.data.length > 0) {
            mealMission = currentMissionsResult.data.find(
              m => m.id === missionId &&
                   (m.missionType === 'MEAL_BREAKFAST' || m.missionType === 'MEAL_LUNCH' || m.missionType === 'MEAL_DINNER')
            );
          }
          
          // 백엔드 API가 아직 구현되지 않았거나, 미션이 없거나 이미 완료된 경우
          // 백엔드가 구현되지 않은 경우에는 referenceId만으로 진행 (하위 호환성)
          if (!currentMissionsResult.success || !currentMissionsResult.data || currentMissionsResult.data.length === 0) {
            console.log('[NotificationScreen] 돌발 미션 API 미구현 또는 미션 없음, referenceId로 진행:', missionId);
            // 백엔드가 구현되지 않은 경우에도 알림으로 받은 referenceId를 사용하여 진행
            safeNavigation.navigate(SCREEN_NAMES.COMMUNITY_POST_CREATE as any, {
              type: 'VERIFICATION',
              spontaneousMissionId: missionId,
              userMissionId: missionId,
              missionId: 'MEAL',
              missionTitle: '식사 미션',
              missionEmoji: '🍽️',
            });
            return;
          }
          
          // 미션이 없거나 이미 완료된 경우
          if (!mealMission || mealMission.status === 'COMPLETED' || !mealMission.canVerify) {
            showAlertModal('알림', '이미 수행한 미션이거나 만료된 미션입니다.');
            return;
          }
          
          console.log('[NotificationScreen] 식사 미션 게시글 작성 화면으로 이동');
          safeNavigation.navigate(SCREEN_NAMES.COMMUNITY_POST_CREATE as any, {
            type: 'VERIFICATION',
            spontaneousMissionId: missionId, // 돌발 미션 ID (spontaneous_mission의 ID)
            userMissionId: missionId, // 하위 호환성을 위해 유지
            missionId: String(mealMission.missionType || 'MEAL'),
            missionTitle: mealMission.missionTypeDisplayName || '식사 미션',
            missionEmoji: '🍽️',
          });
        } else if (type === 'SPONTANEOUS_DIARY') {
<<<<<<< HEAD
          // 감성일기 미션 → 현재 진행 중인 미션 확인
          const currentMissionsResult = await getCurrentSpontaneousMissions();
          
          const missionId = typeof referenceId === 'string' ? Number(referenceId) : referenceId;
          
          // 백엔드 API가 아직 구현되지 않은 경우 referenceId만으로 진행 (하위 호환성)
          if (!currentMissionsResult.success || !currentMissionsResult.data || currentMissionsResult.data.length === 0) {
            console.log('[NotificationScreen] 돌발 미션 API 미구현 또는 미션 없음, 감성일기 화면으로 이동');
            safeNavigation.navigate(SCREEN_NAMES.DIARY as any);
            return;
          }
          
          const diaryMission = currentMissionsResult.data.find(
            m => m.id === missionId && m.missionType === 'EMOTION_DIARY'
          );
          
          // 미션이 없거나 이미 완료된 경우
          if (!diaryMission || diaryMission.status === 'COMPLETED' || !diaryMission.canVerify) {
            showAlertModal('알림', '이미 수행한 미션이거나 만료된 미션입니다.');
            return;
          }
          
          console.log('[NotificationScreen] 감성일기 작성 화면으로 이동');
          safeNavigation.navigate(SCREEN_NAMES.DIARY as any);
        }
      } catch (error) {
        console.error('[NotificationScreen] ❌ 돌발 미션 알림 처리 실패:', error);
      }
      return;
    }

    // 투두리스트 작성 알림 체크
    const titleLower = (title || '').toLowerCase();
    const contentLower = (content || '').toLowerCase();
    const isTodoNotification = 
      referenceType === 'TODO_LIST' ||
      referenceType === 'TODOLIST' ||
      (type === 'SYSTEM' && (
        titleLower.includes('투두리스트') || 
        titleLower.includes('투두') || 
        titleLower.includes('todo') ||
        contentLower.includes('투두리스트') ||
        contentLower.includes('투두') ||
        contentLower.includes('todo')
      ));

    if (isTodoNotification) {
      console.log('[NotificationScreen] 투두리스트 작성 알림 클릭, 투두리스트 작성 화면으로 이동');
      try {
        safeNavigation.navigate(SCREEN_NAMES.TODO_LIST_CREATE as any);
      } catch (error) {
        console.error('[NotificationScreen] ❌ 네비게이션 실패:', error);
      }
      return;
    }

    // 알림 타입에 따라 해당 화면으로 이동
    switch (referenceType) {
      case 'VERIFICATION':
        safeNavigation.navigate(SCREEN_NAMES.COMMUNITY as any);
        break;
      case 'POST':
        if (referenceId) {
          safeNavigation.navigate(SCREEN_NAMES.COMMUNITY_POST_DETAIL as any, {
            postId: String(referenceId),
          });
        } else {
          safeNavigation.navigate(SCREEN_NAMES.COMMUNITY as any);
        }
        break;
      case 'MISSION':
        if (referenceId) {
          safeNavigation.navigate(SCREEN_NAMES.MISSION_DETAIL as any, {
            missionId: String(referenceId),
          });
        } else {
          safeNavigation.navigate(SCREEN_NAMES.MISSION as any);
        }
        break;
      case 'USER_MISSION':
        safeNavigation.navigate(SCREEN_NAMES.MISSION as any);
        break;
      case 'TODO_LIST':
      case 'TODOLIST':
        if (referenceId) {
          safeNavigation.navigate(SCREEN_NAMES.TODO_LIST_DETAIL as any, {
            todoListId: String(referenceId),
          });
        } else {
          safeNavigation.navigate(SCREEN_NAMES.TODO_LIST_CREATE as any);
        }
        break;
      case 'RECOMMENDATION':
        safeNavigation.navigate(SCREEN_NAMES.CONNECTIONS as any);
        break;
      case 'CHAT':
        safeNavigation.navigate(SCREEN_NAMES.CONNECTIONS as any);
        break;
      case 'BADGE':
        safeNavigation.navigate(SCREEN_NAMES.MY_PAGE as any);
        break;
      default:
        break;
    }
  }, [safeNavigation, handleMarkAsRead, showAlertModal]);

  /**
   * 필터링된 알림 목록
   */
  const filteredNotifications = useMemo(() => {
    return filter === 'unread' 
      ? notifications.filter(n => !n.isRead) 
      : notifications;
  }, [notifications, filter]);

  /**
   * 읽지 않은 알림 개수
   */
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  /**
   * 고유 키 생성
   */
  const keyExtractor = useCallback((item: NotificationType, index: number) => {
    if (item.id) {
      return `notification_${item.id}`;
    }
    return `temp_${item.createdAt || Date.now()}_${index}`;
  }, []);

  return {
    notifications: filteredNotifications,
    loading,
    refreshing,
    filter,
    unreadCount,
    // AlertModal 상태
    showAlert,
    alertTitle,
    alertMessage,
    handleRefresh,
    handleFilterChange,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDeleteNotification,
    handleNotificationPress,
    handleAlertClose,
    keyExtractor,
  };
};
