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
  Image,
} from 'react-native';
import { Button, Header, SectionTitle, FormCard } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { createCustomMission } from '../../services/missionService';
import { useUser } from '../../contexts/UserContext';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { ScreenNames } from '../../types';
import { WorryType } from '../../api/userApi';

interface CustomMissionCreateScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route?: RouteProp<RootStackParamList, 'CustomMissionCreate'>;
}

const DIFFICULTY_OPTIONS = [
  { id: 'easy', name: '쉬움', emoji: '😊', exp: 30 },
  { id: 'medium', name: '보통', emoji: '😐', exp: 50 },
  { id: 'hard', name: '어려움', emoji: '😤', exp: 80 },
];

const WORRY_TYPE_OPTIONS: { id: WorryType; name: string; emoji: string }[] = [
  { id: 'RE_EMPLOYMENT', name: '재취업', emoji: '💼' },
  { id: 'JOB_PREPARATION', name: '취업준비', emoji: '📝' },
  { id: 'ENTRANCE_EXAM', name: '입시', emoji: '📚' },
  { id: 'ADVANCEMENT', name: '진학', emoji: '🎓' },
  { id: 'RETURN_TO_SCHOOL', name: '복학', emoji: '🏫' },
  { id: 'RELATIONSHIP', name: '연애', emoji: '💕' },
  { id: 'SELF_MANAGEMENT', name: '자기관리', emoji: '🧘' },
];

const MISSION_TYPE_OPTIONS = [
  { id: 'DAILY', name: '일간', emoji: '📅', days: 1 },
  { id: 'WEEKLY', name: '주간', emoji: '📆', days: 7 },
  { id: 'MONTHLY', name: '월간', emoji: '🗓️', days: 30 },
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
  const [worryType, setWorryType] = useState<WorryType | null>(null);
  const [missionType, setMissionType] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');

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
        worryType: worryType,
        missionType: missionType,
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
      <Header
        title="미션 만들기"
        leftButton={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../../assets/images/left.png')}
              style={styles.backButtonIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        }
      />

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
          <SectionTitle title="고민 종류" size="lg" marginBottom={spacing[3]} />
          <View style={styles.worryTypeContainer}>
            {WORRY_TYPE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.worryTypeButton,
                  worryType === option.id && styles.selectedWorryType
                ]}
                onPress={() => setWorryType(worryType === option.id ? null : option.id)}
              >
                <Text style={styles.worryTypeEmoji}>{option.emoji}</Text>
                <Text style={[
                  styles.worryTypeText,
                  worryType === option.id && styles.selectedWorryTypeText
                ]}>
                  {option.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.optionalHint}>선택 사항</Text>
        </FormCard>

        <FormCard>
          <SectionTitle title="기간 선택" size="lg" marginBottom={spacing[3]} />
          <View style={styles.missionTypeContainer}>
            {MISSION_TYPE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.missionTypeButton,
                  missionType === option.id && styles.selectedMissionType
                ]}
                onPress={() => setMissionType(option.id as 'DAILY' | 'WEEKLY' | 'MONTHLY')}
              >
                <Text style={styles.missionTypeEmoji}>{option.emoji}</Text>
                <Text style={[
                  styles.missionTypeText,
                  missionType === option.id && styles.selectedMissionTypeText
                ]}>
                  {option.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
  backButtonIcon: {
    width: 24,
    height: 24,
    tintColor: colors.text.primary,
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
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    textAlignVertical: 'top',
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  worryTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  worryTypeButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  selectedWorryType: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[500],
  },
  worryTypeEmoji: {
    fontSize: typography.fontSize.base,
  },
  worryTypeText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  selectedWorryTypeText: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  optionalHint: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing[2],
  },
  missionTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  missionTypeButton: {
    flex: 1,
    alignItems: 'center',
    padding: spacing[3],
    marginHorizontal: spacing[1],
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  selectedMissionType: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[500],
  },
  missionTypeEmoji: {
    fontSize: typography.fontSize.xl,
    marginBottom: spacing[1],
  },
  missionTypeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  selectedMissionTypeText: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
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
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xl),
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
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xl),
  },
  difficultyText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  selectedDifficultyText: {
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  difficultyExp: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
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
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    backgroundColor: colors.background.primary,
    width: 80,
    textAlign: 'center',
    marginRight: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  expLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  expHint: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
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
