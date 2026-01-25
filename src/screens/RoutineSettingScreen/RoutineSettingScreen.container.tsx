/**
 * RoutineSettingScreen 비즈니스 로직
 * 루틴 설정 관리: 시간, 장소, 목표 설정
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert, Platform } from 'react-native';
import {
  UserRoutine,
  RoutineType,
  InputType,
  UserRoutineRequest,
  getActiveRoutines,
  saveRoutine,
  deleteRoutine,
  formatTimeDisplay,
  formatTimeForApi,
} from '../../api/routineApi';

interface RoutineConfig {
  type: RoutineType;
  name: string;
  icon: string;
  description: string;
  inputType: InputType;
  placeholder?: string;
  category: 'time' | 'place' | 'goal';
}

// 루틴 카테고리별 설정
const ROUTINE_CONFIGS: RoutineConfig[] = [
  // 시간 관련
  {
    type: 'WAKE_UP_TIME',
    name: '기상 시간',
    icon: '⏰',
    description: '기상 미션용 시간대 설정',
    inputType: 'time',
    category: 'time',
  },
  {
    type: 'STUDY_TIME',
    name: '공부 시간',
    icon: '📖',
    description: '공부 미션용 시간대 설정',
    inputType: 'time_range',
    category: 'time',
  },
  // 장소 관련
  {
    type: 'GYM_LOCATION',
    name: '헬스장',
    icon: '🏋️',
    description: '헬스장 방문 미션용',
    inputType: 'place',
    placeholder: '헬스장 이름을 입력하세요',
    category: 'place',
  },
  {
    type: 'LIBRARY_LOCATION',
    name: '도서관',
    icon: '📚',
    description: '도서관 방문 미션용',
    inputType: 'place',
    placeholder: '도서관 이름을 입력하세요',
    category: 'place',
  },
  {
    type: 'CUSTOM_LOCATION',
    name: '기타 장소',
    icon: '🗺️',
    description: '기타 장소 방문 미션용',
    inputType: 'place',
    placeholder: '장소 이름을 입력하세요',
    category: 'place',
  },
  // 목표 관련
  {
    type: 'WEEKLY_RESOLUTION',
    name: '이번 주 다짐',
    icon: '📝',
    description: '이번 주 목표',
    inputType: 'text',
    placeholder: '이번 주 다짐을 입력하세요',
    category: 'goal',
  },
  {
    type: 'MONTHLY_RESOLUTION',
    name: '이번 달 다짐',
    icon: '🎯',
    description: '이번 달 목표',
    inputType: 'text',
    placeholder: '이번 달 다짐을 입력하세요',
    category: 'goal',
  },
];

interface RoutineSettingScreenContainerProps {
  navigation: any;
}

export const useRoutineSettingScreenContainer = ({
  navigation,
}: RoutineSettingScreenContainerProps) => {
  const [routines, setRoutines] = useState<UserRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<RoutineType | null>(null);

  // 편집 상태
  const [editingType, setEditingType] = useState<RoutineType | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editValue, setEditValue] = useState<string>('');
  const [editTimeStart, setEditTimeStart] = useState<Date>(new Date());
  const [editTimeEnd, setEditTimeEnd] = useState<Date>(new Date());
  const [showTimeStartPicker, setShowTimeStartPicker] = useState(false);
  const [showTimeEndPicker, setShowTimeEndPicker] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  // 장소 좌표
  const [editLatitude, setEditLatitude] = useState<number | null>(null);
  const [editLongitude, setEditLongitude] = useState<number | null>(null);

  // 카테고리 탭
  const [activeCategory, setActiveCategory] = useState<'time' | 'place' | 'goal'>('time');

  /**
   * 데이터 로드
   */
  const loadRoutines = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getActiveRoutines();
      setRoutines(data);
    } catch (error) {
      console.error('Failed to load routines:', error);
      Alert.alert('오류', '루틴 설정을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoutines();
  }, [loadRoutines]);

  /**
   * 특정 타입의 현재 루틴 가져오기
   */
  const getRoutineByType = useCallback(
    (type: RoutineType): UserRoutine | undefined => {
      return routines.find(r => r.routineType === type);
    },
    [routines]
  );

  /**
   * 루틴 값 표시
   */
  const getDisplayValue = useCallback(
    (routine: UserRoutine | undefined, config: RoutineConfig): string => {
      if (!routine) return '설정하기';

      switch (config.inputType) {
        case 'time':
          return routine.valueTimeStart
            ? formatTimeDisplay(routine.valueTimeStart)
            : routine.valueTime
            ? formatTimeDisplay(routine.valueTime)
            : '설정하기';
        case 'time_range':
          if (routine.valueTimeStart && routine.valueTimeEnd) {
            return `${formatTimeDisplay(routine.valueTimeStart)} ~ ${formatTimeDisplay(routine.valueTimeEnd)}`;
          }
          return '설정하기';
        case 'place':
          return routine.title || routine.valueText || '설정하기';
        case 'text':
          return routine.valueText || '설정하기';
        default:
          return '설정하기';
      }
    },
    []
  );

  /**
   * 편집 시작
   */
  const startEditing = useCallback(
    (config: RoutineConfig) => {
      const routine = getRoutineByType(config.type);
      setEditingType(config.type);

      // 공통
      setEditTitle(routine?.title || '');
      setEditDescription(routine?.description || config.description);
      setNotificationEnabled(routine?.notificationEnabled || false);

      if (config.inputType === 'time') {
        // 시간 타입
        if (routine?.valueTimeStart) {
          const [hours, minutes] = routine.valueTimeStart.split(':');
          const date = new Date();
          date.setHours(parseInt(hours, 10));
          date.setMinutes(parseInt(minutes, 10));
          setEditTimeStart(date);
        } else if (routine?.valueTime) {
          const [hours, minutes] = routine.valueTime.split(':');
          const date = new Date();
          date.setHours(parseInt(hours, 10));
          date.setMinutes(parseInt(minutes, 10));
          setEditTimeStart(date);
        } else {
          const defaultTime = new Date();
          defaultTime.setHours(7, 0, 0, 0);
          setEditTimeStart(defaultTime);
        }
        setShowTimeStartPicker(true);
      } else if (config.inputType === 'time_range') {
        // 시간 범위 타입
        if (routine?.valueTimeStart) {
          const [hours, minutes] = routine.valueTimeStart.split(':');
          const date = new Date();
          date.setHours(parseInt(hours, 10));
          date.setMinutes(parseInt(minutes, 10));
          setEditTimeStart(date);
        } else {
          const defaultStart = new Date();
          defaultStart.setHours(9, 0, 0, 0);
          setEditTimeStart(defaultStart);
        }
        if (routine?.valueTimeEnd) {
          const [hours, minutes] = routine.valueTimeEnd.split(':');
          const date = new Date();
          date.setHours(parseInt(hours, 10));
          date.setMinutes(parseInt(minutes, 10));
          setEditTimeEnd(date);
        } else {
          const defaultEnd = new Date();
          defaultEnd.setHours(18, 0, 0, 0);
          setEditTimeEnd(defaultEnd);
        }
      } else if (config.inputType === 'place') {
        // 장소 타입
        setEditValue(routine?.valueText || '');
        setEditLatitude(routine?.valueLatitude || null);
        setEditLongitude(routine?.valueLongitude || null);
      } else {
        // 텍스트 타입
        setEditValue(routine?.valueText || '');
      }
    },
    [getRoutineByType]
  );

  /**
   * 편집 취소
   */
  const cancelEditing = useCallback(() => {
    setEditingType(null);
    setEditTitle('');
    setEditDescription('');
    setEditValue('');
    setShowTimeStartPicker(false);
    setShowTimeEndPicker(false);
    setEditLatitude(null);
    setEditLongitude(null);
  }, []);

  /**
   * 루틴 저장
   */
  const handleSave = useCallback(
    async (config: RoutineConfig) => {
      try {
        setSaving(config.type);

        const request: UserRoutineRequest = {
          routineType: config.type,
          title: editTitle || config.name,
          description: editDescription || config.description,
          notificationEnabled,
        };

        if (config.inputType === 'time') {
          const hours = editTimeStart.getHours().toString().padStart(2, '0');
          const minutes = editTimeStart.getMinutes().toString().padStart(2, '0');
          request.valueTimeStart = formatTimeForApi(`${hours}:${minutes}`);
          request.valueTime = request.valueTimeStart; // 기존 호환
          if (notificationEnabled) {
            request.notificationTime = request.valueTimeStart;
          }
        } else if (config.inputType === 'time_range') {
          const startHours = editTimeStart.getHours().toString().padStart(2, '0');
          const startMinutes = editTimeStart.getMinutes().toString().padStart(2, '0');
          const endHours = editTimeEnd.getHours().toString().padStart(2, '0');
          const endMinutes = editTimeEnd.getMinutes().toString().padStart(2, '0');
          request.valueTimeStart = formatTimeForApi(`${startHours}:${startMinutes}`);
          request.valueTimeEnd = formatTimeForApi(`${endHours}:${endMinutes}`);
          if (notificationEnabled) {
            request.notificationTime = request.valueTimeStart;
          }
        } else if (config.inputType === 'place') {
          request.valueText = editValue;
          if (editLatitude && editLongitude) {
            request.valueLatitude = editLatitude;
            request.valueLongitude = editLongitude;
          }
        } else {
          request.valueText = editValue;
        }

        await saveRoutine(request);
        await loadRoutines();
        cancelEditing();
        Alert.alert('성공', '루틴이 저장되었습니다.');
      } catch (error) {
        console.error('Failed to save routine:', error);
        Alert.alert('오류', '루틴 저장에 실패했습니다.');
      } finally {
        setSaving(null);
      }
    },
    [
      editTitle,
      editDescription,
      notificationEnabled,
      editTimeStart,
      editTimeEnd,
      editValue,
      editLatitude,
      editLongitude,
      loadRoutines,
      cancelEditing,
    ]
  );

  /**
   * 루틴 삭제
   */
  const handleDelete = useCallback(
    async (routineId: number, routineName: string) => {
      Alert.alert('삭제 확인', `"${routineName}" 설정을 삭제하시겠습니까?`, [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRoutine(routineId);
              await loadRoutines();
              Alert.alert('성공', '루틴이 삭제되었습니다.');
            } catch (error) {
              console.error('Failed to delete routine:', error);
              Alert.alert('오류', '루틴 삭제에 실패했습니다.');
            }
          },
        },
      ]);
    },
    [loadRoutines]
  );

  /**
   * 시간 선택 처리
   */
  const handleTimeStartChange = useCallback((_event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimeStartPicker(false);
    }
    if (selectedDate) {
      setEditTimeStart(selectedDate);
    }
  }, []);

  const handleTimeEndChange = useCallback((_event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimeEndPicker(false);
    }
    if (selectedDate) {
      setEditTimeEnd(selectedDate);
    }
  }, []);

  /**
   * 장소 검색
   */
  const handleSearchLocation = useCallback(() => {
    Alert.alert(
      '장소 검색',
      '맵 API 연동이 필요합니다.\n\n추천 옵션:\n1. Google Maps API\n2. Kakao Maps API\n3. Naver Maps API\n\n현재는 장소명만 저장됩니다.',
      [{ text: '확인' }]
    );
  }, []);

  /**
   * 히스토리 보기
   */
  const handleViewHistory = useCallback(
    (config: RoutineConfig) => {
      navigation.navigate('RoutineHistory', { routineType: config.type, routineName: config.name });
    },
    [navigation]
  );

  /**
   * 카테고리 변경
   */
  const handleCategoryChange = useCallback((key: string) => {
    setActiveCategory(key as 'time' | 'place' | 'goal');
  }, []);

  /**
   * 카테고리별 필터링된 루틴
   */
  const filteredConfigs = useMemo(
    () => ROUTINE_CONFIGS.filter(c => c.category === activeCategory),
    [activeCategory]
  );

  return {
    routines,
    loading,
    saving,
    editingType,
    editTitle,
    editDescription,
    editValue,
    editTimeStart,
    editTimeEnd,
    showTimeStartPicker,
    showTimeEndPicker,
    notificationEnabled,
    editLatitude,
    editLongitude,
    activeCategory,
    filteredConfigs,
    ROUTINE_CONFIGS,
    setEditTitle,
    setEditDescription,
    setEditValue,
    setNotificationEnabled,
    setShowTimeStartPicker,
    setShowTimeEndPicker,
    getRoutineByType,
    getDisplayValue,
    startEditing,
    cancelEditing,
    handleSave,
    handleDelete,
    handleTimeStartChange,
    handleTimeEndChange,
    handleSearchLocation,
    handleViewHistory,
    handleCategoryChange,
  };
};
