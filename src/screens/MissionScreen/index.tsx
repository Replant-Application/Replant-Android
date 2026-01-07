import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, RefreshControl, Platform, ImageBackground } from 'react-native';
import { useMission } from '../../hooks/useMission';
import { useCharacter } from '../../hooks/useCharacter';
import { MissionCard, MissionVerificationModal, MissionProgressCard } from '../../components/specialized';
import { Loading, ErrorBoundary, Header, EmptyState, ConfirmModal, SimpleTabBar } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { useUser } from '../../contexts/UserContext';
import { Mission } from '../../types';
import { checkVerificationStatus, MissionType, verifyByGps, verifyByTime, createVerification, addSystemMissionToMyMissions } from '../../api/missionApi';
import * as Location from 'expo-location';
import { formatDateYYYYMMDD } from '../../utils/dateUtils';
import { getMyBadges, getBadgeHistory, Badge } from '../../api/badgeApi';
import { logError } from '../../utils/logger';
import { MissionScreenProps, MissionFilter } from './MissionScreen.types';

// 단일 카테고리: 성장

const MissionScreen: React.FC<MissionScreenProps> = ({ navigation, route }) => {
  const { addExperienceByCategory } = useCharacter();
  const { missions, loading, error, saveMissionPhoto, deleteMissionPhoto, completeMissionWithPhoto, uncompleteMission, loadMissions } = useMission(addExperienceByCategory);

  // route params에서 사진 정보 확인
  const routeParams = route?.params;
  const processedPhotoRef = useRef<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<MissionFilter>('inProgress');
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

  // 뱃지 상태
  const [validBadges, setValidBadges] = useState<Badge[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [badgesLoading, setBadgesLoading] = useState(false);


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

  // 뱃지 로딩
  const loadBadges = useCallback(async () => {
    setBadgesLoading(true);
    try {
      const [validResult, historyResult] = await Promise.all([
        getMyBadges(),
        getBadgeHistory({ page: 0, size: 50 })
      ]);

      if (validResult.success && validResult.data) {
        setValidBadges(validResult.data.badges || []);
      }
      if (historyResult.success && historyResult.data) {
        setAllBadges(historyResult.data.content || []);
      }
    } catch (error) {
      logError('뱃지 로딩 오류', error as Error);
    } finally {
      setBadgesLoading(false);
    }
  }, []);

  // 화면 로드 시 뱃지 로딩
  useEffect(() => {
    loadBadges();
  }, [loadBadges]);

  // Pull-to-Refresh 핸들러
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadMissions(), loadBadges()]);
    } finally {
      setRefreshing(false);
    }
  }, [loadMissions, loadBadges]);

  // 뱃지 상세 화면으로 이동
  const handleBadgePress = (badge: Badge) => {
    navigation.navigate('BadgeDetail', { badge });
  };

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
      <Header title="오늘의 미션" showBackButton={false} navigation={navigation} />

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
          />
        )}

        {/* 나의 뱃지 섹션 */}
        <View style={styles.badgeSection}>
          <View style={styles.badgeSectionHeader}>
            <Text style={styles.badgeSectionTitle}>나의 뱃지</Text>
            <TouchableOpacity onPress={() => setShowAllBadges(!showAllBadges)}>
              <Text style={styles.badgeToggleText}>
                {showAllBadges ? '유효한 뱃지만' : '전체 보기'}
              </Text>
            </TouchableOpacity>
          </View>

          {badgesLoading ? (
            <Text style={styles.badgeLoadingText}>뱃지를 불러오는 중...</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[
                styles.badgeList,
                (showAllBadges ? allBadges : validBadges).length === 0 && styles.badgeListEmpty
              ]}
            >
              {(showAllBadges ? allBadges : validBadges).length === 0 ? (
                <View style={styles.noBadgeContainer}>
                  <Text style={styles.noBadgeText}>유효한 뱃지가 없습니다</Text>
                </View>
              ) : (
                // 전체 보기일 때 유효한 뱃지를 먼저 정렬
                (showAllBadges
                  ? [...allBadges].sort((a, b) => {
                      const aExpired = a.isExpired || new Date(a.expiresAt) < new Date();
                      const bExpired = b.isExpired || new Date(b.expiresAt) < new Date();
                      // 유효한 뱃지를 먼저, 그 다음 만료된 뱃지
                      if (aExpired !== bExpired) return aExpired ? 1 : -1;
                      // 같은 상태면 남은 일수 기준 정렬 (적은 것 먼저)
                      return (a.remainingDays || 0) - (b.remainingDays || 0);
                    })
                  : validBadges
                ).map((badge) => {
                  const missionTitle = badge.mission?.title || badge.customMission?.title || '미션';
                  const isExpired = badge.isExpired || new Date(badge.expiresAt) < new Date();

                  return (
                    <TouchableOpacity
                      key={badge.id}
                      style={[styles.badgeItem, isExpired && styles.badgeItemExpired]}
                      onPress={() => handleBadgePress(badge)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.badgeIcon, isExpired && styles.badgeIconExpired]}>
                        <Image
                          source={require('../../assets/images/check2.png')}
                          style={styles.badgeIconImage}
                          resizeMode="contain"
                        />
                      </View>
                      <Text style={[styles.badgeTitle, isExpired && styles.badgeTitleExpired]} numberOfLines={2}>
                        {missionTitle}
                      </Text>
                      {!isExpired && badge.remainingDays !== undefined && (
                        <Text style={styles.badgeRemaining}>
                          D-{badge.remainingDays}
                        </Text>
                      )}
                      {isExpired && (
                        <Text style={styles.badgeExpiredText}>만료됨</Text>
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          )}
        </View>

        {/* 진행중/인증대기/완료 탭 */}
        <SimpleTabBar
          tabs={[
            { key: 'inProgress', label: '진행중' },
            { key: 'pendingVerification', label: '인증 대기' },
            { key: 'completed', label: '완료' },
          ]}
          activeTab={selectedFilter}
          onTabChange={(key) => setSelectedFilter(key as MissionFilter)}
          style={styles.tabBar}
        />

        {/* 미션 목록 */}
        {displayedMissions.length === 0 ? (
          <EmptyState
            iconImage={require('../../assets/images/clover.png')}
            title={
              selectedFilter === 'inProgress'
                ? '완료할 미션이 없어'
                : selectedFilter === 'pendingVerification'
                  ? '인증 대기 중인 미션이 없어요'
                  : '완료한 미션이 없어요'
            }
            description={
              selectedFilter === 'inProgress'
                ? '새로운 미션에 도전해보세요!'
                : selectedFilter === 'pendingVerification'
                  ? '미션을 인증하면 여기에 표시됩니다.'
                  : '미션을 완료하면 여기에 표시됩니다.'
            }
          />
        ) : (
          <View style={styles.missionList}>
            {displayedMissions.map((mission, index) => {
              const verificationType = mission.verification_type || 'COMMUNITY';
              return (
                <TouchableOpacity
                  key={`${mission.mission_id}-${mission.id || index}`}
                  activeOpacity={0.7}
                  onPress={() => {
                    // 미션 카드 클릭 시 항상 미션 상세로 이동
                    navigation.navigate('MissionDetail', { missionId: mission.mission_id || String(mission.id) || '' });
                  }}
                >
                  <MissionCard
                    mission={mission}
                    onComplete={handleMissionComplete}
                    onUncomplete={handleMissionUncomplete}
                    onUploadPhoto={handlePhotoUpload}
                    onDeletePhoto={handleDeletePhoto}
                    // onShareToCommunity={handleShareToCommunity} // 공유 기능 주석 처리
                    onWriteReview={(missionId) => navigation.navigate('MissionDetail', { missionId })}
                    onVerify={handleVerify}
                    onViewDetails={() => navigation.navigate('MissionDetail', { missionId: mission.mission_id || String(mission.id) || '' })}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* 미션 만들기 버튼 */}
        <TouchableOpacity
          style={styles.createButtonTop}
          onPress={() => navigation.navigate('CustomMissionCreate' as any)}
          activeOpacity={0.7}
        >
          <Text style={styles.createButtonTopText}>미션 만들기</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  // 뱃지 섹션 스타일
  badgeSection: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 4,
    borderColor: '#0E0F37',
  },
  badgeSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  badgeSectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  badgeToggleText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  badgeLoadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: spacing[4],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  badgeList: {
    paddingVertical: spacing[2],
    gap: spacing[3],
  },
  badgeListEmpty: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  noBadgeContainer: {
    width: '100%',
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  noBadgeText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  badgeItem: {
    alignItems: 'center',
    width: 80,
    padding: spacing[2],
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    marginRight: spacing[2],
  },
  badgeItemExpired: {
    opacity: 0.5,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  badgeIconExpired: {
    backgroundColor: colors.gray[200],
  },
  badgeIconImage: {
    width: 28,
    height: 28,
  },
  badgeTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  badgeTitleExpired: {
    color: colors.text.tertiary,
  },
  badgeRemaining: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[600],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  badgeExpiredText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
});

export default MissionScreen;
