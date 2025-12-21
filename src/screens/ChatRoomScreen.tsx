/**
 * 채팅방 화면
 * 다른 유저와 1:1 채팅을 할 수 있는 화면
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { getChatRoom, getChatMessages, sendMessage, markMessagesAsRead } from '../api/chatApi';
import { Loading, Header } from '../components/ui';
import { colors, spacing, typography, borderRadius } from '../utils/designTokens';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

interface ChatRoomScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'ChatRoom'>;
}

interface ChatMessage {
  id: number;
  senderId: number;
  content: string;
  isRead: boolean;
  isMine: boolean;
  createdAt: string;
}

interface ChatRoomInfo {
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
  isActive: boolean;
}

const ChatRoomScreen: React.FC<ChatRoomScreenProps> = ({ navigation, route }) => {
  const roomId = (route.params as any)?.roomId;
  const [roomInfo, setRoomInfo] = useState<ChatRoomInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const fetchRoomInfo = useCallback(async () => {
    if (!roomId) return;

    try {
      const result = await getChatRoom(roomId);
      if (result.success && result.data) {
        setRoomInfo(result.data as any);
      }
    } catch (error) {
      console.error('채팅방 정보 조회 실패:', error);
    }
  }, [roomId]);

  const fetchMessages = useCallback(async () => {
    if (!roomId) return;

    try {
      setLoading(true);
      const result = await getChatMessages(roomId);
      if (result.success && result.data) {
        // 메시지를 역순으로 정렬 (최신 메시지가 아래로)
        const sortedMessages = [...result.data].reverse();
        setMessages(sortedMessages);

        // 읽음 처리
        await markMessagesAsRead(roomId);
      }
    } catch (error) {
      console.error('메시지 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchRoomInfo();
    fetchMessages();

    // 주기적으로 새 메시지 확인 (폴링)
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchRoomInfo, fetchMessages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || sending) return;

    try {
      setSending(true);
      const result = await sendMessage(roomId, { content: inputText.trim() });

      if (result.success && result.data) {
        setMessages(prev => [...prev, result.data as any]);
        setInputText('');

        // 스크롤을 맨 아래로
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? '오후' : '오전';
    const hour12 = hours % 12 || 12;
    return `${ampm} ${hour12}:${minutes}`;
  };

  const formatDateDivider = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '오늘';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '어제';
    }
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const shouldShowDateDivider = (currentMsg: ChatMessage, prevMsg?: ChatMessage) => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.createdAt).toDateString();
    const prevDate = new Date(prevMsg.createdAt).toDateString();
    return currentDate !== prevDate;
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const prevMessage = index > 0 ? messages[index - 1] : undefined;
    const showDateDivider = shouldShowDateDivider(item, prevMessage);

    return (
      <View>
        {showDateDivider && (
          <View style={styles.dateDivider}>
            <Text style={styles.dateDividerText}>
              {formatDateDivider(item.createdAt)}
            </Text>
          </View>
        )}

        <View
          style={[
            styles.messageContainer,
            item.isMine ? styles.myMessageContainer : styles.otherMessageContainer,
          ]}
        >
          {!item.isMine && (
            <View style={styles.otherAvatarContainer}>
              {roomInfo?.otherUser.profileImg ? (
                <Image
                  source={{ uri: roomInfo.otherUser.profileImg }}
                  style={styles.messageAvatar}
                />
              ) : (
                <View style={[styles.messageAvatar, styles.defaultMessageAvatar]}>
                  <Text style={styles.avatarInitial}>
                    {roomInfo?.otherUser.nickname.charAt(0)}
                  </Text>
                </View>
              )}
            </View>
          )}

          <View
            style={[
              styles.messageBubble,
              item.isMine ? styles.myMessageBubble : styles.otherMessageBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                item.isMine ? styles.myMessageText : styles.otherMessageText,
              ]}
            >
              {item.content}
            </Text>
          </View>

          <View style={styles.messageInfo}>
            <Text style={styles.messageTime}>
              {formatMessageTime(item.createdAt)}
            </Text>
            {item.isMine && (
              <Text style={styles.readStatus}>
                {item.isRead ? '읽음' : ''}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading && messages.length === 0) {
    return <Loading text="채팅을 불러오는 중..." />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Header
        title={roomInfo?.otherUser.nickname || '채팅'}
        leftButton={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ fontSize: 24 }}>←</Text>
          </TouchableOpacity>
        }
      />

      {/* 미션 정보 배너 */}
      {roomInfo?.matchedMission && (
        <View style={styles.missionBanner}>
          <Text style={styles.missionBannerText}>
            "{roomInfo.matchedMission.title}" 미션으로 연결된 인연
          </Text>
        </View>
      )}

      {/* 메시지 목록 */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>대화를 시작해보세요!</Text>
            <Text style={styles.emptyDescription}>
              같은 미션을 수행한 동료와 이야기를 나눠보세요.{'\n'}
              서로의 경험을 공유하면 더 큰 힘이 됩니다.
            </Text>
          </View>
        }
      />

      {/* 입력 영역 */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="메시지를 입력하세요..."
          placeholderTextColor={colors.text.tertiary}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || sending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || sending}
        >
          <Text style={styles.sendButtonText}>전송</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  missionBanner: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  missionBannerText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[700],
    textAlign: 'center',
  },
  messageList: {
    padding: spacing[4],
    flexGrow: 1,
  },
  dateDivider: {
    alignItems: 'center',
    marginVertical: spacing[4],
  },
  dateDividerText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing[3],
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  otherAvatarContainer: {
    marginRight: spacing[2],
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  defaultMessageAvatar: {
    backgroundColor: colors.primary[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[700],
    fontWeight: typography.fontWeight.bold as any,
  },
  messageBubble: {
    maxWidth: '70%',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
  },
  myMessageBubble: {
    backgroundColor: colors.primary[500],
    borderBottomRightRadius: borderRadius.sm,
  },
  otherMessageBubble: {
    backgroundColor: colors.background.primary,
    borderBottomLeftRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  messageText: {
    fontSize: typography.fontSize.base,
    lineHeight: 22,
  },
  myMessageText: {
    color: colors.text.inverse,
  },
  otherMessageText: {
    color: colors.text.primary,
  },
  messageInfo: {
    marginHorizontal: spacing[2],
    alignItems: 'flex-end',
  },
  messageTime: {
    fontSize: 10,
    color: colors.text.tertiary,
  },
  readStatus: {
    fontSize: 10,
    color: colors.primary[500],
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing[3],
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    marginRight: spacing[2],
  },
  sendButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 40,
  },
  sendButtonDisabled: {
    backgroundColor: colors.primary[200],
  },
  sendButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold as any,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[16],
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  emptyDescription: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ChatRoomScreen;
