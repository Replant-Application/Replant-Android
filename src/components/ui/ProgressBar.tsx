import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';

interface ProgressBarProps {
  current: number;
  max: number;
  showPercentage?: boolean;
  showRemaining?: boolean;
  color?: string;
  backgroundColor?: string;
  height?: number;
  label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  max,
  showPercentage = true,
  showRemaining = true,
  color = colors.primary[500],
  backgroundColor = colors.background.tertiary,
  height = 8,
  label
}) => {
  const percentage = Math.min((current / max) * 100, 100);
  const remaining = max - current;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { height, backgroundColor }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${percentage}%`,
                backgroundColor: color
              }
            ]}
          />
        </View>

        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {current}/{max} EXP
          </Text>
          {showPercentage && (
            <Text style={styles.percentageText}>
              {Math.round(percentage)}%
            </Text>
          )}
        </View>
      </View>

      {showRemaining && remaining > 0 && (
        <Text style={styles.remainingText}>
          다음 레벨까지 {remaining} EXP
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[2],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  progressBar: {
    flex: 1,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  percentageText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  remainingText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
});

export default ProgressBar;
