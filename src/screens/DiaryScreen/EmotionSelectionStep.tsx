import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Dimensions } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { EMOTION_TAGS } from './DiaryScreen.constants';
import { getEmotionColor, addOpacity } from './DiaryScreen.utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMNS = 3; // 그리드 열 수
const BUTTON_GAP = spacing[1]; // 버튼 간격
const CONTAINER_PADDING = spacing[3]; // 컨테이너 패딩
// modalContainer의 marginHorizontal (spacing[4]) + padding (spacing[3]) + content의 paddingHorizontal (CONTAINER_PADDING) 모두 고려
const MODAL_MARGIN = spacing[4]; // modalContainer의 marginHorizontal
const MODAL_PADDING = spacing[3]; // modalContainer의 padding
const AVAILABLE_WIDTH = SCREEN_WIDTH - (MODAL_MARGIN * 2) - (MODAL_PADDING * 2) - (CONTAINER_PADDING * 2);
const BUTTON_WIDTH = (AVAILABLE_WIDTH - BUTTON_GAP * (COLUMNS - 1)) / COLUMNS;

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
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  emotionsContainer: {
    maxHeight: 400,
    marginBottom: spacing[3],
  },
  emotionsContent: {
    paddingHorizontal: CONTAINER_PADDING,
    paddingBottom: spacing[2],
  },
  emotionRow: {
    flexDirection: 'row',
    gap: BUTTON_GAP,
    marginBottom: BUTTON_GAP,
  },
  emotionTag: {
    width: BUTTON_WIDTH,
    minHeight: spacing[8],
    paddingHorizontal: spacing[1],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
    borderWidth: 1, // 항상 동일한 borderWidth 유지
    alignItems: 'center',
    justifyContent: 'center',
  },
  emotionTagEmpty: {
    width: BUTTON_WIDTH,
  },
  inputContainer: {
    width: '100%',
  },
  textInput: {
    backgroundColor: colors.gray[900],
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    height: 37,
    fontSize: typography.fontSize.sm,
    color: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[700],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  emotionTagText: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    textAlign: 'center',
  },
  emotionTagTextSelected: {
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
  },
});

export default EmotionSelectionStep;

