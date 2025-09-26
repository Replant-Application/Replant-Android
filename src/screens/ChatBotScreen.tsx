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

interface Message {
  id: number;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
  emotion: string;
}

interface ChatBotScreenProps {
  navigation: any;
}

const ChatBotScreen: React.FC<ChatBotScreenProps> = ({ navigation }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'bot',
      text: '안녕하세요! 저는 당신의 마음을 들어주는 심리상담 챗봇입니다. 오늘 기분은 어떠신가요? 😊',
      timestamp: new Date(),
      emotion: 'warm'
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // 스크롤을 맨 아래로 이동
  const scrollToBottom = (): void => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // 메시지 전송
  const sendMessage = (): void => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
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
      const botResponse = getBotResponse(inputText.trim());
      const botMessage: Message = {
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

  // 봇 응답 생성 (간단한 규칙 기반)
  const getBotResponse = (userMessage: string): { text: string; emotion: string } => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('안녕') || lowerMessage.includes('hello')) {
      return {
        text: '안녕하세요! 오늘 하루는 어떠셨나요? 기분이 좋으시거나 힘든 일이 있으시면 언제든 말씀해주세요. 😊',
        emotion: 'warm'
      };
    }
    
    if (lowerMessage.includes('힘들') || lowerMessage.includes('스트레스') || lowerMessage.includes('우울')) {
      return {
        text: '힘든 시간을 보내고 계시는군요. 그런 감정을 느끼는 것은 자연스러운 일입니다. 혼자 감당하기 어려우시다면 주변 사람들에게 도움을 요청하는 것도 좋은 방법이에요. 🌱',
        emotion: 'caring'
      };
    }
    
    if (lowerMessage.includes('기쁘') || lowerMessage.includes('좋') || lowerMessage.includes('행복')) {
      return {
        text: '좋은 일이 있으셨군요! 기쁜 마음을 나눠주셔서 저도 기뻐요. 이런 긍정적인 에너지가 계속되길 바랍니다. ✨',
        emotion: 'happy'
      };
    }
    
    if (lowerMessage.includes('고마') || lowerMessage.includes('감사')) {
      return {
        text: '감사 인사를 해주셔서 저도 기뻐요! 서로를 배려하는 마음이 정말 소중하죠. 🙏',
        emotion: 'grateful'
      };
    }
    
    if (lowerMessage.includes('미션') || lowerMessage.includes('목표')) {
      return {
        text: '목표를 향해 나아가고 계시는군요! 작은 단계부터 차근차근 진행하시면 됩니다. 완벽하지 않아도 괜찮아요. 한 걸음씩 나아가는 것이 중요합니다. 💪',
        emotion: 'encouraging'
      };
    }
    
    // 기본 응답
    return {
      text: '말씀해주셔서 감사해요. 제가 도울 수 있는 것이 있다면 언제든 말씀해주세요. 당신의 이야기를 들어드릴 준비가 되어있어요. 🤗',
      emotion: 'supportive'
    };
  };

  // 감정별 색상
  const getEmotionColor = (emotion: string): string => {
    const emotionColors: Record<string, string> = {
      'warm': colors.orange[500],
      'caring': colors.blue[500],
      'happy': colors.green[500],
      'grateful': colors.purple[500],
      'encouraging': colors.primary[500],
      'supportive': colors.gray[600],
      'neutral': colors.gray[500]
    };
    return emotionColors[emotion] || colors.gray[500];
  };

  // 메시지 포맷팅
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // 뒤로가기
  const handleGoBack = (): void => {
    navigation.goBack();
  };

  // 메시지가 추가될 때마다 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>심리상담 챗봇</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.type === 'user' ? styles.userMessage : styles.botMessage
            ]}
          >
            <Card style={[
              styles.messageCard,
              message.type === 'user' ? styles.userMessageCard : styles.botMessageCard,
              { borderLeftColor: getEmotionColor(message.emotion) }
            ]}>
              <Text style={[
                styles.messageText,
                message.type === 'user' ? styles.userMessageText : styles.botMessageText
              ]}>
                {message.text}
              </Text>
              <Text style={[
                styles.messageTime,
                message.type === 'user' ? styles.userMessageTime : styles.botMessageTime
              ]}>
                {formatTime(message.timestamp)}
              </Text>
            </Card>
          </View>
        ))}
        
        {isTyping && (
          <View style={styles.typingContainer}>
            <Card style={styles.typingCard}>
              <Text style={styles.typingText}>상담사가 입력 중...</Text>
            </Card>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="메시지를 입력하세요..."
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
            <Text style={[
              styles.sendButtonText,
              !inputText.trim() && styles.sendButtonTextDisabled
            ]}>
              전송
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.characterCount}>{inputText.length}/500</Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[20],
    paddingBottom: spacing[5],
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
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing[4],
  },
  messageContainer: {
    marginBottom: spacing[3],
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  messageCard: {
    maxWidth: '80%',
    borderLeftWidth: 4,
  },
  userMessageCard: {
    backgroundColor: colors.primary[500],
  },
  botMessageCard: {
    backgroundColor: colors.background.primary,
  },
  messageText: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  userMessageText: {
    color: colors.text.inverse,
  },
  botMessageText: {
    color: colors.text.primary,
  },
  messageTime: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing[1],
  },
  userMessageTime: {
    color: colors.text.inverse,
    opacity: 0.7,
  },
  botMessageTime: {
    color: colors.text.tertiary,
  },
  typingContainer: {
    alignItems: 'flex-start',
  },
  typingCard: {
    backgroundColor: colors.background.primary,
    borderLeftWidth: 4,
    borderLeftColor: colors.gray[400],
  },
  typingText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  inputContainer: {
    padding: spacing[4],
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[2],
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.base,
    padding: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.base,
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  sendButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.medium,
  },
  sendButtonTextDisabled: {
    color: colors.text.tertiary,
  },
  characterCount: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'right',
    marginTop: spacing[1],
  },
});

export default ChatBotScreen;
