import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, RefreshControl, Platform, ImageBackground, ActivityIndicator, Dimensions, FlatList } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEMS_PER_PAGE = 5;
import { useMission } from '../../hooks/useMission';
import { useCharacter } from '../../hooks/useCharacter';
import { MissionCard, MissionVerificationModal, MissionProgressCard } from '../../components/specialized';
import { Loading, ErrorBoundary, Header, EmptyState, ConfirmModal, SimpleTabBar } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { useUser } from '../../contexts/UserContext';
import { Mission } from '../../types';
import { checkVerificationStatus, MissionType, verifyByGps, verifyByTime, createVerification, addSystemMissionToMyMissions, getSystemMissions, getCustomMissions, MissionCategory } from '../../api/missionApi';
import * as Location from 'expo-location';
import { formatDateYYYYMMDD } from '../../utils/dateUtils';
import { logError } from '../../utils/logger';
import { MissionScreenProps, MissionFilter, MissionTab } from './MissionScreen.types';

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
  creatorNickname?: string;
}

type MissionGroupTab = 'official' | 'custom';

// 단일 카테고리: 성장

const MissionScreen: React.FC<MissionScreenProps> = ({ navigation, route }) => {
  const { addExperienceByCategory } = useCharacter();
  const { missions, loading, error, saveMissionPhoto, deleteMissionPhoto, completeMissionWithPhoto, uncompleteMission, loadMissions } = useMission(addExperienceByCategory);

  // route params에서 사진 정보 확인
  const routeParams = route?.params;
  const processedPhotoRef = useRef<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<MissionFilter>('inProgress');
  const [activeTab, setActiveTab] = useState<MissionTab>('myMission');
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

  // 미션 도감 관련 상태
  const [missionGroupTab, setMissionGroupTab] = useState<MissionGroupTab>('official');
  const [groupMissions, setGroupMissions] = useState<UnifiedMission[]>([]);
  const [groupLoading, setGroupLoading] = useState(false);
  const [selectedGroupMission, setSelectedGroupMission] = useState<UnifiedMission | null>(null);
  const [currentGroupPage, setCurrentGroupPage] = useState(0);
  const groupFlatListRef = useRef<FlatList>(null);


  // 필터링된 미션 목록 (진행중/인증대기/완료)
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
        // 진행중 미션 (status가 없거나 'ASSIGNED')
        return missions.filter(mission =>
          !mission.completed &&
          mission.status !== 'COMPLETED' &&
          mission.status !== 'PENDING'
        );
    }
  }, [missions, selectedFilter]);

  const displayedMissions = filteredMissions;

  // 진행률 계산
  const completedMissions = useMemo(() =>
    missions.filter(mission => mission.completed).length,
    [missions]
  );
  const totalMissions = missions.length;

  // 미션 목록 페이지네이션 상태
  const [currentMissionPage, setCurrentMissionPage] = useState(0);
  const missionFlatListRef = useRef<FlatList>(null);

  // 페이지 수 계산
  const totalMissionPages = Math.ceil(displayedMissions.length / ITEMS_PER_PAGE);

  // 페이지별 미션 데이터 생성
  const missionPages = useMemo(() => {
    const pages: Mission[][] = [];
    for (let i = 0; i < displayedMissions.length; i += ITEMS_PER_PAGE) {
      pages.push(displayedMissions.slice(i, i + ITEMS_PER_PAGE));
    }
    return pages.length > 0 ? pages : [[]];
  }, [displayedMissions]);

  // 탭 변경 시 페이지 초기화
  useEffect(() => {
    setCurrentMissionPage(0);
    if (missionFlatListRef.current && missionPages.length > 0) {
      missionFlatListRef.current.scrollToIndex({ index: 0, animated: false });
    }
  }, [selectedFilter]);

  // 미션 페이지 변경 핸들러
  const onMissionPageChange = (event: any) => {
    const pageIndex = Math.round(event.nativeEvent.contentOffset.x / (SCREEN_WIDTH - spacing[8]));
    setCurrentMissionPage(pageIndex);
  };

  // 페이지 이동
  const goToMissionPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < totalMissionPages) {
      missionFlatListRef.current?.scrollToIndex({ index: pageIndex, animated: true });
      setCurrentMissionPage(pageIndex);
    }
  };

  // 미션 도감 페이지네이션
  const totalGroupPages = Math.ceil(groupMissions.length / ITEMS_PER_PAGE);

  const groupMissionPages = useMemo(() => {
    const pages: UnifiedMission[][] = [];
    for (let i = 0; i < groupMissions.length; i += ITEMS_PER_PAGE) {
      pages.push(groupMissions.slice(i, i + ITEMS_PER_PAGE));
    }
    return pages.length > 0 ? pages : [[]];
  }, [groupMissions]);

  // 미션 도감 탭 변경 시 페이지 초기화
  useEffect(() => {
    setCurrentGroupPage(0);
    if (groupFlatListRef.current && groupMissionPages.length > 0) {
      setTimeout(() => {
        groupFlatListRef.current?.scrollToIndex({ index: 0, animated: false });
      }, 100);
    }
  }, [missionGroupTab]);

  // 미션 도감 페이지 변경 핸들러
  const onGroupPageChange = (event: any) => {
    const pageIndex = Math.round(event.nativeEvent.contentOffset.x / (SCREEN_WIDTH - spacing[8]));
    setCurrentGroupPage(pageIndex);
  };

  // 미션 도감 페이지 이동
  const goToGroupPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < totalGroupPages) {
      groupFlatListRef.current?.scrollToIndex({ index: pageIndex, animated: true });
      setCurrentGroupPage(pageIndex);
    }
  };

  // 미션 완료 (사진이 있으면 그 사진으로, 없으면 null로)
  const handleMissionComplete = async (missionId: string) => {
    try {
      // 미션에 저장된 사진이 있는지 확인
      const mission = missions.find(m => m.mission_id === missionId);
      const photoUrl = mission?.photo_url || null;

      const result = await completeMissionWithPhoto(missionId, photoUrl);

      if (result && result.success) {
        const completedMission = missions.find(m => m.mission_id === missionId);
        if (!completedMission) return;

        const alertTitle = result.levelUp ? '레벨업!' : '미션 완료';
        const alertMessage = result.levelUp
          ? `축하합니다! 레벨 ${result.newLevel}이 되었습니다!`
          : `+${result.experienceGained} EXP를 획득했습니다!`;

        // 모달 표시
        setIsLevelUp(result.levelUp || false);
        setCompleteModalTitle(alertTitle);
        setCompleteModalMessage(alertMessage);
        setCompletedMissionForVerification(completedMission);
        setShowCompleteModal(true);
      }
    } catch (completeError) {
      Alert.alert('오류', '미션 완료에 실패했습니다.');
    }
  };

  // 미션 유형별 인증 처리
  const handleVerify = useCallback(async (mission: Mission, verificationType: 'COMMUNITY' | 'GPS' | 'TIME') => {
    let userMissionId = mission.user_mission_id;

    // user_mission_id가 없으면 자동으로 미션 할당
    if (!userMissionId) {
      try {
        // 시스템 미션인 경우 미션 할당 API 호출
        const missionId = parseInt(mission.mission_id, 10);
        if (isNaN(missionId)) {
          Alert.alert('오류', '미션 정보가 올바르지 않습니다.');
          return;
        }

        const assignResult = await addSystemMissionToMyMissions({ missionId });
        if (assignResult.success && assignResult.data) {
          userMissionId = assignResult.data.id;
          // 미션 목록 새로고침하여 user_mission_id 업데이트
          await loadMissions();
        } else {
          Alert.alert('오류', assignResult.error || '미션 할당에 실패했습니다.');
          return;
        }
      } catch (error) {
        logError('미션 할당 오류', error as Error);
        Alert.alert('오류', '미션을 시작하는 중 문제가 발생했습니다.');
        return;
      }
    }

    switch (verificationType) {
      case 'COMMUNITY':
        // 인증글 작성 화면으로 이동 (VerificationPostCreate)
        if (!userMissionId) {
          Alert.alert('오류', '미션 정보가 올바르지 않습니다.');
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
          logError('네비게이션 오류', navError as Error);
          Alert.alert('오류', '화면 이동 중 문제가 발생했습니다.');
        }
        break;

      case 'GPS':
        // GPS 인증
        try {
          if (!userMissionId) {
            Alert.alert('오류', '미션 정보가 올바르지 않습니다.');
            return;
          }

          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('권한 필요', '위치 권한이 필요합니다.');
            return;
          }

          const location = await Location.getCurrentPositionAsync({});
          const result = await verifyByGps(
            userMissionId,
            location.coords.latitude,
            location.coords.longitude
          );

          if (result.success) {
            Alert.alert('GPS 인증 완료', `+${result.data?.expReward || 50} EXP를 획득했습니다!`);
            await loadMissions();
          } else {
            Alert.alert('인증 실패', result.error || 'GPS 인증에 실패했습니다.');
          }
        } catch (error) {
          logError('GPS 인증 오류', error as Error);
          Alert.alert('오류', 'GPS 인증 중 문제가 발생했습니다.');
        }
        break;

      case 'TIME':
        // 시간 인증
        try {
          if (!userMissionId) {
            Alert.alert('오류', '미션 정보가 올바르지 않습니다.');
            return;
          }

          const result = await verifyByTime(userMissionId);

          if (result.success) {
            Alert.alert('시간 인증 완료', `+${result.data?.expReward || 50} EXP를 획득했습니다!`);
            await loadMissions();
          } else {
            Alert.alert('인증 실패', result.error || '시간 인증에 실패했습니다.');
          }
        } catch (error) {
          logError('시간 인증 오류', error as Error);
          Alert.alert('오류', '시간 인증 중 문제가 발생했습니다.');
        }
        break;
    }
  }, [navigation, loadMissions]);

  // 좋아요 인증 선택 시 (커뮤니티 공유 화면으로 이동)
  const handleLikeVerification = useCallback(() => {
    if (!selectedMissionForVerification) return;

    navigation.navigate('CommunityPostCreate', {
      missionId: selectedMissionForVerification.mission_id,
      missionTitle: selectedMissionForVerification.title,
      missionEmoji: selectedMissionForVerification.emoji,
      photoUrl: selectedMissionForVerification.photo_url || undefined,
    });
  }, [selectedMissionForVerification, navigation]);

  // GPS 인증 성공 시 (MissionVerificationModal에서 호출)
  const handleGPSVerification = useCallback(async () => {
    if (!selectedMissionForVerification) return;

    try {
      // 경험치 지급
      const experienceToGrant = selectedMissionForVerification.experience || 50;
      if (addExperienceByCategory && selectedMissionForVerification.category_id) {
        const expResult = await addExperienceByCategory(selectedMissionForVerification.category_id, experienceToGrant);
        if (expResult.levelUp) {
          Alert.alert('🎉 레벨업!', `레벨 ${expResult.newLevel}이 되었습니다!\n+${experienceToGrant} EXP 획득!`);
        } else {
          Alert.alert('✅ GPS 인증 완료', `+${experienceToGrant} EXP를 획득했습니다!`);
        }
      }

      setVerificationModalVisible(false);
      setSelectedMissionForVerification(null);
      await loadMissions();
    } catch (error) {
      logError('GPS 인증 처리 오류', error as Error);
      Alert.alert('오류', 'GPS 인증 처리 중 문제가 발생했습니다.');
    }
  }, [selectedMissionForVerification, addExperienceByCategory, loadMissions]);

  // 시간 인증 성공 시 (MissionVerificationModal에서 호출)
  const handleTimeVerification = useCallback(async () => {
    if (!selectedMissionForVerification) return;

    try {
      // 경험치 지급
      const experienceToGrant = selectedMissionForVerification.experience || 50;
      if (addExperienceByCategory && selectedMissionForVerification.category_id) {
        const expResult = await addExperienceByCategory(selectedMissionForVerification.category_id, experienceToGrant);
        if (expResult.levelUp) {
          Alert.alert('🎉 레벨업!', `레벨 ${expResult.newLevel}이 되었습니다!\n+${experienceToGrant} EXP 획득!`);
        } else {
          Alert.alert('✅ 시간 인증 완료', `+${experienceToGrant} EXP를 획득했습니다!`);
        }
      }

      setVerificationModalVisible(false);
      setSelectedMissionForVerification(null);
      await loadMissions();
    } catch (error) {
      logError('시간 인증 처리 오류', error as Error);
      Alert.alert('오류', '시간 인증 처리 중 문제가 발생했습니다.');
    }
  }, [selectedMissionForVerification, addExperienceByCategory, loadMissions]);

  // 인증 상태 확인 (게시글 작성 후 복귀 시)
  const checkVerificationOnReturn = useCallback(async () => {
    if (!selectedMissionForVerification) return;
    
    try {
      const result = await checkVerificationStatus(selectedMissionForVerification.mission_id);
      if (result.success && result.data?.verified) {
        // 인증 완료 시 미션 목록 새로고침
        await loadMissions();
        Alert.alert('✅ 인증 완료', '미션이 인증되었습니다!');
      }
    } catch (error) {
      logError('인증 상태 확인 오류', error as Error);
    }
  }, [selectedMissionForVerification, loadMissions]);

  // 화면 포커스 시 인증 상태 확인
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (selectedMissionForVerification) {
        checkVerificationOnReturn();
      }
    });
    return unsubscribe;
  }, [navigation, selectedMissionForVerification, checkVerificationOnReturn]);

  // 사진 인증 업로드
  const handlePhotoUpload = (missionId: string) => {
    const mission = missions.find(m => m.mission_id === missionId);
    // 사진 선택 화면으로 이동
    navigation.navigate('PhotoSelect', {
      missionId,
      missionTitle: mission?.title || '미션',
    });
  };

  // 커뮤니티에 공유 (나중에 되살릴 수 있도록 주석 처리)
  // const handleShareToCommunity = (missionId: string) => {
  //   const mission = missions.find(m => m.mission_id === missionId);
  //   if (!mission) return;
  //
  //   navigation.navigate('CommunityPostCreate', {
  //     missionId: mission.mission_id,
  //     missionTitle: mission.title,
  //     missionEmoji: mission.emoji,
  //     photoUrl: mission.photo_url || undefined,
  //   });
  // };

  // 미션 사진 삭제
  const handleDeletePhoto = async (missionId: string) => {
    Alert.alert(
      '사진 삭제',
      '첨부한 사진을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteMissionPhoto(missionId);
              if (result.success) {
                Alert.alert('완료', '사진이 삭제되었습니다.');
              } else {
                Alert.alert('오류', result.error || '사진 삭제에 실패했습니다.');
              }
            } catch (error) {
              Alert.alert('오류', '사진 삭제 중 오류가 발생했습니다.');
            }
          }
        }
      ]
    );
  };


  // 사진 선택 후 돌아왔을 때 처리 (사진만 저장, 미션 완료하지 않음)
  const handlePhotoSelected = useCallback(async (missionId: string, photoUri: string) => {
    try {
      const result = await saveMissionPhoto(missionId, photoUri);

      if (result && result.success) {
        Alert.alert(
          '사진 저장',
          '사진이 저장되었습니다.',
          [{ text: '확인' }]
        );
      } else {
        Alert.alert('오류', result?.error || '사진 저장에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '사진 저장에 실패했습니다.');
    }
  }, [saveMissionPhoto]);

  // route params 변경 감지 (한 번만 처리)
  useEffect(() => {
    const selectedPhotoUri = routeParams?.selectedPhotoUri;
    const missionId = routeParams?.missionId;
    const timestamp = routeParams?.timestamp;
    
    if (selectedPhotoUri && missionId && timestamp) {
      // 이미 처리한 사진인지 확인 (타임스탬프 포함)
      const photoKey = `${missionId}_${selectedPhotoUri}_${timestamp}`;
      if (processedPhotoRef.current !== photoKey) {
        processedPhotoRef.current = photoKey;
        handlePhotoSelected(missionId, selectedPhotoUri);
        
        // 처리 후 params 초기화를 위해 빈 params로 navigate
        setTimeout(() => {
          navigation.navigate('Mission', {});
        }, 0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeParams?.timestamp]);

  const handleMissionUncomplete = async (missionId: string) => {
    try {
      await uncompleteMission(missionId);
    } catch (uncompleteError) {
      Alert.alert('오류', '미션 완료 취소에 실패했습니다.');
    }
  };

  // 미션 도감 목록 로드 (한 번에 50개씩 로드, 클라이언트 페이지네이션)
  const loadGroupMissions = useCallback(async () => {
    try {
      setGroupLoading(true);

      if (missionGroupTab === 'official') {
        const result = await getSystemMissions({ page: 0, size: 50 });
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
          setGroupMissions(unifiedMissions);
        }
      } else {
        const result = await getCustomMissions({ page: 0, size: 50 });
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
          setGroupMissions(unifiedMissions);
        }
      }
    } catch (error) {
      logError('미션 도감 로딩 오류', error as Error);
    } finally {
      setGroupLoading(false);
    }
  }, [missionGroupTab]);

  // 탭 변경 시 미션 도감 로드
  useEffect(() => {
    if (activeTab === 'missionGroup') {
      setCurrentGroupPage(0);
      setSelectedGroupMission(null);
      loadGroupMissions();
    }
  }, [activeTab, missionGroupTab, loadGroupMissions]);

  // 인증 타입 한글 변환
  const getVerificationTypeLabel = (type?: string) => {
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

  // Pull-to-Refresh 핸들러
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

  if (loading) {
    return <Loading text="미션을 불러오는 중..." />;
  }

  if (error) {
    return <ErrorBoundary error={error} />;
  }


  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <Header title="미션" showBackButton={false} navigation={navigation} />

      {/* 나의 미션 / 미션 도감 탭 */}
      <View style={styles.topTabContainer}>
        <SimpleTabBar
          tabs={[
            { key: 'myMission', label: '나의 미션' },
            { key: 'missionGroup', label: '미션 도감' },
          ]}
          activeTab={activeTab}
          onTabChange={(key) => setActiveTab(key as MissionTab)}
          style={styles.topTabBar}
        />
      </View>

      {/* 미션 완료 모달 */}
      <ConfirmModal
        visible={showCompleteModal}
        title={completeModalTitle}
        message={completeModalMessage}
        confirmText="인증하기"
        cancelText="나중에"
        onConfirm={() => {
          setShowCompleteModal(false);
          if (completedMissionForVerification) {
            setSelectedMissionForVerification(completedMissionForVerification);
            setVerificationModalVisible(true);
          }
          setCompletedMissionForVerification(null);
          setIsLevelUp(false);
        }}
        onCancel={() => {
          setShowCompleteModal(false);
          setCompletedMissionForVerification(null);
          setIsLevelUp(false);
        }}
        confirmButtonColor={colors.primary[500]}
        image={isLevelUp ? require('../../assets/images/gift.png') : require('../../assets/images/check2.png')}
      />

      {/* 인증 방법 선택 모달 */}
      <MissionVerificationModal
        visible={verificationModalVisible}
        mission={selectedMissionForVerification}
        onClose={() => {
          setVerificationModalVisible(false);
          setSelectedMissionForVerification(null);
        }}
        onLikeVerification={handleLikeVerification}
        onVerificationSuccess={async () => {
          await loadMissions();
        }}
      />

      {/* 나의 미션 콘텐츠 */}
      {activeTab === 'myMission' && (
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
          />
        }
      >
        {/* 진행률 카드 */}
        {totalMissions > 0 && (
          <MissionProgressCard
            completedMissions={completedMissions}
            totalMissions={totalMissions}
            onBadgePress={() => navigation.navigate('MyProgressDetail' as any)}
          />
        )}

        {/* 미션 만들기 버튼 */}
        <TouchableOpacity
          style={styles.createButtonTop}
          onPress={() => navigation.navigate('CustomMissionCreate' as any)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="미션 만들기"
        >
          <Text style={styles.createButtonTopText}>미션 만들기</Text>
        </TouchableOpacity>

        {/* 진행중/인증대기 탭 */}
        <SimpleTabBar
          tabs={[
            { key: 'inProgress', label: '진행중' },
            { key: 'pendingVerification', label: '인증 대기' },
          ]}
          activeTab={selectedFilter}
          onTabChange={(key) => setSelectedFilter(key as MissionFilter)}
          style={styles.tabBar}
        />

        {/* 미션 목록 (페이지네이션) */}
        {displayedMissions.length === 0 ? (
          <EmptyState
            iconImage={require('../../assets/images/clover.png')}
            title={
              selectedFilter === 'inProgress'
                ? '완료할 미션이 없어'
                : '인증 대기 중인 미션이 없어요'
            }
            description={
              selectedFilter === 'inProgress'
                ? '새로운 미션에 도전해보세요!'
                : '미션을 인증하면 여기에 표시됩니다.'
            }
          />
        ) : (
          <>
            <FlatList
              ref={missionFlatListRef}
              data={missionPages}
              renderItem={({ item: pageMissions }) => (
                <View style={styles.missionPageContainer}>
                  {pageMissions.map((mission, index) => (
                    <TouchableOpacity
                      key={`${mission.mission_id}-${mission.id || index}`}
                      activeOpacity={0.7}
                      onPress={() => {
                        navigation.navigate('MissionDetail', { missionId: mission.mission_id || String(mission.id) || '' });
                      }}
                    >
                      <MissionCard
                        mission={mission}
                        onComplete={handleMissionComplete}
                        onUncomplete={handleMissionUncomplete}
                        onUploadPhoto={handlePhotoUpload}
                        onDeletePhoto={handleDeletePhoto}
                        onWriteReview={(missionId) => navigation.navigate('MissionDetail', { missionId })}
                        onVerify={handleVerify}
                        onViewDetails={() => navigation.navigate('MissionDetail', { missionId: mission.mission_id || String(mission.id) || '' })}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              keyExtractor={(_, index) => `mission-page-${index}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onMissionPageChange}
              getItemLayout={(_, index) => ({
                length: SCREEN_WIDTH - spacing[8],
                offset: (SCREEN_WIDTH - spacing[8]) * index,
                index,
              })}
              scrollEnabled={totalMissionPages > 1}
            />

            {/* 페이지 인디케이터 및 네비게이션 */}
            {totalMissionPages > 1 && (
              <View style={styles.paginationContainer}>
                <TouchableOpacity
                  style={[styles.pageArrow, currentMissionPage === 0 && styles.pageArrowDisabled]}
                  onPress={() => goToMissionPage(currentMissionPage - 1)}
                  disabled={currentMissionPage === 0}
                >
                  <Text style={[styles.pageArrowText, currentMissionPage === 0 && styles.pageArrowTextDisabled]}>‹</Text>
                </TouchableOpacity>

                <View style={styles.pageIndicators}>
                  {missionPages.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.pageIndicator,
                        currentMissionPage === index && styles.pageIndicatorActive,
                      ]}
                      onPress={() => goToMissionPage(index)}
                    />
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.pageArrow, currentMissionPage === totalMissionPages - 1 && styles.pageArrowDisabled]}
                  onPress={() => goToMissionPage(currentMissionPage + 1)}
                  disabled={currentMissionPage === totalMissionPages - 1}
                >
                  <Text style={[styles.pageArrowText, currentMissionPage === totalMissionPages - 1 && styles.pageArrowTextDisabled]}>›</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 페이지 정보 */}
            {totalMissionPages > 1 && (
              <Text style={styles.pageInfo}>
                {currentMissionPage + 1} / {totalMissionPages} 페이지
              </Text>
            )}
          </>
        )}
      </ScrollView>
      )}

      {/* 미션 도감 콘텐츠 */}
      {activeTab === 'missionGroup' && (
        <>
          {/* 공식/커스텀 미션 탭 */}
          <View style={styles.groupTabContainer}>
            <SimpleTabBar
              tabs={[
                { key: 'official', label: '공식 미션' },
                { key: 'custom', label: '커스텀 미션' },
              ]}
              activeTab={missionGroupTab}
              onTabChange={(key) => setMissionGroupTab(key as MissionGroupTab)}
              style={styles.groupTabBar}
            />
          </View>

          {groupLoading ? (
            <View style={styles.groupLoadingContainer}>
              <ActivityIndicator size="large" color={colors.primary[500]} />
              <Text style={styles.groupLoadingText}>미션을 불러오는 중...</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.scrollContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[colors.primary[500]]}
                  tintColor={colors.primary[500]}
                />
              }
            >
              {groupMissions.length === 0 ? (
                <EmptyState
                  iconImage={require('../../assets/images/goal.png')}
                  title="미션이 없어요"
                  description="현재 등록된 미션이 없습니다."
                />
              ) : (
                <>
                  {/* 안내 박스 */}
                  <View style={styles.groupInfoBox}>
                    <Image
                      source={require('../../assets/images/RePlant_Logo.png')}
                      style={styles.groupLogoIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.groupInfoText}>
                      미션을 선택하면 상세 정보를 볼 수 있어요
                    </Text>
                  </View>

                  {/* 미션 목록 (페이지네이션) */}
                  <FlatList
                    ref={groupFlatListRef}
                    data={groupMissionPages}
                    renderItem={({ item: pageMissions }) => (
                      <View style={styles.groupPageContainer}>
                        {pageMissions.map((mission) => (
                          <View key={mission.id}>
                            <TouchableOpacity
                              style={[
                                styles.groupMissionCard,
                                selectedGroupMission?.id === mission.id && styles.groupMissionCardSelected,
                              ]}
                              onPress={() => {
                                setSelectedGroupMission(
                                  selectedGroupMission?.id === mission.id ? null : mission
                                );
                              }}
                              activeOpacity={0.7}
                            >
                              <View style={styles.groupMissionHeader}>
                                <View style={styles.groupMissionInfo}>
                                  <View style={styles.groupMissionTitleRow}>
                                    <Image
                                      source={require('../../assets/images/goal.png')}
                                      style={styles.groupMissionIcon}
                                      resizeMode="contain"
                                    />
                                    <Text style={styles.groupMissionTitle}>{mission.title}</Text>
                                    {mission.category && (
                                      <View style={styles.groupMissionTypeBadge}>
                                        <Text style={styles.groupMissionTypeText}>
                                          {getMissionCategoryLabel(mission.category)}
                                        </Text>
                                      </View>
                                    )}
                                  </View>
                                  <Text style={styles.groupMissionDescription} numberOfLines={2}>
                                    {mission.description}
                                  </Text>
                                </View>
                              </View>

                              <View style={styles.groupMissionContent}>
                                <View style={styles.groupMissionVerificationInfo}>
                                  {getVerificationTypeIcon(mission.verificationType) && (
                                    <Image
                                      source={getVerificationTypeIcon(mission.verificationType)!}
                                      style={styles.groupVerificationIcon}
                                      resizeMode="contain"
                                    />
                                  )}
                                  <Text style={styles.groupMissionVerificationText}>
                                    {getVerificationTypeLabel(mission.verificationType)}
                                  </Text>
                                </View>
                              </View>

                              <View style={styles.groupMissionFooter}>
                                <View style={styles.groupMissionStats}>
                                  <View style={styles.groupStatItem}>
                                    <Image
                                      source={require('../../assets/images/sun.png')}
                                      style={styles.groupStatIcon}
                                      resizeMode="contain"
                                    />
                                    <Text style={styles.groupStatText}>{mission.expReward} EXP</Text>
                                  </View>
                                  <View style={styles.groupStatItem}>
                                    <Image
                                      source={require('../../assets/images/high-five.png')}
                                      style={styles.groupStatIcon}
                                      resizeMode="contain"
                                    />
                                    <Text style={styles.groupStatText}>
                                      참여 {mission.participantCount || 0}명
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            </TouchableOpacity>

                            {/* 선택된 미션 상세 정보 */}
                            {selectedGroupMission?.id === mission.id && (
                              <View style={styles.groupInlineDetailContainer}>
                                <View style={styles.groupInlineDetailCard}>
                                  <Text style={styles.groupDetailTitle}>미션 정보</Text>
                                  <View style={styles.groupDetailRow}>
                                    <Text style={styles.groupDetailLabel}>미션명</Text>
                                    <Text style={styles.groupDetailValue}>{selectedGroupMission.title}</Text>
                                  </View>
                                  <View style={styles.groupDetailRow}>
                                    <Text style={styles.groupDetailLabel}>설명</Text>
                                    <Text style={styles.groupDetailValue}>{selectedGroupMission.description}</Text>
                                  </View>
                                  <View style={styles.groupDetailRow}>
                                    <Text style={styles.groupDetailLabel}>인증 방식</Text>
                                    <Text style={styles.groupDetailValue}>
                                      {getVerificationTypeLabel(selectedGroupMission.verificationType)}
                                    </Text>
                                  </View>
                                  <View style={styles.groupDetailRow}>
                                    <Text style={styles.groupDetailLabel}>보상</Text>
                                    <Text style={styles.groupDetailValue}>
                                      {selectedGroupMission.expReward} EXP + 뱃지 ({selectedGroupMission.badgeDurationDays}일)
                                    </Text>
                                  </View>
                                  {selectedGroupMission.requiredMinutes && (
                                    <View style={styles.groupDetailRow}>
                                      <Text style={styles.groupDetailLabel}>필요 시간</Text>
                                      <Text style={styles.groupDetailValue}>{selectedGroupMission.requiredMinutes}분</Text>
                                    </View>
                                  )}

                                  <TouchableOpacity
                                    style={styles.groupDetailButton}
                                    onPress={() => navigation.navigate('MissionDetail', { missionId: String(selectedGroupMission.id) })}
                                    activeOpacity={0.7}
                                  >
                                    <Text style={styles.groupDetailButtonText}>미션 상세 보기</Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            )}
                          </View>
                        ))}
                      </View>
                    )}
                    keyExtractor={(_, index) => `group-page-${index}`}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={onGroupPageChange}
                    getItemLayout={(_, index) => ({
                      length: SCREEN_WIDTH - spacing[8],
                      offset: (SCREEN_WIDTH - spacing[8]) * index,
                      index,
                    })}
                    scrollEnabled={totalGroupPages > 1}
                  />

                  {/* 페이지 인디케이터 및 네비게이션 */}
                  {totalGroupPages > 1 && (
                    <View style={styles.paginationContainer}>
                      <TouchableOpacity
                        style={[styles.pageArrow, currentGroupPage === 0 && styles.pageArrowDisabled]}
                        onPress={() => goToGroupPage(currentGroupPage - 1)}
                        disabled={currentGroupPage === 0}
                      >
                        <Text style={[styles.pageArrowText, currentGroupPage === 0 && styles.pageArrowTextDisabled]}>‹</Text>
                      </TouchableOpacity>

                      <View style={styles.pageIndicators}>
                        {groupMissionPages.map((_, index) => (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.pageIndicator,
                              currentGroupPage === index && styles.pageIndicatorActive,
                            ]}
                            onPress={() => goToGroupPage(index)}
                          />
                        ))}
                      </View>

                      <TouchableOpacity
                        style={[styles.pageArrow, currentGroupPage === totalGroupPages - 1 && styles.pageArrowDisabled]}
                        onPress={() => goToGroupPage(currentGroupPage + 1)}
                        disabled={currentGroupPage === totalGroupPages - 1}
                      >
                        <Text style={[styles.pageArrowText, currentGroupPage === totalGroupPages - 1 && styles.pageArrowTextDisabled]}>›</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* 페이지 정보 */}
                  {totalGroupPages > 1 && (
                    <Text style={styles.pageInfo}>
                      {currentGroupPage + 1} / {totalGroupPages} 페이지
                    </Text>
                  )}
                </>
              )}
            </ScrollView>
          )}
        </>
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topTabContainer: {
    paddingHorizontal: spacing[3],
    paddingTop: spacing[2],
    paddingBottom: spacing[1],
  },
  topTabBar: {
    marginBottom: 0,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    marginBottom: spacing[4],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize['2xl']),
  },
  tabBar: {
    marginBottom: spacing[4],
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[20], // 하단 탭바 높이 + 여유 공간
  },
  createButtonTop: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary[500],
    borderRadius: borderRadius.base,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[4],
  },
  createButtonTopText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.primary[500],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  missionList: {
    gap: spacing[1],
  },
  // 페이지네이션 관련 스타일
  missionPageContainer: {
    width: SCREEN_WIDTH - spacing[8],
    gap: spacing[1],
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing[4],
    gap: spacing[3],
  },
  pageArrow: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageArrowDisabled: {
    backgroundColor: colors.gray[100],
  },
  pageArrowText: {
    fontSize: typography.fontSize['2xl'],
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  pageArrowTextDisabled: {
    color: colors.gray[400],
  },
  pageIndicators: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  pageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[300],
  },
  pageIndicatorActive: {
    backgroundColor: colors.primary[500],
    width: 20,
  },
  pageInfo: {
    textAlign: 'center',
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  // 미션 도감 관련 스타일
  groupTabContainer: {
    paddingHorizontal: spacing[3],
    paddingTop: spacing[1],
    paddingBottom: spacing[1],
  },
  groupTabBar: {
    marginBottom: 0,
  },
  groupLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[8],
  },
  groupLoadingText: {
    marginTop: spacing[3],
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  groupInfoBox: {
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
  groupLogoIcon: {
    width: 24,
    height: 24,
  },
  groupInfoText: {
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
  groupMissionList: {
    marginBottom: spacing[4],
  },
  groupPageContainer: {
    width: SCREEN_WIDTH - spacing[8],
  },
  groupMissionCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[3],
    marginBottom: spacing[1],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  groupMissionCardSelected: {
    borderColor: colors.primary[500],
    borderWidth: 2,
    backgroundColor: colors.primary[50],
  },
  groupMissionHeader: {
    marginBottom: spacing[2],
  },
  groupMissionInfo: {
    flex: 1,
  },
  groupMissionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
    gap: spacing[1.5],
  },
  groupMissionIcon: {
    width: 20,
    height: 20,
  },
  groupMissionTitle: {
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
  groupMissionTypeBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.base,
  },
  groupMissionTypeText: {
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
  groupMissionDescription: {
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
  groupMissionContent: {
    marginBottom: spacing[2],
  },
  groupMissionVerificationInfo: {
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
  groupVerificationIcon: {
    width: 14,
    height: 14,
  },
  groupMissionVerificationText: {
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
  groupMissionFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing[2],
  },
  groupMissionStats: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  groupStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  groupStatIcon: {
    width: 16,
    height: 16,
  },
  groupStatText: {
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
  groupInlineDetailContainer: {
    marginTop: spacing[2],
    marginBottom: spacing[3],
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[400],
    marginLeft: spacing[2],
    paddingLeft: spacing[3],
  },
  groupInlineDetailCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  groupDetailTitle: {
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
  groupDetailRow: {
    marginBottom: spacing[3],
  },
  groupDetailLabel: {
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
  groupDetailValue: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  groupDetailButton: {
    backgroundColor: colors.green[500],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing[4],
  },
  groupDetailButtonText: {
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
});

export default MissionScreen;
