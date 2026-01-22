import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, Header, SectionTitle, FormCard } from '../../components/ui';
import { colors, spacing } from '../../utils/designTokens';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import {
  useCustomMissionCreateScreenContainer,
  WORRY_TYPE_OPTIONS,
  MISSION_CATEGORY_OPTIONS,
  VERIFICATION_TYPE_OPTIONS,
  CHALLENGE_DAYS_OPTIONS,
  DEADLINE_DAYS_OPTIONS,
} from './CustomMissionCreateScreen.container';
import { styles } from './CustomMissionCreateScreen.styles';

interface CustomMissionCreateScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route?: RouteProp<RootStackParamList, 'CustomMissionCreate'>;
}

const CustomMissionCreateScreen: React.FC<CustomMissionCreateScreenProps> = ({ navigation, route }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    isEditMode,
    title,
    description,
    selectedEmoji,
    loading,
    worryType,
    category,
    verificationType,
    isChallenge,
    challengeDays,
    deadlineDays,
    startTime,
    endTime,
    showStartTimePicker,
    showEndTimePicker,
    setTitle,
    setDescription,
    setSelectedEmoji,
    setWorryType,
    setCategory,
    setVerificationType,
    setIsChallenge,
    setChallengeDays,
    setDeadlineDays,
    setShowStartTimePicker,
    setShowEndTimePicker,
    handleSubmitMission,
    handleCancel,
    handleStartTimeChange,
    handleEndTimeChange,
    formatTime,
  } = useCustomMissionCreateScreenContainer({ navigation, route });

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
            placeholderTextColor={colors.text.secondary}
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
            placeholderTextColor={colors.text.secondary}
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
          onPress={handleCancel}
          style={StyleSheet.flatten([styles.button, styles.cancelButton])}
          textStyle={styles.cancelButtonText}
        />
        <Button
          title={loading ? (isEditMode ? '수정 중...' : '생성 중...') : isEditMode ? '미션 수정' : '미션 생성'}
          onPress={handleSubmitMission}
          style={StyleSheet.flatten([styles.button, styles.createButton])}
          disabled={loading}
        />
      </View>
    </KeyboardAvoidingView>
  );
};


export default CustomMissionCreateScreen;
