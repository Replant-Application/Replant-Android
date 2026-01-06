import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Card from './Card';
import CircularProgressBar from './CircularProgressBar';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';

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

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F8F9FA', // 연한 베이지색 배경
    marginBottom: spacing[5],
    borderRadius: borderRadius.base, // 둥근 모서리 줄이기
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  title: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  homeIcon: {
    fontSize: typography.fontSize.base,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  progressContainer: {
    alignItems: 'center',
  },
});

export default MissionProgressCard;

