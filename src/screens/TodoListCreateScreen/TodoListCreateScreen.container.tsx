/**
 * TodoListCreateScreen 비즈니스 로직
 * 투두리스트 생성 화면: 미션 선택, 시간 설정, 투두리스트 생성
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { SCREEN_NAMES } from '../../utils/constants';
import { initTodoList, getSelectableMissions, createTodoList, rerollRandomMission } from '../../api/todolistApi';
import { MissionSimple, TodoListCreateRequest } from '../../types/todolist';
import { createCustomMission, CreateMissionRequest } from '../../api/missionApi';
import { Step, TodoListCreateScreenProps, TimePeriod } from '../../types/screens/todolist';
import { DEFAULT_START_TIME, DEFAULT_END_TIME } from '../../constants/screens/todolist';

export const useTodoListCreateScreenContainer = ({ navigation, route }: TodoListCreateScreenProps) => {
  // 오류/알림용 AlertModal (useErrorHandler overrides)
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const handleCloseAlert = useCallback(() => setShowAlert(false), []);

  const errorHandlerOverrides = useMemo(
    () => ({
      onShowError: (t: string, m: string) => {
        setAlertTitle(t);
        setAlertMessage(m);
        setShowAlert(true);
      },
      onShowInfo: (t: string, m: string) => {
        setAlertTitle(t);
        setAlertMessage(m);
        setShowAlert(true);
      },
    }),
    []
  );
  const { showError, showInfo, handleApiError } = useErrorHandler(errorHandlerOverrides);

  const [currentStep, setCurrentStep] = useState<Step>(route?.params?.activeStep || 'random');
  const [randomMissions, setRandomMissions] = useState<MissionSimple[]>([]);
  const [customMissions, setCustomMissions] = useState<MissionSimple[]>([]);
  const [selectedCustomMissions, setSelectedCustomMissions] = useState<number[]>([]);
  const [onlyMyMissions, setOnlyMyMissions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isAllDay, setIsAllDay] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // 인라인 미션 생성 폼 상태
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMissionTitle, setNewMissionTitle] = useState('');
  const [newMissionDescription, setNewMissionDescription] = useState('');
  const [creatingMission, setCreatingMission] = useState(false);

  // 미션 생성 성공 모달 상태
  const [showMissionSuccessModal, setShowMissionSuccessModal] = useState(false);

  // 투두리스트 생성 성공 모달 상태
  const [showTodoListSuccessModal, setShowTodoListSuccessModal] = useState(false);

  // 시간대 설정 필요 모달 상태
  const [showTimeRequiredModal, setShowTimeRequiredModal] = useState(false);

  // 오늘 이미 투두리스트 생성 모달 상태
  const [showAlreadyCreatedModal, setShowAlreadyCreatedModal] = useState(false);

  // 미션별 시간 범위 설정 (미션 ID -> { start: "HH:mm", end: "HH:mm" })
  const [missionTimeRanges, setMissionTimeRanges] = useState<Record<number, { start: string; end: string }>>({});

  /**
   * 12시간 형식을 24시간 형식으로 변환
   */
  const convertTo24Hour = useCallback((period: TimePeriod, hour: number, minute: number): string => {
    let hours24 = hour;
    if (period === 'PM' && hour !== 12) hours24 = hour + 12;
    else if (period === 'AM' && hour === 12) hours24 = 0;
    return `${String(hours24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }, []);

  // 모든 미션이 하루종일로 설정되어 있는지 확인
  useEffect(() => {
    const defaultStart = convertTo24Hour(DEFAULT_START_TIME.period, DEFAULT_START_TIME.hour, DEFAULT_START_TIME.minute);
    const defaultEnd = convertTo24Hour(DEFAULT_END_TIME.period, DEFAULT_END_TIME.hour, DEFAULT_END_TIME.minute);
    
    const allMissionsList = [
      ...randomMissions,
      ...customMissions.filter(m => selectedCustomMissions.includes(m.id)),
    ];
    
    if (allMissionsList.length === 0) {
      setIsAllDay(false);
      return;
    }
    
    const allHaveAllDayTime = allMissionsList.every(mission => {
      const range = missionTimeRanges[mission.id];
      return range && range.start === defaultStart && range.end === defaultEnd;
    });
    
    setIsAllDay(allHaveAllDayTime);
  }, [missionTimeRanges, randomMissions, customMissions, selectedCustomMissions, convertTo24Hour]);

  // 시간 설정 모달 상태
  const [showTimePickerModal, setShowTimePickerModal] = useState(false);
  const [selectedMissionForTime, setSelectedMissionForTime] = useState<number | null>(null);

  // 시작 시간 설정 상태
  const [startPeriod, setStartPeriod] = useState<TimePeriod>(DEFAULT_START_TIME.period);
  const [startHour, setStartHour] = useState(DEFAULT_START_TIME.hour);
  const [startMinute, setStartMinute] = useState(DEFAULT_START_TIME.minute);

  // 종료 시간 설정 상태
  const [endPeriod, setEndPeriod] = useState<TimePeriod>(DEFAULT_END_TIME.period);
  const [endHour, setEndHour] = useState(DEFAULT_END_TIME.hour);
  const [endMinute, setEndMinute] = useState(DEFAULT_END_TIME.minute);

  // 시간 설정 모달 단계: 'start'(시작 시간) -> 'end'(종료 시간)
  const [timePickerModalStep, setTimePickerModalStep] = useState<'start' | 'end'>('start');

  // 리롤 중인 미션 인덱스 (로딩 상태 추적)
  const [rerollingMissionIndex, setRerollingMissionIndex] = useState<number | null>(null);

  /**
   * 랜덤 미션 로드
   */
  const loadRandomMissions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await initTodoList();
      if (result.success && result.data) {
        setRandomMissions(result.data.randomMissions);
      } else {
        handleApiError(result, 'TodoListCreateScreen.loadRandomMissions');
      }
    } catch (error) {
      showError(error instanceof Error ? error : new Error('미션을 불러오는데 실패했습니다.'), 'TodoListCreateScreen.loadRandomMissions');
    } finally {
      setLoading(false);
    }
  }, [handleApiError, showError]);

  /**
   * 커스텀 미션 로드 (onlyMyMissions=true면 내가 만든 미션만, searchQuery로 검색)
   */
  const loadCustomMissions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getSelectableMissions(onlyMyMissions, searchQuery);
      if (result.success && result.data) {
        setCustomMissions(result.data);
      }
    } catch (error) {
      console.error('Failed to load custom missions:', error);
    } finally {
      setLoading(false);
    }
  }, [onlyMyMissions, searchQuery]);

  /**
   * route.params.activeStep이 변경되면 currentStep 업데이트
   */
  useEffect(() => {
    if (route?.params?.activeStep) {
      setCurrentStep(route.params.activeStep);
    }
  }, [route?.params?.activeStep]);

  /**
   * 화면이 포커스될 때마다 route.params.activeStep 확인 (navigate로 파라미터가 업데이트된 경우 대응)
   */
  useEffect(() => {
    if (route?.params?.activeStep === 'custom') {
      setCurrentStep('custom');
    }
  }, [route?.params?.activeStep]);

  /**
   * 단계 변경 시 데이터 로드 (커스텀 단계에서는 onlyMyMissions나 searchQuery 변경 시에도 재로드)
   */
  useEffect(() => {
    if (currentStep === 'random') {
      loadRandomMissions();
    } else if (currentStep === 'custom') {
      loadCustomMissions();
    }
  }, [currentStep, onlyMyMissions, searchQuery, loadRandomMissions, loadCustomMissions]);

  /**
   * 화면 포커스 시 커스텀 미션 목록 새로고침 및 Step 2로 설정 (CustomMissionCreateScreen에서 돌아올 때)
   */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // route.params.activeStep이 'custom'이면 Step 2로 설정
      if (route?.params?.activeStep === 'custom') {
        setCurrentStep('custom');
        loadCustomMissions();
      } else if (currentStep === 'custom') {
        loadCustomMissions();
      }
    });

    return unsubscribe;
  }, [navigation, route?.params?.activeStep, currentStep, loadCustomMissions]);

  /**
   * 커스텀 미션 선택/해제
   */
  const handleCustomMissionToggle = useCallback((missionId: number) => {
    setSelectedCustomMissions(prev => {
      if (prev.includes(missionId)) return prev.filter(id => id !== missionId);
      return [...prev, missionId];
    });
  }, []);

  /**
   * 미션 리롤
   */
  const handleRerollMission = useCallback(
    async (missionIndex: number) => {
      const currentMission = randomMissions[missionIndex];
      if (!currentMission) return;

      setRerollingMissionIndex(missionIndex);
      try {
        // 현재 선택된 모든 미션 ID를 제외 (중복 방지)
        const excludeMissionIds = randomMissions.map(m => m.id);

        const result = await rerollRandomMission(excludeMissionIds);
        if (result.success && result.data) {
          // 해당 인덱스의 미션만 교체
          const newMissions = [...randomMissions];
          newMissions[missionIndex] = result.data;
          setRandomMissions(newMissions);

          // 교체된 미션의 시간대 설정이 있다면 제거 (새 미션이므로)
          const oldMissionId = currentMission.id;
          setMissionTimeRanges(prev => {
            const updated = { ...prev };
            delete updated[oldMissionId];
            return updated;
          });
        } else {
          handleApiError(result, 'TodoListCreateScreen.handleRerollMission');
        }
      } catch (error) {
        showError(error instanceof Error ? error : new Error('미션을 교체하는데 실패했습니다.'), 'TodoListCreateScreen.handleRerollMission');
      } finally {
        setRerollingMissionIndex(null);
      }
    },
    [randomMissions, handleApiError, showError]
  );

  /**
   * 커스텀 미션 생성
   */
  const handleCreateMission = useCallback(async () => {
    if (!newMissionTitle.trim()) {
      showError('미션 제목을 입력해주세요.', 'TodoListCreateScreen.handleCreateMission');
      return;
    }
    if (!newMissionDescription.trim()) {
      showError('미션 설명을 입력해주세요.', 'TodoListCreateScreen.handleCreateMission');
      return;
    }

    setCreatingMission(true);
    try {
      const request: CreateMissionRequest = {
        title: newMissionTitle.trim(),
        description: newMissionDescription.trim(),
        category: 'DAILY_LIFE',
        verificationType: 'COMMUNITY',
        expReward: 50,
        badgeDurationDays: 7,
        durationDays: 3,
        isPublic: true,
        deadlineDays: 3,
      };

      const result = await createCustomMission(request);
      if (result.success && result.data) {
        setShowMissionSuccessModal(true);
        setNewMissionTitle('');
        setNewMissionDescription('');
        setShowCreateForm(false);
        loadCustomMissions();
        if (result.data?.id) {
          setSelectedCustomMissions(prev => [...prev, result.data!.id]);
        }
      } else {
        handleApiError(result, 'TodoListCreateScreen.handleCreateMission');
      }
    } catch (error) {
      showError(error instanceof Error ? error : new Error('미션 생성에 실패했습니다.'), 'TodoListCreateScreen.handleCreateMission');
    } finally {
      setCreatingMission(false);
    }
  }, [newMissionTitle, newMissionDescription, showError, handleApiError, loadCustomMissions]);

  /**
   * 투두리스트 생성
   */
  const handleCreate = useCallback(async () => {
    setCreating(true);
    try {
      // missionSchedules 형식 변환: missionId를 문자열 키로 사용
      const missionSchedules: Record<string, { startTime: string; endTime: string }> = {};
      Object.entries(missionTimeRanges).forEach(([missionId, range]) => {
        missionSchedules[missionId] = {
          startTime: range.start,
          endTime: range.end,
        };
      });

      const request: TodoListCreateRequest = {
        title: title || `${new Date().toLocaleDateString('ko-KR')} 투두리스트`,
        description: description || undefined,
        randomMissionIds: randomMissions.map(m => m.id),
        customMissionIds: selectedCustomMissions,
        missionSchedules: Object.keys(missionSchedules).length > 0 ? missionSchedules : undefined,
      };

      const result = await createTodoList(request);
      console.log('[TodoListCreateScreen] createTodoList 응답:', JSON.stringify(result, null, 2));
      if (result.success && result.data) {
        console.log('[TodoListCreateScreen] 투두리스트 생성 성공:', result.data);
        setShowTodoListSuccessModal(true);
      } else {
        console.error('[TodoListCreateScreen] 투두리스트 생성 실패:', result.error);
        // 오늘 이미 투두리스트를 생성한 경우
        if (result.error?.includes('이미') || result.error?.includes('오늘') || result.error?.includes('already') || result.error?.includes('canCreate')) {
          setShowAlreadyCreatedModal(true);
        } else {
          handleApiError(result, 'TodoListCreateScreen.handleCreate');
        }
      }
    } catch (error) {
      showError(error instanceof Error ? error : new Error('투두리스트 생성에 실패했습니다.'), 'TodoListCreateScreen.handleCreate');
    } finally {
      setCreating(false);
    }
  }, [selectedCustomMissions, randomMissions, missionTimeRanges, title, description, showInfo, handleApiError, showError]);

  /**
   * 미션 시간 설정
   */
  const handleSetMissionTime = useCallback(
    (missionId: number) => {
      const existingRange = missionTimeRanges[missionId];
      if (existingRange) {
        const [startHours, startMinutes] = existingRange.start.split(':').map(Number);
        const [endHours, endMinutes] = existingRange.end.split(':').map(Number);

        setStartPeriod(startHours >= 12 ? DEFAULT_END_TIME.period : DEFAULT_START_TIME.period);
        setStartHour(startHours === 0 ? 12 : startHours > 12 ? startHours - 12 : startHours);
        setStartMinute(startMinutes);

        setEndPeriod(endHours >= 12 ? DEFAULT_END_TIME.period : DEFAULT_START_TIME.period);
        setEndHour(endHours === 0 ? 12 : endHours > 12 ? endHours - 12 : endHours);
        setEndMinute(endMinutes);
      } else {
        setStartPeriod(DEFAULT_START_TIME.period);
        setStartHour(DEFAULT_START_TIME.hour);
        setStartMinute(DEFAULT_START_TIME.minute);
        setEndPeriod(DEFAULT_END_TIME.period);
        setEndHour(DEFAULT_END_TIME.hour);
        setEndMinute(DEFAULT_END_TIME.minute);
      }

      setSelectedMissionForTime(missionId);
      setTimePickerModalStep('start');
      setShowTimePickerModal(true);
    },
    [missionTimeRanges]
  );

  /**
   * 시간 설정 모달 닫기 (취소/오버레이)
   */
  const handleCloseTimePickerModal = useCallback(() => {
    setShowTimePickerModal(false);
    setSelectedMissionForTime(null);
    setTimePickerModalStep('start');
  }, []);

  /**
   * 시간 설정 모달: 다음(시작 -> 종료)
   */
  const handleTimePickerNext = useCallback(() => {
    setTimePickerModalStep('end');
  }, []);

  /**
   * 시간 설정 모달: 이전(종료 -> 시작)
   */
  const handleTimePickerPrev = useCallback(() => {
    setTimePickerModalStep('start');
  }, []);

  /**
   * 시간 저장
   */
  const handleSaveTime = useCallback(() => {
    if (selectedMissionForTime) {
      const start = convertTo24Hour(startPeriod, startHour, startMinute);
      const end = convertTo24Hour(endPeriod, endHour, endMinute);
      setMissionTimeRanges(prev => ({ ...prev, [selectedMissionForTime]: { start, end } }));
    }
    handleCloseTimePickerModal();
  }, [selectedMissionForTime, startPeriod, startHour, startMinute, endPeriod, endHour, endMinute, convertTo24Hour, handleCloseTimePickerModal]);

  /**
   * 시간 제거
   */
  const handleRemoveTime = useCallback((missionId: number) => {
    setMissionTimeRanges(prev => {
      const next = { ...prev };
      delete next[missionId];
      return next;
    });
  }, []);

  /**
   * 모든 미션에 기본 시간대 일괄 설정 (00:00 ~ 23:59, 하루 종일)
   */
  const handleSetDefaultTimeForAll = useCallback(() => {
    const defaultStart = convertTo24Hour(DEFAULT_START_TIME.period, DEFAULT_START_TIME.hour, DEFAULT_START_TIME.minute);
    const defaultEnd = convertTo24Hour(DEFAULT_END_TIME.period, DEFAULT_END_TIME.hour, DEFAULT_END_TIME.minute);
    
    const newRanges: Record<number, { start: string; end: string }> = {};
    // randomMissions의 모든 미션에 시간 설정
    randomMissions.forEach(mission => {
      newRanges[mission.id] = { start: defaultStart, end: defaultEnd };
    });
    // 선택된 커스텀 미션에도 시간 설정
    const selectedMissions = customMissions.filter(m => selectedCustomMissions.includes(m.id));
    selectedMissions.forEach(mission => {
      newRanges[mission.id] = { start: defaultStart, end: defaultEnd };
    });
    
    // 기존 시간대를 완전히 대체 (merge가 아닌 replace)
    setMissionTimeRanges(newRanges);
    setIsAllDay(true);
  }, [randomMissions, customMissions, selectedCustomMissions, convertTo24Hour]);

  /**
   * 하루종일 체크박스 토글
   */
  const handleToggleAllDay = useCallback(() => {
    if (isAllDay) {
      // 체크 해제: 모든 시간대 제거
      setMissionTimeRanges({});
      setIsAllDay(false);
    } else {
      // 체크: 하루종일 설정
      handleSetDefaultTimeForAll();
    }
  }, [isAllDay, handleSetDefaultTimeForAll]);


  /**
   * 모든 미션 목록 (공식 + 커스텀)
   */
  const allMissions = useMemo(() => {
    const selectedMissions = customMissions.filter(m => selectedCustomMissions.includes(m.id));
    return [
      ...randomMissions.map(m => ({ ...m, type: 'official' as const })),
      ...selectedMissions.map(m => ({ ...m, type: 'custom' as const })),
    ];
  }, [randomMissions, customMissions, selectedCustomMissions]);

  /**
   * 시간이 설정된 미션 목록 (시간순 정렬)
   */
  const missionsWithTime = useMemo(() => {
    return allMissions
      .filter(m => missionTimeRanges[m.id])
      .map(m => {
        const range = missionTimeRanges[m.id];
        const [startHours, startMinutes] = range.start.split(':').map(Number);
        return { ...m, range, timeValue: startHours * 60 + startMinutes };
      })
      .sort((a, b) => a.timeValue - b.timeValue);
  }, [allMissions, missionTimeRanges]);

  /**
   * 투두리스트 생성 성공 모달 닫기 및 네비게이션
   */
  const handleTodoListSuccessClose = useCallback(() => {
    setShowTodoListSuccessModal(false);
    navigation.navigate('TodoList' as any, { refresh: true });
  }, [navigation]);

  return {
    // Data
    randomMissions,
    customMissions,
    allMissions,
    missionsWithTime,
    // State (오류/알림 AlertModal)
    showAlert,
    alertTitle,
    alertMessage,
    handleCloseAlert,
    // State
    currentStep,
    selectedCustomMissions,
    onlyMyMissions,
    setOnlyMyMissions,
    searchQuery,
    setSearchQuery,
    showFilterModal,
    setShowFilterModal,
    title,
    description,
    loading,
    creating,
    showCreateForm,
    newMissionTitle,
    newMissionDescription,
    creatingMission,
    showMissionSuccessModal,
    showTodoListSuccessModal,
    showTimeRequiredModal,
    showAlreadyCreatedModal,
    missionTimeRanges,
    showTimePickerModal,
    selectedMissionForTime,
    startPeriod,
    startHour,
    startMinute,
    endPeriod,
    endHour,
    endMinute,
    timePickerModalStep,
    rerollingMissionIndex,
    // Setters
    setCurrentStep,
    setTitle,
    setDescription,
    setShowCreateForm,
    setNewMissionTitle,
    setNewMissionDescription,
    setShowMissionSuccessModal,
    setShowTimeRequiredModal,
    setShowAlreadyCreatedModal,
    setShowTimePickerModal,
    setSelectedMissionForTime,
    setStartPeriod,
    setStartHour,
    setStartMinute,
    setEndPeriod,
    setEndHour,
    setEndMinute,
    // Handlers
    handleCustomMissionToggle,
    handleRerollMission,
    handleCreateMission,
    handleCreate,
    handleSetMissionTime,
    handleSaveTime,
    handleRemoveTime,
    handleSetDefaultTimeForAll,
    isAllDay,
    handleToggleAllDay,
    handleTodoListSuccessClose,
    handleTimePickerNext,
    handleTimePickerPrev,
    handleCloseTimePickerModal,
  };
};
