import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useMission } from '../hooks/useMission';
import { useCharacter } from '../hooks/useCharacter';
import { useLocation } from '../hooks/useLocation';
import { MissionCard, MissionVerificationModal } from '../components/specialized';
import { Card, Loading, ErrorBoundary, Button, Header, EmptyState, SectionTitle, ConfirmModal } from '../components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '../utils/designTokens';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { useUser } from '../contexts/UserContext';
import { Mission } from '../types';
import { checkVerificationStatus, verifyByGps, verifyByTime, MissionType } from '../api/missionApi';

// 단일 카테고리: 성장

interface MissionScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route?: RouteProp<RootStackParamList, 'Mission'>;
}

type MissionPeriodFilter = 'DAILY' | 'WEEKLY' | 'MONTHLY';

const MissionScreen: React.FC<MissionScreenProps> = ({ navigation, route }) => {
  const { addExperienceByCategory } = useCharacter();
  const { missions, loading, error, saveMissionPhoto, deleteMissionPhoto, completeMissionWithPhoto, uncompleteMission, loadMissions } = useMission(addExperienceByCategory);
  const { userLocation, requestLocationPermission } = useLocation();

  // route params에서 사진 정보 확인
  const routeParams = route?.params;
  const processedPhotoRef = useRef<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<MissionPeriodFilter>('DAILY');
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

  // 오늘 날짜 (YYYY-MM-DD 형식)
  const today = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // 기간별 필터링된 미션 목록
  const filteredMissions = useMemo(() => {
    return missions.filter(mission => {
      // mission.type이 있으면 해당 타입으로 필터링, 없으면 DAILY로 간주
      const missionType = mission.type || 'DAILY';
      return missionType === selectedPeriod;
    });
  }, [missions, selectedPeriod]);

  const totalGrowthMissions = filteredMissions.length;
  const displayedMissions = filteredMissions;

  // 미션 초기화 (새로고침)
  const handleRefreshMissions = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadMissions();
    } catch (err) {
      Alert.alert('오류', '미션을 새로고침하는 데 실패했습니다.');
    } finally {
      setRefreshing(false);
    }
  }, [loadMissions]);

  // 미션 초기화 버튼 핸들러
  const handleResetMissions = useCallback(() => {
    Alert.alert(
      '미션 초기화',
      '새로운 미션을 불러옵니다. 진행 중인 미션은 초기화됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '초기화',
          style: 'destructive',
          onPress: async () => {
            await handleRefreshMissions();
            Alert.alert('완료', '미션이 초기화되었습니다.');
          }
        }
      ]
    );
  }, [handleRefreshMissions]);


  // 진행률 계산
  const completedMissions = useMemo(() =>
    missions.filter(mission => mission.completed).length,
    [missions]
  );
  const totalMissions = missions.length;
  const progressPercentage = totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;

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

  // 좋아요 인증 선택 시 (커뮤니티 공유 화면으로 이동)
  const handleLikeVerification = useCallback(() => {
    if (!selectedMissionForVerification) return;

    navigation.navigate('CommunityPostCreate', {
      missionId: selectedMissionForVerification.mission_id || '',
      missionTitle: selectedMissionForVerification.title || '미션',
      missionEmoji: selectedMissionForVerification.emoji || '🎯',
      photoUrl: selectedMissionForVerification.photo_url || undefined,
    });
  }, [selectedMissionForVerification, navigation]);

  // GPS 인증 선택 시
  const handleGPSVerification = useCallback(async () => {
    if (!selectedMissionForVerification) return;

    // 위치 권한 요청
    await requestLocationPermission();

    if (!userLocation) {
      Alert.alert('위치 오류', '현재 위치를 가져올 수 없습니다. 위치 권한을 확인해주세요.');
      return;
    }

    try {
      const userMissionId = parseInt(selectedMissionForVerification.mission_id, 10);
      const result = await verifyByGps(userMissionId, userLocation.lat, userLocation.lng);

      if (result.success && result.data) {
        Alert.alert(
          '인증 완료!',
          `GPS 인증이 완료되었습니다.\n+${result.data.expReward} EXP 획득!`
        );
        setVerificationModalVisible(false);
        setSelectedMissionForVerification(null);
        await loadMissions();
      } else {
        Alert.alert('인증 실패', result.error || 'GPS 인증에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', 'GPS 인증 중 오류가 발생했습니다.');
    }
  }, [selectedMissionForVerification, userLocation, requestLocationPermission, loadMissions]);

  // 시간 인증 선택 시
  const handleTimeVerification = useCallback(async () => {
    if (!selectedMissionForVerification) return;

    try {
      const userMissionId = parseInt(selectedMissionForVerification.mission_id, 10);
      const result = await verifyByTime(userMissionId);

      if (result.success && result.data) {
        Alert.alert(
          '인증 완료!',
          `시간 인증이 완료되었습니다.\n+${result.data.expReward} EXP 획득!`
        );
        setVerificationModalVisible(false);
        setSelectedMissionForVerification(null);
        await loadMissions();
      } else {
        Alert.alert('인증 실패', result.error || '시간 인증에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '시간 인증 중 오류가 발생했습니다.');
    }
  }, [selectedMissionForVerification, loadMissions]);

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
      console.error('인증 상태 확인 오류:', error);
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

  // 커뮤니티에 공유
  const handleShareToCommunity = (missionId: string) => {
    const mission = missions.find(m => m.mission_id === missionId);
    if (!mission) return;

    navigation.navigate('CommunityPostCreate', {
      missionId: mission.mission_id || '',
      missionTitle: mission.title || '미션',
      missionEmoji: mission.emoji || '🎯',
      photoUrl: mission.photo_url || undefined,
    });
  };

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

  if (loading) {
    return <Loading text="미션을 불러오는 중..." />;
  }

  if (error) {
    return <ErrorBoundary error={error} />;
  }

  return (
    <View style={styles.container}>
      <Header />

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
        image={isLevelUp ? require('../assets/images/gift.png') : require('../assets/images/check2.png')}
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
        onGPSVerification={handleGPSVerification}
        onTimeVerification={handleTimeVerification}
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
            onRefresh={handleRefreshMissions}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
          />
        }
      >
        {/* 진행률 표시 */}
        {totalMissions > 0 && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>나의 진행률</Text>
              <Text style={styles.progressPercentage}>
                {Math.round(progressPercentage)}%
              </Text>
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                진행 중 {totalMissions - completedMissions} · 완료 {completedMissions}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPercentage}%` }
                ]}
              />
            </View>
          </View>
        )}

        {/* 기간별 탭 (일간/주간/월간) */}
        <View style={styles.filterTabs}>
          <View style={styles.filterTabsWrapper}>
            <TouchableOpacity
              style={[styles.filterTab, selectedPeriod === 'DAILY' && styles.filterTabActive]}
              onPress={() => setSelectedPeriod('DAILY')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterTabText, selectedPeriod === 'DAILY' && styles.filterTabTextActive]}>
                일간
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, selectedPeriod === 'WEEKLY' && styles.filterTabActive]}
              onPress={() => setSelectedPeriod('WEEKLY')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterTabText, selectedPeriod === 'WEEKLY' && styles.filterTabTextActive]}>
                주간
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, selectedPeriod === 'MONTHLY' && styles.filterTabActive]}
              onPress={() => setSelectedPeriod('MONTHLY')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterTabText, selectedPeriod === 'MONTHLY' && styles.filterTabTextActive]}>
                월간
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 미션 목록 */}
        <View style={styles.missionSection}>
          <View style={styles.sectionHeader}>
            <SectionTitle
              title={
                selectedPeriod === 'DAILY' ? `일간 미션 (${totalGrowthMissions}개)` :
                selectedPeriod === 'WEEKLY' ? `주간 미션 (${totalGrowthMissions}개)` :
                `월간 미션 (${totalGrowthMissions}개)`
              }
              marginBottom={spacing[3]}
            />
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetMissions}
              activeOpacity={0.7}
            >
              <Text style={styles.resetButtonText}>🔄 초기화</Text>
            </TouchableOpacity>
          </View>

          {displayedMissions.length === 0 ? (
            <EmptyState
              iconImage={require('../assets/images/clover.png')}
              title={
                selectedPeriod === 'DAILY' ? '일간 미션이 없어요' :
                selectedPeriod === 'WEEKLY' ? '주간 미션이 없어요' :
                '월간 미션이 없어요'
              }
              description={
                selectedPeriod === 'DAILY' ? '새로운 일간 미션이 곧 추가될 예정입니다!' :
                selectedPeriod === 'WEEKLY' ? '새로운 주간 미션이 곧 추가될 예정입니다!' :
                '새로운 월간 미션이 곧 추가될 예정입니다!'
              }
            />
          ) : (
            <View style={styles.missionList}>
              {displayedMissions.map((mission, index) => (
                <MissionCard
                  key={`${mission.mission_id}-${mission.id || index}`}
                  mission={mission}
                  onComplete={handleMissionComplete}
                  onUncomplete={handleMissionUncomplete}
                  onUploadPhoto={handlePhotoUpload}
                  onDeletePhoto={handleDeletePhoto}
                  onShareToCommunity={handleShareToCommunity}
                  style={styles.missionCard}
                />
              ))}
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate('CustomMissionCreate')}
                activeOpacity={0.7}
              >
                <Text style={styles.createButtonText}>미션 만들기</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[1],
  },
  progressCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    marginBottom: spacing[5],
    ...shadows.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  progressTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  progressPercentage: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },
  progressInfo: {
    marginBottom: spacing[3],
  },
  progressText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  progressBar: {
    height: 12,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.full,
  },
  categorySection: {
    marginBottom: spacing[6],
  },
  missionCount: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  categoryList: {
    paddingHorizontal: spacing[1],
  },
  categoryButton: {
    alignItems: 'center',
    padding: spacing[3],
    marginHorizontal: spacing[1],
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    minWidth: 80,
  },
  selectedCategory: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[500],
  },
  categoryEmoji: {
    fontSize: typography.fontSize.xl,
    marginBottom: spacing[1],
  },
  categoryName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: colors.primary[500],
    fontWeight: typography.fontWeight.semibold,
  },
  missionSection: {
    marginBottom: spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[1],
  },
  resetButton: {
    backgroundColor: colors.gray[100],
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  resetButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  createButton: {
    backgroundColor: colors.green[700],
    borderRadius: borderRadius.full,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[24],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[4],
    marginBottom: spacing[6],
    alignSelf: 'center',
    ...shadows.base,
  },
  createButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },

  missionListContainer: {
    gap: spacing[4],
  },


  missionList: {
    gap: spacing[3],
  },

  missionCard: {
    marginBottom: spacing[3],
  },
  filterTabs: {
    marginBottom: spacing[5],
  },
  filterTabsWrapper: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.xl,
    padding: spacing[1],
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  filterTabActive: {
    backgroundColor: colors.primary[500],
    ...shadows.sm,
  },
  filterTabText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  filterTabTextActive: {
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default MissionScreen;
