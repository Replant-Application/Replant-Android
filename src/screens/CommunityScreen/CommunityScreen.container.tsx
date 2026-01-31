/**
 * CommunityScreen 비즈니스 로직
 * 커뮤니티 게시판 목록 화면: 게시글 조회, 필터링, 미션세트 공유
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { CommunityPost } from '../../types';
import { logError } from '../../utils/logger';
import { getHiddenPosts, hidePost } from '../../utils/hiddenContentStorage';
import {
  getPublicTodoLists,
  searchPublicTodoLists,
  getMyMissionSets,
  updateMissionSet,
  likeTodoList,
  unlikeTodoList,
  MissionSetSimple,
} from '../../api/todolistApi';
import { getPosts as getPostsApi } from '../../api/communityApi';
import { toggleLike as toggleLikeService } from '../../services/communityService';
import { useUser } from '../../contexts/UserContext';
import { CommunityScreenProps, CommunityTab, VerificationFilter } from '../../types/screens/community';

const DEBUG_COMMUNITY_LOADING = false; // 커뮤니티 로딩 디버깅 (원인 파악 후 false로)

export const useCommunityScreenContainer = ({ navigation, route }: CommunityScreenProps) => {
  const { currentNickname, currentUserId } = useUser();

  const debugMountRef = useRef({ mountedAt: Date.now(), logCount: 0 });
  debugMountRef.current.logCount += 1;
  if (DEBUG_COMMUNITY_LOADING && debugMountRef.current.logCount <= 5) {
    console.log('[CommunityScreen] render', {
      renderCount: debugMountRef.current.logCount,
      currentNickname: currentNickname ?? null,
      currentUserId: currentUserId ?? null,
      msSinceMount: Date.now() - debugMountRef.current.mountedAt,
    });
  }

  // 페이지네이션 상태
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const PAGE_SIZE = 20;

  // activeTab 초기값 설정 (유효성 검사 포함)
  const getInitialActiveTab = (): CommunityTab => {
    const tab = (route?.params as any)?.activeTab;
    return (tab === 'all' || tab === 'todo-share') ? tab : 'all';
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'popular'>('all');
  const [activeTab, setActiveTab] = useState<CommunityTab>(getInitialActiveTab());
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  /**
   * activeTab이 유효하지 않은 값일 때 자동으로 'all'로 설정
   * 전체 게시판과 투두리스트 공유 둘 중 아무것도 선택되지 않는 시나리오 방지
   */
  useEffect(() => {
    if (activeTab !== 'all' && activeTab !== 'todo-share') {
      setActiveTab('all');
    }
  }, [activeTab]);

  // 인증 필터 상태
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>('all');
  
  // 내가 쓴 게시글만 보기 필터
  const [onlyMyPosts, setOnlyMyPosts] = useState<boolean>(false);

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
  const [likingMissionSetId, setLikingMissionSetId] = useState<number | null>(null);

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
          isPublic: true,
          missionCount: todo.missionCount || todo.totalCount || 0,
          likeCount: todo.likeCount ?? 0,
          isLiked: todo.isLiked ?? false,
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
          isPublic: publicTodoListIds.has(todo.id),
          missionCount: todo.totalCount || 0,
          likeCount: todo.likeCount ?? 0,
          isLiked: todo.isLiked ?? false,
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
   * 투두리스트 공유 목록에서 좋아요 토글 (상세 진입 없이)
   */
  const handleTodoListLike = useCallback(async (missionSetId: number, currentIsLiked: boolean) => {
    setLikingMissionSetId(missionSetId);
    try {
      const result = currentIsLiked
        ? await unlikeTodoList(missionSetId)
        : await likeTodoList(missionSetId);
      if (result.success) {
        await loadMissionSets();
      } else {
        handleApiError(result, 'CommunityScreen.handleTodoListLike');
      }
    } catch (err) {
      logError('좋아요 토글 실패', err as Error);
      showError(
        err instanceof Error ? err : new Error('좋아요 처리에 실패했습니다.'),
        'CommunityScreen.handleTodoListLike'
      );
    } finally {
      setLikingMissionSetId(null);
    }
  }, [loadMissionSets, handleApiError, showError]);

  /**
   * 게시글 목록 로드 (페이지네이션)
   */
  const loadPosts = useCallback(async (page: number = 0) => {
    if (!currentNickname) {
      if (DEBUG_COMMUNITY_LOADING) {
        console.log('[CommunityScreen] loadPosts(0) 스킵: currentNickname 없음');
      }
      return;
    }

    const apiStart = Date.now();
    if (DEBUG_COMMUNITY_LOADING && page === 0) {
      console.log('[CommunityScreen] loadPosts(0) 시작', { currentNickname });
    }

    try {
      if (page === 0) {
        setLoading(true);
      }
      setError(null);

      const result = await getPostsApi({ page, size: PAGE_SIZE });

      if (DEBUG_COMMUNITY_LOADING && page === 0) {
        console.log('[CommunityScreen] getPostsApi 응답', {
          ms: Date.now() - apiStart,
          success: result.success,
          postCount: result.data?.content?.length ?? 0,
        });
      }

      if (result.success && result.data) {
        const newPosts = result.data.content || [];
        
        // 백엔드 응답을 프론트엔드 형식으로 변환
        // 백엔드는 postType(GENERAL|VERIFICATION)을 보냄 → category(일반|인증)로 변환해야 목록 태그가 올바르게 표시됨
        // postType(camelCase) 또는 post_type(snake_case) 모두 처리. missionTag+status 있으면 인증글로 간주
        const transformedPosts: CommunityPost[] = newPosts.map((post: any) => {
          const isVerification =
            post.postType === 'VERIFICATION' ||
            post.post_type === 'VERIFICATION' ||
            (!!post.missionTag && (post.status === 'PENDING' || post.status === 'APPROVED'));
          return {
            id: String(post.id),
            post_id: String(post.id),
            mission_id: post.missionTag?.id ? String(post.missionTag.id) : '',
            mission_title: post.missionTag?.title || '',
            mission_emoji: isVerification ? '' : '🎯',
            title: post.title || '',
            content: post.content || '',
            author: String(post.userId),
            author_id: String(post.userId),
            userId: post.userId,
            author_nickname: post.userNickname || '알 수 없음',
            created_at: post.createdAt || new Date().toISOString(),
            updated_at: post.updatedAt || post.createdAt || new Date().toISOString(),
            like_count: post.likeCount || 0,
            comment_count: post.commentCount || 0,
            scrap_count: 0,
            images: post.imageUrls || [],
            category: isVerification ? '인증' : '일반',
            is_liked: post.isLiked || false,
            is_scrapped: false, // 스크랩은 로컬에서 관리
            verified: isVerification ? post.status === 'APPROVED' : undefined,
            isAuthor: post.isAuthor || false,
            completionRate: post.completionRate,
          };
        });

        setPosts(transformedPosts);
        setTotalPages(result.data.totalPages || 1);
        setCurrentPage(page);
      } else {
        setError(result.error || '게시글을 불러오는데 실패했습니다.');
      }
    } catch (loadError) {
      logError('게시글 목록 로드 실패', loadError as Error, { currentNickname, page });
      setError((loadError as Error).message);
    } finally {
      setLoading(false);
      if (DEBUG_COMMUNITY_LOADING && page === 0) {
        console.log('[CommunityScreen] loadPosts(0) 완료, setLoading(false)', {
          totalMs: Date.now() - apiStart,
        });
      }
    }
  }, [currentNickname]);

  /**
   * 초기 로드
   * - 전체 게시판 탭일 때만 게시글 로드
   * - 이미 로드된 게시글이 있으면 탭 전환 시 재요청하지 않음 (투두공유 ↔ 전체 전환 시 렉 완화)
   */
  useEffect(() => {
    const shouldLoad = activeTab === 'all' && currentNickname;
    if (!shouldLoad) return;
    if (posts.length > 0) return; // 캐시된 목록이 있으면 API 재호출 생략
    loadPosts(0);
  }, [activeTab, currentNickname, loadPosts, posts.length]);

  /**
   * Pull-to-Refresh 핸들러
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (activeTab === 'all') {
        setCurrentPage(0);
        await loadPosts(0);
      } else {
        await loadMissionSets();
      }
    } finally {
      setRefreshing(false);
    }
  }, [loadPosts, loadMissionSets, activeTab]);

  /**
   * 다음 페이지로 이동
   */
  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      loadPosts(currentPage + 1);
    }
  }, [currentPage, totalPages, loadPosts]);

  /**
   * 이전 페이지로 이동
   */
  const handlePreviousPage = useCallback(() => {
    if (currentPage > 0) {
      loadPosts(currentPage - 1);
    }
  }, [currentPage, loadPosts]);

  /**
   * 검색 및 필터링 (디바운싱된 검색어 사용)
   */
  const filteredPosts = useMemo(() => {
    let allPosts: CommunityPost[] = [...posts];

    // 숨긴 글 필터링
    allPosts = allPosts.filter(post => !hiddenPostIds.includes(post.post_id));

    // 내가 쓴 게시글만 보기 필터
    if (onlyMyPosts) {
      allPosts = allPosts.filter(post => post.isAuthor === true);
    }

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
  }, [posts, debouncedSearchQuery, filter, verificationFilter, hiddenPostIds, onlyMyPosts]);

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
      if (!currentNickname) return;

      // 해당 게시글 찾기
      const targetPost = posts.find(p => p.post_id === postId);

      // 내 게시글에는 좋아요를 누를 수 없음
      if (targetPost?.isAuthor === true) {
        setAlertTitle('알림');
        setAlertMessage('내 게시글에는 좋아요를 누를 수 없습니다.');
        setShowAlert(true);
        return;
      }

      try {
        const result = await toggleLikeService(postId, currentNickname);

        if (result.success && result.data) {
          // 로컬 상태 업데이트
          setPosts(prev =>
            prev.map(p => {
              if (p.post_id === postId) {
                return {
                  ...p,
                  is_liked: result.data!.isLiked,
                  like_count: result.data!.likeCount,
                };
              }
              return p;
            })
          );
        } else if (!result.success) {
          setAlertTitle('오류');
          setAlertMessage(result.error || '좋아요 처리에 실패했습니다.');
          setShowAlert(true);
        }
      } catch (err) {
        logError('좋아요 토글 실패', err as Error, { postId, currentNickname });
        setAlertTitle('오류');
        setAlertMessage('좋아요 처리 중 문제가 발생했습니다.');
        setShowAlert(true);
      }
    },
    [currentNickname, posts]
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
    onlyMyPosts,
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
    setOnlyMyPosts,
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
    // 페이지네이션
    currentPage,
    totalPages,
    handleNextPage,
    handlePreviousPage,
    // 공유 확인 ConfirmModal
    showShareConfirmModal,
    shareConfirmMissionSet,
    handleShareConfirm,
    handleShareConfirmCancel,
    handleUnshareMissionSet,
    handleTodoListLike,
    likingMissionSetId,
  };
};
