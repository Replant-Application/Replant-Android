import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ImageBackground, Animated, Platform, ActivityIndicator, Modal, Image } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Loading, ErrorBoundary, AppHeader } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { getCharacterImage } from '../../utils/characterUtils';
import { HomeScreenProps } from '../../types/screens/home';
import { SCREEN_NAMES } from '../../utils/constants';
import { useHomeScreenContainer } from './HomeScreen.container';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    currentCharacter,
    characterError,
    characterEmotion,
    backgroundType,
    fadeAnim,
    activeTodoLists,
    todoMissionsByTime,
    dataLoading,
    dataError,
    completedTodoList,
    showSpeechBubble,
    speechBubbleAnim,
    isHeroCollapsed,
    heroHeightAnim,
    MIN_HERO_HEIGHT,
    MAX_HERO_HEIGHT,
    panResponder,
    showEvolutionModal,
    evolutionFadeAnim,
    loadData,
    handleCharacterPress,
    handleEvolutionModalClose,
    handleDragHandlePress,
    handleTodoListPress,
  } = useHomeScreenContainer({ navigation });

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
                activeOpacity={0.9}
                accessibilityRole="button"
                accessibilityLabel={`${currentCharacter.name || '캐릭터'}, 레벨 ${currentCharacter.level || 1}`}
                accessibilityHint="탭하여 말풍선 보기"
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

        {/* 진화 모달 */}
        <Modal
          visible={showEvolutionModal}
          transparent={true}
          animationType="none"
          onRequestClose={handleEvolutionModalClose}
        >
          <Animated.View style={[styles.evolutionModalOverlay, { opacity: evolutionFadeAnim }]}>
            <TouchableOpacity
              style={styles.evolutionModalContent}
              activeOpacity={1}
              onPress={handleEvolutionModalClose}
            >
              <View style={styles.evolutionImageContainer}>
                <FastImage
                  source={require('../../assets/images/characters/transformation.gif')}
                  style={styles.evolutionImage}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </View>
              <View style={styles.evolutionSpeechBubble}>
                <ImageBackground
                  source={require('../../assets/images/conversation.png')}
                  style={styles.evolutionSpeechBubbleImage}
                  resizeMode="stretch"
                >
                  <View style={styles.evolutionSpeechTextContainer}>
                    <Text style={styles.evolutionSpeechText}>
                      어라? 내 몸이 이상해요!
                    </Text>
                  </View>
                </ImageBackground>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </Modal>

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
            onPress={handleDragHandlePress}
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
                        accessibilityLabel="투두리스트 아이콘"
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
                      {todoMissionsByTime.size > 0 && (
                        <View style={styles.timeBasedMissions}>
                          {Array.from(todoMissionsByTime.entries()).map(([time, missions]) => (
                            <View key={time} style={styles.timeGroup}>
                              <Text style={styles.timeLabel}>{time}</Text>
                              {missions.map((item, idx) => {
                                const isCompleted = item.mission.isCompleted;
                                return (
                                  <TouchableOpacity
                                    key={`${item.mission.id}-${idx}`}
                                    style={[
                                      styles.missionItem,
                                      isCompleted && styles.missionItemCompleted
                                    ]}
                                    onPress={() => handleTodoListPress(item.todoListTitle)}
                                    activeOpacity={0.7}
                                  >
                                    <Text 
                                      style={[
                                        styles.missionItemTitle,
                                        isCompleted && styles.missionItemTitleCompleted
                                      ]} 
                                      numberOfLines={1}
                                    >
                                      {item.mission.title}
                                    </Text>
                                    <Text 
                                      style={[
                                        styles.missionItemList,
                                        isCompleted && styles.missionItemListCompleted
                                      ]} 
                                      numberOfLines={1}
                                    >
                                      {item.todoListTitle}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              })}
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
  missionItemCompleted: {
    opacity: 0.6,
    backgroundColor: 'rgba(240, 240, 240, 0.8)',
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
  missionItemTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.text.secondary,
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
  missionItemListCompleted: {
    textDecorationLine: 'line-through',
    color: colors.text.tertiary,
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
  evolutionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  evolutionModalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  evolutionImageContainer: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  evolutionImage: {
    width: '100%',
    height: '100%',
  },
  evolutionSpeechBubble: {
    width: SCREEN_WIDTH * 0.8,
    alignItems: 'center',
  },
  evolutionSpeechBubbleImage: {
    width: '100%',
    minHeight: 120,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[5],
    justifyContent: 'center',
    alignItems: 'center',
  },
  evolutionSpeechTextContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  evolutionSpeechText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xl),
    letterSpacing: 0,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },

});

export default HomeScreen;
