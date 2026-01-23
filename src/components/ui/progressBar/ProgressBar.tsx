import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../../../utils/designTokens';
import { styles } from './ProgressBar.styles';

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

export default ProgressBar;
