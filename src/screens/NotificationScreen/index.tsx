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
} from 'react-native';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification,
  type Notification as NotificationType
} from '../../api/notificationApi';
import { Loading, EmptyState, Header } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { SCREEN_NAMES } from '../../utils/constants';
import { useSse } from '../../contexts/SseContext';
import { useOverlay } from '../../contexts/OverlayContext';
import { NotificationScreenProps } from './NotificationScreen.types';
import SwipeableNotificationItem from './SwipeableNotificationItem';

const NotificationScreen: React.FC<NotificationScreenProps> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { lastNotification } = useSse();
  const { setUnreadNotificationCount } = useOverlay();
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
        setUnreadNotificationCount(unreadCount);
        console.log('[NotificationScreen] 읽지 않은 알림 개수 업데이트:', unreadCount);
        
        // ID 기준으로 중복 제거
        const notificationsList = result.data.content || [];
        console.log('[NotificationScreen] 받은 알림 개수:', notificationsList.length);
        
        // 각 알림의 날짜 로깅
        notificationsList.forEach((n, index) => {
          console.log(`[NotificationScreen] 알림 ${index + 1}:`, {
            id: n.id,
            title: n.title,
            createdAt: n.createdAt,
            parsedDate: new Date(n.createdAt).toISOString(),
            now: new Date().toISOString(),
          });
        });
        
        const uniqueNotifications = notificationsList.filter(
          (notification, index, self) =>
            index === self.findIndex(n => n.id === notification.id)
        );
        console.log('[NotificationScreen] 중복 제거 후 알림 개수:', uniqueNotifications.length);
        
        // ID 기준으로 정렬 (최신순)
        uniqueNotifications.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // 최신순
        });
        
        console.log('[NotificationScreen] 정렬 후 알림 목록 설정');
        
        // 백엔드에서 가져온 알림과 기존 알림 병합 (임시 알림 유지)
        setNotifications(prev => {
          // 백엔드에서 가져온 알림의 ID 목록
          const backendIds = new Set(uniqueNotifications.map(n => n.id));
          
          // 임시 알림(백엔드에 없는 알림)은 유지
          const tempNotifications = prev.filter(n => !backendIds.has(n.id));
          
          // 백엔드 알림과 임시 알림 병합
          const merged = [...uniqueNotifications, ...tempNotifications];
          
          // ID 기준으로 중복 제거 및 정렬
          const final = merged.filter(
            (notification, index, self) =>
              index === self.findIndex(n => n.id === notification.id)
          ).sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
          });
          
          console.log('[NotificationScreen] 병합 후 알림 개수:', final.length, '(임시:', tempNotifications.length, ')');
          return final;
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
  }, [filter, setUnreadNotificationCount]);

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
        const unique = updated.filter(
          (notification, index, self) =>
            index === self.findIndex(n => n.id === notification.id)
        );
        
        // 날짜 기준 정렬 (최신순)
        unique.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
        
        return unique;
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

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const notification = notifications.find(n => n.id === notificationId);
      const wasUnread = notification && !notification.isRead;
      
      await markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      
      // 읽지 않은 알림이었으면 카운트 감소
      if (wasUnread) {
        setUnreadNotificationCount((prev: number) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('읽음 처리 실패:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('전체 읽음 처리 실패:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
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
  };

  const handleNotificationPress = async (notification: NotificationType) => {
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
        navigation.navigate(SCREEN_NAMES.TODO_LIST_CREATE as any);
        console.log('[NotificationScreen] ✅ 네비게이션 성공');
      } catch (error) {
        console.error('[NotificationScreen] ❌ 네비게이션 실패:', error);
      }
      return;
    }

    // 알림 타입에 따라 해당 화면으로 이동
    switch (referenceType) {
      case 'VERIFICATION':
        // 인증글 상세 화면으로 이동
        if (referenceId) {
          navigation.navigate(SCREEN_NAMES.VERIFICATION_POST_DETAIL as any, {
            verificationId: referenceId,
          });
        } else {
          navigation.navigate(SCREEN_NAMES.COMMUNITY as any);
        }
        break;
      case 'POST':
        // 커뮤니티 게시글 상세 화면으로 이동
        if (referenceId) {
          navigation.navigate(SCREEN_NAMES.COMMUNITY_POST_DETAIL as any, {
            postId: String(referenceId),
          });
        } else {
          navigation.navigate(SCREEN_NAMES.COMMUNITY as any);
        }
        break;
      case 'MISSION':
        // 미션 상세 화면으로 이동
        if (referenceId) {
          navigation.navigate(SCREEN_NAMES.MISSION_DETAIL as any, {
            missionId: String(referenceId),
          });
        } else {
          navigation.navigate(SCREEN_NAMES.MISSION as any);
        }
        break;
      case 'USER_MISSION':
        // 유저 미션 관련 알림 (인증 승인 등) - 미션 화면으로 이동
        navigation.navigate(SCREEN_NAMES.MISSION as any);
        break;
      case 'TODO_LIST':
      case 'TODOLIST':
        // 투두리스트 관련 알림
        if (referenceId) {
          navigation.navigate(SCREEN_NAMES.TODO_LIST_DETAIL as any, {
            todoListId: String(referenceId),
          });
        } else {
          navigation.navigate(SCREEN_NAMES.TODO_LIST_CREATE as any);
        }
        break;
      case 'RECOMMENDATION':
        navigation.navigate(SCREEN_NAMES.CONNECTIONS as any);
        break;
      case 'CHAT':
        navigation.navigate(SCREEN_NAMES.CONNECTIONS as any);
        break;
      case 'BADGE':
        navigation.navigate(SCREEN_NAMES.MY_PAGE as any);
        break;
      default:
        // 기본: 아무 동작 안함
        break;
    }
  };


  const renderNotification = ({ item }: { item: NotificationType }) => (
    <SwipeableNotificationItem 
      item={item}
      onPress={handleNotificationPress}
      onDelete={handleDeleteNotification}
    />
  );

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
            keyExtractor={(item) => String(item.id)}
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
