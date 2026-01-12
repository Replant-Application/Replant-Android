import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ImageBackground, Animated, PanResponder, Platform, ActivityIndicator, Modal, Alert, Image } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useCharacter } from '../../hooks/useCharacter';
import { Loading, ErrorBoundary, AppHeader } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { getCharacterImage } from '../../utils/characterUtils';
import { HomeScreenProps } from './HomeScreen.types';
import { getBackgroundImage } from './HomeScreen.utils';
import { getActiveTodoLists } from '../../api/todolistApi';
import { getActiveChallenges, completeTodayChallenge } from '../../api/challengeApi';
import { getActiveRoutines, UserRoutine, formatTimeDisplay, getRoutineIcon } from '../../api/routineApi';
import { TodoList, Challenge } from '../../types/todolist';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { characters, error: characterError } = useCharacter();

  // 배경 이미지 상태 및 애니메이션
  const [backgroundType, setBackgroundType] = useState<'day' | 'night'>(getBackgroundImage());
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // 투두리스트, 챌린지, 루틴 상태
  const [activeTodoLists, setActiveTodoLists] = useState<TodoList[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [routines, setRoutines] = useState<UserRoutine[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [completingChallengeId, setCompletingChallengeId] = useState<number | null>(null);

  // 말풍선 표시 상태
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const speechBubbleAnim = useRef(new Animated.Value(0)).current;


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
        } else {
          setActiveTodoLists([]);
        }
      } catch (e) {
        console.log('투두리스트 로드 실패:', e);
        setActiveTodoLists([]);
      }

      // 챌린지 로드 (개별 try-catch)
      try {
        const challengeResult = await getActiveChallenges();
        if (challengeResult?.success && Array.isArray(challengeResult.data)) {
          setChallenges(challengeResult.data);
        } else {
          setChallenges([]);
        }
      } catch (e) {
        console.log('챌린지 로드 실패:', e);
        setChallenges([]);
      }

      // 루틴 로드 (개별 try-catch)
      try {
        const routineData = await getActiveRoutines();
        if (Array.isArray(routineData)) {
          setRoutines(routineData);
        } else {
          setRoutines([]);
        }
      } catch (e) {
        console.log('루틴 로드 실패:', e);
        setRoutines([]);
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

  // 챌린지 완료 핸들러
  const handleCompleteChallenge = async (challengeId: number) => {
    try {
      setCompletingChallengeId(challengeId);
      const result = await completeTodayChallenge(challengeId);

      if (result.success && result.data) {
        setChallenges(prev =>
          prev.map(c => c.id === challengeId ? result.data! : c)
        );
      }
    } catch (error) {
      // 에러 처리
    } finally {
      setCompletingChallengeId(null);
    }
  };

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
                {/* 나의 루틴 설정 섹션 */}
                <TouchableOpacity
                  style={styles.routineSection}
                  onPress={() => navigation.navigate('RoutineSetting' as any)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="나의 루틴 설정"
                >
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleRow}>
                      <Text style={styles.sectionIcon}>⚙️</Text>
                      <Text style={styles.routineSectionTitle}>나의 루틴 설정</Text>
                    </View>
                    <Text style={styles.routineSectionArrow}>›</Text>
                  </View>
                  <View style={styles.sectionContent}>
                    <Text style={styles.routineSectionCount}>
                      {(routines || []).length}개 설정됨
                    </Text>
                    {(routines || []).length > 0 ? (
                      <View style={styles.routinePreview}>
                        {(routines || []).slice(0, 3).map((routine) => (
                          <View key={routine?.id || Math.random()} style={styles.routinePreviewItem}>
                            <Text style={styles.routinePreviewIcon}>
                              {getRoutineIcon(routine?.routineType || 'CUSTOM')}
                            </Text>
                            <Text style={styles.routinePreviewTitle} numberOfLines={1}>
                              {routine?.title || routine?.routineTypeName || '루틴'}
                            </Text>
                            <Text style={styles.routinePreviewValue} numberOfLines={1}>
                              {routine?.valueTimeStart
                                ? formatTimeDisplay(routine.valueTimeStart)
                                : routine?.valueText || ''}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.routineEmptyText}>
                        기상시간, 장소 등을 설정해보세요
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>

                {/* 나의 투두리스트 섹션 */}
                <TouchableOpacity
                  style={styles.todoListSection}
                  onPress={() => navigation.navigate('TodoList' as any)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="나의 투두리스트"
                >
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleRow}>
                      <Text style={styles.sectionIcon}>📋</Text>
                      <Text style={styles.sectionTitle}>나의 투두리스트</Text>
                    </View>
                    <Text style={styles.sectionArrow}>›</Text>
                  </View>
                  <View style={styles.sectionContent}>
                    <Text style={styles.sectionCount}>
                      {(activeTodoLists || []).length}개 진행중
                    </Text>
                    {(activeTodoLists || []).length > 0 && (
                      <View style={styles.todoListPreview}>
                        {(activeTodoLists || []).slice(0, 2).map((todoList, index) => (
                          <View key={todoList?.id || index} style={styles.todoListPreviewItem}>
                            <Text style={styles.todoListPreviewTitle} numberOfLines={1}>
                              {index + 1}. {todoList?.title || '투두리스트'}
                            </Text>
                            <Text style={styles.todoListPreviewProgress}>
                              {todoList?.completedCount ?? 0}/{todoList?.totalCount ?? 0}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </TouchableOpacity>

                {/* 나의 챌린지 섹션 */}
                <View style={styles.challengeSection}>
                  <View style={styles.challengeSectionHeader}>
                    <View style={styles.sectionTitleRow}>
                      <Text style={styles.sectionIcon}>🔥</Text>
                      <Text style={styles.sectionTitle}>나의 챌린지</Text>
                    </View>
                    <Text style={styles.challengeCount}>{(challenges || []).length}개 진행중</Text>
                  </View>

                  {(challenges || []).length > 0 ? (
                    (challenges || []).map((challenge) => (
                      <View key={challenge?.id || Math.random()} style={styles.challengeCard}>
                        <View style={styles.challengeCardHeader}>
                          <Text style={styles.challengeTitle} numberOfLines={1}>
                            {challenge?.missionTitle || '챌린지'}
                          </Text>
                          <View style={styles.challengeStreak}>
                            <Text style={styles.streakIcon}>🔥</Text>
                            <Text style={styles.streakText}>{challenge?.currentStreak ?? 0}일 연속</Text>
                          </View>
                        </View>

                        <View style={styles.challengeProgressContainer}>
                          <View style={styles.challengeProgressBar}>
                            <View
                              style={[
                                styles.challengeProgressFill,
                                { width: `${challenge?.progressRate ?? 0}%` }
                              ]}
                            />
                          </View>
                          <Text style={styles.challengeProgressText}>
                            {challenge?.totalCompletedDays ?? 0}/{challenge?.durationDays ?? 0}일
                          </Text>
                        </View>

                        <View style={styles.challengeCardFooter}>
                          <Text style={styles.challengeRemaining}>
                            D-{challenge?.remainingDays ?? 0}
                          </Text>
                          {challenge?.todayCompleted ? (
                            <View style={styles.completedBadge}>
                              <Text style={styles.completedBadgeText}>오늘 완료!</Text>
                            </View>
                          ) : (
                            <TouchableOpacity
                              style={styles.completeButton}
                              onPress={() => challenge?.id && handleCompleteChallenge(challenge.id)}
                              disabled={!challenge?.id || completingChallengeId === challenge.id}
                              activeOpacity={0.7}
                            >
                              {completingChallengeId === challenge?.id ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                              ) : (
                                <Text style={styles.completeButtonText}>오늘 완료하기</Text>
                              )}
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyChallengeContainer}>
                      <Text style={styles.emptyChallengeText}>
                        진행 중인 챌린지가 없습니다
                      </Text>
                      <Text style={styles.emptyChallengeSubtext}>
                        미션 도감에서 챌린지를 시작해보세요!
                      </Text>
                    </View>
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

  // 루틴 설정 섹션 스타일
  routineSection: {
    backgroundColor: '#F3E5F5',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 2,
    borderColor: '#AB47BC',
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routineSectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: '#7B1FA2',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
  },
  routineSectionArrow: {
    fontSize: typography.fontSize['2xl'],
    color: '#AB47BC',
    fontWeight: typography.fontWeight.bold,
  },
  routineSectionCount: {
    fontSize: typography.fontSize.sm,
    color: '#8E24AA',
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing[2],
  },
  routinePreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: borderRadius.md,
    padding: spacing[2],
  },
  routinePreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[1],
  },
  routinePreviewIcon: {
    fontSize: 16,
    marginRight: spacing[2],
    width: 24,
    textAlign: 'center',
  },
  routinePreviewTitle: {
    fontSize: typography.fontSize.sm,
    color: '#7B1FA2',
    flex: 1,
  },
  routinePreviewValue: {
    fontSize: typography.fontSize.sm,
    color: '#AB47BC',
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing[2],
  },
  routineEmptyText: {
    fontSize: typography.fontSize.sm,
    color: '#9C27B0',
    fontStyle: 'italic',
  },

  // 투두리스트 섹션 스타일
  todoListSection: {
    backgroundColor: '#E3F2FD',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 2,
    borderColor: '#42A5F5',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: spacing[2],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: '#1565C0',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
  },
  sectionArrow: {
    fontSize: typography.fontSize['2xl'],
    color: '#42A5F5',
    fontWeight: typography.fontWeight.bold,
  },
  sectionContent: {
    marginTop: spacing[2],
  },
  sectionCount: {
    fontSize: typography.fontSize.sm,
    color: '#1976D2',
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing[2],
  },
  todoListPreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: borderRadius.md,
    padding: spacing[2],
  },
  todoListPreviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[1],
  },
  todoListPreviewTitle: {
    fontSize: typography.fontSize.sm,
    color: '#1565C0',
    flex: 1,
  },
  todoListPreviewProgress: {
    fontSize: typography.fontSize.sm,
    color: '#42A5F5',
    fontWeight: typography.fontWeight.medium,
  },

  // 챌린지 섹션 스타일
  challengeSection: {
    marginBottom: spacing[4],
  },
  challengeSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
    paddingHorizontal: spacing[1],
  },
  challengeCount: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  challengeCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 2,
    borderColor: '#FF9800',
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  challengeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  challengeTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: '#E65100',
    flex: 1,
    marginRight: spacing[2],
  },
  challengeStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    borderRadius: borderRadius.full,
  },
  streakIcon: {
    fontSize: 14,
    marginRight: spacing[1],
  },
  streakText: {
    fontSize: typography.fontSize.xs,
    color: '#E65100',
    fontWeight: typography.fontWeight.medium,
  },
  challengeProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  challengeProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    borderRadius: borderRadius.full,
    marginRight: spacing[2],
    overflow: 'hidden',
  },
  challengeProgressFill: {
    height: '100%',
    backgroundColor: '#FF9800',
    borderRadius: borderRadius.full,
  },
  challengeProgressText: {
    fontSize: typography.fontSize.xs,
    color: '#E65100',
    fontWeight: typography.fontWeight.medium,
    minWidth: 50,
    textAlign: 'right',
  },
  challengeCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeRemaining: {
    fontSize: typography.fontSize.sm,
    color: '#F57C00',
    fontWeight: typography.fontWeight.bold,
  },
  completedBadge: {
    backgroundColor: '#4CAF50',
    paddingVertical: spacing[1.5],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.full,
  },
  completedBadgeText: {
    fontSize: typography.fontSize.sm,
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.medium,
  },
  completeButton: {
    backgroundColor: '#FF9800',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.md,
    minWidth: 100,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: typography.fontSize.sm,
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.semibold,
  },
  emptyChallengeContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: borderRadius.lg,
    padding: spacing[6],
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderStyle: 'dashed',
  },
  emptyChallengeText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  emptyChallengeSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
});

export default HomeScreen;
