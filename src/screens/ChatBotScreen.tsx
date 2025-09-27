import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Header } from '../components/ui';
import { colors, spacing, typography, borderRadius } from '../utils/designTokens';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { chatService, ChatMessage } from '../services';

interface ChatBotScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const ChatBotScreen: React.FC<ChatBotScreenProps> = ({ navigation: _navigation }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      type: 'bot' as const,
      text: '안녕하세요! 오늘 기분은 어떠신가요? 😊',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // 스크롤을 맨 아래로 이동
  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // 메시지 전송
  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    const newMessage: ChatMessage = {
      id: Date.now(),
      type: 'user' as const,
      text: userMessage,
      timestamp: new Date(),
      emotion: 'neutral'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // 실제 API 호출
      const response = await chatService.sendMessage(userMessage);

      const botMessage: ChatMessage = {
        id: Date.now() + 1,
        type: 'bot' as const,
        text: response.error ? chatService.getFallbackResponse(userMessage) : response.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      // 에러 발생 시 fallback 응답
      const fallbackMessage: ChatMessage = {
        id: Date.now() + 1,
        type: 'bot' as const,
        text: chatService.getFallbackResponse(userMessage),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };


  // 빠른 응답 버튼들
  const quickResponses = [
    '오늘 기분이 좋아요 😊',
    '조금 우울해요 😔',
    '스트레스가 많아요 😰',
    '도움이 필요해요 🆘'
  ];

  const handleQuickResponse = (response: string) => {
    setInputText(response);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* 헤더 */}
      <Header />

      {/* 메시지 목록 */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={scrollToBottom}
      >
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
          />
        ))}

        {isTyping && (
          <View style={styles.typingContainer}>
            <Text style={styles.typingText}>상담사가 입력 중...</Text>
            <View style={styles.typingDots}>
              <Text style={styles.typingDot}>●</Text>
              <Text style={styles.typingDot}>●</Text>
              <Text style={styles.typingDot}>●</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 빠른 응답 버튼들 */}
      <View style={styles.quickResponsesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {quickResponses.map((response, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickResponseButton}
              onPress={() => handleQuickResponse(response)}
            >
              <Text style={styles.quickResponseText}>{response}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 입력 영역 */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="마음을 나누어 주세요..."
          placeholderTextColor={colors.text.tertiary}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendButtonText}>전송</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// 메시지 버블 컴포넌트
const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.type === 'user';

  return (
    <View style={[
      styles.messageBubble,
      isUser ? styles.userMessage : styles.botMessage
    ]}>
      <Text style={[
        styles.messageText,
        isUser ? styles.userMessageText : styles.botMessageText
      ]}>
        {message.text}
      </Text>
      <Text style={[
        styles.messageTime,
        isUser ? styles.userMessageTime : styles.botMessageTime
      ]}>
        {message.timestamp.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: spacing[4],
  },
  messagesContent: {
    paddingVertical: spacing[4],
  },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    marginVertical: spacing[2],
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary[500],
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gray[100],
  },
  messageText: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.normal * typography.fontSize.base,
  },
  userMessageText: {
    color: colors.white,
  },
  botMessageText: {
    color: colors.text.primary,
  },
  messageTime: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing[1],
  },
  userMessageTime: {
    color: colors.white,
    opacity: 0.8,
  },
  botMessageTime: {
    color: colors.text.tertiary,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.gray[100],
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    marginVertical: spacing[2],
  },
  typingText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginRight: spacing[2],
  },
  typingDots: {
    flexDirection: 'row',
  },
  typingDot: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginHorizontal: spacing[1],
  },
  quickResponsesContainer: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  quickResponseButton: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    marginRight: spacing[2],
  },
  quickResponseText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
    maxHeight: 100,
    marginRight: spacing[3],
  },
  sendButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  sendButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default ChatBotScreen;
