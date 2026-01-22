/**
 * HomeScreen 비즈니스 로직
 * 홈 화면: 투두리스트 로드, 시간대별 미션 그룹화, 완료 확인, 레벨업 감지
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Animated, PanResponder, Dimensions } from 'react-native';
import { useCharacter } from '../../hooks/useCharacter';
import { getBackgroundImage } from './HomeScreen.utils';
import { getActiveTodoLists, getTodoListDetail } from '../../api/todolistApi';
import { TodoList, TodoMission } from '../../types/todolist';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HomeScreenContainerProps {
  navigation: NavigationProp<RootStackParamList>;
}

export const useHomeScreenContainer = ({ navigation }: HomeScreenContainerProps) => {
  const { characters, error: characterError } = useCharacter();

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

  // 투두리스트 완료 상태
  const [completedTodoList, setCompletedTodoList] = useState<TodoList | null>(null);

  // 캐릭터 감정 상태
  const [characterEmotion, setCharacterEmotion] = useState<'default' | 'happy'>('default');

  // 히어로 섹션 접힘 상태
  const [isHeroCollapsed, setIsHeroCollapsed] = useState(false);

  // 진화 모달 상태
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);
  const evolutionFadeAnim = useRef(new Animated.Value(0)).current;

  // 캐릭터 영역 슬라이딩 상태
  const MIN_HERO_HEIGHT = SCREEN_HEIGHT * 0.1;
  const MAX_HERO_HEIGHT = SCREEN_HEIGHT * 0.45;
  const heroHeightAnim = useRef(new Animated.Value(MAX_HERO_HEIGHT)).current;

  // 단일 캐릭터 시스템이므로 첫 번째 캐릭터 사용
  const currentCharacter = characters.length > 0 ? characters[0] : null;

  /**
   * 레벨업 감지 및 진화 모달 표시
   */
  useEffect(() => {
    if (currentCharacter && currentCharacter.level) {
      const currentLevel = currentCharacter.level;

      // 이전 레벨이 있고 현재 레벨이 더 높으면 레벨업 발생
      if (previousLevel !== null && currentLevel > previousLevel) {
        // 진화 모달 표시
        setShowEvolutionModal(true);
        Animated.timing(evolutionFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }

      // 현재 레벨을 이전 레벨로 저장
      setPreviousLevel(currentLevel);
    } else if (currentCharacter && !previousLevel) {
      // 초기 로드 시 현재 레벨 저장
      setPreviousLevel(currentCharacter.level || 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCharacter?.level, previousLevel]);

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
        if (todoListResult?.success && Array.isArray(todoListResult.data)) {
          // 오늘 날짜의 투두리스트만 필터링
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const todayTodoLists = todoListResult.data.filter(todoList => {
            if (!todoList.createdAt) return false;
            const createdDate = new Date(todoList.createdAt);
            createdDate.setHours(0, 0, 0, 0);

            // 오늘 날짜이고 완료되지 않은 투두리스트만
            const isToday = createdDate.getTime() === today.getTime();
            const isNotCompleted =
              todoList.status === 'ACTIVE' && todoList.completedCount < todoList.totalCount;

            return isToday && isNotCompleted;
          });

          setActiveTodoLists(todayTodoLists);

          // 각 투두리스트의 상세 정보를 가져와서 미션 추출 및 완료 확인
          const missionsByTime = new Map<
            string,
            { mission: TodoMission; todoListTitle: string }[]
          >();

          for (const todoList of todayTodoLists) {
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
                  const createdDate = new Date(todoListDetail.createdAt);
                  const today = new Date();
                  return (
                    createdDate.getFullYear() === today.getFullYear() &&
                    createdDate.getMonth() === today.getMonth() &&
                    createdDate.getDate() === today.getDate()
                  );
                })();

                // 모든 미션이 완료되었고 오늘 생성된 투두리스트인 경우 완료 상태 저장
                if (allMissionsCompleted && isTodayCreated) {
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
   * 캐릭터 클릭 핸들러
   */
  const handleCharacterPress = useCallback((): void => {
    setCharacterEmotion('happy');
    setShowSpeechBubble(true);
    Animated.timing(speechBubbleAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(speechBubbleAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowSpeechBubble(false);
        setCharacterEmotion('default');
      });
    }, 3000);
  }, [speechBubbleAnim]);

  /**
   * 진화 모달 닫기 핸들러
   */
  const handleEvolutionModalClose = useCallback((): void => {
    Animated.timing(evolutionFadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowEvolutionModal(false);
    });
  }, [evolutionFadeAnim]);

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
