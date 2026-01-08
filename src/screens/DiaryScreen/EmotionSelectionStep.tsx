import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { EMOTION_TAGS } from './DiaryScreen.constants';
import { getEmotionColor, addOpacity } from './DiaryScreen.utils';

interface EmotionSelectionStepProps {
  selectedEmotions: string[];
  onToggleEmotion: (emotion: string) => void;
}

const EmotionSelectionStep: React.FC<EmotionSelectionStepProps> = ({
  selectedEmotions,
  onToggleEmotion,
}) => {
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {EMOTION_TAGS.map((emotion) => {
        const emotionColor = getEmotionColor(emotion);
        const isSelected = selectedEmotions.includes(emotion);
        return (
          <TouchableOpacity
            key={emotion}
            style={[
              styles.emotionTag,
              {
                backgroundColor: isSelected 
                  ? emotionColor 
                  : addOpacity(emotionColor, 0.2),
                borderColor: emotionColor,
              },
              isSelected && styles.emotionTagSelected
            ]}
            onPress={() => onToggleEmotion(emotion)}
          >
            <Text style={[
              styles.emotionTagText,
              isSelected && styles.emotionTagTextSelected
            ]}>
              {emotion}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 450,
  },
  content: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    paddingBottom: spacing[4],
  },
  emotionTag: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  emotionTagSelected: {
    borderWidth: 2,
  },
  emotionTagText: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  emotionTagTextSelected: {
    color: colors.gray[900],
    fontWeight: typography.fontWeight.medium,
  },
});

export default EmotionSelectionStep;

