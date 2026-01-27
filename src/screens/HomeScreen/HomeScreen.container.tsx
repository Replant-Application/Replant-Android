/**
 * HomeScreen 비즈니스 로직
 * 홈 화면: 투두리스트 로드, 시간대별 미션 그룹화, 완료 확인, 레벨업 감지
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Animated, PanResponder, Dimensions } from 'react-native';
import { useCharacter } from '../../hooks/useCharacter';
import { getBackgroundImage } from './HomeScreen.utils';
import { getActiveTodoLists, getTodoListDetail } from '../../api/todolistApi';
import { normalizeDate } from '../../utils/dateUtils';
import { filterTodayActiveTodoLists } from '../../utils/todolistUtils';
import { TodoList, TodoMission } from '../../types/todolist';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { getData, setData, getStorageKeys } from '../../services/storage';
import { useUser } from '../../contexts/UserContext';
import { sendChatMessage } from '../../api/chatApi';
import { ChatMessage, generateMessageId } from '../../utils/reantChatUtils';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HomeScreenContainerProps {
  navigation: NavigationProp<RootStackParamList>;
  route?: {
    params?: {
      fromReantChat?: boolean;
    };
  };
}

export const useHomeScreenContainer = ({ navigation, route }: HomeScreenContainerProps) => {
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

  // 말풍선 표시 상태 (안내 메시지용)
  const [showSpeechBubble, setShowSpeechBubble] = useState(true);
  const speechBubbleAnim = useRef(new Animated.Value(1)).current;
  const [displayedMessage, setDisplayedMessage] = useState<string>('눌러서 대화하기');
  const guidanceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 안내 메시지 목록
  const guidanceMessages = useMemo(
    () => ['눌러서 대화하기', '오늘 하루는 어땠어요?', '심심하면 말 걸어줘요~'],
    []
  );

  // 바텀시트: 투두 vs 채팅 모드 (리앤트 탭 시 채팅으로 전환, 별도 화면 이동 없음)
  const [showChatInBottomSheet, setShowChatInBottomSheet] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [reantChatResponse, setReantChatResponse] = useState<string | null>(null);
  const [reantChatLoading, setReantChatLoading] = useState(false);

  const bottomSheetTranslateY = useRef(new Animated.Value(0)).current;

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
        console.log('\n🔵 [HomeScreen] ========== 투두리스트 로드 시작 ==========');
        const todoListResult = await getActiveTodoLists();
        console.log('[HomeScreen] getActiveTodoLists 응답:', JSON.stringify(todoListResult, null, 2));
        
        if (todoListResult?.success && Array.isArray(todoListResult.data)) {
          console.log('[HomeScreen] ✅ API 응답 성공');
          console.log('[HomeScreen] 전체 투두리스트 수:', todoListResult.data.length);
          console.log('[HomeScreen] 전체 투두리스트 상세 데이터:');
          todoListResult.data.forEach((tl, index) => {
            console.log(`  [${index + 1}] ID:${tl.id}, 제목:"${tl.title}", 상태:${tl.status}, 완료:${tl.completedCount}/${tl.totalCount}, createdAt:`, tl.createdAt);
          });
          
          // 오늘 날짜인 투두리스트만 "진행중"에 표시 (TodoListScreen과 동일한 로직)
          // 과거 날짜의 미완료 투두리스트는 제외
          const filteredTodoLists = filterTodayActiveTodoLists(todoListResult.data, 'HomeScreen');

          console.log('[HomeScreen] 📊 필터링 결과 요약:');
          console.log(`  - 필터링 전: ${todoListResult.data.length}개`);
          console.log(`  - 필터링 후: ${filteredTodoLists.length}개`);
          if (filteredTodoLists.length > 0) {
            console.log('[HomeScreen] ✅ 필터링된 투두리스트 목록:');
            filteredTodoLists.forEach((tl, index) => {
              console.log(`  [${index + 1}] ID:${tl.id}, 제목:"${tl.title}", 완료:${tl.completedCount}/${tl.totalCount}`);
            });
          } else {
            console.log('[HomeScreen] ⚠️ 필터링된 투두리스트가 없습니다!');
          }
          console.log('🔵 [HomeScreen] ========== 투두리스트 로드 완료 ==========\n');
          
          console.log('[HomeScreen] 🔵 setActiveTodoLists 호출 전:', {
            activeTodoListsLength: filteredTodoLists.length,
            activeTodoListsIds: filteredTodoLists.map(tl => tl.id)
          });
          setActiveTodoLists(filteredTodoLists);
          console.log('[HomeScreen] 🔵 setActiveTodoLists 호출 완료');

          // 각 투두리스트의 상세 정보를 가져와서 미션 추출 및 완료 확인
          // 이 부분에서 에러가 발생해도 activeTodoLists는 유지되어야 함
          try {
            const missionsByTime = new Map<
              string,
              { mission: TodoMission; todoListTitle: string }[]
            >();

            console.log(`[HomeScreen] 미션 추출 시작: ${filteredTodoLists.length}개 투두리스트`);
            for (const todoList of filteredTodoLists) {
            try {
              const detailResult = await getTodoListDetail(todoList.id);
              if (detailResult?.success && detailResult.data) {
                const todoListDetail = detailResult.data;

                console.log(`[HomeScreen] 투두리스트 ${todoList.id} 미션 수:`, todoListDetail.missions?.length || 0);

                // 미션 추출 (시간대별로 그룹화) - 완료된 미션도 포함
                if (todoListDetail.missions) {
                  for (const mission of todoListDetail.missions) {
                    // 시간이 설정된 미션은 시간대로 그룹화
                    if (mission.scheduledStartTime) {
                      // 안전하게 문자열로 변환
                      const timeKey = String(mission.scheduledStartTime); // "09:00" 형식
                      if (timeKey && timeKey.trim() !== '') {
                        if (!missionsByTime.has(timeKey)) {
                          missionsByTime.set(timeKey, []);
                        }
                        missionsByTime.get(timeKey)!.push({
                          mission,
                          todoListTitle: todoListDetail.title,
                        });
                      } else {
                        console.warn('[HomeScreen] 빈 시간 키 발견:', mission.scheduledStartTime);
                      }
                    } else {
                      // 시간이 없는 미션은 "시간 미정" 그룹에 추가
                      const timeKey = '시간 미정';
                      if (!missionsByTime.has(timeKey)) {
                        missionsByTime.set(timeKey, []);
                      }
                      missionsByTime.get(timeKey)!.push({
                        mission,
                        todoListTitle: todoListDetail.title,
                      });
                      console.log(`[HomeScreen] 미션 ${mission.id} (${mission.title}): 시간 미정으로 추가`);
                    }
                  }
                } else {
                  console.log(`[HomeScreen] 투두리스트 ${todoList.id}: missions 배열 없음`);
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
          try {
            const sortedMissionsByTime = new Map(
              Array.from(missionsByTime.entries()).sort((a, b) => {
                const timeA = a[0];
                const timeB = b[0];
                // 안전 검사: 문자열이 아니거나 undefined인 경우 처리
                if (!timeA || typeof timeA !== 'string') {
                  console.warn('[HomeScreen] 잘못된 시간 키:', timeA);
                  return 1; // 뒤로 보냄
                }
                if (!timeB || typeof timeB !== 'string') {
                  console.warn('[HomeScreen] 잘못된 시간 키:', timeB);
                  return -1; // 앞으로 보냄
                }
                return timeA.localeCompare(timeB);
              })
            );
            setTodoMissionsByTime(sortedMissionsByTime);
          } catch (sortError) {
            console.error('[HomeScreen] 시간대 정렬 실패:', sortError);
            // 정렬 실패해도 빈 Map으로 설정하여 계속 진행
            setTodoMissionsByTime(new Map());
          }
          } catch (missionLoadError) {
            // 미션 상세 정보 로드 실패해도 activeTodoLists는 유지
            console.error('[HomeScreen] 미션 상세 정보 로드 중 에러 발생:', missionLoadError);
            console.log('[HomeScreen] ⚠️ 에러 발생했지만 activeTodoLists는 유지:', {
              activeTodoListsLength: activeTodoLists.length,
              activeTodoListsIds: activeTodoLists.map(tl => tl.id)
            });
            // todoMissionsByTime만 빈 Map으로 설정
            setTodoMissionsByTime(new Map());
          }
        } else {
          setActiveTodoLists([]);
          setTodoMissionsByTime(new Map());
        }
      } catch (e) {
        console.log('[HomeScreen] 투두리스트 로드 실패:', e);
        // API 호출 자체가 실패한 경우에만 빈 배열로 설정
        setActiveTodoLists([]);
        setTodoMissionsByTime(new Map());
      }
    } catch (error) {
      console.log('데이터 로드 전체 실패:', error);
      setDataError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setDataLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
   * 화면 마운트 시 말풍선 초기화, 10초마다 안내 메시지 순환 (채팅 바텀시트 열려 있으면 중단)
   */
  useEffect(() => {
    if (showChatInBottomSheet) return;
    setDisplayedMessage('눌러서 대화하기');
    setShowSpeechBubble(true);
    let messageIndex = 0;
    guidanceIntervalRef.current = setInterval(() => {
      messageIndex = (messageIndex + 1) % guidanceMessages.length;
      Animated.timing(speechBubbleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setDisplayedMessage(guidanceMessages[messageIndex]);
        Animated.timing(speechBubbleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }, 10000);
    return () => {
      if (guidanceIntervalRef.current) clearInterval(guidanceIntervalRef.current);
    };
  }, [speechBubbleAnim, showChatInBottomSheet, guidanceMessages]);

  /**
   * ReantChat에서 복귀 시 (fromReantChat) 바텀시트 애니메이션 (다른 경로로 ReantChat 갔다 오는 경우 대비)
   * 리앤트 이미지를 원래 상태(default)로 복원
   */
  useEffect(() => {
    if (route?.params?.fromReantChat) {
      // 리앤트 이미지를 원래 상태로 복원
      setCharacterEmotion('default');
      bottomSheetTranslateY.setValue(SCREEN_HEIGHT * 0.4);
      Animated.spring(bottomSheetTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
      (navigation as any)?.setParams?.({});
    } else {
      bottomSheetTranslateY.setValue(0);
    }
  }, [bottomSheetTranslateY, route?.params?.fromReantChat, navigation]);

  /**
   * 바텀시트에서 채팅 열었을 때 인사 메시지
   */
  useEffect(() => {
    if (!showChatInBottomSheet) return;
    const fetchWelcome = async () => {
      setReantChatLoading(true);
      const result = await sendChatMessage('안녕');
      setReantChatLoading(false);
      if (result.success && result.data) {
        setReantChatResponse(result.data.message);
      } else {
        setReantChatResponse('안녕하세요! 오늘도 화이팅! 😊');
      }
    };
    fetchWelcome();
  }, [showChatInBottomSheet]);

  /**
   * 캐릭터/말풍선 클릭 - 별도 화면 이동 없이 바텀시트 내용을 투두 → 채팅으로 전환
   */
  const handleCharacterPress = useCallback((): void => {
    setCharacterEmotion('happy');
    setShowChatInBottomSheet(true);
  }, []);

  /**
   * 바텀시트 채팅 닫기 → 투두리스트로 복귀
   * 리앤트 이미지를 원래 상태(default)로 복원
   */
  const handleCloseChatInBottomSheet = useCallback((): void => {
    setCharacterEmotion('default');
    setShowChatInBottomSheet(false);
    setChatMessages([]);
    setReantChatResponse(null);
    setDisplayedMessage('눌러서 대화하기');
  }, []);

  /**
   * 바텀시트 채팅에서 메시지 전송
   */
  const onSendChatMessage = useCallback(async (text: string): Promise<void> => {
    const userMsg: ChatMessage = {
      id: generateMessageId(),
      type: 'user',
      content: text,
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setReantChatLoading(true);
    const result = await sendChatMessage(text);
    setReantChatLoading(false);
    if (result.success && result.data) {
      setReantChatResponse(result.data.message);
    } else {
      setReantChatResponse('잠깐 멍해졌어요... 다시 말해줄래요? 🤔');
    }
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
  }, [heroHeightAnim, MIN_HERO_HEIGHT, MAX_HERO_HEIGHT]);

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
    bottomSheetTranslateY,
    // Todo Lists
    activeTodoLists,
    todoMissionsByTime,
    dataLoading,
    dataError,
    completedTodoList,
    // Speech Bubble (안내 메시지 / 채팅 모드일 때 리앤트 응답)
    showSpeechBubble,
    speechBubbleAnim,
    speechBubbleMessage:
      showChatInBottomSheet
        ? (reantChatLoading ? '생각 중...' : (reantChatResponse || '안녕하세요!'))
        : displayedMessage,
    // 바텀시트 채팅 (리앤트 탭 시 투두 대신 채팅 표시, 별도 화면 이동 없음)
    showChatInBottomSheet,
    chatMessages,
    reantChatLoading,
    handleCloseChatInBottomSheet,
    onSendChatMessage,
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
