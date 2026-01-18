import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Image } from 'react-native';
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

        {/* 오른쪽: 뱃지 보기 버튼 */}
        <TouchableOpacity
          style={styles.badgeButton}
          onPress={onBadgePress}
          activeOpacity={0.7}
        >
          <View style={styles.badgeIconContainer}>
            <Image
              source={require('../../assets/images/badge.png')}
              style={styles.badgeIcon}
              resizeMode="contain"
              accessibilityLabel="뱃지 아이콘"
            />
          </View>
          <Text style={styles.badgeButtonText}>미션 뱃지</Text>
          <Text style={styles.badgeArrow}>›</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing[4],
    padding: spacing[5],
    borderRadius: borderRadius.base,
    borderWidth: 4,
    borderColor: '#0E0F37',
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
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[3],
    marginLeft: spacing[4],
  },
  badgeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[2],
  },
  badgeIcon: {
    width: 24,
    height: 24,
  },
  badgeButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    flex: 1,
  },
  badgeArrow: {
    fontSize: typography.fontSize.xl,
    color: colors.text.tertiary,
    marginLeft: spacing[1],
  },
});
