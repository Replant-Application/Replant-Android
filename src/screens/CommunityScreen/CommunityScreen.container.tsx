/**
 * CommunityScreen 비즈니스 로직
 * 커뮤니티 게시판 목록 화면: 게시글 조회, 필터링, 미션세트 공유
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { NavigationProp } from '@react-navigation/native';
import { useCommunity } from '../../hooks/useCommunity';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { CommunityPost } from '../../types';
import { logError } from '../../utils/logger';
import { getHiddenPosts, hidePost } from '../../utils/hiddenContentStorage';
import {
  getMissionSets,
  searchMissionSets,
  copyMissionSet,
  getMyMissionSets,
  updateMissionSet,
  MissionSetSimple,
} from '../../api/todolistApi';
import { CommunityScreenProps, CommunityTab, VerificationFilter, PostFilter } from '../../types/screens/community';

export const useCommunityScreenContainer = ({ navigation }: CommunityScreenProps) => {
  const { posts, loading, error, toggleLike, loadPosts } = useCommunity();
  const { showError, showSuccess, showInfo, handleApiError } = useErrorHandler();

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'popular'>('all');
  const [activeTab, setActiveTab] = useState<CommunityTab>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // 인증 필터 상태
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

  /**
   * 검색어 디바운싱 (300ms)
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  /**
   * 숨긴 게시글 목록 로드
   */
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

  /**
   * 미션세트 검색어 디바운싱
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMissionSetSearchQuery(missionSetSearchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [missionSetSearchQuery]);

  /**
   * 미션세트 목록 로드
   */
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

  /**
   * 탭 변경 시 미션세트 로드
   */
  useEffect(() => {
    if (activeTab === 'todo-share') {
      loadMissionSets();
    }
  }, [activeTab, loadMissionSets]);

  /**
   * 미션세트 담기
   */
  const handleCopyMissionSet = useCallback(
    async (missionSet: MissionSetSimple) => {
      try {
        const result = await copyMissionSet(missionSet.id);
        if (result.success) {
          showSuccess(`"${missionSet.title}" 미션세트를 내 목록에 추가했습니다.`, '담기 완료');
          setMissionSets(prev =>
            prev.map(ms => (ms.id === missionSet.id ? { ...ms, addedCount: ms.addedCount + 1 } : ms))
          );
        } else {
          handleApiError(result, 'CommunityScreen.handleCopyMissionSet');
        }
      } catch (error) {
        showError(
          error instanceof Error ? error : new Error('미션세트를 담는 중 문제가 발생했습니다.'),
          'CommunityScreen.handleCopyMissionSet'
        );
      }
    },
    [showSuccess, handleApiError, showError]
  );

  /**
   * 투두리스트 공유 모달 열기
   */
  const handleOpenShareModal = useCallback(async () => {
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
  }, [handleApiError, showError]);

  /**
   * 투두리스트 공유하기 (공개로 변경)
   */
  const handleShareMissionSet = useCallback(
    async (missionSet: MissionSetSimple) => {
      if (missionSet.isPublic) {
        showInfo('이미 공개된 투두리스트입니다.', '알림');
        return;
      }

      try {
        setSharingId(missionSet.id);
        const result = await updateMissionSet(missionSet.id, { isPublic: true });
        if (result.success) {
          showSuccess(`"${missionSet.title}" 투두리스트가 커뮤니티에 공유되었습니다.`, '공유 완료');
          setMyMissionSets(prev => prev.map(ms => (ms.id === missionSet.id ? { ...ms, isPublic: true } : ms)));
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
    },
    [showInfo, showSuccess, handleApiError, showError, loadMissionSets]
  );

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
   * Pull-to-Refresh 핸들러
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (activeTab === 'all') {
        await loadPosts();
      } else {
        await loadMissionSets();
      }
    } finally {
      setRefreshing(false);
    }
  }, [loadPosts, loadMissionSets, activeTab]);

  /**
   * 검색 및 필터링 (디바운싱된 검색어 사용)
   */
  const filteredPosts = useMemo(() => {
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

  /**
   * 게시글 숨기기 처리
   */
  const handleHidePost = useCallback(
    async (postId: string) => {
      try {
        await hidePost(postId);
        setHiddenPostIds(prev => [...prev, postId]);
      } catch (error) {
        showError(
          error instanceof Error ? error : new Error('게시글을 숨기는 중 문제가 발생했습니다.'),
          'CommunityScreen.handleHidePost'
        );
      }
    },
    [showError]
  );

  /**
   * 게시글 상세로 이동
   */
  const handlePostPress = useCallback(
    (postId: string) => {
      navigation.navigate('CommunityPostDetail', { postId });
    },
    [navigation]
  );

  /**
   * 좋아요 핸들러
   */
  const handleLike = useCallback(
    async (postId: string) => {
      const result = await toggleLike(postId);
      // 내 게시글에는 좋아요를 누를 수 없음 에러 처리
      if (!result.success && result.error === '내 게시글에는 좋아요를 누를 수 없습니다.') {
        setAlertTitle('알림');
        setAlertMessage('내 게시글에는 좋아요를 누를 수 없습니다.');
        setShowAlert(true);
      }
    },
    [toggleLike]
  );

  /**
   * 미션 그룹 화면으로 이동
   */
  const handleMissionGroupPress = useCallback(() => {
    navigation.navigate('MissionGroup');
  }, [navigation]);

  /**
   * 알림 모달 닫기
   */
  const handleAlertClose = useCallback(() => {
    setShowAlert(false);
  }, []);

  /**
   * 필터 모달 닫기
   */
  const handleFilterModalClose = useCallback(() => {
    setShowFilterModal(false);
  }, []);

  /**
   * 미션세트 필터 모달 닫기
   */
  const handleMissionSetFilterModalClose = useCallback(() => {
    setShowMissionSetFilterModal(false);
  }, []);

  /**
   * 공유 모달 닫기
   */
  const handleShareModalClose = useCallback(() => {
    setShowShareModal(false);
  }, []);

  /**
   * 게시글 작성 화면으로 이동
   */
  const handleCreatePost = useCallback(() => {
    navigation.navigate('CommunityPostCreate' as any, { type: 'GENERAL' });
  }, [navigation]);

  return {
    // Data
    posts,
    loading,
    error,
    filteredPosts,
    missionSets,
    myMissionSets,
    // State
    searchQuery,
    filter,
    activeTab,
    showFilterModal,
    refreshing,
    verificationFilter,
    hiddenPostIds,
    showAlert,
    alertTitle,
    alertMessage,
    missionSetLoading,
    missionSetSearchQuery,
    missionSetSortBy,
    showMissionSetFilterModal,
    showShareModal,
    myMissionSetsLoading,
    sharingId,
    // Setters
    setSearchQuery,
    setFilter,
    setActiveTab,
    setShowFilterModal,
    setVerificationFilter,
    setMissionSetSearchQuery,
    setMissionSetSortBy,
    setShowMissionSetFilterModal,
    // Handlers
    handleCopyMissionSet,
    handleOpenShareModal,
    handleShareMissionSet,
    handleHidePost,
    handlePostPress,
    handleLike,
    handleMissionGroupPress,
    handleAlertClose,
    handleFilterModalClose,
    handleMissionSetFilterModalClose,
    handleShareModalClose,
    handleCreatePost,
    onRefresh,
    // Utils
    renderStars,
  };
};
