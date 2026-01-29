/**
 * MissionGroupScreen 비즈니스 로직
 * 미션 도감 화면: 미션 목록 조회, 리뷰 조회/작성, 페이지네이션
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import {
  getMissionCollection,
  getMissionReviews,
  createMissionReview,
  MissionReview,
  MissionCategory,
} from '../../api/missionApi';

/**
 * 인증 타입 한글 변환
 */
export const getVerificationTypeLabel = (type?: string): string => {
  switch (type) {
    case 'GPS':
      return 'GPS 인증';
    case 'TIME':
      return '⏱️ 시간 인증';
    case 'COMMUNITY':
      return '커뮤니티 인증';
    default:
      return '일반 인증';
  }
};

/**
 * 인증 타입 아이콘
 */
export const getVerificationTypeIcon = (type?: string) => {
  switch (type) {
    case 'GPS':
      return require('../../assets/images/location.png');
    case 'COMMUNITY':
      return require('../../assets/images/high-five.png');
    default:
      return null;
  }
};

/**
 * 미션 카테고리 한글 변환
 */
export const getMissionCategoryLabel = (category?: MissionCategory): string => {
  switch (category) {
    case 'DAILY_LIFE':
      return '일상';
    case 'GROWTH':
      return '성장';
    case 'EXERCISE':
      return '운동';
    case 'STUDY':
      return '학습';
    case 'HEALTH':
      return '건강';
    case 'RELATIONSHIP':
      return '관계';
    default:
      return '';
  }
};

/**
 * 미션 아이콘
 */
export const getMissionIcon = (_title: string) => {
  return require('../../assets/images/goal.png');
};

type MissionGroupTab = 'official' | 'custom';

// 통합 미션 타입 (공식/커스텀 모두 표시용)
export interface UnifiedMission {
  id: number;
  title: string;
  description: string;
  category?: MissionCategory;
  verificationType: string;
  requiredMinutes?: number;
  expReward: number;
  badgeDurationDays: number;
  participantCount?: number;
  isCustom: boolean;
  creatorNickname?: string;
  isAttempted?: boolean;
  isCompleted?: boolean;
  isPublic?: boolean;
}

interface MissionGroupScreenContainerProps {
  navigation: NavigationProp<RootStackParamList>;
}

export const useMissionGroupScreenContainer = ({ navigation }: MissionGroupScreenContainerProps) => {
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
      onShowSuccess: (t: string, m: string) => {
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
  const { showError, showSuccess, showInfo, handleApiError } = useErrorHandler(errorHandlerOverrides);

  const [activeTab, setActiveTab] = useState<MissionGroupTab>('official');
  const [missions, setMissions] = useState<UnifiedMission[]>([]);
  const [selectedMission, setSelectedMission] = useState<UnifiedMission | null>(null);
  const [reviews, setReviews] = useState<MissionReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;

  // 후기 작성 모달
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewContent, setReviewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /**
   * 미션 목록 로드 (미션 도감 API 사용)
   */
  const loadMissions = useCallback(
    async (page: number = 0, append: boolean = false) => {
      try {
        if (!append) {
          setLoading(true);
        }
        setError(null);

        // 미션 도감 API 사용 (사용자가 수행한 미션만 조회)
        const result = await getMissionCollection({ page, size: PAGE_SIZE });
        if (result.success && result.data) {
          // isAttempted === true인 미션만 필터링 (엄격하게)
          const allMissions = result.data.content || [];
          const attemptedMissions = allMissions.filter(m => m.isAttempted === true);

          console.log('[MissionGroupScreen] 미션 도감 조회:', {
            total: allMissions.length,
            attempted: attemptedMissions.length,
            notAttempted: allMissions.filter(m => m.isAttempted !== true).length,
            sample: allMissions.slice(0, 3).map(m => ({
              id: m.id,
              title: m.title,
              isAttempted: m.isAttempted,
              isCompleted: m.isCompleted,
            })),
          });

          // isAttempted === true인 미션만 표시
          const unifiedMissions: UnifiedMission[] = attemptedMissions.map(m => ({
            id: m.id,
            // isCompleted === false인 경우 "?"로 마스킹
            title: m.isCompleted === false ? '?' : m.title,
            description: m.isCompleted === false ? '?' : m.description,
            category: m.category,
            verificationType: m.verificationType,
            requiredMinutes: m.requiredMinutes,
            expReward: m.expReward,
            badgeDurationDays: m.badgeDurationDays,
            participantCount: m.participantCount,
            isCustom: m.missionType === 'CUSTOM',
            creatorNickname: m.creatorNickname,
            isAttempted: m.isAttempted,
            isCompleted: m.isCompleted,
            isPublic: m.isPublic,
          }));

          if (append) {
            setMissions(prev => [...prev, ...unifiedMissions]);
          } else {
            setMissions(unifiedMissions);
          }
          setTotalPages(result.data.totalPages);
          setHasMore(page < result.data.totalPages - 1);
        } else {
          throw new Error(result.error || '미션 목록을 불러올 수 없습니다.');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '미션 목록을 불러오는 중 오류가 발생했습니다.';
        setError(errorMessage);
        console.error('[MissionGroupScreen] 미션 목록 로드 실패:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  /**
   * 더 보기 (페이지네이션)
   */
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadMissions(nextPage, true);
    }
  }, [hasMore, loading, currentPage, loadMissions]);

  /**
   * 리뷰 목록 로드
   */
  const loadReviews = useCallback(async (missionId: number) => {
    try {
      setReviewsLoading(true);
      const result = await getMissionReviews(missionId);
      if (result.success && result.data) {
        setReviews(result.data.content || []);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error('리뷰 로드 오류:', err);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  /**
   * 새로고침
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setCurrentPage(0);
    await loadMissions(0, false);
    if (selectedMission) {
      await loadReviews(selectedMission.id);
    }
    setRefreshing(false);
  }, [loadMissions, loadReviews, selectedMission]);

  /**
   * 후기 제출
   */
  const handleSubmitReview = useCallback(async () => {
    if (!reviewContent.trim() || !selectedMission) return;

    try {
      setSubmitting(true);
      const result = await createMissionReview(selectedMission.id, {
        content: reviewContent.trim(),
      });

      if (result.success) {
        showSuccess('후기가 등록되었습니다.', '성공');
        setReviewContent('');
        setShowReviewModal(false);
        // 리뷰 목록 새로고침
        await loadReviews(selectedMission.id);
      } else {
        if (result.error?.includes('배지') || result.error?.includes('badge')) {
          showInfo('이 미션을 완료하고 배지를 획득해야 후기를 작성할 수 있습니다.', '후기 작성 불가');
        } else {
          handleApiError(result, 'MissionGroupScreen.handleSubmitReview');
        }
      }
    } catch (err) {
      showError(err instanceof Error ? err : new Error('후기 등록 중 오류가 발생했습니다.'), 'MissionGroupScreen.handleSubmitReview');
    } finally {
      setSubmitting(false);
    }
  }, [reviewContent, selectedMission, loadReviews, showSuccess, showInfo, handleApiError, showError]);

  /**
   * 미션 선택/해제
   */
  const handleMissionSelect = useCallback((mission: UnifiedMission) => {
    setSelectedMission(selectedMission?.id === mission.id ? null : mission);
  }, [selectedMission]);

  /**
   * 후기 작성 모달 열기
   */
  const handleOpenReviewModal = useCallback(() => {
    setShowReviewModal(true);
  }, []);

  /**
   * 후기 작성 모달 닫기
   */
  const handleCloseReviewModal = useCallback(() => {
    setShowReviewModal(false);
  }, []);

  /**
   * 커스텀 미션 생성 화면으로 이동
   */
  const handleCreateCustomMission = useCallback(() => {
    navigation.navigate('CustomMissionCreate' as any);
  }, [navigation]);

  /**
   * 미션 상세 화면으로 이동
   */
  const handleViewMissionDetail = useCallback(
    (mission: UnifiedMission) => {
      const missionId = mission.isCustom ? `custom_${mission.id}` : String(mission.id);
      navigation.navigate('MissionDetail', { missionId });
    },
    [navigation]
  );

  /**
   * 탭 변경시 목록 초기화 및 로드
   */
  useEffect(() => {
    setCurrentPage(0);
    setSelectedMission(null);
    setReviews([]);
    loadMissions(0, false);
  }, [activeTab, loadMissions]);

  /**
   * 초기 데이터 로드
   */
  useEffect(() => {
    loadMissions(0, false);
  }, [loadMissions]);

  /**
   * 미션 선택 시 리뷰 로드
   */
  useEffect(() => {
    if (selectedMission) {
      loadReviews(selectedMission.id);
    } else {
      setReviews([]);
    }
  }, [selectedMission, loadReviews]);

  return {
    // Data
    missions,
    reviews,
    // State (오류/성공/알림 AlertModal)
    showAlert,
    alertTitle,
    alertMessage,
    handleCloseAlert,
    // State
    activeTab,
    selectedMission,
    loading,
    reviewsLoading,
    refreshing,
    error,
    currentPage,
    totalPages,
    hasMore,
    showReviewModal,
    reviewContent,
    submitting,
    // Setters
    setActiveTab,
    setReviewContent,
    // Handlers
    handleMissionSelect,
    handleSubmitReview,
    handleOpenReviewModal,
    handleCloseReviewModal,
    handleCreateCustomMission,
    handleViewMissionDetail,
    onRefresh,
    loadMore,
  };
};
