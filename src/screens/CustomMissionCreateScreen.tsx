import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Card, Button } from '../components/ui';
import { colors, spacing, typography, borderRadius } from '../utils/designTokens';
import { createCustomMission } from '../services/missionService';
import { useUser } from '../contexts/UserContext';

interface DifficultyOption {
  id: string;
  name: string;
  emoji: string;
  exp: number;
}

interface CustomMissionCreateScreenProps {
  navigation: any;
}

const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  { id: 'easy', name: '쉬움', emoji: '😊', exp: 30 },
  { id: 'medium', name: '보통', emoji: '😐', exp: 50 },
  { id: 'hard', name: '어려움', emoji: '😤', exp: 80 },
];

const EMOJI_OPTIONS: string[] = [
  '🎯', '✨', '🔥', '💪', '🌟', '🎉', '💡', '🚀',
  '📚', '🏃‍♂️', '🧘', '💬', '🎵', '🎨', '🍎', '☕',
  '🌱', '🎪', '🎭', '🎨', '🎵', '🎪', '🎭', '🎪'
];

const CustomMissionCreateScreen: React.FC<CustomMissionCreateScreenProps> = ({ navigation }) => {
  const { currentNickname } = useUser();
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedEmoji, setSelectedEmoji] = useState<string>('🎯');
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [customExp, setCustomExp] = useState<number>(50);
  const [loading, setLoading] = useState<boolean>(false);

  const handleCreateMission = async (): Promise<void> => {
    if (!title.trim()) {
      Alert.alert('오류', '미션 제목을 입력해주세요.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('오류', '미션 설명을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      
      const missionData = {
        title: title.trim(),
        description: description.trim(),
        emoji: selectedEmoji,
        difficulty,
        experience: customExp,
        category_id: 'custom',
        is_custom: true,
        created_by: currentNickname || 'anonymous',
      };

      const result = await createCustomMission(missionData);
      
      if (result.success) {
        Alert.alert(
          '성공',
          '나만의 미션이 생성되었습니다!',
          [
            {
              text: '확인',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('오류', result.error || '미션 생성에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '미션 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDifficultyChange = (newDifficulty: string): void => {
    setDifficulty(newDifficulty);
    const selectedOption = DIFFICULTY_OPTIONS.find(option => option.id === newDifficulty);
    if (selectedOption) {
      setCustomExp(selectedOption.exp);
    }
  };

  const handleEmojiSelect = (emoji: string): void => {
    setSelectedEmoji(emoji);
  };

  const handleGoBack = (): void => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>나만의 미션 만들기</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* 미션 제목 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>미션 제목 *</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="미션 제목을 입력하세요"
              maxLength={50}
            />
            <Text style={styles.characterCount}>{title.length}/50</Text>
          </View>

          {/* 미션 설명 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>미션 설명 *</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={description}
              onChangeText={setDescription}
              placeholder="미션에 대한 자세한 설명을 입력하세요"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={200}
            />
            <Text style={styles.characterCount}>{description.length}/200</Text>
          </View>

          {/* 이모지 선택 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>이모지 선택</Text>
            <View style={styles.emojiContainer}>
              {EMOJI_OPTIONS.map((emoji, index) => (
                <TouchableOpacity
                  key={`emoji-${index}`}
                  style={[
                    styles.emojiButton,
                    selectedEmoji === emoji && styles.selectedEmoji
                  ]}
                  onPress={() => handleEmojiSelect(emoji)}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 난이도 선택 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>난이도</Text>
            <View style={styles.difficultyContainer}>
              {DIFFICULTY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.difficultyButton,
                    difficulty === option.id && styles.selectedDifficulty
                  ]}
                  onPress={() => handleDifficultyChange(option.id)}
                >
                  <Text style={styles.difficultyEmoji}>{option.emoji}</Text>
                  <Text style={[
                    styles.difficultyText,
                    difficulty === option.id && styles.selectedDifficultyText
                  ]}>
                    {option.name}
                  </Text>
                  <Text style={[
                    styles.difficultyExp,
                    difficulty === option.id && styles.selectedDifficultyText
                  ]}>
                    {option.exp} EXP
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 경험치 설정 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>경험치 설정</Text>
            <View style={styles.expContainer}>
              <Text style={styles.expLabel}>경험치: {customExp}</Text>
              <TextInput
                style={styles.expInput}
                value={customExp.toString()}
                onChangeText={(text) => {
                  const num = parseInt(text) || 0;
                  if (num >= 0 && num <= 1000) {
                    setCustomExp(num);
                  }
                }}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
            <Text style={styles.helpText}>
              난이도에 따라 자동으로 설정되며, 직접 조정할 수 있습니다.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="미션 생성하기"
          onPress={handleCreateMission}
          loading={loading}
          disabled={!title.trim() || !description.trim() || loading}
          size="lg"
          style={styles.createButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[20],
    paddingBottom: spacing[5],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing[2],
  },
  backButtonText: {
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: spacing[5],
  },
  inputGroup: {
    marginBottom: spacing[6],
  },
  label: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.base,
    padding: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    backgroundColor: colors.background.primary,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'right',
    marginTop: spacing[1],
  },
  emojiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  emojiButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.base,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedEmoji: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  emojiText: {
    fontSize: typography.fontSize.lg,
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  difficultyButton: {
    flex: 1,
    padding: spacing[3],
    borderRadius: borderRadius.base,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.primary,
    alignItems: 'center',
  },
  selectedDifficulty: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  difficultyEmoji: {
    fontSize: typography.fontSize.xl,
    marginBottom: spacing[1],
  },
  difficultyText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  selectedDifficultyText: {
    color: colors.text.inverse,
  },
  difficultyExp: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  expContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  expLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  expInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.base,
    padding: spacing[2],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    backgroundColor: colors.background.primary,
    textAlign: 'center',
  },
  helpText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing[2],
  },
  footer: {
    padding: spacing[5],
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  createButton: {
    backgroundColor: colors.primary[500],
  },
});

export default CustomMissionCreateScreen;
