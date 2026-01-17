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
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, Header, SectionTitle, FormCard } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { useMission } from '../../hooks/useMission';
import { useUser } from '../../contexts/UserContext';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { ScreenNames } from '../../types';
import { WorryType } from '../../api/userApi';
import { updateCustomMission } from '../../api/missionApi';

interface CustomMissionCreateScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route?: RouteProp<RootStackParamList, 'CustomMissionCreate'>;
}

const WORRY_TYPE_OPTIONS: { id: WorryType; name: string; emoji: string }[] = [
  { id: 'RE_EMPLOYMENT', name: '재취업', emoji: '💼' },
  { id: 'JOB_PREPARATION', name: '취업준비', emoji: '📝' },
  { id: 'ENTRANCE_EXAM', name: '입시', emoji: '📚' },
  { id: 'ADVANCEMENT', name: '진학', emoji: '🎓' },
  { id: 'RETURN_TO_SCHOOL', name: '복학', emoji: '🏫' },
  { id: 'RELATIONSHIP', name: '연애', emoji: '💕' },
  { id: 'SELF_MANAGEMENT', name: '자기관리', emoji: '🧘' },
];

// 미션 카테고리 옵션
type MissionCategoryOption = 'DAILY_LIFE' | 'GROWTH' | 'EXERCISE' | 'STUDY' | 'HEALTH' | 'RELATIONSHIP';
const MISSION_CATEGORY_OPTIONS: { id: MissionCategoryOption; name: string; emoji: string }[] = [
  { id: 'DAILY_LIFE', name: '일상', emoji: '🏠' },
  { id: 'GROWTH', name: '성장', emoji: '🌱' },
  { id: 'EXERCISE', name: '운동', emoji: '🏃' },
  { id: 'STUDY', name: '학습', emoji: '📖' },
  { id: 'HEALTH', name: '건강', emoji: '💪' },
  { id: 'RELATIONSHIP', name: '관계', emoji: '🤝' },
];

// 인증방식 옵션
type VerificationTypeOption = 'COMMUNITY' | 'GPS' | 'TIME';
const VERIFICATION_TYPE_OPTIONS: { id: VerificationTypeOption; name: string; emoji: string; description: string }[] = [
  { id: 'COMMUNITY', name: '커뮤니티', emoji: '👥', description: '다른 사용자들의 인증' },
  { id: 'GPS', name: 'GPS', emoji: '📍', description: '위치 기반 인증' },
  { id: 'TIME', name: '시간', emoji: '⏱️', description: '시간 기반 인증' },
];

// 챌린지 기간 옵션
const CHALLENGE_DAYS_OPTIONS = [
  { id: 1, name: '1일', emoji: '1️⃣' },
  { id: 7, name: '7일', emoji: '7️⃣' },
  { id: 14, name: '14일', emoji: '🔢' },
  { id: 30, name: '30일', emoji: '📅' },
];

// 완료 기한 옵션
const DEADLINE_DAYS_OPTIONS = [
  { id: 1, name: '1일', emoji: '⚡' },
  { id: 3, name: '3일', emoji: '📆' },
  { id: 7, name: '7일', emoji: '📅' },
];


const CustomMissionCreateScreen: React.FC<CustomMissionCreateScreenProps> = ({ navigation, route }) => {
  const { currentNickname } = useUser();
  const { createCustomMission } = useMission();
  const generatedMission = route?.params?.generatedMission;

  // 수정 모드 관련
  const isEditMode = route?.params?.mode === 'edit';
  const editMissionId = route?.params?.missionId;
  const missionData = route?.params?.missionData;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🎯');
  const [loading, setLoading] = useState(false);
  const [worryType, setWorryType] = useState<WorryType | null>(null);
  // 새로운 필드들
  const [category, setCategory] = useState<MissionCategoryOption>('DAILY_LIFE');
  const [verificationType, setVerificationType] = useState<VerificationTypeOption>('COMMUNITY');
  const [isChallenge, setIsChallenge] = useState(false);  // 챌린지 미션 여부
  const [challengeDays, setChallengeDays] = useState(7);
  const [deadlineDays, setDeadlineDays] = useState(3);

  // 시간 미션용 상태
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // 수정 모드일 때 기존 데이터로 초기화
  useEffect(() => {
    if (isEditMode && missionData) {
      setTitle(missionData.title || '');
      setDescription(missionData.description || '');
      setCategory((missionData.category as MissionCategoryOption) || 'DAILY_LIFE');
      setVerificationType((missionData.verificationType as VerificationTypeOption) || 'COMMUNITY');
      setIsChallenge(missionData.isChallenge || false);
      setChallengeDays(missionData.challengeDays || 7);
      setDeadlineDays(missionData.deadlineDays || 3);
      setWorryType((missionData.worryType as WorryType) || null);
    }
  }, [isEditMode, missionData]);

  // AI 생성 미션이 있으면 초기값 설정
  useEffect(() => {
    if (generatedMission && !isEditMode) {
      setTitle(generatedMission.title || '');
      setDescription(generatedMission.description || '');
      setSelectedEmoji(generatedMission.emoji || '🎯');
    }
  }, [generatedMission, isEditMode]);

  const handleSubmitMission = async () => {
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

      // 백엔드 API 형식에 맞게 데이터 구성
      const missionPayload = {
        title: title.trim(),
        description: description.trim(),
        emoji: selectedEmoji,
        experience: 0, // 커스텀 미션은 경험치 지급 없음
        // 백엔드 필수 필드들
        durationDays: isChallenge ? challengeDays : deadlineDays,  // 미션 기간
        isPublic: true,  // 기본값: 공개
        verificationType: verificationType,
        badgeDurationDays: isChallenge ? challengeDays : 7,  // 뱃지 유효 기간
        worryType: worryType,
        // 새로운 필드들
        category: category,  // 미션 카테고리
        isChallenge: isChallenge,  // 챌린지 미션 여부
        challengeDays: isChallenge ? challengeDays : undefined,  // 챌린지 미션일 때만
        deadlineDays: isChallenge ? undefined : deadlineDays,    // 일반 미션일 때만
        // 시간 미션용 필드
        startTime: verificationType === 'TIME' ? formatTime(startTime) : undefined,
        endTime: verificationType === 'TIME' ? formatTime(endTime) : undefined,
      };

      let result;
      if (isEditMode && editMissionId) {
        // 수정 모드: updateCustomMission 호출
        result = await updateCustomMission(editMissionId, missionPayload);
      } else {
        // 생성 모드: createCustomMission 호출
        result = await createCustomMission(missionPayload);
      }

      if (result.success) {
        Alert.alert(
          '성공!',
          isEditMode ? '미션이 수정되었습니다!' : '나만의 미션이 생성되었습니다!',
          [
            {
              text: '확인',
              onPress: () => (navigation as any).navigate(ScreenNames.MISSION)
            }
          ]
        );
      } else {
        Alert.alert('오류', result.error || (isEditMode ? '미션 수정에 실패했습니다.' : '미션 생성에 실패했습니다.'));
      }
    } catch (error) {
      Alert.alert('오류', isEditMode ? '미션 수정 중 오류가 발생했습니다.' : '미션 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 시간 포맷팅 (HH:mm)
  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // 시간 선택 핸들러
  const handleStartTimeChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartTimePicker(false);
    }
    if (selectedDate) {
      setStartTime(selectedDate);
    }
  };

  const handleEndTimeChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndTimePicker(false);
    }
    if (selectedDate) {
      setEndTime(selectedDate);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* 헤더 */}
      <Header
        title={isEditMode ? "미션 수정" : "미션 만들기"}
        leftButton={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../../assets/images/left.png')}
              style={styles.backButtonIcon}
              resizeMode="contain"
              accessibilityLabel="뒤로 가기"
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
          <SectionTitle title="미션 카테고리" size="lg" marginBottom={spacing[3]} />
          <View style={styles.categoryContainer}>
            {MISSION_CATEGORY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.categoryButton,
                  category === option.id && styles.selectedCategory
                ]}
                onPress={() => setCategory(option.id)}
              >
                <Text style={styles.categoryEmoji}>{option.emoji}</Text>
                <Text style={[
                  styles.categoryText,
                  category === option.id && styles.selectedCategoryText
                ]}>
                  {option.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </FormCard>

        <FormCard>
          <SectionTitle title="인증 방식" size="lg" marginBottom={spacing[3]} />
          <View style={styles.verificationContainer}>
            {VERIFICATION_TYPE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.verificationButton,
                  verificationType === option.id && styles.selectedVerification
                ]}
                onPress={() => setVerificationType(option.id)}
              >
                <Text style={styles.verificationEmoji}>{option.emoji}</Text>
                <Text style={[
                  styles.verificationText,
                  verificationType === option.id && styles.selectedVerificationText
                ]}>
                  {option.name}
                </Text>
                <Text style={styles.verificationDesc}>{option.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 시간 미션일 때 시작/종료 시간 설정 */}
          {verificationType === 'TIME' && (
            <View style={styles.timeSettingContainer}>
              <Text style={styles.timeSettingTitle}>인증 가능 시간대 설정</Text>
              <View style={styles.timePickerRow}>
                <View style={styles.timePickerItem}>
                  <Text style={styles.timeLabel}>시작 시간</Text>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => setShowStartTimePicker(true)}
                  >
                    <Text style={styles.timeButtonText}>{formatTime(startTime)}</Text>
                  </TouchableOpacity>
                  {showStartTimePicker && (
                    <DateTimePicker
                      value={startTime}
                      mode="time"
                      is24Hour={true}
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={handleStartTimeChange}
                    />
                  )}
                </View>
                <Text style={styles.timeSeparator}>~</Text>
                <View style={styles.timePickerItem}>
                  <Text style={styles.timeLabel}>종료 시간</Text>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => setShowEndTimePicker(true)}
                  >
                    <Text style={styles.timeButtonText}>{formatTime(endTime)}</Text>
                  </TouchableOpacity>
                  {showEndTimePicker && (
                    <DateTimePicker
                      value={endTime}
                      mode="time"
                      is24Hour={true}
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={handleEndTimeChange}
                    />
                  )}
                </View>
              </View>
              <Text style={styles.timeHint}>이 시간대에만 미션 인증이 가능합니다</Text>
            </View>
          )}
        </FormCard>

        <FormCard>
          <SectionTitle title="미션 유형" size="lg" marginBottom={spacing[3]} />
          <View style={styles.missionTypeToggle}>
            <TouchableOpacity
              style={[
                styles.missionTypeButton,
                !isChallenge && styles.selectedMissionType
              ]}
              onPress={() => setIsChallenge(false)}
            >
              <Text style={styles.missionTypeEmoji}>📋</Text>
              <Text style={[
                styles.missionTypeText,
                !isChallenge && styles.selectedMissionTypeText
              ]}>
                일반 미션
              </Text>
              <Text style={styles.missionTypeDesc}>기한 내 1회 완료</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.missionTypeButton,
                isChallenge && styles.selectedMissionType
              ]}
              onPress={() => setIsChallenge(true)}
            >
              <Text style={styles.missionTypeEmoji}>🔥</Text>
              <Text style={[
                styles.missionTypeText,
                isChallenge && styles.selectedMissionTypeText
              ]}>
                챌린지 미션
              </Text>
              <Text style={styles.missionTypeDesc}>기간 동안 매일 인증</Text>
            </TouchableOpacity>
          </View>
        </FormCard>

        {isChallenge ? (
          <FormCard>
            <SectionTitle title="챌린지 기간" size="lg" marginBottom={spacing[3]} />
            <View style={styles.daysContainer}>
              {CHALLENGE_DAYS_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.daysButton,
                    challengeDays === option.id && styles.selectedDays
                  ]}
                  onPress={() => setChallengeDays(option.id)}
                >
                  <Text style={styles.daysEmoji}>{option.emoji}</Text>
                  <Text style={[
                    styles.daysText,
                    challengeDays === option.id && styles.selectedDaysText
                  ]}>
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.optionalHint}>챌린지 기간 동안 매일 인증해야 합니다</Text>
          </FormCard>
        ) : (
          <FormCard>
            <SectionTitle title="완료 기한" size="lg" marginBottom={spacing[3]} />
            <View style={styles.daysContainer}>
              {DEADLINE_DAYS_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.daysButton,
                    deadlineDays === option.id && styles.selectedDays
                  ]}
                  onPress={() => setDeadlineDays(option.id)}
                >
                  <Text style={styles.daysEmoji}>{option.emoji}</Text>
                  <Text style={[
                    styles.daysText,
                    deadlineDays === option.id && styles.selectedDaysText
                  ]}>
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.optionalHint}>미션 할당 후 이 기간 내에 완료해야 합니다</Text>
          </FormCard>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="취소"
          onPress={() => (navigation as any).navigate(ScreenNames.MISSION)}
          style={StyleSheet.flatten([styles.button, styles.cancelButton])}
          textStyle={styles.cancelButtonText}
        />
        <Button
          title={loading ? (isEditMode ? "수정 중..." : "생성 중...") : (isEditMode ? "미션 수정" : "미션 생성")}
          onPress={handleSubmitMission}
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
  // 카테고리 스타일
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  categoryButton: {
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
  selectedCategory: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[500],
  },
  categoryEmoji: {
    fontSize: typography.fontSize.base,
  },
  categoryText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  selectedCategoryText: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  // 인증방식 스타일
  verificationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  verificationButton: {
    flex: 1,
    alignItems: 'center',
    padding: spacing[3],
    marginHorizontal: spacing[1],
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  selectedVerification: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[500],
  },
  verificationEmoji: {
    fontSize: typography.fontSize.xl,
    marginBottom: spacing[1],
  },
  verificationText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  selectedVerificationText: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  verificationDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  // 시간 설정 스타일
  timeSettingContainer: {
    marginTop: spacing[4],
    padding: spacing[3],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  timeSettingTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[700],
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timePickerItem: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  timeButton: {
    backgroundColor: colors.background.primary,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary[300],
    minWidth: 100,
    alignItems: 'center',
  },
  timeButtonText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },
  timeSeparator: {
    fontSize: typography.fontSize.xl,
    color: colors.text.secondary,
    marginHorizontal: spacing[3],
    marginTop: spacing[4],
  },
  timeHint: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing[3],
  },
  // 미션 유형 토글 스타일
  missionTypeToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  missionTypeButton: {
    flex: 1,
    alignItems: 'center',
    padding: spacing[4],
    marginHorizontal: spacing[1],
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.primary,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  selectedMissionType: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[500],
  },
  missionTypeEmoji: {
    fontSize: typography.fontSize['2xl'],
    marginBottom: spacing[2],
  },
  missionTypeText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  selectedMissionTypeText: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.bold,
  },
  missionTypeDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  // 기간 선택 스타일
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  daysButton: {
    flex: 1,
    alignItems: 'center',
    padding: spacing[3],
    marginHorizontal: spacing[1],
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  selectedDays: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[500],
  },
  daysEmoji: {
    fontSize: typography.fontSize.xl,
    marginBottom: spacing[1],
  },
  daysText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  selectedDaysText: {
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
