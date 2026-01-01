import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { useMission } from '../hooks/useMission';
import { useCharacter } from '../hooks/useCharacter';
import { useMissionFilters, MissionFilter } from '../hooks/useMissionFilters';
import { useMissionHandlers } from '../hooks/useMissionHandlers';
import { MissionCard, MissionVerificationModal } from '../components/specialized';
import { Card, Loading, ErrorBoundary, Button, Header, EmptyState, SectionTitle, ConfirmModal } from '../components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '../utils/designTokens';
import { RootStackParamList } from '../types/navigation';
import { ScreenNames } from '../types';
import { Mission } from '../types';
import { checkVerificationStatus } from '../api/missionApi';

interface MissionScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route?: RouteProp<RootStackParamList, 'Mission'>;
}

const MissionScreen: React.FC<MissionScreenProps> = ({ navigation, route }) => {
  const { addExperienceByCategory } = useCharacter();
  const {
    missions,
    loading,
    error,
    saveMissionPhoto,
    deleteMissionPhoto,
    completeMissionWithPhoto,
    uncompleteMission,
    loadMissions,
  } = useMission(addExperienceByCategory);

  const [selectedFilter, setSelectedFilter] = useState<MissionFilter>('all');
  const [verificationModalVisible, setVerificationModalVisible] = useState(false);
  const [selectedMissionForVerification, setSelectedMissionForVerification] = useState<Mission | null>(null);
  
  // 미션 완료 모달 상태
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeModalTitle, setCompleteModalTitle] = useState('');
  const [completeModalMessage, setCompleteModalMessage] = useState('');
  const [completedMissionForVerification, setCompletedMissionForVerification] = useState<Mission | null>(null);
  const [isLevelUp, setIsLevelUp] = useState(false);

  const { filteredMissions, completedMissions, totalMissions, progressPercentage } =
    useMissionFilters(missions, selectedFilter);

  const handleUncompleteMission = useCallback(async (missionId: string) => {
    await uncompleteMission(missionId);
  }, [uncompleteMission]);

  const handlers = useMissionHandlers({
    missions,
    saveMissionPhoto,
    deleteMissionPhoto,
    completeMissionWithPhoto,
    uncompleteMission: handleUncompleteMission,
    loadMissions,
    navigation,
  });

  const handleMissionPress = useCallback((mission: Mission) => {
    const nav = navigation as { navigate: (screen: string, params: unknown) => void };
    nav.navigate(ScreenNames.MISSION, { mission });
  }, [navigation]);

  const handleVerificationRequired = useCallback((mission: Mission) => {
    setSelectedMissionForVerification(mission);
    setVerificationModalVisible(true);
  }, []);

  const totalGrowthMissions = filteredMissions.length;
  const displayedMissions = filteredMissions;

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
      missionId: selectedMissionForVerification.mission_id,
      missionTitle: selectedMissionForVerification.title,
      missionEmoji: selectedMissionForVerification.emoji,
      photoUrl: selectedMissionForVerification.photo_url || undefined,
    });
  }, [selectedMissionForVerification, navigation]);

  // 인증 상태 확인 (게시글 작성 후 복귀 시)
  const checkVerificationOnReturn = useCallback(async () => {
    if (!selectedMissionForVerification) return;

    try {
      const result = await checkVerificationStatus(selectedMissionForVerification.mission_id);
      if (result.success && result.data?.verified) {
        await loadMissions();
        Alert.alert('✅ 인증 완료', '미션이 인증되었습니다!');
      }
    } catch (error) {
      console.error('인증 상태 확인 오류:', error);
    }
  }, [selectedMissionForVerification, loadMissions]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (selectedMissionForVerification) {
        checkVerificationOnReturn();
      }
    });
    return unsubscribe;
  }, [navigation, selectedMissionForVerification, checkVerificationOnReturn]);

  useEffect(() => {
    const routeParams = route?.params as Record<string, unknown> | undefined;
    const selectedPhotoUri = routeParams?.selectedPhotoUri as string | undefined;
    const missionId = routeParams?.missionId as string | undefined;
    const timestamp = routeParams?.timestamp as number | undefined;

    if (selectedPhotoUri && missionId && timestamp) {
      const photoKey = `${missionId}_${selectedPhotoUri}_${timestamp}`;
      if (handlers.processedPhotoRef.current !== photoKey) {
        handlers.processedPhotoRef.current = photoKey;
        handlers.handlePhotoSelected(missionId, selectedPhotoUri);

        setTimeout(() => {
          const nav = navigation as { navigate: (screen: string, params: unknown) => void };
          nav.navigate(ScreenNames.MISSION, {});
        }, 0);
      }
    }
  }, [route?.params, handlers, navigation]);

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
        onLikeVerification={() =>
          handlers.handleLikeVerification(selectedMissionForVerification, ScreenNames as Record<string, string>)
        }
        onVerificationSuccess={loadMissions}
      />

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
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

        {/* 필터 탭 */}
        <View style={styles.filterTabs}>
          <View style={styles.filterTabsWrapper}>
            <TouchableOpacity
              style={[styles.filterTab, selectedFilter === 'all' && styles.filterTabActive]}
              onPress={() => setSelectedFilter('all')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterTabText, selectedFilter === 'all' && styles.filterTabTextActive]}>
                전체
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, selectedFilter === 'daily' && styles.filterTabActive]}
              onPress={() => setSelectedFilter('daily')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterTabText, selectedFilter === 'daily' && styles.filterTabTextActive]}>
                진행중
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, selectedFilter === 'completed' && styles.filterTabActive]}
              onPress={() => setSelectedFilter('completed')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterTabText, selectedFilter === 'completed' && styles.filterTabTextActive]}>
                완료
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 미션 목록 */}
        <View style={styles.missionSection}>
          <View style={styles.sectionHeader}>
            <SectionTitle 
              title={
                selectedFilter === 'all' ? `성장 미션 (${totalGrowthMissions}개)` :
                selectedFilter === 'daily' ? `오늘의 미션 (${totalGrowthMissions}개)` :
                `완료한 미션 (${totalGrowthMissions}개)`
              }
              marginBottom={spacing[3]}
            />
          </View>
        )}

          {displayedMissions.length === 0 ? (
            <EmptyState
              iconImage={require('../assets/images/clover.png')}
              title={
                selectedFilter === 'all' ? '아직 미션이 없어요' :
                selectedFilter === 'daily' ? '오늘의 미션이 없어요' :
                '완료한 미션이 없어요'
              }
              description={
                selectedFilter === 'all' ? '새로운 미션이 곧 추가될 예정입니다!' :
                selectedFilter === 'daily' ? '오늘 완료한 미션이 없습니다.' :
                '아직 완료한 미션이 없습니다.'
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
    backgroundColor: colors.background.primary,
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
    marginBottom: spacing[1],
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
