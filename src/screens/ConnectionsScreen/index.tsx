/**
 * 인연 화면
 * 유저 추천 및 채팅방 목록을 보여주는 화면
 * 쉬었음 청년들이 서로 연결되어 함께 성장할 수 있도록 도와줍니다.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  Platform,
} from 'react-native';
import { Loading, Header, EmptyState, TabBar } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { formatTimeAgo } from '../../utils/dateUtils';
import { useConnectionsScreenContainer } from './ConnectionsScreen.container';

interface ConnectionsScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

interface Recommendation {
  id: number;
  recommendedUser: {
    id: number;
    nickname: string;
    profileImg?: string;
    reantLevel?: number;
    reantStage?: string;
  };
  mission?: {
    id: number;
    title: string;
    type: string;
  };
  matchReason?: any;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  expiresAt: string;
  createdAt: string;
}

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
  };
  unreadCount: number;
  isActive: boolean;
  createdAt: string;
}

const ConnectionsScreen: React.FC<ConnectionsScreenProps> = ({ navigation }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    activeTab,
    recommendations,
    chatRooms,
    loading,
    refreshing,
    recommendationBadge,
    chatBadge,
    handleRefresh,
    handleTabChange,
    handleAcceptRecommendation,
    handleRejectRecommendation,
    handleOpenChat,
  } = useConnectionsScreenContainer({ navigation });


  const renderRecommendationItem = ({ item }: { item: Recommendation }) => (
    <View style={styles.recommendationCard}>
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          {item.recommendedUser.profileImg ? (
            <Image
              source={{ uri: item.recommendedUser.profileImg }}
              style={styles.avatar}
              accessibilityLabel={`${item.recommendedUser.nickname || '사용자'} 프로필 이미지`}
            />
          ) : (
            <View style={[styles.avatar, styles.defaultAvatar]}>
              <Text style={styles.avatarText}>
                {item.recommendedUser.nickname.charAt(0)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.userDetails}>
          <Text style={styles.userName}>{item.recommendedUser.nickname}</Text>
          {item.recommendedUser.reantLevel && (
            <Text style={styles.userLevel}>
              Lv.{item.recommendedUser.reantLevel} {item.recommendedUser.reantStage}
            </Text>
          )}
          {item.mission && (
            <View style={styles.matchBadge}>
              <Text style={styles.matchText}>
                "{item.mission.title}" 함께 완료!
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleRejectRecommendation(item.id)}
        >
          <Text style={styles.rejectButtonText}>다음에</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAcceptRecommendation(item.id)}
        >
          <Text style={styles.acceptButtonText}>인연 맺기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderChatRoomItem = ({ item }: { item: ChatRoom }) => (
    <TouchableOpacity
      style={styles.chatRoomCard}
      onPress={() => handleOpenChat(item.id)}
    >
      <View style={styles.avatarContainer}>
        {item.otherUser.profileImg ? (
          <Image
            source={{ uri: item.otherUser.profileImg }}
            style={styles.avatar}
            accessibilityLabel={`${item.otherUser.nickname || '사용자'} 프로필 이미지`}
          />
        ) : (
          <View style={[styles.avatar, styles.defaultAvatar]}>
            <Text style={styles.avatarText}>
              {item.otherUser.nickname.charAt(0)}
            </Text>
          </View>
        )}
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {item.unreadCount > 99 ? '99+' : item.unreadCount}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatUserName}>{item.otherUser.nickname}</Text>
          {item.lastMessage && (
            <Text style={styles.chatTime}>
              {formatTimeAgo(item.lastMessage.createdAt)}
            </Text>
          )}
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage?.content || '대화를 시작해보세요!'}
        </Text>
        {item.matchedMission && (
          <Text style={styles.matchedMission}>
            {item.matchedMission.title}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <Loading text="인연을 찾는 중..." />;
  }

  return (
    <View style={styles.container}>
      <Header
        title="인연"
        leftButton={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ fontSize: 24 }}>←</Text>
          </TouchableOpacity>
        }
      />

      {/* 탭 */}
      <TabBar
        tabs={[
          { key: 'recommendations', label: '새로운 인연', badge: recommendationBadge },
          { key: 'chats', label: '대화', badge: chatBadge },
        ]}
        activeTab={activeTab}
        onTabChange={(key) => handleTabChange(key as 'recommendations' | 'chats')}
        variant="simple"
      />

      {/* 안내 메시지 */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          {activeTab === 'recommendations'
            ? '같은 미션을 수행한 동료들을 만나보세요!'
            : '인연을 맺은 친구들과 대화해보세요!'}
        </Text>
      </View>

      {/* 목록 */}
      {activeTab === 'recommendations' ? (
        <FlatList
          data={recommendations}
          renderItem={renderRecommendationItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="users"
              title="새로운 인연이 없습니다"
              description="미션을 완료하면 같은 미션을 수행한 친구들을 만날 수 있어요!"
            />
          }
        />
      ) : (
        <FlatList
          data={chatRooms}
          renderItem={renderChatRoomItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="message-circle"
              title="대화가 없습니다"
              description="새로운 인연을 수락하면 대화를 시작할 수 있어요!"
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  infoBox: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    marginHorizontal: spacing[4],
    marginTop: spacing[3],
    borderRadius: borderRadius.md,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[700],
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  listContent: {
    padding: spacing[4],
  },
  recommendationCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  defaultAvatar: {
    backgroundColor: colors.primary[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: typography.fontSize.xl,
    color: colors.primary[700],
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xl),
  },
  userDetails: {
    marginLeft: spacing[3],
    flex: 1,
  },
  userName: {
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
  userLevel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  matchBadge: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    marginTop: spacing[2],
    alignSelf: 'flex-start',
  },
  matchText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[700],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  rejectButtonText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  acceptButton: {
    backgroundColor: colors.primary[500],
  },
  acceptButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  chatRoomCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[1],
  },
  unreadText: {
    fontSize: 10,
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(10),
  },
  chatInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatUserName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  chatTime: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  lastMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  matchedMission: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[600],
    marginTop: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
});

export default ConnectionsScreen;
