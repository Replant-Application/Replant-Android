/**
 * 커뮤니티 게시판 목록 화면
 * 일반 게시글 + 인증글(VerificationPost) 통합 표시
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Modal, RefreshControl, Alert, Platform, ImageBackground } from 'react-native';
import { useCommunity } from '../../hooks/useCommunity';
import { PostCard } from '../../components/specialized';
import { Loading, ErrorBoundary, EmptyState, SimpleTabBar, Header } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { getVerifications, voteVerification, VerificationPost, VerificationStatus } from '../../api/missionApi';
import { CommunityPost } from '../../types';
import { logError } from '../../utils/logger';
import { getHiddenPosts, hidePost } from '../../utils/hiddenContentStorage';

interface CommunityScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

type CommunityTab = 'all' | 'mission-group';
type VerificationFilter = 'all' | 'pending' | 'approved';

const CommunityScreen: React.FC<CommunityScreenProps> = ({ navigation }) => {
  const { posts, loading, error, toggleLike, loadPosts } = useCommunity();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'popular'>('all');
  const [activeTab, setActiveTab] = useState<CommunityTab>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // 인증글 관련 상태
  const [verificationPosts, setVerificationPosts] = useState<VerificationPost[]>([]);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>('all');

  // 숨긴 게시글 ID 목록
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>([]);

  // 검색어 디바운싱 (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 숨긴 게시글 목록 로드
  useEffect(() => {
    const loadHiddenPosts = async () => {
      try {
        const hiddenIds = await getHiddenPosts();
        setHiddenPostIds(hiddenIds);
      } catch (error) {
        logError('숨긴 게시글 목록 로드 실패', error as Error);
      }
    };
    loadHiddenPosts();
  }, []);

  // 인증글 로딩
  const loadVerificationPosts = useCallback(async () => {
    setVerificationLoading(true);
    try {
      const statusParam = verificationFilter === 'all' ? undefined :
        verificationFilter === 'pending' ? 'PENDING' : 'APPROVED';

      const result = await getVerifications({
        status: statusParam as VerificationStatus | undefined,
        page: 0,
        size: 50
      });

      if (result.success && result.data) {
        setVerificationPosts(result.data.content);
      }
    } catch (err) {
      logError('인증글 로딩 실패', err as Error);
    } finally {
      setVerificationLoading(false);
    }
  }, [verificationFilter]);

  // 인증글 투표 처리
  const handleVerificationVote = useCallback(async (verificationId: number) => {
    try {
      const result = await voteVerification(verificationId, { vote: 'APPROVE' });

      if (result.success && result.data) {
        // 로컬 상태 업데이트
        setVerificationPosts(prev =>
          prev.map(post => {
            if (post.id === verificationId) {
              return {
                ...post,
                approveCount: result.data!.approveCount,
                myVote: 'APPROVE',
                status: result.data!.status,
              };
            }
            return post;
          })
        );

        if (result.data.status === 'APPROVED') {
          Alert.alert('인증 완료!', '투표 임계값에 도달하여 인증이 완료되었습니다.');
        }
      } else {
        Alert.alert('투표 실패', result.error || '투표에 실패했습니다.');
      }
    } catch (err) {
      logError('투표 실패', err as Error);
      Alert.alert('오류', '투표 중 문제가 발생했습니다.');
    }
  }, []);

  // 인증글 필터 변경 시 다시 로딩
  useEffect(() => {
    loadVerificationPosts();
  }, [loadVerificationPosts]);

  // Pull-to-Refresh 핸들러
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadPosts(), loadVerificationPosts()]);
    } finally {
      setRefreshing(false);
    }
  }, [loadPosts, loadVerificationPosts]);

  const filterOptions = [
    { value: 'all', label: '최신순' },
    { value: 'popular', label: '인기순' },
  ];

  // VerificationPost를 CommunityPost 형태로 변환
  const convertedVerificationPosts = useMemo((): (CommunityPost & { isVerificationPost: boolean; verificationId: number })[] => {
    return verificationPosts.map(vPost => ({
      id: `verification_${vPost.id}`,
      post_id: `verification_${vPost.id}`,
      author: vPost.userNickname,
      author_id: String(vPost.userId),
      author_nickname: vPost.userNickname,
      title: `[인증] ${vPost.missionTitle}`,
      content: vPost.content,
      images: vPost.imageUrls,
      tags: [],
      category: '인증',
      mission_id: vPost.mission?.id ? String(vPost.mission.id) : '',
      mission_title: vPost.missionTitle,
      mission_emoji: '✅',
      created_at: vPost.createdAt,
      like_count: vPost.approveCount,
      comment_count: 0,
      scrap_count: 0,
      is_liked: vPost.myVote === 'APPROVE',
      is_scrapped: false,
      verified: vPost.status === 'APPROVED',
      isVerificationPost: true,
      verificationId: vPost.id,
    }));
  }, [verificationPosts]);

  // 검색 및 필터링 (디바운싱된 검색어 사용)
  const filteredPosts = useMemo(() => {
    // 일반 게시글과 인증글 통합
    let allPosts: (CommunityPost & { isVerificationPost?: boolean; verificationId?: number })[] = [
      ...posts.map(p => ({ ...p, isVerificationPost: false as const })),
      ...convertedVerificationPosts
    ];

    // 숨긴 글 필터링
    allPosts = allPosts.filter(post => !hiddenPostIds.includes(post.post_id));

    // 인증 필터 적용
    if (verificationFilter === 'pending') {
      allPosts = allPosts.filter(post => post.isVerificationPost && !post.verified);
    } else if (verificationFilter === 'approved') {
      allPosts = allPosts.filter(post => post.isVerificationPost && post.verified);
    }

    // 검색 (디바운싱 적용)
    if (debouncedSearchQuery.trim()) {
      const lowerQuery = debouncedSearchQuery.toLowerCase();
      allPosts = allPosts.filter(
        post =>
          (post.title?.toLowerCase() || '').includes(lowerQuery) ||
          (post.content?.toLowerCase() || '').includes(lowerQuery) ||
          (post.mission_title?.toLowerCase()?.includes(lowerQuery) ?? false)
      );
    }

    // 필터링
    if (filter === 'popular') {
      // 인기 게시글: 좋아요 + 댓글 수가 높은 순으로 정렬
      allPosts = [...allPosts].sort((a, b) => {
        const aScore = (a.like_count || 0) + (a.comment_count || 0);
        const bScore = (b.like_count || 0) + (b.comment_count || 0);
        return bScore - aScore;
      });
    } else {
      // 전체: 최신순으로 정렬
      allPosts = [...allPosts].sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
    }

    return allPosts;
  }, [posts, convertedVerificationPosts, debouncedSearchQuery, filter, verificationFilter, hiddenPostIds]);

  // 게시글 숨기기 처리
  const handleHidePost = useCallback(async (postId: string) => {
    try {
      await hidePost(postId);
      setHiddenPostIds(prev => [...prev, postId]);
    } catch (error) {
      logError('게시글 숨기기 실패', error as Error);
      Alert.alert('오류', '게시글을 숨기는 중 문제가 발생했습니다.');
    }
  }, []);

  const handlePostPress = (postId: string) => {
    // 인증글인 경우 인증글 상세 화면으로 이동
    if (postId.startsWith('verification_')) {
      const verificationId = parseInt(postId.replace('verification_', ''), 10);
      navigation.navigate('VerificationPostDetail' as any, { verificationId });
      return;
    }
    navigation.navigate('CommunityPostDetail', { postId });
  };

  // 좋아요/투표 핸들러 (인증글: 투표, 일반글: 좋아요)
  const handleLike = async (postId: string) => {
    if (postId.startsWith('verification_')) {
      // 인증글 투표
      const verificationId = parseInt(postId.replace('verification_', ''), 10);
      await handleVerificationVote(verificationId);
    } else {
      // 일반 게시글 좋아요
      await toggleLike(postId);
    }
  };

  if (loading || verificationLoading) {
    return <Loading text="게시글을 불러오는 중..." />;
  }

  if (error) {
    return <ErrorBoundary error={error} />;
  }

  // 미션 그룹 화면으로 이동
  const handleMissionGroupPress = () => {
    navigation.navigate('MissionGroup');
  };

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* 헤더 */}
      <Header title="커뮤니티" showBackButton={false} navigation={navigation} />

      {/* 탭 */}
      <View style={styles.tabBarContainer}>
        <SimpleTabBar
          tabs={[
            { key: 'all', label: '전체 게시판' },
            { key: 'todo-share', label: '투두 공유' },
          ]}
          activeTab={activeTab}
          onTabChange={(key) => {
            if (key === 'todo-share') {
              navigation.navigate('MissionSetList' as any);
            } else {
              setActiveTab(key as CommunityTab);
            }
          }}
          style={styles.tabBar}
        />
      </View>

      {/* 검색 및 정렬 */}
      {activeTab === 'all' && (
        <View style={styles.filterContainer}>
          {/* 검색창과 필터 버튼 */}
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <Image
                source={require('../../assets/images/search.png')}
                style={styles.searchIcon}
                resizeMode="contain"
                accessibilityElementsHidden={true}
              />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="게시글 검색..."
                placeholderTextColor={colors.text.tertiary}
                accessibilityLabel="게시글 검색"
                accessibilityHint="게시글을 검색하려면 입력하세요"
                allowFontScaling={true}
              />
            </View>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="필터"
              accessibilityHint="게시글 필터 옵션 열기"
              accessibilityState={{ selected: verificationFilter !== 'all' || filter !== 'all' }}
            >
              <Image
                source={require('../../assets/images/filter.png')}
                style={styles.filterIcon}
                resizeMode="contain"
                accessibilityElementsHidden={true}
              />
              {(verificationFilter !== 'all' || filter !== 'all') && (
                <View style={styles.filterBadge} accessibilityElementsHidden={true} />
              )}
            </TouchableOpacity>
          </View>

          {/* 인증 필터 칩 (선택된 경우에만 표시) */}
          {verificationFilter !== 'all' && (
            <View style={styles.chipContainer}>
              <TouchableOpacity
                style={styles.chip}
                onPress={() => setVerificationFilter('all')}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${verificationFilter === 'pending' ? '인증대기' : '인증완료'} 필터 제거`}
              >
                <Text style={styles.chipText}>
                  {verificationFilter === 'pending' ? '인증대기' : '인증완료'}
                </Text>
                <Text style={styles.chipClose} accessibilityElementsHidden={true}>×</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {activeTab === 'all' && (
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
          />
        }
      >
        {filteredPosts.length === 0 ? (
          <EmptyState
            iconImage={require('../../assets/images/notes.png')}
            title="아직 게시글이 없어요"
            description="미션을 완료하고 커뮤니티에 공유해보세요!"
          />
        ) : (
          <View style={styles.postsList}>
            {filteredPosts.map(post => (
              <PostCard
                key={post.post_id}
                post={post}
                onPress={handlePostPress}
                onLike={handleLike}
                onHide={handleHidePost}
              />
            ))}
          </View>
        )}
      </ScrollView>
      )}

      {/* GENERAL 글쓰기 FAB */}
      {activeTab === 'all' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CommunityPostCreate' as any, { type: 'GENERAL' })}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="게시글 작성"
          accessibilityHint="새 게시글을 작성합니다"
        >
          <Image
            source={require('../../assets/images/pencil.png')}
            style={styles.fabIconImage}
            resizeMode="contain"
            accessibilityElementsHidden={true}
          />
        </TouchableOpacity>
      )}

      {/* 필터 모달 */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => setShowFilterModal(false)}
          />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>필터 선택</Text>
            
            {/* 정렬 옵션 */}
            <Text style={styles.modalSectionTitle}>정렬</Text>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterOption,
                  filter === option.value && styles.filterOptionActive,
                ]}
                onPress={() => {
                  setFilter(option.value as 'all' | 'popular');
                }}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={option.label}
                accessibilityState={{ selected: filter === option.value }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filter === option.value && styles.filterOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {filter === option.value && (
                  <Text style={styles.filterOptionCheck} accessibilityElementsHidden={true}>✓</Text>
                )}
              </TouchableOpacity>
            ))}

            {/* 인증 상태 필터 */}
            <Text style={styles.modalSectionTitle}>인증 상태</Text>
            {[
              { key: 'all', label: '전체' },
              { key: 'pending', label: '인증대기' },
              { key: 'approved', label: '인증완료' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterOption,
                  verificationFilter === option.key && styles.filterOptionActive,
                ]}
                onPress={() => {
                  setVerificationFilter(option.key as VerificationFilter);
                }}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={option.label}
                accessibilityState={{ selected: verificationFilter === option.key }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    verificationFilter === option.key && styles.filterOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {verificationFilter === option.key && (
                  <Text style={styles.filterOptionCheck} accessibilityElementsHidden={true}>✓</Text>
                )}
              </TouchableOpacity>
            ))}

            {/* 적용 버튼 */}
            <TouchableOpacity
              style={styles.modalApplyButton}
              onPress={() => setShowFilterModal(false)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="필터 적용"
            >
              <Text style={styles.modalApplyButtonText}>적용</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBarContainer: {
    paddingHorizontal: spacing[3],
    paddingTop: spacing[2],
    paddingBottom: spacing[3],
  },
  tabBar: {
    marginBottom: 0,
  },
  filterContainer: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[1],
    paddingBottom: spacing[3],

  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    borderWidth: 1,
    borderColor: '#D4A574',
  },
  filterButton: {
    backgroundColor: '#8B6F47',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#D4A574',
  },
  filterIcon: {
    width: 26,
    height: 26,
    tintColor: colors.white,
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.white,
  },
  chipContainer: {
    flexDirection: 'row',
    marginTop: spacing[2],
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[100],
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderWidth: 1,
    borderColor: colors.primary[500],
    gap: spacing[1],
  },
  chipText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[700],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  chipClose: {
    fontSize: typography.fontSize.base,
    color: colors.primary[700],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: 16,
  },
  searchIcon: {
    width: 16,
    height: 16,
    marginRight: spacing[2],
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    padding: 0,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  filterSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
    alignSelf: 'flex-start',
  },
  filterSelectorText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  filterSelectorIcon: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginLeft: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    width: '85%',
    maxWidth: 350,
    borderWidth: 1,
    borderColor: colors.border.light,
    maxHeight: '80%',
    zIndex: 1,
    elevation: 5,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[4],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xl),
  },
  modalSectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginTop: spacing[4],
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.base,
    marginBottom: spacing[2],
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  filterOptionActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  filterOptionText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  filterOptionTextActive: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  filterOptionCheck: {
    fontSize: typography.fontSize.base,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  modalApplyButton: {
    marginTop: spacing[6],
    paddingVertical: spacing[3],
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.base,
    alignItems: 'center',
  },
  modalApplyButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  content: {
    flex: 1,
    padding: spacing[4],
    paddingBottom: spacing[20], // 하단 탭바 높이 + 여유 공간
  },
  postsList: {
    gap: spacing[3],
    paddingBottom: spacing[16], // 추가 하단 여백
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 100,
  },
  fabIcon: {
    fontSize: 28,
    color: colors.white,
    fontWeight: '300',
    lineHeight: 32,
  },
  fabIconImage: {
    width: 24,
    height: 24,
    tintColor: colors.white,
  },
});

export default CommunityScreen;

