/**
 * 커뮤니티 게시판 목록 화면
 * 일반 게시글 + 인증글(VerificationPost) 통합 표시
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Modal, RefreshControl, Alert } from 'react-native';
import { useCommunity } from '../hooks/useCommunity';
import { PostCard } from '../components/specialized';
import { Loading, ErrorBoundary, EmptyState } from '../components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '../utils/designTokens';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { getVerifications, voteVerification, VerificationPost, VerificationStatus } from '../api/missionApi';
import { CommunityPost } from '../types';
import { logError } from '../utils/logger';

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

  // 검색어 디바운싱 (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
    { value: 'all', label: '전체' },
    { value: 'popular', label: '인기' },
  ];

  const selectedFilterLabel = filterOptions.find(opt => opt.value === filter)?.label || '전체';

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
          post.title.toLowerCase().includes(lowerQuery) ||
          post.content.toLowerCase().includes(lowerQuery) ||
          (post.mission_title?.toLowerCase().includes(lowerQuery) ?? false)
      );
    }

    // 필터링
    if (filter === 'popular') {
      // 인기 게시글: 좋아요 + 댓글 수가 높은 순으로 정렬
      allPosts = [...allPosts].sort((a, b) => {
        const aScore = a.like_count + a.comment_count;
        const bScore = b.like_count + b.comment_count;
        return bScore - aScore;
      });
    } else {
      // 전체: 최신순으로 정렬
      allPosts = [...allPosts].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return allPosts;
  }, [posts, convertedVerificationPosts, debouncedSearchQuery, filter, verificationFilter]);

  const handlePostPress = (postId: string) => {
    // 인증글인 경우 인증글 상세 화면으로 이동 (추후 구현)
    if (postId.startsWith('verification_')) {
      const verificationId = parseInt(postId.replace('verification_', ''), 10);
      // 임시: Alert로 알림
      Alert.alert('인증글', `인증글 ID: ${verificationId}`);
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
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>커뮤니티</Text>
      </View>

      {/* 탭 */}
      <View style={styles.tabContainer}>
        <View style={styles.tabWrapper}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.tabActive]}
            onPress={() => setActiveTab('all')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
              전체 게시판
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'mission-group' && styles.tabActive]}
            onPress={handleMissionGroupPress}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'mission-group' && styles.tabTextActive]}>
              미션 도감
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 검색 및 정렬 */}
      {activeTab === 'all' && (
        <View style={styles.filterContainer}>
          <View style={styles.searchContainer}>
            <Image
              source={require('../assets/images/search.png')}
              style={styles.searchIcon}
              resizeMode="contain"
            />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="게시글 검색..."
              placeholderTextColor={colors.text.tertiary}
            />
          </View>

          {/* 인증 필터 탭 */}
          <View style={styles.verificationFilterContainer}>
            <TouchableOpacity
              style={[
                styles.verificationFilterTab,
                verificationFilter === 'all' && styles.verificationFilterTabActive
              ]}
              onPress={() => setVerificationFilter('all')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.verificationFilterText,
                verificationFilter === 'all' && styles.verificationFilterTextActive
              ]}>전체</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.verificationFilterTab,
                verificationFilter === 'pending' && styles.verificationFilterTabActive
              ]}
              onPress={() => setVerificationFilter('pending')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.verificationFilterText,
                verificationFilter === 'pending' && styles.verificationFilterTextActive
              ]}>인증대기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.verificationFilterTab,
                verificationFilter === 'approved' && styles.verificationFilterTabActive
              ]}
              onPress={() => setVerificationFilter('approved')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.verificationFilterText,
                verificationFilter === 'approved' && styles.verificationFilterTextActive
              ]}>인증완료</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.filterSelector}
            onPress={() => setShowFilterModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.filterSelectorText}>{selectedFilterLabel}</Text>
            <Text style={styles.filterSelectorIcon}>▼</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'all' && (
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.green[500]]}
            tintColor={colors.green[500]}
          />
        }
      >
        {filteredPosts.length === 0 ? (
          <EmptyState
            iconImage={require('../assets/images/notes.png')}
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
              />
            ))}
          </View>
        )}
      </ScrollView>
      )}

      {/* 필터 모달 */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>필터 선택</Text>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterOption,
                  filter === option.value && styles.filterOptionActive,
                ]}
                onPress={() => {
                  setFilter(option.value as 'all' | 'popular');
                  setShowFilterModal(false);
                }}
                activeOpacity={0.7}
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
                  <Text style={styles.filterOptionCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    backgroundColor: colors.background.primary,
    paddingTop: spacing[16],
    paddingBottom: spacing[4],
    paddingHorizontal: spacing[5],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
  },
  tabContainer: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  tabWrapper: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.xl,
    padding: spacing[1],
  },
  tab: {
    flex: 1,
    paddingVertical: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    minHeight: 40,
  },
  tabActive: {
    backgroundColor: colors.green[500],
    ...shadows.sm,
  },
  tabText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
  },
  filterContainer: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: spacing[2],
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    padding: 0,
  },
  filterSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
    minHeight: 44,
  },
  filterSelectorText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  filterSelectorIcon: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginLeft: spacing[2],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    width: '80%',
    maxWidth: 300,
    ...shadows.lg,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.md,
    marginBottom: spacing[2],
    backgroundColor: colors.gray[50],
  },
  filterOptionActive: {
    backgroundColor: colors.green[50],
  },
  filterOptionText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  filterOptionTextActive: {
    color: colors.green[700],
    fontWeight: typography.fontWeight.semibold,
  },
  filterOptionCheck: {
    fontSize: typography.fontSize.base,
    color: colors.green[600],
    fontWeight: typography.fontWeight.bold,
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
  // 인증 필터 탭 스타일
  verificationFilterContainer: {
    flexDirection: 'row',
    marginBottom: spacing[3],
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    padding: spacing[1],
  },
  verificationFilterTab: {
    flex: 1,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  verificationFilterTabActive: {
    backgroundColor: colors.primary[500],
  },
  verificationFilterText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  verificationFilterTextActive: {
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default CommunityScreen;

