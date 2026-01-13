/**
 * 미션 도감 상세 화면
 * 미션 정보와 리뷰를 표시 (API 연동)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  TextInput,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { Loading, Header, EmptyState } from '../../components/ui';
import { formatDateKorean } from '../../utils/dateUtils';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import {
  getSystemMission,
  getCustomMission,
  getMissionReviews,
  createMissionReview,
  SystemMission,
  MissionReview,
  Mission,
} from '../../api/missionApi';
import { getMyBadges, Badge } from '../../api/badgeApi';
import { getCurrentUser } from '../../services/authService';

interface MissionDetailScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'MissionDetail'>;
}

// 난이도 라벨 반환 (difficultyLevel: EASY/LEVEL1, MEDIUM/LEVEL2, HARD/LEVEL3)
const getDifficultyLabel = (difficultyLevel?: string): { label: string; color: string } => {
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

// 미션 타입 라벨 반환 (missionType: OFFICIAL, CUSTOM)
const getMissionTypeLabel = (missionType?: string): string => {
  switch (missionType) {
    case 'OFFICIAL':
      return '공식 미션';
    case 'CUSTOM':
      return '커스텀 미션';
    default:
      return '미션';
  }
};

// 별점 표시 컴포넌트
const RatingStars: React.FC<{ rating: number }> = ({ rating }) => (
  <View style={styles.ratingStarsDisplay}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Text key={star} style={styles.ratingStarDisplay}>
        {star <= rating ? '★' : '☆'}
      </Text>
    ))}
  </View>
);

// 리뷰 카드 컴포넌트
const ReviewCard: React.FC<{
  review: MissionReview;
}> = ({ review }) => {

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewAuthorInfo}>
          {review.userProfileImg ? (
            <Image
              source={{ uri: review.userProfileImg }}
              style={styles.reviewAuthorImage}
            />
          ) : (
            <View style={styles.reviewAuthorImagePlaceholder}>
              <Text style={styles.reviewAuthorImageText}>
                {review.userNickname?.charAt(0) || '?'}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.reviewAuthor}>{review.userNickname}</Text>
            {review.rating && <RatingStars rating={review.rating} />}
          </View>
        </View>
        <Text style={styles.reviewDate}>{formatDateKorean(review.createdAt)}</Text>
      </View>
      <Text style={styles.reviewContent}>{review.content}</Text>
    </View>
  );
};

const MissionDetailScreen: React.FC<MissionDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { missionId } = route.params;

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

  // 미션 데이터 로드
  const loadMission = useCallback(async () => {
    if (!missionId) return;

    try {
      // 커스텀 미션 ID 형식 확인 (custom_${id})
      const isCustomMission = missionId.startsWith('custom_');
      
      if (isCustomMission) {
        // 커스텀 미션: custom_368 -> 368 추출
        const numericId = parseInt(missionId.replace('custom_', ''), 10);
        if (isNaN(numericId)) {
          Alert.alert('오류', '잘못된 미션 ID입니다.');
          return;
        }
        
        const result = await getCustomMission(numericId);
        if (result.success && result.data) {
          setMission(result.data);
        } else {
          Alert.alert('오류', result.error || '미션 정보를 불러올 수 없습니다.');
        }
      } else {
        // 공식 미션: 숫자 ID 직접 사용
        const numericMissionId = parseInt(missionId, 10);
        if (isNaN(numericMissionId)) {
          Alert.alert('오류', '잘못된 미션 ID입니다.');
          return;
        }

        const result = await getSystemMission(numericMissionId);
        if (result.success && result.data) {
          setMission(result.data);
        } else {
          Alert.alert('오류', result.error || '미션 정보를 불러올 수 없습니다.');
        }
      }
    } catch (error) {
      Alert.alert('오류', '미션 정보를 불러오는데 실패했습니다.');
    }
  }, [missionId]);

  // 리뷰 데이터 로드
  const loadReviews = useCallback(async (page: number = 0, userId?: number | null) => {
    if (!missionId) return;

    try {
      // 커스텀 미션 ID 형식 확인 (custom_${id})
      const isCustomMission = missionId.startsWith('custom_');
      const numericMissionId = isCustomMission 
        ? parseInt(missionId.replace('custom_', ''), 10)
        : parseInt(missionId, 10);
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
  }, [missionId]);

  // 뱃지 소유 여부 확인
  const checkBadgeOwnership = useCallback(async () => {
    if (!missionId) return;

    try {
      // 커스텀 미션 ID 형식 확인 (custom_${id})
      const isCustomMission = missionId.startsWith('custom_');
      const numericMissionId = isCustomMission 
        ? parseInt(missionId.replace('custom_', ''), 10)
        : parseInt(missionId, 10);
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

  // 후기 작성
  const handleSubmitReview = useCallback(async () => {
    if (!missionId || !reviewContent.trim()) return;

    try {
      setSubmittingReview(true);
      // 커스텀 미션 ID 형식 확인 (custom_${id})
      const isCustomMission = missionId.startsWith('custom_');
      const numericMissionId = isCustomMission 
        ? parseInt(missionId.replace('custom_', ''), 10)
        : parseInt(missionId, 10);
      if (isNaN(numericMissionId)) {
        Alert.alert('오류', '잘못된 미션 ID입니다.');
        return;
      }

      const result = await createMissionReview(numericMissionId, {
        content: reviewContent.trim(),
        rating: reviewRating,
      });

      if (result.success) {
        Alert.alert('성공', '후기가 등록되었습니다.');
        setReviewContent('');
        setReviewRating(5);
        setHasWrittenReview(true);
        // 리뷰 목록 새로고침
        await loadReviews(0, currentUserId);
      } else {
        if (result.error?.includes('뱃지') || result.error?.includes('badge')) {
          Alert.alert(
            '후기 작성 불가',
            '이 미션을 완료하고 뱃지를 획득해야 후기를 작성할 수 있습니다.'
          );
        } else {
          Alert.alert('오류', result.error || '후기 등록에 실패했습니다.');
        }
      }
    } catch (error) {
      Alert.alert('오류', '후기 등록 중 오류가 발생했습니다.');
    } finally {
      setSubmittingReview(false);
    }
  }, [missionId, reviewContent, reviewRating, loadReviews, currentUserId]);

  // 초기 데이터 로드
  const loadData = useCallback(async () => {
    setLoading(true);
    // 현재 사용자 정보 가져오기
    const user = await getCurrentUser();
    const userId = user?.id || null;
    setCurrentUserId(userId);

    await Promise.all([loadMission(), loadReviews(0, userId), checkBadgeOwnership()]);
    setLoading(false);
  }, [loadMission, loadReviews, checkBadgeOwnership]);

  // 새로고침
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadMission(), loadReviews(0, currentUserId), checkBadgeOwnership()]);
    setRefreshing(false);
  }, [loadMission, loadReviews, checkBadgeOwnership, currentUserId]);

  // 더 많은 리뷰 로드
  const loadMoreReviews = useCallback(() => {
    if (currentPage < totalPages - 1) {
      loadReviews(currentPage + 1);
    }
  }, [currentPage, totalPages, loadReviews]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return <Loading text="미션 정보를 불러오는 중..." />;
  }

  if (!mission) {
    return (
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <Header
          title="미션 상세"
          showBackButton={true}
          navigation={navigation}
        />
        <EmptyState
          icon="📭"
          title="미션을 찾을 수 없습니다"
          description="해당 미션을 찾을 수 없습니다."
        />
      </ImageBackground>
    );
  }

  const difficulty = getDifficultyLabel(mission.difficultyLevel);

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Header
          title="미션 상세"
          showBackButton={true}
          navigation={navigation}
        />

      <ScrollView
        style={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* 미션 정보 */}
        <View style={styles.missionContainer}>
          <View style={styles.missionHeader}>
            <View style={styles.missionTitleContainer}>
              <Text style={styles.missionTitle}>{mission.title}</Text>
              <View style={styles.missionMeta}>
                <Text style={styles.missionType}>
                  {getMissionTypeLabel(mission.missionType)}
                </Text>
                <View style={[styles.difficultyBadge, { backgroundColor: difficulty.color + '20' }]}>
                  <Text style={[styles.difficultyText, { color: difficulty.color }]}>
                    {difficulty.label}
                  </Text>
                </View>
                {mission.missionType !== 'CUSTOM' && (
                  <Text style={styles.missionExp}>+{mission.expReward} EXP</Text>
                )}
              </View>
            </View>
          </View>

          {mission.description && (
            <Text style={styles.missionDescription}>{mission.description}</Text>
          )}

          <View style={styles.missionStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalReviews}</Text>
              <Text style={styles.statLabel}>후기</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mission.qnaCount || 0}</Text>
              <Text style={styles.statLabel}>Q&A</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mission.badgeDurationDays}일</Text>
              <Text style={styles.statLabel}>뱃지 유효기간</Text>
            </View>
          </View>

          {/* 인증 방식 표시 */}
          <View style={styles.verificationInfo}>
            <Text style={styles.verificationLabel}>인증 방식</Text>
            <Text style={styles.verificationValue}>
              {mission.verificationType === 'GPS'
                ? 'GPS 위치 인증'
                : mission.verificationType === 'TIME'
                ? `시간 인증 (${mission.requiredMinutes}분)`
                : '커뮤니티 인증'}
            </Text>
          </View>
        </View>

        {/* 후기 작성 섹션 */}
        {/* 뱃지가 없는 경우 안내 메시지 */}
        {!hasBadge && (
          <View style={styles.noBadgeSection}>
            <Text style={styles.noBadgeIcon}>🏅</Text>
            <Text style={styles.noBadgeTitle}>후기 작성 안내</Text>
            <Text style={styles.noBadgeDescription}>
              이 미션을 완료하고 유효한 뱃지를 획득하면{'\n'}후기를 작성할 수 있습니다.
            </Text>
          </View>
        )}

        {/* 뱃지가 있고 이미 후기를 작성한 경우 */}
        {hasBadge && hasWrittenReview && (
          <View style={styles.alreadyWrittenSection}>
            <Text style={styles.alreadyWrittenIcon}>✅</Text>
            <Text style={styles.alreadyWrittenText}>
              이 뱃지로 후기를 이미 작성하셨습니다.{'\n'}
              다시 미션을 완료하면 새 후기를 작성할 수 있어요!
            </Text>
          </View>
        )}

        {/* 뱃지가 있고 후기를 작성하지 않은 경우 */}
        {hasBadge && !hasWrittenReview && (
          <View style={styles.writeReviewSection}>
            <Text style={styles.sectionTitle}>후기 작성</Text>
            <Text style={styles.writeReviewHint}>
              미션 뱃지를 보유하고 계시네요! 후기를 남겨주세요.
            </Text>
            {/* 별점 선택 */}
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>별점</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setReviewRating(star)}
                    activeOpacity={0.7}
                    style={styles.starButton}
                  >
                    <Text style={styles.starText}>
                      {star <= reviewRating ? '★' : '☆'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.ratingValue}>{reviewRating}점</Text>
            </View>
            <TextInput
              style={styles.reviewInput}
              placeholder="후기를 작성해주세요..."
              placeholderTextColor={colors.text.tertiary}
              value={reviewContent}
              onChangeText={setReviewContent}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[
                styles.submitReviewButton,
                (!reviewContent.trim() || submittingReview) && styles.submitReviewButtonDisabled,
              ]}
              onPress={handleSubmitReview}
              disabled={!reviewContent.trim() || submittingReview}
              activeOpacity={0.7}
            >
              {submittingReview ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.submitReviewButtonText}>후기 등록</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* 리뷰 목록 */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>후기 ({totalReviews})</Text>

          {reviews.length === 0 ? (
            <EmptyState
              icon="📝"
              title="아직 후기가 없어요"
              description="첫 후기를 남겨보세요!"
            />
          ) : (
            <View style={styles.reviewsList}>
              {reviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}

              {currentPage < totalPages - 1 && (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={loadMoreReviews}
                >
                  <Text style={styles.loadMoreText}>더 보기</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing[4],
    paddingBottom: spacing[20],
  },
  backButtonIcon: {
    width: 24,
    height: 24,
  },
  // 미션 정보
  missionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    marginBottom: spacing[4],
    borderWidth: 2,
    borderColor: '#D4A574',
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  missionTitleContainer: {
    flex: 1,
  },
  missionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xl),
  },
  missionMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    alignItems: 'center',
  },
  missionType: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  difficultyBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  difficultyText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  missionExp: {
    fontSize: typography.fontSize.sm,
    color: colors.blue[600],
    backgroundColor: colors.blue[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  missionDescription: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
    marginBottom: spacing[4],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
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
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  verificationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[4],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  verificationLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  verificationValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  // 리뷰 목록
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[3],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  reviewsSection: {
    marginBottom: spacing[6],
  },
  reviewsList: {
    gap: spacing[3],
  },
  reviewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: '#D4A574',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  reviewAuthorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  reviewAuthorImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  reviewAuthorImagePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewAuthorImageText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[600],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  reviewAuthor: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  ratingStarsDisplay: {
    flexDirection: 'row',
    marginTop: 2,
  },
  ratingStarDisplay: {
    fontSize: 12,
    color: colors.warning,
  },
  reviewDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  reviewContent: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  loadMoreButton: {
    paddingVertical: spacing[3],
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
  },
  loadMoreText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  // 뱃지 없음 안내 섹션
  noBadgeSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    marginBottom: spacing[4],
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D4A574',
  },
  noBadgeIcon: {
    fontSize: 40,
    marginBottom: spacing[2],
  },
  noBadgeTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  noBadgeDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  // 이미 후기 작성 완료 섹션
  alreadyWrittenSection: {
    backgroundColor: 'rgba(232, 245, 233, 0.95)',
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[4],
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  alreadyWrittenIcon: {
    fontSize: 32,
    marginBottom: spacing[2],
  },
  alreadyWrittenText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  // 후기 작성 섹션 스타일
  writeReviewSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 2,
    borderColor: '#D4A574',
  },
  writeReviewHint: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    marginBottom: spacing[3],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  // 별점 선택 스타일
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
    gap: spacing[2],
  },
  ratingLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  starButton: {
    padding: spacing[1],
  },
  starText: {
    fontSize: 28,
    color: colors.warning,
  },
  ratingValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginLeft: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  reviewInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    minHeight: 100,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  submitReviewButton: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitReviewButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  submitReviewButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
});

export default MissionDetailScreen;
