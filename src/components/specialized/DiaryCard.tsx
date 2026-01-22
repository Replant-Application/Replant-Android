import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { styles } from './DiaryCard.styles';
import { SimpleDiaryData } from '../../types';
import { formatDateKorean } from '../../utils/dateUtils';

interface DiaryCardProps {
  diary: SimpleDiaryData & { id: string };
  onEdit?: (diary: SimpleDiaryData & { id: string }) => void;
  onDelete?: (diaryId: string) => void;
  style?: ViewStyle;
}

const DiaryCard: React.FC<DiaryCardProps> = ({
  diary,
  onEdit,
  onDelete,
  style
}) => {
  if (!diary) return null;

  const getEmotionEmoji = (emotion: string): string => {
    const emojiMap: Record<string, string> = {
      happy: '😊',
      excited: '🤩',
      calm: '😌',
      grateful: '🙏',
      sad: '😢',
      angry: '😠',
      anxious: '😰',
      tired: '😴',
    };
    return emojiMap[emotion] || '😊';
  };

  const getEmotionName = (emotion: string): string => {
    const nameMap: Record<string, string> = {
      happy: '행복',
      excited: '신남',
      calm: '평온',
      grateful: '감사',
      sad: '슬픔',
      angry: '화남',
      anxious: '불안',
      tired: '피곤',
    };
    return nameMap[emotion] || emotion;
  };


  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.emotionInfo}>
          <Text style={styles.emotionEmoji}>
            {getEmotionEmoji(diary.emotion)}
          </Text>
          <Text style={styles.emotionName}>
            {getEmotionName(diary.emotion)}
          </Text>
        </View>
        <Text style={styles.date}>
          {formatDateKorean(diary.date)}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.text} numberOfLines={4}>
          {diary.content}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEdit?.(diary)}
            activeOpacity={0.7}
          >
            <Text style={styles.editText}>✏️ 수정</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onDelete?.(diary.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteText}>🗑️ 삭제</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default DiaryCard;
