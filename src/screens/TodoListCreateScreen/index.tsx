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
  Image,
  Modal,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { Header, AlertModal } from '../../components/ui';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { SCREEN_NAMES } from '../../utils/constants';
import { initTodoList, getSelectableMissions, createTodoList } from '../../api/todolistApi';
import { MissionSimple, TodoListCreateRequest } from '../../types/todolist';
import { createCustomMission, CreateMissionRequest } from '../../api/missionApi';

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

  // 인라인 미션 생성 폼 상태
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMissionTitle, setNewMissionTitle] = useState('');
  const [newMissionDescription, setNewMissionDescription] = useState('');
  const [creatingMission, setCreatingMission] = useState(false);

  // 미션 생성 성공 모달 상태
  const [showMissionSuccessModal, setShowMissionSuccessModal] = useState(false);
  
  // 투두리스트 생성 성공 모달 상태
  const [showTodoListSuccessModal, setShowTodoListSuccessModal] = useState(false);
  
  // 시간대 설정 필요 모달 상태
  const [showTimeRequiredModal, setShowTimeRequiredModal] = useState(false);
  
  // 오늘 이미 투두리스트 생성 모달 상태
  const [showAlreadyCreatedModal, setShowAlreadyCreatedModal] = useState(false);

  // 미션별 시간 범위 설정 (미션 ID -> { start: "HH:mm", end: "HH:mm" })
  const [missionTimeRanges, setMissionTimeRanges] = useState<Record<number, { start: string; end: string }>>({});

  // 시간 설정 모달 상태
  const [showTimePickerModal, setShowTimePickerModal] = useState(false);
  const [selectedMissionForTime, setSelectedMissionForTime] = useState<number | null>(null);

  // 시작 시간 설정 상태
  const [startPeriod, setStartPeriod] = useState<'AM' | 'PM'>('AM');
  const [startHour, setStartHour] = useState(9);
  const [startMinute, setStartMinute] = useState(0);

  // 종료 시간 설정 상태
  const [endPeriod, setEndPeriod] = useState<'AM' | 'PM'>('PM');
  const [endHour, setEndHour] = useState(6);
  const [endMinute, setEndMinute] = useState(0);

  // 드롭다운 열림 상태
  const [openDropdown, setOpenDropdown] = useState<{
    type: 'startPeriod' | 'startHour' | 'startMinute' | 'endPeriod' | 'endHour' | 'endMinute' | null;
  }>({ type: null });

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
      if (prev.includes(missionId)) return prev.filter((id) => id !== missionId);
      return [...prev, missionId];
    });
  };

  const handleCreateMission = async () => {
    if (!newMissionTitle.trim()) {
      Alert.alert('오류', '미션 제목을 입력해주세요.');
      return;
    }
    if (!newMissionDescription.trim()) {
      Alert.alert('오류', '미션 설명을 입력해주세요.');
      return;
    }

    setCreatingMission(true);
    try {
      const request: CreateMissionRequest = {
        title: newMissionTitle.trim(),
        description: newMissionDescription.trim(),
        category: 'DAILY_LIFE',
        verificationType: 'COMMUNITY',
        expReward: 50,
        badgeDurationDays: 7,
        durationDays: 3,
        isPublic: true,
        deadlineDays: 3,
      };

      const result = await createCustomMission(request);
      if (result.success && result.data) {
        setShowMissionSuccessModal(true);
        setNewMissionTitle('');
        setNewMissionDescription('');
        setShowCreateForm(false);
        loadCustomMissions();
        if (result.data?.id) {
          setSelectedCustomMissions((prev) => [...prev, result.data!.id]);
        }
      } else {
        Alert.alert('오류', result.error || '미션 생성에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '미션 생성에 실패했습니다.');
    } finally {
      setCreatingMission(false);
    }
  };

  const handleCreate = async () => {
    if (selectedCustomMissions.length === 0) {
      Alert.alert('알림', '최소 1개 이상의 미션을 자유롭게 추가해주세요.');
      return;
    }

    // 모든 미션이 시간대 설정되었는지 확인
    const allMissionIds = [...randomMissions.map(m => m.id), ...selectedCustomMissions];
    const missionsWithoutTime = allMissionIds.filter(missionId => !missionTimeRanges[missionId]);
    
    if (missionsWithoutTime.length > 0) {
      setShowTimeRequiredModal(true);
      return;
    }

    setCreating(true);
    try {
      // missionSchedules 형식 변환: missionId를 문자열 키로 사용
      const missionSchedules: Record<string, { startTime: string; endTime: string }> = {};
      Object.entries(missionTimeRanges).forEach(([missionId, range]) => {
        missionSchedules[missionId] = {
          startTime: range.start,
          endTime: range.end,
        };
      });

      const request: TodoListCreateRequest = {
        title: title || `${new Date().toLocaleDateString('ko-KR')} 투두리스트`,
        description: description || undefined,
        randomMissionIds: randomMissions.map((m) => m.id),
        customMissionIds: selectedCustomMissions,
        missionSchedules: Object.keys(missionSchedules).length > 0 ? missionSchedules : undefined,
      };

      const result = await createTodoList(request);
      console.log('[TodoListCreateScreen] createTodoList 응답:', JSON.stringify(result, null, 2));
      if (result.success && result.data) {
        console.log('[TodoListCreateScreen] 투두리스트 생성 성공:', result.data);
        setShowTodoListSuccessModal(true);
      } else {
        console.error('[TodoListCreateScreen] 투두리스트 생성 실패:', result.error);
        // 오늘 이미 투두리스트를 생성한 경우
        if (result.error?.includes('이미') || result.error?.includes('오늘') || result.error?.includes('already') || result.error?.includes('canCreate')) {
          setShowAlreadyCreatedModal(true);
        } else {
          Alert.alert('오류', result.error || '투두리스트 생성에 실패했습니다.');
        }
      }
    } catch (error) {
      Alert.alert('오류', '투두리스트 생성에 실패했습니다.');
    } finally {
      setCreating(false);
    }
  };

  const renderIntroStep = () => (
    <View style={styles.introContainer}>
      <View style={styles.introContent}>
        <View style={styles.introIconContainer}>
          <Image 
            source={require('../../assets/images/list.png')} 
            style={styles.introIcon} 
            resizeMode="contain" 
            accessibilityLabel="투두리스트 아이콘"
          />
        </View>
        <Text style={styles.introTitle}>나만의 투두리스트 만들기</Text>
        <View style={styles.introDescriptionContainer}>
          <Text style={styles.introDescription}>
            공식 미션과 함께 원하는 미션을 추가해서{'\n'}
            나만의 투두리스트를 자유롭게 만들어보세요!
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={() => setCurrentStep('random')} activeOpacity={0.7}>
        <Text style={styles.primaryButtonText}>시작하기</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRandomStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>공식 미션</Text>
        <Text style={styles.stepSubtitle}>3개의 공식 미션이 배정되었습니다</Text>
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
                  <View style={styles.missionExpContainer}>
                    <Image
                      source={require('../../assets/images/sun.png')}
                      style={styles.sunIcon}
                      resizeMode="contain"
                      accessibilityLabel="경험치 아이콘"
                    />
                    <Text style={styles.missionExp}>{mission.expReward} EXP</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => setCurrentStep('intro')} activeOpacity={0.7}>
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
        <Text style={styles.stepTitle}>미션 추가</Text>
        <Text style={styles.stepSubtitle}>
          원하는 미션을 자유롭게 선택해주세요 ({selectedCustomMissions.length}개 선택됨)
        </Text>
      </View>

      <TouchableOpacity
        style={styles.createMissionButton}
        onPress={() => setShowCreateForm(!showCreateForm)}
        activeOpacity={0.7}
      >
        <Text style={styles.createMissionButtonText}>{showCreateForm ? '✕ 취소' : '+ 나만의 투두미션 생성'}</Text>
      </TouchableOpacity>

      {showCreateForm && (
        <View style={styles.createMissionForm}>
          <Text style={styles.createMissionFormTitle}>나만의 투두미션 만들기</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>미션 제목</Text>
            <TextInput
              style={styles.textInput}
              placeholder="미션 제목을 입력하세요"
              placeholderTextColor={colors.gray[400]}
              value={newMissionTitle}
              onChangeText={setNewMissionTitle}
              maxLength={50}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>미션 설명</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="미션에 대한 자세한 설명을 입력하세요"
              placeholderTextColor={colors.gray[400]}
              value={newMissionDescription}
              onChangeText={setNewMissionDescription}
              multiline
              maxLength={200}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, creatingMission && styles.buttonDisabled]}
            onPress={handleCreateMission}
            disabled={creatingMission}
            activeOpacity={0.7}
          >
            {creatingMission ? <ActivityIndicator size="small" color={colors.white} /> : <Text style={styles.primaryButtonText}>미션 생성</Text>}
          </TouchableOpacity>
        </View>
      )}

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
                style={[styles.selectableMissionCard, isSelected && styles.selectableMissionCardSelected]}
                onPress={() => handleCustomMissionToggle(mission.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={styles.missionContent}>
                  <Text style={[styles.missionTitle, isSelected && styles.missionTitleSelected]}>{mission.title}</Text>
                  <Text style={styles.missionDescription} numberOfLines={2}>
                    {mission.description}
                  </Text>
                  <View style={styles.missionMeta}>
                    <Text style={styles.missionCategory}>{mission.category}</Text>
                    {mission.missionType !== 'CUSTOM' && (
                      <View style={styles.missionExpContainer}>
                    <Image
                      source={require('../../assets/images/sun.png')}
                      style={styles.sunIcon}
                      resizeMode="contain"
                      accessibilityLabel="경험치 아이콘"
                    />
                    <Text style={styles.missionExp}>{mission.expReward} EXP</Text>
                  </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>선택 가능한 미션이 없습니다</Text>
          <Text style={styles.emptySubtext}>미션 도감에서 커스텀 미션을 먼저 추가해주세요</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => setCurrentStep('random')} activeOpacity={0.7}>
          <Text style={styles.secondaryButtonText}>이전</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, styles.buttonFlex, selectedCustomMissions.length === 0 && styles.buttonDisabled]}
          onPress={() => setCurrentStep('confirm')}
          disabled={selectedCustomMissions.length === 0}
          activeOpacity={0.7}
        >
          <Text style={styles.primaryButtonText}>다음</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderConfirmStep = () => {
    const selectedMissions = customMissions.filter((m) => selectedCustomMissions.includes(m.id));

    const allMissions = [
      ...randomMissions.map((m) => ({ ...m, type: 'official' as const })),
      ...selectedMissions.map((m) => ({ ...m, type: 'custom' as const })),
    ];

    const todayDate = new Date();
    const todayDayName = todayDate.toLocaleDateString('ko-KR', { weekday: 'short' });
    const todayDayNumber = todayDate.getDate();

    const missionsWithTime = allMissions
      .filter((m) => missionTimeRanges[m.id])
      .map((m) => {
        const range = missionTimeRanges[m.id];
        const [startHours, startMinutes] = range.start.split(':').map(Number);
        return { ...m, range, timeValue: startHours * 60 + startMinutes };
      })
      .sort((a, b) => a.timeValue - b.timeValue);

    const handleSetMissionTime = (missionId: number) => {
      const existingRange = missionTimeRanges[missionId];
      if (existingRange) {
        const [startHours, startMinutes] = existingRange.start.split(':').map(Number);
        const [endHours, endMinutes] = existingRange.end.split(':').map(Number);

        setStartPeriod(startHours >= 12 ? 'PM' : 'AM');
        setStartHour(startHours === 0 ? 12 : startHours > 12 ? startHours - 12 : startHours);
        setStartMinute(startMinutes);

        setEndPeriod(endHours >= 12 ? 'PM' : 'AM');
        setEndHour(endHours === 0 ? 12 : endHours > 12 ? endHours - 12 : endHours);
        setEndMinute(endMinutes);
      } else {
        setStartPeriod('AM');
        setStartHour(9);
        setStartMinute(0);
        setEndPeriod('PM');
        setEndHour(6);
        setEndMinute(0);
      }

      setSelectedMissionForTime(missionId);
      setShowTimePickerModal(true);
    };

    const convertTo24Hour = (period: 'AM' | 'PM', hour: number, minute: number): string => {
      let hours24 = hour;
      if (period === 'PM' && hour !== 12) hours24 = hour + 12;
      else if (period === 'AM' && hour === 12) hours24 = 0;
      return `${String(hours24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    };

    const handleSaveTime = () => {
      if (selectedMissionForTime) {
        const start = convertTo24Hour(startPeriod, startHour, startMinute);
        const end = convertTo24Hour(endPeriod, endHour, endMinute);
        setMissionTimeRanges((prev) => ({ ...prev, [selectedMissionForTime]: { start, end } }));
      }
      setShowTimePickerModal(false);
      setSelectedMissionForTime(null);
      setOpenDropdown({ type: null });
    };

    const handleRemoveTime = (missionId: number) => {
      setMissionTimeRanges((prev) => {
        const next = { ...prev };
        delete next[missionId];
        return next;
      });
    };

    const isOpen = (t: any) => openDropdown.type === t;

    return (
      <View style={styles.stepContainer}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>나만의 투두리스트 작성</Text>
          <Text style={styles.stepSubtitle}>오늘 하루의 커리큘럼을 정하세요</Text>
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
            <Text style={styles.inputLabel}>오늘 하루의 다짐</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="오늘 하루의 다짐을 입력하세요"
              placeholderTextColor={colors.gray[400]}
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={200}
            />
          </View>

          <View style={styles.todaySection}>
            <View style={styles.todayHeader}>
              <Text style={styles.todayDayName}>{todayDayName}</Text>
              <Text style={styles.todayDayNumber}>{todayDayNumber}</Text>
            </View>

            {missionsWithTime.length > 0 ? (
              missionsWithTime.map((mission) => (
                <View key={mission.id} style={styles.timeMissionItem}>
                  <View style={styles.timeMissionHeader}>
                    <Text style={styles.timeMissionTime}>
                      {mission.range.start} ~ {mission.range.end}
                    </Text>
                  </View>
                  <View style={styles.timeMissionContent}>
                    <Text style={styles.timeMissionTitle} numberOfLines={2}>{mission.title}</Text>
                    <TouchableOpacity style={styles.timeMissionRemoveButton} onPress={() => handleRemoveTime(mission.id)} activeOpacity={0.7}>
                      <Text style={styles.timeMissionRemoveText}>×</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyTodayText}>시간을 설정한 미션이 없습니다</Text>
            )}
          </View>

          <View style={styles.missionsListSection}>
            <Text style={styles.missionsListTitle}>미션을 시간대에 배치하세요</Text>
            {allMissions.map((mission) => {
              const missionRange = missionTimeRanges[mission.id];
              return (
                <TouchableOpacity
                  key={mission.id}
                  style={[styles.missionListItem, missionRange && styles.missionListItemSelected]}
                  onPress={() => handleSetMissionTime(mission.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.missionListItemContent}>
                    <Text style={[styles.missionListItemTitle, missionRange && styles.missionListItemTitleSelected]}>{mission.title}</Text>
                    <Text style={styles.missionListItemDescription} numberOfLines={1}>
                      {mission.description}
                    </Text>
                    <View style={styles.missionListItemMeta}>
                      <Text style={styles.missionListItemCategory}>{mission.category}</Text>
                      <View style={styles.missionListItemExpContainer}>
                        <Image
                          source={require('../../assets/images/sun.png')}
                          style={styles.sunIcon}
                          resizeMode="contain"
                          accessibilityLabel="경험치 아이콘"
                        />
                        <Text style={styles.missionListItemExp}>{mission.expReward} EXP</Text>
                      </View>
                    </View>
                    {missionRange && <Text style={styles.missionListItemTimeSlot}>{missionRange.start} ~ {missionRange.end}</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setCurrentStep('custom')} activeOpacity={0.7}>
            <Text style={styles.secondaryButtonText}>이전</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.primaryButton, styles.buttonFlex]} onPress={handleCreate} disabled={creating} activeOpacity={0.7}>
            {creating ? <ActivityIndicator size="small" color={colors.white} /> : <Text style={styles.primaryButtonText}>생성하기</Text>}
          </TouchableOpacity>
        </View>

        {/* 시간 설정 모달 */}
        <Modal
          visible={showTimePickerModal}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setShowTimePickerModal(false);
            setOpenDropdown({ type: null });
          }}
        >
          <TouchableOpacity
            style={styles.timePickerModalOverlay}
            activeOpacity={1}
            onPress={() => {
              if (openDropdown.type === null) {
                setShowTimePickerModal(false);
                setOpenDropdown({ type: null });
              }
            }}
            disabled={openDropdown.type !== null}
          >
            <View>
              {/* ✅ 그림자 wrapper (Android 사각 그림자 방지 + 드롭다운 안 가리도록 overflow 숨기지 않음) */}
              <View style={styles.modalShadowWrap}>
                <View style={styles.timePickerModalContainer}>
                  <Text style={styles.timePickerModalTitle}>시간 설정</Text>
                  {selectedMissionForTime && (
                    <Text style={styles.timePickerModalMissionTitle}>
                      {allMissions.find((m) => m.id === selectedMissionForTime)?.title}
                    </Text>
                  )}

                  {/* 시작 시간 */}
                  <View style={styles.timeRangeSection}>
                    <Text style={styles.timeRangeLabel}>시작 시간</Text>
                    <View style={styles.timeRangeRow}>
                      {/* AM/PM */}
                      <View style={[styles.dropdownContainer, styles.dropdownContainerPeriod, isOpen('startPeriod') && styles.dropdownContainerOpen]}>
                        <TouchableOpacity
                          style={styles.dropdownButton}
                          onPress={() => setOpenDropdown(isOpen('startPeriod') ? { type: null } : { type: 'startPeriod' })}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.dropdownButtonText}>{startPeriod}</Text>
                          <Text style={styles.dropdownArrow}>▼</Text>
                        </TouchableOpacity>
                        {isOpen('startPeriod') && (
                          <View style={styles.dropdownListSmall}>
                            <ScrollView 
                              style={styles.dropdownScrollViewSmall}
                              contentContainerStyle={styles.dropdownScrollContent}
                              nestedScrollEnabled={true}
                              showsVerticalScrollIndicator={false}
                              bounces={false}
                              scrollEnabled={false}
                            >
                              {['AM', 'PM'].map((period) => (
                                <TouchableOpacity
                                  key={period}
                                  style={styles.dropdownItem}
                                  onPress={() => {
                                    setStartPeriod(period as 'AM' | 'PM');
                                    setOpenDropdown({ type: null });
                                  }}
                                  activeOpacity={0.7}
                                >
                                  <Text style={styles.dropdownItemText}>{period}</Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                        )}
                      </View>

                      {/* Hour */}
                      <View style={[styles.dropdownContainer, styles.dropdownContainerHour, isOpen('startHour') && styles.dropdownContainerOpen]}>
                        <TouchableOpacity
                          style={styles.dropdownButton}
                          onPress={() => setOpenDropdown(isOpen('startHour') ? { type: null } : { type: 'startHour' })}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.dropdownButtonText}>{startHour}시</Text>
                          <Text style={styles.dropdownArrow}>▼</Text>
                        </TouchableOpacity>
                        {isOpen('startHour') && (
                          <View 
                            style={styles.dropdownList}
                            onStartShouldSetResponder={() => true}
                            onMoveShouldSetResponder={() => true}
                          >
                            <ScrollView
                              style={styles.dropdownScrollView}
                              contentContainerStyle={styles.dropdownScrollContent}
                              nestedScrollEnabled={true}
                              showsVerticalScrollIndicator={true}
                              bounces={false}
                              scrollEnabled={true}
                              persistentScrollbar={true}
                              removeClippedSubviews={false}
                              onStartShouldSetResponder={() => true}
                              onMoveShouldSetResponder={() => true}
                            >
                              {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                                <TouchableOpacity
                                  key={hour}
                                  style={styles.dropdownItem}
                                  onPress={() => {
                                    setStartHour(hour);
                                    setOpenDropdown({ type: null });
                                  }}
                                  activeOpacity={0.7}
                                >
                                  <Text style={styles.dropdownItemText}>{hour}시</Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                        )}
                      </View>

                      {/* Minute */}
                      <View style={[styles.dropdownContainer, styles.dropdownContainerMinute, isOpen('startMinute') && styles.dropdownContainerOpen]}>
                        <TouchableOpacity
                          style={styles.dropdownButton}
                          onPress={() => setOpenDropdown(isOpen('startMinute') ? { type: null } : { type: 'startMinute' })}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.dropdownButtonText}>{startMinute}분</Text>
                          <Text style={styles.dropdownArrow}>▼</Text>
                        </TouchableOpacity>
                        {isOpen('startMinute') && (
                          <View 
                            style={styles.dropdownList}
                            onStartShouldSetResponder={() => true}
                            onMoveShouldSetResponder={() => true}
                          >
                            <ScrollView 
                              style={styles.dropdownScrollView}
                              contentContainerStyle={styles.dropdownScrollContent}
                              nestedScrollEnabled={true}
                              showsVerticalScrollIndicator={true}
                              bounces={false}
                              scrollEnabled={true}
                              persistentScrollbar={true}
                              removeClippedSubviews={false}
                              onStartShouldSetResponder={() => true}
                              onMoveShouldSetResponder={() => true}
                            >
                              {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                                <TouchableOpacity
                                  key={minute}
                                  style={styles.dropdownItem}
                                  onPress={() => {
                                    setStartMinute(minute);
                                    setOpenDropdown({ type: null });
                                  }}
                                  activeOpacity={0.7}
                                >
                                  <Text style={styles.dropdownItemText}>{minute}분</Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* 종료 시간 */}
                  <View style={styles.timeRangeSection}>
                    <Text style={styles.timeRangeLabel}>종료 시간</Text>
                    <View style={styles.timeRangeRow}>
                      {/* AM/PM */}
                      <View style={[styles.dropdownContainer, styles.dropdownContainerPeriod, isOpen('endPeriod') && styles.dropdownContainerOpen]}>
                        <TouchableOpacity
                          style={styles.dropdownButton}
                          onPress={() => setOpenDropdown(isOpen('endPeriod') ? { type: null } : { type: 'endPeriod' })}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.dropdownButtonText}>{endPeriod}</Text>
                          <Text style={styles.dropdownArrow}>▼</Text>
                        </TouchableOpacity>
                        {isOpen('endPeriod') && (
                          <View style={styles.dropdownListSmall}>
                            <ScrollView 
                              style={styles.dropdownScrollViewSmall}
                              contentContainerStyle={styles.dropdownScrollContent}
                              nestedScrollEnabled={true}
                              showsVerticalScrollIndicator={false}
                              bounces={false}
                              scrollEnabled={false}
                            >
                              {['AM', 'PM'].map((period) => (
                                <TouchableOpacity
                                  key={period}
                                  style={styles.dropdownItem}
                                  onPress={() => {
                                    setEndPeriod(period as 'AM' | 'PM');
                                    setOpenDropdown({ type: null });
                                  }}
                                  activeOpacity={0.7}
                                >
                                  <Text style={styles.dropdownItemText}>{period}</Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                        )}
                      </View>

                      {/* Hour */}
                      <View style={[styles.dropdownContainer, styles.dropdownContainerHour, isOpen('endHour') && styles.dropdownContainerOpen]}>
                        <TouchableOpacity
                          style={styles.dropdownButton}
                          onPress={() => setOpenDropdown(isOpen('endHour') ? { type: null } : { type: 'endHour' })}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.dropdownButtonText}>{endHour}시</Text>
                          <Text style={styles.dropdownArrow}>▼</Text>
                        </TouchableOpacity>
                        {isOpen('endHour') && (
                          <View 
                            style={styles.dropdownList}
                            onStartShouldSetResponder={() => true}
                            onMoveShouldSetResponder={() => true}
                          >
                            <ScrollView 
                              style={styles.dropdownScrollView}
                              contentContainerStyle={styles.dropdownScrollContent}
                              nestedScrollEnabled={true}
                              showsVerticalScrollIndicator={true}
                              bounces={false}
                              scrollEnabled={true}
                              persistentScrollbar={true}
                              removeClippedSubviews={false}
                              onStartShouldSetResponder={() => true}
                              onMoveShouldSetResponder={() => true}
                            >
                              {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                                <TouchableOpacity
                                  key={hour}
                                  style={styles.dropdownItem}
                                  onPress={() => {
                                    setEndHour(hour);
                                    setOpenDropdown({ type: null });
                                  }}
                                  activeOpacity={0.7}
                                >
                                  <Text style={styles.dropdownItemText}>{hour}시</Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                        )}
                      </View>

                      {/* Minute */}
                      <View style={[styles.dropdownContainer, styles.dropdownContainerMinute, isOpen('endMinute') && styles.dropdownContainerOpen]}>
                        <TouchableOpacity
                          style={styles.dropdownButton}
                          onPress={() => setOpenDropdown(isOpen('endMinute') ? { type: null } : { type: 'endMinute' })}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.dropdownButtonText}>{endMinute}분</Text>
                          <Text style={styles.dropdownArrow}>▼</Text>
                        </TouchableOpacity>
                        {isOpen('endMinute') && (
                          <View 
                            style={styles.dropdownList}
                            onStartShouldSetResponder={() => true}
                            onMoveShouldSetResponder={() => true}
                          >
                            <ScrollView 
                              style={styles.dropdownScrollView}
                              contentContainerStyle={styles.dropdownScrollContent}
                              nestedScrollEnabled={true}
                              showsVerticalScrollIndicator={true}
                              bounces={false}
                              scrollEnabled={true}
                              persistentScrollbar={true}
                              removeClippedSubviews={false}
                              onStartShouldSetResponder={() => true}
                              onMoveShouldSetResponder={() => true}
                            >
                              {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                                <TouchableOpacity
                                  key={minute}
                                  style={styles.dropdownItem}
                                  onPress={() => {
                                    setEndMinute(minute);
                                    setOpenDropdown({ type: null });
                                  }}
                                  activeOpacity={0.7}
                                >
                                  <Text style={styles.dropdownItemText}>{minute}분</Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  <View style={styles.timePickerModalButtons}>
                    <TouchableOpacity
                      style={styles.timePickerModalCancelButton}
                      onPress={() => {
                        setShowTimePickerModal(false);
                        setOpenDropdown({ type: null });
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.timePickerModalCancelText}>취소</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.timePickerModalConfirmButton} onPress={handleSaveTime} activeOpacity={0.7}>
                      <Text style={styles.timePickerModalConfirmText}>확인</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  };

  return (
    <ImageBackground source={require('../../assets/images/background.png')} style={styles.container} resizeMode="cover">
      <Header title="투두리스트 생성" showBackButton={true} navigation={navigation} />
      {currentStep === 'intro' && renderIntroStep()}
      {currentStep === 'random' && renderRandomStep()}
      {currentStep === 'custom' && renderCustomStep()}
      {currentStep === 'confirm' && renderConfirmStep()}

      <AlertModal
        visible={showMissionSuccessModal}
        title="미션 생성 완료"
        message="미션이 생성되었습니다!"
        buttonText="확인"
        onClose={() => setShowMissionSuccessModal(false)}
      />

      <AlertModal
        visible={showTodoListSuccessModal}
        title="성공"
        message="투두리스트가 생성되었습니다!"
        buttonText="확인"
        onClose={() => {
          setShowTodoListSuccessModal(false);
          // TodoListScreen으로 이동하면서 데이터 새로고침을 위해 navigate 사용
          navigation.navigate(SCREEN_NAMES.TODO_LIST, { refresh: true });
        }}
      />

      <AlertModal
        visible={showTimeRequiredModal}
        title="시간대 설정 필요"
        message="모든 미션에 시간대를 설정해주세요.  시간대를 설정하지 않은 미션이 있습니다."
        buttonText="확인"
        onClose={() => setShowTimeRequiredModal(false)}
      />

      <AlertModal
        visible={showAlreadyCreatedModal}
        title="오류"
        message="오늘 이미 투두리스트를 생성했습니다."
        buttonText="확인"
        onClose={() => setShowAlreadyCreatedModal(false)}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  introContainer: { flex: 1, padding: spacing[5], justifyContent: 'center' },
  introContent: { alignItems: 'center', marginBottom: spacing[8] },
  introIconContainer: { width: 100, height: 100, justifyContent: 'center', alignItems: 'center', marginBottom: spacing[5] },
  introIcon: { width: 100, height: 100 },
  introTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[5],
    textAlign: 'center',
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xl),
  },
  introDescriptionContainer: { backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: borderRadius.base, padding: spacing[4], maxWidth: '100%' },
  introDescription: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: getOptimizedLineHeight(typography.fontSize.base) * 1.4,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
  },

  stepContainer: { flex: 1, padding: spacing[4] },
  stepHeader: { marginBottom: spacing[5], paddingHorizontal: spacing[1] },
  stepTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[2],
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
  },
  stepSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
  },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: {
    marginTop: spacing[3],
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
  },

  missionList: { flex: 1 },
  missionCard: { flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: borderRadius.md, padding: spacing[4], marginBottom: spacing[3] },
  missionNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary[500], justifyContent: 'center', alignItems: 'center', marginRight: spacing[3] },
  missionNumberText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
  },
  missionContent: { flex: 1 },
  missionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[1],
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
  },
  missionTitleSelected: { color: colors.primary[700] },
  missionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[2],
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
  },
  missionMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  missionCategory: { fontSize: typography.fontSize.xs, color: colors.blue[600], backgroundColor: colors.blue[50], paddingVertical: 2, paddingHorizontal: spacing[2], borderRadius: borderRadius.base },
  missionExpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  sunIcon: {
    width: 14,
    height: 14,
  },
  missionExp: {
    fontSize: typography.fontSize.xs,
    color: '#FF9800',
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
  },

  selectableMissionCard: { flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: borderRadius.md, padding: spacing[4], marginBottom: spacing[3] },
  selectableMissionCardSelected: { backgroundColor: colors.primary[50] },
  checkbox: { width: 24, height: 24, borderRadius: borderRadius.sm, borderWidth: 2, borderColor: colors.gray[300], justifyContent: 'center', alignItems: 'center', marginRight: spacing[3] },
  checkboxSelected: { borderColor: colors.primary[500], backgroundColor: colors.primary[500] },
  checkmark: { color: colors.white, fontSize: 14, fontWeight: typography.fontWeight.medium },

  confirmContent: { flex: 1 },
  inputGroup: { marginBottom: spacing[4] },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[2],
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.md,
    padding: spacing[4],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  textArea: { height: 100, textAlignVertical: 'top' },

  buttonContainer: { flexDirection: 'row', gap: spacing[3], paddingTop: spacing[4] },
  primaryButton: { backgroundColor: colors.primary[500], borderRadius: borderRadius.md, paddingVertical: spacing[2], paddingHorizontal: spacing[6], alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  secondaryButton: { backgroundColor: colors.gray[200], borderRadius: borderRadius.md, paddingVertical: spacing[2], paddingHorizontal: spacing[6], alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
  },
  buttonFlex: { flex: 1 },
  buttonDisabled: { backgroundColor: colors.gray[300] },

  createMissionButton: { backgroundColor: colors.primary[500], borderRadius: borderRadius.md, paddingVertical: spacing[1], paddingHorizontal: spacing[4], alignItems: 'center', justifyContent: 'center', marginBottom: spacing[3], minHeight: 10 },
  createMissionButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  createMissionForm: { backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: borderRadius.md, padding: spacing[4], marginBottom: spacing[3] },
  createMissionFormTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[4],
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
  },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: typography.fontSize.base, color: colors.text.secondary, marginBottom: spacing[2] },
  emptySubtext: { fontSize: typography.fontSize.sm, color: colors.text.tertiary, textAlign: 'center' },

  todaySection: { backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: borderRadius.md, padding: spacing[4], marginTop: spacing[4], marginBottom: spacing[4] },
  todayHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing[3], paddingBottom: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.primary[500] },
  todayDayName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[600],
    marginRight: spacing[2],
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
  },
  todayDayNumber: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[600],
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
  },
  emptyTodayText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },

  timeMissionItem: { flexDirection: 'column', backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: borderRadius.md, padding: spacing[3], marginBottom: spacing[2] },
  timeMissionHeader: { marginBottom: spacing[2], paddingBottom: spacing[2], borderBottomWidth: 1, borderBottomColor: colors.gray[200] },
  timeMissionTime: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[600],
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
  },
  timeMissionContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timeMissionTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing[2],
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
  },
  timeMissionRemoveButton: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.gray[300], justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  timeMissionRemoveText: { fontSize: 18, color: colors.text.secondary, lineHeight: 20 },

  missionsListSection: { marginTop: spacing[4], marginBottom: spacing[4] },
  missionsListTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[3],
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
  },
  missionListItem: { flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: borderRadius.md, padding: spacing[4], marginBottom: spacing[2], alignItems: 'center' },
  missionListItemSelected: { backgroundColor: colors.primary[50], borderWidth: 1, borderColor: colors.primary[500] },
  missionListItemContent: { flex: 1 },
  missionListItemTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[1],
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
  },
  missionListItemTitleSelected: { color: colors.primary[700] },
  missionListItemDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[2],
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
  },
  missionListItemMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  missionListItemCategory: {
    fontSize: typography.fontSize.xs,
    color: colors.blue[600],
    backgroundColor: colors.blue[50],
    paddingVertical: 2,
    paddingHorizontal: spacing[2],
    borderRadius: borderRadius.base,
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
  },
  missionListItemExpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  missionListItemExp: {
    fontSize: typography.fontSize.xs,
    color: '#000000',
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
  },
  missionListItemTimeSlot: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[600],
    marginTop: spacing[1],
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
  },

  /* ====== ✅ 여기부터 모달/드롭다운 핵심 수정 ====== */

  // ❌ overlay에 elevation/zIndex 주지 말기 (사각 그림자 원인)
  timePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalShadowWrap: {
    borderRadius: borderRadius.xl,
    backgroundColor: 'transparent', // ✅ 여기 핵심 (기존 흰색 제거)
    elevation: 18,
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center',
    // iOS shadow (원하면 유지)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
  },
  
  timePickerModalContainer: {
    backgroundColor: colors.background.primary, // ✅ 흰 배경은 여기로
    borderRadius: borderRadius.xl,
    padding: spacing[10],
    width: 350,
    alignSelf: 'center',
  },
  
  timePickerModalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[3],
    textAlign: 'center',
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
  },
  timePickerModalMissionTitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing[4],
    textAlign: 'center',
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
  },
  timePickerModalButtons: { flexDirection: 'row', gap: spacing[2], marginTop: spacing[4] },
  timePickerModalCancelButton: { flex: 1, paddingVertical: spacing[3], borderRadius: borderRadius.md, backgroundColor: colors.gray[200], alignItems: 'center', minHeight: 44 },
  timePickerModalCancelText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
  },
  timePickerModalConfirmButton: { flex: 1, paddingVertical: spacing[3], borderRadius: borderRadius.md, backgroundColor: colors.primary[500], alignItems: 'center', minHeight: 44 },
  timePickerModalConfirmText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
  },

  timeRangeSection: { marginBottom: spacing[4] },
  timeRangeLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[2],
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
  },
  timeRangeRow: { flexDirection: 'row', gap: spacing[2], justifyContent: 'center', alignItems: 'center' },

  // ✅ 기본은 낮게, 열린 드롭다운만 최상위로
  dropdownContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
    elevation: 1,
  },
  dropdownContainerPeriod: {
    flex: 1.2,
    minWidth: 65,
  },
  dropdownContainerHour: {
    flex: 1.3,
    minWidth: 70,
  },
  dropdownContainerMinute: {
    flex: 1.3,
    minWidth: 70,
  },
  dropdownContainerOpen: {
    zIndex: 999999,
    elevation: 999999,
  },

  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[2],
    borderWidth: 1,
    borderColor: colors.gray[300],
    minHeight: 40,
  },
  dropdownButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
  },
  dropdownArrow: { fontSize: typography.fontSize.xs, color: colors.text.secondary, marginLeft: spacing[1] },

  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    marginTop: spacing[1],
    height: 250,
    maxHeight: 250,
    zIndex: 999999,
    elevation: 999999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    minWidth: '100%',
    overflow: 'hidden',
    pointerEvents: 'box-none',
  },
  dropdownListSmall: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    marginTop: spacing[1],
    height: 90,
    maxHeight: 90,
    zIndex: 999999,
    elevation: 999999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    minWidth: '100%',
    overflow: 'hidden',
    pointerEvents: 'box-none',
  },
  dropdownScrollView: { 
    flex: 1,
    maxHeight: 250,
    pointerEvents: 'auto',
  },
  dropdownScrollViewSmall: {
    flex: 1,
    maxHeight: 90,
    pointerEvents: 'auto',
  },
  dropdownScrollContent: {
    paddingVertical: 0,
  },
  dropdownItem: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    minHeight: 40,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownItemText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({ ios: typography.fontFamily.regular, android: typography.fontFamily.regular }),
    includeFontPadding: false,
    textAlign: 'center',
    width: '100%',
  },
});

export default TodoListCreateScreen;
