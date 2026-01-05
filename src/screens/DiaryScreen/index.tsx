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
  PanResponder
} from 'react-native';
import { useDiary } from '../../hooks/useDiary';
import { useCharacter } from '../../hooks/useCharacter';
import { Loading, ErrorBoundary, ConfirmModal, AlertModal } from '../../components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { SimpleDiaryData } from '../../types';
import { formatDateYYYYMMDD } from '../../utils/dateUtils';
import { EMOTION_TAGS } from './DiaryScreen.constants';
import { DiaryStep } from './DiaryScreen.types';
import { getEmotionColor, addOpacity, getCharacterImage } from './DiaryScreen.utils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const DiaryScreen: React.FC = () => {
  const { diaries, loading, error, saveDiary, deleteDiary } = useDiary();
  const { characters } = useCharacter();
  const [currentStep, setCurrentStep] = useState<DiaryStep>('welcome');
  const [moodValue, setMoodValue] = useState(50);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [factorText, setFactorText] = useState('');
  const [expressionText, setExpressionText] = useState('');
  const [selectedDiary, setSelectedDiary] = useState<(SimpleDiaryData & { id: string }) | null>(null);
  const [viewingDiaryIndex, setViewingDiaryIndex] = useState(0);
  const [showEmptyMessage, setShowEmptyMessage] = useState(false);
  
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
        return '감성일기에 오신걸 환영해요!';
      case 'mood':
        return '현재 기분이 어떤가요?';
      case 'emotions':
        return '지금 느끼는 감정을 자세히 말해줄래요?';
      case 'factors':
        return '감정에 영향을 준 요인이 있을까요?';
      case 'expression':
        return '지금의 감정에 대해 얘기해보자면...?';
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
  const handleBack = () => {
    if (currentStep === 'mood') {
      setCurrentStep('welcome');
    } else if (currentStep === 'emotions') {
      setCurrentStep('mood');
    } else if (currentStep === 'expression') {
      setCurrentStep('emotions');
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

      const diaryData: SimpleDiaryData = {
        date: dateString,
        emotion: selectedEmotions.join(', '),
        content: `[기분 점수: ${moodValue}/100]\n\n${expressionText.trim()}`,
      };

      await saveDiary(diaryData as any);
      setCurrentStep('confirm');
      
      // 2초 후 일기 보기로 이동
      setTimeout(() => {
        setCurrentStep('view');
        // 상태 초기화
        setMoodValue(50);
        setSelectedEmotions([]);
        setFactorText('');
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

  // 일기 보기 모드로 전환
  const handleViewDiaries = () => {
    if (diaries.length === 0) {
      showAlertModal('알림', '작성된 일기가 없습니다.');
      return;
    }
    setCurrentStep('view');
  };

  // 일기 상세 보기
  const handleViewDetail = (diary: SimpleDiaryData & { id: string }) => {
    setSelectedDiary(diary);
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
          
          <View style={styles.signboardContainer}>
            <View style={styles.signboard}>
              <View style={styles.signboardPaper}>
                <Text style={styles.signboardTitle}>오늘의 감정</Text>
                <Text style={styles.signboardContent}>{selectedDiary.emotion}</Text>
                
                <Text style={styles.signboardTitle}>기분 점수</Text>
                <Text style={styles.signboardContent}>
                  {selectedDiary.content.match(/\[기분 점수: (.*?)\]/)?.[1] || '없음'}
                </Text>
                
                <Text style={styles.signboardTitle}>감정 표현</Text>
                <Text style={styles.signboardContent}>
                  {selectedDiary.content.split('\n').slice(2).join('\n').trim() || '없음'}
                </Text>
                
                <Text style={styles.signboardTitle}>작성일</Text>
                <Text style={styles.signboardContent}>{selectedDiary.date}</Text>
              </View>
            </View>
          </View>

          {currentCharacter && (
            <View style={styles.characterContainer}>
              <Image
                source={getCharacterImage(currentCharacter.level || 1, 'default')}
                style={styles.characterImage}
                resizeMode="contain"
              />
            </View>
          )}

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

  // 일기 보기 모드 (책 형태)
  if (currentStep === 'view') {
    return (
      <ImageBackground
        source={require('../../assets/images/night.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.viewContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Image
              source={require('../../assets/images/left.png')}
              style={styles.backButtonIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {diaries.length > 0 ? (
            <>
              <View style={styles.topSection}>
                <TouchableOpacity
                  style={styles.bookContainer}
                  onPress={() => handleViewDetail(diaries[viewingDiaryIndex] as any)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={require('../../assets/images/book.png')}
                    style={styles.bookImage}
                    resizeMode="contain"
                  />
                  <View style={styles.bookTextOverlay}>
                    <Text style={styles.bookTitle}>감성 일기</Text>
                    <Text style={styles.bookDate}>
                      {diaries[viewingDiaryIndex]?.date || ''}
                    </Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.bookNavigation}>
                  <TouchableOpacity
                    style={[styles.navButton, viewingDiaryIndex === 0 && styles.navButtonDisabled]}
                    onPress={() => setViewingDiaryIndex(Math.max(0, viewingDiaryIndex - 1))}
                    disabled={viewingDiaryIndex === 0}
                  >
                    <Text style={styles.navButtonText}>←</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.navButton, viewingDiaryIndex >= diaries.length - 1 && styles.navButtonDisabled]}
                    onPress={() => setViewingDiaryIndex(Math.min(diaries.length - 1, viewingDiaryIndex + 1))}
                    disabled={viewingDiaryIndex >= diaries.length - 1}
                  >
                    <Text style={styles.navButtonText}>→</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
        <View style={currentStep === 'expression' ? styles.modalContentExpression : styles.modalContent}>
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
            <ScrollView 
              style={styles.emotionsContainer}
              contentContainerStyle={styles.emotionsContent}
              showsVerticalScrollIndicator={false}
            >
              {EMOTION_TAGS.map((emotion) => {
                const emotionColor = getEmotionColor(emotion);
                const isSelected = selectedEmotions.includes(emotion);
                return (
                  <TouchableOpacity
                    key={emotion}
                    style={[
                      styles.emotionTag,
                      {
                        backgroundColor: isSelected 
                          ? emotionColor 
                          : addOpacity(emotionColor, 0.2),
                        borderColor: emotionColor,
                      },
                      isSelected && styles.emotionTagSelected
                    ]}
                    onPress={() => toggleEmotion(emotion)}
                  >
                    <Text style={[
                      styles.emotionTagText,
                      isSelected && styles.emotionTagTextSelected
                    ]}>
                      {emotion}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {currentStep === 'factors' && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={factorText}
                onChangeText={setFactorText}
                placeholder="자세히 입력해주세요"
                placeholderTextColor={colors.text.tertiary}
                multiline={true}
                textAlignVertical="top"
              />
            </View>
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
          <View style={styles.modalButtons}>
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
    marginHorizontal: spacing[4],
    marginTop: spacing[12],
    ...shadows.lg,
  },
  modalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: borderRadius.lg,
    padding: spacing[6],
    marginHorizontal: spacing[4],
    marginTop: spacing[12],
    maxHeight: SCREEN_HEIGHT * 0.8,
    ...shadows.lg,
  },
  modalQuestion: {
    paddingVertical: spacing[3],
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
    textAlign: 'left',
    marginBottom: spacing[1],
    lineHeight: 28,
  },
  modalContent: {
    marginBottom: spacing[4],
  },
  modalContentExpression: {
    marginBottom: spacing[4],
    flex: 1,
    minHeight: 260,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[3],
    marginTop: spacing[2],
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
  },
  sliderValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.blue[400],
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
  },
  emotionTagTextSelected: {
    color: colors.gray[900],
    fontWeight: typography.fontWeight.bold,
  },
  inputContainer: {
    flex: 1,
  },
  textInput: {
    backgroundColor: colors.gray[900],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    minHeight: 200,
    fontSize: typography.fontSize.base,
    color: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[700],
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
    fontWeight: typography.fontWeight.bold,
  },
  characterContainer: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.15 + 40,
    left: '40%',
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
  },
  writeButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[900],
    fontWeight: typography.fontWeight.bold,
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
    fontWeight: typography.fontWeight.bold,
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
    fontWeight: typography.fontWeight.bold,
  },
  viewContainer: {
    flex: 1,
    paddingTop: spacing[1],
    paddingHorizontal: spacing[5],
  },
  topSection: {
    alignItems: 'center',
  },
  bookContainer: {
    alignItems: 'center',
    marginTop: spacing[2],
    position: 'relative',
  },
  bookImage: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8 * 1.2,
  },
  bookTextOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing[2],
  },
  bookDate: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[300],
  },
  bookNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing[2],
    paddingHorizontal: spacing[4],
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
    fontWeight: typography.fontWeight.bold,
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
    fontWeight: typography.fontWeight.bold,
  },
  emptyView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    color: colors.white,
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
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing[3],
    marginBottom: spacing[2],
  },
  signboardContent: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing[4],
  },
  detailButtons: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[6],
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
    fontWeight: typography.fontWeight.bold,
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
    fontWeight: typography.fontWeight.bold,
  },
});

export default DiaryScreen;

