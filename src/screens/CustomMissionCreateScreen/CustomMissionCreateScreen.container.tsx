/**
 * CustomMissionCreateScreen 비즈니스 로직
 * 커스텀 미션 생성/수정 화면: 미션 생성, 수정, 폼 관리
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert, Dimensions } from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { updateCustomMission, createCustomMission as createCustomMissionApi, CreateMissionRequest, MissionCategory } from '../../api/missionApi';
import { ScreenNames } from '../../types';
import { spacing } from '../../utils/designTokens';
import { SCREEN_NAMES } from '../../utils/constants';

interface CustomMissionCreateScreenContainerProps {
  navigation: NavigationProp<RootStackParamList>;
  route?: RouteProp<RootStackParamList, 'CustomMissionCreate'>;
}

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
  const generatedMission = route?.params?.generatedMission;
  const returnScreen = route?.params?.returnScreen;
  const screenWidth = Dimensions.get('window').width;
  // 화면 좌우 패딩(24*2=48) + Card 내부 패딩(spacing[4]*2=32) + 버튼 간 간격(spacing[2]*2=16)을 뺀 후 3등분
  const buttonWidth = (screenWidth - 48 - spacing[4] * 2 - spacing[2] * 2) / 3;

  // 수정 모드 관련
  const isEditMode = route?.params?.mode === 'edit';
  const editMissionId = route?.params?.missionId;
  const missionData = route?.params?.missionData;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<MissionCategory | null>(null);

  /**
   * 수정 모드일 때 기존 데이터로 초기화
   */
  useEffect(() => {
    if (isEditMode && missionData) {
      setTitle(missionData.title || '');
      setDescription(missionData.description || '');
      setCategory((missionData.category as MissionCategory) || null);
    }
  }, [isEditMode, missionData]);

  /**
   * AI 생성 미션이 있으면 초기값 설정
   */
  useEffect(() => {
    if (generatedMission && !isEditMode) {
      setTitle(generatedMission.title || '');
      setDescription(generatedMission.description || '');
    }
  }, [generatedMission, isEditMode]);

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

      // 투두리스트와 동일하게 하드코딩된 값 사용
      const request: CreateMissionRequest = {
        title: title.trim(),
        description: description.trim(),
        category: (category || 'DAILY_LIFE') as MissionCategory, // 선택한 카테고리 또는 기본값
        verificationType: 'COMMUNITY' as const,
        expReward: 50,
        badgeDurationDays: 7,
        durationDays: 3,
        isPublic: true,
        deadlineDays: 3,
      };

      let result;
      if (isEditMode && editMissionId) {
        // 수정 모드: updateCustomMission 호출
        result = await updateCustomMission(editMissionId, request);
      } else {
        // 생성 모드: createCustomMission API 직접 호출 (투두리스트와 동일)
        result = await createCustomMissionApi(request);
      }

      if (result.success) {
        Alert.alert(
          '성공!',
          isEditMode ? '미션이 수정되었습니다!' : '나만의 미션이 생성되었습니다!',
          [
            {
              text: '확인',
              onPress: () => {
                if (returnScreen === 'TodoListCreate') {
                  // TodoListCreateScreen으로 돌아가기
                  navigation.goBack();
                } else {
                  // 기본적으로 Mission 화면으로 이동
                  (navigation as any).navigate(ScreenNames.MISSION);
                }
              },
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
    category,
    isEditMode,
    editMissionId,
    navigation,
  ]);

  /**
   * 취소 버튼 핸들러
   */
  const handleCancel = useCallback(() => {
    if (returnScreen === 'TodoListCreate') {
      // TodoListCreateScreen으로 돌아가면서 Step 2 (custom)로 설정
      // navigate를 사용하여 파라미터 전달 (이미 스택에 있어도 파라미터 업데이트됨)
      (navigation as any).navigate(SCREEN_NAMES.TODO_LIST_CREATE, { activeStep: 'custom' });
    } else {
      // 미션 도감에서 왔으면 Mission 화면의 미션 도감 커스텀 미션 탭으로 이동
      // navigate를 사용하여 activeTab과 missionGroupTab을 명시적으로 전달
      (navigation as any).navigate(ScreenNames.MISSION, { 
        activeTab: 'missionGroup',
        missionGroupTab: 'custom' 
      });
    }
  }, [navigation, returnScreen]);

  return {
    // Constants
    MISSION_CATEGORY_OPTIONS,
    buttonWidth,
    // Route params
    isEditMode,
    // State
    title,
    description,
    loading,
    category,
    // Setters
    setTitle,
    setDescription,
    setCategory,
    // Handlers
    handleSubmitMission,
    handleCancel,
  };
};
