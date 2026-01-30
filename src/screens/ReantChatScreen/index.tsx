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
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Image,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import FastImage from 'react-native-fast-image';
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
  const [showSpeechBubble, setShowSpeechBubble] = useState(true);
  const [currentReantMessage, setCurrentReantMessage] = useState<string>('');
  const [displayedMessage, setDisplayedMessage] = useState<string>('');
  const [backgroundType] = useState<'day' | 'night'>(getBackgroundImage());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 둥둥 떠다니는 사용자 메시지
  const [floatingMessage, setFloatingMessage] = useState<string | null>(null);
  const floatingAnim = useRef(new Animated.Value(0)).current;

  const speechBubbleAnim = useRef(new Animated.Value(0)).current;
  const screenFadeAnim = useRef(new Animated.Value(0)).current;
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isClosingRef = useRef(false);

  // 화면 진입 시 페이드 인
  useEffect(() => {
    Animated.timing(screenFadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [screenFadeAnim]);

  // 화면 퇴장 시 페이드 아웃
  const runExitAnimation = useCallback((onClosed?: () => void) => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    Animated.timing(screenFadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClosed?.();
    });
  }, [screenFadeAnim]);

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

  // 둥둥 떠다니는 메시지 애니메이션 실행
  const showFloatingMessage = useCallback((message: string) => {
    setFloatingMessage(message);
    floatingAnim.setValue(0);
    
    Animated.timing(floatingAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      setFloatingMessage(null);
    });
  }, [floatingAnim]);

  const handleSend = async () => {
    if (!inputText.trim() || !currentCharacter || isLoading) return;

    const messageText = inputText.trim();
    setInputText('');
    setError(null);

    // 둥둥 떠다니는 메시지 표시
    showFloatingMessage(messageText);

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

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: screenFadeAnim,
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
        {/* 대화 종료하기 버튼 (상단 중앙) */}
        <View style={styles.topButtonContainer}>
          <TouchableOpacity
            style={styles.endChatButton}
            onPress={handleClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="대화 종료하기"
            accessibilityHint="홈으로 돌아갑니다"
          >
            <Text style={styles.endChatButtonText}>← 대화 종료하기</Text>
          </TouchableOpacity>
        </View>

        {/* 키보드 반응형 영역 */}
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.heroSection}>
            {/* 둥둥 떠다니는 사용자 메시지 */}
            {floatingMessage && (
              <Animated.View
                style={[
                  styles.floatingMessageContainer,
                  {
                    opacity: floatingAnim.interpolate({
                      inputRange: [0, 0.3, 0.7, 1],
                      outputRange: [0, 1, 1, 0],
                    }),
                    transform: [
                      {
                        translateY: floatingAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, -100],
                        }),
                      },
                      {
                        scale: floatingAnim.interpolate({
                          inputRange: [0, 0.2, 0.8, 1],
                          outputRange: [0.8, 1, 1, 0.9],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.floatingMessageBubble}>
                  <Text style={styles.floatingMessageText}>{floatingMessage}</Text>
                </View>
              </Animated.View>
            )}

            {currentCharacter && (
              <>
                {/* 말풍선 */}
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
                    {/* 3분할 말풍선: top + middle + bottom */}
                    <View style={styles.speechBubbleContainer}>
                      <Image
                        source={require('../../assets/images/conversation_top.png')}
                        style={styles.speechBubbleTop}
                        resizeMode="stretch"
                      />
                      <ImageBackground
                        source={require('../../assets/images/conversation_middle.png')}
                        style={styles.speechBubbleMiddle}
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
                      <Image
                        source={require('../../assets/images/conversation_bottom.png')}
                        style={styles.speechBubbleBottom}
                        resizeMode="stretch"
                      />
                    </View>
                  </Animated.View>
                )}

                {/* 리앤트 캐릭터 */}
                <View style={styles.characterImageContainer}>
                  <FastImage
                    key={`character-${currentCharacter.level || 1}-happy`}
                    source={getCharacterImage(currentCharacter.level || 1, 'happy')}
                    style={styles.characterImage}
                    resizeMode={FastImage.resizeMode.contain}
                    accessibilityLabel={`${currentCharacter.name || '리앤트'} 캐릭터, 레벨 ${currentCharacter.level || 1}`}
                  />
                </View>
              </>
            )}
          </View>

          {/* 하단 입력창 */}
          <View style={styles.inputContainer}>
            {error && (
              <Text style={styles.errorText}>⚠️ {error}</Text>
            )}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="메시지 입력..."
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
                accessibilityRole="button"
                accessibilityLabel="전송"
                accessibilityState={{ disabled: !inputText.trim() || isLoading }}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.sendButtonText}>전송</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </Animated.View>
  );
};

export default ReantChatScreen;
