import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ImageBackground, Animated, PanResponder, Platform, ActivityIndicator, Modal, Alert, Image } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useCharacter } from '../../hooks/useCharacter';
import { Loading, ErrorBoundary, AppHeader, AlertModal } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { getCharacterImage } from '../../utils/characterUtils';
import { HomeScreenProps } from './HomeScreen.types';
import { getBackgroundImage } from './HomeScreen.utils';
import { getActiveTodoLists, getTodoListDetail } from '../../api/todolistApi';
import { TodoList, TodoMission } from '../../types/todolist';
import { SCREEN_NAMES } from '../../utils/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { characters, error: characterError } = useCharacter();

  // 배경 이미지 상태 및 애니메이션
  const [backgroundType, setBackgroundType] = useState<'day' | 'night'>(getBackgroundImage());
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // 투두리스트 상태
  const [activeTodoLists, setActiveTodoLists] = useState<TodoList[]>([]);
  const [todoMissionsByTime, setTodoMissionsByTime] = useState<Map<string, { mission: TodoMission; todoListTitle: string }[]>>(new Map());
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
  const [_isHeroCollapsed, setIsHeroCollapsed] = useState(false);

  // 캐릭터 영역 슬라이딩 상태
  const MIN_HERO_HEIGHT = SCREEN_HEIGHT * 0.1;
  const MAX_HERO_HEIGHT = SCREEN_HEIGHT * 0.45;
  const heroHeightAnim = useRef(new Animated.Value(MAX_HERO_HEIGHT)).current;

  // PanResponder 설정
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

  // 단일 캐릭터 시스템이므로 첫 번째 캐릭터 사용
  const currentCharacter = characters.length > 0 ? characters[0] : null;

  // 데이터 로딩 - 각 API 개별적으로 안전하게 처리
  const loadData = useCallback(async () => {
    try {
      setDataLoading(true);
      setDataError(null);

      // 투두리스트 로드 (개별 try-catch)
      try {
        const todoListResult = await getActiveTodoLists();
        if (todoListResult?.success && Array.isArray(todoListResult.data)) {
          setActiveTodoLists(todoListResult.data);
          
          // 각 투두리스트의 상세 정보를 가져와서 미션 추출 및 완료 확인 (한 번만 호출)
          const missionsByTime = new Map<string, { mission: TodoMission; todoListTitle: string }[]>();
          
          for (const todoList of todoListResult.data) {
            try {
              const detailResult = await getTodoListDetail(todoList.id);
              if (detailResult?.success && detailResult.data) {
                const todoListDetail = detailResult.data;
                
                // 미션 추출 (시간대별로 그룹화)
                if (todoListDetail.missions) {
                  for (const mission of todoListDetail.missions) {
                    // 완료되지 않은 미션이고 시간이 설정된 경우만
                    if (!mission.isCompleted && mission.scheduledStartTime) {
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
                  : (todoListDetail.completedCount > 0 && todoListDetail.completedCount === todoListDetail.totalCount);

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
                console.log(`[HomeScreen] 투두리스트 ${todoList.id} 상세 정보 로드 실패:`, detailResult?.error);
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

  // 시간에 따른 배경 변경 감지
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

  // 캐릭터 클릭 핸들러
  const handleCharacterPress = (): void => {
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
  };

  // 말풍선 더블 탭으로 상세 페이지 이동
  const handleCharacterDoublePress = (): void => {
    if (currentCharacter) {
      navigation.navigate('CharacterDetail', { character: currentCharacter });
    }
  };

  // 에러 처리
  if (characterError) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <ImageBackground
          source={backgroundType === 'day'
            ? require('../../assets/images/day.png')
            : require('../../assets/images/night.png')
          }
          style={styles.fullBackground}
          resizeMode="cover"
        >
          <AppHeader navigation={navigation} />
          <ErrorBoundary error={characterError || 'Unknown error'} />
        </ImageBackground>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ImageBackground
        source={backgroundType === 'day'
          ? require('../../assets/images/day.png')
          : require('../../assets/images/night.png')
        }
        style={styles.fullBackground}
        resizeMode="cover"
      >
        <AppHeader navigation={navigation} />

        {/* 상단: 큰 캐릭터 영역 */}
        <Animated.View
          style={[styles.heroSection, { height: heroHeightAnim }]}
          {...panResponder.panHandlers}
        >
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
                      <Text style={styles.speechText}>
                        {currentCharacter.description || '안녕하세요! 오늘도 화이팅!'}
                      </Text>
                    </View>
                  </ImageBackground>
                </Animated.View>
              )}

              <TouchableOpacity
                style={styles.characterImageContainer}
                onPress={handleCharacterPress}
                onLongPress={handleCharacterDoublePress}
                activeOpacity={0.9}
                accessibilityRole="button"
                accessibilityLabel={`${currentCharacter.name || '캐릭터'}, 레벨 ${currentCharacter.level || 1}`}
                accessibilityHint="탭하여 말풍선 보기, 길게 눌러서 상세 페이지로 이동"
              >
                <Animated.View
                  style={[
                    styles.characterAnimatedContainer,
                    {
                      transform: [{
                        scale: heroHeightAnim.interpolate({
                          inputRange: [MIN_HERO_HEIGHT, MAX_HERO_HEIGHT],
                          outputRange: [0.3, 1],
                          extrapolate: 'clamp',
                        }),
                      }],
                    },
                  ]}
                >
                  <FastImage
                    key={`character-${currentCharacter.level || 1}-${characterEmotion}`}
                    source={getCharacterImage(currentCharacter.level || 1, characterEmotion)}
                    style={styles.characterImage}
                    resizeMode={FastImage.resizeMode.contain}
                    accessibilityElementsHidden={true}
                  />
                </Animated.View>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>

        {/* 하단: 바텀 시트 스타일 */}
        <View style={styles.bottomSheet}>
          {/* 도트 패턴 배경 */}
          <View style={styles.dotPattern} pointerEvents="none">
            {Array.from({ length: Math.ceil(SCREEN_HEIGHT / 20) }).map((_item, row) =>
              Array.from({ length: Math.ceil(SCREEN_WIDTH / 20) }).map((_item2, col) => (
                <View
                  key={`${row}-${col}`}
                  style={[
                    styles.dot,
                    {
                      left: col * 20,
                      top: row * 20,
                    },
                  ]}
                />
              ))
            )}
          </View>

          {/* 드래그 핸들 */}
          <TouchableOpacity
            style={styles.dragHandleArea}
            onPress={() => {
              const currentHeight = (heroHeightAnim as any)._value;
              const willCollapse = currentHeight > (MIN_HERO_HEIGHT + MAX_HERO_HEIGHT) / 2;
              const targetHeight = willCollapse ? MIN_HERO_HEIGHT : MAX_HERO_HEIGHT;
              setIsHeroCollapsed(willCollapse);
              Animated.spring(heroHeightAnim, {
                toValue: targetHeight,
                useNativeDriver: false,
                friction: 8,
              }).start();
            }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="캐릭터 영역 접기/펼치기"
          >
            <View style={styles.dragHandleContainer} accessibilityElementsHidden={true}>
              <View style={styles.dragHandleDot} />
              <View style={styles.dragHandleDot} />
              <View style={styles.dragHandleDot} />
            </View>
          </TouchableOpacity>

          <ScrollView
            style={styles.contentScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentScrollContent}
            nestedScrollEnabled={true}
            bounces={true}
          >
            {dataLoading ? (
              <Loading text="데이터를 불러오는 중..." />
            ) : dataError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{dataError}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadData}>
                  <Text style={styles.retryButtonText}>다시 시도</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* 나의 투두리스트 섹션 */}
                <View style={styles.todoListSection}>
                  <TouchableOpacity
                    style={styles.todoListHeader}
                    onPress={() => navigation.navigate(SCREEN_NAMES.TODO_LIST as any)}
                    activeOpacity={0.7}
                    disabled={(activeTodoLists || []).length === 0}
                  >
                    <View style={styles.todoListHeaderLeft}>
                      <Image
                        source={require('../../assets/images/list.png')}
                        style={styles.todoListIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.todoListTitle}>나의 투두리스트</Text>
                    </View>
                    <Text style={styles.todoListArrow}>›</Text>
                  </TouchableOpacity>

                  {(activeTodoLists || []).length === 0 ? (
                    <View style={styles.emptyTodoListContainer}>
                      <Text style={styles.emptyTodoListText}>
                        아직 투두리스트가 없어요{'\n'}첫 투두리스트를 만들어볼까요?
                      </Text>
                      <TouchableOpacity
                        style={styles.createTodoListButton}
                        onPress={() => navigation.navigate(SCREEN_NAMES.TODO_LIST_CREATE as any)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.createTodoListButtonText}>만들러 가기</Text>
                      </TouchableOpacity>
                    </View>
                  ) : completedTodoList ? (
                    <View style={styles.completedTodoListContainer}>
                      <View style={styles.completedIconContainer}>
                        <Text style={styles.completedIcon}>🎉</Text>
                      </View>
                      <Text style={styles.completedTitle}>오늘의 투두 완료!</Text>
                      <Text style={styles.completedMessage}>
                        모든 미션을 완료했습니다.{'\n'}
                        오늘의 투두는 끝났어요!
                      </Text>
                      <Text style={styles.completedSubMessage}>
                        내일 다시 새로운 투두리스트를 작성해보세요.
                      </Text>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.todoListCount}>
                        {(activeTodoLists || []).length}개 진행중
                      </Text>
                      {todoMissionsByTime.size > 0 && (
                        <View style={styles.timeBasedMissions}>
                          {Array.from(todoMissionsByTime.entries()).map(([time, missions]) => (
                            <View key={time} style={styles.timeGroup}>
                              <Text style={styles.timeLabel}>{time}</Text>
                              {missions.map((item, idx) => (
                                <TouchableOpacity
                                  key={`${item.mission.id}-${idx}`}
                                  style={styles.missionItem}
                                  onPress={() => {
                                    // 해당 투두리스트의 첫 번째 투두리스트 ID 찾기
                                    const todoList = activeTodoLists.find(tl => tl.title === item.todoListTitle);
                                    if (todoList) {
                                      navigation.navigate(SCREEN_NAMES.TODO_LIST_DETAIL as any, { todoListId: todoList.id });
                                    }
                                  }}
                                  activeOpacity={0.7}
                                >
                                  <Text style={styles.missionItemTitle} numberOfLines={1}>
                                    {item.mission.title}
                                  </Text>
                                  <Text style={styles.missionItemList} numberOfLines={1}>
                                    {item.todoListTitle}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          ))}
                        </View>
                      )}
                    </>
                  )}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </ImageBackground>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  heroSection: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  speechBubble: {
    position: 'absolute',
    top: '25%',
    left: '12%',
    transform: [{ translateX: -(SCREEN_WIDTH * 0.9) / 2 }],
    width: SCREEN_WIDTH * 0.9,
    alignSelf: 'center',
  },
  speechBubbleImage: {
    width: '100%',
    minHeight: 120,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[5],
    justifyContent: 'center',
    alignItems: 'center',
  },
  speechTextContainer: {
    width: '100%',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: spacing[12],
  },
  speechText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
    letterSpacing: 0,
    textAlign: 'left',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    width: '100%',
  },
  characterImageContainer: {
    width: SCREEN_WIDTH * 1,
    height: SCREEN_WIDTH * 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: '80%',
    left: '40%',
    marginLeft: -(SCREEN_WIDTH * 0.8) / 2,
    marginTop: -(SCREEN_WIDTH * 0.8) / 2,
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
  characterAnimatedContainer: {
    width: '70%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: borderRadius.xl + 8,
    borderTopRightRadius: borderRadius.xl + 8,
    borderColor: '#0E0F37',
    borderTopWidth: 12,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  dotPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  dot: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.gray[300],
    opacity: 0.3,
  },
  dragHandleArea: {
    paddingVertical: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragHandleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1.5],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[1],
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.full,
  },
  dragHandleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gray[400],
  },
  contentScroll: {
    flex: 1,
  },
  contentScrollContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: 150,
    flexGrow: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing[4],
  },
  retryButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  timeBasedMissions: {
    marginTop: spacing[2],
  },
  timeGroup: {
    marginBottom: spacing[3],
  },
  timeLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[600],
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  missionItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: borderRadius.base,
    padding: spacing[2],
    marginBottom: spacing[1],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  missionItemTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[0.5],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  missionItemList: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  todoListSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.base,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 2,
    borderColor: '#D4A574',
  },
  todoListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  todoListHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  todoListIcon: {
    width: 20,
    height: 20,
    marginRight: spacing[2],
  },
  todoListTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  todoListArrow: {
    fontSize: typography.fontSize.xl,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  todoListCount: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  emptyTodoListContainer: {
    alignItems: 'center',
    paddingVertical: spacing[6],
  },
  emptyTodoListText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[4],
    lineHeight: getOptimizedLineHeight(typography.fontSize.base) * 1.5,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  createTodoListButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    borderRadius: borderRadius.base,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createTodoListButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  completedTodoListContainer: {
    alignItems: 'center',
    paddingVertical: spacing[6],
  },
  completedIconContainer: {
    marginBottom: spacing[3],
  },
  completedIcon: {
    fontSize: 48,
  },
  completedTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[600],
    marginBottom: spacing[2],
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  completedMessage: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[2],
    lineHeight: getOptimizedLineHeight(typography.fontSize.base) * 1.5,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  completedSubMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm) * 1.4,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },

});

export default HomeScreen;
