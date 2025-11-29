import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { useMission } from '../hooks/useMission';
import { useCharacter } from '../hooks/useCharacter';
import { useMissionFilters, MissionFilter } from '../hooks/useMissionFilters';
import { useMissionHandlers } from '../hooks/useMissionHandlers';
import {
  MissionVerificationModal,
  MissionFilterBar,
  MissionProgressCard,
  MissionList,
} from '../components/specialized';
import { Loading, ErrorBoundary, Header, Button } from '../components/ui';
import { colors, spacing } from '../utils/designTokens';
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

      <ScrollView style={styles.content}>
        {totalMissions > 0 && (
          <MissionProgressCard
            completedMissions={completedMissions}
            totalMissions={totalMissions}
            progressPercentage={progressPercentage}
          />
        )}

        <MissionFilterBar
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />

        {/* 전체 미션 필터일 때만 미션 만들기 버튼 표시 */}
        {selectedFilter === 'all' && (
          <View style={styles.createButtonContainer}>
            <Button
              title="미션 만들기"
              onPress={() => {
                const nav = navigation as { navigate: (screen: string, params?: unknown) => void };
                nav.navigate(ScreenNames.CUSTOM_MISSION_CREATE);
              }}
              style={styles.createButton}
              textStyle={styles.createButtonText}
            />
          </View>
        )}

        <MissionList
          missions={filteredMissions}
          onMissionPress={handleMissionPress}
          onMissionComplete={(missionId) =>
            handlers.handleMissionComplete(missionId, handleVerificationRequired)
          }
          onMissionUncomplete={handlers.handleMissionUncomplete}
          onPhotoUpload={(missionId) => handlers.handlePhotoUpload(missionId, ScreenNames as Record<string, string>)}
          onShareToCommunity={(missionId) => handlers.handleShareToCommunity(missionId, ScreenNames as Record<string, string>)}
          onDeletePhoto={handlers.handleDeletePhoto}
        />
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
    padding: spacing[5],
  },
  createButtonContainer: {
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  createButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 8,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  createButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MissionScreen;
