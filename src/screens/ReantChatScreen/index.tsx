/**
 * 리앤트 채팅 스크린
 * 홈화면에서 리앤트를 터치하면 전환되는 채팅 전용 화면 (메시지 리스트 UI)
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { getCharacterImage } from '../../utils/characterUtils';
import { useCharacter } from '../../hooks/useCharacter';
import { sendChatMessage } from '../../api/chatApi';
import { SCREEN_NAMES } from '../../utils/constants';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../utils/designTokens';
import { styles } from './ReantChatScreen.styles';

// 종이 비행기(전송) 아이콘
const PaperPlaneIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 22,
  color = colors.white,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
      fill={color}
    />
  </Svg>
);

// 추천 메시지 풀 (은둔형 외톨이 등 응원·대화 유도)
const RECOMMENDED_MESSAGES_POOL = [
  '나를 응원하는 말을 해줘',
  '오늘 하루 잘 보내고 싶어',
  '오늘 기분이 안 좋아',
  '할 일이 너무 많아서 힘들어',
  '잠깐 대화할 수 있을까?',
  '오늘 하루 어땠어?',
  '심심해',
  '조언이 필요해',
];

// 날짜 포맷: "2026년 2월 2일 월요일"
const formatDateLabel = (date: Date) => {
  const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const w = weekdays[date.getDay()];
  return `${y}년 ${m}월 ${d}일 ${w}`;
};

// 시간 포맷: "오전 9:26"
const formatTimeLabel = (date: Date) => {
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h < 12 ? '오전' : '오후';
  const h12 = h % 12 || 12;
  return `${ampm} ${h12}:${m.toString().padStart(2, '0')}`;
};

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  reantName?: string;
}

type ListItem =
  | { type: 'date'; key: string; dateLabel: string }
  | { type: 'message'; key: string; message: ChatMessage };

interface ReantChatScreenProps {
  navigation: any;
  route?: any;
}

// 현재 표시 중인 두 칩이 아닌 풀에서 랜덤 선택 (클릭한 칩을 다른 예시로 교체)
const pickReplacementChip = (currentChips: [string, string], replaceIndex: 0 | 1): string => {
  const other = currentChips[1 - replaceIndex];
  const candidates = RECOMMENDED_MESSAGES_POOL.filter(
    (m) => m !== currentChips[replaceIndex] && m !== other
  );
  if (candidates.length === 0) return RECOMMENDED_MESSAGES_POOL[0];
  return candidates[Math.floor(Math.random() * candidates.length)];
};

const ReantChatScreen: React.FC<ReantChatScreenProps> = ({ navigation, route: _route }) => {
  const { characters } = useCharacter();
  const currentCharacter = characters.length > 0 ? characters[0] : null;
  const characterName = currentCharacter?.name ?? '버디';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const voiceCommittedRef = useRef(''); // 음성으로 확정된 텍스트 (입력창에 반영)
  const listRef = useRef<FlatList>(null);
  // 표시 중인 추천 칩 두 개 (클릭 시 해당 칩만 다른 예시로 교체)
  const [recommendedChips, setRecommendedChips] = useState<[string, string]>(() => [
    RECOMMENDED_MESSAGES_POOL[0],
    RECOMMENDED_MESSAGES_POOL[1],
  ]);

  // 음성 인식 사용 가능 여부
  useEffect(() => {
    const check = async () => {
      try {
        const available = ExpoSpeechRecognitionModule?.isRecognitionAvailable?.() ?? false;
        setVoiceAvailable(available);
      } catch {
        setVoiceAvailable(false);
      }
    };
    check();
  }, []);

  useSpeechRecognitionEvent('start', () => setIsListening(true));
  useSpeechRecognitionEvent('end', () => setIsListening(false));
  useSpeechRecognitionEvent('result', (event: { results: Array<{ transcript?: string }>; isFinal?: boolean }) => {
    const transcript = event.results?.[0]?.transcript?.trim();
    if (!transcript) return;
    const isFinal = event.isFinal === true;
    if (isFinal) {
      voiceCommittedRef.current = voiceCommittedRef.current
        ? `${voiceCommittedRef.current} ${transcript}`
        : transcript;
      setInputText(voiceCommittedRef.current);
    } else {
      // 말하는 동안 실시간으로 입력창에 보여줌
      setInputText(
        voiceCommittedRef.current
          ? `${voiceCommittedRef.current} ${transcript}`
          : transcript
      );
    }
  });
  useSpeechRecognitionEvent('error', (event: { error?: string; message?: string }) => {
    setIsListening(false);
    if (event.error && event.error !== 'aborted' && event.error !== 'no-speech') {
      Alert.alert('음성 인식', event.message || '음성 인식 중 문제가 발생했어요.');
    }
  });

  const handleVoicePress = useCallback(async () => {
    if (!voiceAvailable) {
      Alert.alert('음성 입력', '이 기기에서는 음성 인식을 사용할 수 없어요.');
      return;
    }
    try {
      if (isListening) {
        ExpoSpeechRecognitionModule.stop();
        return;
      }
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) {
        Alert.alert('마이크 권한', '음성 입력을 쓰려면 마이크 권한이 필요해요.');
        return;
      }
      voiceCommittedRef.current = inputText; // 녹음 시작 시점의 입력값 유지 (이어쓰기)
      ExpoSpeechRecognitionModule.start({
        lang: 'ko-KR',
        interimResults: true,
        continuous: false,
      });
    } catch (e) {
      Alert.alert('음성 입력', '음성 인식을 시작할 수 없어요.');
    }
  }, [voiceAvailable, isListening, inputText]);

  const screenFadeAnim = useRef(new Animated.Value(0)).current;
  const isClosingRef = useRef(false);

  // 화면 진입 시 페이드 인
  useEffect(() => {
    Animated.timing(screenFadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [screenFadeAnim]);

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

  // 메시지 목록 → 날짜 구분 포함 리스트 데이터
  const listData = useMemo((): ListItem[] => {
    const out: ListItem[] = [];
    let lastDateKey = '';
    for (const msg of messages) {
      const d = msg.timestamp;
      const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (dateKey !== lastDateKey) {
        lastDateKey = dateKey;
        out.push({ type: 'date', key: `date-${dateKey}`, dateLabel: formatDateLabel(d) });
      }
      out.push({ type: 'message', key: msg.id, message: msg });
    }
    return out;
  }, [messages]);

  // 화면 진입 시 펫이 먼저 인사 (API로 인사 응답만 받아서 리스트에 추가, 사용자 "안녕" 메시지는 표시하지 않음)
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setIsLoading(true);
      const result = await sendChatMessage('안녕');
      if (!mounted) return;
      setIsLoading(false);

      const assistantText = result.success && result.data
        ? result.data.message
        : '안녕하세요! 오늘도 화이팅! 😊';
      const reantName = result.success && result.data ? result.data.reantName : characterName;
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: assistantText,
        timestamp: new Date(),
        reantName,
      };
      setMessages([assistantMsg]);
    };
    run();
    return () => { mounted = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- 초기 1회만

  const handleSend = async () => {
    if (!inputText.trim() || !currentCharacter || isLoading) return;

    const messageText = inputText.trim();
    setInputText('');
    setError(null);

    const now = new Date();
    const userMsg: ChatMessage = {
      id: `u-${now.getTime()}`,
      role: 'user',
      text: messageText,
      timestamp: now,
    };
    setMessages((prev) => [...prev, userMsg]);

    setIsLoading(true);
    const result = await sendChatMessage(messageText);
    setIsLoading(false);

    const assistantText = result.success && result.data
      ? result.data.message
      : '잠깐 멍해졌어요... 다시 말해줄래요? 🤔';
    if (!result.success && result.error) {
      setError(result.error);
    }
    const reantName = result.success && result.data ? result.data.reantName : characterName;
    const assistantMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      text: assistantText,
      timestamp: new Date(),
      reantName,
    };
    setMessages((prev) => [...prev, assistantMsg]);
  };

  const handleClose = () => {
    runExitAnimation(() => {
      navigation.navigate(SCREEN_NAMES.HOME, { fromReantChat: true });
    });
  };

  const renderListItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === 'date') {
        return (
          <View style={styles.dateSeparator}>
            <View style={styles.dateSeparatorBubble}>
              <Text style={styles.dateSeparatorIcon}>📅</Text>
              <Text style={styles.dateSeparatorText}>{item.dateLabel}</Text>
            </View>
          </View>
        );
      }
      const { message } = item;
      if (message.role === 'user') {
        return (
          <View style={styles.userMessageRow}>
            <View style={styles.userMessageColumn}>
              <View style={styles.userBubble}>
                <Text style={styles.userBubbleText}>{message.text}</Text>
              </View>
              <Text style={styles.userMessageTime}>{formatTimeLabel(message.timestamp)}</Text>
            </View>
          </View>
        );
      }
      return (
        <View style={styles.assistantMessageRow}>
          <View style={styles.assistantAvatar}>
            <FastImage
              source={getCharacterImage(currentCharacter?.level ?? 1, 'happy')}
              style={styles.assistantAvatarImage}
              resizeMode={FastImage.resizeMode.contain}
              accessibilityLabel={`${characterName ?? '리얼트'} 아바타`}
            />
          </View>
          <View style={styles.assistantBubbles}>
            <Text style={styles.assistantName}>{message.reantName ?? characterName}</Text>
            <View style={styles.assistantBubble}>
              <Text style={styles.assistantBubbleText}>{message.text}</Text>
            </View>
            <Text style={styles.assistantTime}>{formatTimeLabel(message.timestamp)}</Text>
          </View>
        </View>
      );
    },
    [currentCharacter?.level, characterName]
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: screenFadeAnim,
        },
      ]}
    >
      <View style={styles.background}>
        {/* 채팅 헤더: 뒤로가기 + 캐릭터 이름 */}
        <View style={styles.chatHeader}>
          <TouchableOpacity
            style={styles.chatHeaderBack}
            onPress={handleClose}
            activeOpacity={0.7}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
            accessibilityRole="button"
            accessibilityLabel="대화 종료"
            accessibilityHint="홈으로 돌아갑니다"
          >
            <Image
              source={require('../../assets/images/left.png')}
              style={styles.chatHeaderBackIcon}
              resizeMode="contain"
              accessibilityLabel="뒤로가기"
            />
          </TouchableOpacity>
          <Text style={styles.chatHeaderTitle}>{characterName}</Text>
          <View style={styles.chatHeaderRight} />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* 메시지 리스트 */}
          <FlatList
            ref={listRef}
            data={listData}
            renderItem={renderListItem}
            keyExtractor={(item) => item.key}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            ListFooterComponent={
              isLoading ? (
                <View style={styles.loadingRow}>
                  <View style={styles.assistantAvatar}>
                    <FastImage
                      source={getCharacterImage(currentCharacter?.level ?? 1, 'happy')}
                      style={styles.assistantAvatarImage}
                      resizeMode={FastImage.resizeMode.contain}
                      accessibilityLabel="리얼트 아바타"
                    />
                  </View>
                  <View style={styles.loadingBubble}>
                    <ActivityIndicator size="small" color="#666" />
                    <Text style={styles.loadingText}>생각 중...</Text>
                  </View>
                </View>
              ) : null
            }
          />

          {/* 하단 입력창 */}
          <View style={styles.inputContainer}>
            {error ? (
              <Text style={styles.errorText}>⚠️ {error}</Text>
            ) : null}
            <View style={styles.recommendedChipsContainer}>
              {recommendedChips.map((msg, index) => (
                <TouchableOpacity
                  key={`${msg}-${index}`}
                  style={styles.recommendedChip}
                  onPress={() => {
                    setInputText(msg);
                    setRecommendedChips((prev) => {
                      const next = [...prev] as [string, string];
                      next[index] = pickReplacementChip(prev, index as 0 | 1);
                      return next;
                    });
                  }}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`추천 메시지: ${msg}`}
                >
                  <Text style={styles.recommendedChipText}>{msg}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.inputRow}>
              <TouchableOpacity
                style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
                onPress={handleVoicePress}
                disabled={isLoading}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={isListening ? '음성 입력 중지' : '녹음하여 말하기'}
                accessibilityState={{ selected: isListening }}
              >
                <Image
                  source={require('../../assets/images/record.png')}
                  style={styles.voiceButtonIcon}
                  resizeMode="contain"
                  accessibilityLabel={isListening ? '녹음 중' : '녹음'}
                />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="대화를 시작해보세요."
                placeholderTextColor={colors.gray[400]}
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
                <PaperPlaneIcon size={22} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* 녹음 중 모달 */}
      <Modal
        visible={isListening}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.recordingModalOverlay}>
          <View style={styles.recordingModalContent}>
            <Image
              source={require('../../assets/images/recording.png')}
              style={styles.recordingModalIcon}
              resizeMode="contain"
              accessibilityLabel="녹음 중"
            />
            <Text style={styles.recordingModalText}>녹음중입니다</Text>
            <Text style={styles.recordingModalHint}>다시 누르면 녹음이 끝나요</Text>
            <TouchableOpacity
              style={styles.recordingModalCancelButton}
              onPress={() => {
                ExpoSpeechRecognitionModule.abort();
                setInputText(voiceCommittedRef.current);
              }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="녹음 취소"
            >
              <Text style={styles.recordingModalCancelButtonText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
};

export default ReantChatScreen;
