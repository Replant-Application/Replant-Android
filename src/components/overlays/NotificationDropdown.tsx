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
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { useOverlay } from '../../contexts/OverlayContext';
import { getNotifications, markNotificationAsRead } from '../../api/notificationApi';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { formatTimeAgo } from '../../utils/dateUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DROPDOWN_WIDTH = Math.min(SCREEN_WIDTH - 32, 340);

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

  const isVisible = activeOverlay === 'notification';

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
      case 'VERIFICATION_APPROVED': return '✅';
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
      const { referenceType, referenceId } = notification;

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
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  dropdown: {
    position: 'absolute',
    width: DROPDOWN_WIDTH,
    maxHeight: 400,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    ...shadows.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  unreadBadge: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.white,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  scrollView: {
    maxHeight: 280,
  },
  loadingContainer: {
    padding: spacing[8],
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  emptyContainer: {
    padding: spacing[8],
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  notificationItem: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  unreadItem: {
    backgroundColor: colors.primary[50],
  },
  notificationIcon: {
    fontSize: 20,
    marginRight: spacing[3],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(20),
  },
  notificationIconImage: {
    width: 20,
    height: 20,
    marginRight: spacing[3],
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationTitle: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  unreadTitle: {
    fontWeight: typography.fontWeight.medium as any,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary[500],
    marginLeft: spacing[2],
  },
  notificationBody: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: 2,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  notificationTime: {
    fontSize: 10,
    color: colors.text.tertiary,
    marginTop: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(10),
  },
  footer: {
    paddingVertical: spacing[3],
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.secondary,
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.primary[600],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
});

export default NotificationDropdown;
