/**
 * MissionScreen 비즈니스 로직
 * 미션 화면: 미션 목록 관리, 인증 처리, 미션 도감 로드
 */

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { FlatList, Dimensions } from 'react-native';
import { useMission } from '../../hooks/useMission';
import { useCharacter } from '../../hooks/useCharacter';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { Mission } from '../../types';
import {
  checkVerificationStatus,
  verifyByGps,
  verifyByTime,
  addSystemMissionToMyMissions,
  getCustomMissions,
  getMissionCollection,
  completeCustomMission,
  MissionCategory,
} from '../../api/missionApi';
import * as Location from 'expo-location';
import { logError } from '../../utils/logger';
import { MissionScreenProps, MissionFilter, MissionTab } from '../../types/screens/mission';
import { getCurrentUser } from '../../services/authService';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEMS_PER_PAGE = 5; // 화면 표시용 페이지네이션 (한 화면에 5개)
const MISSION_COLLECTION_PAGE_SIZE = 15; // 서버에서 가져올 미션 개수 (한 페이지당 15개)

// 미션 도감용 통합 미션 타입
interface UnifiedMission {
  id: number;
  title: string;
  description: string;
  category?: MissionCategory;
  verificationType: string;
  requiredMinutes?: number;
  expReward: number;
  badgeDurationDays: number;
  participantCount?: number;
  isCustom: boolean;
  creatorId?: number;
  creatorNickname?: string;
  isChallenge?: boolean;
  challengeDays?: number;
  deadlineDays?: number;
  isPublic?: boolean;
  worryType?: string;
  isCompleted?: boolean;
  isAttempted?: boolean;
}

type MissionGroupTab = 'official' | 'custom';

interface MissionScreenContainerProps {
  navigation: NavigationProp<RootStackParamList>;
  route?: MissionScreenProps['route'];
}

export const useMissionScreenContainer = ({
  navigation,
  route,
}: MissionScreenContainerProps) => {
  const { addExperienceByCategory } = useCharacter();
  const {
    missions,
    loading,
    error,
    deleteMissionPhoto,
    completeMissionWithPhoto,
    uncompleteMission,
    loadMissions,
  } = useMission(addExperienceByCategory);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const handleCloseAlert = useCallback(() => setShowAlert(false), []);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalTitle, setConfirmModalTitle] = useState('');
  const [confirmModalMessage, setConfirmModalMessage] = useState('');
  const confirmCallbackRef = useRef<(() => void) | null>(null);

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
      onShowConfirm: (t: string, m: string, onConfirm: () => void) => {
        setConfirmModalTitle(t);
        setConfirmModalMessage(m);
        confirmCallbackRef.current = onConfirm;
        setShowConfirmModal(true);
      },
    }),
    []
  );
  const { showError, showSuccess, showInfo, handleApiError, showConfirm } = useErrorHandler(errorHandlerOverrides);

  const handleConfirmModalConfirm = useCallback(() => {
    const fn = confirmCallbackRef.current;
    setShowConfirmModal(false);
    confirmCallbackRef.current = null;
    fn?.();
  }, []);

  const handleConfirmModalCancel = useCallback(() => {
    setShowConfirmModal(false);
    confirmCallbackRef.current = null;
  }, []);

  // route params
  const routeParams = route?.params;
  // route params에서 selectedFilter 복원 (나의 미션 탭 필터)
  const [selectedFilter, setSelectedFilter] = useState<MissionFilter>(routeParams?.selectedFilter || 'inProgress');
  const [activeTab, setActiveTab] = useState<MissionTab>(routeParams?.activeTab || 'myMission');
  const [refreshing, setRefreshing] = useState(false);

  // 인증 모달 상태
  const [verificationModalVisible, setVerificationModalVisible] = useState(false);
  const [selectedMissionForVerification, setSelectedMissionForVerification] = useState<Mission | null>(null);

  // 미션 완료 모달 상태
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeModalTitle, setCompleteModalTitle] = useState('');
  const [completeModalMessage, setCompleteModalMessage] = useState('');
  const [completedMissionForVerification, setCompletedMissionForVerification] = useState<Mission | null>(null);
  const [isLevelUp, setIsLevelUp] = useState(false);

  // 커스텀 미션 완료 처리 중 (mission_id)
  const [completingMissionId, setCompletingMissionId] = useState<string | null>(null);

  // 미션 도감 관련 상태 (route params에서 missionGroupTab 복원)
  const [missionGroupTab, setMissionGroupTab] = useState<MissionGroupTab>(routeParams?.missionGroupTab || 'official');
  const [groupMissions, setGroupMissions] = useState<UnifiedMission[]>([]);
  const [groupLoading, setGroupLoading] = useState(false);
  const [selectedGroupMission, setSelectedGroupMission] = useState<UnifiedMission | null>(null);
  const [currentServerPage, setCurrentServerPage] = useState(0); // 서버 페이지 (0부터 시작)
  const [totalServerPages, setTotalServerPages] = useState(0); // 전체 서버 페이지 수

  // 현재 사용자 ID (커스텀 미션 수정 권한 확인용)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // 미션 목록 페이지네이션 상태
  const [currentMissionPage, setCurrentMissionPage] = useState(0);
  const missionFlatListRef = useRef<FlatList>(null);
  const savedPageOnFocusRef = useRef<number | null>(null); // 포커스 시 저장된 페이지

  /**
   * 현재 사용자 정보 로드
   */
  useEffect(() => {
    const loadCurrentUser = async () => {
      const user = await getCurrentUser();
      if (user?.id) {
        setCurrentUserId(user.id);
      }
    };
    loadCurrentUser();
  }, []);

  /**
   * 필터링된 미션 목록 (진행중/인증대기/완료)
   */
  const filteredMissions = useMemo(() => {
    switch (selectedFilter) {
      case 'completed':
        // 완료된 미션 (status === 'COMPLETED')
        return missions.filter(mission => mission.status === 'COMPLETED' || mission.completed);
      case 'pendingVerification':
        // 인증 대기 미션 (status === 'PENDING')
        return missions.filter(mission => mission.status === 'PENDING');
      case 'inProgress':
      default:
        // 진행중 미션 (status === 'ASSIGNED' 또는 status가 없는 경우)
        return missions.filter(
          mission =>
            mission.status === 'ASSIGNED' ||
            (mission.status !== 'COMPLETED' && mission.status !== 'PENDING' && !mission.completed)
        );
    }
  }, [missions, selectedFilter]);

  const displayedMissions = filteredMissions;

  /**
   * 진행률 계산
   */
  const completedMissions = useMemo(() => {
    const count = missions.filter(mission => mission.status === 'COMPLETED' || mission.completed).length;
    return count;
  }, [missions]);
  const totalMissions = missions.length;

  /**
   * 필터별 미션 개수 계산
   */
  const missionCounts = useMemo(() => {
    const inProgressCount = missions.filter(
      mission =>
        mission.status === 'ASSIGNED' ||
        (mission.status !== 'COMPLETED' && mission.status !== 'PENDING' && !mission.completed)
    ).length;
    
    const pendingVerificationCount = missions.filter(
      mission => mission.status === 'PENDING'
    ).length;
    
    const completedCount = missions.filter(
      mission => mission.status === 'COMPLETED' || mission.completed
    ).length;
    
    return {
      inProgress: inProgressCount,
      pendingVerification: pendingVerificationCount,
      completed: completedCount,
    };
  }, [missions]);

  /**
   * 페이지 수 계산
   */
  const totalMissionPages = Math.ceil(displayedMissions.length / ITEMS_PER_PAGE);

  /**
   * 페이지별 미션 데이터 생성
   */
  const missionPages = useMemo(() => {
    const pages: Mission[][] = [];
    for (let i = 0; i < displayedMissions.length; i += ITEMS_PER_PAGE) {
      pages.push(displayedMissions.slice(i, i + ITEMS_PER_PAGE));
    }
    return pages.length > 0 ? pages : [[]];
  }, [displayedMissions]);

  /**
   * 탭 변경 시 페이지 초기화
   */
  useEffect(() => {
    setCurrentMissionPage(0);
    if (missionFlatListRef.current && missionPages.length > 0) {
      missionFlatListRef.current.scrollToIndex({ index: 0, animated: false });
    }
  }, [selectedFilter, missionPages.length]);

  /**
   * 미션 페이지 변경 핸들러
   */
  const onMissionPageChange = useCallback((event: any) => {
    const pageIndex = Math.round(event.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 32));
    setCurrentMissionPage(pageIndex);
  }, []);

  /**
   * 페이지 이동
   */
  const goToMissionPage = useCallback(
    (pageIndex: number) => {
      if (pageIndex >= 0 && pageIndex < totalMissionPages) {
        missionFlatListRef.current?.scrollToIndex({ index: pageIndex, animated: true });
        setCurrentMissionPage(pageIndex);
      }
    },
    [totalMissionPages]
  );

  /**
   * 미션 도감 탭 변경 시 서버 페이지 초기화
   */
  useEffect(() => {
    setCurrentServerPage(0);
  }, [missionGroupTab]);

  /**
   * 미션 완료 (사진이 있으면 그 사진으로, 없으면 null로)
   */
  const handleMissionComplete = useCallback(
    async (missionId: string) => {
      try {
        // 미션에 저장된 사진이 있는지 확인
        const mission = missions.find(m => m.mission_id === missionId);
        const photoUrl = mission?.photo_url || null;

        const result = await completeMissionWithPhoto(missionId, photoUrl);

        if (result && result.success) {
          const completedMission = missions.find(m => m.mission_id === missionId);
          if (!completedMission) return;

          const resultAlertTitle = result.levelUp ? '레벨업!' : '미션 완료';
          const resultAlertMessage = result.levelUp
            ? `축하합니다! 레벨 ${result.newLevel}이 되었습니다!`
            : `+${result.experienceGained} EXP를 획득했습니다!`;

          // 모달 표시
          setIsLevelUp(result.levelUp || false);
          setCompleteModalTitle(resultAlertTitle);
          setCompleteModalMessage(resultAlertMessage);
          setCompletedMissionForVerification(completedMission);
          setShowCompleteModal(true);
        }
      } catch (completeError) {
        showError('미션 완료에 실패했습니다.', 'MissionScreen.handleMissionComplete');
      }
    },
    [missions, completeMissionWithPhoto, showError]
  );

  /**
   * 커스텀 미션 완료 (인증 없이 즉시 완료)
   */
  const handleCompleteCustomMission = useCallback(
    async (missionId: string) => {
      const numericId = parseInt(missionId.replace(/^custom_/, ''), 10);
      if (isNaN(numericId)) {
        showError('미션 ID가 올바르지 않습니다.', 'MissionScreen.handleCompleteCustomMission');
        return;
      }
      setCompletingMissionId(missionId);
      try {
        const result = await completeCustomMission(numericId);
        if (result.success) {
          showSuccess('미션을 완료했어요.');
          await loadMissions();
        } else {
          handleApiError(result, 'MissionScreen.handleCompleteCustomMission');
        }
      } catch (e) {
        showError(e instanceof Error ? e : new Error('미션 완료에 실패했습니다.'), 'MissionScreen.handleCompleteCustomMission');
      } finally {
        setCompletingMissionId(null);
      }
    },
    [loadMissions, showSuccess, showError, handleApiError]
  );

  /**
   * 미션 유형별 인증 처리
   */
  const handleVerify = useCallback(
    async (mission: Mission, verificationType: 'COMMUNITY' | 'GPS' | 'TIME') => {
      let userMissionId = mission.user_mission_id;

      // user_mission_id가 없으면 찾거나 할당
      if (!userMissionId) {
        try {
          const missionId = parseInt(mission.mission_id.replace(/^custom_/, ''), 10);
          if (isNaN(missionId)) {
            showError('미션 정보가 올바르지 않습니다.', 'MissionScreen.handleVerify');
            return;
          }

          // 투두리스트 미션인 경우: getUserMissions에서 찾기
          if (mission.todoListId) {
            const { getUserMissions } = await import('../../api/missionApi');
            const listRes = await getUserMissions({ size: 100 });
            if (listRes.success && listRes.data?.content) {
              const found = listRes.data.content.find(um => um.mission?.id === missionId);
              if (found) {
                userMissionId = found.id;
              }
            }
          }

          // 여전히 없으면 미션 할당 API 호출
          if (!userMissionId) {
            const assignResult = await addSystemMissionToMyMissions({ missionId });
            if (assignResult.success && assignResult.data) {
              userMissionId = assignResult.data.id;
            } else {
              handleApiError(assignResult, 'MissionScreen.handleVerify');
              return;
            }
          }

          // 미션 목록 새로고침하여 user_mission_id 업데이트
          await loadMissions();
        } catch (err) {
          showError(
            err instanceof Error ? err : new Error('미션을 시작하는 중 문제가 발생했습니다.'),
            'MissionScreen.handleVerify'
          );
          return;
        }
      }

      switch (verificationType) {
        case 'COMMUNITY':
          // 인증글 작성 화면으로 이동 (VerificationPostCreate)
          if (!userMissionId) {
            showError('미션 정보가 올바르지 않습니다.', 'MissionScreen.handleVerify.COMMUNITY');
            return;
          }
          try {
            const navParams = {
              userMissionId: userMissionId,
              missionId: mission.mission_id,
              missionTitle: mission.title || '미션',
              missionEmoji: mission.emoji || '🎯',
              photoUrl: mission.photo_url,
            };
            navigation.navigate('VerificationPostCreate' as any, navParams);
          } catch (navError) {
            showError(
              navError instanceof Error ? navError : new Error('화면 이동 중 문제가 발생했습니다.'),
              'MissionScreen.handleVerify.COMMUNITY'
            );
          }
          break;

        case 'GPS':
          // GPS 인증
          try {
            if (!userMissionId) {
              showError('미션 정보가 올바르지 않습니다.', 'MissionScreen.handleVerify.GPS');
              return;
            }

            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
              showInfo('위치 권한이 필요합니다.', '권한 필요');
              return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const result = await verifyByGps(userMissionId, location.coords.latitude, location.coords.longitude);

            if (result.success) {
              showSuccess(`+${result.data?.expReward || 50} EXP를 획득했습니다!`, 'GPS 인증 완료');
              await loadMissions();
            } else {
              handleApiError(result, 'MissionScreen.handleVerify.GPS');
            }
          } catch (err) {
            showError(
              err instanceof Error ? err : new Error('GPS 인증 중 문제가 발생했습니다.'),
              'MissionScreen.handleVerify.GPS'
            );
          }
          break;

        case 'TIME':
          // 시간 인증
          try {
            if (!userMissionId) {
              showError('미션 정보가 올바르지 않습니다.', 'MissionScreen.handleVerify.TIME');
              return;
            }

            const result = await verifyByTime(userMissionId);

            if (result.success) {
              showSuccess(`+${result.data?.expReward || 50} EXP를 획득했습니다!`, '시간 인증 완료');
              await loadMissions();
            } else {
              handleApiError(result, 'MissionScreen.handleVerify.TIME');
            }
          } catch (err) {
            showError(
              err instanceof Error ? err : new Error('시간 인증 중 문제가 발생했습니다.'),
              'MissionScreen.handleVerify.TIME'
            );
          }
          break;
      }
    },
    [navigation, loadMissions, showError, handleApiError, showInfo, showSuccess]
  );

  /**
   * 좋아요 인증 선택 시 (커뮤니티 공유 화면으로 이동)
   */
  const handleLikeVerification = useCallback(() => {
    if (!selectedMissionForVerification) return;

    navigation.navigate('CommunityPostCreate', {
      type: 'VERIFICATION', // 인증 게시글 타입
      userMissionId: selectedMissionForVerification.user_mission_id, // 인증에 필요한 UserMission ID
      missionId: selectedMissionForVerification.mission_id,
      missionTitle: selectedMissionForVerification.title,
      missionEmoji: selectedMissionForVerification.emoji,
      photoUrl: selectedMissionForVerification.photo_url || undefined,
    });
  }, [selectedMissionForVerification, navigation]);

  /**
   * 미션 사진 삭제
   */
  const handleDeletePhoto = useCallback(
    async (missionId: string) => {
      showConfirm(
        '첨부한 사진을 삭제하시겠습니까?',
        async () => {
          try {
            const result = await deleteMissionPhoto(missionId);
            if (result.success) {
              showSuccess('사진이 삭제되었습니다.', '완료');
            } else {
              handleApiError(result, 'MissionScreen.handleDeletePhoto');
            }
          } catch (err) {
            showError(
              err instanceof Error ? err : new Error('사진 삭제 중 오류가 발생했습니다.'),
              'MissionScreen.handleDeletePhoto'
            );
          }
        },
        '사진 삭제'
      );
    },
    [showConfirm, deleteMissionPhoto, showSuccess, handleApiError, showError]
  );

  /**
   * routeParams.activeTab이 변경되면 activeTab 상태 업데이트
   */
  useEffect(() => {
    if (routeParams?.activeTab) {
      setActiveTab(routeParams.activeTab);
    }
  }, [routeParams?.activeTab]);

  /**
   * routeParams.missionGroupTab이 변경되면 missionGroupTab 상태 업데이트
   * 단, activeTab이 'missionGroup'일 때만 적용 (나의 미션 탭에서는 무시)
   */
  useEffect(() => {
    // activeTab이 'missionGroup'이고 missionGroupTab이 전달된 경우에만 업데이트
    if (routeParams?.activeTab === 'missionGroup' && routeParams?.missionGroupTab) {
      setMissionGroupTab(routeParams.missionGroupTab);
    }
  }, [routeParams?.activeTab, routeParams?.missionGroupTab]);

  /**
   * routeParams.selectedFilter가 변경되면 selectedFilter 상태 업데이트
   * 단, activeTab이 'myMission'일 때만 적용 (미션 도감 탭에서는 무시)
   */
  useEffect(() => {
    // activeTab이 'myMission'이고 selectedFilter가 전달된 경우에만 업데이트
    if (routeParams?.activeTab === 'myMission' && routeParams?.selectedFilter) {
      setSelectedFilter(routeParams.selectedFilter);
    }
  }, [routeParams?.activeTab, routeParams?.selectedFilter]);

  /**
   * 미션 완료 취소
   */
  const handleMissionUncomplete = useCallback(
    async (missionId: string) => {
      try {
        await uncompleteMission(missionId);
      } catch (uncompleteError) {
        showError(
          uncompleteError instanceof Error ? uncompleteError : new Error('미션 완료 취소에 실패했습니다.'),
          'MissionScreen.handleMissionUncomplete'
        );
      }
    },
    [uncompleteMission, showError]
  );

  /**
   * 미션 도감 목록 로드 (서버 사이드 페이지네이션 - 한 페이지당 15개)
   */
  const loadGroupMissions = useCallback(
    async (page: number = 0) => {
      try {
        setGroupLoading(true);
        console.log('[MissionScreen] 미션 도감 로딩 시작... (서버 페이지:', page, ', 탭:', missionGroupTab, ')');

        let groupMissions: UnifiedMission[] = [];
        let totalPages = 1;
        let totalElements = 0;

        // 커스텀 미션 탭일 때: 모든 커스텀 미션 조회
        if (missionGroupTab === 'custom') {
          const customMissionsResult = await getCustomMissions({
            page,
            size: MISSION_COLLECTION_PAGE_SIZE,
          });

          if (!customMissionsResult.success || !customMissionsResult.data) {
            console.error('[MissionScreen] 커스텀 미션 API 실패:', customMissionsResult.error);
            handleApiError(customMissionsResult, 'MissionScreen.loadGroupMissions.custom');
            setGroupMissions([]);
            return;
          }

          totalPages = customMissionsResult.data.totalPages || 1;
          totalElements = customMissionsResult.data.totalElements || 0;

          console.log('[MissionScreen] 커스텀 미션 페이징 정보:', {
            currentPage: page,
            totalPages,
            totalElements,
            currentPageCount: customMissionsResult.data.content.length,
          });

          // 커스텀 미션을 UnifiedMission으로 변환 (모든 미션 표시, 잠금 없음)
          groupMissions = customMissionsResult.data.content.map(m => ({
            id: m.id,
            title: m.title, // 커스텀 미션은 항상 제목 표시
            description: m.description, // 커스텀 미션은 항상 설명 표시
            category: m.category,
            verificationType: m.verificationType,
            requiredMinutes: m.requiredMinutes,
            expReward: m.expReward || 0,
            badgeDurationDays: m.badgeDurationDays || 0,
            participantCount: m.participantCount,
            isCustom: true,
            creatorId: m.creatorId,
            creatorNickname: m.creatorNickname,
            isCompleted: false, // 커스텀 미션은 완료 여부와 관계없이 모두 표시
            isAttempted: false, // 커스텀 미션은 시도 여부와 관계없이 모두 표시
            isPublic: m.isPublic,
          }));
        } else {
          // 공식 미션 탭일 때: 기존 로직 (사용자가 수행한 미션만)
          const collectionResult = await getMissionCollection({
            page,
            size: MISSION_COLLECTION_PAGE_SIZE,
          });

          if (!collectionResult.success || !collectionResult.data) {
            console.error('[MissionScreen] 미션 도감 API 실패:', collectionResult.error);
            handleApiError(collectionResult, 'MissionScreen.loadGroupMissions.official');
            setGroupMissions([]);
            return;
          }

          totalPages = collectionResult.data.totalPages || 1;
          totalElements = collectionResult.data.totalElements || 0;

          console.log('[MissionScreen] 미션 도감 페이징 정보:', {
            currentPage: page,
            totalPages,
            totalElements,
            currentPageCount: collectionResult.data.content.length,
          });

          // MissionCollectionItem을 UnifiedMission으로 변환 (모든 미션 정보 표시)
          const allMissions = collectionResult.data.content.map(m => ({
            id: m.id,
            title: m.title, // 모든 미션 제목 표시
            description: m.description, // 모든 미션 설명 표시
            category: m.category,
            verificationType: m.verificationType,
            requiredMinutes: m.requiredMinutes,
            expReward: m.expReward,
            badgeDurationDays: m.badgeDurationDays,
            participantCount: m.participantCount,
            isCustom: m.missionType === 'CUSTOM',
            creatorId: m.creatorId,
            creatorNickname: m.creatorNickname,
            isCompleted: m.isCompleted ?? false,
            isAttempted: m.isAttempted ?? false,
            isPublic: m.isPublic,
          }));

          // 공식 미션만 필터링
          groupMissions = allMissions.filter(m => !m.isCustom);
        }

        // 서버 페이지 정보 저장
        setTotalServerPages(totalPages);

        console.log('[MissionScreen] 현재 페이지 미션 수:', groupMissions.length);
        console.log('[MissionScreen] 탭:', missionGroupTab, ', 미션 수:', groupMissions.length);

        setGroupMissions(groupMissions);
        console.log('[MissionScreen] 미션 도감 로딩 완료:', groupMissions.length, '개');
      } catch (err) {
        console.error('[MissionScreen] 미션 도감 로딩 예외 발생:', err);
        showError(
          err instanceof Error ? err : new Error('미션 도감을 불러오는 중 문제가 발생했습니다.'),
          'MissionScreen.loadGroupMissions'
        );
        setGroupMissions([]);
      } finally {
        setGroupLoading(false);
      }
    },
    [missionGroupTab, handleApiError, showError]
  );

  /**
   * 인증 상태 확인 (게시글 작성 후 복귀 시)
   */
  const checkVerificationOnReturn = useCallback(async () => {
    if (!selectedMissionForVerification) return;

    try {
      const result = await checkVerificationStatus(selectedMissionForVerification.mission_id);
      if (result.success && result.data?.verified) {
        // 인증 완료 시 미션 목록 새로고침
        await loadMissions();
        // 미션 도감도 새로고침 (잠금 해제 반영)
        if (activeTab === 'missionGroup') {
          await loadGroupMissions(currentServerPage);
        }
        showSuccess('미션이 인증되었습니다!', '인증 완료');
      }
    } catch (err) {
      logError('인증 상태 확인 오류', err as Error);
    }
  }, [selectedMissionForVerification, loadMissions, activeTab, currentServerPage, loadGroupMissions, showSuccess]);

  /**
   * 초기 마운트 시 및 activeTab 변경 시 나의 미션 로드
   */
  useEffect(() => {
    if (activeTab === 'myMission') {
      loadMissions();
    }
  }, [activeTab, loadMissions]); // activeTab이 변경될 때마다 실행

  /**
   * 탭 변경 시 미션 도감 로드
   */
  useEffect(() => {
    if (activeTab === 'missionGroup') {
      setCurrentServerPage(0); // 서버 페이지 초기화
      setSelectedGroupMission(null);
      loadGroupMissions(0);
    }
  }, [activeTab, missionGroupTab, loadGroupMissions]);

  /**
   * 서버 페이지 변경 시 미션 도감 로드
   */
  useEffect(() => {
    if (activeTab === 'missionGroup' && currentServerPage >= 0) {
      loadGroupMissions(currentServerPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentServerPage, activeTab]);

  /**
   * 화면 포커스 시 인증 상태 확인 및 미션 목록 새로고침
   */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // 미션 목록 새로고침 (투두리스트에서 미션 완료 후 돌아왔을 때 반영)
      if (activeTab === 'myMission') {
        // 현재 페이지 위치 저장
        savedPageOnFocusRef.current = currentMissionPage;
        loadMissions();
      } else if (activeTab === 'missionGroup') {
        // 미션 도감도 새로고침 (미션 완료 후 반영)
        loadGroupMissions(currentServerPage);
      }
      // 인증 상태 확인
      if (selectedMissionForVerification) {
        checkVerificationOnReturn();
      }
    });
    return unsubscribe;
  }, [navigation, selectedMissionForVerification, checkVerificationOnReturn, activeTab, loadMissions, currentServerPage, loadGroupMissions, currentMissionPage]);

  /**
   * 미션 목록 로드 후 저장된 페이지 위치로 복원
   */
  useEffect(() => {
    if (savedPageOnFocusRef.current !== null && activeTab === 'myMission' && missionPages.length > 0) {
      const savedPage = savedPageOnFocusRef.current;
      // 저장된 페이지가 유효한 범위인지 확인
      if (savedPage >= 0 && savedPage < missionPages.length) {
        // 다음 틱에서 스크롤 (렌더링 완료 후)
        setTimeout(() => {
          goToMissionPage(savedPage);
          savedPageOnFocusRef.current = null; // 복원 후 초기화
        }, 100);
      } else {
        savedPageOnFocusRef.current = null; // 유효하지 않으면 초기화
      }
    }
  }, [missionPages, activeTab, goToMissionPage]);

  /**
   * Pull-to-Refresh 핸들러
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (activeTab === 'myMission') {
        await loadMissions();
      } else {
        await loadGroupMissions();
      }
    } finally {
      setRefreshing(false);
    }
  }, [loadMissions, loadGroupMissions, activeTab]);

  /**
   * 인증 타입 한글 변환
   */
  const getVerificationTypeLabel = useCallback((type?: string) => {
    switch (type) {
      case 'GPS':
        return 'GPS 인증';
      case 'TIME':
        return '시간 인증';
      case 'COMMUNITY':
        return '커뮤니티 인증';
      default:
        return '일반 인증';
    }
  }, []);

  /**
   * 인증 타입 아이콘
   */
  const getVerificationTypeIcon = useCallback((type?: string) => {
    switch (type) {
      case 'GPS':
        return require('../../assets/images/location.png');
      case 'COMMUNITY':
        return require('../../assets/images/high-five.png');
      default:
        return null;
    }
  }, []);

  /**
   * 미션 카테고리 한글 변환
   */
  const getMissionCategoryLabel = useCallback((category?: MissionCategory) => {
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
  }, []);

  /**
   * 완료 모달 확인 핸들러
   */
  const handleCompleteModalConfirm = useCallback(() => {
    setShowCompleteModal(false);
    if (completedMissionForVerification) {
      setSelectedMissionForVerification(completedMissionForVerification);
      setVerificationModalVisible(true);
    }
    setCompletedMissionForVerification(null);
    setIsLevelUp(false);
  }, [completedMissionForVerification]);

  /**
   * 완료 모달 취소 핸들러
   */
  const handleCompleteModalCancel = useCallback(() => {
    setShowCompleteModal(false);
    setCompletedMissionForVerification(null);
    setIsLevelUp(false);
  }, []);

  /**
   * 인증 모달 닫기 핸들러
   */
  const handleVerificationModalClose = useCallback(() => {
    setVerificationModalVisible(false);
    setSelectedMissionForVerification(null);
  }, []);

  /**
   * 인증 성공 핸들러
   */
  const handleVerificationSuccess = useCallback(async () => {
    await loadMissions();
  }, [loadMissions]);

  /**
   * 탭 변경 핸들러
   */
  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key as MissionTab);
  }, []);

  /**
   * 필터 변경 핸들러
   */
  const handleFilterChange = useCallback((key: string) => {
    setSelectedFilter(key as MissionFilter);
  }, []);

  /**
   * 미션 그룹 탭 변경 핸들러
   */
  const handleMissionGroupTabChange = useCallback((key: string) => {
    setMissionGroupTab(key as MissionGroupTab);
  }, []);

  /**
   * 서버 페이지 변경 핸들러
   */
  const handleServerPageChange = useCallback((page: number) => {
    setCurrentServerPage(page);
  }, []);

  return {
    // Mission data
    missions,
    loading,
    error,
    displayedMissions,
    completedMissions,
    totalMissions,
    missionCounts,
    // Filters & Tabs
    selectedFilter,
    activeTab,
    missionGroupTab,
    // Modals
    showAlert,
    alertTitle,
    alertMessage,
    handleCloseAlert,
    showConfirmModal,
    confirmModalTitle,
    confirmModalMessage,
    handleConfirmModalConfirm,
    handleConfirmModalCancel,
    verificationModalVisible,
    selectedMissionForVerification,
    showCompleteModal,
    completeModalTitle,
    completeModalMessage,
    completedMissionForVerification,
    isLevelUp,
    // Mission Group
    groupMissions,
    groupLoading,
    selectedGroupMission,
    setSelectedGroupMission,
    currentServerPage,
    totalServerPages,
    currentUserId,
    // Pagination
    currentMissionPage,
    totalMissionPages,
    missionPages,
    missionFlatListRef,
    refreshing,
    // Handlers
    handleMissionComplete,
    handleCompleteCustomMission,
    completingMissionId,
    handleMissionUncomplete,
    handleVerify,
    handleLikeVerification,
    handleDeletePhoto,
    handleCompleteModalConfirm,
    handleCompleteModalCancel,
    handleVerificationModalClose,
    handleVerificationSuccess,
    handleTabChange,
    handleFilterChange,
    handleMissionGroupTabChange,
    handleServerPageChange,
    onRefresh,
    onMissionPageChange,
    goToMissionPage,
    // Utils
    getVerificationTypeLabel,
    getVerificationTypeIcon,
    getMissionCategoryLabel,
  };
};
