/**
 * 미션 도감 상세 화면
 * 미션 정보와 리뷰를 표시 (API 연동)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
import { MissionReview } from '../../api/missionApi';
import { useMissionDetailScreenContainer, getDifficultyLabel, getMissionTypeLabel } from './MissionDetailScreen.container';

interface MissionDetailScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'MissionDetail'>;
}

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
              accessibilityLabel={`${review.userNickname || '사용자'} 프로필 이미지`}
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

const MissionDetailScreen: React.FC<MissionDetailScreenProps> = ({ navigation, route }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    mission,
    reviews,
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
    setReviewContent,
    setReviewRating,
    handleSubmitReview,
    handleRefresh,
    loadMoreReviews,
  } = useMissionDetailScreenContainer({ navigation, route });


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
          navigation={{
            ...navigation,
            goBack: () => {
              // returnTab이 있으면 해당 탭으로 복원
              if (returnTab) {
                navigation.navigate('Mission', { activeTab: returnTab });
              } else {
                navigation.goBack?.();
              }
            },
          }}
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
          navigation={{
            ...navigation,
            goBack: () => {
              // returnTab이 있으면 해당 탭으로 복원
              if (returnTab) {
                navigation.navigate('Mission', { activeTab: returnTab });
              } else {
                navigation.goBack?.();
              }
            },
          }}
        />

      <ScrollView
        style={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
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
                  <View style={styles.missionExpContainer}>
                    <Image
                      source={require('../../assets/images/sun.png')}
                      style={styles.sunIcon}
                      resizeMode="contain"
                      accessibilityLabel="경험치 아이콘"
                    />
                    <Text style={styles.missionExp}>{mission.expReward} EXP</Text>
                  </View>
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
            <Image
              source={require('../../assets/images/badge.png')}
              style={styles.noBadgeIcon}
              resizeMode="contain"
              accessibilityLabel="뱃지 아이콘"
            />
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
              iconImage={require('../../assets/images/notes.png')}
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
  missionExpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: colors.blue[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.base,
  },
  sunIcon: {
    width: 16,
    height: 16,
  },
  missionExp: {
    fontSize: typography.fontSize.sm,
    color: '#000000',
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
    width: 40,
    height: 40,
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
