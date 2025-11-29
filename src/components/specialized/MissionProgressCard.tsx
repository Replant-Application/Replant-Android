import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, ProgressBar, SectionTitle } from '../ui';
import { colors, spacing, typography } from '../../utils/designTokens';

interface MissionProgressCardProps {
  completedMissions: number;
  totalMissions: number;
  progressPercentage: number;
}

export const MissionProgressCard: React.FC<MissionProgressCardProps> = ({
  completedMissions,
  totalMissions,
  progressPercentage,
}) => {
  return (
    <Card style={styles.card}>
      <SectionTitle title="📈 진행률" size="lg" marginBottom={spacing[3]} />
      <ProgressBar current={completedMissions} max={totalMissions} />
      <View style={styles.statsRow}>
        <Text style={styles.statText}>
          완료: <Text style={styles.statValue}>{completedMissions}</Text>
        </Text>
        <Text style={styles.statText}>
          전체: <Text style={styles.statValue}>{totalMissions}</Text>
        </Text>
        <Text style={styles.statText}>
          진행률:{' '}
          <Text style={styles.statValue}>
            {progressPercentage.toFixed(0)}%
          </Text>
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing[4],
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing[3],
  },
  statText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  statValue: {
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },
});
