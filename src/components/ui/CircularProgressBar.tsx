import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';

interface CircularProgressBarProps {
  current: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  backgroundColor?: string;
  progressColor?: string;
  showText?: boolean;
  showPercentage?: boolean;
}

/**
 * 원형 진행률 바 컴포넌트
 * 미션 진행률 등을 원형으로 표시
 */
const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  current,
  total,
  size = 140,
  strokeWidth = 12,
  backgroundColor = colors.gray[200],
  progressColor = colors.primary[500],
  showText = true,
  showPercentage = true,
}) => {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  const radius = size / 2;
  const innerSize = size - strokeWidth * 2;
  const isComplete = percentage >= 100;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* 배경 원 */}
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: radius,
            borderWidth: strokeWidth,
            borderColor: backgroundColor,
          },
        ]}
      />
      
      {/* 진행률 원 */}
      {percentage > 0 && (
        <View
          style={[
            styles.circle,
            {
              width: size,
              height: size,
              borderRadius: radius,
              borderWidth: strokeWidth,
              borderColor: progressColor,
              ...(isComplete ? {} : {
                borderRightColor: 'transparent',
                borderBottomColor: 'transparent',
                transform: [{ rotate: `${(percentage / 100) * 360 - 90}deg` }],
              }),
            },
          ]}
        />
      )}

      {/* 중앙 콘텐츠 */}
      <View
        style={[
          styles.content,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
          },
        ]}
      >
        {showText && (
          <View style={styles.textContainer}>
            <Text style={styles.countText}>
              {current}<Text style={styles.totalText}>/{total}</Text>
            </Text>
            <Text style={styles.labelText}>미션 완료</Text>
          </View>
        )}
        {showPercentage && (
          <View style={[
            styles.percentageContainer,
            percentage === 0 && styles.percentageContainerSquare
          ]}>
            <Text style={styles.percentage}>{Math.round(percentage)}%</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  circle: {
    position: 'absolute',
  },
  content: {
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  countText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  totalText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  labelText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  percentageContainer: {
    marginTop: spacing[1],
  },
  percentageContainerSquare: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.primary[500],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  percentage: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.normal,
    color: colors.primary[500],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
});

export default CircularProgressBar;

