import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Card from '../ui/Card';
import CircularProgressBar from '../ui/CircularProgressBar';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';

interface MissionProgressCardProps {
  completedMissions: number;
  totalMissions: number;
  rewardThreshold?: number;
  onRewardPress?: () => void;
  onHomePress?: () => void;
}

export const MissionProgressCard: React.FC<MissionProgressCardProps> = ({
  completedMissions,
  totalMissions,
}) => {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>나의 진행률</Text>
      </View>
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
    marginBottom: spacing[4],
    padding: spacing[5],
    borderRadius: borderRadius.base,
  },
  header: {
    marginBottom: spacing[5],
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[1],
  },
});
