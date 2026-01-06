import React, { useState, useEffect } from 'react';
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
import { Button, Header, SectionTitle, FormCard } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createCustomMission } from '../../services/missionService';
import { useUser } from '../../contexts/UserContext';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { ScreenNames } from '../../types';

interface CustomMissionCreateScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route?: RouteProp<RootStackParamList, 'CustomMissionCreate'>;
}

const DIFFICULTY_OPTIONS = [
  { id: 'easy', name: '쉬움', emoji: '😊', exp: 30 },
  { id: 'medium', name: '보통', emoji: '😐', exp: 50 },
  { id: 'hard', name: '어려움', emoji: '😤', exp: 80 },
];


const CustomMissionCreateScreen: React.FC<CustomMissionCreateScreenProps> = ({ navigation, route }) => {
  const { currentNickname } = useUser();
  const generatedMission = route?.params?.generatedMission;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🎯');
  const [difficulty, setDifficulty] = useState('medium');
  const [customExp, setCustomExp] = useState(50);
  const [loading, setLoading] = useState(false);

  // AI 생성 미션이 있으면 초기값 설정
  useEffect(() => {
    if (generatedMission) {
      setTitle(generatedMission.title || '');
      setDescription(generatedMission.description || '');
      setSelectedEmoji(generatedMission.emoji || '🎯');
      setDifficulty(generatedMission.difficulty || 'medium');
      setCustomExp(generatedMission.experience || 50);
    }
  }, [generatedMission]);

  const handleCreateMission = async () => {
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
        difficulty: difficulty as 'easy' | 'medium' | 'hard',
        experience: customExp,
        category_id: 'growth' as const, // 기존 구조에 맞춰 growth로 설정
      };

      const result = await createCustomMission(missionData as any, currentNickname || 'default');

      if (result.success) {
        Alert.alert(
          '성공!',
          '나만의 미션이 생성되었습니다!',
          [
            {
              text: '확인',
              onPress: () => (navigation as any).navigate(ScreenNames.MISSION)
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

  const handleDifficultyChange = (selectedDifficulty: string) => {
    setDifficulty(selectedDifficulty);
    const difficultyOption = DIFFICULTY_OPTIONS.find(opt => opt.id === selectedDifficulty);
    if (difficultyOption) {
      setCustomExp(difficultyOption.exp);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* 헤더 */}
      <Header />

      <ScrollView style={styles.content}>
        <FormCard>
          <SectionTitle title="미션 제목" size="lg" marginBottom={spacing[3]} />
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder="미션 제목을 입력하세요"
            maxLength={50}
          />
        </FormCard>

        <FormCard>
          <SectionTitle title="미션 설명" size="lg" marginBottom={spacing[3]} />
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="미션에 대한 자세한 설명을 입력하세요"
            multiline
            numberOfLines={4}
            maxLength={200}
          />
        </FormCard>


        <FormCard>
          <SectionTitle title="난이도 선택" size="lg" marginBottom={spacing[3]} />
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
                <Text style={styles.difficultyExp}>+{option.exp} EXP</Text>
              </TouchableOpacity>
            ))}
          </View>
        </FormCard>

        <FormCard>
          <SectionTitle title="경험치 설정" size="lg" marginBottom={spacing[3]} />
          <View style={styles.expContainer}>
            <TextInput
              style={styles.expInput}
              value={customExp.toString()}
              onChangeText={(text) => {
                const num = parseInt(text, 10) || 0;
                if (num >= 0 && num <= 200) {
                  setCustomExp(num);
                }
              }}
              keyboardType="numeric"
              maxLength={3}
            />
            <Text style={styles.expLabel}>EXP</Text>
          </View>
          <Text style={styles.expHint}>0~200 사이의 값을 입력하세요</Text>
        </FormCard>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="취소"
          onPress={() => (navigation as any).navigate(ScreenNames.MISSION)}
          style={StyleSheet.flatten([styles.button, styles.cancelButton])}
          textStyle={styles.cancelButtonText}
        />
        <Button
          title={loading ? "생성 중..." : "미션 생성"}
          onPress={handleCreateMission}
          style={StyleSheet.flatten([styles.button, styles.createButton])}
          disabled={loading}
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
  content: {
    flex: 1,
    padding: spacing[5],
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    backgroundColor: colors.background.primary,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emojiButton: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  selectedEmoji: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[500],
  },
  emojiText: {
    fontSize: typography.fontSize.xl,
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyButton: {
    flex: 1,
    alignItems: 'center',
    padding: spacing[3],
    marginHorizontal: spacing[1],
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  selectedDifficulty: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[500],
  },
  difficultyEmoji: {
    fontSize: typography.fontSize.xl,
    marginBottom: spacing[1],
  },
  difficultyText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  selectedDifficultyText: {
    color: colors.primary[500],
    fontWeight: typography.fontWeight.semibold,
  },
  difficultyExp: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  expContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  expInput: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    backgroundColor: colors.background.primary,
    width: 80,
    textAlign: 'center',
    marginRight: spacing[2],
  },
  expLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  expHint: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: spacing[5],
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  button: {
    flex: 1,
    marginHorizontal: spacing[2],
  },
  cancelButton: {
    backgroundColor: colors.gray[200],
  },
  cancelButtonText: {
    color: colors.text.secondary,
  },
  createButton: {
    backgroundColor: colors.primary[500],
  },
});

export default CustomMissionCreateScreen;
