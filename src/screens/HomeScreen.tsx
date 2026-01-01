import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ImageBackground, Animated, Image } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { useCharacter } from '../hooks/useCharacter';
import { useMission } from '../hooks/useMission';
import { Loading, ErrorBoundary, EmptyState, AppHeader } from '../components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '../utils/designTokens';
import { RootStackParamList } from '../types/navigation';
import { ScreenNames } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 시간대에 따른 배경 결정 (6시~18시: 낮, 18시~6시: 밤)
const getBackgroundImage = (): 'day' | 'night' => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? 'day' : 'night';
};

interface HomeScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

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
  
  // 단일 캐릭터 시스템이므로 첫 번째 캐릭터 사용
  const currentCharacter = characters.length > 0 ? characters[0] : null;

  // 레벨별 캐릭터 이미지 가져오기
  const getCharacterImage = (level: number, emotion: string = 'default') => {
    const levelFolder = `level${Math.min(level, 6)}`;
    switch (levelFolder) {
      case 'level1':
        return emotion === 'happy' ? require('../assets/images/characters/level1/happy.gif') :
               require('../assets/images/characters/level1/default.gif');
      case 'level2':
        return emotion === 'happy' ? require('../assets/images/characters/level2/happy.png') :
               emotion === 'waving' ? require('../assets/images/characters/level2/waving.png') :
               require('../assets/images/characters/level2/default.png');
      case 'level3':
        return emotion === 'happy' ? require('../assets/images/characters/level3/happy.png') :
               emotion === 'waving' ? require('../assets/images/characters/level3/waving.png') :
               require('../assets/images/characters/level3/default.png');
      case 'level4':
        return emotion === 'happy' ? require('../assets/images/characters/level4/happy.png') :
               emotion === 'waving' ? require('../assets/images/characters/level4/waving.png') :
               require('../assets/images/characters/level4/default.png');
      case 'level5':
        return emotion === 'happy' ? require('../assets/images/characters/level5/happy.png') :
               emotion === 'waving' ? require('../assets/images/characters/level5/waving.png') :
               require('../assets/images/characters/level5/default.png');
      case 'level6':
        return emotion === 'happy' ? require('../assets/images/characters/level6/happy.png') :
               emotion === 'waving' ? require('../assets/images/characters/level6/waving.png') :
               require('../assets/images/characters/level6/default.png');
      default:
        return require('../assets/images/characters/level1/default.gif');
    }
  };

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
            ? require('../assets/images/day.png')
            : require('../assets/images/night.png')
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
          ? require('../assets/images/day.png')
          : require('../assets/images/night.png')
        }
        style={styles.fullBackground}
        resizeMode="cover"
      >
        <AppHeader navigation={navigation} />
        
        {/* 상단: 큰 캐릭터 영역 */}
        <View style={styles.heroSection}>
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
                  <Text style={styles.speechText}>
                    {currentCharacter.description || '안녕하세요! 오늘도 화이팅!'}
                  </Text>
                </Animated.View>
              )}
              
              {/* 큰 캐릭터 이미지 - 중앙에 배치 */}
              <TouchableOpacity 
                style={styles.characterImageContainer}
                onPress={handleCharacterPress}
                onLongPress={handleCharacterDoublePress}
                activeOpacity={0.9}
              >
                <Image
                  key={`character-${currentCharacter.level || 1}-${characterEmotion}`}
                  source={getCharacterImage(currentCharacter.level || 1, characterEmotion)}
                  style={styles.characterImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </>
          )}
        </View>

      {/* 하단: 바텀 시트 스타일 */}
      <View style={styles.bottomSheet}>
        {/* 그라데이션 보더 효과 */}
        <View style={styles.gradientBorder} />
        {/* 드래그 핸들 */}
        <View style={styles.dragHandle} />
        
        <ScrollView 
          style={styles.contentScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentScrollContent}
        >
          {/* 메인 제목과 추가 버튼 */}
          <View style={styles.mainHeader}>
            <Text style={styles.mainTitle}>나의 목표</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Mission' as any)}
              style={styles.addButtonWrapper}
            >
              <View style={styles.largeAddButton}>
                <Text style={styles.largeAddButtonText}>+</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* 간단한 통계 */}
          <View style={styles.simpleStats}>
            <Text style={styles.simpleStatsText}>
              진행 중 <Text style={styles.simpleStatsNumber}>{stats.inProgressMissions}</Text> · 
              완료 <Text style={styles.simpleStatsNumber}>{stats.completedMissions}</Text>
            </Text>
          </View>

          {/* 필터 */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterChipText, filter === 'all' && styles.filterChipTextActive]}>
                전체
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, filter === 'completed' && styles.filterChipActive]}
              onPress={() => setFilter('completed')}
            >
              <Text style={[styles.filterChipText, filter === 'completed' && styles.filterChipTextActive]}>
                완료
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, filter === 'inProgress' && styles.filterChipActive]}
              onPress={() => setFilter('inProgress')}
            >
              <Text style={[styles.filterChipText, filter === 'inProgress' && styles.filterChipTextActive]}>
                진행중
              </Text>
            </TouchableOpacity>
          </View>

          {/* 미션 리스트 */}
          <View style={styles.missionSection}>
            <Text style={styles.sectionTitle}>내 목표</Text>
            {missionLoading ? (
              <Loading text="미션을 불러오는 중..." />
            ) : filteredMissions.length > 0 ? (
              filteredMissions.map((mission) => (
                <TouchableOpacity
                  key={mission.mission_id}
                  style={styles.missionListItem}
                  onPress={() => handleViewMissionDetails(mission.mission_id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.missionListItemLeft}>
                    {mission.completed ? (
                      <Image
                        source={require('../assets/images/check2.png')}
                        style={styles.missionCompletedIcon}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={styles.missionInProgressIcon} />
                    )}
                    <Text style={styles.missionListItemTitle}>{mission.title}</Text>
                  </View>
                  <Text style={styles.missionListItemArrow}>›</Text>
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
    height: SCREEN_HEIGHT * 0.45,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  speechBubble: {
    position: 'absolute',
    top: '30%',
    left: '8%',
    transform: [{ translateX: -(SCREEN_WIDTH * 0.85) / 2 }],
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    ...shadows.lg,
    width: SCREEN_WIDTH * 0.85,
    borderWidth: 1,
    borderColor: colors.gray[200],
    alignSelf: 'center',
  },
  speechText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    lineHeight: 22,
    textAlign: 'center',
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
  bottomSheet: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl + 8,
    borderTopRightRadius: borderRadius.xl + 8,
    overflow: 'hidden',
  },
  gradientBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary[400],
    borderTopLeftRadius: borderRadius.xl + 8,
    borderTopRightRadius: borderRadius.xl + 8,
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.gray[300],
    borderRadius: borderRadius.full,
    alignSelf: 'center',
    marginTop: spacing[2],
    marginBottom: spacing[5],
  },
  contentScroll: {
    flex: 1,
  },
  contentScrollContent: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
  },
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[6],
    paddingTop: spacing[2],
  },
  mainTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  addButtonWrapper: {
    ...shadows.base,
  },
  largeAddButton: {
    width: 80,
    height: 40,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.green[800],
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  largeAddButtonText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  simpleStats: {
    marginBottom: spacing[5],
  },
  simpleStatsText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  simpleStatsNumber: {
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[5],
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[100],
    borderWidth: 0,
  },
  filterChipActive: {
    backgroundColor: colors.primary[500],
    borderWidth: 0,
  },
  filterChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  filterChipTextActive: {
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
  },
  missionSection: {
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  missionListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  missionListItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  missionCompletedIcon: {
    width: 32,
    height: 32,
    marginRight: spacing[3],
  },
  missionInProgressIcon: {
    width: 32,
    height: 32,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.md,
    marginRight: spacing[3],
    borderWidth: 2,
    borderColor: colors.gray[300],
  },
  missionListItemTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  missionListItemArrow: {
    fontSize: typography.fontSize['2xl'],
    color: colors.gray[400],
    fontWeight: typography.fontWeight.normal,
  },
});

export default HomeScreen;
