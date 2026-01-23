/**
 * HomeScreen 비즈니스 로직
 * 홈 화면: 투두리스트 로드, 시간대별 미션 그룹화, 완료 확인, 레벨업 감지
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Animated, PanResponder, Dimensions } from 'react-native';
import { useCharacter } from '../../hooks/useCharacter';
import { getBackgroundImage } from './HomeScreen.utils';
import { getActiveTodoLists, getTodoListDetail } from '../../api/todolistApi';
import { normalizeDate } from '../../utils/dateUtils';
import { TodoList, TodoMission } from '../../types/todolist';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { ChatMessage, generateReantResponse, generateMessageId } from '../../utils/reantChatUtils';
import { getData, setData, getStorageKeys } from '../../services/storage';
import { useUser } from '../../contexts/UserContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HomeScreenContainerProps {
  navigation: NavigationProp<RootStackParamList>;
}

export const useHomeScreenContainer = ({ navigation }: HomeScreenContainerProps) => {
  const { characters, error: characterError } = useCharacter();
  const { currentNickname } = useUser();

  // 배경 이미지 상태 및 애니메이션
  const [backgroundType, setBackgroundType] = useState<'day' | 'night'>(getBackgroundImage());
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // 투두리스트 상태
  const [activeTodoLists, setActiveTodoLists] = useState<TodoList[]>([]);
  const [todoMissionsByTime, setTodoMissionsByTime] = useState<
    Map<string, { mission: TodoMission; todoListTitle: string }[]>
  >(new Map());
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // 말풍선 표시 상태
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const speechBubbleAnim = useRef(new Animated.Value(0)).current;
  const [currentReantMessage, setCurrentReantMessage] = useState<string>('');
  const [displayedMessage, setDisplayedMessage] = useState<string>('');
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 채팅 관련 상태
  const [showChatBottomSheet, setShowChatBottomSheet] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // 투두리스트 완료 상태
  const [completedTodoList, setCompletedTodoList] = useState<TodoList | null>(null);

  // 캐릭터 감정 상태
  const [characterEmotion, setCharacterEmotion] = useState<'default' | 'happy'>('default');

  // 히어로 섹션 접힘 상태
  const [isHeroCollapsed, setIsHeroCollapsed] = useState(false);

  // 진화 모달 상태
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);
  const [lastSeenLevel, setLastSeenLevel] = useState<number | null>(null);
  const evolutionFadeAnim = useRef(new Animated.Value(0)).current;

  // 캐릭터 영역 슬라이딩 상태
  const MIN_HERO_HEIGHT = SCREEN_HEIGHT * 0.1;
  const MAX_HERO_HEIGHT = SCREEN_HEIGHT * 0.45;
  const heroHeightAnim = useRef(new Animated.Value(MAX_HERO_HEIGHT)).current;

  // 단일 캐릭터 시스템이므로 첫 번째 캐릭터 사용
  const currentCharacter = characters.length > 0 ? characters[0] : null;

  /**
   * 마지막으로 본 레벨 로드 (앱 시작 시)
   */
  useEffect(() => {
    const loadLastSeenLevel = async () => {
      if (!currentNickname) return;
      
      try {
        const storageKeys = getStorageKeys(currentNickname);
        const savedLevel = await getData(`${storageKeys.CHARACTERS}_lastSeenLevel`);
        
        if (savedLevel !== null && savedLevel !== undefined) {
          setLastSeenLevel(savedLevel);
        } else {
          // 저장된 레벨이 없으면 null로 설정 (나중에 현재 레벨로 초기화)
          setLastSeenLevel(null);
        }
      } catch (error) {
        console.error('마지막으로 본 레벨 로드 실패:', error);
        setLastSeenLevel(null);
      }
    };

    loadLastSeenLevel();
  }, [currentNickname]);

  /**
   * 레벨업 감지 및 진화 모달 표시
   */
  useEffect(() => {
    if (currentCharacter && currentCharacter.level) {
      const currentLevel = currentCharacter.level;

      // 저장된 마지막으로 본 레벨과 비교 (앱을 껐다가 켰을 때도 감지)
      const shouldShowEvolution = lastSeenLevel !== null && currentLevel > lastSeenLevel;
      
      // 또는 세션 내 레벨업 감지 (앱이 켜져 있을 때)
      const sessionLevelUp = previousLevel !== null && currentLevel > previousLevel;

      if (shouldShowEvolution || sessionLevelUp) {
        // 진화 모달 표시
        setShowEvolutionModal(true);
        Animated.timing(evolutionFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }

      // 현재 레벨을 이전 레벨로 저장 (세션 내 추적용)
      setPreviousLevel(currentLevel);

      // 초기 로드 시 저장된 레벨이 없으면 현재 레벨을 저장
      if (lastSeenLevel === null && currentNickname) {
        const saveInitialLevel = async () => {
          try {
            const storageKeys = getStorageKeys(currentNickname);
            await setData(`${storageKeys.CHARACTERS}_lastSeenLevel`, currentLevel);
            setLastSeenLevel(currentLevel);
          } catch (error) {
            console.error('초기 레벨 저장 실패:', error);
          }
        };
        saveInitialLevel();
      }
    } else if (currentCharacter && !previousLevel) {
      // 초기 로드 시 현재 레벨 저장
      const initialLevel = currentCharacter.level || 1;
      setPreviousLevel(initialLevel);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCharacter?.level, previousLevel, lastSeenLevel, currentNickname]);

  /**
   * 데이터 로딩 - 각 API 개별적으로 안전하게 처리
   */
  const loadData = useCallback(async () => {
    try {
      setDataLoading(true);
      setDataError(null);

      // 투두리스트 로드 (개별 try-catch)
      try {
        const todoListResult = await getActiveTodoLists();
        console.log('[HomeScreen] getActiveTodoLists 응답:', JSON.stringify(todoListResult, null, 2));
        
        if (todoListResult?.success && Array.isArray(todoListResult.data)) {
          console.log('[HomeScreen] 전체 투두리스트 수:', todoListResult.data.length);
          console.log('[HomeScreen] 전체 투두리스트 데이터:', todoListResult.data.map(tl => ({
            id: tl.id,
            title: tl.title,
            status: tl.status,
            completedCount: tl.completedCount,
            totalCount: tl.totalCount
          })));
          
          // 오늘 날짜인 투두리스트만 "진행중"에 표시 (TodoListScreen과 동일한 로직)
          // 과거 날짜의 미완료 투두리스트는 제외
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const activeTodoLists = todoListResult.data.filter(todoList => {
            if (!todoList.createdAt) return false;
            
            // 날짜 정규화 (배열 형태 처리)
            const normalizedDate = normalizeDate(todoList.createdAt);
            if (!normalizedDate) return false;
            
            const createdDate = new Date(normalizedDate);
            if (isNaN(createdDate.getTime())) {
              console.warn('[HomeScreen] 잘못된 날짜 형식:', todoList.createdAt);
              return false;
            }
            createdDate.setHours(0, 0, 0, 0);

            // 오늘 날짜이고 완료되지 않은 투두리스트만
            const isToday = createdDate.getTime() === today.getTime();
            const isNotCompleted = todoList.status === 'ACTIVE' && todoList.completedCount < todoList.totalCount;

            console.log(`[HomeScreen] 투두리스트 ${todoList.id} 필터링:`, {
              title: todoList.title,
              createdAt: todoList.createdAt,
              normalizedDate,
              createdDate: createdDate.toISOString(),
              isToday,
              isNotCompleted,
              matches: isToday && isNotCompleted
            });

            return isToday && isNotCompleted;
          });

          console.log('[HomeScreen] 필터링 후 진행중 투두리스트 수:', activeTodoLists.length);
          console.log('[HomeScreen] 필터링된 투두리스트:', activeTodoLists.map(tl => ({
            id: tl.id,
            title: tl.title,
            completedCount: tl.completedCount,
            totalCount: tl.totalCount
          })));
          setActiveTodoLists(activeTodoLists);

          // 각 투두리스트의 상세 정보를 가져와서 미션 추출 및 완료 확인
          const missionsByTime = new Map<
            string,
            { mission: TodoMission; todoListTitle: string }[]
          >();

          for (const todoList of activeTodoLists) {
            try {
              const detailResult = await getTodoListDetail(todoList.id);
              if (detailResult?.success && detailResult.data) {
                const todoListDetail = detailResult.data;

                // 미션 추출 (시간대별로 그룹화) - 완료된 미션도 포함
                if (todoListDetail.missions) {
                  for (const mission of todoListDetail.missions) {
                    // 시간이 설정된 미션만 (완료 여부와 관계없이)
                    if (mission.scheduledStartTime) {
                      const timeKey = mission.scheduledStartTime; // "09:00" 형식
                      if (!missionsByTime.has(timeKey)) {
                        missionsByTime.set(timeKey, []);
                      }
                      missionsByTime.get(timeKey)!.push({
                        mission,
                        todoListTitle: todoListDetail.title,
                      });
                    }
                  }
                }

                // 투두리스트 완료 확인
                const allMissionsCompleted = todoListDetail.missions
                  ? todoListDetail.missions.every(mission => mission.isCompleted)
                  : todoListDetail.completedCount > 0 &&
                    todoListDetail.completedCount === todoListDetail.totalCount;

                // 투두리스트가 오늘 생성되었는지 확인
                const isTodayCreated = (() => {
                  if (!todoListDetail.createdAt) return false;
                  
                  // 날짜 정규화 (배열 형태 처리)
                  const normalizedDate = normalizeDate(todoListDetail.createdAt);
                  if (!normalizedDate) return false;
                  
                  const createdDate = new Date(normalizedDate);
                  if (isNaN(createdDate.getTime())) {
                    console.warn('[HomeScreen] 잘못된 날짜 형식:', todoListDetail.createdAt);
                    return false;
                  }
                  
                  const today = new Date();
                  return (
                    createdDate.getFullYear() === today.getFullYear() &&
                    createdDate.getMonth() === today.getMonth() &&
                    createdDate.getDate() === today.getDate()
                  );
                })();

                // 모든 미션이 완료되었고 오늘 생성된 투두리스트인 경우 완료 상태 저장
                if (allMissionsCompleted && isTodayCreated) {
                  console.log('[HomeScreen] 완료된 투두리스트 감지:', {
                    id: todoListDetail.id,
                    title: todoListDetail.title,
                    allMissionsCompleted,
                    isTodayCreated
                  });
                  setCompletedTodoList(todoListDetail);
                  break; // 하나만 표시
                }
              } else {
                // 에러가 발생해도 다른 투두리스트는 계속 로드
                console.log(
                  `[HomeScreen] 투두리스트 ${todoList.id} 상세 정보 로드 실패:`,
                  detailResult?.error
                );
              }
            } catch (e) {
              // 개별 투두리스트 로드 실패는 무시하고 계속 진행
              console.log(`[HomeScreen] 투두리스트 ${todoList.id} 상세 정보 로드 실패:`, e);
            }
          }

          // 시간대로 정렬 (Map을 배열로 변환하고 정렬)
          const sortedMissionsByTime = new Map(
            Array.from(missionsByTime.entries()).sort((a, b) => a[0].localeCompare(b[0]))
          );

          setTodoMissionsByTime(sortedMissionsByTime);
        } else {
          setActiveTodoLists([]);
          setTodoMissionsByTime(new Map());
        }
      } catch (e) {
        console.log('투두리스트 로드 실패:', e);
        setActiveTodoLists([]);
        setTodoMissionsByTime(new Map());
      }
    } catch (error) {
      console.log('데이터 로드 전체 실패:', error);
      setDataError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * 시간에 따른 배경 변경 감지
   */
  useEffect(() => {
    const checkTime = () => {
      const newBackgroundType = getBackgroundImage();
      if (newBackgroundType !== backgroundType) {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }).start(() => {
          setBackgroundType(newBackgroundType);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }).start();
        });
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, [backgroundType, fadeAnim]);

  /**
   * 타이핑 애니메이션 효과
   */
  useEffect(() => {
    if (currentReantMessage) {
      // 기존 타이핑 애니메이션 취소
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // 타이핑 시작
      setDisplayedMessage('');
      let currentIndex = 0;
      
      const typeNextChar = () => {
        if (currentIndex < currentReantMessage.length) {
          setDisplayedMessage(currentReantMessage.substring(0, currentIndex + 1));
          currentIndex++;
          typingTimeoutRef.current = setTimeout(typeNextChar, 50); // 한 글자당 50ms
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

  /**
   * 캐릭터 클릭 핸들러 - 채팅창 열기
   */
  const handleCharacterPress = useCallback((): void => {
    setCharacterEmotion('happy');
    setShowChatBottomSheet(true);
    
    // 채팅창 열 때 이전 메시지 초기화 (일회성 대화)
    setChatMessages([]);
    
    // 인사 메시지를 말풍선에만 표시
    const welcomeMessage = generateReantResponse('안녕', currentCharacter?.name || '리앤트', currentCharacter?.level || 1);
    setCurrentReantMessage(welcomeMessage);
    setShowSpeechBubble(true);
    Animated.timing(speechBubbleAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [speechBubbleAnim, currentCharacter]);

  /**
   * 채팅 메시지 전송 핸들러 (일회성 대화)
   */
  const handleSendMessage = useCallback((message: string) => {
    if (!message.trim() || !currentCharacter) return;

    // 이전 메시지 모두 지우고 새로운 사용자 메시지만 표시 (일회성)
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      type: 'user',
      content: message,
      timestamp: new Date(),
    };

    // 이전 메시지 초기화하고 새로운 메시지만 표시
    setChatMessages([userMessage]);

    // 리앤트 응답 생성 (말풍선에만 표시)
    const reantResponse = generateReantResponse(
      message,
      currentCharacter.name || '리앤트',
      currentCharacter.level || 1
    );

    setCurrentReantMessage(reantResponse);

    // 말풍선에 리앤트 응답 표시
    setShowSpeechBubble(true);
    Animated.timing(speechBubbleAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // 사용자가 다른 입력하기 전까지 말풍선 유지 (자동 숨김 제거)
  }, [currentCharacter, speechBubbleAnim]);

  /**
   * 채팅창 닫기 핸들러
   */
  const handleCloseChat = useCallback(() => {
    setShowChatBottomSheet(false);
    setCharacterEmotion('default');
    // 채팅창을 닫을 때 말풍선도 숨김
    setShowSpeechBubble(false);
  }, []);

  /**
   * 진화 모달 닫기 핸들러
   */
  const handleEvolutionModalClose = useCallback(async (): Promise<void> => {
    Animated.timing(evolutionFadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(async () => {
      setShowEvolutionModal(false);
      
      // 모달을 닫을 때 현재 레벨을 저장 (다음 앱 시작 시 비교용)
      if (currentCharacter && currentCharacter.level && currentNickname) {
        try {
          const storageKeys = getStorageKeys(currentNickname);
          await setData(`${storageKeys.CHARACTERS}_lastSeenLevel`, currentCharacter.level);
          setLastSeenLevel(currentCharacter.level);
        } catch (error) {
          console.error('마지막으로 본 레벨 저장 실패:', error);
        }
      }
    });
  }, [evolutionFadeAnim, currentCharacter, currentNickname]);

  /**
   * 드래그 핸들 클릭 핸들러
   */
  const handleDragHandlePress = useCallback(() => {
    const currentHeight = (heroHeightAnim as any)._value;
    const willCollapse = currentHeight > (MIN_HERO_HEIGHT + MAX_HERO_HEIGHT) / 2;
    const targetHeight = willCollapse ? MIN_HERO_HEIGHT : MAX_HERO_HEIGHT;
    setIsHeroCollapsed(willCollapse);
    Animated.spring(heroHeightAnim, {
      toValue: targetHeight,
      useNativeDriver: false,
      friction: 8,
    }).start();
  }, [heroHeightAnim]);

  /**
   * PanResponder 설정
   */
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        const currentHeight = (heroHeightAnim as any)._value;
        let newHeight = currentHeight + gestureState.dy * 0.5;
        newHeight = Math.max(MIN_HERO_HEIGHT, Math.min(MAX_HERO_HEIGHT, newHeight));
        heroHeightAnim.setValue(newHeight);
      },
      onPanResponderRelease: (_, gestureState) => {
        const currentHeight = (heroHeightAnim as any)._value;
        if (gestureState.dy < -30) {
          setIsHeroCollapsed(true);
          Animated.spring(heroHeightAnim, {
            toValue: MIN_HERO_HEIGHT,
            useNativeDriver: false,
            friction: 8,
          }).start();
        } else if (gestureState.dy > 30) {
          setIsHeroCollapsed(false);
          Animated.spring(heroHeightAnim, {
            toValue: MAX_HERO_HEIGHT,
            useNativeDriver: false,
            friction: 8,
          }).start();
        } else {
          const midPoint = (MIN_HERO_HEIGHT + MAX_HERO_HEIGHT) / 2;
          const willCollapse = currentHeight < midPoint;
          setIsHeroCollapsed(willCollapse);
          Animated.spring(heroHeightAnim, {
            toValue: willCollapse ? MIN_HERO_HEIGHT : MAX_HERO_HEIGHT,
            useNativeDriver: false,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  /**
   * 투두리스트 상세로 이동
   */
  const handleTodoListPress = useCallback(
    (todoListTitle: string) => {
      const todoList = activeTodoLists.find(tl => tl.title === todoListTitle);
      if (todoList) {
        navigation.navigate('TodoListDetail' as any, { todoListId: todoList.id });
      }
    },
    [activeTodoLists, navigation]
  );

  return {
    // Character
    currentCharacter,
    characterError,
    characterEmotion,
    // Background
    backgroundType,
    fadeAnim,
    // Todo Lists
    activeTodoLists,
    todoMissionsByTime,
    dataLoading,
    dataError,
    completedTodoList,
    // Speech Bubble
    showSpeechBubble,
    speechBubbleAnim,
    currentReantMessage,
    displayedMessage,
    // Chat
    showChatBottomSheet,
    chatMessages,
    handleSendMessage,
    handleCloseChat,
    // Hero Section
    isHeroCollapsed,
    heroHeightAnim,
    MIN_HERO_HEIGHT,
    MAX_HERO_HEIGHT,
    panResponder,
    // Evolution Modal
    showEvolutionModal,
    evolutionFadeAnim,
    // Handlers
    loadData,
    handleCharacterPress,
    handleEvolutionModalClose,
    handleDragHandlePress,
    handleTodoListPress,
  };
};
