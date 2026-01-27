/**
 * CustomMissionCreateScreen 비즈니스 로직
 * 커스텀 미션 생성/수정 화면: 미션 생성, 수정, 폼 관리
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert, Platform, Dimensions } from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { useMission } from '../../hooks/useMission';
import { WorryType } from '../../api/userApi';
import { updateCustomMission } from '../../api/missionApi';
import { ScreenNames } from '../../types';
import { spacing } from '../../utils/designTokens';

interface CustomMissionCreateScreenContainerProps {
  navigation: NavigationProp<RootStackParamList>;
  route?: RouteProp<RootStackParamList, 'CustomMissionCreate'>;
}

// 고민 종류 옵션
export const WORRY_TYPE_OPTIONS: { id: WorryType; name: string; emoji: string }[] = [
  { id: 'RE_EMPLOYMENT', name: '재취업', emoji: '💼' },
  { id: 'JOB_PREPARATION', name: '취업준비', emoji: '📝' },
  { id: 'ENTRANCE_EXAM', name: '입시', emoji: '📚' },
  { id: 'ADVANCEMENT', name: '진학', emoji: '🎓' },
  { id: 'RETURN_TO_SCHOOL', name: '복학', emoji: '🏫' },
  { id: 'RELATIONSHIP', name: '연애', emoji: '💕' },
  { id: 'SELF_MANAGEMENT', name: '자기관리', emoji: '🧘' },
];

// 미션 카테고리 옵션
export type MissionCategoryOption = 'DAILY_LIFE' | 'GROWTH' | 'EXERCISE' | 'STUDY' | 'HEALTH' | 'RELATIONSHIP';
export const MISSION_CATEGORY_OPTIONS: { id: MissionCategoryOption; name: string; emoji: string }[] = [
  { id: 'DAILY_LIFE', name: '일상', emoji: '🏠' },
  { id: 'GROWTH', name: '성장', emoji: '🌱' },
  { id: 'EXERCISE', name: '운동', emoji: '🏃' },
  { id: 'STUDY', name: '학습', emoji: '📖' },
  { id: 'HEALTH', name: '건강', emoji: '💪' },
  { id: 'RELATIONSHIP', name: '관계', emoji: '🤝' },
];

// 인증방식 옵션
export type VerificationTypeOption = 'COMMUNITY' | 'GPS' | 'TIME';
export const VERIFICATION_TYPE_OPTIONS: {
  id: VerificationTypeOption;
  name: string;
  emoji: string;
  description: string;
}[] = [
  { id: 'COMMUNITY', name: '커뮤니티', emoji: '👥', description: '다른 사용자들의 인증' },
  { id: 'GPS', name: 'GPS', emoji: '📍', description: '위치 기반 인증' },
  { id: 'TIME', name: '시간', emoji: '⏱️', description: '시간 기반 인증' },
];

// 챌린지 기간 옵션
export const CHALLENGE_DAYS_OPTIONS = [
  { id: 1, name: '1일', emoji: '1️⃣' },
  { id: 7, name: '7일', emoji: '7️⃣' },
  { id: 14, name: '14일', emoji: '🔢' },
  { id: 30, name: '30일', emoji: '📅' },
];

// 완료 기한 옵션
export const DEADLINE_DAYS_OPTIONS = [
  { id: 1, name: '1일', emoji: '⚡' },
  { id: 3, name: '3일', emoji: '📋' },
  { id: 7, name: '7일', emoji: '🗓️' },
];

export const useCustomMissionCreateScreenContainer = ({
  navigation,
  route,
}: CustomMissionCreateScreenContainerProps) => {
  const { createCustomMission } = useMission();
  const generatedMission = route?.params?.generatedMission;
  const screenWidth = Dimensions.get('window').width;
  // 화면 좌우 패딩(24*2=48) + Card 내부 패딩(spacing[4]*2=32) + 버튼 간 간격(spacing[2]*2=16)을 뺀 후 3등분
  const buttonWidth = (screenWidth - 48 - spacing[4] * 2 - spacing[2] * 2) / 3;

  // 수정 모드 관련
  const isEditMode = route?.params?.mode === 'edit';
  const editMissionId = route?.params?.missionId;
  const missionData = route?.params?.missionData;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🎯');
  const [loading, setLoading] = useState(false);
  const [worryType, setWorryType] = useState<WorryType | null>(null);
  // 새로운 필드들
  const [category, setCategory] = useState<MissionCategoryOption>('DAILY_LIFE');
  const [verificationType, setVerificationType] = useState<VerificationTypeOption>('COMMUNITY');
  const [isChallenge, setIsChallenge] = useState(false); // 챌린지 미션 여부
  const [challengeDays, setChallengeDays] = useState(7);
  const [deadlineDays, setDeadlineDays] = useState(3);

  // 시간 미션용 상태
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  /**
   * 수정 모드일 때 기존 데이터로 초기화
   */
  useEffect(() => {
    if (isEditMode && missionData) {
      setTitle(missionData.title || '');
      setDescription(missionData.description || '');
      setCategory((missionData.category as MissionCategoryOption) || 'DAILY_LIFE');
      setVerificationType((missionData.verificationType as VerificationTypeOption) || 'COMMUNITY');
      setIsChallenge(missionData.isChallenge || false);
      setChallengeDays(missionData.challengeDays || 7);
      setDeadlineDays(missionData.deadlineDays || 3);
      setWorryType((missionData.worryType as WorryType) || null);
    }
  }, [isEditMode, missionData]);

  /**
   * AI 생성 미션이 있으면 초기값 설정
   */
  useEffect(() => {
    if (generatedMission && !isEditMode) {
      setTitle(generatedMission.title || '');
      setDescription(generatedMission.description || '');
      setSelectedEmoji(generatedMission.emoji || '🎯');
    }
  }, [generatedMission, isEditMode]);

  /**
   * 시간 포맷팅 (HH:mm)
   */
  const formatTime = useCallback((date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }, []);

  /**
   * 시간 선택 핸들러
   */
  const handleStartTimeChange = useCallback((_event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartTimePicker(false);
    }
    if (selectedDate) {
      setStartTime(selectedDate);
    }
  }, []);

  const handleEndTimeChange = useCallback((_event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndTimePicker(false);
    }
    if (selectedDate) {
      setEndTime(selectedDate);
    }
  }, []);

  /**
   * 미션 생성/수정 제출
   */
  const handleSubmitMission = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert('오류', '미션 제목을 입력해주세요.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('오류', '미션 설명을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);

      // 백엔드 API 형식에 맞게 데이터 구성
      const missionPayload = {
        title: title.trim(),
        description: description.trim(),
        emoji: selectedEmoji,
        experience: 0, // 커스텀 미션은 경험치 지급 없음
        // 백엔드 필수 필드들
        durationDays: isChallenge ? challengeDays : deadlineDays, // 미션 기간
        isPublic: true, // 기본값: 공개
        verificationType: verificationType,
        badgeDurationDays: isChallenge ? challengeDays : 7, // 뱃지 유효 기간
        worryType: worryType,
        // 새로운 필드들
        category: category, // 미션 카테고리
        isChallenge: isChallenge, // 챌린지 미션 여부
        challengeDays: isChallenge ? challengeDays : undefined, // 챌린지 미션일 때만
        deadlineDays: isChallenge ? undefined : deadlineDays, // 일반 미션일 때만
        // 시간 미션용 필드
        startTime: verificationType === 'TIME' ? formatTime(startTime) : undefined,
        endTime: verificationType === 'TIME' ? formatTime(endTime) : undefined,
      };

      let result;
      if (isEditMode && editMissionId) {
        // 수정 모드: updateCustomMission 호출
        result = await updateCustomMission(editMissionId, missionPayload);
      } else {
        // 생성 모드: createCustomMission 호출
        result = await createCustomMission(missionPayload);
      }

      if (result.success) {
        Alert.alert(
          '성공!',
          isEditMode ? '미션이 수정되었습니다!' : '나만의 미션이 생성되었습니다!',
          [
            {
              text: '확인',
              onPress: () => (navigation as any).navigate(ScreenNames.MISSION),
            },
          ]
        );
      } else {
        Alert.alert(
          '오류',
          result.error || (isEditMode ? '미션 수정에 실패했습니다.' : '미션 생성에 실패했습니다.')
        );
      }
    } catch (error) {
      Alert.alert('오류', isEditMode ? '미션 수정 중 오류가 발생했습니다.' : '미션 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [
    title,
    description,
    selectedEmoji,
    isChallenge,
    challengeDays,
    deadlineDays,
    verificationType,
    worryType,
    category,
    startTime,
    endTime,
    formatTime,
    isEditMode,
    editMissionId,
    createCustomMission,
    navigation,
  ]);

  /**
   * 취소 버튼 핸들러
   */
  const handleCancel = useCallback(() => {
    (navigation as any).navigate(ScreenNames.MISSION);
  }, [navigation]);

  return {
    // Constants
    WORRY_TYPE_OPTIONS,
    MISSION_CATEGORY_OPTIONS,
    VERIFICATION_TYPE_OPTIONS,
    CHALLENGE_DAYS_OPTIONS,
    DEADLINE_DAYS_OPTIONS,
    buttonWidth,
    // Route params
    isEditMode,
    // State
    title,
    description,
    selectedEmoji,
    loading,
    worryType,
    category,
    verificationType,
    isChallenge,
    challengeDays,
    deadlineDays,
    startTime,
    endTime,
    showStartTimePicker,
    showEndTimePicker,
    // Setters
    setTitle,
    setDescription,
    setSelectedEmoji,
    setWorryType,
    setCategory,
    setVerificationType,
    setIsChallenge,
    setChallengeDays,
    setDeadlineDays,
    setStartTime,
    setEndTime,
    setShowStartTimePicker,
    setShowEndTimePicker,
    // Handlers
    handleSubmitMission,
    handleCancel,
    handleStartTimeChange,
    handleEndTimeChange,
    formatTime,
  };
};
