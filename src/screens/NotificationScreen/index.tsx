/**
 * 알림 화면
 * 사용자에게 온 모든 알림을 보여주는 화면
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
  ImageBackground,
  Alert,
} from 'react-native';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification,
  type Notification as NotificationType
} from '../../api/notificationApi';
import { getUserMission } from '../../api/missionApi';
import { Loading, EmptyState, Header } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { SCREEN_NAMES } from '../../utils/constants';
import { useSse } from '../../contexts/SseContext';
import { removeDuplicates } from '../../utils/arrayUtils';
import { sortByDate } from '../../utils/dateUtils';
import { useOverlay } from '../../contexts/OverlayContext';
import { NotificationScreenProps } from './NotificationScreen.types';
import SwipeableNotificationItem from './SwipeableNotificationItem';

const NotificationScreen: React.FC<NotificationScreenProps> = ({ navigation }) => {
  // navigation 안전 처리
  const safeNavigation = navigation || {
    navigate: () => {},
    goBack: () => {},
  } as any;

  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  // Context - Hook은 항상 호출되어야 함 (컨텍스트는 index.js에서 제공됨)
  const sseContext = useSse();
  const overlayContext = useOverlay();
  
  const lastNotification = sseContext?.lastNotification || null;
  const setUnreadNotificationCount = overlayContext?.setUnreadNotificationCount || (() => {});
  const lastNotificationIdRef = useRef<any>(null);

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
        
        // 각 알림의 날짜 로깅 (안전하게 처리)
        notificationsList.forEach((n, index) => {
          try {
            const parsedDate = n.createdAt ? new Date(n.createdAt).toISOString() : 'Invalid Date';
            console.log(`[NotificationScreen] 알림 ${index + 1}:`, {
              id: n.id,
              title: n.title,
              createdAt: n.createdAt,
              parsedDate,
              now: new Date().toISOString(),
            });
          } catch (error) {
            console.warn(`[NotificationScreen] 알림 ${index + 1} 로깅 실패:`, error);
          }
        });
        
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
          // 단, 같은 title과 content를 가진 백엔드 알림이 있으면 제거
          const tempNotifications = prev.filter(n => {
            // 백엔드에 ID가 있으면 제거
            if (backendIds.has(n.id)) {
              return false;
            }
            // 같은 title과 content를 가진 백엔드 알림이 있으면 제거 (중복 방지)
            const hasDuplicate = sortedNotifications.some(backendNotif => 
              backendNotif.title === n.title && 
              backendNotif.content === n.content
            );
            return !hasDuplicate;
          });
          
          // 백엔드 알림과 임시 알림 병합
          const merged = [...sortedNotifications, ...tempNotifications];
          
          // ID 기준으로 중복 제거 (더 엄격하게)
          const seenIds = new Set<number>();
          const seenKeys = new Set<string>();
          const final = merged.filter(notification => {
            // ID가 있으면 ID로 중복 체크
            if (notification.id) {
              if (seenIds.has(notification.id)) {
                console.warn('[NotificationScreen] 중복 ID 감지, 제거:', notification.id);
                return false;
              }
              seenIds.add(notification.id);
              return true;
            }
            // ID가 없으면 title+content로 중복 체크
            const key = `${notification.title}_${notification.content}`;
            if (seenKeys.has(key)) {
              console.warn('[NotificationScreen] 중복 키 감지, 제거:', key);
              return false;
            }
            seenKeys.add(key);
            return true;
          });
          
          // 날짜 기준 정렬 (최신순)
          const finalSorted = sortByDate(final, notification => notification.createdAt, 'desc');
          
          console.log('[NotificationScreen] 병합 후 알림 개수:', finalSorted.length, '(임시:', tempNotifications.length, ', 백엔드:', sortedNotifications.length, ')');
          return finalSorted;
        });
      } else {
        console.warn('[NotificationScreen] 알림 조회 실패:', result.error);
        // 네트워크 에러인 경우 빈 배열로 설정 (에러 메시지는 표시하지 않음)
        if (result.error && result.error.includes('네트워크')) {
          setNotifications([]);
        }
      }
    } catch (error) {
      console.error('[NotificationScreen] 알림 조회 예외:', error);
      // 예외 발생 시에도 빈 배열로 설정하여 앱이 계속 작동하도록
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, overlayContext]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // SSE로 새 알림을 받았을 때 즉시 알림 목록에 추가
  useEffect(() => {
    if (!lastNotification) {
      return undefined;
    }
    
    // 알림 데이터의 고유 키 생성 (title + message 조합)
    const notificationKey = lastNotification.id 
      || lastNotification.notificationId 
      || `${lastNotification.title || ''}_${lastNotification.message || ''}`;
    
    console.log('[NotificationScreen] ========== 새 알림 수신 ==========');
    console.log('[NotificationScreen] lastNotification:', lastNotification);
    console.log('[NotificationScreen] notificationKey:', notificationKey);
    console.log('[NotificationScreen] lastNotificationIdRef.current:', lastNotificationIdRef.current);
    console.log('[NotificationScreen] =================================');
    
    // 같은 알림이 연속으로 오는 경우만 제외
    if (notificationKey !== lastNotificationIdRef.current) {
      lastNotificationIdRef.current = notificationKey;
      
      // SSE로 받은 알림을 NotificationType 형식으로 변환
      const newNotification: NotificationType = {
        id: lastNotification.id || Date.now(), // 임시 ID (백엔드에서 저장되면 실제 ID로 교체됨)
        type: (lastNotification.type || 'MISSION_ASSIGNED') as any,
        title: lastNotification.title || '알림',
        content: lastNotification.message || lastNotification.content || '',
        referenceType: lastNotification.referenceType,
        referenceId: lastNotification.referenceId,
        isRead: false,
        createdAt: new Date().toISOString(), // 현재 시간으로 설정
      };
      
      console.log('[NotificationScreen] ✅ 새 알림 즉시 추가:', newNotification);
      
      // 즉시 알림 목록에 추가 (최상단에)
      // 중복 체크는 매우 짧은 시간(1초) 내에 동일한 알림이 연속으로 오는 경우만 제외
      setNotifications(prev => {
        const now = Date.now();
        const isDuplicate = prev.some(n => {
          const timeDiff = Math.abs(now - new Date(n.createdAt).getTime());
          return (
            n.title === newNotification.title && 
            n.content === newNotification.content &&
            timeDiff < 1000 // 1초 이내에 동일한 알림이 오는 경우만 중복으로 간주
          );
        });
        
        if (isDuplicate) {
          console.log('[NotificationScreen] ⚠️ 1초 이내 동일 알림 감지, 추가하지 않음 (기록은 남김)');
          // 기록은 남기지만 추가하지 않음
          return prev;
        }
        
        console.log('[NotificationScreen] ✅ 새 알림 추가 (중복 아님)');
        
        // 최상단에 추가하고 중복 제거
        const updated = [newNotification, ...prev];
        const unique = removeDuplicates(updated, notification => notification.id);
        
        // 날짜 기준 정렬 (최신순)
        const uniqueSorted = sortByDate(unique, notification => notification.createdAt, 'desc');
        
        return uniqueSorted;
      });
      
      // 백엔드에서 저장된 알림과 동기화하기 위해 나중에 새로고침
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

  const handleRefresh = () => {
    console.log('[NotificationScreen] 수동 새로고침 시작');
    // 캐시 무시를 위해 강제 새로고침
    lastNotificationIdRef.current = null;
    fetchNotifications(true);
  };

  const handleMarkAsRead = useCallback(async (notificationId: number) => {
    try {
      let wasUnread = false;
      
      // 함수형 업데이트를 사용하여 notifications를 직접 참조하지 않음
      setNotifications(prev => {
        const notification = prev.find(n => n.id === notificationId);
        wasUnread = notification ? !notification.isRead : false;
        return prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n);
      });
      
      await markNotificationAsRead(notificationId);
      
      // 읽지 않은 알림이었으면 카운트 감소
      if (wasUnread && overlayContext?.setUnreadNotificationCount) {
        overlayContext.setUnreadNotificationCount((prev: number) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('읽음 처리 실패:', error);
    }
  }, [overlayContext]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('전체 읽음 처리 실패:', error);
    }
  }, []);

  const handleDeleteNotification = useCallback(async (notificationId: number) => {
    try {
      console.log('[NotificationScreen] 알림 삭제 시도:', notificationId);
      const result = await deleteNotification(notificationId);
      if (result.success) {
        // 로컬 상태에서 제거
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        console.log('[NotificationScreen] 알림 삭제 성공');
      } else {
        console.error('[NotificationScreen] 알림 삭제 실패:', result.error);
        // 실패해도 로컬에서 제거 (optimistic update)
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error('[NotificationScreen] 알림 삭제 예외:', error);
      // 예외 발생 시에도 로컬에서 제거
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }
  }, []);

  const handleNotificationPress = useCallback(async (notification: NotificationType) => {
    console.log('[NotificationScreen] ========== 알림 클릭 ==========');
    console.log('[NotificationScreen] 알림 전체:', JSON.stringify(notification, null, 2));
    console.log('[NotificationScreen] referenceType:', notification.referenceType);
    console.log('[NotificationScreen] type:', notification.type);
    console.log('[NotificationScreen] title:', notification.title);
    console.log('[NotificationScreen] content:', notification.content);
    console.log('[NotificationScreen] =================================');
    
    // 읽음 처리
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }

    const { referenceType, referenceId, type, title, content } = notification;

    // 돌발 미션 알림 처리
    if (type === 'SPONTANEOUS_WAKE_UP' || type === 'SPONTANEOUS_MEAL' || type === 'SPONTANEOUS_DIARY') {
      console.log('[NotificationScreen] ✅ 돌발 미션 알림 클릭:', type);
      
      if (!referenceId) {
        console.error('[NotificationScreen] ❌ referenceId가 없습니다.');
        return;
      }

      try {
        // userMissionId로 미션 정보 조회
        const missionResult = await getUserMission(referenceId);
        
        if (!missionResult.success || !missionResult.data) {
          console.error('[NotificationScreen] ❌ 미션 정보 조회 실패:', missionResult.error);
          return;
        }

        const userMission = missionResult.data;
        const mission = userMission.mission || userMission.customMission;
        
        if (!mission) {
          console.error('[NotificationScreen] ❌ 미션 정보가 없습니다.');
          return;
        }

        // 알림 타입에 따라 적절한 화면으로 이동
        if (type === 'SPONTANEOUS_WAKE_UP') {
          // 기상 미션 → 인증 화면으로 이동
          console.log('[NotificationScreen] ✅ 기상 미션 인증 화면으로 이동');
          console.log('[NotificationScreen] referenceId:', referenceId, 'type:', typeof referenceId);
          
          if (!referenceId) {
            console.error('[NotificationScreen] ❌ referenceId가 없습니다.');
            Alert.alert('오류', '미션 정보가 올바르지 않습니다.');
            return;
          }
          
          // referenceId를 number로 변환
          const userMissionId = typeof referenceId === 'string' ? Number(referenceId) : referenceId;
          
          if (!userMissionId || isNaN(userMissionId)) {
            console.error('[NotificationScreen] ❌ 유효하지 않은 userMissionId:', userMissionId);
            Alert.alert('오류', '미션 정보가 올바르지 않습니다.');
            return;
          }
          
          console.log('[NotificationScreen] 네비게이션 파라미터:', { userMissionId });
          safeNavigation.navigate(SCREEN_NAMES.WAKE_UP_VERIFICATION as any, {
            userMissionId: userMissionId,
          });
        } else if (type === 'SPONTANEOUS_MEAL') {
          // 식사 미션 → 게시글 작성 화면으로 이동
          console.log('[NotificationScreen] ✅ 식사 미션 게시글 작성 화면으로 이동');
          safeNavigation.navigate(SCREEN_NAMES.COMMUNITY_POST_CREATE as any, {
            type: 'VERIFICATION',
            userMissionId: referenceId,
            missionId: String(mission.id),
            missionTitle: mission.title || '식사 미션',
            missionEmoji: '🍽️',
          });
        } else if (type === 'SPONTANEOUS_DIARY') {
          // 감성일기 미션 → 감성일기 작성 화면으로 이동
          console.log('[NotificationScreen] ✅ 감성일기 작성 화면으로 이동');
          safeNavigation.navigate(SCREEN_NAMES.DIARY as any);
        }
      } catch (error) {
        console.error('[NotificationScreen] ❌ 돌발 미션 알림 처리 실패:', error);
      }
      return;
    }

    // 투두리스트 작성 알림 체크
    // 1. referenceType이 TODO_LIST인 경우
    // 2. 타입이 SYSTEM이고 제목 또는 내용에 "투두리스트"가 포함된 경우
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
      console.log('[NotificationScreen] ✅ 투두리스트 작성 알림 클릭, 투두리스트 작성 화면으로 이동');
      try {
        safeNavigation.navigate(SCREEN_NAMES.TODO_LIST_CREATE as any);
        console.log('[NotificationScreen] ✅ 네비게이션 성공');
      } catch (error) {
        console.error('[NotificationScreen] ❌ 네비게이션 실패:', error);
      }
      return;
    }

    // 알림 타입에 따라 해당 화면으로 이동
    switch (referenceType) {
      case 'VERIFICATION':
        // 인증글 페이지 제거됨 - 커뮤니티로 이동
        safeNavigation.navigate(SCREEN_NAMES.COMMUNITY as any);
        break;
      case 'POST':
        // 커뮤니티 게시글 상세 화면으로 이동
        if (referenceId) {
          safeNavigation.navigate(SCREEN_NAMES.COMMUNITY_POST_DETAIL as any, {
            postId: String(referenceId),
          });
        } else {
          safeNavigation.navigate(SCREEN_NAMES.COMMUNITY as any);
        }
        break;
      case 'MISSION':
        // 미션 상세 화면으로 이동
        if (referenceId) {
          safeNavigation.navigate(SCREEN_NAMES.MISSION_DETAIL as any, {
            missionId: String(referenceId),
          });
        } else {
          safeNavigation.navigate(SCREEN_NAMES.MISSION as any);
        }
        break;
      case 'USER_MISSION':
        // 유저 미션 관련 알림 (인증 승인 등) - 미션 화면으로 이동
        safeNavigation.navigate(SCREEN_NAMES.MISSION as any);
        break;
      case 'TODO_LIST':
      case 'TODOLIST':
        // 투두리스트 관련 알림
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
        // 기본: 아무 동작 안함
        break;
    }
  }, [safeNavigation, handleMarkAsRead]);


  const renderNotification = useCallback(({ item }: { item: NotificationType }) => {
    try {
      return (
        <SwipeableNotificationItem 
          item={item}
          onPress={handleNotificationPress}
          onDelete={handleDeleteNotification}
        />
      );
    } catch (error) {
      console.error('[NotificationScreen] 알림 아이템 렌더링 실패:', error);
      return null;
    }
  }, [handleNotificationPress, handleDeleteNotification]);
  
  // 고유 키 생성: id와 createdAt을 조합하여 중복 방지
  const keyExtractor = useCallback((item: NotificationType, index: number) => {
    // id가 있으면 id 사용, 없으면 createdAt과 index 조합
    if (item.id) {
      return `notification_${item.id}`;
    }
    // 임시 알림의 경우 createdAt과 index로 고유 키 생성
    return `temp_${item.createdAt || Date.now()}_${index}`;
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading && notifications.length === 0) {
    return <Loading text="알림을 불러오는 중..." />;
  }

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* 헤더 섹션 */}
        <Header
          title="알림"
          navigation={navigation}
          titleStyle={styles.headerTitle}
          rightButton={
            unreadCount > 0 ? (
              <TouchableOpacity 
                style={styles.markAllButton}
                onPress={handleMarkAllAsRead}
              >
                <Text style={styles.markAllReadText}>모두 읽음</Text>
              </TouchableOpacity>
            ) : undefined
          }
        />

        {/* 필터 탭 */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              전체
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'unread' && styles.filterTabActive]}
            onPress={() => setFilter('unread')}
          >
            <Text style={[styles.filterText, filter === 'unread' && styles.filterTextActive]}>
              읽지 않음 {unreadCount > 0 && `(${unreadCount})`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 알림 목록 */}
        <View style={styles.listWrapper}>
          <FlatList
            data={filter === 'unread' ? notifications.filter(n => !n.isRead) : notifications}
            renderItem={renderNotification}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={handleRefresh}
                tintColor={colors.primary[500]}
                colors={[colors.primary[500]]}
              />
            }
            ListEmptyComponent={
              <EmptyState
                iconImage={require('../../assets/images/notification.png')}
                title="알림이 없습니다"
                description={filter === 'unread'
                  ? "읽지 않은 알림이 없습니다."
                  : "아직 받은 알림이 없어요.\n미션을 수행하면 알림을 받을 수 있어요!"
                }
              />
            }
          />
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  markAllButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  markAllReadText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing[5],
    paddingVertical: spacing[2],
    backgroundColor: '#FFF8E7',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#D4A574',
    padding: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing[2],
    alignItems: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: 'transparent',
  },
  filterTabActive: {
    backgroundColor: '#8B6F47',
  },
  filterText: {
    fontSize: typography.fontSize.sm,
    color: '#8B6F47',
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  filterTextActive: {
    color: colors.white,
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  listWrapper: {
    flex: 1,
    position: 'relative',
  },
  listContent: {
    padding: spacing[4],
  },
});

export default NotificationScreen;
