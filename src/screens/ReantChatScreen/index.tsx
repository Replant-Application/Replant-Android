/**
 * 리앤트 채팅 스크린
 * 홈화면에서 리앤트를 터치하면 전환되는 채팅 전용 화면
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { ChatMessage, generateMessageId } from '../../utils/reantChatUtils';
import { getCharacterImage } from '../../utils/characterUtils';
import { useCharacter } from '../../hooks/useCharacter';
import { sendChatMessage } from '../../api/chatApi';
import { SCREEN_NAMES } from '../../utils/constants';
import { styles } from './ReantChatScreen.styles';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// 시간대별 배경 이미지 결정
const getBackgroundImage = (): 'day' | 'night' => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? 'day' : 'night';
};

interface ReantChatScreenProps {
  navigation: any;
  route?: any;
}

const ReantChatScreen: React.FC<ReantChatScreenProps> = ({ navigation, route: _route }) => {
  const { characters } = useCharacter();
  const currentCharacter = characters.length > 0 ? characters[0] : null;
  const reantName = currentCharacter?.name || '리앤트';

  const [inputText, setInputText] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showSpeechBubble, setShowSpeechBubble] = useState(true);
  const [currentReantMessage, setCurrentReantMessage] = useState<string>('');
  const [displayedMessage, setDisplayedMessage] = useState<string>('');
  const [backgroundType] = useState<'day' | 'night'>(getBackgroundImage());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const speechBubbleAnim = useRef(new Animated.Value(0)).current;
  const slideDownAnim = useRef(new Animated.Value(0)).current;
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isClosingRef = useRef(false);

  const runExitAnimation = useCallback((onClosed?: () => void) => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    Animated.spring(slideDownAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start(() => {
      onClosed?.();
    });
  }, [slideDownAnim]);

  useEffect(() => {
    slideDownAnim.setValue(1);
    Animated.spring(slideDownAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [slideDownAnim]);

  useEffect(() => {
    if (!navigation?.setReantChatCloseHandler) return;

    const handler = (onClosed?: () => void) => {
      runExitAnimation(onClosed);
    };

    navigation.setReantChatCloseHandler(handler);

    return () => {
      navigation.setReantChatCloseHandler(null);
    };
  }, [navigation, runExitAnimation]);

  // 화면 진입 시 인사 메시지
  useEffect(() => {
    const fetchWelcomeMessage = async () => {
      setIsLoading(true);
      const result = await sendChatMessage('안녕');
      setIsLoading(false);

      if (result.success && result.data) {
        setCurrentReantMessage(result.data.message);
        setShowSpeechBubble(true);
        Animated.timing(speechBubbleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        setCurrentReantMessage('안녕하세요! 오늘도 화이팅! 😊');
        setShowSpeechBubble(true);
        Animated.timing(speechBubbleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    };

    fetchWelcomeMessage();
  }, [speechBubbleAnim]);

  // 타이핑 애니메이션 효과
  useEffect(() => {
    if (currentReantMessage) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      setDisplayedMessage('');
      let currentIndex = 0;

      const typeNextChar = () => {
        if (currentIndex < currentReantMessage.length) {
          setDisplayedMessage(currentReantMessage.substring(0, currentIndex + 1));
          currentIndex++;
          typingTimeoutRef.current = setTimeout(typeNextChar, 50);
        }
      };

      typeNextChar();
    } else {
      setDisplayedMessage('');
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [currentReantMessage]);

  useEffect(() => {
    if (chatMessages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages]);

  const handleSend = async () => {
    if (!inputText.trim() || !currentCharacter || isLoading) return;

    const messageText = inputText.trim();
    setInputText('');
    setError(null);

    const userMessage: ChatMessage = {
      id: generateMessageId(),
      type: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setChatMessages([userMessage]);

    setIsLoading(true);
    const result = await sendChatMessage(messageText);
    setIsLoading(false);

    if (result.success && result.data) {
      setCurrentReantMessage(result.data.message);
      setShowSpeechBubble(true);
      Animated.timing(speechBubbleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      setError(result.error || '메시지 전송에 실패했습니다.');
      setCurrentReantMessage('잠깐 멍해졌어요... 다시 말해줄래요? 🤔');
      setShowSpeechBubble(true);
      Animated.timing(speechBubbleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleClose = () => {
    runExitAnimation(() => {
      navigation.navigate(SCREEN_NAMES.HOME, { fromReantChat: true });
    });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    if (item.type === 'user') {
      return (
        <View style={styles.userMessageContainer}>
          <View style={styles.userMessageBubble}>
            <Text style={styles.userMessageText}>{item.content}</Text>
          </View>
        </View>
      );
    }
    return null;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{
            translateY: slideDownAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, SCREEN_HEIGHT * 0.4],
            }),
          }],
        },
      ]}
    >
      <ImageBackground
        source={backgroundType === 'day'
          ? require('../../assets/images/day.png')
          : require('../../assets/images/night.png')
        }
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.topButtonContainer}>
          <TouchableOpacity
            style={styles.endChatButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Text style={styles.endChatButtonText}>← 대화 종료하기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heroSection}>
          {currentCharacter && (
            <>
              {showSpeechBubble && (
                <Animated.View
                  style={[
                    styles.speechBubble,
                    {
                      opacity: speechBubbleAnim,
                      transform: [
                        {
                          translateY: speechBubbleAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-10, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <ImageBackground
                    source={require('../../assets/images/conversation.png')}
                    style={styles.speechBubbleImage}
                    resizeMode="stretch"
                  >
                    <View style={styles.speechTextContainer}>
                      {isLoading ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator size="small" color="#666" />
                          <Text style={styles.loadingText}>생각 중...</Text>
                        </View>
                      ) : (
                        <Text style={styles.speechText}>
                          {displayedMessage || currentCharacter.description || '안녕하세요!'}
                        </Text>
                      )}
                    </View>
                  </ImageBackground>
                </Animated.View>
              )}

              <View style={styles.characterImageContainer}>
                <FastImage
                  key={`character-${currentCharacter.level || 1}-happy`}
                  source={getCharacterImage(currentCharacter.level || 1, 'happy')}
                  style={styles.characterImage}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </View>
            </>
          )}
        </View>

        <View style={styles.chatSection}>
          <View style={styles.dragHandleArea}>
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandleDot} />
              <View style={styles.dragHandleDot} />
              <View style={styles.dragHandleDot} />
            </View>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.messagesContainer}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <FlatList
              ref={flatListRef}
              data={chatMessages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={[
                styles.messagesList,
                chatMessages.length === 0 && { flexGrow: 0 },
              ]}
              showsVerticalScrollIndicator={false}
              scrollEnabled={chatMessages.length > 1}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {error ? (
                      `⚠️ ${error}`
                    ) : (
                      `${reantName}에게 메시지를 보내보세요!`
                    )}
                  </Text>
                </View>
              }
            />
          </KeyboardAvoidingView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="메시지를 입력하세요..."
              placeholderTextColor="#999"
              multiline
              maxLength={200}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
              activeOpacity={0.7}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.sendButtonText}>전송</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </Animated.View>
  );
};

export default ReantChatScreen;
