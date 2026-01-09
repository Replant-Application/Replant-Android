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
} from 'react-native';
import { Loading, Header, EmptyState } from '../../components/ui';
import { formatDateKorean } from '../../utils/dateUtils';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import {
  getSystemMission,
  getMissionReviews,
  createMissionReview,
  SystemMission,
  MissionReview,
} from '../../api/missionApi';
import { getMyBadges, Badge } from '../../api/badgeApi';

interface MissionDetailScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'MissionDetail'>;
}

// 난이도 라벨 반환
const getDifficultyLabel = (type: string): { label: string; color: string } => {
  switch (type) {
    case 'DAILY':
      return { label: '쉬움', color: colors.success };
    case 'WEEKLY':
      return { label: '보통', color: colors.warning };
    case 'MONTHLY':
      return { label: '어려움', color: colors.error };
    default:
      return { label: '일반', color: colors.text.secondary };
  }
};

// 미션 타입 라벨 반환
const getMissionTypeLabel = (type: string): string => {
  switch (type) {
    case 'DAILY':
      return '일일 미션';
    case 'WEEKLY':
      return '주간 미션';
    case 'MONTHLY':
      return '월간 미션';
    default:
      return '미션';
  }
};

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
          <Text style={styles.reviewAuthor}>{review.userNickname}</Text>
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

  const [mission, setMission] = useState<SystemMission | null>(null);
  const [reviews, setReviews] = useState<MissionReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  // 뱃지 확인 및 후기 작성 상태
  const [hasBadge, setHasBadge] = useState(false);
  const [reviewContent, setReviewContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // 미션 데이터 로드
  const loadMission = useCallback(async () => {
    if (!missionId) return;

    try {
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
    } catch (error) {
      Alert.alert('오류', '미션 정보를 불러오는데 실패했습니다.');
    }
  }, [missionId]);

  // 리뷰 데이터 로드
  const loadReviews = useCallback(async (page: number = 0) => {
    if (!missionId) return;

    try {
      const numericMissionId = parseInt(missionId, 10);
      if (isNaN(numericMissionId)) return;

      const result = await getMissionReviews(numericMissionId, { page, size: 10 });
      if (result.success && result.data) {
        if (page === 0) {
          setReviews(result.data.content);
        } else {
          setReviews(prev => [...prev, ...result.data!.content]);
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
      const numericMissionId = parseInt(missionId, 10);
      if (isNaN(numericMissionId)) return;

      const result = await getMyBadges();
      if (result.success && result.data) {
        const badges = result.data.badges || [];
        // 해당 미션에 대한 유효한 뱃지가 있는지 확인
        const hasMissionBadge = badges.some((badge: Badge) => {
          const badgeMissionId = badge.mission?.id || badge.customMission?.id;
          return badgeMissionId === numericMissionId && !badge.isExpired;
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
      const numericMissionId = parseInt(missionId, 10);
      if (isNaN(numericMissionId)) {
        Alert.alert('오류', '잘못된 미션 ID입니다.');
        return;
      }

      const result = await createMissionReview(numericMissionId, {
        content: reviewContent.trim(),
      });

      if (result.success) {
        Alert.alert('성공', '후기가 등록되었습니다.');
        setReviewContent('');
        // 리뷰 목록 새로고침
        await loadReviews(0);
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
  }, [missionId, reviewContent, loadReviews]);

  // 초기 데이터 로드
  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadMission(), loadReviews(0), checkBadgeOwnership()]);
    setLoading(false);
  }, [loadMission, loadReviews, checkBadgeOwnership]);

  // 새로고침
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadMission(), loadReviews(0)]);
    setRefreshing(false);
  }, [loadMission, loadReviews]);

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
      <View style={styles.container}>
        <Header
          title="미션 상세"
          leftButton={
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image
                source={require('../../assets/images/left.png')}
                style={styles.backButtonIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          }
        />
        <EmptyState
          icon="📭"
          title="미션을 찾을 수 없습니다"
          description="해당 미션을 찾을 수 없습니다."
        />
      </View>
    );
  }

  const difficulty = getDifficultyLabel(mission.type);

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
              source={require('../../assets/images/left.png')}
              style={styles.backButtonIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        }
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
                  {getMissionTypeLabel(mission.type)}
                </Text>
                <View style={[styles.difficultyBadge, { backgroundColor: difficulty.color + '20' }]}>
                  <Text style={[styles.difficultyText, { color: difficulty.color }]}>
                    {difficulty.label}
                  </Text>
                </View>
                <Text style={styles.missionExp}>+{mission.expReward} EXP</Text>
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

        {/* 후기 작성 섹션 (뱃지 소유자만) */}
        {hasBadge && (
          <View style={styles.writeReviewSection}>
            <Text style={styles.sectionTitle}>후기 작성</Text>
            <Text style={styles.writeReviewHint}>
              미션 뱃지를 보유하고 계시네요! 후기를 남겨주세요.
            </Text>
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
    paddingBottom: spacing[20], // 하단 탭바 높이 + 여유 공간
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
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    padding: spacing[4],
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
  // 후기 작성 섹션 스타일
  writeReviewSection: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.primary[200],
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
