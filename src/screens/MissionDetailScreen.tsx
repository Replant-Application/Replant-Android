/**
 * 미션 상세 화면
 * 미션 정보와 리뷰를 표시
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Loading, Header, EmptyState } from '../components/ui';
import { colors, spacing, typography, borderRadius } from '../utils/designTokens';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { useUser } from '../contexts/UserContext';
import { getData, setData, getStorageKeys } from '../services/storage';
import { Mission } from '../types';

interface MissionReview {
  id: string;
  mission_id: string;
  author: string;
  author_nickname: string;
  rating: number; // 1-5 별점
  content: string;
  created_at: string;
}

interface MissionDetailScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'MissionDetail'>;
}

// 별점 컴포넌트
const StarRating: React.FC<{
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
}> = ({ rating, onRatingChange, size = 24, readonly = false }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.starContainer}>
      {stars.map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => !readonly && onRatingChange?.(star)}
          disabled={readonly}
        >
          <Text style={[styles.star, { fontSize: size }]}>
            {star <= rating ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// 리뷰 카드 컴포넌트
const ReviewCard: React.FC<{
  review: MissionReview;
  isAuthor: boolean;
  onDelete: () => void;
}> = ({ review, isAuthor, onDelete }) => {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewAuthorInfo}>
          <Text style={styles.reviewAuthor}>{review.author_nickname}</Text>
          <StarRating rating={review.rating} size={16} readonly />
        </View>
        <Text style={styles.reviewDate}>
          {new Date(review.created_at).toLocaleDateString('ko-KR')}
        </Text>
      </View>
      <Text style={styles.reviewContent}>{review.content}</Text>
      {isAuthor && (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteButtonText}>삭제</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const MissionDetailScreen: React.FC<MissionDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { missionId } = route.params;
  const { currentNickname } = useUser();
  const [mission, setMission] = useState<Mission | null>(null);
  const [reviews, setReviews] = useState<MissionReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReviewContent, setNewReviewContent] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);

  // 미션 및 리뷰 로드
  const loadData = useCallback(async () => {
    if (!currentNickname || !missionId) return;

    try {
      setLoading(true);
      const storageKeys = getStorageKeys(currentNickname);

      // 미션 데이터 로드
      const missions: Mission[] = await getData(storageKeys.MISSIONS) || [];
      const foundMission = missions.find(m => m.mission_id === missionId);
      setMission(foundMission || null);

      // 리뷰 데이터 로드 (전역 리뷰 저장소)
      const allReviews: MissionReview[] = await getData('mission_reviews') || [];
      const missionReviews = allReviews.filter(r => r.mission_id === missionId);
      setReviews(missionReviews.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    } catch (error) {
      Alert.alert('오류', '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [currentNickname, missionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 리뷰 작성
  const handleSubmitReview = async () => {
    if (!newReviewContent.trim()) {
      Alert.alert('오류', '리뷰 내용을 입력해주세요.');
      return;
    }

    if (!currentNickname || !mission) {
      Alert.alert('오류', '사용자 정보가 없습니다.');
      return;
    }

    try {
      const newReview: MissionReview = {
        id: `review_${Date.now()}`,
        mission_id: missionId,
        author: currentNickname,
        author_nickname: currentNickname,
        rating: newReviewRating,
        content: newReviewContent.trim(),
        created_at: new Date().toISOString(),
      };

      // 기존 리뷰 목록에 추가
      const allReviews: MissionReview[] = await getData('mission_reviews') || [];
      await setData('mission_reviews', [...allReviews, newReview]);

      // 로컬 상태 업데이트
      setReviews(prev => [newReview, ...prev]);
      setNewReviewContent('');
      setNewReviewRating(5);

      Alert.alert('완료', '리뷰가 등록되었습니다.');
    } catch (error) {
      Alert.alert('오류', '리뷰 등록에 실패했습니다.');
    }
  };

  // 리뷰 삭제
  const handleDeleteReview = async (reviewId: string) => {
    Alert.alert(
      '리뷰 삭제',
      '정말로 이 리뷰를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const allReviews: MissionReview[] = await getData('mission_reviews') || [];
              const filteredReviews = allReviews.filter(r => r.id !== reviewId);
              await setData('mission_reviews', filteredReviews);

              setReviews(prev => prev.filter(r => r.id !== reviewId));
              Alert.alert('완료', '리뷰가 삭제되었습니다.');
            } catch (error) {
              Alert.alert('오류', '리뷰 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  // 평균 별점 계산
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  if (loading) {
    return <Loading text="미션 정보를 불러오는 중..." />;
  }

  if (!mission) {
    return (
      <View style={styles.container}>
        <Header
          title="미션 상세"
          leftButton={
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image
                source={require('../assets/images/left.png')}
                style={styles.backButtonIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          }
        />
        <EmptyState icon="📭" title="미션을 찾을 수 없습니다" description="해당 미션을 찾을 수 없습니다." />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Header
        title="미션 상세"
        leftButton={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../assets/images/left.png')}
              style={styles.backButtonIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* 미션 정보 */}
        <View style={styles.missionContainer}>
          <View style={styles.missionHeader}>
            <Text style={styles.missionEmoji}>{mission.emoji}</Text>
            <View style={styles.missionTitleContainer}>
              <Text style={styles.missionTitle}>{mission.title}</Text>
              <View style={styles.missionMeta}>
                <Text style={styles.missionType}>
                  {mission.type === 'DAILY' ? '일일' : mission.type === 'WEEKLY' ? '주간' : '월간'}
                </Text>
                <Text style={styles.missionExp}>+{mission.experience} EXP</Text>
              </View>
            </View>
          </View>

          {mission.description && (
            <Text style={styles.missionDescription}>{mission.description}</Text>
          )}

          <View style={styles.missionStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>★ {averageRating}</Text>
              <Text style={styles.statLabel}>평균 별점</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{reviews.length}</Text>
              <Text style={styles.statLabel}>리뷰</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {mission.completed ? '완료' : '진행중'}
              </Text>
              <Text style={styles.statLabel}>상태</Text>
            </View>
          </View>
        </View>

        {/* 리뷰 작성 */}
        <View style={styles.reviewFormContainer}>
          <Text style={styles.sectionTitle}>리뷰 작성</Text>
          <View style={styles.ratingInput}>
            <Text style={styles.ratingLabel}>별점</Text>
            <StarRating
              rating={newReviewRating}
              onRatingChange={setNewReviewRating}
              size={32}
            />
          </View>
          <TextInput
            style={styles.reviewInput}
            value={newReviewContent}
            onChangeText={setNewReviewContent}
            placeholder="미션에 대한 리뷰를 작성해주세요..."
            placeholderTextColor={colors.text.tertiary}
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity
            style={[styles.submitButton, !newReviewContent.trim() && styles.submitButtonDisabled]}
            onPress={handleSubmitReview}
            disabled={!newReviewContent.trim()}
          >
            <Text style={styles.submitButtonText}>리뷰 등록</Text>
          </TouchableOpacity>
        </View>

        {/* 리뷰 목록 */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>리뷰 ({reviews.length})</Text>

          {reviews.length === 0 ? (
            <EmptyState
              icon="📝"
              title="아직 리뷰가 없어요"
              description="첫 리뷰를 남겨보세요!"
            />
          ) : (
            <View style={styles.reviewsList}>
              {reviews.map(review => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  isAuthor={review.author === currentNickname}
                  onDelete={() => handleDeleteReview(review.id)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    flex: 1,
    padding: spacing[4],
  },
  backButtonIcon: {
    width: 24,
    height: 24,
  },
  // 미션 정보
  missionContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[5],
    marginBottom: spacing[4],
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  missionEmoji: {
    fontSize: 48,
    marginRight: spacing[4],
  },
  missionTitleContainer: {
    flex: 1,
  },
  missionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  missionMeta: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  missionType: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  missionExp: {
    fontSize: typography.fontSize.sm,
    color: colors.blue[600],
    backgroundColor: colors.blue[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  missionDescription: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.base,
    marginBottom: spacing[4],
  },
  missionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  // 리뷰 작성
  reviewFormContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  ratingInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
    gap: spacing[3],
  },
  ratingLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  starContainer: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  star: {
    color: colors.warning,
  },
  reviewInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: spacing[3],
  },
  submitButton: {
    backgroundColor: colors.primary[600],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.background.tertiary,
  },
  submitButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
  },
  // 리뷰 목록
  reviewsSection: {
    marginBottom: spacing[6],
  },
  reviewsList: {
    gap: spacing[3],
  },
  reviewCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    padding: spacing[4],
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  reviewAuthorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  reviewAuthor: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  reviewDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  reviewContent: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.base,
  },
  deleteButton: {
    marginTop: spacing[2],
    alignSelf: 'flex-end',
  },
  deleteButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
  },
});

export default MissionDetailScreen;
