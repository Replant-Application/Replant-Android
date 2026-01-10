import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { AppHeader } from '../../components/ui';
import {
  UserRoutine,
  RoutineType,
  UserRoutineRequest,
  getActiveRoutines,
  saveRoutine,
  deleteRoutine,
  getRoutineIcon,
  formatTimeDisplay,
  formatTimeForApi,
} from '../../api/routineApi';

interface RoutineSettingScreenProps {
  navigation: any;
}

// 루틴 설정 항목 정의
interface RoutineConfig {
  type: RoutineType;
  name: string;
  icon: string;
  description: string;
  inputType: 'time' | 'text' | 'place';
  placeholder?: string;
}

const ROUTINE_CONFIGS: RoutineConfig[] = [
  {
    type: 'WAKE_UP_TIME',
    name: '기상 시간',
    icon: '⏰',
    description: '매일 일어날 시간을 설정해요',
    inputType: 'time',
  },
  {
    type: 'DAILY_PLACE',
    name: '매일 갈 장소',
    icon: '📍',
    description: '매일 방문할 장소를 설정해요',
    inputType: 'place',
    placeholder: '장소 이름을 입력하세요',
  },
  {
    type: 'WEEKLY_RESOLUTION',
    name: '이번 주 다짐',
    icon: '📝',
    description: '이번 주 목표를 적어보세요',
    inputType: 'text',
    placeholder: '이번 주 다짐을 입력하세요',
  },
  {
    type: 'MONTHLY_RESOLUTION',
    name: '이번 달 다짐',
    icon: '🎯',
    description: '이번 달 목표를 적어보세요',
    inputType: 'text',
    placeholder: '이번 달 다짐을 입력하세요',
  },
];

const RoutineSettingScreen: React.FC<RoutineSettingScreenProps> = ({ navigation }) => {
  const [routines, setRoutines] = useState<UserRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<RoutineType | null>(null);

  // 편집 상태
  const [editingType, setEditingType] = useState<RoutineType | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editTime, setEditTime] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  // 데이터 로드
  const loadRoutines = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getActiveRoutines();
      setRoutines(data);
    } catch (error) {
      console.error('Failed to load routines:', error);
      Alert.alert('오류', '루틴 설정을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoutines();
  }, [loadRoutines]);

  // 특정 타입의 현재 루틴 가져오기
  const getRoutineByType = (type: RoutineType): UserRoutine | undefined => {
    return routines.find(r => r.routineType === type);
  };

  // 루틴 값 표시
  const getDisplayValue = (routine: UserRoutine | undefined, config: RoutineConfig): string => {
    if (!routine) return '설정하기';

    switch (config.inputType) {
      case 'time':
        return routine.valueTime ? formatTimeDisplay(routine.valueTime) : '설정하기';
      case 'text':
      case 'place':
        return routine.valueText || '설정하기';
      default:
        return '설정하기';
    }
  };

  // 편집 시작
  const startEditing = (config: RoutineConfig) => {
    const routine = getRoutineByType(config.type);
    setEditingType(config.type);

    if (config.inputType === 'time') {
      if (routine?.valueTime) {
        const [hours, minutes] = routine.valueTime.split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));
        setEditTime(date);
      } else {
        const defaultTime = new Date();
        defaultTime.setHours(7, 0, 0, 0);
        setEditTime(defaultTime);
      }
      setShowTimePicker(true);
    } else {
      setEditValue(routine?.valueText || '');
    }

    setNotificationEnabled(routine?.notificationEnabled || false);
  };

  // 편집 취소
  const cancelEditing = () => {
    setEditingType(null);
    setEditValue('');
    setShowTimePicker(false);
  };

  // 루틴 저장
  const handleSave = async (config: RoutineConfig) => {
    try {
      setSaving(config.type);

      const request: UserRoutineRequest = {
        routineType: config.type,
        notificationEnabled,
      };

      if (config.inputType === 'time') {
        const hours = editTime.getHours().toString().padStart(2, '0');
        const minutes = editTime.getMinutes().toString().padStart(2, '0');
        request.valueTime = formatTimeForApi(`${hours}:${minutes}`);
        if (notificationEnabled) {
          request.notificationTime = request.valueTime;
        }
      } else {
        request.valueText = editValue;
      }

      await saveRoutine(request);
      await loadRoutines();
      cancelEditing();
      Alert.alert('성공', '루틴이 저장되었습니다.');
    } catch (error) {
      console.error('Failed to save routine:', error);
      Alert.alert('오류', '루틴 저장에 실패했습니다.');
    } finally {
      setSaving(null);
    }
  };

  // 루틴 삭제
  const handleDelete = async (routineId: number, routineName: string) => {
    Alert.alert(
      '삭제 확인',
      `"${routineName}" 설정을 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRoutine(routineId);
              await loadRoutines();
              Alert.alert('성공', '루틴이 삭제되었습니다.');
            } catch (error) {
              console.error('Failed to delete routine:', error);
              Alert.alert('오류', '루틴 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  // 시간 선택 처리
  const handleTimeChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedDate) {
      setEditTime(selectedDate);
    }
  };

  // 히스토리 보기
  const handleViewHistory = (config: RoutineConfig) => {
    navigation.navigate('RoutineHistory', { routineType: config.type, routineName: config.name });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader navigation={navigation} title="나의 루틴 설정" showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>불러오는 중...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader navigation={navigation} title="나의 루틴 설정" showBack />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>루틴 설정</Text>
        <Text style={styles.sectionDescription}>
          미션 달성에 필요한 정보를 설정해요.{'\n'}
          알림을 켜면 설정한 시간에 알려드려요.
        </Text>

        {ROUTINE_CONFIGS.map((config) => {
          const routine = getRoutineByType(config.type);
          const isEditing = editingType === config.type;
          const isSaving = saving === config.type;

          return (
            <View key={config.type} style={styles.routineCard}>
              <View style={styles.routineHeader}>
                <View style={styles.routineIconContainer}>
                  <Text style={styles.routineIcon}>{config.icon}</Text>
                </View>
                <View style={styles.routineInfo}>
                  <Text style={styles.routineName}>{config.name}</Text>
                  <Text style={styles.routineDescription}>{config.description}</Text>
                </View>
                {routine && (
                  <TouchableOpacity
                    style={styles.historyButton}
                    onPress={() => handleViewHistory(config)}
                  >
                    <Text style={styles.historyButtonText}>기록</Text>
                  </TouchableOpacity>
                )}
              </View>

              {isEditing ? (
                // 편집 모드
                <View style={styles.editContainer}>
                  {config.inputType === 'time' ? (
                    <View style={styles.timeEditContainer}>
                      <TouchableOpacity
                        style={styles.timeDisplay}
                        onPress={() => setShowTimePicker(true)}
                      >
                        <Text style={styles.timeText}>
                          {editTime.getHours().toString().padStart(2, '0')}:
                          {editTime.getMinutes().toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                      {showTimePicker && (
                        <DateTimePicker
                          value={editTime}
                          mode="time"
                          is24Hour={true}
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={handleTimeChange}
                        />
                      )}
                    </View>
                  ) : (
                    <TextInput
                      style={styles.textInput}
                      value={editValue}
                      onChangeText={setEditValue}
                      placeholder={config.placeholder}
                      placeholderTextColor={colors.gray[400]}
                      multiline={config.inputType === 'text'}
                      numberOfLines={config.inputType === 'text' ? 3 : 1}
                    />
                  )}

                  <View style={styles.notificationRow}>
                    <Text style={styles.notificationLabel}>알림 받기</Text>
                    <Switch
                      value={notificationEnabled}
                      onValueChange={setNotificationEnabled}
                      trackColor={{ false: colors.gray[300], true: colors.primary[300] }}
                      thumbColor={notificationEnabled ? colors.primary[500] : colors.gray[100]}
                    />
                  </View>

                  <View style={styles.editActions}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={cancelEditing}
                    >
                      <Text style={styles.cancelButtonText}>취소</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                      onPress={() => handleSave(config)}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.saveButtonText}>저장</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                // 표시 모드
                <TouchableOpacity
                  style={styles.valueContainer}
                  onPress={() => startEditing(config)}
                >
                  <Text style={[
                    styles.valueText,
                    !routine && styles.valueTextPlaceholder
                  ]}>
                    {getDisplayValue(routine, config)}
                  </Text>
                  <Text style={styles.editIcon}>›</Text>
                </TouchableOpacity>
              )}

              {routine && !isEditing && (
                <View style={styles.routineFooter}>
                  <View style={styles.notificationStatus}>
                    <Text style={styles.notificationStatusText}>
                      알림 {routine.notificationEnabled ? '켜짐' : '꺼짐'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(routine.id, config.name)}
                  >
                    <Text style={styles.deleteButtonText}>삭제</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing[4],
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  sectionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm) * 1.5,
    marginBottom: spacing[4],
  },
  routineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  routineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  routineIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  routineIcon: {
    fontSize: 22,
  },
  routineInfo: {
    flex: 1,
  },
  routineName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  routineDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  historyButton: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.sm,
  },
  historyButtonText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    padding: spacing[3],
  },
  valueText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  valueTextPlaceholder: {
    color: colors.text.tertiary,
  },
  editIcon: {
    fontSize: typography.fontSize.xl,
    color: colors.gray[400],
  },
  editContainer: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    padding: spacing[3],
  },
  timeEditContainer: {
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  timeDisplay: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  timeText: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    padding: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.gray[300],
    marginBottom: spacing[3],
    minHeight: 44,
    textAlignVertical: 'top',
  },
  notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
    marginBottom: spacing[3],
  },
  notificationLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[2],
  },
  cancelButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[200],
  },
  cancelButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  saveButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[500],
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.primary[300],
  },
  saveButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: '#FFFFFF',
  },
  routineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  notificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationStatusText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  deleteButton: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
  },
  deleteButtonText: {
    fontSize: typography.fontSize.xs,
    color: colors.error[500],
  },
  bottomSpacer: {
    height: 100,
  },
});

export default RoutineSettingScreen;
