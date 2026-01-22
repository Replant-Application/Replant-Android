import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ViewStyle } from 'react-native';
import { colors } from '../../utils/designTokens';
import { styles } from './EmotionSelector.styles';

interface Emotion {
  id: string;
  label: string;
  emoji: string;
  color: string;
}

interface EmotionSelectorProps {
  selectedEmotion?: string;
  onSelect: (emotion: string) => void;
  multiple?: boolean;
  style?: ViewStyle;
}

const EMOTIONS: Emotion[] = [
  { id: 'happy', label: '행복', emoji: '😊', color: colors.emotions.happy },
  { id: 'excited', label: '신남', emoji: '🤩', color: colors.emotions.excited },
  { id: 'calm', label: '평온', emoji: '😌', color: colors.emotions.calm },
  { id: 'grateful', label: '감사', emoji: '🙏', color: colors.emotions.grateful },
  { id: 'sad', label: '슬픔', emoji: '😢', color: colors.emotions.sad },
  { id: 'angry', label: '화남', emoji: '😠', color: colors.emotions.angry },
  { id: 'anxious', label: '불안', emoji: '😰', color: colors.emotions.anxious },
  { id: 'tired', label: '피곤', emoji: '😴', color: colors.emotions.tired },
];

const EmotionSelector: React.FC<EmotionSelectorProps> = ({
  selectedEmotion,
  onSelect,
  multiple = false,
  style
}) => {
  const [selected, setSelected] = useState<string[]>(Array.isArray(selectedEmotion) ? selectedEmotion : selectedEmotion ? [selectedEmotion] : []);

  const handleSelect = (emotion: Emotion): void => {
    if (multiple) {
      const newSelected = selected.includes(emotion.id)
        ? selected.filter(id => id !== emotion.id)
        : [...selected, emotion.id];
      setSelected(newSelected);
      onSelect(newSelected.join(','));
    } else {
      setSelected([emotion.id]);
      onSelect(emotion.id);
    }
  };

  const isSelected = (emotionId: string): boolean => {
    return multiple ? selected.includes(emotionId) : selected.includes(emotionId);
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>오늘의 감정을 선택해주세요</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {EMOTIONS.map((emotion) => (
          <TouchableOpacity
            key={emotion.id}
            style={[
              styles.emotionButton,
              isSelected(emotion.id) && styles.selectedButton,
              isSelected(emotion.id) && { backgroundColor: emotion.color + '20' }
            ]}
            onPress={() => handleSelect(emotion)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={emotion.label}
            accessibilityState={{ selected: isSelected(emotion.id) }}
            accessibilityHint={multiple ? "다중 선택 가능" : undefined}
          >
            <Text style={styles.emoji} accessibilityElementsHidden={true}>{emotion.emoji}</Text>
            <Text style={[
              styles.label,
              isSelected(emotion.id) && styles.selectedLabel
            ]}>
              {emotion.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default EmotionSelector;
