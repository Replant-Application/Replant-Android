import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { colors } from '../../utils/designTokens';
import { EMOTION_TAGS } from '../../constants/screens/diary';
import { getEmotionColor, addOpacity } from './DiaryScreen.utils';
import { styles, COLUMNS } from './EmotionSelectionStep.styles';

interface EmotionSelectionStepProps {
  selectedEmotions: string[];
  customEmotion: string;
  onToggleEmotion: (emotion: string) => void;
  onCustomEmotionChange: (text: string) => void;
}

const EmotionSelectionStep: React.FC<EmotionSelectionStepProps> = ({
  selectedEmotions,
  customEmotion,
  onToggleEmotion,
  onCustomEmotionChange,
}) => {
  // 감정을 행 단위로 그룹화
  const renderEmotionGrid = () => {
    const rows = [];
    for (let i = 0; i < EMOTION_TAGS.length; i += COLUMNS) {
      const rowEmotions = EMOTION_TAGS.slice(i, i + COLUMNS);
      rows.push(
        <View key={i} style={styles.emotionRow}>
          {rowEmotions.map((emotion) => {
            const emotionColor = getEmotionColor(emotion);
            const isSelected = selectedEmotions.includes(emotion);
            return (
              <TouchableOpacity
                key={emotion}
                style={[
                  styles.emotionTag,
                  // eslint-disable-next-line react-native/no-inline-styles
                  {
                    backgroundColor: isSelected 
                      ? addOpacity(emotionColor, 0.3) 
                      : 'rgba(255, 255, 255, 0.1)',
                    borderColor: isSelected 
                      ? addOpacity(emotionColor, 0.5) 
                      : 'rgba(255, 255, 255, 0.3)',
                  },
                ]}
                onPress={() => onToggleEmotion(emotion)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={emotion}
                accessibilityState={{ selected: isSelected }}
                accessibilityHint={isSelected ? `${emotion} 선택됨, 탭하여 선택 해제` : `${emotion} 선택되지 않음, 탭하여 선택`}
              >
                <Text 
                  style={[
                    styles.emotionTagText,
                    isSelected && styles.emotionTagTextSelected
                  ]}
                  accessibilityElementsHidden={true}
                >
                  {emotion}
                </Text>
              </TouchableOpacity>
            );
          })}
          {/* 빈 공간 채우기 (마지막 행) */}
          {rowEmotions.length < COLUMNS && 
            Array(COLUMNS - rowEmotions.length).fill(0).map((_, idx) => (
              <View key={`empty-${idx}`} style={styles.emotionTagEmpty} />
            ))
          }
        </View>
      );
    }
    return rows;
  };

  return (
    <View style={styles.container}>
      {/* 감정 선택 버튼들 */}
      <ScrollView 
        style={styles.emotionsContainer}
        contentContainerStyle={styles.emotionsContent}
        showsVerticalScrollIndicator={false}
      >
        {renderEmotionGrid()}
      </ScrollView>

      {/* 텍스트 입력 영역 */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={customEmotion}
          onChangeText={onCustomEmotionChange}
          placeholder="직접 입력하기"
          placeholderTextColor={colors.text.tertiary}
          multiline={false}
          editable={true}
          autoComplete="off"
          textContentType="none"
          accessibilityLabel="감정 직접 입력"
          accessibilityHint="감정을 직접 입력하세요. 자동완성 기능이 비활성화되어 있습니다"
        />
      </View>
    </View>
  );
};

export default EmotionSelectionStep;

