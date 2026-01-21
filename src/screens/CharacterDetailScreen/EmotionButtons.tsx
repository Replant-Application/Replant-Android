/**
 * 감정 표현 버튼 컴포넌트
 * 캐릭터의 감정 표현을 선택하는 버튼들
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';

interface EmotionButton {
  key: string;
  label: string;
  emoji: string;
}

interface EmotionButtonsProps {
  emotions: EmotionButton[];
  selectedEmotion: string;
  onSelect: (emotion: string) => void;
}

const EmotionButtons: React.FC<EmotionButtonsProps> = ({
  emotions,
  selectedEmotion,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.buttons}>
        {emotions.map((emotion) => (
          <TouchableOpacity
            key={emotion.key}
            style={[
              styles.button,
              selectedEmotion === emotion.key && styles.buttonActive
            ]}
            onPress={() => onSelect(emotion.key)}
          >
            <Text style={styles.emoji}>{emotion.emoji}</Text>
            <Text style={[
              styles.label,
              selectedEmotion === emotion.key && styles.labelActive
            ]}>
              {emotion.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing[6],
    paddingHorizontal: spacing[1],
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing[3],
    width: '100%',
  },
  button: {
    flex: 1,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[4],
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background.primary,
    borderWidth: 2,
    borderColor: colors.border.light,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[400],
    shadowColor: colors.primary[400],
    shadowOpacity: 0.2,
    transform: [{ scale: 1.02 }],
  },
  emoji: {
    fontSize: typography.fontSize['2xl'],
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize['2xl']),
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  labelActive: {
    color: colors.primary[700],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
});

export default EmotionButtons;
