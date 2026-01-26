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
import { getNotifications, markNotificationAsRead } from '../../api/notificationApi';
import { getUserMission } from '../../api/missionApi';
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

      // 돌발 미션 알림 처리
      if (type === 'SPONTANEOUS_WAKE_UP' || type === 'SPONTANEOUS_MEAL' || type === 'SPONTANEOUS_DIARY') {
        console.log('[NotificationDropdown] 돌발 미션 알림 클릭:', type, 'referenceType:', referenceType);
        
        if (!referenceId) {
          console.error('[NotificationDropdown] ❌ referenceId가 없습니다.');
          return;
        }

        try {
          // 알림 타입에 따라 적절한 화면으로 이동
          if (type === 'SPONTANEOUS_WAKE_UP') {
            // 기상 미션 → 인증 화면으로 이동
            console.log('[NotificationDropdown] 기상 미션 인증 화면으로 이동, userMissionId:', referenceId);
            onNavigate(SCREEN_NAMES.WAKE_UP_VERIFICATION, {
              userMissionId: referenceId,
            });
          } else if (type === 'SPONTANEOUS_MEAL') {
            // 식사 미션 → referenceType에 따라 다른 API 호출
            console.log('[NotificationDropdown] 식사 미션 처리, referenceType:', referenceType);
            
            if (referenceType === 'MEAL_LOG') {
              // 새로운 식사 로그 API 사용
              const mealLogResult = await getMealLogDetail(referenceId);
              
              if (!mealLogResult.success || !mealLogResult.data) {
                console.error('[NotificationDropdown] ❌ 식사 로그 조회 실패:', mealLogResult.error);
                showAlertModal('오류', '식사 미션 정보를 불러올 수 없습니다.');
                return;
              }

              const mealLog = mealLogResult.data;
              console.log('[NotificationDropdown] 식사 미션 게시글 작성 화면으로 이동');
              onNavigate(SCREEN_NAMES.COMMUNITY_POST_CREATE, {
                type: 'VERIFICATION',
                userMissionId: mealLog.id,
                missionId: String(mealLog.missionId || mealLog.id),
                missionTitle: mealLog.title || '식사 미션',
                missionEmoji: '🍽️',
                isMealLog: true,
              });
            } else {
              // 기존 USER_MISSION API 사용 (하위 호환)
              const missionResult = await getUserMission(referenceId);
              
              if (!missionResult.success || !missionResult.data) {
                console.error('[NotificationDropdown] ❌ 미션 정보 조회 실패:', missionResult.error);
                return;
              }

              const userMission = missionResult.data;
              const mission = userMission.mission || userMission.customMission;
              
              console.log('[NotificationDropdown] 식사 미션 게시글 작성 화면으로 이동');
              onNavigate(SCREEN_NAMES.COMMUNITY_POST_CREATE, {
                type: 'VERIFICATION',
                userMissionId: referenceId,
                missionId: String(mission?.id || referenceId),
                missionTitle: mission?.title || '식사 미션',
                missionEmoji: '🍽️',
              });
            }
          } else if (type === 'SPONTANEOUS_DIARY') {
            // 감성일기 미션 → 감성일기 작성 화면으로 이동
            console.log('[NotificationDropdown] 감성일기 작성 화면으로 이동');
            onNavigate(SCREEN_NAMES.DIARY);
          }
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
              <Text style={styles.headerTitle}>알림</Text>
              {notifications.filter(n => !n.isRead).length > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>
                    {notifications.filter(n => !n.isRead).length}
                  </Text>
                </View>
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
