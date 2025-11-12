import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useMission } from '../hooks/useMission';
import { useCharacter } from '../hooks/useCharacter';
import { MissionCard } from '../components/specialized';
import { Card, Loading, ErrorBoundary, Button, Header, EmptyState, SectionTitle } from '../components/ui';
import { colors, spacing, typography, borderRadius } from '../utils/designTokens';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

// 단일 카테고리: 성장

interface MissionScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route?: RouteProp<RootStackParamList, 'Mission'>;
}

type MissionFilter = 'all' | 'daily' | 'completed';

const MissionScreen: React.FC<MissionScreenProps> = ({ navigation, route }) => {
  const { addExperienceByCategory } = useCharacter();
  const { missions, loading, error, saveMissionPhoto, completeMissionWithPhoto, uncompleteMission } = useMission(addExperienceByCategory);
  
  // route params에서 사진 정보 확인
  const routeParams = route?.params;
  const processedPhotoRef = useRef<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<MissionFilter>('all');

  // 오늘 날짜 (YYYY-MM-DD 형식)
  const today = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // 필터링된 미션 목록
  const filteredMissions = useMemo(() => {
    switch (selectedFilter) {
      case 'daily':
        // 오늘 완료한 미션만 표시
        return missions.filter(mission => {
          if (mission.completed && mission.completed_at) {
            const completedDate = mission.completed_at.split('T')[0];
            return completedDate === today;
          }
          return false;
        });
      case 'completed':
        return missions.filter(mission => mission.completed);
      case 'all':
      default:
        return missions;
    }
  }, [missions, selectedFilter, today]);

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
        const mission = missions.find(m => m.mission_id === missionId);
        if (!mission) return;

        const alertTitle = result.levelUp ? '🎉 레벨업!' : '✅ 미션 완료';
        const alertMessage = result.levelUp
          ? `축하합니다! 레벨 ${result.newLevel}이 되었습니다!`
          : `+${result.experienceGained} EXP를 획득했습니다!`;

          Alert.alert(
          alertTitle,
          alertMessage,
          [
            { text: '나중에', style: 'cancel' },
            {
              text: '커뮤니티에 공유',
              onPress: () => {
                navigation.navigate('CommunityPostCreate', {
                  missionId: mission.mission_id,
                  missionTitle: mission.title,
                  missionEmoji: mission.emoji,
                  photoUrl: mission.photo_url || undefined,
                });
              },
            },
          ]
          );
      }
    } catch (completeError) {
      Alert.alert('오류', '미션 완료에 실패했습니다.');
    }
  };

  // 사진 인증 업로드
  const handlePhotoUpload = (missionId: string) => {
    // 사진 선택 화면으로 이동
    navigation.navigate('PhotoSelect', {
      missionId,
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

      <ScrollView style={styles.content}>
        {/* 진행률 표시 */}
        {totalMissions > 0 && (
          <Card style={styles.progressCard}>
            <Text style={styles.progressTitle}>진행률</Text>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                {completedMissions}개 완료 / {totalMissions}개
              </Text>
              <Text style={styles.progressPercentage}>
                {Math.round(progressPercentage)}%
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
          </Card>
        )}

        {/* 필터 탭 */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, selectedFilter === 'all' && styles.filterTabActive]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={[styles.filterTabText, selectedFilter === 'all' && styles.filterTabTextActive]}>
              전체
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, selectedFilter === 'daily' && styles.filterTabActive]}
            onPress={() => setSelectedFilter('daily')}
          >
            <Text style={[styles.filterTabText, selectedFilter === 'daily' && styles.filterTabTextActive]}>
              오늘의 미션
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, selectedFilter === 'completed' && styles.filterTabActive]}
            onPress={() => setSelectedFilter('completed')}
          >
            <Text style={[styles.filterTabText, selectedFilter === 'completed' && styles.filterTabTextActive]}>
              완료한 미션
            </Text>
          </TouchableOpacity>
        </View>

        {/* 미션 목록 */}
        <View style={styles.missionSection}>
          <View style={styles.sectionHeader}>
            <SectionTitle title={
              selectedFilter === 'all' ? `성장 미션 (${totalGrowthMissions}개)` :
              selectedFilter === 'daily' ? `오늘의 미션 (${totalGrowthMissions}개)` :
              `완료한 미션 (${totalGrowthMissions}개)`
            } />
          </View>

          {displayedMissions.length === 0 ? (
            <EmptyState
              icon={'🌱'}
              title={
                selectedFilter === 'all' ? '아직 미션이 없어요' :
                selectedFilter === 'daily' ? '오늘의 미션이 없어요' :
                '완료한 미션이 없어요'
              }
              description={
                selectedFilter === 'all' ? '새로운 미션이 곧 추가될 예정입니다!' :
                selectedFilter === 'daily' ? '오늘 완료한 미션이 없습니다. 미션을 완료해보세요!' :
                '아직 완료한 미션이 없습니다. 미션을 완료해보세요!'
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
                  onShareToCommunity={handleShareToCommunity}
                  style={styles.missionCard}
                />
              ))}
              <Button
                title="미션 만들기"
                onPress={() => navigation.navigate('CustomMissionCreate')}
                style={styles.createButton}
                textStyle={{ color: colors.white }}
              />
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
    padding: spacing[5],
  },
  progressCard: {
    marginBottom: spacing[6],
  },
  progressTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  progressPercentage: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[500],
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.sm,
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
    marginBottom: spacing[3],
  },
  createButton: {
    backgroundColor: colors.primary[500],
    marginTop: spacing[4],
    alignSelf: 'center',
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
    flexDirection: 'row',
    marginBottom: spacing[4],
    gap: spacing[2],
    paddingHorizontal: spacing[1],
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.base,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  filterTabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  filterTabTextActive: {
    color: colors.primary[700],
    fontWeight: typography.fontWeight.semibold,
  },
});

export default MissionScreen;
