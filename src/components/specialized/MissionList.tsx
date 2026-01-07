import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Mission } from '../../types';
import MissionCard from './MissionCard';
import { EmptyState } from '../ui';
import { spacing } from '../../utils/designTokens';

interface MissionListProps {
  missions: Mission[];
  onMissionPress?: (mission: Mission) => void;
  onMissionComplete?: (missionId: string) => void;
  onMissionUncomplete?: (missionId: string) => void;
  onPhotoUpload?: (missionId: string) => void;
  onShareToCommunity?: (missionId: string) => void;
  onDeletePhoto?: (missionId: string) => void;
}

export const MissionList: React.FC<MissionListProps> = ({
  missions,
  onMissionPress,
  onMissionComplete,
  onMissionUncomplete,
  onPhotoUpload,
  onShareToCommunity,
  onDeletePhoto,
}) => {
  if (missions.length === 0) {
    return (
      <EmptyState
        iconImage={require('../../assets/images/goal.png')}
        title="미션이 없습니다"
        description="새로운 미션을 만들어보세요!"
      />
    );
  }

  return (
    <View style={styles.container}>
      {missions.map((mission) => (
        <MissionCard
          key={mission.mission_id}
          mission={mission}
          onViewDetails={onMissionPress ? () => onMissionPress(mission) : undefined}
          onComplete={onMissionComplete ? () => onMissionComplete(mission.mission_id) : undefined}
          onUncomplete={onMissionUncomplete ? () => onMissionUncomplete(mission.mission_id) : undefined}
          onUploadPhoto={onPhotoUpload ? () => onPhotoUpload(mission.mission_id) : undefined}
          onShareToCommunity={onShareToCommunity ? () => onShareToCommunity(mission.mission_id) : undefined}
          onDeletePhoto={onDeletePhoto ? () => onDeletePhoto(mission.mission_id) : undefined}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing[3],
  },
});
