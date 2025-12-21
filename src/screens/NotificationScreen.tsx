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
} from 'react-native';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../api/notificationApi';
import { Loading, Header, EmptyState } from '../components/ui';
import { colors, spacing, typography, borderRadius } from '../utils/designTokens';
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
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getNotificationIcon(item.type)}</Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, !item.isRead && styles.unreadTitle]}>
            {item.title}
          </Text>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.content} numberOfLines={2}>
          {item.content}
        </Text>
        <Text style={styles.time}>{formatTimeAgo(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading && notifications.length === 0) {
    return <Loading text="알림을 불러오는 중..." />;
  }

  return (
    <View style={styles.container}>
      <Header
        title="알림"
        leftButton={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ fontSize: 24 }}>←</Text>
          </TouchableOpacity>
        }
        rightButton={
          unreadCount > 0 ? (
            <TouchableOpacity onPress={handleMarkAllAsRead}>
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
    backgroundColor: colors.background.primary,
  },
  markAllReadText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium as any,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing[2],
    alignItems: 'center',
    borderRadius: borderRadius.md,
    marginHorizontal: spacing[1],
  },
  filterTabActive: {
    backgroundColor: colors.primary[500],
  },
  filterText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  filterTextActive: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.semibold as any,
  },
  listContent: {
    padding: spacing[4],
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  unreadCard: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[200],
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  icon: {
    fontSize: 20,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: typography.fontWeight.semibold as any,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
    marginLeft: spacing[2],
  },
  content: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
    lineHeight: 20,
  },
  time: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing[2],
  },
});

export default NotificationScreen;
