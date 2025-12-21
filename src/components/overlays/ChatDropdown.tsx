/**
 * ChatDropdown
 * 우측 상단에 표시되는 채팅 드롭다운 모달
 *
 * 특징:
 * - 최근 채팅방 5개 미리보기
 * - 읽지 않은 메시지 수 표시
 * - 채팅방 클릭 시 ChatRoomScreen 이동
 * - 전체 보기 버튼으로 ConnectionsScreen 이동
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
  Image,
} from 'react-native';
import { useOverlay } from '../../contexts/OverlayContext';
import { getChatRooms } from '../../api/chatApi';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DROPDOWN_WIDTH = Math.min(SCREEN_WIDTH - 32, 340);

interface ChatRoom {
  id: number;
  otherUser: {
    id: number;
    nickname: string;
    profileImg?: string;
  };
  matchedMission?: {
    id: number;
    title: string;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
    isRead: boolean;
  };
  unreadCount: number;
  isActive: boolean;
  createdAt: string;
}

interface ChatDropdownProps {
  onNavigate?: (screen: string, params?: any) => void;
  onViewAll?: () => void;
}

const ChatDropdown: React.FC<ChatDropdownProps> = ({
  onNavigate,
  onViewAll,
}) => {
  const { activeOverlay, closeOverlay, overlayPosition, setUnreadChatCount } = useOverlay();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));

  const isVisible = activeOverlay === 'chat';

  // 채팅방 데이터 로드
  const loadChatRooms = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getChatRooms();
      if (result.success && result.data) {
        const rooms = result.data || [];
        setChatRooms(rooms.slice(0, 5)); // 최근 5개만

        // 총 읽지 않은 메시지 수 계산
        const totalUnread = rooms.reduce((sum, room) => sum + (room.unreadCount || 0), 0);
        setUnreadChatCount(totalUnread);
      }
    } catch (error) {
      console.error('채팅방 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [setUnreadChatCount]);

  // 표시/숨김 애니메이션
  useEffect(() => {
    if (isVisible) {
      loadChatRooms();
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
  }, [isVisible, fadeAnim, scaleAnim, loadChatRooms]);

  // 상대 시간 표시
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금';
    if (minutes < 60) return `${minutes}분`;
    if (hours < 24) return `${hours}시간`;
    if (days < 7) return `${days}일`;
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 채팅방 클릭 핸들러
  const handleChatRoomPress = (room: ChatRoom) => {
    closeOverlay();
    if (onNavigate) {
      onNavigate('ChatRoom', { roomId: room.id });
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
              <Text style={styles.headerTitle}>채팅</Text>
              {chatRooms.reduce((sum, r) => sum + r.unreadCount, 0) > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>
                    {chatRooms.reduce((sum, r) => sum + r.unreadCount, 0)}
                  </Text>
                </View>
              )}
            </View>

            {/* 채팅방 목록 */}
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>로딩 중...</Text>
                </View>
              ) : chatRooms.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>💬</Text>
                  <Text style={styles.emptyText}>아직 대화가 없습니다</Text>
                  <Text style={styles.emptySubText}>
                    인연을 맺고 대화를 시작해보세요
                  </Text>
                </View>
              ) : (
                chatRooms.map((room) => (
                  <TouchableOpacity
                    key={room.id}
                    style={[
                      styles.chatItem,
                      room.unreadCount > 0 && styles.unreadItem,
                    ]}
                    onPress={() => handleChatRoomPress(room)}
                    activeOpacity={0.7}
                  >
                    {/* 프로필 이미지 */}
                    <View style={styles.avatarContainer}>
                      {room.otherUser.profileImg ? (
                        <Image
                          source={{ uri: room.otherUser.profileImg }}
                          style={styles.avatar}
                        />
                      ) : (
                        <View style={[styles.avatar, styles.defaultAvatar]}>
                          <Text style={styles.avatarText}>
                            {room.otherUser.nickname.charAt(0)}
                          </Text>
                        </View>
                      )}
                      {room.unreadCount > 0 && (
                        <View style={styles.unreadCountBadge}>
                          <Text style={styles.unreadCountText}>
                            {room.unreadCount > 99 ? '99+' : room.unreadCount}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* 채팅 정보 */}
                    <View style={styles.chatContent}>
                      <View style={styles.chatHeader}>
                        <Text
                          style={[
                            styles.nickname,
                            room.unreadCount > 0 && styles.unreadNickname,
                          ]}
                          numberOfLines={1}
                        >
                          {room.otherUser.nickname}
                        </Text>
                        {room.lastMessage && (
                          <Text style={styles.time}>
                            {formatTimeAgo(room.lastMessage.createdAt)}
                          </Text>
                        )}
                      </View>

                      {room.lastMessage ? (
                        <Text
                          style={[
                            styles.lastMessage,
                            room.unreadCount > 0 && styles.unreadMessage,
                          ]}
                          numberOfLines={1}
                        >
                          {room.lastMessage.content}
                        </Text>
                      ) : (
                        <Text style={styles.noMessage}>대화를 시작해보세요</Text>
                      )}

                      {room.matchedMission && (
                        <Text style={styles.missionTag} numberOfLines={1}>
                          🎯 {room.matchedMission.title}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            {/* 푸터 */}
            <TouchableOpacity style={styles.footer} onPress={handleViewAll}>
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
    maxHeight: 420,
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
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text.primary,
  },
  unreadBadge: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.white,
  },
  scrollView: {
    maxHeight: 300,
  },
  loadingContainer: {
    padding: spacing[8],
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  emptyContainer: {
    padding: spacing[8],
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: spacing[2],
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  emptySubText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  chatItem: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  unreadItem: {
    backgroundColor: colors.primary[50],
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing[3],
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  defaultAvatar: {
    backgroundColor: colors.primary[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.primary[700],
  },
  unreadCountBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  unreadCountText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.white,
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nickname: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    marginRight: spacing[2],
  },
  unreadNickname: {
    fontWeight: typography.fontWeight.semibold as any,
  },
  time: {
    fontSize: 10,
    color: colors.text.tertiary,
  },
  lastMessage: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  unreadMessage: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium as any,
  },
  noMessage: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  missionTag: {
    fontSize: 10,
    color: colors.primary[600],
    marginTop: spacing[1],
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
  },
});

export default ChatDropdown;
