/**
 * 커뮤니티 게시판 목록 화면
 * 일반 게시글 + 인증글(VerificationPost) 통합 표시
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Modal, RefreshControl, Platform, ImageBackground, ActivityIndicator } from 'react-native';
import { useCommunity } from '../../hooks/useCommunity';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { PostCard } from '../../components/specialized';
import { Loading, ErrorBoundary, EmptyState, SimpleTabBar, Header, AlertModal } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
// getVerifications는 제거됨 - GET /api/community/posts가 일반글과 인증글 모두 반환
import { CommunityPost } from '../../types';
import { logError } from '../../utils/logger';
import { getHiddenPosts, hidePost } from '../../utils/hiddenContentStorage';
import { getMissionSets, searchMissionSets, copyMissionSet, getMyMissionSets, updateMissionSet, MissionSetSimple } from '../../api/todolistApi';
import { SCREEN_NAMES } from '../../utils/constants';
import { CommunityScreenProps, CommunityTab, VerificationFilter, PostFilter } from './CommunityScreen.types';
import { FILTER_OPTIONS } from './CommunityScreen.constants';
import MissionSetList from './components/MissionSetList';

const CommunityScreen: React.FC<CommunityScreenProps> = ({ navigation }) => {
  const { posts, loading, error, toggleLike, loadPosts } = useCommunity();
  const { showError, showSuccess, showInfo, handleApiError } = useErrorHandler();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'popular'>('all');
  const [activeTab, setActiveTab] = useState<CommunityTab>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // 인증 필터 상태 (GET /api/community/posts에서 이미 일반글과 인증글 모두 반환)
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>('all');

  // 숨긴 게시글 ID 목록
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>([]);
  // AlertModal 상태
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // 투두 공유 (미션세트) 관련 상태
  const [missionSets, setMissionSets] = useState<MissionSetSimple[]>([]);
  const [missionSetLoading, setMissionSetLoading] = useState(false);
  const [missionSetSearchQuery, setMissionSetSearchQuery] = useState('');
  const [debouncedMissionSetSearchQuery, setDebouncedMissionSetSearchQuery] = useState('');
  const [missionSetSortBy, setMissionSetSortBy] = useState<'popular' | 'latest'>('popular');
  const [showMissionSetFilterModal, setShowMissionSetFilterModal] = useState(false);

  // 투두리스트 공유 모달 관련 상태
  const [showShareModal, setShowShareModal] = useState(false);
  const [myMissionSets, setMyMissionSets] = useState<MissionSetSimple[]>([]);
  const [myMissionSetsLoading, setMyMissionSetsLoading] = useState(false);
  const [sharingId, setSharingId] = useState<number | null>(null);

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

  // 미션세트 검색어 디바운싱
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMissionSetSearchQuery(missionSetSearchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [missionSetSearchQuery]);

  // 미션세트 목록 로드
  const loadMissionSets = useCallback(async () => {
    try {
      setMissionSetLoading(true);
      let result;
      if (debouncedMissionSetSearchQuery.trim()) {
        result = await searchMissionSets({
          keyword: debouncedMissionSetSearchQuery,
          page: 0,
          size: 50,
          sortBy: missionSetSortBy,
        });
      } else {
        result = await getMissionSets({ page: 0, size: 50, sortBy: missionSetSortBy });
      }

      if (result.success && result.data) {
        setMissionSets(result.data.content);
      }
    } catch (error) {
      logError('미션세트 로딩 실패', error as Error);
    } finally {
      setMissionSetLoading(false);
    }
  }, [debouncedMissionSetSearchQuery, missionSetSortBy]);

  // 탭 변경 시 미션세트 로드
  useEffect(() => {
    if (activeTab === 'todo-share') {
      loadMissionSets();
    }
  }, [activeTab, loadMissionSets]);

  // 미션세트 담기
  const handleCopyMissionSet = async (missionSet: MissionSetSimple) => {
    try {
      const result = await copyMissionSet(missionSet.id);
      if (result.success) {
        Alert.alert(
          '담기 완료',
          `"${missionSet.title}" 미션세트를 내 목록에 추가했습니다.`
        );
        setMissionSets(prev =>
          prev.map(ms =>
            ms.id === missionSet.id
              ? { ...ms, addedCount: ms.addedCount + 1 }
              : ms
          )
        );
      } else {
        Alert.alert('담기 실패', result.error || '미션세트를 담는데 실패했습니다.');
      }
    } catch (error) {
      logError('미션세트 담기 실패', error as Error);
      Alert.alert('오류', '미션세트를 담는 중 문제가 발생했습니다.');
    }
  };

  // 투두리스트 공유 모달 열기
  const handleOpenShareModal = async () => {
    try {
      setMyMissionSetsLoading(true);
      const result = await getMyMissionSets({ page: 0, size: 100 });
      if (result.success && result.data) {
        setMyMissionSets(result.data.content);
        setShowShareModal(true);
      } else {
        handleApiError(result, 'CommunityScreen.loadMissionSets');
      }
    } catch (error) {
      showError(
        error instanceof Error ? error : new Error('투두리스트를 불러오는데 실패했습니다.'),
        'CommunityScreen.loadMissionSets'
      );
    } finally {
      setMyMissionSetsLoading(false);
    }
  };

  // 투두리스트 공유하기 (공개로 변경)
  const handleShareMissionSet = async (missionSet: MissionSetSimple) => {
    if (missionSet.isPublic) {
      showInfo('이미 공개된 투두리스트입니다.', '알림');
      return;
    }

    try {
      setSharingId(missionSet.id);
      const result = await updateMissionSet(missionSet.id, { isPublic: true });
      if (result.success) {
        showSuccess(`"${missionSet.title}" 투두리스트가 커뮤니티에 공유되었습니다.`, '공유 완료');
        setMyMissionSets(prev =>
          prev.map(ms => ms.id === missionSet.id ? { ...ms, isPublic: true } : ms)
        );
        setShowShareModal(false);
        // 공유 후 미션세트 목록 새로고침
        loadMissionSets();
      } else {
        handleApiError(result, 'CommunityScreen.handleShareMissionSet');
      }
    } catch (error) {
      showError(
        error instanceof Error ? error : new Error('공유 중 문제가 발생했습니다.'),
        'CommunityScreen.handleShareMissionSet'
      );
    } finally {
      setSharingId(null);
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

  // 인증글은 GET /api/community/posts에서 이미 포함되므로 별도 로딩 불필요
  // loadVerificationPosts는 제거됨 - useCommunity의 posts에 이미 포함됨

  // 인증글 투표는 GET /api/community/posts의 좋아요 API로 처리됨

  // 인증글은 GET /api/community/posts에서 이미 포함되므로 별도 로딩 불필요

  // Pull-to-Refresh 핸들러
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (activeTab === 'all') {
        await loadPosts(); // GET /api/community/posts가 일반글과 인증글 모두 반환
      } else {
        await loadMissionSets();
      }
    } finally {
      setRefreshing(false);
    }
  }, [loadPosts, loadMissionSets, activeTab]);


  // GET /api/community/posts에서 이미 일반글과 인증글을 모두 반환하므로 별도 변환 불필요
  // convertedVerificationPosts는 제거됨

  // 검색 및 필터링 (디바운싱된 검색어 사용)
  const filteredPosts = useMemo(() => {
    // GET /api/community/posts에서 이미 일반글과 인증글을 모두 반환하므로 posts만 사용
    let allPosts: CommunityPost[] = [...posts];

    // 숨긴 글 필터링
    allPosts = allPosts.filter(post => !hiddenPostIds.includes(post.post_id));

    // 인증 필터 적용 (category가 '인증'인 게시글만 필터링)
    if (verificationFilter === 'pending') {
      allPosts = allPosts.filter(post => post.category === '인증' && post.verified === false);
    } else if (verificationFilter === 'approved') {
      allPosts = allPosts.filter(post => post.category === '인증' && post.verified === true);
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
  }, [posts, debouncedSearchQuery, filter, verificationFilter, hiddenPostIds]);

  // 게시글 숨기기 처리
  const handleHidePost = useCallback(async (postId: string) => {
    try {
      await hidePost(postId);
      setHiddenPostIds(prev => [...prev, postId]);
    } catch (error) {
      showError(
        error instanceof Error ? error : new Error('게시글을 숨기는 중 문제가 발생했습니다.'),
        'CommunityScreen.handleHidePost'
      );
    }
  }, []);

  const handlePostPress = (postId: string) => {
    // 게시글 상세로 이동 (인증글도 CommunityPostDetail 사용)
    navigation.navigate('CommunityPostDetail', { postId });
  };

  // 좋아요 핸들러 (GET /api/community/posts의 게시글은 모두 좋아요 API 사용)
  const handleLike = async (postId: string) => {
    const result = await toggleLike(postId);
    // 내 게시글에는 좋아요를 누를 수 없음 에러 처리
    if (!result.success && result.error === '내 게시글에는 좋아요를 누를 수 없습니다.') {
      setAlertTitle('알림');
      setAlertMessage('내 게시글에는 좋아요를 누를 수 없습니다.');
      setShowAlert(true);
    }
  };

  if (loading) {
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
          onTabChange={(key) => setActiveTab(key as CommunityTab)}
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

      {/* 투두 공유 탭 콘텐츠 */}
      {activeTab === 'todo-share' && (
        <MissionSetList
          missionSets={missionSets}
          loading={missionSetLoading}
          searchQuery={missionSetSearchQuery}
          onSearchChange={setMissionSetSearchQuery}
          onFilterPress={() => setShowMissionSetFilterModal(true)}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onCopyMissionSet={handleCopyMissionSet}
          renderStars={renderStars}
          navigation={navigation}
        />
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

      {/* 투두리스트 공유 FAB */}
      {activeTab === 'todo-share' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleOpenShareModal}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="투두리스트 공유"
          accessibilityHint="내 투두리스트를 공유합니다"
          disabled={myMissionSetsLoading}
        >
          <Text style={styles.fabText}>+</Text>
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
            {FILTER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterOption,
                  filter === option.value && styles.filterOptionActive,
                ]}
                onPress={() => {
                  setFilter(option.value);
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

      {/* 투두 공유 필터 모달 */}
      <Modal
        visible={showMissionSetFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMissionSetFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => setShowMissionSetFilterModal(false)}
          />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>정렬 선택</Text>

            {/* 정렬 옵션 */}
            {[
              { value: 'popular', label: '인기순' },
              { value: 'latest', label: '최신순' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterOption,
                  missionSetSortBy === option.value && styles.filterOptionActive,
                ]}
                onPress={() => {
                  setMissionSetSortBy(option.value as 'popular' | 'latest');
                }}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={option.label}
                accessibilityState={{ selected: missionSetSortBy === option.value }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    missionSetSortBy === option.value && styles.filterOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {missionSetSortBy === option.value && (
                  <Text style={styles.filterOptionCheck} accessibilityElementsHidden={true}>✓</Text>
                )}
              </TouchableOpacity>
            ))}

            {/* 적용 버튼 */}
            <TouchableOpacity
              style={styles.modalApplyButton}
              onPress={() => setShowMissionSetFilterModal(false)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="필터 적용"
            >
              <Text style={styles.modalApplyButtonText}>적용</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 투두리스트 공유 모달 */}
      <Modal
        visible={showShareModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowShareModal(false)}
      >
        <View style={styles.shareModalOverlay}>
          <View style={styles.shareModalContent}>
            <View style={styles.shareModalHeader}>
              <Text style={styles.shareModalTitle}>투두리스트 공유하기</Text>
              <TouchableOpacity
                onPress={() => setShowShareModal(false)}
                style={styles.shareModalCloseButton}
              >
                <Text style={styles.shareModalCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.shareModalSubtitle}>
              커뮤니티에 공유할 투두리스트를 선택하세요
            </Text>

            <ScrollView style={styles.shareModalList}>
              {myMissionSets.length === 0 ? (
                <View style={styles.shareModalEmpty}>
                  <Text style={styles.shareModalEmptyText}>
                    아직 만든 투두리스트가 없습니다.
                  </Text>
                  <Text style={styles.shareModalEmptySubtext}>
                    홈에서 투두리스트를 먼저 만들어보세요!
                  </Text>
                </View>
              ) : (
                myMissionSets.map(missionSet => (
                  <TouchableOpacity
                    key={missionSet.id}
                    style={[
                      styles.shareModalItem,
                      missionSet.isPublic && styles.shareModalItemShared,
                    ]}
                    onPress={() => handleShareMissionSet(missionSet)}
                    disabled={sharingId === missionSet.id || missionSet.isPublic}
                    activeOpacity={0.7}
                  >
                    <View style={styles.shareModalItemContent}>
                      <Text style={styles.shareModalItemTitle} numberOfLines={1}>
                        {missionSet.title}
                      </Text>
                      {missionSet.description && (
                        <Text style={styles.shareModalItemDesc} numberOfLines={1}>
                          {missionSet.description}
                        </Text>
                      )}
                      <Text style={styles.shareModalItemMeta}>
                        {missionSet.missionCount}개 미션
                      </Text>
                    </View>
                    <View style={styles.shareModalItemAction}>
                      {sharingId === missionSet.id ? (
                        <ActivityIndicator size="small" color={colors.primary[500]} />
                      ) : missionSet.isPublic ? (
                        <View style={styles.sharedBadge}>
                          <Text style={styles.sharedBadgeText}>공유됨</Text>
                        </View>
                      ) : (
                        <View style={styles.shareButton}>
                          <Text style={styles.shareButtonText}>공유</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      <AlertModal
        visible={showAlert}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />
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
    paddingVertical: spacing[1],
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
    bottom: 50,
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
  fabText: {
    fontSize: 28,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
    marginTop: -2,
  },
  // 투두 공유 관련 스타일
  missionSetFilterContainer: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[1],
    paddingBottom: spacing[3],
  },
  missionSetSearchContainer: {
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
  missionSetList: {
    gap: spacing[3],
    paddingBottom: spacing[16],
  },
  missionSetCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  missionSetCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  missionSetTitle: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginRight: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  copyButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: borderRadius.base,
  },
  copyButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  missionSetDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[3],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  missionSetMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  metaText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  metaDot: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginHorizontal: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  missionSetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[2],
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  stars: {
    fontSize: typography.fontSize.sm,
    color: colors.warning,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  ratingText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  addedCount: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  // 투두리스트 공유 모달 스타일
  shareModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  shareModalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
    paddingBottom: spacing[6],
  },
  shareModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  shareModalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
  },
  shareModalCloseButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareModalCloseText: {
    fontSize: 28,
    color: colors.text.secondary,
    lineHeight: 28,
  },
  shareModalSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
  },
  shareModalList: {
    paddingHorizontal: spacing[4],
  },
  shareModalEmpty: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  shareModalEmptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
  },
  shareModalEmptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
  },
  shareModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  shareModalItemShared: {
    backgroundColor: colors.gray[50],
    borderColor: colors.gray[200],
  },
  shareModalItemContent: {
    flex: 1,
    marginRight: spacing[3],
  },
  shareModalItemTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
  },
  shareModalItemDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
  },
  shareModalItemMeta: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
  },
  shareModalItemAction: {
    minWidth: 60,
    alignItems: 'center',
  },
  sharedBadge: {
    backgroundColor: colors.gray[200],
    paddingVertical: spacing[1.5],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.full,
  },
  sharedBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
  },
  shareButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.md,
  },
  shareButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
  },
});

export default CommunityScreen;

