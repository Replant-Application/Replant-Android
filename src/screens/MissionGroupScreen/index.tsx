/**
 * 미션 도감 화면
 * 모든 미션 목록 + 미션 상세 정보 + 후기 기능
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
  Image,
  Platform,
  ImageBackground,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { Header, Loading, ErrorBoundary, EmptyState, SimpleTabBar } from '../../components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import {
  getSystemMissions,
  getCustomMissions,
  getMissionReviews,
  createMissionReview,
  Mission,
  MissionReview,
  MissionCategory,
} from '../../api/missionApi';
import { useUser } from '../../contexts/UserContext';

type MissionGroupTab = 'official' | 'custom';

interface MissionGroupScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

// 통합 미션 타입 (공식/커스텀 모두 표시용)
interface UnifiedMission {
  id: number;
  title: string;
  description: string;
  category?: MissionCategory;  // 미션 카테고리 (DAILY_LIFE, GROWTH 등)
  verificationType: string;
  requiredMinutes?: number;
  expReward: number;
  badgeDurationDays: number;
  participantCount?: number;
  isCustom: boolean;
  creatorNickname?: string;
}

const MissionGroupScreen: React.FC<MissionGroupScreenProps> = ({ navigation }) => {
  const { user } = useUser();
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

  // 미션 목록 로드
  const loadMissions = useCallback(async (page: number = 0, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      }
      setError(null);

      if (activeTab === 'official') {
        const result = await getSystemMissions({ page, size: PAGE_SIZE });
        if (result.success && result.data) {
          const unifiedMissions: UnifiedMission[] = (result.data.content || []).map(m => ({
            id: m.id,
            title: m.title,
            description: m.description,
            category: m.category,
            verificationType: m.verificationType,
            requiredMinutes: m.requiredMinutes,
            expReward: m.expReward,
            badgeDurationDays: m.badgeDurationDays,
            participantCount: m.participantCount,
            isCustom: false,
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
      } else {
        const result = await getCustomMissions({ page, size: PAGE_SIZE });
        if (result.success && result.data) {
          const unifiedMissions: UnifiedMission[] = (result.data.content || []).map(m => ({
            id: m.id,
            title: m.title,
            description: m.description,
            category: m.category,
            verificationType: m.verificationType,
            requiredMinutes: m.requiredMinutes,
            expReward: m.expReward,
            badgeDurationDays: m.badgeDurationDays,
            participantCount: m.participantCount,
            isCustom: true,
            creatorNickname: m.creatorNickname,
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
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // 더 보기 (페이지네이션)
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadMissions(nextPage, true);
    }
  }, [hasMore, loading, currentPage, loadMissions]);

  // 리뷰 목록 로드
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

  // 새로고침
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setCurrentPage(0);
    await loadMissions(0, false);
    if (selectedMission) {
      await loadReviews(selectedMission.id);
    }
    setRefreshing(false);
  }, [loadMissions, loadReviews, selectedMission]);

  // 탭 변경시 목록 초기화 및 로드
  useEffect(() => {
    setCurrentPage(0);
    setSelectedMission(null);
    setReviews([]);
    loadMissions(0, false);
  }, [activeTab]);

  useEffect(() => {
    loadMissions(0, false);
  }, []);

  // 미션 선택 시 리뷰 로드
  useEffect(() => {
    if (selectedMission) {
      loadReviews(selectedMission.id);
    } else {
      setReviews([]);
    }
  }, [selectedMission, loadReviews]);

  // 후기 제출
  const handleSubmitReview = async () => {
    if (!reviewContent.trim() || !selectedMission) return;

    try {
      setSubmitting(true);
      const result = await createMissionReview(selectedMission.id, {
        content: reviewContent.trim(),
      });

      if (result.success) {
        Alert.alert('성공', '후기가 등록되었습니다.');
        setReviewContent('');
        setShowReviewModal(false);
        // 리뷰 목록 새로고침
        await loadReviews(selectedMission.id);
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
    } catch (err) {
      Alert.alert('오류', '후기 등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // 인증 타입 한글 변환
  const getVerificationTypeLabel = (type?: string) => {
    switch (type) {
      case 'GPS':
        return 'GPS 인증';
      case 'TIME':
        return '⏱️ 시간 인증';
      case 'COMMUNITY':
        return '커뮤니티 인증';
      default:
        return '✅ 일반 인증';
    }
  };

  // 인증 타입 아이콘
  const getVerificationTypeIcon = (type?: string) => {
    switch (type) {
      case 'GPS':
        return require('../../assets/images/location.png');
      case 'COMMUNITY':
        return require('../../assets/images/high-five.png');
      default:
        return null;
    }
  };

  // 미션 카테고리 한글 변환
  const getMissionCategoryLabel = (category?: MissionCategory) => {
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

  // 미션 아이콘
  const getMissionIcon = (title: string) => {
    return require('../../assets/images/goal.png');
  };

  if (loading) {
    return <Loading text="미션 도감을 불러오는 중..." />;
  }

  if (error) {
    return <ErrorBoundary error={error} />;
  }

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Header
          title="미션 도감"
          leftButton={
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image
                source={require('../../assets/images/left.png')}
                style={styles.backButtonIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          }
          rightButton={
            activeTab === 'custom' ? (
              <TouchableOpacity
                onPress={() => navigation.navigate('CustomMissionCreate' as any)}
                style={styles.createButton}
              >
                <Image
                  source={require('../../assets/images/pencil.png')}
                  style={styles.createButtonIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ) : undefined
          }
        />

        {/* 공식미션 / 커스텀미션 탭 */}
        <View style={styles.tabContainer}>
          <SimpleTabBar
            tabs={[
              { key: 'official', label: '공식 미션' },
              { key: 'custom', label: '커스텀 미션' },
            ]}
            activeTab={activeTab}
            onTabChange={(key) => setActiveTab(key as MissionGroupTab)}
            style={styles.tabBar}
          />
        </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {missions.length === 0 ? (
          <EmptyState
            iconImage={require('../../assets/images/goal.png')}
            title="미션이 없어요"
            description="현재 등록된 미션이 없습니다."
          />
        ) : (
          <>
            {/* 미션 목록 */}
            <View style={styles.missionListContainer}>
              <View style={styles.infoBox}>
                <Image
                  source={require('../../assets/images/RePlant_Logo.png')}
                  style={styles.logoIcon}
                  resizeMode="contain"
                />
                <Text style={styles.infoText}>
                  미션을 선택하면 상세 정보와 후기를 볼 수 있어요
                </Text>
              </View>

              {missions.map((mission) => (
                <View key={mission.id}>
                  <TouchableOpacity
                    style={[
                      styles.missionCard,
                      selectedMission?.id === mission.id && styles.missionCardSelected,
                    ]}
                    onPress={() => {
                      setSelectedMission(
                        selectedMission?.id === mission.id ? null : mission
                      );
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.missionHeader}>
                      <View style={styles.missionInfo}>
                        <View style={styles.missionTitleRow}>
                          <Image
                            source={getMissionIcon(mission.title)}
                            style={styles.missionIcon}
                            resizeMode="contain"
                          />
                          <Text style={styles.missionTitle}>{mission.title}</Text>
                          {mission.category && (
                            <View style={styles.missionTypeBadge}>
                              <Text style={styles.missionTypeText}>
                                {getMissionCategoryLabel(mission.category)}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.missionDescription} numberOfLines={2}>
                          {mission.description}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.missionContent}>
                      <View style={styles.missionVerificationInfo}>
                        {getVerificationTypeIcon(mission.verificationType) && (
                          <Image
                            source={getVerificationTypeIcon(mission.verificationType)!}
                            style={styles.verificationIcon}
                            resizeMode="contain"
                          />
                        )}
                        <Text style={styles.missionVerificationText}>
                          {getVerificationTypeLabel(mission.verificationType)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.missionFooter}>
                      <View style={styles.missionStats}>
                        <View style={styles.statItem}>
                          <Image
                            source={require('../../assets/images/sun.png')}
                            style={styles.statIcon}
                            resizeMode="contain"
                          />
                          <Text style={styles.statText}>{mission.expReward} EXP</Text>
                        </View>
                        <View style={styles.statItem}>
                          <Image
                            source={require('../../assets/images/high-five.png')}
                            style={styles.statIcon}
                            resizeMode="contain"
                          />
                          <Text style={styles.statText}>
                            참여 {mission.participantCount || 0}명
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* 선택된 미션의 상세 정보를 해당 카드 바로 아래에 표시 */}
                  {selectedMission?.id === mission.id && (
                    <View style={styles.inlineDetailContainer}>
                      {/* 미션 상세 정보 */}
                      <View style={styles.inlineDetailCard}>
                        <Text style={styles.detailTitle}>미션 정보</Text>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>미션명</Text>
                          <Text style={styles.detailValue}>{selectedMission.title}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>설명</Text>
                          <Text style={styles.detailValue}>{selectedMission.description}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>인증 방식</Text>
                          <Text style={styles.detailValue}>
                            {getVerificationTypeLabel(selectedMission.verificationType)}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>보상</Text>
                          <Text style={styles.detailValue}>
                            {selectedMission.expReward} EXP + 뱃지 ({selectedMission.badgeDurationDays}일)
                          </Text>
                        </View>
                        {selectedMission.requiredMinutes && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>필요 시간</Text>
                            <Text style={styles.detailValue}>{selectedMission.requiredMinutes}분</Text>
                          </View>
                        )}

                        <TouchableOpacity
                          style={styles.detailButton}
                          onPress={() => navigation.navigate('MissionDetail', { missionId: String(selectedMission.id) })}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.detailButtonText}>미션 상세 보기</Text>
                        </TouchableOpacity>
                      </View>

                      {/* 후기 섹션 - 주석처리 (미션 상세에서 뱃지 소유자만 작성 가능하도록 변경) */}
                      {/* <View style={styles.inlineReviewSection}>
                          <View style={styles.reviewSectionHeader}>
                            <Text style={styles.sectionTitle}>미션 후기</Text>
                            <TouchableOpacity
                              style={styles.writeReviewButton}
                              onPress={() => setShowReviewModal(true)}
                              activeOpacity={0.7}
                            >
                              <Text style={styles.writeReviewButtonText}>후기 작성</Text>
                            </TouchableOpacity>
                          </View>
                          <Text style={styles.reviewHint}>
                            ※ 미션을 완료하고 뱃지를 획득해야 후기를 작성할 수 있습니다
                          </Text>

                          {reviewsLoading ? (
                            <View style={styles.loadingContainer}>
                              <ActivityIndicator size="large" color={colors.primary[500]} />
                            </View>
                          ) : reviews.length === 0 ? (
                            <EmptyState
                              icon="📝"
                              title="아직 후기가 없어요"
                              description="첫 번째 후기를 남겨보세요!"
                            />
                          ) : (
                            <View style={styles.reviewList}>
                              {reviews.map((review) => (
                                <View key={review.id} style={styles.reviewCard}>
                                  <View style={styles.reviewHeader}>
                                    <View style={styles.reviewAvatar}>
                                      <Text style={styles.reviewAvatarText}>
                                        {review.userNickname.charAt(0).toUpperCase()}
                                      </Text>
                                    </View>
                                    <View style={styles.reviewAuthorInfo}>
                                      <Text style={styles.reviewAuthor}>{review.userNickname}</Text>
                                      <Text style={styles.reviewDate}>
                                        {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                                      </Text>
                                    </View>
                                  </View>
                                  <Text style={styles.reviewContent}>{review.content}</Text>
                                </View>
                              ))}
                            </View>
                          )}
                        </View> */}
                      </View>
                  )}
                </View>
              ))}
            </View>

            {/* 페이지네이션: 더 보기 버튼 */}
            {hasMore && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={loadMore}
                activeOpacity={0.7}
              >
                <Text style={styles.loadMoreButtonText}>더 보기</Text>
              </TouchableOpacity>
            )}

            {/* 현재 페이지 정보 */}
            {totalPages > 1 && (
              <Text style={styles.pageInfo}>
                {currentPage + 1} / {totalPages} 페이지
              </Text>
            )}

          </>
        )}
      </ScrollView>

      {/* 후기 작성 모달 */}
      <Modal
        visible={showReviewModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>후기 작성</Text>
              <TouchableOpacity
                onPress={() => setShowReviewModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalMissionTitle}>
              {selectedMission?.title}
            </Text>

            <TextInput
              style={styles.reviewInput}
              multiline
              numberOfLines={5}
              placeholder="미션을 수행하면서 느낀 점, 팁 등을 공유해주세요..."
              placeholderTextColor={colors.text.tertiary}
              value={reviewContent}
              onChangeText={setReviewContent}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowReviewModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!reviewContent.trim() || submitting) && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmitReview}
                disabled={!reviewContent.trim() || submitting}
                activeOpacity={0.7}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>등록</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  backButtonIcon: {
    width: 24,
    height: 24,
    tintColor: colors.text.primary,
  },
  createButton: {
    padding: spacing[2],
  },
  createButtonIcon: {
    width: 24,
    height: 24,
  },
  tabContainer: {
    paddingHorizontal: spacing[3],
    paddingTop: spacing[2],
    paddingBottom: spacing[1],
  },
  tabBar: {
    marginBottom: 0,
  },
  content: {
    flex: 1,
    padding: spacing[4],
    paddingBottom: spacing[20], // 하단 탭바 높이 + 여유 공간
  },
  loadMoreButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  loadMoreButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  pageInfo: {
    textAlign: 'center',
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing[4],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xl),
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
    marginBottom: spacing[4],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  missionListContainer: {
    marginBottom: spacing[4],
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.base,
    padding: spacing[3],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.primary[200],
    gap: spacing[4],
  },
  logoIcon: {
    width: 24,
    height: 24,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.primary[700],
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  missionCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[3],
    marginBottom: spacing[1],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  missionCardSelected: {
    borderColor: colors.primary[500],
    borderWidth: 2,
    backgroundColor: colors.primary[50],
  },
  missionHeader: {
    marginBottom: spacing[2],
  },
  missionInfo: {
    flex: 1,
  },
  missionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
    gap: spacing[1.5],
  },
  missionIcon: {
    width: 20,
    height: 20,
  },
  missionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    flex: 1,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  missionTypeBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.base,
  },
  missionTypeText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  missionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    marginBottom: spacing[2],
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  missionContent: {
    marginBottom: spacing[2],
  },
  missionVerificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    backgroundColor: colors.primary[100],
    borderRadius: borderRadius.base,
    borderWidth: 1.5,
    borderColor: colors.primary[500],
    alignSelf: 'flex-start',
    gap: spacing[1],
  },
  verificationIcon: {
    width: 14,
    height: 14,
  },
  missionVerificationText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[800],
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  missionFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing[2],
  },
  missionStats: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  statIcon: {
    width: 16,
    height: 16,
  },
  statText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  detailContainer: {
    marginTop: spacing[4],
  },
  inlineDetailContainer: {
    marginTop: spacing[2],
    marginBottom: spacing[3],
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[400],
    marginLeft: spacing[2],
    paddingLeft: spacing[3],
  },
  inlineDetailCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  inlineReviewSection: {
    marginBottom: spacing[2],
  },
  detailCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  detailTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[4],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  detailRow: {
    marginBottom: spacing[3],
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  detailValue: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  detailButton: {
    backgroundColor: colors.green[500],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing[4],
  },
  detailButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  reviewSection: {
    marginBottom: spacing[6],
  },
  reviewSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  writeReviewButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
  },
  writeReviewButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  reviewHint: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: spacing[4],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  loadingContainer: {
    padding: spacing[8],
    alignItems: 'center',
  },
  reviewList: {
    gap: spacing[3],
  },
  reviewCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  reviewAvatarText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[600],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  reviewAuthorInfo: {
    flex: 1,
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
    marginTop: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  reviewContent: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing[5],
    paddingBottom: spacing[8],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xl),
  },
  modalCloseButton: {
    padding: spacing[2],
  },
  modalCloseText: {
    fontSize: typography.fontSize.xl,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xl),
  },
  modalMissionTitle: {
    fontSize: typography.fontSize.base,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing[4],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  reviewInput: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    minHeight: 150,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing[4],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.gray[100],
    paddingVertical: spacing[4],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[4],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  submitButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.inverse,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
});

export default MissionGroupScreen;
