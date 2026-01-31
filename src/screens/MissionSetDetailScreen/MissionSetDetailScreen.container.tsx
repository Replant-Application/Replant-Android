/**
 * MissionSetDetailScreen 비즈니스 로직
 * 미션세트 상세 화면: 미션세트 조회, 리뷰 작성
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import {
  getPublicTodoListDetail,
  MissionSetDetail,
  createReview,
  updateReview,
  deleteReview,
  getMyReview,
  MissionSetReview,
} from '../../api/todolistApi';
import { PublicTodoListDetail } from '../../types/todolist';
import { logError } from '../../utils/logger';
import { useUser } from '../../contexts/UserContext';

interface MissionSetDetailScreenContainerProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'MissionSetDetail'>;
}

export const useMissionSetDetailScreenContainer = ({ navigation, route }: MissionSetDetailScreenContainerProps) => {
  const { missionSetId } = route.params as { missionSetId: number };
  const { user, currentUserId } = useUser();

  const [missionSet, setMissionSet] = useState<MissionSetDetail | PublicTodoListDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // 리뷰 관련 상태
  const [myReview, setMyReview] = useState<MissionSetReview | null>(null);
  const [reviewRating, setReviewRating] = useState(0); // 0 = 선택 없음
  const [submittingReview, setSubmittingReview] = useState(false);

  /**
   * 미션세트 상세 로딩
   * 공개 투두리스트는 getPublicTodoListDetail 사용
   */
  const loadMissionSetDetail = useCallback(async () => {
    try {
      // 공개 투두리스트 상세 조회 API 사용
      const result = await getPublicTodoListDetail(missionSetId);
      if (result.success && result.data) {
        // PublicTodoListDetail을 MissionSetDetail 형식으로 변환
        const publicDetail = result.data;
        const converted: MissionSetDetail = {
          id: publicDetail.id,
          title: publicDetail.title,
          description: publicDetail.description || undefined,
          creatorId: publicDetail.creatorId,
          creatorNickname: publicDetail.creatorNickname,
          isPublic: true,
          missionCount: publicDetail.missionCount || (publicDetail.missions?.length || 0),
          averageRating: publicDetail.averageRating || 0,
          reviewCount: publicDetail.reviewCount ?? 0,  // 리뷰 한 사람 수 (별점 옆 표시)
          // PublicMissionInfo를 MissionSetMission으로 변환
          missions: (publicDetail.missions || []).map((mission, index) => ({
            missionId: mission.missionId,
            missionTitle: mission.title,
            displayOrder: mission.displayOrder !== undefined ? mission.displayOrder : index,
          })),
          createdAt: publicDetail.createdAt,
        };
        setMissionSet(converted);
      } else {
        Alert.alert('오류', '미션세트를 불러올 수 없습니다.');
        navigation.goBack();
      }
    } catch (error) {
      logError('미션세트 상세 로딩 실패', error as Error);
      Alert.alert('오류', '미션세트를 불러오는 중 문제가 발생했습니다.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [missionSetId, navigation]);

  /**
   * 내 리뷰 로딩
   */
  const loadMyReview = useCallback(async () => {
    try {
      const result = await getMyReview(missionSetId);
      console.log('[MissionSetDetail] loadMyReview result:', { success: result.success, data: result.data });
      if (result.success && result.data && result.data.rating) {
        setMyReview(result.data);
        setReviewRating(result.data.rating);
      } else {
        // 리뷰가 없으면 명시적으로 null로 설정
        console.log('[MissionSetDetail] No review found, setting to null');
        setMyReview(null);
      }
    } catch (error) {
      console.log('[MissionSetDetail] loadMyReview error:', error);
      // 리뷰가 없는 경우 명시적으로 null로 설정
      setMyReview(null);
    }
  }, [missionSetId]);

  /**
   * 초기 데이터 로드
   */
  useEffect(() => {
    loadMissionSetDetail();
    loadMyReview();
  }, [loadMissionSetDetail, loadMyReview]);

  /**
   * 리뷰 제출 (작성 또는 수정) — 1~5점만. 0은 handleDeleteReview로 처리.
   */
  const handleSubmitReview = useCallback(async (rating?: number) => {
    if (!missionSet) return;
    if (rating !== undefined && rating < 1) return; // 0은 제출하지 않음

    const ratingToSubmit = rating ?? reviewRating;
    if (ratingToSubmit < 1) return;

    const isUpdate = myReview && myReview.id;
    setSubmittingReview(true);
    try {
      const reviewData = {
        rating: ratingToSubmit,
      };

      let result;
      if (isUpdate) {
        result = await updateReview(myReview.id, reviewData);
      } else {
        result = await createReview(missionSet.id, reviewData);
      }

      if (result.success && result.data) {
        setMyReview(result.data);
        setReviewRating(ratingToSubmit);
        loadMissionSetDetail();
      } else {
        Alert.alert('오류', result.error || (isUpdate ? '리뷰 수정에 실패했습니다.' : '리뷰 등록에 실패했습니다.'));
      }
    } catch (error) {
      logError(isUpdate ? '리뷰 수정 실패' : '리뷰 등록 실패', error as Error);
      Alert.alert('오류', (isUpdate ? '리뷰 수정' : '리뷰 등록') + ' 중 문제가 발생했습니다.');
    } finally {
      setSubmittingReview(false);
    }
  }, [missionSet, myReview, reviewRating, loadMissionSetDetail]);

  /**
   * 리뷰 취소 (삭제) — 이미 남긴 리뷰를 삭제하거나 0점(선택 없음)으로 돌리기
   */
  const handleDeleteReview = useCallback(async () => {
    if (!myReview?.id) return;
    setSubmittingReview(true);
    try {
      const result = await deleteReview(myReview.id);
      if (result.success) {
        setMyReview(null);
        setReviewRating(0);
        loadMissionSetDetail();
      } else {
        Alert.alert('오류', result.error || '리뷰 취소에 실패했습니다.');
      }
    } catch (error) {
      logError('리뷰 삭제 실패', error as Error);
      Alert.alert('오류', '리뷰 취소 중 문제가 발생했습니다.');
    } finally {
      setSubmittingReview(false);
    }
  }, [myReview, loadMissionSetDetail]);

  /**
   * 별점 렌더링
   */
  const renderStars = useCallback((rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const stars = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push('★');
      } else if (i === fullStars && hasHalfStar) {
        stars.push('☆');
      } else {
        stars.push('☆');
      }
    }

    return stars.join('');
  }, []);


  /**
   * 본인 미션세트인지 확인
   */
  const isOwner = useMemo(() => {
    return missionSet && user && currentUserId && missionSet.creatorId === currentUserId;
  }, [missionSet, user, currentUserId]);

  return {
    // Data
    missionSet,
    myReview,
    // State
    loading,
    reviewRating,
    submittingReview,
    isOwner,
    // Setters
    setReviewRating,
    // Handlers
    handleSubmitReview,
    handleDeleteReview,
    // Utils
    renderStars,
  };
};
