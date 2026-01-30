import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Card } from '../ui';
import { CircularProgressBar } from '../ui';
import { styles } from './MissionProgressCard.styles';

interface MissionProgressCardProps {
  completedMissions: number;
  totalMissions: number;
  rewardThreshold?: number;
  onRewardPress?: () => void;
  onHomePress?: () => void;
  onBadgePress?: () => void;
}

export const MissionProgressCard: React.FC<MissionProgressCardProps> = ({
  completedMissions,
  totalMissions,
  onBadgePress,
}) => {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>나의 진행률</Text>
      </View>
      <View style={styles.contentRow}>
        {/* 왼쪽: 원형 진행률 */}
        <View style={styles.progressContainer}>
          <CircularProgressBar
            current={completedMissions}
            total={totalMissions}
            size={120}
            strokeWidth={12}
          />
        </View>

        {/* 오른쪽: 배지 보기 버튼 */}
        <TouchableOpacity
          style={styles.badgeButton}
          onPress={onBadgePress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="미션 배지"
          accessibilityHint="나의 배지 목록을 봅니다"
        >
          <View style={styles.badgeIconContainer}>
            <Image
              source={require('../../assets/images/badge.png')}
              style={styles.badgeIcon}
              resizeMode="contain"
              accessibilityLabel="배지 아이콘"
              accessibilityElementsHidden={true}
            />
          </View>
          <Text style={styles.badgeButtonText}>미션 배지</Text>
          <Text style={styles.badgeArrow}>›</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};
