import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ImageBackground, Animated, Image, PanResponder, Platform } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useCharacter } from '../../hooks/useCharacter';
import { useMission } from '../../hooks/useMission';
import { Loading, ErrorBoundary, EmptyState, AppHeader, SimpleTabBar } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { getCharacterImage } from '../../utils/characterUtils';
import { HomeScreenProps } from './HomeScreen.types';
import { getBackgroundImage } from './HomeScreen.utils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { characters, error: characterError } = useCharacter();
  const { missions, loading: missionLoading, error: missionError } = useMission();
  
  // 배경 이미지 상태 및 애니메이션
  const [backgroundType, setBackgroundType] = useState<'day' | 'night'>(getBackgroundImage());
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  // 필터 상태
  const [filter, setFilter] = useState<'all' | 'completed' | 'inProgress'>('all');
  
  // 말풍선 표시 상태
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const speechBubbleAnim = useRef(new Animated.Value(0)).current;
  
  // 캐릭터 감정 상태
  const [characterEmotion, setCharacterEmotion] = useState<'default' | 'happy'>('default');

  // 히어로 섹션 접힘 상태
  const [_isHeroCollapsed, setIsHeroCollapsed] = useState(false);

  // 캐릭터 영역 슬라이딩 상태
  const MIN_HERO_HEIGHT = SCREEN_HEIGHT * 0.2;  // 최소 높이
  const MAX_HERO_HEIGHT = SCREEN_HEIGHT * 0.45; // 최대 높이 (기본값)
  const heroHeightAnim = useRef(new Animated.Value(MAX_HERO_HEIGHT)).current;

  // PanResponder 설정
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // 수직 움직임이 더 클 때만 반응
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        // 현재 높이에서 드래그 거리만큼 변경
        const currentHeight = (heroHeightAnim as any)._value;
        let newHeight = currentHeight + gestureState.dy * 0.5;

        // 범위 제한
        newHeight = Math.max(MIN_HERO_HEIGHT, Math.min(MAX_HERO_HEIGHT, newHeight));
        heroHeightAnim.setValue(newHeight);
      },
      onPanResponderRelease: (_, gestureState) => {
        const currentHeight = (heroHeightAnim as any)._value;

        // 드래그 방향에 따라 스냅
        if (gestureState.dy < -30) {
          // 위로 드래그: 축소
          setIsHeroCollapsed(true);
          Animated.spring(heroHeightAnim, {
            toValue: MIN_HERO_HEIGHT,
            useNativeDriver: false,
            friction: 8,
          }).start();
        } else if (gestureState.dy > 30) {
          // 아래로 드래그: 확대
          setIsHeroCollapsed(false);
          Animated.spring(heroHeightAnim, {
            toValue: MAX_HERO_HEIGHT,
            useNativeDriver: false,
            friction: 8,
          }).start();
        } else {
          // 중간 상태면 가까운 쪽으로 스냅
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

  // 시간에 따른 배경 변경 감지
  useEffect(() => {
    const checkTime = () => {
      const newBackgroundType = getBackgroundImage();
      if (newBackgroundType !== backgroundType) {
        // 페이드 아웃
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }).start(() => {
          setBackgroundType(newBackgroundType);
          // 페이드 인
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }).start();
        });
      }
    };
    
    // 초기 체크
    checkTime();
    
    // 1분마다 체크
    const interval = setInterval(checkTime, 60000);
    
    return () => clearInterval(interval);
  }, [backgroundType, fadeAnim]);

  // 필터링된 미션 목록
  const filteredMissions = useMemo(() => {
    if (filter === 'completed') {
      return missions.filter(m => m.completed);
    } else if (filter === 'inProgress') {
      return missions.filter(m => !m.completed);
    }
    return missions;
  }, [missions, filter]);

  // 통계 계산
  const stats = useMemo(() => {
    const completedMissions = missions.filter(m => m.completed).length;
    const inProgressMissions = missions.filter(m => !m.completed).length;
    const currentYear = new Date().getFullYear();
    return {
      completedMissions,
      inProgressMissions,
      currentYear,
    };
  }, [missions]);


  // 미션 상세 보기 핸들러 (미션 페이지로 이동)
  const handleViewMissionDetails = (_missionId: string): void => {
    navigation.navigate('Mission' as any);
  };

  // 캐릭터 클릭 핸들러 - 말풍선 표시 및 happy.gif로 변경
  const handleCharacterPress = (): void => {
    // happy.gif로 변경
    setCharacterEmotion('happy');
    
    setShowSpeechBubble(true);
    // 말풍선 페이드 인 애니메이션
    Animated.timing(speechBubbleAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // 3초 후 말풍선 자동 숨김 및 default로 복귀
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

  // 에러 처리 - 모든 hooks 호출 후에 처리
  if (characterError || missionError) {
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
          <ErrorBoundary error={characterError || missionError || 'Unknown error'} />
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
        
        {/* 상단: 큰 캐릭터 영역 (드래그로 크기 조절 가능) */}
        <Animated.View
          style={[styles.heroSection, { height: heroHeightAnim }]}
          {...panResponder.panHandlers}
        >
          {currentCharacter && (
            <>
              {/* 말풍선 - 클릭 시에만 표시 */}
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

              {/* 큰 캐릭터 이미지 - 중앙에 배치 */}
              <TouchableOpacity
                style={styles.characterImageContainer}
                onPress={handleCharacterPress}
                onLongPress={handleCharacterDoublePress}
                activeOpacity={0.9}
                accessibilityRole="button"
                accessibilityLabel={`${currentCharacter.name || '캐릭터'}, 레벨 ${currentCharacter.level || 1}`}
                accessibilityHint="탭하여 말풍선 보기, 길게 눌러서 감정 변경"
              >
                <Animated.View
                  style={[
                    styles.characterAnimatedContainer,
                    {
                      // 높이에 따라 캐릭터 크기도 조절
                      transform: [{
                        scale: heroHeightAnim.interpolate({
                          inputRange: [MIN_HERO_HEIGHT, MAX_HERO_HEIGHT],
                          outputRange: [0.6, 1],
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
        {/* 드래그 핸들 - 터치하면 토글 */}
        <TouchableOpacity
          style={styles.dragHandleArea}
          onPress={() => {
            // 현재 높이에 따라 접거나 펼치기
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
          accessibilityHint="캐릭터 영역의 크기를 조절합니다"
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
          {/* 메인 제목 */}
          <View style={styles.mainHeader}>
            <Text style={styles.mainTitle}>나의 목표</Text>
            <View style={styles.simpleStats}>
              <Text style={styles.simpleStatsText}>
                진행 중 <Text style={styles.simpleStatsNumber}>{stats.inProgressMissions}</Text> · 
                완료 <Text style={styles.simpleStatsNumber}>{stats.completedMissions}</Text>
              </Text>
            </View>
          </View>

          {/* 필터 탭 */}
          <SimpleTabBar
            tabs={[
              { key: 'all', label: '전체' },
              { key: 'completed', label: '완료' },
              { key: 'inProgress', label: '진행중' },
            ]}
            activeTab={filter}
            onTabChange={(tabId) => setFilter(tabId as 'all' | 'completed' | 'inProgress')}
            style={styles.tabBar}
          />

          {/* 미션 리스트 */}
          <View style={styles.missionSection}>
            {missionLoading ? (
              <Loading text="미션을 불러오는 중..." />
            ) : filteredMissions.length > 0 ? (
              filteredMissions.map((mission) => (
                <TouchableOpacity
                  key={mission.mission_id}
                  style={styles.missionListItem}
                  onPress={() => handleViewMissionDetails(mission.mission_id)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`${mission.title}, ${mission.completed ? '완료' : '진행중'}`}
                >
                  <View style={styles.missionListItemLeft}>
                    {mission.completed ? (
                      <Image
                        source={require('../../assets/images/check2.png')}
                        style={styles.missionCompletedIcon}
                        resizeMode="contain"
                        accessibilityElementsHidden={true}
                      />
                    ) : (
                      <View style={styles.missionInProgressIcon} accessibilityElementsHidden={true} />
                    )}
                    <Text style={styles.missionListItemTitle}>{mission.title}</Text>
                  </View>
                  <Text style={styles.missionListItemArrow} accessibilityElementsHidden={true}>›</Text>
                </TouchableOpacity>
              ))
            ) : (
              <EmptyState
                icon=""
                title="목표가 없습니다"
                description="새로운 목표를 추가해보세요."
              />
            )}
          </View>
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
    backgroundColor: '#FFFFFF', // 흰색 배경
    borderTopLeftRadius: borderRadius.xl + 8,
    borderTopRightRadius: borderRadius.xl + 8,
    borderColor: '#0E0F37', // 남색 테두리
    borderTopWidth: 12,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 0, // 바닥 테두리 제거
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
    paddingHorizontal: spacing[3],
    paddingBottom: 150, // 하단 탭바 높이 + 네비게이션바 + 여유 공간
    flexGrow: 1,
  },
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
  },
  mainTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.medium,
    color: '#000000', // 책 제목 같은 어두운 갈색
    lineHeight: getOptimizedLineHeight(typography.fontSize['2xl']),
    letterSpacing: 0.5,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    textShadowColor: 'rgba(139, 111, 71, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  simpleStats: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    backgroundColor: '#F5F0E8', // 연한 베이지 배경
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E8DCC8',
  },
  simpleStatsText: {
    fontSize: typography.fontSize.sm,
    color: '#8B6F47',
    fontWeight: typography.fontWeight.medium,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    letterSpacing: 0.3,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  simpleStatsNumber: {
    fontWeight: typography.fontWeight.medium,
    color: '#5A4A3A',
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    letterSpacing: 0.3,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  tabBar: {
    marginBottom: spacing[3],
  },
  missionSection: {
    marginTop: spacing[1],
  },
  missionListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF8E7', // 책 페이지 같은 크림색
    borderRadius: borderRadius.base,
    paddingVertical: 8,
    paddingHorizontal: spacing[3],
    paddingLeft: spacing[4], // 왼쪽 여백을 더 크게 (책 등 부분 공간)
    marginBottom: spacing[3],
    borderWidth: 2,
    borderColor: '#D4A574', // 책 표지 같은 갈색 테두리
    borderLeftWidth: 6, // 왼쪽 테두리를 더 두껍게 (책 등 부분)
    borderLeftColor: '#8B6F47', // 어두운 갈색 (책 등)
    height: 48,
    shadowColor: '#8B6F47',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  missionListItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: -4, // 왼쪽 테두리 공간 보정
  },
  missionCompletedIcon: {
    width: 18,
    height: 18,
    marginRight: spacing[2],
  },
  missionInProgressIcon: {
    width: 18,
    height: 18,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.base,
    marginRight: spacing[2],
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  missionListItemTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    flex: 1,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    letterSpacing: 0,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  missionListItemArrow: {
    fontSize: typography.fontSize.lg,
    color: colors.gray[400],
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
});

export default HomeScreen;
