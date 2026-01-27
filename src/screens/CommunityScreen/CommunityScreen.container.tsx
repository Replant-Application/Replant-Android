/**
 * CommunityScreen 비즈니스 로직
 * 커뮤니티 게시판 목록 화면: 게시글 조회, 필터링, 미션세트 공유
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useCommunity } from '../../hooks/useCommunity';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { CommunityPost } from '../../types';
import { logError } from '../../utils/logger';
import { getHiddenPosts, hidePost } from '../../utils/hiddenContentStorage';
import {
  getPublicTodoLists,
  searchPublicTodoLists,
  getMyMissionSets,
  updateMissionSet,
  MissionSetSimple,
} from '../../api/todolistApi';
import { CommunityScreenProps, CommunityTab, VerificationFilter } from '../../types/screens/community';

export const useCommunityScreenContainer = ({ navigation, route }: CommunityScreenProps) => {
  const { posts, loading, error, toggleLike, loadPosts } = useCommunity();

  // route.params에서 activeTab을 가져오거나 기본값 'all' 사용
  const initialTab = ((route?.params as any)?.activeTab || 'all') as CommunityTab;

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'popular'>('all');
  const [activeTab, setActiveTab] = useState<CommunityTab>(initialTab);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // 인증 필터 상태
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>('all');

  // 숨긴 게시글 ID 목록
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>([]);

  // AlertModal 상태 (오류/성공/알림 + handleLike 알림)
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // 공유 확인 ConfirmModal
  const [showShareConfirmModal, setShowShareConfirmModal] = useState(false);
  const [shareConfirmMissionSet, setShareConfirmMissionSet] = useState<MissionSetSimple | null>(null);

  const errorHandlerOverrides = useMemo(
    () => ({
      onShowError: (t: string, m: string) => {
        setAlertTitle(t);
        setAlertMessage(m);
        setShowAlert(true);
      },
      onShowSuccess: (t: string, m: string) => {
        setAlertTitle(t);
        setAlertMessage(m);
        setShowAlert(true);
      },
      onShowInfo: (t: string, m: string) => {
        setAlertTitle(t);
        setAlertMessage(m);
        setShowAlert(true);
      },
    }),
    []
  );
  const { showError, showSuccess, showInfo, handleApiError } = useErrorHandler(errorHandlerOverrides);

  // 투두 공유 (미션세트) 관련 상태
  const [missionSets, setMissionSets] = useState<MissionSetSimple[]>([]);
  const [missionSetLoading, setMissionSetLoading] = useState(false);
  const [missionSetSearchQuery, setMissionSetSearchQuery] = useState('');
  const [debouncedMissionSetSearchQuery, setDebouncedMissionSetSearchQuery] = useState('');
  const [missionSetSortBy, setMissionSetSortBy] = useState<'popular' | 'latest'>('latest');
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
      } catch (err) {
        logError('숨긴 게시글 목록 로드 실패', err as Error);
      }
    };
    loadHiddenPosts();
  }, []);

  /**
   * route.params.activeTab 변경 시 activeTab 업데이트
   * 커스텀 네비게이션을 사용하므로 useEffect만 사용
   */
  useEffect(() => {
    const params = route?.params as any;
    if (params?.activeTab) {
      setActiveTab(params.activeTab as CommunityTab);
    }
  }, [route?.params]);

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
        result = await searchPublicTodoLists(debouncedMissionSetSearchQuery, 0, 50, missionSetSortBy);
      } else {
        result = await getPublicTodoLists(0, 50, missionSetSortBy);
      }

      if (result.success && result.data) {
        // 백엔드 SimpleResponse를 MissionSetSimple로 변환
        // 백엔드에서 creatorNickname을 포함하여 반환함
        const transformed: MissionSetSimple[] = result.data.content.map((todo: any) => ({
          id: todo.id,
          title: todo.title,
          description: todo.description || undefined,
          creatorId: todo.creatorId || 0,
          creatorNickname: todo.creatorNickname || '알 수 없음',
          isPublic: true, // 공개 투두리스트이므로 항상 true
          missionCount: todo.missionCount || todo.totalCount || 0,
          averageRating: todo.averageRating || 0,
          reviewCount: todo.reviewCount ?? 0,
          createdAt: todo.createdAt,
        }));
        setMissionSets(transformed);
      }
    } catch (err) {
      logError('미션세트 로딩 실패', err as Error);
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
   * 투두리스트 공유 모달 열기
   */
  const handleOpenShareModal = useCallback(async () => {
    try {
      setMyMissionSetsLoading(true);
      // 내 투두리스트와 공개 투두리스트 목록을 동시에 가져옴
      const [myResult, publicResult] = await Promise.all([
        getMyMissionSets({ page: 0, size: 100 }),
        getPublicTodoLists(0, 100, 'latest')
      ]);
      
      if (myResult.success && myResult.data) {
        // 공개 목록에 포함된 투두리스트 ID 집합 생성
        const publicTodoListIds = new Set<number>();
        if (publicResult.success && publicResult.data) {
          publicResult.data.content.forEach((todo: any) => {
            publicTodoListIds.add(todo.id);
          });
        }
        
        // 내 투두리스트를 MissionSetSimple로 변환
        const transformed: MissionSetSimple[] = myResult.data.content.map((todo: any) => ({
          id: todo.id,
          title: todo.title,
          description: todo.description || undefined,
          creatorId: todo.creatorId || 0,
          creatorNickname: todo.creatorNickname || '알 수 없음',
          isPublic: publicTodoListIds.has(todo.id), // 공개 목록에 포함되어 있으면 true
          missionCount: todo.totalCount || 0, // totalCount를 missionCount로 사용
          averageRating: todo.averageRating || 0,
          reviewCount: todo.reviewCount ?? 0,
          createdAt: todo.createdAt,
        }));
        
        setMyMissionSets(transformed);
        setShowShareModal(true);
      } else {
        handleApiError(myResult, 'CommunityScreen.loadMissionSets');
      }
    } catch (err) {
      showError(
        err instanceof Error ? err : new Error('투두리스트를 불러오는데 실패했습니다.'),
        'CommunityScreen.loadMissionSets'
      );
    } finally {
      setMyMissionSetsLoading(false);
    }
  }, [handleApiError, showError]);

  /**
   * 투두리스트 공유 확인 모달 열기
   */
  const handleShareMissionSet = useCallback(
    (missionSet: MissionSetSimple) => {
      if (missionSet.isPublic) {
        showInfo('이미 공개된 투두리스트입니다.', '알림');
        return;
      }
      setShareConfirmMissionSet(missionSet);
      setShowShareConfirmModal(true);
    },
    [showInfo]
  );

  /**
   * 공유 확인 모달: 공유 실행
   */
  const handleShareConfirm = useCallback(async () => {
    const missionSet = shareConfirmMissionSet;
    if (!missionSet) return;
    setShowShareConfirmModal(false);
    setShareConfirmMissionSet(null);
    try {
      setSharingId(missionSet.id);
      const result = await updateMissionSet(missionSet.id, { isPublic: true });
      if (result.success) {
        showSuccess(`"${missionSet.title}" 투두리스트가 커뮤니티에 공유되었습니다.`, '공유 완료');
        setMyMissionSets(prev => prev.map(ms => (ms.id === missionSet.id ? { ...ms, isPublic: true } : ms)));
        setShowShareModal(false);
        loadMissionSets();
      } else {
        handleApiError(result, 'CommunityScreen.handleShareConfirm');
      }
    } catch (err) {
      showError(
        err instanceof Error ? err : new Error('공유 중 문제가 발생했습니다.'),
        'CommunityScreen.handleShareConfirm'
      );
    } finally {
      setSharingId(null);
    }
  }, [shareConfirmMissionSet, showSuccess, handleApiError, showError, loadMissionSets]);

  /**
   * 공유 확인 모달: 취소
   */
  const handleShareConfirmCancel = useCallback(() => {
    setShowShareConfirmModal(false);
    setShareConfirmMissionSet(null);
  }, []);

  /**
   * 투두리스트 공유 해제 (커뮤니티에서 제거)
   */
  const handleUnshareMissionSet = useCallback(async (missionSetId: number) => {
    try {
      // isPublic을 false로 변경
      const result = await updateMissionSet(missionSetId, { isPublic: false });
      if (result.success) {
        showSuccess('커뮤니티 공유 게시판에서 삭제되었습니다.');
        // 목록 새로고침
        await loadMissionSets();
      } else {
        handleApiError(result, 'CommunityScreen.handleUnshareMissionSet');
      }
    } catch (err) {
      showError(
        err instanceof Error ? err : new Error('삭제에 실패했습니다.'),
        'CommunityScreen.handleUnshareMissionSet'
      );
    }
  }, [showSuccess, handleApiError, showError, loadMissionSets]);

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
      } catch (err) {
        showError(
          err instanceof Error ? err : new Error('게시글을 숨기는 중 문제가 발생했습니다.'),
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
      // 전체 게시판 탭에서 왔으므로 returnScreen과 activeTab 전달
      navigation.navigate('CommunityPostDetail', { 
        postId,
        returnScreen: 'Community',
        activeTab: 'all'
      });
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
    // 공유 확인 ConfirmModal
    showShareConfirmModal,
    shareConfirmMissionSet,
    handleShareConfirm,
    handleShareConfirmCancel,
    handleUnshareMissionSet,
    // Utils
    renderStars,
  };
};
