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
import { Step, TodoListCreateScreenProps, TimePeriod, DropdownType } from '../../types/screens/todolist';
import { DEFAULT_START_TIME, DEFAULT_END_TIME, TIME_PERIODS } from '../../constants/screens/todolist';

export const useTodoListCreateScreenContainer = ({ navigation }: TodoListCreateScreenProps) => {
  const { showError, showSuccess, showInfo, handleApiError } = useErrorHandler();

  const [currentStep, setCurrentStep] = useState<Step>('intro');
  const [randomMissions, setRandomMissions] = useState<MissionSimple[]>([]);
  const [customMissions, setCustomMissions] = useState<MissionSimple[]>([]);
  const [selectedCustomMissions, setSelectedCustomMissions] = useState<number[]>([]);
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

  // 드롭다운 열림 상태
  const [openDropdown, setOpenDropdown] = useState<DropdownType>({ type: null });

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
   * 커스텀 미션 로드
   */
  const loadCustomMissions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getSelectableMissions();
      if (result.success && result.data) {
        setCustomMissions(result.data);
      }
    } catch (error) {
      console.error('Failed to load custom missions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 단계 변경 시 데이터 로드
   */
  useEffect(() => {
    if (currentStep === 'random') {
      loadRandomMissions();
    } else if (currentStep === 'custom') {
      loadCustomMissions();
    }
  }, [currentStep, loadRandomMissions, loadCustomMissions]);

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
    if (selectedCustomMissions.length === 0) {
      showInfo('최소 1개 이상의 미션을 자유롭게 추가해주세요.', '알림');
      return;
    }

    // 모든 미션이 시간대 설정되었는지 확인
    const allMissionIds = [...randomMissions.map(m => m.id), ...selectedCustomMissions];
    const missionsWithoutTime = allMissionIds.filter(missionId => !missionTimeRanges[missionId]);

    if (missionsWithoutTime.length > 0) {
      setShowTimeRequiredModal(true);
      return;
    }

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
   * 12시간 형식을 24시간 형식으로 변환
   */
  const convertTo24Hour = useCallback((period: TimePeriod, hour: number, minute: number): string => {
    let hours24 = hour;
    if (period === 'PM' && hour !== 12) hours24 = hour + 12;
    else if (period === 'AM' && hour === 12) hours24 = 0;
    return `${String(hours24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }, []);

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
      setShowTimePickerModal(true);
    },
    [missionTimeRanges]
  );

  /**
   * 시간 저장
   */
  const handleSaveTime = useCallback(() => {
    if (selectedMissionForTime) {
      const start = convertTo24Hour(startPeriod, startHour, startMinute);
      const end = convertTo24Hour(endPeriod, endHour, endMinute);
      setMissionTimeRanges(prev => ({ ...prev, [selectedMissionForTime]: { start, end } }));
    }
    setShowTimePickerModal(false);
    setSelectedMissionForTime(null);
    setOpenDropdown({ type: null });
  }, [selectedMissionForTime, startPeriod, startHour, startMinute, endPeriod, endHour, endMinute, convertTo24Hour]);

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
    navigation.navigate(SCREEN_NAMES.TODO_LIST, { refresh: true });
  }, [navigation]);

  /**
   * 드롭다운 열림 상태 확인
   */
  const isOpen = useCallback((t: any) => openDropdown.type === t, [openDropdown]);

  return {
    // Data
    randomMissions,
    customMissions,
    allMissions,
    missionsWithTime,
    // State
    currentStep,
    selectedCustomMissions,
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
    openDropdown,
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
    setOpenDropdown,
    // Handlers
    handleCustomMissionToggle,
    handleRerollMission,
    handleCreateMission,
    handleCreate,
    handleSetMissionTime,
    handleSaveTime,
    handleRemoveTime,
    handleTodoListSuccessClose,
    isOpen,
  };
};
