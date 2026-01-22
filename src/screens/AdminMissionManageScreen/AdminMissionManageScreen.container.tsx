/**
 * AdminMissionManageScreen 비즈니스 로직
 * 미션 목록 로드, CRUD 처리, 필터링
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  verificationType: 'COMMUNITY' | 'GPS' | 'TIME';
  expReward: number;
  badgeDurationDays: number;
  isActive: boolean;
  requiredMinutes?: number;
  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsRadiusMeters?: number;
}

export interface AdminMissionManageScreenContainerProps {
  navigation: any;
}

export const MISSION_TYPES = [
  { value: 'DAILY', label: '일일 미션' },
  { value: 'WEEKLY', label: '주간 미션' },
  { value: 'MONTHLY', label: '월간 미션' },
];

export const VERIFICATION_TYPES = [
  { value: 'COMMUNITY', label: '커뮤니티 인증' },
  { value: 'GPS', label: 'GPS 인증' },
  { value: 'TIME', label: '시간 인증' },
];

export const useAdminMissionManageScreenContainer = ({
  navigation,
}: AdminMissionManageScreenContainerProps) => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // 폼 상태
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'DAILY' as 'DAILY' | 'WEEKLY' | 'MONTHLY',
    verificationType: 'COMMUNITY' as 'COMMUNITY' | 'GPS' | 'TIME',
    expReward: '10',
    badgeDurationDays: '3',
    requiredMinutes: '',
    gpsLatitude: '',
    gpsLongitude: '',
    gpsRadiusMeters: '100',
    isActive: true,
  });

  /**
   * 미션 목록 로드
   * - 실제로는 API 호출이 필요하지만 현재는 mock 데이터 사용
   */
  const loadMissions = useCallback(async () => {
    setLoading(true);
    try {
      // 임시 데이터 - 실제로는 API 호출
      const mockMissions: Mission[] = [
        {
          id: '1',
          title: '아침 산책하기',
          description: '30분 이상 야외에서 산책하며 아침 공기 마시기',
          type: 'DAILY',
          verificationType: 'TIME',
          expReward: 15,
          badgeDurationDays: 3,
          isActive: true,
          requiredMinutes: 30,
        },
        {
          id: '2',
          title: '도서관 방문하기',
          description: '지역 도서관을 방문하여 책 읽기',
          type: 'WEEKLY',
          verificationType: 'GPS',
          expReward: 25,
          badgeDurationDays: 7,
          isActive: true,
          gpsLatitude: 37.5665,
          gpsLongitude: 126.9780,
          gpsRadiusMeters: 100,
        },
        {
          id: '3',
          title: '자기소개 글 작성',
          description: '커뮤니티에 자기소개 글을 작성하고 다른 사람들의 피드백 받기',
          type: 'MONTHLY',
          verificationType: 'COMMUNITY',
          expReward: 50,
          badgeDurationDays: 30,
          isActive: false,
        },
      ];
      setMissions(mockMissions);
    } catch (error) {
      Alert.alert('오류', '미션 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMissions();
  }, [loadMissions]);

  /**
   * 필터링된 미션 목록 계산
   */
  const filteredMissions = useMemo(() => {
    return missions.filter(mission => {
      if (filter === 'active') return mission.isActive;
      if (filter === 'inactive') return !mission.isActive;
      return true;
    });
  }, [missions, filter]);

  /**
   * 폼 초기화
   */
  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      type: 'DAILY',
      verificationType: 'COMMUNITY',
      expReward: '10',
      badgeDurationDays: '3',
      requiredMinutes: '',
      gpsLatitude: '',
      gpsLongitude: '',
      gpsRadiusMeters: '100',
      isActive: true,
    });
  }, []);

  /**
   * 미션 추가 모달 열기
   */
  const openAddModal = useCallback(() => {
    setEditingMission(null);
    resetForm();
    setShowModal(true);
  }, [resetForm]);

  /**
   * 미션 수정 모달 열기
   */
  const openEditModal = useCallback((mission: Mission) => {
    setEditingMission(mission);
    setFormData({
      title: mission.title,
      description: mission.description,
      type: mission.type,
      verificationType: mission.verificationType,
      expReward: mission.expReward.toString(),
      badgeDurationDays: mission.badgeDurationDays.toString(),
      requiredMinutes: mission.requiredMinutes?.toString() || '',
      gpsLatitude: mission.gpsLatitude?.toString() || '',
      gpsLongitude: mission.gpsLongitude?.toString() || '',
      gpsRadiusMeters: mission.gpsRadiusMeters?.toString() || '100',
      isActive: mission.isActive,
    });
    setShowModal(true);
  }, []);

  /**
   * 모달 닫기
   */
  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  /**
   * 폼 데이터 업데이트
   */
  const updateFormData = useCallback((updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * 미션 저장 (추가/수정)
   * - 유효성 검사
   * - 미션 추가 또는 수정
   */
  const handleSaveMission = useCallback(async () => {
    if (!formData.title.trim()) {
      Alert.alert('오류', '미션 제목을 입력해주세요.');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('오류', '미션 설명을 입력해주세요.');
      return;
    }

    try {
      if (editingMission) {
        // 수정
        setMissions(prev =>
          prev.map(m =>
            m.id === editingMission.id
              ? {
                  ...m,
                  title: formData.title,
                  description: formData.description,
                  type: formData.type,
                  verificationType: formData.verificationType,
                  expReward: parseInt(formData.expReward) || 10,
                  badgeDurationDays: parseInt(formData.badgeDurationDays) || 3,
                  isActive: formData.isActive,
                  requiredMinutes: formData.requiredMinutes ? parseInt(formData.requiredMinutes) : undefined,
                  gpsLatitude: formData.gpsLatitude ? parseFloat(formData.gpsLatitude) : undefined,
                  gpsLongitude: formData.gpsLongitude ? parseFloat(formData.gpsLongitude) : undefined,
                  gpsRadiusMeters: formData.gpsRadiusMeters ? parseInt(formData.gpsRadiusMeters) : undefined,
                }
              : m
          )
        );
        Alert.alert('완료', '미션이 수정되었습니다.');
      } else {
        // 추가
        const newMission: Mission = {
          id: Date.now().toString(),
          title: formData.title,
          description: formData.description,
          type: formData.type,
          verificationType: formData.verificationType,
          expReward: parseInt(formData.expReward) || 10,
          badgeDurationDays: parseInt(formData.badgeDurationDays) || 3,
          isActive: formData.isActive,
          requiredMinutes: formData.requiredMinutes ? parseInt(formData.requiredMinutes) : undefined,
          gpsLatitude: formData.gpsLatitude ? parseFloat(formData.gpsLatitude) : undefined,
          gpsLongitude: formData.gpsLongitude ? parseFloat(formData.gpsLongitude) : undefined,
          gpsRadiusMeters: formData.gpsRadiusMeters ? parseInt(formData.gpsRadiusMeters) : undefined,
        };
        setMissions(prev => [...prev, newMission]);
        Alert.alert('완료', '새 미션이 추가되었습니다.');
      }
      setShowModal(false);
    } catch (error) {
      Alert.alert('오류', '미션 저장에 실패했습니다.');
    }
  }, [formData, editingMission]);

  /**
   * 미션 삭제
   */
  const handleDeleteMission = useCallback((missionId: string) => {
    Alert.alert(
      '미션 삭제',
      '정말로 이 미션을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            setMissions(prev => prev.filter(m => m.id !== missionId));
            Alert.alert('완료', '미션이 삭제되었습니다.');
          },
        },
      ]
    );
  }, []);

  /**
   * 미션 활성화/비활성화 토글
   */
  const handleToggleActive = useCallback((missionId: string) => {
    setMissions(prev =>
      prev.map(m =>
        m.id === missionId ? { ...m, isActive: !m.isActive } : m
      )
    );
  }, []);

  /**
   * 필터 변경
   */
  const handleFilterChange = useCallback((newFilter: 'all' | 'active' | 'inactive') => {
    setFilter(newFilter);
  }, []);

  /**
   * 미션 유형 라벨 가져오기
   */
  const getMissionTypeLabel = useCallback((type: string) => {
    return MISSION_TYPES.find(t => t.value === type)?.label || type;
  }, []);

  /**
   * 인증 유형 라벨 가져오기
   */
  const getVerificationTypeLabel = useCallback((type: string) => {
    return VERIFICATION_TYPES.find(t => t.value === type)?.label || type;
  }, []);

  return {
    missions: filteredMissions,
    loading,
    showModal,
    editingMission,
    filter,
    formData,
    handleFilterChange,
    openAddModal,
    openEditModal,
    closeModal,
    updateFormData,
    handleSaveMission,
    handleDeleteMission,
    handleToggleActive,
    getMissionTypeLabel,
    getVerificationTypeLabel,
  };
};
