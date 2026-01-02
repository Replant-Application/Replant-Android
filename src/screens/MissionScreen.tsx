import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useMission } from '../hooks/useMission';
import { useCharacter } from '../hooks/useCharacter';
import { MissionCard, MissionVerificationModal } from '../components/specialized';
import { Card, Loading, ErrorBoundary, Button, Header, EmptyState, SectionTitle, ConfirmModal } from '../components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '../utils/designTokens';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { useUser } from '../contexts/UserContext';
import { Mission } from '../types';
import { checkVerificationStatus, MissionType } from '../api/missionApi';

// 단일 카테고리: 성장

interface MissionScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route?: RouteProp<RootStackParamList, 'Mission'>;
}

type MissionFilter = 'all' | 'daily' | 'completed';
type MissionPeriodFilter = 'DAILY' | 'WEEKLY' | 'MONTHLY';
type MissionSourceFilter = 'REGULAR' | 'CUSTOM';

const MissionScreen: React.FC<MissionScreenProps> = ({ navigation, route }) => {
  const { addExperienceByCategory } = useCharacter();
  const { missions, loading, error, saveMissionPhoto, deleteMissionPhoto, completeMissionWithPhoto, uncompleteMission, loadMissions } = useMission(addExperienceByCategory);

  // route params에서 사진 정보 확인
  const routeParams = route?.params;
  const processedPhotoRef = useRef<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<MissionFilter>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<MissionPeriodFilter>('DAILY');
  const [selectedSource, setSelectedSource] = useState<MissionSourceFilter>('REGULAR');
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

  // 기간별 + 일반/커스텀 필터링된 미션 목록
  const filteredMissions = useMemo(() => {
    let filtered = missions.filter(mission => {
      // mission.type이 있으면 해당 타입으로 필터링, 없으면 DAILY로 간주
      const missionType = mission.type || 'DAILY';
      const isCustomMission = mission.is_custom === true;

      // 기간 필터
      const periodMatch = missionType === selectedPeriod;

      // 일반/커스텀 필터
      const sourceMatch = selectedSource === 'CUSTOM' ? isCustomMission : !isCustomMission;

      return periodMatch && sourceMatch;
    });

    // 추가 필터 적용 (전체/진행중/완료)
    switch (selectedFilter) {
      case 'daily':
        // 오늘 완료한 미션만 표시
        return filtered.filter(mission => {
          if (mission.completed && mission.completed_at) {
            const completedDate = mission.completed_at.split('T')[0];
            return completedDate === today;
          }
          return false;
        });
      case 'completed':
        return filtered.filter(mission => mission.completed);
      case 'all':
      default:
        return filtered;
    }
  }, [missions, selectedPeriod, selectedSource, selectedFilter, today]);

  const totalGrowthMissions = filteredMissions.length;
  const displayedMissions = filteredMissions;


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
      console.error('GPS 인증 처리 오류:', error);
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
      console.error('시간 인증 처리 오류:', error);
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
      missionId: mission.mission_id,
      missionTitle: mission.title,
      missionEmoji: mission.emoji,
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
        onVerificationSuccess={async () => {
          await loadMissions();
        }}
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

        {/* 미션 만들기 버튼 */}
        <TouchableOpacity
          style={styles.createButtonTop}
          onPress={() => navigation.navigate('CustomMissionCreate')}
          activeOpacity={0.7}
        >
          <Text style={styles.createButtonTopText}>+ 미션 만들기</Text>
        </TouchableOpacity>

        {/* 기간 탭 (일간/주간/월간) */}
        <View style={styles.periodTabContainer}>
          <TouchableOpacity
            style={[styles.periodTab, selectedPeriod === 'DAILY' && styles.periodTabActive]}
            onPress={() => setSelectedPeriod('DAILY')}
            activeOpacity={0.7}
          >
            <Text style={[styles.periodTabText, selectedPeriod === 'DAILY' && styles.periodTabTextActive]}>
              일간
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodTab, selectedPeriod === 'WEEKLY' && styles.periodTabActive]}
            onPress={() => setSelectedPeriod('WEEKLY')}
            activeOpacity={0.7}
          >
            <Text style={[styles.periodTabText, selectedPeriod === 'WEEKLY' && styles.periodTabTextActive]}>
              주간
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodTab, selectedPeriod === 'MONTHLY' && styles.periodTabActive]}
            onPress={() => setSelectedPeriod('MONTHLY')}
            activeOpacity={0.7}
          >
            <Text style={[styles.periodTabText, selectedPeriod === 'MONTHLY' && styles.periodTabTextActive]}>
              월간
            </Text>
          </TouchableOpacity>
        </View>

        {/* 일반/커스텀 미션 탭 */}
        <View style={styles.sourceTabContainer}>
          <TouchableOpacity
            style={[styles.sourceTab, selectedSource === 'REGULAR' && styles.sourceTabActive]}
            onPress={() => setSelectedSource('REGULAR')}
            activeOpacity={0.7}
          >
            <Text style={[styles.sourceTabText, selectedSource === 'REGULAR' && styles.sourceTabTextActive]}>
              일반 미션
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sourceTab, selectedSource === 'CUSTOM' && styles.sourceTabActive]}
            onPress={() => setSelectedSource('CUSTOM')}
            activeOpacity={0.7}
          >
            <Text style={[styles.sourceTabText, selectedSource === 'CUSTOM' && styles.sourceTabTextActive]}>
              커스텀 미션
            </Text>
          </TouchableOpacity>
        </View>

        {/* 필터 탭 (전체/진행중/완료) */}
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
                `${selectedSource === 'CUSTOM' ? '커스텀 ' : ''}${
                  selectedFilter === 'all' ? '전체' :
                  selectedFilter === 'daily' ? '오늘의' :
                  '완료한'
                } 미션 (${totalGrowthMissions}개)`
              }
              marginBottom={spacing[3]}
            />
          </View>

          {displayedMissions.length === 0 ? (
            <EmptyState
              iconImage={require('../assets/images/clover.png')}
              title={
                selectedSource === 'CUSTOM'
                  ? '커스텀 미션이 없어요'
                  : selectedFilter === 'all' ? '아직 미션이 없어요' :
                    selectedFilter === 'daily' ? '오늘의 미션이 없어요' :
                    '완료한 미션이 없어요'
              }
              description={
                selectedSource === 'CUSTOM'
                  ? '아래 버튼을 눌러 나만의 미션을 만들어보세요!'
                  : selectedFilter === 'all' ? '새로운 미션이 곧 추가될 예정입니다!' :
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
    paddingBottom: spacing[20], // 하단 탭바 높이 + 여유 공간
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
  createButtonTop: {
    backgroundColor: colors.green[600],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
    ...shadows.base,
  },
  createButtonTopText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  periodTabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[1],
    marginBottom: spacing[3],
    ...shadows.sm,
  },
  periodTab: {
    flex: 1,
    paddingVertical: spacing[3],
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  periodTabActive: {
    backgroundColor: colors.primary[500],
  },
  periodTabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  periodTabTextActive: {
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
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
  sourceTabContainer: {
    flexDirection: 'row',
    marginBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  sourceTab: {
    flex: 1,
    paddingVertical: spacing[3],
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  sourceTabActive: {
    borderBottomColor: colors.primary[600],
  },
  sourceTabText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
  },
  sourceTabTextActive: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.bold,
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
