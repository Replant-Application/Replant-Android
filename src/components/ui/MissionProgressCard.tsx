import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Card from './Card';
import CircularProgressBar from './CircularProgressBar';
import { styles } from './MissionProgressCard.styles';

interface MissionProgressCardProps {
  completedMissions: number;
  totalMissions: number;
  rewardThreshold?: number;
  onRewardPress?: () => void;
  onHomePress?: () => void;
}

/**
 * 미션 진행률 카드 컴포넌트
 * 원형 진행률 바와 보상 정보를 표시
 */
const MissionProgressCard: React.FC<MissionProgressCardProps> = ({
  completedMissions,
  totalMissions,
  rewardThreshold = 10,
  onRewardPress,
  onHomePress,
}) => {
  const progressPercentage = totalMissions > 0 
    ? (completedMissions / totalMissions) * 100 
    : 0;
  const remainingMissions = Math.max(0, rewardThreshold - totalMissions);

  return (
    <Card
      variant="flat"
      padding="lg"
      style={styles.card}
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>나의 진행률</Text>
        {onHomePress && (
          <TouchableOpacity onPress={onHomePress} activeOpacity={0.7}>
            <Text style={styles.homeIcon}>🏠</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 원형 진행률 바 */}
      <View style={styles.progressContainer}>
        <CircularProgressBar
          current={completedMissions}
          total={totalMissions}
          size={160}
          strokeWidth={14}
        />
      </View>
    </Card>
  );
};

export default MissionProgressCard;

