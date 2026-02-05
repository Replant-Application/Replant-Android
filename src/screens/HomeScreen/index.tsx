import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  Animated,
  Image,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { Loading, ErrorBoundary, AppHeader, AlertModal } from '../../components/ui';
import { getCharacterImage } from '../../utils/characterUtils';
import characterTemplates from '../../data/characterTemplates.json';
import { HomeScreenProps } from '../../types/screens/home';
import { SCREEN_NAMES } from '../../utils/constants';
import { useHomeScreenContainer } from './HomeScreen.container';
import { styles } from './HomeScreen.styles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const {
    currentCharacter,
    characterError,
    characterEmotion,
    backgroundType,
    fadeAnim,
    bottomSheetTranslateY,
    activeTodoLists,
    todoMissionsByTime,
    dataLoading,
    dataError,
    completedTodoList,
    showSpeechBubble,
    speechBubbleAnim,
    speechBubbleMessage,
    heroHeightAnim,
    MIN_HERO_HEIGHT,
    MAX_HERO_HEIGHT,
    panResponder,
    showEvolutionModal,
    evolutionModalLevel,
    loadData,
    handleCharacterPress,
    handleEvolutionModalClose,
    handleDragHandlePress,
    handleTodoListPress,
  } = useHomeScreenContainer({ navigation, route });

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
          accessibilityElementsHidden={true}
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
        accessibilityElementsHidden={true}
      >
        <AppHeader navigation={navigation} />

        {/* 대화 시작하기 버튼 */}
        <View style={styles.startChatButtonContainer}>
          <TouchableOpacity
            style={styles.startChatButton}
            onPress={handleCharacterPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="대화 시작하기"
            accessibilityHint="리앤트와 대화를 시작합니다"
          >
            <Text style={styles.startChatButtonText}>💬 대화 시작하기</Text>
          </TouchableOpacity>
        </View>

        {/* 상단: 큰 캐릭터 영역 */}
        <Animated.View
          style={[styles.heroSection, { height: heroHeightAnim }]}
          {...panResponder.panHandlers}
        >
          {currentCharacter && (
            <>
              {showSpeechBubble && (
                <TouchableOpacity
                  style={styles.speechBubble}
                  onPress={handleCharacterPress}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="채팅하기"
                >
                  <Animated.View
                    style={[
                      styles.speechBubbleAnimatedContainer,
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
                          {speechBubbleMessage || '눌러서 대화하기'}
                        </Text>
                      </View>
                    </ImageBackground>
                  </Animated.View>
                </TouchableOpacity>
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

        {/* 진화 모달: 레벨 5 이후는 모두 레벨 5 템플릿 사용 (이름·설명·이미지 동일) */}
        {(() => {
          const currentLevel = evolutionModalLevel ?? currentCharacter?.level ?? 1;
          const templateLevel = Math.min(currentLevel, 5);
          const levelInfo = (characterTemplates as any[]).find(t => t.level === templateLevel) || characterTemplates[0];
          const levelName = levelInfo?.name || '캐릭터';
          const levelDescription = levelInfo?.description || '';
          
          return (
            <AlertModal
              visible={showEvolutionModal}
              title="레벨 업! +1"
              message={`레벨 ${currentLevel} ${levelName}로 진화했어요!\n${levelDescription}`}
              buttonText="확인"
              onClose={handleEvolutionModalClose}
              icon={getCharacterImage(currentLevel, 'default')}
            />
          );
        })()}

        {/* 하단: 바텀 시트 스타일 */}
        <Animated.View
          style={[
            styles.bottomSheet,
            { transform: [{ translateY: bottomSheetTranslateY }] },
          ]}
        >
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
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={loadData}
                  accessibilityRole="button"
                  accessibilityLabel="다시 시도"
                  accessibilityHint="데이터를 다시 불러옵니다"
                >
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
                    accessibilityRole="button"
                    accessibilityLabel="나의 투두리스트"
                    accessibilityHint="투두리스트 화면으로 이동합니다"
                  >
                    <View style={styles.todoListHeaderLeft} accessibilityElementsHidden={true}>
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

                  {((activeTodoLists || []).length === 0) ? (
                    <View style={styles.emptyTodoListContainer}>
                      <Text style={styles.emptyTodoListText}>
                        아직 투두리스트가 없어요{'\n'}첫 투두리스트를 만들어볼까요?
                      </Text>
                      <TouchableOpacity
                        style={styles.createTodoListButton}
                        onPress={() => navigation.navigate(SCREEN_NAMES.TODO_LIST_CREATE as any)}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel="만들러 가기"
                        accessibilityHint="첫 투두리스트를 만듭니다"
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
                      {todoMissionsByTime.size > 0 ? (
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
                                    accessibilityRole="button"
                                    accessibilityLabel={
                                      isCompleted
                                        ? `${item.mission.title}, 완료됨, ${item.todoListTitle}`
                                        : `${item.mission.title}, ${item.todoListTitle}`
                                    }
                                    accessibilityState={{ selected: false }}
                                    accessibilityHint="탭하면 해당 투두리스트로 이동합니다"
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
                      ) : (
                        <View style={styles.emptyTodoListContainer}>
                          <Text style={styles.emptyTodoListText}>
                            투두리스트가 있지만{'\n'}표시할 미션이 없어요
                          </Text>
                          <TouchableOpacity
                            style={styles.createTodoListButton}
                            onPress={() => navigation.navigate(SCREEN_NAMES.TODO_LIST as any)}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            accessibilityLabel="투두리스트 보기"
                            accessibilityHint="투두리스트 목록으로 이동합니다"
                          >
                            <Text style={styles.createTodoListButtonText}>투두리스트 보기</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </>
                  )}
                </View>
              </>
            )}
          </ScrollView>
        </Animated.View>
      </ImageBackground>
    </Animated.View>
  );
};


export default HomeScreen;
