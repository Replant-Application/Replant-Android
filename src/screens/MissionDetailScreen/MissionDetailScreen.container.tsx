/**
 * MissionDetailScreen 비즈니스 로직
 * 미션 상세 화면: 미션 정보 조회, 리뷰 조회/작성, 뱃지 확인
 */

import { useState, useEffect, useCallback } from 'react';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import {
  getSystemMission,
  getCustomMission,
  getMissionReviews,
  createMissionReview,
  completeCustomMission,
  SystemMission,
  MissionReview,
  Mission,
} from '../../api/missionApi';
import { getMyBadges, Badge } from '../../api/badgeApi';
import { getCurrentUser } from '../../services/authService';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { colors } from '../../utils/designTokens';

interface MissionDetailScreenContainerProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'MissionDetail'>;
}

/**
 * 난이도 라벨 반환
 */
export const getDifficultyLabel = (difficultyLevel?: string): { label: string; color: string } => {
  switch (difficultyLevel) {
    case 'EASY':
    case 'LEVEL1':
      return { label: '쉬움', color: colors.success };
    case 'MEDIUM':
    case 'LEVEL2':
      return { label: '보통', color: colors.warning };
    case 'HARD':
    case 'LEVEL3':
      return { label: '어려움', color: colors.error };
    default:
      return { label: '일반', color: colors.text.secondary };
  }
};

/**
 * 미션 타입 라벨 반환
 */
export const getMissionTypeLabel = (missionType?: string): string => {
  switch (missionType) {
    case 'OFFICIAL':
      return '공식 미션';
    case 'CUSTOM':
      return '커스텀 미션';
    default:
      return '미션';
  }
};

export const useMissionDetailScreenContainer = ({ navigation, route }: MissionDetailScreenContainerProps) => {
  const { missionId, returnTab } = route.params;
  const { showError, showSuccess, handleApiError } = useErrorHandler();

  const [mission, setMission] = useState<SystemMission | Mission | null>(null);
  const [reviews, setReviews] = useState<MissionReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  // 뱃지 확인 및 후기 작성 상태
  const [hasBadge, setHasBadge] = useState(false);
  const [hasWrittenReview, setHasWrittenReview] = useState(false);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [completingCustom, setCompletingCustom] = useState(false);

  /**
   * 미션 데이터 로드
   */
  const loadMission = useCallback(async () => {
    if (!missionId) return;

    try {
      // 커스텀 미션 ID 형식 확인 (custom_${id})
      const isCustomMission = missionId.startsWith('custom_');

      if (isCustomMission) {
        // 커스텀 미션: custom_368 -> 368 추출
        const numericId = parseInt(missionId.replace('custom_', ''), 10);
        if (isNaN(numericId)) {
          showError(new Error('잘못된 미션 ID입니다.'), 'MissionDetailScreen.loadMission');
          return;
        }

        const result = await getCustomMission(numericId);
        if (result.success && result.data) {
          setMission(result.data);
        } else {
          handleApiError(result, 'MissionDetailScreen.loadMission');
        }
      } else {
        // 공식 미션: 숫자 ID 직접 사용
        const numericMissionId = parseInt(missionId, 10);
        if (isNaN(numericMissionId)) {
          showError(new Error('잘못된 미션 ID입니다.'), 'MissionDetailScreen.loadMission');
          return;
        }

        const result = await getSystemMission(numericMissionId);
        if (result.success && result.data) {
          setMission(result.data);
        } else {
          handleApiError(result, 'MissionDetailScreen.loadMission');
        }
      }
    } catch (error) {
      showError(error instanceof Error ? error : new Error('미션 정보를 불러오는데 실패했습니다.'), 'MissionDetailScreen.loadMission');
    }
  }, [missionId, showError, handleApiError]);

  /**
   * 리뷰 데이터 로드
   */
  const loadReviews = useCallback(
    async (page: number = 0, userId?: number | null) => {
      if (!missionId) return;

      try {
        // 커스텀 미션 ID 형식 확인 (custom_${id})
        const isCustomMission = missionId.startsWith('custom_');
        const numericMissionId = isCustomMission ? parseInt(missionId.replace('custom_', ''), 10) : parseInt(missionId, 10);
        if (isNaN(numericMissionId)) return;

        const result = await getMissionReviews(numericMissionId, { page, size: 10 });
        if (result.success && result.data) {
          const reviewList = result.data.content;
          if (page === 0) {
            setReviews(reviewList);
            // 현재 사용자가 이미 후기를 작성했는지 확인
            if (userId) {
              const hasMyReview = reviewList.some(review => review.userId === userId);
              setHasWrittenReview(hasMyReview);
            }
          } else {
            setReviews(prev => [...prev, ...reviewList]);
          }
          setCurrentPage(result.data.number);
          setTotalPages(result.data.totalPages);
          setTotalReviews(result.data.totalElements);
        }
      } catch (error) {
        console.error('리뷰 로드 실패:', error);
      }
    },
    [missionId]
  );

  /**
   * 뱃지 소유 여부 확인
   */
  const checkBadgeOwnership = useCallback(async () => {
    if (!missionId) return;

    try {
      // 커스텀 미션 ID 형식 확인 (custom_${id})
      const isCustomMission = missionId.startsWith('custom_');
      const numericMissionId = isCustomMission ? parseInt(missionId.replace('custom_', ''), 10) : parseInt(missionId, 10);
      if (isNaN(numericMissionId)) return;

      const result = await getMyBadges();
      if (result.success && result.data) {
        const badges = result.data.badges || [];
        // 해당 미션에 대한 유효한 뱃지가 있는지 확인
        const hasMissionBadge = badges.some((badge: Badge) => {
          if (isCustomMission) {
            // 커스텀 미션: customMission.id와 비교
            return badge.customMission?.id === numericMissionId && !badge.isExpired;
          } else {
            // 공식 미션: mission.id와 비교
            return badge.mission?.id === numericMissionId && !badge.isExpired;
          }
        });
        setHasBadge(hasMissionBadge);
      }
    } catch (error) {
      console.error('뱃지 확인 실패:', error);
    }
  }, [missionId]);

  /**
   * 후기 작성
   */
  const handleSubmitReview = useCallback(async () => {
    if (!missionId || !reviewContent.trim()) return;

    try {
      setSubmittingReview(true);
      // 커스텀 미션 ID 형식 확인 (custom_${id})
      const isCustomMission = missionId.startsWith('custom_');
      const numericMissionId = isCustomMission ? parseInt(missionId.replace('custom_', ''), 10) : parseInt(missionId, 10);
      if (isNaN(numericMissionId)) {
        showError(new Error('잘못된 미션 ID입니다.'), 'MissionDetailScreen.handleSubmitReview');
        return;
      }

      const result = await createMissionReview(numericMissionId, {
        content: reviewContent.trim(),
        rating: reviewRating,
      });

      if (result.success) {
        showSuccess('후기가 등록되었습니다.');
        setReviewContent('');
        setReviewRating(5);
        setHasWrittenReview(true);
        // 리뷰 목록 새로고침
        await loadReviews(0, currentUserId);
      } else {
        if (result.error?.includes('뱃지') || result.error?.includes('badge')) {
          showError(new Error('이 미션을 완료하고 뱃지를 획득해야 후기를 작성할 수 있습니다.'), 'MissionDetailScreen.handleSubmitReview');
        } else {
          handleApiError(result, 'MissionDetailScreen.handleSubmitReview');
        }
      }
    } catch (error) {
      showError(error instanceof Error ? error : new Error('후기 등록 중 오류가 발생했습니다.'), 'MissionDetailScreen.handleSubmitReview');
    } finally {
      setSubmittingReview(false);
    }
  }, [missionId, reviewContent, reviewRating, loadReviews, currentUserId, showError, showSuccess, handleApiError]);

  /**
   * 초기 데이터 로드
   */
  const loadData = useCallback(async () => {
    setLoading(true);
    // 현재 사용자 정보 가져오기
    const user = await getCurrentUser();
    const userId = user?.id || null;
    setCurrentUserId(userId);

    await Promise.all([loadMission(), loadReviews(0, userId), checkBadgeOwnership()]);
    setLoading(false);
  }, [loadMission, loadReviews, checkBadgeOwnership]);

  /**
   * 새로고침
   */
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadMission(), loadReviews(0, currentUserId), checkBadgeOwnership()]);
    setRefreshing(false);
  }, [loadMission, loadReviews, checkBadgeOwnership, currentUserId]);

  /**
   * 더 많은 리뷰 로드
   */
  const loadMoreReviews = useCallback(() => {
    if (currentPage < totalPages - 1) {
      loadReviews(currentPage + 1);
    }
  }, [currentPage, totalPages, loadReviews]);

  /**
   * 커스텀 미션 완료 (인증 없이 즉시 완료)
   */
  const handleCompleteCustom = useCallback(
    async () => {
      if (!mission || mission.missionType !== 'CUSTOM' || !('id' in mission) || typeof mission.id !== 'number') return;
      setCompletingCustom(true);
      try {
        const result = await completeCustomMission(mission.id);
        if (result.success) {
          showSuccess('미션을 완료했어요.');
          navigation.goBack();
        } else {
          handleApiError(result, 'MissionDetailScreen.handleCompleteCustom');
        }
      } catch (e) {
        showError(e instanceof Error ? e : new Error('미션 완료에 실패했습니다.'), 'MissionDetailScreen.handleCompleteCustom');
      } finally {
        setCompletingCustom(false);
      }
    },
    [mission, navigation, showSuccess, showError, handleApiError]
  );

  /**
   * 초기 데이터 로드
   */
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    // Data
    mission,
    reviews,
    // State
    loading,
    refreshing,
    currentPage,
    totalPages,
    totalReviews,
    hasBadge,
    hasWrittenReview,
    reviewContent,
    reviewRating,
    submittingReview,
    returnTab,
    // Setters
    setReviewContent,
    setReviewRating,
    // Handlers
    handleSubmitReview,
    handleRefresh,
    loadMoreReviews,
    handleCompleteCustom,
    completingCustom,
  };
};
