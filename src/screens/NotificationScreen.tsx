/**
 * 알림 화면
 * 사용자에게 온 모든 알림을 보여주는 화면
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../api/notificationApi';
import { Loading, EmptyState } from '../components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '../utils/designTokens';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { SCREEN_NAMES } from '../utils/constants';

interface NotificationScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

interface Notification {
  id: number;
  type: string;
  title: string;
  content: string;
  referenceType?: string;
  referenceId?: number;
  isRead: boolean;
  createdAt: string;
}

const NotificationScreen: React.FC<NotificationScreenProps> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = useCallback(async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result = await getNotifications({ isRead: filter === 'unread' ? false : undefined });
      if (result.success && result.data) {
        setNotifications(result.data.content || []);
      }
    } catch (error) {
      console.error('알림 조회 실패:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = () => {
    fetchNotifications(true);
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
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

  const handleNotificationPress = async (notification: Notification) => {
    // 읽음 처리
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }

    // 알림 타입에 따라 해당 화면으로 이동
    switch (notification.referenceType) {
      case 'MISSION':
        navigation.navigate(SCREEN_NAMES.MISSION as any);
        break;
      case 'VERIFICATION':
        navigation.navigate(SCREEN_NAMES.COMMUNITY as any);
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'MISSION': return '🎯';
      case 'VERIFICATION_APPROVED': return '✅';
      case 'VERIFICATION_REJECTED': return '❌';
      case 'USER_RECOMMENDED': return '👋';
      case 'CHAT_MESSAGE': return '💬';
      case 'BADGE_EXPIRING': return '🏅';
      case 'QNA_ANSWERED': return '💡';
      case 'QNA_ACCEPTED': return '🎉';
      default: return '📢';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !item.isRead && styles.unreadCard,
      ]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      {!item.isRead && <View style={styles.unreadIndicator} />}
      <View style={[styles.iconContainer, !item.isRead && styles.iconContainerUnread]}>
        <Text style={styles.icon}>{getNotificationIcon(item.type)}</Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, !item.isRead && styles.unreadTitle]}>
            {item.title}
          </Text>
        </View>
        <Text style={styles.content} numberOfLines={2}>
          {item.content}
        </Text>
        <View style={styles.footerRow}>
          <Text style={styles.time}>{formatTimeAgo(item.createdAt)}</Text>
          {!item.isRead && <View style={styles.unreadBadge} />}
        </View>
      </View>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading && notifications.length === 0) {
    return <Loading text="알림을 불러오는 중..." />;
  }

  return (
    <View style={styles.container}>
      {/* 헤더 섹션 */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>알림</Text>
          {unreadCount > 0 && (
            <TouchableOpacity 
              style={styles.markAllButton}
              onPress={handleMarkAllAsRead}
            >
              <Text style={styles.markAllReadText}>모두 읽음</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

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
      <FlatList
        data={filter === 'unread' ? notifications.filter(n => !n.isRead) : notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="bell"
            title="알림이 없습니다"
            description={filter === 'unread'
              ? "읽지 않은 알림이 없습니다."
              : "아직 받은 알림이 없어요.\n미션을 수행하면 알림을 받을 수 있어요!"
            }
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  headerSection: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[6],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  markAllButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.green[500],
  },
  markAllReadText: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    fontWeight: typography.fontWeight.semibold as any,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    backgroundColor: colors.white,
    gap: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing[3],
    alignItems: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[50],
  },
  filterTabActive: {
    backgroundColor: colors.green[500],
    ...shadows.sm,
  },
  filterText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium as any,
  },
  filterTextActive: {
    color: colors.white,
    fontWeight: typography.fontWeight.bold as any,
  },
  listContent: {
    padding: spacing[5],
    paddingTop: spacing[4],
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    marginBottom: spacing[4],
    ...shadows.base,
    borderWidth: 1,
    borderColor: colors.gray[200],
    position: 'relative',
    overflow: 'hidden',
  },
  unreadCard: {
    backgroundColor: colors.green[50],
    borderColor: colors.green[300],
    borderWidth: 2,
  },
  unreadIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.green[500],
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[4],
  },
  iconContainerUnread: {
    backgroundColor: colors.green[200],
  },
  icon: {
    fontSize: 26,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  title: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    flex: 1,
    fontWeight: typography.fontWeight.semibold as any,
    lineHeight: 22,
  },
  unreadTitle: {
    fontWeight: typography.fontWeight.bold as any,
    color: colors.green[700],
  },
  content: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing[2],
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.green[500],
  },
});

export default NotificationScreen;
