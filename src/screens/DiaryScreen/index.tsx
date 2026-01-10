import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  ImageBackground,
  Image,
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  FlatList,
  RefreshControl
} from 'react-native';
import { useDiary } from '../../hooks/useDiary';
import { useCharacter } from '../../hooks/useCharacter';
import { Loading, ErrorBoundary, ConfirmModal, AlertModal } from '../../components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { SimpleDiaryData, Diary } from '../../types';
import { formatDateYYYYMMDD, formatDateKorean, formatDateDivider } from '../../utils/dateUtils';
import { DiaryStep } from './DiaryScreen.types';
import { getCharacterImage } from '../../utils/characterUtils';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import EmotionSelectionStep from './EmotionSelectionStep';
import FactorSelectionStep from './FactorSelectionStep';
import { playReadBookSound, playButtonSound } from '../../utils/soundUtils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const DiaryScreen: React.FC = () => {
  const { diaries, loading, error, saveDiary, deleteDiary, loadDiaries, getDiaryByDate } = useDiary();
  const { characters } = useCharacter();
  const [currentStep, setCurrentStep] = useState<DiaryStep>('welcome');
  const [moodValue, setMoodValue] = useState(50);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [factorText, setFactorText] = useState('');
  const [showCustomFactorInput, setShowCustomFactorInput] = useState(false);
  const [expressionText, setExpressionText] = useState('');
  const [selectedDiary, setSelectedDiary] = useState<(SimpleDiaryData & { id: string }) | null>(null);
  const [viewingDiaryIndex, setViewingDiaryIndex] = useState(0);
  const [showEmptyMessage, setShowEmptyMessage] = useState(false);
  const [viewMode, setViewMode] = useState<'book' | 'list'>('list'); // 뷰 모드: 책 형태 / 목록 형태
  const [searchDate, setSearchDate] = useState(''); // 날짜 검색 (YYYY-MM-DD)
  const [refreshing, setRefreshing] = useState(false);
  const [searchingByDate, setSearchingByDate] = useState(false);
  
  // 모달 상태
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteDiaryId, setDeleteDiaryId] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  
  const speechBubbleAnim = React.useRef(new Animated.Value(0)).current;
  const currentCharacter = characters.length > 0 ? characters[0] : null;
  const sliderRef = React.useRef<View>(null);

  // 슬라이더 PanResponder
  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {},
        onPanResponderMove: (evt) => {
          if (sliderRef.current) {
            sliderRef.current.measure((_x, _y, width, _height, pageX, _pageY) => {
              const touchX = evt.nativeEvent.pageX - pageX;
              const newValue = Math.max(0, Math.min(100, (touchX / width) * 100));
              setMoodValue(newValue);
            });
          }
        },
        onPanResponderRelease: () => {},
      }),
    []
  );

  // 오늘 일기 작성 여부 확인
  const todayDiary = useMemo(() => {
    const dateString = formatDateYYYYMMDD(new Date());
    return diaries.find(d => d.date === dateString);
  }, [diaries]);

  // 날짜별 다이어리 조회
  const handleSearchByDate = async (date: string) => {
    if (!date.trim()) {
      setSearchDate('');
      setSearchingByDate(false);
      return;
    }

    // 날짜 형식 검증 (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      showAlertModal('알림', '날짜 형식이 올바르지 않습니다. (예: 2026-01-09)');
      return;
    }

    try {
      setSearchingByDate(true);
      const result = await getDiaryByDate(date);
      
      if (result.success && result.data) {
        // 조회된 다이어리를 상세 화면으로 이동
        const diaryData: SimpleDiaryData & { id: string } = {
          id: result.data.id,
          date: result.data.date,
          emotion: result.data.emotion,
          mood: result.data.mood,
          emotions: result.data.emotions,
          emotionFactors: result.data.emotionFactors,
          content: result.data.content,
        };
        setSelectedDiary(diaryData);
        setCurrentStep('detail');
        setSearchDate('');
      } else {
        showAlertModal('알림', result.error || '해당 날짜에 작성한 일기가 없습니다.');
      }
    } catch (error) {
      showAlertModal('오류', '일기 조회에 실패했습니다.');
    } finally {
      setSearchingByDate(false);
    }
  };

  // 필터링된 일기 목록 (전체 목록)
  const filteredDiaries = useMemo(() => {
    return diaries;
  }, [diaries]);

  // 날짜별로 그룹화된 일기 목록
  const groupedDiaries = useMemo(() => {
    const groups: { [key: string]: typeof diaries } = {};
    filteredDiaries.forEach(diary => {
      const dateKey = diary.date;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(diary);
    });
    // 날짜별로 정렬 (최신순)
    return Object.keys(groups)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map(date => ({
        date,
        diaries: groups[date],
      }));
  }, [filteredDiaries]);

  // 새로고침 처리
  const onRefresh = async () => {
    setRefreshing(true);
    if (loadDiaries) {
      await loadDiaries();
    }
    setRefreshing(false);
  };

  // 말풍선 애니메이션
  useEffect(() => {
    Animated.timing(speechBubbleAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentStep, speechBubbleAnim]);

  // 단계별 메시지
  const getStepMessage = () => {
    if (showEmptyMessage) {
      return '작성된 일기가 없습니다.';
    }
    switch (currentStep) {
      case 'welcome':
        return '감정일기에 오신걸 환영해요!';
      case 'mood':
        return '현재 기분이 어떤가요?';
      case 'emotions':
        return '지금 느끼는 감정을 자세히 말해줄래요?';
      case 'factors':
        return '감정에 영향을 준 요인이 있을까요?';
      case 'expression':
        return '오늘 하루를 되돌아보면서 느낀 점을 자세히 말해줄래요?';
      case 'confirm':
        return '오늘의 감정일기가 작성됐어요!';
      default:
        return '';
    }
  };

  // 알림 표시 헬퍼 함수
  const showAlertModal = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlert(true);
  };

  // 다음 단계로 이동
  const handleNext = () => {
    if (currentStep === 'mood') {
      setCurrentStep('emotions');
    } else if (currentStep === 'emotions') {
      if (selectedEmotions.length === 0) {
        showAlertModal('알림', '감정을 하나 이상 선택해주세요.');
        return;
      }
      setCurrentStep('factors');
    } else if (currentStep === 'factors') {
      setCurrentStep('expression');
    } else if (currentStep === 'expression') {
      if (!expressionText.trim()) {
        showAlertModal('알림', '감정 표현을 입력해주세요.');
        return;
      }
      handleSaveDiary();
    }
  };

  // 이전 단계로 이동
  const handleBack = async () => {
    await playButtonSound();
    if (currentStep === 'mood') {
      setCurrentStep('welcome');
    } else if (currentStep === 'emotions') {
      setCurrentStep('mood');
    } else if (currentStep === 'factors') {
      setCurrentStep('emotions');
    } else if (currentStep === 'expression') {
      setCurrentStep('factors');
    } else if (currentStep === 'view') {
      setCurrentStep('welcome');
    } else if (currentStep === 'detail') {
      setCurrentStep('view');
    }
  };

  // 일기 저장
  const handleSaveDiary = async () => {
    try {
      const dateString = formatDateYYYYMMDD(new Date());

      // emotionFactors에 커스텀 요인 추가
      const allFactors = [...selectedFactors];
      if (factorText.trim() && showCustomFactorInput) {
        allFactors.push(factorText.trim());
      }

      const diaryData: SimpleDiaryData = {
        date: dateString,
        mood: moodValue,
        emotions: selectedEmotions,
        emotionFactors: allFactors,
        content: expressionText.trim(),
      };

      const result = await saveDiary(diaryData);
      if (!result.success) {
        showAlertModal('오류', result.error || '일기 저장에 실패했습니다.');
        return;
      }
      setCurrentStep('confirm');
      
      // 2초 후 일기 보기로 이동
      setTimeout(() => {
        setCurrentStep('view');
        // 상태 초기화
        setMoodValue(50);
        setSelectedEmotions([]);
        setSelectedFactors([]);
        setFactorText('');
        setShowCustomFactorInput(false);
        setExpressionText('');
      }, 2000);
    } catch (saveError) {
      showAlertModal('오류', '일기 저장에 실패했습니다.');
    }
  };

  // 감정 태그 선택/해제
  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions(prev => 
      prev.includes(emotion) 
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  // 요인 선택/해제
  const toggleFactor = (factor: string) => {
    setSelectedFactors(prev => 
      prev.includes(factor) 
        ? prev.filter(f => f !== factor)
        : [...prev, factor]
    );
  };

  // 일기 보기 모드로 전환
  const handleViewDiaries = () => {
    if (diaries.length === 0) {
      showAlertModal('알림', '작성된 일기가 없습니다.');
      return;
    }
    setCurrentStep('view');
  };

  // 일기 상세 보기
  const handleViewDetail = (diary: Diary | (SimpleDiaryData & { id: string })) => {
    // Diary 타입을 SimpleDiaryData로 변환
    const diaryData: SimpleDiaryData & { id: string } = {
      id: diary.id,
      date: diary.date,
      emotion: 'emotion' in diary ? diary.emotion : undefined,
      mood: 'mood' in diary ? diary.mood : undefined,
      emotions: 'emotions' in diary ? diary.emotions : undefined,
      emotionFactors: 'emotionFactors' in diary ? diary.emotionFactors : undefined,
      content: diary.content,
    };
    setSelectedDiary(diaryData);
    setCurrentStep('detail');
  };

  // 일기 삭제 확인
  const handleDeleteDiary = (diaryId: string) => {
    setDeleteDiaryId(diaryId);
    setShowDeleteConfirm(true);
  };

  // 일기 삭제 실행
  const confirmDeleteDiary = async () => {
    if (!deleteDiaryId) return;
    
    try {
      await deleteDiary(deleteDiaryId);
      if (selectedDiary?.id === deleteDiaryId) {
        setSelectedDiary(null);
        // 일기가 모두 삭제되었으면 welcome으로 돌아가고 말풍선 표시
        if (diaries.length <= 1) {
          setCurrentStep('welcome');
          setShowEmptyMessage(true);
          // 3초 후 메시지 숨기기
          setTimeout(() => {
            setShowEmptyMessage(false);
          }, 3000);
        } else {
          setCurrentStep('view');
        }
      }
      setShowDeleteConfirm(false);
      setDeleteDiaryId(null);
    } catch (deleteError) {
      setShowDeleteConfirm(false);
      setDeleteDiaryId(null);
      showAlertModal('오류', '일기 삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return <Loading text="일기를 불러오는 중..." />;
  }

  if (error) {
    return <ErrorBoundary error={error} />;
  }

  // 일기 상세 보기
  if (currentStep === 'detail' && selectedDiary) {
    return (
      <ImageBackground
        source={require('../../assets/images/night.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.detailContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Image
              source={require('../../assets/images/left.png')}
              style={styles.backButtonIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          
          <ScrollView 
            style={styles.signboardScrollView}
            contentContainerStyle={styles.signboardScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.signboardContainer}>
              <View style={styles.signboard}>
                <View style={styles.signboardPaper}>
                  {/* 작성일 */}
                  <Text style={styles.signboardTitle}>작성일</Text>
                  <Text style={styles.signboardContent}>
                    {formatDateKorean(selectedDiary.date, true)}
                  </Text>
                  
                  {/* 기분 점수 */}
                  <Text style={styles.signboardTitle}>기분 점수</Text>
                  <Text style={styles.signboardContent}>
                    {selectedDiary.mood !== undefined ? `${selectedDiary.mood}점` : '없음'}
                  </Text>
                  
                  {/* 감정 */}
                  <Text style={styles.signboardTitle}>감정</Text>
                  {selectedDiary.emotions && selectedDiary.emotions.length > 0 ? (
                    <View style={styles.emotionsList}>
                      {selectedDiary.emotions.map((emotion, idx) => (
                        <View key={idx} style={styles.detailEmotionTag}>
                          <Text style={styles.detailEmotionTagText}>{emotion}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.signboardContent}>
                      {selectedDiary.emotion ? 
                        (selectedDiary.emotion === 'happy' ? '행복' :
                         selectedDiary.emotion === 'sad' ? '슬픔' :
                         selectedDiary.emotion === 'angry' ? '화남' :
                         selectedDiary.emotion === 'anxious' ? '불안' :
                         selectedDiary.emotion === 'tired' ? '피곤' :
                         selectedDiary.emotion === 'excited' ? '신남' :
                         selectedDiary.emotion === 'calm' ? '평온' :
                         selectedDiary.emotion === 'grateful' ? '감사' : selectedDiary.emotion) 
                        : '없음'}
                    </Text>
                  )}
                  
                  {/* 감정 요인 */}
                  <Text style={styles.signboardTitle}>감정 요인</Text>
                  {selectedDiary.emotionFactors && selectedDiary.emotionFactors.length > 0 ? (
                    <View style={styles.factorsList}>
                      {selectedDiary.emotionFactors.map((factor, idx) => (
                        <View key={idx} style={styles.factorTag}>
                          <Text style={styles.factorTagText}>{factor}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.signboardContent}>없음</Text>
                  )}
                  
                  {/* 감정 표현 (내용) */}
                  <Text style={styles.signboardTitle}>감정 표현</Text>
                  <Text style={styles.signboardContentText}>
                    {selectedDiary.content || '없음'}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* 버튼을 ScrollView 안으로 이동 */}
            <View style={styles.detailButtons}>
              <TouchableOpacity 
                style={styles.backToListButton}
                onPress={handleBack}
              >
                <Text style={styles.backToListButtonText}>목록으로</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteDiary(selectedDiary.id)}
              >
                <Text style={styles.deleteButtonText}>삭제하기</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* 모달 컴포넌트 */}
        <ConfirmModal
          visible={showDeleteConfirm}
          title="일기 삭제"
          message="정말로 이 일기를 삭제하시겠습니까?"
          confirmText="삭제"
          cancelText="취소"
          onConfirm={confirmDeleteDiary}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setDeleteDiaryId(null);
          }}
          confirmButtonColor={colors.error}
        />
        <AlertModal
          visible={showAlert}
          title={alertTitle}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      </ImageBackground>
    );
  }

  // 일기 보기 모드
  if (currentStep === 'view') {
    return (
      <ImageBackground
        source={require('../../assets/images/night.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.viewContainer}>
          <View style={styles.viewHeader}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Image
                source={require('../../assets/images/left.png')}
                style={styles.backButtonIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            
            {/* 뷰 모드 전환 버튼 */}
            <View style={styles.viewModeButtons}>
              <TouchableOpacity
                style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeButtonActive]}
                onPress={() => setViewMode('list')}
              >
                <Text style={[styles.viewModeButtonText, viewMode === 'list' && styles.viewModeButtonTextActive]}>
                  목록
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.viewModeButton, viewMode === 'book' && styles.viewModeButtonActive]}
                onPress={() => setViewMode('book')}
              >
                <Text style={[styles.viewModeButtonText, viewMode === 'book' && styles.viewModeButtonTextActive]}>
                  책
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 목록 뷰 */}
          {viewMode === 'list' ? (
            <>
              {/* 날짜 검색 바 */}
              <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="날짜 입력 (YYYY-MM-DD)"
                    placeholderTextColor={colors.text.tertiary}
                    value={searchDate}
                    onChangeText={setSearchDate}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                  {searchDate.length > 0 && (
                    <TouchableOpacity
                      style={styles.searchClearButton}
                      onPress={() => {
                        setSearchDate('');
                        setSearchingByDate(false);
                      }}
                    >
                      <Text style={styles.searchClearText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.searchButton, !searchDate.trim() && styles.searchButtonDisabled]}
                  onPress={() => handleSearchByDate(searchDate)}
                  disabled={searchingByDate || !searchDate.trim()}
                >
                  <Text style={styles.searchButtonText}>조회</Text>
                </TouchableOpacity>
              </View>

              {/* 일기 목록 */}
              {filteredDiaries.length > 0 ? (
                <FlatList
                  data={groupedDiaries}
                  keyExtractor={(item) => item.date}
                  renderItem={({ item }) => (
                    <View style={styles.dateGroup}>
                      <Text style={styles.dateGroupTitle}>
                        {formatDateDivider(item.date)}
                      </Text>
                      {item.diaries.map((diary) => (
                        <TouchableOpacity
                          key={diary.id}
                          style={styles.diaryListItem}
                          onPress={() => handleViewDetail(diary)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.diaryListItemContent}>
                            <View style={styles.diaryListItemHeader}>
                              <Text style={styles.diaryListItemEmotion}>
                                {diary.emotion === 'happy' ? '😊' :
                                 diary.emotion === 'sad' ? '😢' :
                                 diary.emotion === 'angry' ? '😠' :
                                 diary.emotion === 'anxious' ? '😰' :
                                 diary.emotion === 'tired' ? '😴' :
                                 diary.emotion === 'excited' ? '🤩' :
                                 diary.emotion === 'calm' ? '😌' :
                                 diary.emotion === 'grateful' ? '🙏' : '😊'}
                              </Text>
                              <Text style={styles.diaryListItemDate}>
                                {formatDateKorean(item.date)}
                              </Text>
                            </View>
                            <Text 
                              style={styles.diaryListItemText}
                              numberOfLines={2}
                            >
                              {diary.content}
                            </Text>
                            {(diary as any).emotions && (diary as any).emotions.length > 0 && (
                              <View style={styles.diaryListItemTags}>
                                {(diary as any).emotions.slice(0, 3).map((emotion: string, idx: number) => (
                                  <View key={idx} style={styles.diaryListItemTag}>
                                    <Text style={styles.diaryListItemTagText}>{emotion}</Text>
                                  </View>
                                ))}
                                {(diary as any).emotions.length > 3 && (
                                  <Text style={styles.diaryListItemTagMore}>
                                    +{(diary as any).emotions.length - 3}
                                  </Text>
                                )}
                              </View>
                            )}
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  contentContainerStyle={styles.listContent}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      tintColor={colors.white}
                      colors={[colors.primary[500]]}
                    />
                  }
                  ListEmptyComponent={
                    <View style={styles.emptyView}>
                      <Text style={styles.emptyText}>
                        작성된 일기가 없습니다
                      </Text>
                    </View>
                  }
                />
              ) : (
                <View style={styles.emptyView}>
                  <Text style={styles.emptyText}>
                    작성된 일기가 없습니다
                  </Text>
                </View>
              )}
            </>
          ) : (
            /* 책 형태 뷰 */
            <>
              {diaries.length > 0 ? (
                <>
                  <View style={styles.topSection}>
                    <TouchableOpacity
                      style={styles.bookContainer}
                      onPress={async () => {
                        await playReadBookSound();
                        handleViewDetail(diaries[viewingDiaryIndex]);
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.paperContainer}>
                        <Image
                          source={require('../../assets/images/paper.png')}
                          style={styles.paperImage}
                          resizeMode="contain"
                        />
                        <View style={styles.paperTextOverlay}>
                          <Text style={styles.paperDate}>
                            {`${diaries[viewingDiaryIndex]?.date || ''}\n작성한 감정 일기`}
                          </Text>
                        </View>
                      </View>
                      <Image
                        source={require('../../assets/images/book.png')}
                        style={styles.bookImage}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                  
                  {/* 이전/다음 버튼 */}
                  {diaries.length > 1 && (
                    <View style={styles.bookNavigation}>
                      <TouchableOpacity
                        style={[styles.navButton, viewingDiaryIndex === 0 && styles.navButtonDisabled]}
                        onPress={() => setViewingDiaryIndex(Math.max(0, viewingDiaryIndex - 1))}
                        disabled={viewingDiaryIndex === 0}
                      >
                        <Text style={styles.navButtonText}>← 다음</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.navButton, viewingDiaryIndex >= diaries.length - 1 && styles.navButtonDisabled]}
                        onPress={() => setViewingDiaryIndex(Math.min(diaries.length - 1, viewingDiaryIndex + 1))}
                        disabled={viewingDiaryIndex >= diaries.length - 1}
                      >
                        <Text style={styles.navButtonText}>이전 →</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.emptyView}>
                  <Text style={styles.emptyText}>작성된 일기가 없습니다</Text>
                </View>
              )}

              {currentCharacter && (
                <View style={styles.characterContainer}>
                  <Image
                    source={getCharacterImage(currentCharacter.level || 1, 'default')}
                    style={styles.characterImage}
                    resizeMode="contain"
                  />
                </View>
              )}
            </>
          )}
        </View>

        {/* 모달 컴포넌트 */}
        <ConfirmModal
          visible={showDeleteConfirm}
          title="일기 삭제"
          message="정말로 이 일기를 삭제하시겠습니까?"
          confirmText="삭제"
          cancelText="취소"
          onConfirm={confirmDeleteDiary}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setDeleteDiaryId(null);
          }}
          confirmButtonColor={colors.error}
        />
        <AlertModal
          visible={showAlert}
          title={alertTitle}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      </ImageBackground>
    );
  }

  // 일기 작성 플로우
  return (
    <ImageBackground
      source={require('../../assets/images/night.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* 캐릭터 */}
      {currentCharacter && (
        <View style={styles.characterContainer}>
          <Image
            source={getCharacterImage(currentCharacter.level || 1, currentStep === 'confirm' ? 'happy' : 'default')}
            style={styles.characterImage}
            resizeMode="contain"
          />
        </View>
      )}

      {/* 모달 다이얼로그 */}
      <Animated.View 
        style={[
          currentStep === 'welcome' ? styles.modalContainerWelcome : styles.modalContainer,
          {
            opacity: speechBubbleAnim,
            transform: [
              {
                translateY: speechBubbleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        {/* 질문 */}
        <Text style={styles.modalQuestion}>{getStepMessage()}</Text>

        {/* 단계별 컨텐츠 */}
        <View style={
          currentStep === 'expression' 
            ? styles.modalContentExpression 
            : currentStep === 'factors'
            ? styles.modalContentFactors
            : styles.modalContent
        }>
          {currentStep === 'mood' && (
            <View style={styles.moodContainer}>
              <View 
                ref={sliderRef}
                style={styles.sliderTrack}
                {...panResponder.panHandlers}
              >
                <View style={[styles.sliderFill, { width: `${moodValue}%` }]} />
                <View style={[styles.sliderThumb, { left: `${moodValue}%` }]} />
              </View>
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>매우 좋지 않음</Text>
                <Text style={styles.sliderLabel}>매우 좋음</Text>
              </View>
            </View>
          )}

          {currentStep === 'emotions' && (
            <EmotionSelectionStep
              selectedEmotions={selectedEmotions}
              onToggleEmotion={toggleEmotion}
            />
          )}

          {currentStep === 'factors' && (
            <FactorSelectionStep
              selectedFactors={selectedFactors}
              customFactor={factorText}
              onToggleFactor={toggleFactor}
              onCustomFactorChange={setFactorText}
              onShowCustomInput={() => setShowCustomFactorInput(!showCustomFactorInput)}
              showCustomInput={showCustomFactorInput}
            />
          )} 

          {currentStep === 'expression' && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={expressionText}
                onChangeText={setExpressionText}
                placeholder="자세히 입력해주세요"
                placeholderTextColor={colors.text.tertiary}
                multiline={true}
                textAlignVertical="top"
              />
            </View>
          )}
        </View>

        {/* 버튼 */}
        {currentStep === 'welcome' ? (
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.writeButton}
              onPress={() => {
                if (todayDiary) {
                  showAlertModal('알림', '오늘의 감정일기는 이미 작성하셨답니다~!');
                  return;
                }
                setCurrentStep('mood');
              }}
            >
              <Text style={styles.writeButtonText}>일기 작성하기</Text>
            </TouchableOpacity>
            {diaries.length > 0 && (
              <TouchableOpacity 
                style={styles.viewButton}
                onPress={handleViewDiaries}
              >
                <Text style={styles.viewButtonText}>일기 보기</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : currentStep === 'expression' ? (
          <View style={[styles.modalButtons, styles.modalButtonsExpression]}>
            <TouchableOpacity style={styles.skipButton} onPress={handleBack}>
              <Text style={styles.skipButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.confirmButton, !expressionText.trim() && styles.confirmButtonDisabled]}
              onPress={handleNext}
              disabled={!expressionText.trim()}
            >
              <Text style={styles.confirmButtonText}>등록 완료</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleBack}>
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={handleNext}
            >
              <Text style={styles.confirmButtonText}>선택완료</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      {/* 모달 컴포넌트 */}
      <AlertModal
        visible={showAlert}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  modalContainerWelcome: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: borderRadius.lg,
    padding: spacing[6],
    paddingVertical: spacing[8],
    marginHorizontal: spacing[4],
    marginTop: spacing[12],
    minHeight: 180,
    ...shadows.lg,
  },
  modalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    marginHorizontal: spacing[4],
    marginTop: spacing[12],
    maxHeight: SCREEN_HEIGHT * 0.8,
    ...shadows.lg,
  },
  modalQuestion: {
    paddingVertical: spacing[2],
    fontSize: typography.fontSize['xl'],
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
    textAlign: 'left',
    marginBottom: spacing[1],
    lineHeight: getOptimizedLineHeight(typography.fontSize['2xl']),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  modalContent: {
    marginBottom: spacing[3],
  },
  modalContentFactors: {
    marginBottom: spacing[3],
    minHeight: 300,
  },
  modalContentExpression: {
    marginBottom: spacing[1],
    flex: 1,
    minHeight: 260,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[3],
    marginTop: spacing[2],
  },
  modalButtonsExpression: {
    marginTop: spacing[0],
  },
  moodContainer: {
    paddingVertical: spacing[1],
  },
  sliderTrack: {
    width: '100%',
    height: 29,
    backgroundColor: colors.white,
    borderRadius: borderRadius.full,
    position: 'relative',
    marginVertical: spacing[4],
    justifyContent: 'center',
  },
  sliderFill: {
    position: 'absolute',
    height: 3,
    backgroundColor: colors.blue[500],
    borderRadius: borderRadius.full,
    left: 0,
  },
  sliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: colors.blue[500],
    borderRadius: borderRadius.full,
    marginLeft: -12,
    ...shadows.base,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[0],
  },
  sliderLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[300],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  sliderValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.blue[400],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  emotionsContainer: {
    maxHeight: 450,
  },
  emotionsContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    paddingBottom: spacing[4],
  },
  emotionTag: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  emotionTagSelected: {
    borderWidth: 2,
  },
  emotionTagText: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  emotionTagTextSelected: {
    color: colors.gray[900],
    fontWeight: typography.fontWeight.medium,
  },
  inputContainer: {
    flex: 1,
  },
  textInput: {
    backgroundColor: colors.gray[900],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    minHeight: 260,
    fontSize: typography.fontSize.base,
    color: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[700],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    textAlignVertical: 'top',
  },
  cancelButton: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[900],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  skipButton: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[900],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  confirmButton: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: 'rgba(75, 85, 99, 0.5)',
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[800],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  characterContainer: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.05,
    left: '43%',
    transform: [{ translateX: -(SCREEN_WIDTH * 0.6) / 2 }],
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing[6],
    gap: spacing[3],
  },
  backButton: {
    padding: spacing[2],
  },
  backButtonIcon: {
    width: 24,
    height: 24,
  },
  writeButton: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  writeButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[900],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    textAlign: 'center',
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  viewButton: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(55, 65, 81, 0.8)',
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  nextButton: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[900],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  viewContainer: {
    flex: 1,
    paddingTop: spacing[1],
    paddingHorizontal: spacing[5],
  },
  viewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[4],
    marginBottom: spacing[3],
  },
  viewModeButtons: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: borderRadius.lg,
    padding: spacing[1],
    gap: spacing[1],
  },
  viewModeButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
  },
  viewModeButtonActive: {
    backgroundColor: colors.primary[500],
  },
  viewModeButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  viewModeButtonTextActive: {
    color: colors.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing[4],
    marginBottom: spacing[3],
    gap: spacing[2],
  },
  searchInputContainer: {
    flex: 0,
    width: 300,
    position: 'relative',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[700],
  },
  searchInput: {
    width: '100%',
    paddingVertical: spacing[2],
    paddingLeft: spacing[3],
    paddingRight: spacing[10], // X 버튼 공간 확보
    fontSize: typography.fontSize.base,
    color: colors.white,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  searchButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: colors.gray[600],
    opacity: 0.5,
  },
  searchButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  searchClearButton: {
    position: 'absolute',
    right: spacing[2],
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
    zIndex: 1,
  },
  searchClearText: {
    fontSize: typography.fontSize.lg,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
  },
  listContent: {
    paddingBottom: spacing[6],
  },
  dateGroup: {
    marginBottom: spacing[4],
  },
  dateGroupTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
    marginBottom: spacing[2],
    paddingHorizontal: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  diaryListItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[2],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  diaryListItemContent: {
    width: '100%',
  },
  diaryListItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  diaryListItemEmotion: {
    fontSize: typography.fontSize.xl,
  },
  diaryListItemDate: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[300],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  diaryListItemText: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    marginBottom: spacing[2],
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  diaryListItemTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
    alignItems: 'center',
  },
  diaryListItemTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  diaryListItemTagText: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  diaryListItemTagMore: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[400],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  bookPageInfo: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  topSection: {
    alignItems: 'center',
  },
  bookContainer: {
    alignItems: 'center',
    marginTop: spacing[0],
    position: 'relative',
  },
  bookImage: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8 * 1,
  },
  paperContainer: {
    position: 'absolute',
    top: SCREEN_WIDTH * 0.4,
    left: SCREEN_WIDTH * 0.1,
    alignItems: 'center',
    justifyContent: 'center',
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6 * 1.3,
  },
  paperImage: {
    width: SCREEN_WIDTH * 0.5,
    height: SCREEN_WIDTH * 0.6 * 1.1 ,
  },
  paperTextOverlay: {
    position: 'absolute',
    top: spacing[15],
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    zIndex: 2,
  },
  paperTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.black,
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  paperDate: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.black,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  bookNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    right: 20,
    alignItems: 'center',
    marginTop: -spacing[8],
    paddingHorizontal: spacing[26],
    width: '110%',
  },
  navButton: {
    padding: spacing[3],
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[800],
    opacity: 0.8,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: typography.fontSize.xl,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  viewDetailButton: {
    marginTop: -spacing[20],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.green[600],
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 120,
  },
  viewDetailButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  emptyView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    color: colors.white,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  detailContainer: {
    flex: 1,
    paddingTop: spacing[8],
    paddingHorizontal: spacing[5],
  },
  signboardContainer: {
    alignItems: 'center',
    marginTop: spacing[6],
  },
  signboard: {
    backgroundColor: colors.orange[900],
    borderRadius: borderRadius.xl,
    padding: spacing[2],
    width: SCREEN_WIDTH * 0.85,
    ...shadows.lg,
  },
  signboardPaper: {
    backgroundColor: colors.orange[50],
    borderRadius: borderRadius.lg,
    padding: spacing[5],
  },
  signboardTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginTop: spacing[3],
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  signboardContent: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    marginBottom: spacing[4],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  signboardContentText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
    marginBottom: spacing[4],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  signboardScrollView: {
    flex: 1,
  },
  signboardScrollContent: {
    paddingBottom: spacing[5],
  },
  emotionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  detailEmotionTag: {
    backgroundColor: colors.primary[100],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  detailEmotionTagText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[700],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  factorsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  factorTag: {
    backgroundColor: colors.orange[100],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderWidth: 1,
    borderColor: colors.orange[300],
  },
  factorTagText: {
    fontSize: typography.fontSize.sm,
    color: colors.orange[700],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  detailButtons: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[16],
    marginBottom: spacing[6],
    paddingHorizontal: spacing[2],
  },
  backToListButton: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray[700],
    alignItems: 'center',
  },
  backToListButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.error,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
});

export default DiaryScreen;

