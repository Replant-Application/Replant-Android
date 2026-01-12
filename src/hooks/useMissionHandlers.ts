import { useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { Mission } from '../types';

interface UseMissionHandlersProps {
  missions: Mission[];
  saveMissionPhoto: (missionId: string, photoUri: string) => Promise<{ success: boolean; error?: string }>;
  deleteMissionPhoto: (missionId: string) => Promise<{ success: boolean; error?: string }>;
  completeMissionWithPhoto: (missionId: string, photoUrl: string | null) => Promise<{
    success: boolean;
    levelUp?: boolean;
    newLevel?: number;
    experienceGained?: number;
    pendingVerification?: boolean;
  } | null>;
  uncompleteMission: (missionId: string) => Promise<void>;
  loadMissions: () => Promise<void>;
  navigation: unknown;
}

export const useMissionHandlers = ({
  missions,
  saveMissionPhoto,
  deleteMissionPhoto,
  completeMissionWithPhoto,
  uncompleteMission,
  loadMissions,
  navigation,
}: UseMissionHandlersProps) => {
  const processedPhotoRef = useRef<string | null>(null);

  const handleMissionComplete = useCallback(async (
    missionId: string,
    onVerificationRequired: (mission: Mission) => void
  ) => {
    try {
      const mission = missions.find(m => m.mission_id === missionId);
      const photoUrl = mission?.photo_url || null;

      const result = await completeMissionWithPhoto(missionId, photoUrl);

      if (result && result.success) {
        const completedMission = missions.find(m => m.mission_id === missionId);
        if (!completedMission) return;

        // COMMUNITY 인증 타입은 좋아요 인증 후 XP 지급
        if (result.pendingVerification) {
          Alert.alert(
            '✅ 미션 완료',
            '커뮤니티에 공유하고 좋아요를 받으면 경험치가 지급됩니다!',
            [
              { text: '나중에', style: 'cancel' },
              {
                text: '커뮤니티 공유',
                onPress: () => onVerificationRequired(completedMission),
              },
            ]
          );
        } else {
          // 즉시 XP 지급 (GPS, TIME 타입)
          const alertTitle = result.levelUp ? '🎉 레벨업!' : '✅ 미션 완료';
          const alertMessage = result.levelUp
            ? `축하합니다! 레벨 ${result.newLevel}이 되었습니다!`
            : `+${result.experienceGained} EXP를 획득했습니다!`;

          Alert.alert(
            alertTitle,
            alertMessage,
            [
              { text: '확인' },
            ]
          );
        }
      }
    } catch (error) {
      Alert.alert('오류', '미션 완료에 실패했습니다.');
    }
  }, [missions, completeMissionWithPhoto]);

  const handlePhotoUpload = useCallback((missionId: string, ScreenNames: Record<string, string>) => {
    const mission = missions.find(m => m.mission_id === missionId);
    const nav = navigation as { navigate: (screen: string, params: unknown) => void };
    const photoSelectScreen = ScreenNames.PHOTO_SELECT || '';
    nav.navigate(photoSelectScreen, {
      missionId,
      missionTitle: mission?.title || '미션',
    });
  }, [missions, navigation]);

  const handleShareToCommunity = useCallback((missionId: string, ScreenNames: Record<string, string>) => {
    const mission = missions.find(m => m.mission_id === missionId);
    if (!mission) return;

    const nav = navigation as { navigate: (screen: string, params: unknown) => void };
    const createPostScreen = ScreenNames.COMMUNITY_POST_CREATE || '';
    nav.navigate(createPostScreen, {
      type: 'VERIFICATION', // 인증 게시글 타입
      userMissionId: mission.user_mission_id, // 인증에 필요한 UserMission ID
      missionId: mission.mission_id,
      missionTitle: mission.title,
      missionEmoji: mission.emoji,
      photoUrl: mission.photo_url || undefined,
    });
  }, [missions, navigation]);

  const handleDeletePhoto = useCallback(async (missionId: string) => {
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
  }, [deleteMissionPhoto]);

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

  const handleMissionUncomplete = useCallback(async (missionId: string) => {
    try {
      await uncompleteMission(missionId);
    } catch (error) {
      Alert.alert('오류', '미션 완료 취소에 실패했습니다.');
    }
  }, [uncompleteMission]);

  const handleLikeVerification = useCallback((
    selectedMission: Mission | null,
    ScreenNames: Record<string, string>
  ) => {
    if (!selectedMission) return;

    const nav = navigation as { navigate: (screen: string, params: unknown) => void };
    const createPostScreen = ScreenNames.COMMUNITY_POST_CREATE || '';
    nav.navigate(createPostScreen, {
      type: 'VERIFICATION', // 인증 게시글 타입
      userMissionId: selectedMission.user_mission_id, // 인증에 필요한 UserMission ID
      missionId: selectedMission.mission_id,
      missionTitle: selectedMission.title,
      missionEmoji: selectedMission.emoji,
      photoUrl: selectedMission.photo_url || undefined,
    });
  }, [navigation]);

  return {
    processedPhotoRef,
    handleMissionComplete,
    handlePhotoUpload,
    handleShareToCommunity,
    handleDeletePhoto,
    handlePhotoSelected,
    handleMissionUncomplete,
    handleLikeVerification,
  };
};
