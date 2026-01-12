import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
  Alert,
  ImageBackground,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { Header } from '../../components/ui';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { SCREEN_NAMES } from '../../utils/constants';
import { initTodoList, getSelectableMissions, createTodoList } from '../../api/todolistApi';
import { MissionSimple, TodoListCreateRequest } from '../../types/todolist';

interface Props {
  navigation: any;
}

type Step = 'intro' | 'random' | 'custom' | 'confirm';

const TodoListCreateScreen: React.FC<Props> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState<Step>('intro');
  const [randomMissions, setRandomMissions] = useState<MissionSimple[]>([]);
  const [customMissions, setCustomMissions] = useState<MissionSimple[]>([]);
  const [selectedCustomMissions, setSelectedCustomMissions] = useState<number[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const loadRandomMissions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await initTodoList();
      if (result.success && result.data) {
        setRandomMissions(result.data.randomMissions);
      } else {
        Alert.alert('오류', '미션을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '미션을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCustomMissions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getSelectableMissions();
      if (result.success && result.data) {
        setCustomMissions(result.data);
      }
    } catch (error) {
      console.error('Failed to load custom missions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentStep === 'random') {
      loadRandomMissions();
    } else if (currentStep === 'custom') {
      loadCustomMissions();
    }
  }, [currentStep, loadRandomMissions, loadCustomMissions]);

  const handleCustomMissionToggle = (missionId: number) => {
    setSelectedCustomMissions((prev) => {
      if (prev.includes(missionId)) {
        return prev.filter((id) => id !== missionId);
      } else if (prev.length < 2) {
        return [...prev, missionId];
      }
      return prev;
    });
  };

  const handleCreate = async () => {
    if (selectedCustomMissions.length !== 2) {
      Alert.alert('알림', '커스텀 미션을 2개 선택해주세요.');
      return;
    }

    setCreating(true);
    try {
      const request: TodoListCreateRequest = {
        title: title || `${new Date().toLocaleDateString('ko-KR')} 투두리스트`,
        description: description || undefined,
        randomMissionIds: randomMissions.map((m) => m.id),
        customMissionIds: selectedCustomMissions,
      };

      const result = await createTodoList(request);
      if (result.success && result.data) {
        Alert.alert('성공', '투두리스트가 생성되었습니다!', [
          {
            text: '확인',
            onPress: () => {
              // 투두리스트 목록 화면으로 이동
              navigation.navigate(SCREEN_NAMES.TODO_LIST);
            },
          },
        ]);
      } else {
        Alert.alert('오류', result.error || '투두리스트 생성에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '투두리스트 생성에 실패했습니다.');
    } finally {
      setCreating(false);
    }
  };

  const renderIntroStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.introContent}>
        <Text style={styles.introIcon}>📋</Text>
        <Text style={styles.introTitle}>새 투두리스트 만들기</Text>
        <Text style={styles.introDescription}>
          투두리스트는 총 5개의 미션으로 구성됩니다.{'\n\n'}
          • 3개의 공식 미션이 랜덤으로 배정됩니다{'\n'}
          • 2개의 미션은 직접 선택할 수 있습니다{'\n\n'}
          80% 이상 완료하면 새로운 투두리스트를 만들 수 있습니다!
        </Text>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setCurrentStep('random')}
        activeOpacity={0.7}
      >
        <Text style={styles.primaryButtonText}>시작하기</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRandomStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>1단계: 랜덤 미션 확인</Text>
        <Text style={styles.stepSubtitle}>
          다음 3개의 공식 미션이 배정되었습니다
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>미션을 불러오는 중...</Text>
        </View>
      ) : (
        <ScrollView style={styles.missionList} showsVerticalScrollIndicator={false}>
          {randomMissions.map((mission, index) => (
            <View key={mission.id} style={styles.missionCard}>
              <View style={styles.missionNumber}>
                <Text style={styles.missionNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.missionContent}>
                <Text style={styles.missionTitle}>{mission.title}</Text>
                <Text style={styles.missionDescription} numberOfLines={2}>
                  {mission.description}
                </Text>
                <View style={styles.missionMeta}>
                  <Text style={styles.missionCategory}>{mission.category}</Text>
                  <Text style={styles.missionExp}>+{mission.expReward} EXP</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setCurrentStep('intro')}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>이전</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, styles.buttonFlex]}
          onPress={() => setCurrentStep('custom')}
          disabled={loading || randomMissions.length === 0}
          activeOpacity={0.7}
        >
          <Text style={styles.primaryButtonText}>다음</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCustomStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>2단계: 커스텀 미션 선택</Text>
        <Text style={styles.stepSubtitle}>
          2개의 미션을 선택해주세요 ({selectedCustomMissions.length}/2)
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>미션을 불러오는 중...</Text>
        </View>
      ) : customMissions.length > 0 ? (
        <ScrollView style={styles.missionList} showsVerticalScrollIndicator={false}>
          {customMissions.map((mission) => {
            const isSelected = selectedCustomMissions.includes(mission.id);
            return (
              <TouchableOpacity
                key={mission.id}
                style={[
                  styles.selectableMissionCard,
                  isSelected && styles.selectableMissionCardSelected,
                ]}
                onPress={() => handleCustomMissionToggle(mission.id)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.checkbox,
                  isSelected && styles.checkboxSelected,
                ]}>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={styles.missionContent}>
                  <Text style={[
                    styles.missionTitle,
                    isSelected && styles.missionTitleSelected,
                  ]}>
                    {mission.title}
                  </Text>
                  <Text style={styles.missionDescription} numberOfLines={2}>
                    {mission.description}
                  </Text>
                  <View style={styles.missionMeta}>
                    <Text style={styles.missionCategory}>{mission.category}</Text>
                    <Text style={styles.missionExp}>+{mission.expReward} EXP</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>선택 가능한 미션이 없습니다</Text>
          <Text style={styles.emptySubtext}>
            미션 도감에서 커스텀 미션을 먼저 추가해주세요
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setCurrentStep('random')}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>이전</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            styles.buttonFlex,
            selectedCustomMissions.length !== 2 && styles.buttonDisabled,
          ]}
          onPress={() => setCurrentStep('confirm')}
          disabled={selectedCustomMissions.length !== 2}
          activeOpacity={0.7}
        >
          <Text style={styles.primaryButtonText}>다음</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderConfirmStep = () => {
    const selectedMissions = customMissions.filter((m) =>
      selectedCustomMissions.includes(m.id)
    );

    return (
      <View style={styles.stepContainer}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>3단계: 투두리스트 생성</Text>
          <Text style={styles.stepSubtitle}>
            투두리스트 정보를 입력하고 생성하세요
          </Text>
        </View>

        <ScrollView style={styles.confirmContent} showsVerticalScrollIndicator={false}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>제목 (선택)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="투두리스트 제목을 입력하세요"
              placeholderTextColor={colors.gray[400]}
              value={title}
              onChangeText={setTitle}
              maxLength={50}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>설명 (선택)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="투두리스트 설명을 입력하세요"
              placeholderTextColor={colors.gray[400]}
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={200}
            />
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>선택된 미션 (총 5개)</Text>

            <Text style={styles.summarySubtitle}>랜덤 배정 미션 (3개)</Text>
            {randomMissions.map((mission, index) => (
              <View key={mission.id} style={styles.summaryMission}>
                <Text style={styles.summaryMissionNumber}>{index + 1}.</Text>
                <Text style={styles.summaryMissionTitle}>{mission.title}</Text>
              </View>
            ))}

            <Text style={styles.summarySubtitle}>직접 선택 미션 (2개)</Text>
            {selectedMissions.map((mission, index) => (
              <View key={mission.id} style={styles.summaryMission}>
                <Text style={styles.summaryMissionNumber}>{index + 4}.</Text>
                <Text style={styles.summaryMissionTitle}>{mission.title}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setCurrentStep('custom')}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>이전</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryButton, styles.buttonFlex]}
            onPress={handleCreate}
            disabled={creating}
            activeOpacity={0.7}
          >
            {creating ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.primaryButtonText}>생성하기</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <Header title="투두리스트 생성" showBackButton={true} navigation={navigation} />

      {/* 진행 표시 */}
      <View style={styles.progressIndicator}>
        {['intro', 'random', 'custom', 'confirm'].map((step, index) => (
          <View key={step} style={styles.progressStep}>
            <View
              style={[
                styles.progressDot,
                currentStep === step && styles.progressDotActive,
                ['intro', 'random', 'custom', 'confirm'].indexOf(currentStep) > index &&
                  styles.progressDotCompleted,
              ]}
            >
              {['intro', 'random', 'custom', 'confirm'].indexOf(currentStep) > index && (
                <Text style={styles.progressDotCheck}>✓</Text>
              )}
            </View>
            {index < 3 && (
              <View
                style={[
                  styles.progressLine,
                  ['intro', 'random', 'custom', 'confirm'].indexOf(currentStep) > index &&
                    styles.progressLineCompleted,
                ]}
              />
            )}
          </View>
        ))}
      </View>

      {currentStep === 'intro' && renderIntroStep()}
      {currentStep === 'random' && renderRandomStep()}
      {currentStep === 'custom' && renderCustomStep()}
      {currentStep === 'confirm' && renderConfirmStep()}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[4],
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: spacing[4],
    marginTop: spacing[2],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#D4A574',
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDotActive: {
    backgroundColor: colors.primary[500],
  },
  progressDotCompleted: {
    backgroundColor: '#4CAF50',
  },
  progressDotCheck: {
    color: colors.white,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.gray[300],
    marginHorizontal: spacing[1],
  },
  progressLineCompleted: {
    backgroundColor: '#4CAF50',
  },
  stepContainer: {
    flex: 1,
    padding: spacing[4],
  },
  stepHeader: {
    marginBottom: spacing[4],
  },
  stepTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  stepSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  introContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
  },
  introIcon: {
    fontSize: 64,
    marginBottom: spacing[6],
  },
  introTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[4],
    textAlign: 'center',
  },
  introDescription: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: getOptimizedLineHeight(typography.fontSize.base) * 1.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing[3],
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  missionList: {
    flex: 1,
  },
  missionCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: '#D4A574',
    padding: spacing[4],
    marginBottom: spacing[3],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  missionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  missionNumberText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  missionContent: {
    flex: 1,
  },
  missionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  missionTitleSelected: {
    color: colors.primary[700],
  },
  missionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[2],
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  missionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  missionCategory: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[600],
    backgroundColor: colors.primary[50],
    paddingVertical: 2,
    paddingHorizontal: spacing[2],
    borderRadius: borderRadius.sm,
  },
  missionExp: {
    fontSize: typography.fontSize.xs,
    color: '#FF9800',
    fontWeight: typography.fontWeight.semibold,
  },
  selectableMissionCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 2,
    borderColor: colors.gray[200],
  },
  selectableMissionCardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  checkboxSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[500],
  },
  checkmark: {
    color: colors.white,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
  },
  confirmContent: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: spacing[4],
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  textInput: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  summarySection: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  summaryTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  summarySubtitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[600],
    marginTop: spacing[2],
    marginBottom: spacing[2],
  },
  summaryMission: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[1.5],
  },
  summaryMissionNumber: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginRight: spacing[2],
    minWidth: 20,
  },
  summaryMissionTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingTop: spacing[4],
  },
  primaryButton: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  secondaryButton: {
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  buttonFlex: {
    flex: 1,
  },
  buttonDisabled: {
    backgroundColor: colors.gray[300],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});

export default TodoListCreateScreen;
