import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
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
 * 
 * 진행률 계산 로직:
 * - percentage = (current / total) * 100
 * - 각도 = (percentage / 100) * 360도
 * - 12시 방향(-90도)부터 시계 방향으로 채워짐
 * 
 * SVG를 사용하여 정확한 원형 진행률 표현
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
  const innerSize = size - strokeWidth * 2;
  const isComplete = percentage >= 100;

  // SVG 원형 진행률 경로 계산
  const progressPath = useMemo(() => {
    if (percentage === 0) return '';

    const center = size / 2;
    const radius = (size - strokeWidth) / 2;
    
    // 12시 방향부터 시작 (Math.PI/2 = 90도, -Math.PI/2 = -90도 = 12시)
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (percentage / 100) * 2 * Math.PI;

    // 시작점과 종료점 좌표 계산
    const startX = center + radius * Math.cos(startAngle);
    const startY = center + radius * Math.sin(startAngle);
    const endX = center + radius * Math.cos(endAngle);
    const endY = center + radius * Math.sin(endAngle);

    // largeArcFlag: 180도 이상이면 1, 미만이면 0
    const largeArcFlag = percentage > 50 ? 1 : 0;

    // SVG Path d 속성 생성
    // M: Move to (시작점)
    // A: Arc (rx ry x-axis-rotation large-arc-flag sweep-flag x y)
    // sweep-flag: 1 = 시계 방향
    if (isComplete) {
      // 100%일 때는 전체 원 그리기 (두 개의 반원으로)
      const topY = center - radius;
      const bottomY = center + radius;
      return `M ${center} ${topY} A ${radius} ${radius} 0 1 1 ${center} ${bottomY} A ${radius} ${radius} 0 1 1 ${center} ${topY}`;
    }

    // 진행률만큼만 Arc 그리기
    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
  }, [percentage, size, strokeWidth, isComplete]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* SVG 원형 진행률 바 */}
      <Svg width={size} height={size} style={styles.svg}>
        {/* 배경 원 */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={(size - strokeWidth) / 2}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        
        {/* 진행률 원호 */}
        {percentage > 0 && (
          <Path
            d={progressPath}
            fill="none"
            stroke={progressColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        )}
      </Svg>

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

