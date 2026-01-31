/**
 * DiaryScreen 비즈니스 로직
 * 일기 화면: 일기 작성, 조회, 삭제, 단계별 플로우 관리
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Animated, PanResponder } from 'react-native';
import { useDiary } from '../../hooks/useDiary';
import { useCharacter } from '../../hooks/useCharacter';
import { SimpleDiaryData, Diary } from '../../types';
import { formatDateYYYYMMDD } from '../../utils/dateUtils';
import { DiaryStep } from '../../types/screens/diary';
import { playButtonSound } from '../../utils/soundUtils';

// 기분 값에 따른 그라데이션 색상 계산 (0: 연한 빨강 → 100: 진한 초록)
const getMoodColor = (value: number): string => {
  // 0-100 값을 0-1 범위로 정규화
  const normalized = value / 100;

  // 빨강 (0) → 노랑 (50) → 초록 (100) 그라데이션
  // 값이 낮을수록 연하게, 높을수록 진하게
  if (normalized < 0.5) {
    // 0-50: 연한 빨강 → 진한 노랑
    const t = normalized * 2; // 0-1로 변환
    // 연한 빨강 (255, 100, 100) → 진한 노랑 (255, 200, 0)
    const r = Math.round(255);
    const g = Math.round(100 + (200 - 100) * t);
    const b = Math.round(100 - 100 * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // 50-100: 진한 노랑 → 진한 초록
    const t = (normalized - 0.5) * 2; // 0-1로 변환
    // 진한 노랑 (255, 200, 0) → 진한 초록 (34, 139, 34)
    const r = Math.round(255 - (255 - 34) * t);
    const g = Math.round(200 - (200 - 139) * t);
    const b = Math.round(0 + (34 - 0) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
};

export const useDiaryScreenContainer = () => {
  const { diaries, loading, error, saveDiary, deleteDiary, loadDiaries, getDiaryByDate } = useDiary();
  const { characters } = useCharacter();

  const [currentStep, setCurrentStep] = useState<DiaryStep>('welcome');
  const [moodValue, setMoodValue] = useState(50);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [factorText, setFactorText] = useState('');
  const [emotionText, setEmotionText] = useState('');
  const [expressionText, setExpressionText] = useState('');
  const [selectedDiary, setSelectedDiary] = useState<(SimpleDiaryData & { id: string }) | null>(null);
  const [showEmptyMessage, setShowEmptyMessage] = useState(false);
  const [searchDate, setSearchDate] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [searchingByDate, setSearchingByDate] = useState(false);

  // 모달 상태
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteDiaryId, setDeleteDiaryId] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const speechBubbleAnim = useRef(new Animated.Value(0)).current;
  const currentCharacter = characters.length > 0 ? characters[0] : null;
  const sliderRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  /**
   * 마운트 상태 관리
   */
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * 슬라이더 PanResponder
   */
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          // 수평 드래그만 허용 (수직 스크롤 무시)
          return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        },
        onPanResponderGrant: evt => {
          if (!evt.nativeEvent || !sliderRef.current) return;
          evt.persist(); // 이벤트 풀링 방지
          const pageX = evt.nativeEvent.pageX;
          if (pageX == null || isNaN(pageX)) return;

          sliderRef.current.measure((_x: number, _y: number, width: number, _height: number, sliderPageX: number, _pageY: number) => {
            if (!isMountedRef.current || width === 0 || sliderPageX == null || isNaN(sliderPageX)) return;
            const touchX = pageX - sliderPageX;
            const newValue = Math.max(0, Math.min(100, (touchX / width) * 100));
            setMoodValue(newValue);
          });
        },
        onPanResponderMove: evt => {
          if (!evt.nativeEvent || !sliderRef.current) return;
          evt.persist(); // 이벤트 풀링 방지
          const pageX = evt.nativeEvent.pageX;
          if (pageX == null || isNaN(pageX)) return;

          sliderRef.current.measure((_x: number, _y: number, width: number, _height: number, sliderPageX: number, _pageY: number) => {
            if (!isMountedRef.current || width === 0 || sliderPageX == null || isNaN(sliderPageX)) return;
            const touchX = pageX - sliderPageX;
            const newValue = Math.max(0, Math.min(100, (touchX / width) * 100));
            setMoodValue(newValue);
          });
        },
        onPanResponderRelease: () => {},
      }),
    []
  );

  /**
   * 오늘 일기 작성 여부 확인
   */
  const todayDiary = useMemo(() => {
    const dateString = formatDateYYYYMMDD(new Date());
    return diaries.find(d => d.date === dateString);
  }, [diaries]);

  /**
   * 필터링된 일기 목록 (전체 목록)
   */
  const filteredDiaries = useMemo(() => {
    return diaries;
  }, [diaries]);

  /**
   * 날짜별로 그룹화된 일기 목록
   */
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

  /**
   * 새로고침 처리
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (loadDiaries) {
      await loadDiaries();
    }
    setRefreshing(false);
  }, [loadDiaries]);

  /**
   * 말풍선 애니메이션
   */
  useEffect(() => {
    Animated.timing(speechBubbleAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentStep, speechBubbleAnim]);

  /**
   * 단계별 메시지
   */
  const getStepMessage = useCallback(() => {
    if (showEmptyMessage) {
      return '작성된 일기가 없습니다.';
    }
    switch (currentStep) {
      case 'welcome':
        return '감정일기에 오신걸 환영해요!';
      case 'mood':
        return '현재 기분이 어떤가요?';
      case 'emotions':
        return '지금 느끼는 감정을 선택해주세요';
      case 'factors':
        return '감정에 영향을 준 요인을 선택해주세요';
      case 'expression':
        return '오늘 하루를 되돌아보면서 느낀 점을 자세히 적어볼까요?';
      case 'confirm':
        return '오늘의 감정일기가 작성됐어요!';
      default:
        return '';
    }
  }, [currentStep, showEmptyMessage]);

  /**
   * 알림 표시 헬퍼 함수
   */
  const showAlertModal = useCallback((title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlert(true);
  }, []);

  /**
   * 일기 저장
   */
  const handleSaveDiary = useCallback(async () => {
    try {
      const dateString = formatDateYYYYMMDD(new Date());

      // emotionFactors에 커스텀 요인 추가
      const allFactors = [...selectedFactors];
      if (factorText.trim()) {
        allFactors.push(factorText.trim());
      }

      // emotions에 커스텀 감정 추가
      const allEmotions = [...selectedEmotions];
      if (emotionText.trim()) {
        allEmotions.push(emotionText.trim());
      }

      const diaryData: SimpleDiaryData = {
        date: dateString,
        mood: Math.round(moodValue),
        emotions: allEmotions,
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
        setEmotionText('');
        setExpressionText('');
      }, 2000);
    } catch (saveError) {
      showAlertModal('오류', '일기 저장에 실패했습니다.');
    }
  }, [moodValue, selectedEmotions, selectedFactors, factorText, emotionText, expressionText, saveDiary, showAlertModal]);

  /**
   * 다음 단계로 이동
   */
  const handleNext = useCallback(() => {
    if (currentStep === 'mood') {
      setCurrentStep('emotions');
    } else if (currentStep === 'emotions') {
      if (selectedEmotions.length === 0 && !emotionText.trim()) {
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
  }, [currentStep, selectedEmotions, emotionText, expressionText, showAlertModal, handleSaveDiary]);

  /**
   * 이전 단계로 이동
   */
  const handleBack = useCallback(async () => {
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
  }, [currentStep]);

  /**
   * 감정 태그 선택/해제
   */
  const toggleEmotion = useCallback((emotion: string) => {
    setSelectedEmotions(prev => (prev.includes(emotion) ? prev.filter(e => e !== emotion) : [...prev, emotion]));
  }, []);

  /**
   * 요인 선택/해제
   */
  const toggleFactor = useCallback((factor: string) => {
    setSelectedFactors(prev => (prev.includes(factor) ? prev.filter(f => f !== factor) : [...prev, factor]));
  }, []);

  /** 기분 슬라이더: 10점 낮춤 (TalkBack/마우스 대안) */
  const adjustMoodDown = useCallback(() => {
    setMoodValue(prev => Math.max(0, Math.min(100, prev - 10)));
  }, []);

  /** 기분 슬라이더: 10점 높임 (TalkBack/마우스 대안) */
  const adjustMoodUp = useCallback(() => {
    setMoodValue(prev => Math.max(0, Math.min(100, prev + 10)));
  }, []);

  /**
   * 일기 보기 모드로 전환
   */
  const handleViewDiaries = useCallback(() => {
    if (diaries.length === 0) {
      showAlertModal('알림', '작성된 일기가 없습니다.');
      return;
    }
    setCurrentStep('view');
  }, [diaries.length, showAlertModal]);

  /**
   * 일기 상세 보기
   */
  const handleViewDetail = useCallback((diary: Diary | (SimpleDiaryData & { id: string })) => {
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
  }, []);

  /**
   * 일기 삭제 확인
   */
  const handleDeleteDiary = useCallback((diaryId: string) => {
    setDeleteDiaryId(diaryId);
    setShowDeleteConfirm(true);
  }, []);

  /**
   * 일기 삭제 실행
   */
  const confirmDeleteDiary = useCallback(async () => {
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
  }, [deleteDiaryId, selectedDiary, diaries.length, deleteDiary, showAlertModal]);

  /**
   * 날짜별 다이어리 조회
   */
  const handleSearchByDate = useCallback(
    async (date: string) => {
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
      } catch (err) {
        showAlertModal('오류', '일기 조회에 실패했습니다.');
      } finally {
        setSearchingByDate(false);
      }
    },
    [getDiaryByDate, showAlertModal]
  );

  /**
   * 일기 작성 시작
   */
  const handleStartWriting = useCallback(() => {
    if (todayDiary) {
      showAlertModal('알림', '오늘의 감정일기는 이미 작성하셨답니다~!');
      return;
    }
    setCurrentStep('mood');
  }, [todayDiary, showAlertModal]);

  /**
   * 삭제 확인 모달 취소
   */
  const handleDeleteCancel = useCallback(() => {
    setShowDeleteConfirm(false);
    setDeleteDiaryId(null);
  }, []);

  /**
   * 알림 모달 닫기
   */
  const handleAlertClose = useCallback(() => {
    setShowAlert(false);
  }, []);

  /**
   * 검색 날짜 초기화
   */
  const handleSearchDateClear = useCallback(() => {
    setSearchDate('');
    setSearchingByDate(false);
  }, []);


  return {
    // Data
    diaries,
    loading,
    error,
    currentCharacter,
    todayDiary,
    filteredDiaries,
    groupedDiaries,
    // Step & State
    currentStep,
    moodValue,
    selectedEmotions,
    selectedFactors,
    factorText,
    emotionText,
    expressionText,
    selectedDiary,
    showEmptyMessage,
    searchDate,
    refreshing,
    searchingByDate,
    // Modals
    showDeleteConfirm,
    deleteDiaryId,
    showAlert,
    alertTitle,
    alertMessage,
    // Animations & Refs
    speechBubbleAnim,
    sliderRef,
    panResponder,
    // Handlers
    handleNext,
    handleBack,
    handleSaveDiary,
    toggleEmotion,
    toggleFactor,
    handleViewDiaries,
    handleViewDetail,
    handleDeleteDiary,
    confirmDeleteDiary,
    handleSearchByDate,
    handleStartWriting,
    handleDeleteCancel,
    handleAlertClose,
    handleSearchDateClear,
    onRefresh,
    setMoodValue,
    adjustMoodDown,
    adjustMoodUp,
    setFactorText,
    setEmotionText,
    setExpressionText,
    setSearchDate,
    // Utils
    getMoodColor,
    getStepMessage,
  };
};
