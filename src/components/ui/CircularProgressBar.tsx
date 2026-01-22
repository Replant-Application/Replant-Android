import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../../utils/designTokens';
import { styles } from './CircularProgressBar.styles';

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

export default CircularProgressBar;

