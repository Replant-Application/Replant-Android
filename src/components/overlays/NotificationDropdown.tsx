/**
 * NotificationDropdown
 * 우측 상단에 표시되는 알림 드롭다운 모달
 *
 * 특징:
 * - 최근 알림 5개 미리보기
 * - 읽지 않은 알림 강조
 * - 전체 보기 버튼으로 NotificationScreen 이동
 * - 외부 터치 시 자동 닫힘
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Animated,
  Image,
} from 'react-native';
import { useOverlay } from '../../contexts/OverlayContext';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../api/notificationApi';
import { getMealLogDetail } from '../../api/mealLogApi';
import { formatTimeAgo } from '../../utils/dateUtils';
import { SCREEN_NAMES } from '../../utils/constants';
import { styles } from './NotificationDropdown.styles';
import AlertModal from '../ui/alertModal';

interface Notification {
  id: number;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  referenceType?: string;
  referenceId?: number;
}

interface NotificationDropdownProps {
  onNavigate?: (screen: string, params?: any) => void;
  onViewAll?: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  onNavigate,
  onViewAll,
}) => {
  const { activeOverlay, closeOverlay, overlayPosition, setUnreadNotificationCount } = useOverlay();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  
  // AlertModal 상태
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const isVisible = activeOverlay === 'notification';
  
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

  // 알림 데이터 로드
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getNotifications({ size: 5 });
      if (result.success && result.data) {
        setNotifications(result.data.content || []);
        setUnreadNotificationCount(result.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('알림 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [setUnreadNotificationCount]);

  // 표시/숨김 애니메이션
  useEffect(() => {
    if (isVisible) {
      loadNotifications();
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, fadeAnim, scaleAnim, loadNotifications]);

  // 알림 아이콘 반환
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'MISSION': case 'MISSION_ASSIGNED': return require('../../assets/images/goal.png');
      case 'VERIFICATION_APPROVED': return '';
      case 'VERIFICATION_REJECTED': return '❌';
      case 'USER_RECOMMENDED': return '👋';
      case 'CHAT_MESSAGE': return require('../../assets/images/say.png');
      case 'BADGE_EXPIRING': return '🏅';
      default: return '📢';
    }
  };

  // 상대 시간 표시 (shortFormat: true로 "방금" 사용)

  // 알림 클릭 핸들러
  const handleNotificationPress = async (notification: Notification) => {
    // 읽음 처리
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
        setUnreadNotificationCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('읽음 처리 실패:', error);
      }
    }

    closeOverlay();

    // 화면 이동 - referenceType에 따라 적절한 상세 화면으로 이동
    if (onNavigate) {
      const { referenceType, referenceId, type } = notification;

      // MEAL_LOG 타입 알림 처리
      if (referenceType === 'MEAL_LOG' && referenceId) {
        console.log('[NotificationDropdown] MEAL_LOG 알림 클릭:', referenceId);
        
        try {
          const mealLogId = typeof referenceId === 'string' ? Number(referenceId) : referenceId;
          
          if (!mealLogId || isNaN(mealLogId) || mealLogId <= 0) {
            console.error('[NotificationDropdown] 유효하지 않은 mealLogId:', referenceId);
            showAlertModal('오류', '미션 정보가 올바르지 않습니다.');
            return;
          }

          // 미션 상태 조회
          const mealLogResult = await getMealLogDetail(mealLogId);
          
          if (!mealLogResult.success || !mealLogResult.data) {
            console.error('[NotificationDropdown] 식사 로그 조회 실패:', mealLogResult.error);
            showAlertModal('오류', mealLogResult.error || '미션 정보를 불러올 수 없습니다.');
            return;
          }

          const mealLog = mealLogResult.data;
          console.log('[NotificationDropdown] 식사 로그 상태:', {
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
            console.log('[NotificationDropdown] 식사 미션 인증 화면으로 이동, mealLogId:', mealLogId);
            onNavigate(SCREEN_NAMES.COMMUNITY_POST_CREATE, {
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
          console.error('[NotificationDropdown] MEAL_LOG 알림 처리 중 오류:', error);
          showAlertModal('오류', '미션 정보를 불러오는 중 문제가 발생했습니다.');
          return;
        }
      }

      // 돌발 미션 알림 처리 (감정일기·식사 미션은 잠시 제외)
      if (type === 'SPONTANEOUS_WAKE_UP') {
        console.log('[기상미션] 알림 클릭 referenceId=', referenceId, 'referenceType=', referenceType);
        
        if (!referenceId) {
          console.error('[기상미션] referenceId 없음');
          return;
        }

        try {
          const missionId = typeof referenceId === 'string' ? Number(referenceId) : referenceId;
          // 알림의 referenceId(= userMissionId)로 항상 인증 화면 이동. 이미 완료된 미션이면 화면/API에서 처리
          console.log('[기상미션] 인증 화면 이동 userMissionId=', missionId);
          onNavigate(SCREEN_NAMES.WAKE_UP_VERIFICATION, {
            userMissionId: missionId,
          });
          // [잠시 제외] 식사 미션 (SPONTANEOUS_MEAL)
          // } else if (type === 'SPONTANEOUS_MEAL') {
          //   // 식사 미션 → 돌발 미션 API 사용
          //   // 주의: referenceType이 "SPONTANEOUS_MISSION"으로 변경되었고, referenceId는 spontaneous_mission의 ID
          //   console.log('[NotificationDropdown] 식사 미션 처리, referenceType:', referenceType, 'referenceId:', referenceId);
          //   const currentMissionsResult = await getCurrentSpontaneousMissions();
          //   const missionId = typeof referenceId === 'string' ? Number(referenceId) : referenceId;
          //   let mealMission = null;
          //   if (currentMissionsResult.success && currentMissionsResult.data && currentMissionsResult.data.length > 0) {
          //     mealMission = currentMissionsResult.data.find(
          //       m => m.id === missionId &&
          //            (m.missionType === 'MEAL_BREAKFAST' || m.missionType === 'MEAL_LUNCH' || m.missionType === 'MEAL_DINNER')
          //     );
          //   }
          //   if (!currentMissionsResult.success || !currentMissionsResult.data || currentMissionsResult.data.length === 0) {
          //     console.log('[NotificationDropdown] 돌발 미션 API 미구현 또는 미션 없음, referenceId로 진행:', missionId);
          //     onNavigate(SCREEN_NAMES.COMMUNITY_POST_CREATE, {
          //       type: 'VERIFICATION',
          //       spontaneousMissionId: missionId,
          //       userMissionId: missionId,
          //       missionId: 'MEAL',
          //       missionTitle: '식사 미션',
          //       missionEmoji: '🍽️',
          //     });
          //     return;
          //   }
          //   if (!mealMission || mealMission.status === 'COMPLETED' || !mealMission.canVerify) {
          //     showAlertModal('알림', '이미 수행한 미션이거나 만료된 미션입니다.');
          //     return;
          //   }
          //   console.log('[NotificationDropdown] 식사 미션 게시글 작성 화면으로 이동');
          //   onNavigate(SCREEN_NAMES.COMMUNITY_POST_CREATE, {
          //     type: 'VERIFICATION',
          //     spontaneousMissionId: missionId,
          //     userMissionId: missionId,
          //     missionId: String(mealMission.missionType || 'MEAL'),
          //     missionTitle: mealMission.missionTypeDisplayName || '식사 미션',
          //     missionEmoji: '🍽️',
          //   });
          // }
        } catch (error) {
          console.error('[NotificationDropdown] ❌ 돌발 미션 알림 처리 실패:', error);
        }
        return;
      }

      switch (referenceType) {
        case 'VERIFICATION':
          // 인증글 페이지 제거됨 - 커뮤니티로 이동
          onNavigate('Community');
          break;
        case 'POST':
          // 커뮤니티 게시글 상세 화면으로 이동
          if (referenceId) {
            onNavigate('CommunityPostDetail', { postId: String(referenceId) });
          } else {
            onNavigate('Community');
          }
          break;
        case 'MISSION':
          // 미션 상세 화면으로 이동
          if (referenceId) {
            onNavigate('MissionDetail', { missionId: String(referenceId) });
          } else {
            onNavigate('Mission');
          }
          break;
        case 'USER_MISSION':
          // 유저 미션 관련 알림 (인증 승인 등) - 미션 화면으로 이동
          onNavigate('Mission');
          break;
        case 'RECOMMENDATION':
          onNavigate('Connections');
          break;
        case 'CHAT':
          onNavigate('Connections');
          break;
        case 'BADGE':
          onNavigate('MyPage');
          break;
        default:
          break;
      }
    }
  };

  // 전체 보기 클릭
  const handleViewAll = () => {
    closeOverlay();
    onViewAll?.();
  };

  // 전체 읽음 처리
  const handleMarkAllRead = useCallback(async () => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    if (unreadCount === 0) return;
    try {
      const result = await markAllNotificationsAsRead();
      if (result.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadNotificationCount(0);
      }
    } catch (error) {
      console.error('전체 읽음 처리 실패:', error);
    }
  }, [notifications, setUnreadNotificationCount]);

  if (!isVisible) return null;

  return (
    <TouchableWithoutFeedback onPress={closeOverlay}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback>
          <Animated.View
            style={[
              styles.dropdown,
              {
                top: overlayPosition.top,
                right: overlayPosition.right,
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* 헤더 */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.headerTitle}>알림</Text>
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>
                      {notifications.filter(n => !n.isRead).length}
                    </Text>
                  </View>
                )}
              </View>
              {notifications.filter(n => !n.isRead).length > 0 && (
                <TouchableOpacity
                  style={styles.readAllButton}
                  onPress={handleMarkAllRead}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="모든 알림 읽음 처리"
                >
                  <Text style={styles.readAllButtonText}>읽음</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* 알림 목록 */}
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>로딩 중...</Text>
                </View>
              ) : notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>🔔</Text>
                  <Text style={styles.emptyText}>새로운 알림이 없습니다</Text>
                </View>
              ) : (
                notifications.map((notification) => (
                  <TouchableOpacity
                    key={notification.id}
                    style={[
                      styles.notificationItem,
                      !notification.isRead && styles.unreadItem,
                    ]}
                    onPress={() => handleNotificationPress(notification)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`${notification.title}, ${notification.content}`}
                    accessibilityState={{ selected: !notification.isRead }}
                  >
                    {typeof getNotificationIcon(notification.type) === 'string' ? (
                      <Text style={styles.notificationIcon} accessibilityElementsHidden={true}>
                        {getNotificationIcon(notification.type) as string}
                      </Text>
                    ) : (
                      <Image
                        source={getNotificationIcon(notification.type) as any}
                        style={styles.notificationIconImage}
                        resizeMode="contain"
                        accessibilityLabel={`${notification.type} 알림 아이콘`}
                        accessibilityElementsHidden={true}
                      />
                    )}
                    <View style={styles.notificationContent}>
                      <View style={styles.notificationHeader}>
                        <Text
                          style={[
                            styles.notificationTitle,
                            !notification.isRead && styles.unreadTitle,
                          ]}
                          numberOfLines={1}
                        >
                          {notification.title}
                        </Text>
                        {!notification.isRead && <View style={styles.unreadDot} />}
                      </View>
                      <Text style={styles.notificationBody} numberOfLines={1}>
                        {notification.content}
                      </Text>
                      <Text style={styles.notificationTime}>
                        {formatTimeAgo(notification.createdAt, { shortFormat: true })}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            {/* 푸터 */}
            <TouchableOpacity 
              style={styles.footer} 
              onPress={handleViewAll}
              accessibilityRole="button"
              accessibilityLabel="전체 보기"
            >
              <Text style={styles.footerText}>전체 보기</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>

      {/* 오류 모달 */}
      <AlertModal
        visible={showAlert}
        title={alertTitle}
        message={alertMessage}
        buttonText="확인"
        onClose={handleAlertClose}
      />
    </TouchableWithoutFeedback>
  );
};

export default NotificationDropdown;
