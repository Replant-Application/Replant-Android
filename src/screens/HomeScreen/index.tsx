import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  Animated,
  Modal,
  Image,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { Loading, ErrorBoundary, AppHeader } from '../../components/ui';
import { getCharacterImage } from '../../utils/characterUtils';
import { HomeScreenProps } from '../../types/screens/home';
import { SCREEN_NAMES } from '../../utils/constants';
import { useHomeScreenContainer } from './HomeScreen.container';
import { styles } from './HomeScreen.styles';
import { styles as reantChatStyles } from '../ReantChatScreen/ReantChatScreen.styles';

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
    showChatInBottomSheet,
    chatMessages,
    reantChatLoading,
    handleCloseChatInBottomSheet,
    onSendChatMessage,
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
  } = useHomeScreenContainer({ navigation, route });

  const [chatInputText, setChatInputText] = useState('');
  const chatFlatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (showChatInBottomSheet && chatMessages.length > 0) {
      setTimeout(() => chatFlatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [showChatInBottomSheet, chatMessages]);

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

        {/* 대화 시작하기 / 대화 종료하기 버튼 (채팅 열려 있으면 종료로 전환) */}
        <View style={styles.startChatButtonContainer}>
          <TouchableOpacity
            style={styles.startChatButton}
            onPress={showChatInBottomSheet ? handleCloseChatInBottomSheet : handleCharacterPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={showChatInBottomSheet ? '대화 종료하기' : '대화 시작하기'}
            accessibilityHint={showChatInBottomSheet ? '채팅을 종료합니다' : '리앤트와 대화를 시작합니다'}
          >
            <Text style={styles.startChatButtonText}>
              {showChatInBottomSheet ? '💬 대화 종료하기' : '💬 대화 시작하기'}
            </Text>
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
                      { width: '100%' },
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
                          {speechBubbleMessage || '저를 눌러서 대화하기'}
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
              accessibilityRole="button"
              accessibilityLabel="닫기"
            >
              <View style={styles.evolutionImageContainer}>
                <FastImage
                  source={require('../../assets/images/characters/transformation.gif')}
                  style={styles.evolutionImage}
                  resizeMode={FastImage.resizeMode.contain}
                  accessibilityLabel="진화하는 캐릭터 애니메이션"
                />
              </View>
              <View style={styles.evolutionSpeechBubble}>
                <ImageBackground
                  source={require('../../assets/images/conversation.png')}
                  style={styles.evolutionSpeechBubbleImage}
                  resizeMode="stretch"
                  accessibilityElementsHidden={true}
                >
                  <View style={styles.evolutionSpeechTextContainer}>
                    <Text style={styles.evolutionSpeechText} accessibilityRole="header">
                      어라? 내 몸이 이상해요!
                    </Text>
                  </View>
                </ImageBackground>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </Modal>

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

          {showChatInBottomSheet ? (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
              >
                <FlatList
                  ref={chatFlatListRef}
                  data={chatMessages}
                  renderItem={({ item }) =>
                    item.type === 'user' ? (
                      <View style={reantChatStyles.userMessageContainer}>
                        <View style={reantChatStyles.userMessageBubble}>
                          <Text style={reantChatStyles.userMessageText}>{item.content}</Text>
                        </View>
                      </View>
                    ) : null
                  }
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={[
                    reantChatStyles.messagesList,
                    chatMessages.length === 0 && { flexGrow: 0 },
                  ]}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={chatMessages.length > 1}
                  ListEmptyComponent={
                    <View style={reantChatStyles.emptyContainer}>
                      <Text style={reantChatStyles.emptyText}>
                        {currentCharacter?.name || '리앤트'}에게 메시지를 보내보세요!
                      </Text>
                    </View>
                  }
                />
                <View style={reantChatStyles.inputContainer}>
                  <TextInput
                    style={reantChatStyles.input}
                    value={chatInputText}
                    onChangeText={setChatInputText}
                    placeholder="메시지를 입력하세요..."
                    placeholderTextColor="#999"
                    multiline
                    maxLength={200}
                    onSubmitEditing={() => {
                      if (chatInputText.trim()) {
                        onSendChatMessage(chatInputText.trim());
                        setChatInputText('');
                      }
                    }}
                    returnKeyType="send"
                  />
                  <TouchableOpacity
                    style={[
                      reantChatStyles.sendButton,
                      (!chatInputText.trim() || reantChatLoading) && reantChatStyles.sendButtonDisabled,
                    ]}
                    onPress={() => {
                      if (chatInputText.trim() && !reantChatLoading) {
                        onSendChatMessage(chatInputText.trim());
                        setChatInputText('');
                      }
                    }}
                    disabled={!chatInputText.trim() || reantChatLoading}
                    activeOpacity={0.7}
                  >
                    {reantChatLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={reantChatStyles.sendButtonText}>전송</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
          ) : (
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

                  {(() => {
                    const activeCount = (activeTodoLists || []).length;
                    console.log('[HomeScreen] 렌더링 조건 체크:', {
                      activeTodoListsCount: activeCount,
                      hasCompletedTodoList: !!completedTodoList,
                      completedTodoListId: completedTodoList?.id
                    });
                    return activeCount === 0;
                  })() ? (
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
          )}
        </Animated.View>
      </ImageBackground>
    </Animated.View>
  );
};


export default HomeScreen;
