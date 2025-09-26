import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Card, Button } from '../components/ui';
import { colors, spacing, typography, borderRadius } from '../utils/designTokens';

const ChatBotScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: '안녕하세요! 저는 당신의 마음을 들어주는 심리상담 챗봇입니다. 오늘 기분은 어떠신가요? 😊',
      timestamp: new Date(),
      emotion: 'warm'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef(null);

  // 스크롤을 맨 아래로 이동
  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // 메시지 전송
  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now(),
      type: 'user',
      text: inputText.trim(),
      timestamp: new Date(),
      emotion: 'neutral'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setIsTyping(true);

    // 봇 응답 시뮬레이션
    setTimeout(() => {
      const botResponse = generateBotResponse(inputText.trim());
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: botResponse.text,
        timestamp: new Date(),
        emotion: botResponse.emotion
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  // 봇 응답 생성 (임시)
  const generateBotResponse = (userText) => {
    const responses = [
      { text: '그렇게 생각하시는군요. 더 자세히 말씀해 주실 수 있나요? 🤗', emotion: 'caring' },
      { text: '정말 힘드셨겠어요. 그런 마음이 이해됩니다. 💙', emotion: 'empathetic' },
      { text: '좋은 생각이네요! 그런 긍정적인 마음이 중요해요. ✨', emotion: 'encouraging' },
      { text: '혼자 감당하기 어려운 일이 있으시군요. 함께 생각해보아요. 🤝', emotion: 'supportive' },
      { text: '당신의 감정을 표현해주셔서 감사해요. 더 이야기해주세요. 💚', emotion: 'warm' }
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // 빠른 응답 버튼들
  const quickResponses = [
    '오늘 기분이 좋아요 😊',
    '조금 우울해요 😔',
    '스트레스가 많아요 😰',
    '도움이 필요해요 🆘'
  ];

  const handleQuickResponse = (response) => {
    setInputText(response);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>심리상담 챗봇</Text>
          <Text style={styles.headerSubtitle}>🤖 온라인 상담사</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

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
const MessageBubble = ({ message }) => {
  const isUser = message.type === 'user';
  const emotionColors = {
    warm: colors.primary[100],
    caring: colors.blue[100],
    empathetic: colors.purple[100],
    encouraging: colors.green[100],
    supportive: colors.orange[100],
    neutral: colors.gray[100]
  };

  return (
    <View style={[
      styles.messageBubble,
      isUser ? styles.userMessage : styles.botMessage,
      { backgroundColor: emotionColors[message.emotion] || colors.gray[100] }
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing[2],
  },
  backButtonText: {
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  headerSpacer: {
    width: 40,
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
