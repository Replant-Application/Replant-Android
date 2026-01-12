/**
 * 미션세트 상세 화면
 * 미션세트의 미션 목록 확인 및 담기 기능, 리뷰 기능
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  ImageBackground,
  TextInput,
} from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { Header, Loading } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import {
  getMissionSetDetail,
  copyMissionSet,
  MissionSetDetail,
  createReview,
  getMyReview,
  MissionSetReview,
} from '../../api/todolistApi';
import { logError } from '../../utils/logger';
import { useUser } from '../../contexts/UserContext';

interface MissionSetDetailScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'MissionSetDetail'>;
}

const MissionSetDetailScreen: React.FC<MissionSetDetailScreenProps> = ({ navigation, route }) => {
  const { missionSetId } = route.params as { missionSetId: number };
  const { user } = useUser();
  const [missionSet, setMissionSet] = useState<MissionSetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);

  // 리뷰 관련 상태
  const [myReview, setMyReview] = useState<MissionSetReview | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // 미션세트 상세 로딩
  const loadMissionSetDetail = useCallback(async () => {
    try {
      const result = await getMissionSetDetail(missionSetId);
      if (result.success && result.data) {
        setMissionSet(result.data);
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

  // 내 리뷰 로딩
  const loadMyReview = useCallback(async () => {
    try {
      const result = await getMyReview(missionSetId);
      if (result.success && result.data) {
        setMyReview(result.data);
        setReviewRating(result.data.rating);
        setReviewContent(result.data.content || '');
      }
    } catch (error) {
      // 리뷰가 없는 경우 무시
    }
  }, [missionSetId]);

  useEffect(() => {
    loadMissionSetDetail();
    loadMyReview();
  }, [loadMissionSetDetail, loadMyReview]);

  // 미션세트 담기
  const handleCopy = async () => {
    if (!missionSet) return;

    setCopying(true);
    try {
      const result = await copyMissionSet(missionSet.id);
      if (result.success) {
        Alert.alert(
          '담기 완료',
          `"${missionSet.title}" 투두리스트의 미션들이 내 목록에 추가되었습니다.`,
          [{ text: '확인', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('담기 실패', result.error || '미션세트를 담는데 실패했습니다.');
      }
    } catch (error) {
      logError('미션세트 담기 실패', error as Error);
      Alert.alert('오류', '미션세트를 담는 중 문제가 발생했습니다.');
    } finally {
      setCopying(false);
    }
  };

  // 리뷰 제출
  const handleSubmitReview = async () => {
    if (!missionSet) return;

    setSubmittingReview(true);
    try {
      const result = await createReview(missionSet.id, {
        rating: reviewRating,
        content: reviewContent.trim() || undefined,
      });
      if (result.success && result.data) {
        setMyReview(result.data);
        setShowReviewForm(false);
        Alert.alert('완료', '리뷰가 등록되었습니다.');
        // 미션세트 평점 갱신을 위해 다시 로딩
        loadMissionSetDetail();
      } else {
        Alert.alert('오류', result.error || '리뷰 등록에 실패했습니다.');
      }
    } catch (error) {
      logError('리뷰 등록 실패', error as Error);
      Alert.alert('오류', '리뷰 등록 중 문제가 발생했습니다.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // 별점 렌더링
  const renderStars = (rating: number) => {
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
  };

  // 별점 선택 렌더링
  const renderRatingSelector = () => {
    return (
      <View style={styles.ratingSelector}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setReviewRating(star)}
            activeOpacity={0.7}
          >
            <Text style={[styles.ratingStar, star <= reviewRating && styles.ratingStarActive]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // 본인 미션세트인지 확인
  const isOwner = missionSet && user && missionSet.creatorId === user.id;

  if (loading) {
    return <Loading text="투두리스트를 불러오는 중..." />;
  }

  if (!missionSet) {
    return null;
  }

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <Header title="투두리스트 상세" showBackButton={true} navigation={navigation} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 헤더 정보 */}
        <View style={styles.headerCard}>
          <Text style={styles.title}>{missionSet.title}</Text>

          {missionSet.description && (
            <Text style={styles.description}>{missionSet.description}</Text>
          )}

          <View style={styles.metaRow}>
            <Text style={styles.creator}>by {missionSet.creatorNickname}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.missionCount}>{missionSet.missionCount}개 미션</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.ratingContainer}>
              <Text style={styles.stars}>{renderStars(missionSet.averageRating)}</Text>
              <Text style={styles.ratingText}>{missionSet.averageRating.toFixed(1)}</Text>
            </View>
            <Text style={styles.addedCount}>{missionSet.addedCount}명이 담음</Text>
          </View>
        </View>

        {/* 미션 목록 */}
        <View style={styles.missionSection}>
          <Text style={styles.sectionTitle}>포함된 미션</Text>

          {missionSet.missions.length === 0 ? (
            <View style={styles.emptyMissions}>
              <Text style={styles.emptyText}>등록된 미션이 없습니다.</Text>
            </View>
          ) : (
            <View style={styles.missionList}>
              {missionSet.missions.map((mission, index) => (
                <View key={mission.missionId} style={styles.missionItem}>
                  <View style={styles.missionNumber}>
                    <Text style={styles.missionNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.missionTitle}>{mission.missionTitle}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 리뷰 섹션 */}
        {!isOwner && missionSet.isPublic && (
          <View style={styles.reviewSection}>
            <Text style={styles.sectionTitle}>리뷰</Text>

            {myReview ? (
              <View style={styles.myReviewCard}>
                <View style={styles.myReviewHeader}>
                  <Text style={styles.myReviewLabel}>내 리뷰</Text>
                  <Text style={styles.myReviewStars}>{renderStars(myReview.rating)}</Text>
                </View>
                {myReview.content && (
                  <Text style={styles.myReviewContent}>{myReview.content}</Text>
                )}
              </View>
            ) : showReviewForm ? (
              <View style={styles.reviewFormCard}>
                <Text style={styles.reviewFormLabel}>별점을 선택해주세요</Text>
                {renderRatingSelector()}
                <TextInput
                  style={styles.reviewInput}
                  placeholder="리뷰를 작성해주세요 (선택)"
                  placeholderTextColor={colors.text.tertiary}
                  value={reviewContent}
                  onChangeText={setReviewContent}
                  multiline
                  maxLength={200}
                />
                <View style={styles.reviewFormButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowReviewForm(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.submitButton, submittingReview && styles.submitButtonDisabled]}
                    onPress={handleSubmitReview}
                    disabled={submittingReview}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.submitButtonText}>
                      {submittingReview ? '등록 중...' : '등록'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.writeReviewButton}
                onPress={() => setShowReviewForm(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.writeReviewButtonText}>리뷰 작성하기</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* 여백 */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* 하단 버튼 */}
      {!isOwner && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.copyButton, copying && styles.copyButtonDisabled]}
            onPress={handleCopy}
            disabled={copying}
            activeOpacity={0.7}
          >
            <Text style={styles.copyButtonText}>
              {copying ? '담는 중...' : '내 목록에 담기'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing[4],
  },
  headerCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[5],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xl),
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing[3],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base) * 1.4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  creator: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  metaDot: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginHorizontal: spacing[1],
  },
  missionCount: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  stars: {
    fontSize: typography.fontSize.base,
    color: colors.warning,
  },
  ratingText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  addedCount: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  missionSection: {
    marginBottom: spacing[4],
  },
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
  missionList: {
    gap: spacing[2],
  },
  missionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  missionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  missionNumberText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[600],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  missionTitle: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  emptyMissions: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[6],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  reviewSection: {
    marginBottom: spacing[4],
  },
  myReviewCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  myReviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  myReviewLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[600],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  myReviewStars: {
    fontSize: typography.fontSize.base,
    color: colors.warning,
  },
  myReviewContent: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm) * 1.4,
  },
  reviewFormCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  reviewFormLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  ratingSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  ratingStar: {
    fontSize: 32,
    color: colors.gray[300],
  },
  ratingStarActive: {
    color: colors.warning,
  },
  reviewInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.base,
    padding: spacing[3],
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: spacing[3],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  reviewFormButtons: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.base,
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.base,
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  submitButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  writeReviewButton: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary[200],
    borderStyle: 'dashed',
  },
  writeReviewButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing[4],
    paddingBottom: spacing[6],
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  copyButton: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  copyButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  copyButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
});

export default MissionSetDetailScreen;
