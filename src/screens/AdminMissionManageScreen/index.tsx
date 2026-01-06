/**
 * 관리자 미션 관리 화면
 * - 시스템 미션 추가/수정/삭제
 * - 미션 활성화/비활성화
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { Card, Header, Loading, SectionTitle } from '../../components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { RootStackParamList } from '../../types/navigation';

interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  verificationType: 'COMMUNITY' | 'GPS' | 'TIME';
  expReward: number;
  badgeDurationDays: number;
  isActive: boolean;
  requiredMinutes?: number;
  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsRadiusMeters?: number;
}

interface AdminMissionManageScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const MISSION_TYPES = [
  { value: 'DAILY', label: '일일 미션' },
  { value: 'WEEKLY', label: '주간 미션' },
  { value: 'MONTHLY', label: '월간 미션' },
];

const VERIFICATION_TYPES = [
  { value: 'COMMUNITY', label: '커뮤니티 인증' },
  { value: 'GPS', label: 'GPS 인증' },
  { value: 'TIME', label: '시간 인증' },
];

const AdminMissionManageScreen: React.FC<AdminMissionManageScreenProps> = ({ navigation }) => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // 폼 상태
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'DAILY' as 'DAILY' | 'WEEKLY' | 'MONTHLY',
    verificationType: 'COMMUNITY' as 'COMMUNITY' | 'GPS' | 'TIME',
    expReward: '10',
    badgeDurationDays: '3',
    requiredMinutes: '',
    gpsLatitude: '',
    gpsLongitude: '',
    gpsRadiusMeters: '100',
    isActive: true,
  });

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    setLoading(true);
    try {
      // 임시 데이터 - 실제로는 API 호출
      const mockMissions: Mission[] = [
        {
          id: '1',
          title: '아침 산책하기',
          description: '30분 이상 야외에서 산책하며 아침 공기 마시기',
          type: 'DAILY',
          verificationType: 'TIME',
          expReward: 15,
          badgeDurationDays: 3,
          isActive: true,
          requiredMinutes: 30,
        },
        {
          id: '2',
          title: '도서관 방문하기',
          description: '지역 도서관을 방문하여 책 읽기',
          type: 'WEEKLY',
          verificationType: 'GPS',
          expReward: 25,
          badgeDurationDays: 7,
          isActive: true,
          gpsLatitude: 37.5665,
          gpsLongitude: 126.9780,
          gpsRadiusMeters: 100,
        },
        {
          id: '3',
          title: '자기소개 글 작성',
          description: '커뮤니티에 자기소개 글을 작성하고 다른 사람들의 피드백 받기',
          type: 'MONTHLY',
          verificationType: 'COMMUNITY',
          expReward: 50,
          badgeDurationDays: 30,
          isActive: false,
        },
      ];
      setMissions(mockMissions);
    } catch (error) {
      Alert.alert('오류', '미션 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMissions = missions.filter(mission => {
    if (filter === 'active') return mission.isActive;
    if (filter === 'inactive') return !mission.isActive;
    return true;
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'DAILY',
      verificationType: 'COMMUNITY',
      expReward: '10',
      badgeDurationDays: '3',
      requiredMinutes: '',
      gpsLatitude: '',
      gpsLongitude: '',
      gpsRadiusMeters: '100',
      isActive: true,
    });
  };

  const openAddModal = () => {
    setEditingMission(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (mission: Mission) => {
    setEditingMission(mission);
    setFormData({
      title: mission.title,
      description: mission.description,
      type: mission.type,
      verificationType: mission.verificationType,
      expReward: mission.expReward.toString(),
      badgeDurationDays: mission.badgeDurationDays.toString(),
      requiredMinutes: mission.requiredMinutes?.toString() || '',
      gpsLatitude: mission.gpsLatitude?.toString() || '',
      gpsLongitude: mission.gpsLongitude?.toString() || '',
      gpsRadiusMeters: mission.gpsRadiusMeters?.toString() || '100',
      isActive: mission.isActive,
    });
    setShowModal(true);
  };

  const handleSaveMission = async () => {
    if (!formData.title.trim()) {
      Alert.alert('오류', '미션 제목을 입력해주세요.');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('오류', '미션 설명을 입력해주세요.');
      return;
    }

    try {
      if (editingMission) {
        // 수정
        setMissions(prev =>
          prev.map(m =>
            m.id === editingMission.id
              ? {
                  ...m,
                  title: formData.title,
                  description: formData.description,
                  type: formData.type,
                  verificationType: formData.verificationType,
                  expReward: parseInt(formData.expReward) || 10,
                  badgeDurationDays: parseInt(formData.badgeDurationDays) || 3,
                  isActive: formData.isActive,
                  requiredMinutes: formData.requiredMinutes ? parseInt(formData.requiredMinutes) : undefined,
                  gpsLatitude: formData.gpsLatitude ? parseFloat(formData.gpsLatitude) : undefined,
                  gpsLongitude: formData.gpsLongitude ? parseFloat(formData.gpsLongitude) : undefined,
                  gpsRadiusMeters: formData.gpsRadiusMeters ? parseInt(formData.gpsRadiusMeters) : undefined,
                }
              : m
          )
        );
        Alert.alert('완료', '미션이 수정되었습니다.');
      } else {
        // 추가
        const newMission: Mission = {
          id: Date.now().toString(),
          title: formData.title,
          description: formData.description,
          type: formData.type,
          verificationType: formData.verificationType,
          expReward: parseInt(formData.expReward) || 10,
          badgeDurationDays: parseInt(formData.badgeDurationDays) || 3,
          isActive: formData.isActive,
          requiredMinutes: formData.requiredMinutes ? parseInt(formData.requiredMinutes) : undefined,
          gpsLatitude: formData.gpsLatitude ? parseFloat(formData.gpsLatitude) : undefined,
          gpsLongitude: formData.gpsLongitude ? parseFloat(formData.gpsLongitude) : undefined,
          gpsRadiusMeters: formData.gpsRadiusMeters ? parseInt(formData.gpsRadiusMeters) : undefined,
        };
        setMissions(prev => [...prev, newMission]);
        Alert.alert('완료', '새 미션이 추가되었습니다.');
      }
      setShowModal(false);
    } catch (error) {
      Alert.alert('오류', '미션 저장에 실패했습니다.');
    }
  };

  const handleDeleteMission = (missionId: string) => {
    Alert.alert(
      '미션 삭제',
      '정말로 이 미션을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            setMissions(prev => prev.filter(m => m.id !== missionId));
            Alert.alert('완료', '미션이 삭제되었습니다.');
          },
        },
      ]
    );
  };

  const handleToggleActive = (missionId: string) => {
    setMissions(prev =>
      prev.map(m =>
        m.id === missionId ? { ...m, isActive: !m.isActive } : m
      )
    );
  };

  const getMissionTypeLabel = (type: string) => {
    return MISSION_TYPES.find(t => t.value === type)?.label || type;
  };

  const getVerificationTypeLabel = (type: string) => {
    return VERIFICATION_TYPES.find(t => t.value === type)?.label || type;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="미션 관리" />
        <Loading text="미션 목록을 불러오는 중..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="미션 관리" />

      <View style={styles.content}>
        {/* 필터 및 추가 버튼 */}
        <View style={styles.toolbar}>
          <View style={styles.filterRow}>
            {(['all', 'active', 'inactive'] as const).map(filterOption => (
              <TouchableOpacity
                key={filterOption}
                style={[
                  styles.filterButton,
                  filter === filterOption && styles.filterButtonActive,
                ]}
                onPress={() => setFilter(filterOption)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filter === filterOption && styles.filterButtonTextActive,
                  ]}
                >
                  {filterOption === 'all' ? '전체' : filterOption === 'active' ? '활성' : '비활성'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Text style={styles.addButtonText}>+ 미션 추가</Text>
          </TouchableOpacity>
        </View>

        {/* 미션 목록 */}
        <ScrollView style={styles.missionList}>
          {filteredMissions.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>등록된 미션이 없습니다.</Text>
            </Card>
          ) : (
            filteredMissions.map(mission => (
              <Card key={mission.id} style={styles.missionCard}>
                <View style={styles.missionHeader}>
                  <View style={styles.missionTitleRow}>
                    <Text style={styles.missionTitle}>{mission.title}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        mission.isActive ? styles.activeBadge : styles.inactiveBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          mission.isActive ? styles.activeText : styles.inactiveText,
                        ]}
                      >
                        {mission.isActive ? '활성' : '비활성'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.missionDescription}>{mission.description}</Text>
                </View>

                <View style={styles.missionMeta}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>유형</Text>
                    <Text style={styles.metaValue}>{getMissionTypeLabel(mission.type)}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>인증</Text>
                    <Text style={styles.metaValue}>{getVerificationTypeLabel(mission.verificationType)}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>경험치</Text>
                    <Text style={styles.metaValue}>{mission.expReward}XP</Text>
                  </View>
                </View>

                <View style={styles.missionActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleToggleActive(mission.id)}
                  >
                    <Text style={styles.actionButtonText}>
                      {mission.isActive ? '비활성화' : '활성화'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => openEditModal(mission)}
                  >
                    <Text style={styles.editButtonText}>수정</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteMission(mission.id)}
                  >
                    <Text style={styles.deleteButtonText}>삭제</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      </View>

      {/* 미션 추가/수정 모달 */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <SectionTitle
                title={editingMission ? '미션 수정' : '새 미션 추가'}
                size="lg"
                marginBottom={spacing[4]}
              />

              {/* 제목 */}
              <Text style={styles.inputLabel}>미션 제목 *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={text => setFormData(prev => ({ ...prev, title: text }))}
                placeholder="미션 제목을 입력하세요"
                placeholderTextColor={colors.text.tertiary}
              />

              {/* 설명 */}
              <Text style={styles.inputLabel}>미션 설명 *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={text => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="미션 설명을 입력하세요"
                placeholderTextColor={colors.text.tertiary}
                multiline
                numberOfLines={3}
              />

              {/* 미션 유형 */}
              <Text style={styles.inputLabel}>미션 유형</Text>
              <View style={styles.optionRow}>
                {MISSION_TYPES.map(type => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.optionButton,
                      formData.type === type.value && styles.optionButtonActive,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, type: type.value as any }))}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        formData.type === type.value && styles.optionButtonTextActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 인증 유형 */}
              <Text style={styles.inputLabel}>인증 방법</Text>
              <View style={styles.optionRow}>
                {VERIFICATION_TYPES.map(type => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.optionButton,
                      formData.verificationType === type.value && styles.optionButtonActive,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, verificationType: type.value as any }))}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        formData.verificationType === type.value && styles.optionButtonTextActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 시간 인증일 경우 */}
              {formData.verificationType === 'TIME' && (
                <>
                  <Text style={styles.inputLabel}>필요 시간 (분)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.requiredMinutes}
                    onChangeText={text => setFormData(prev => ({ ...prev, requiredMinutes: text }))}
                    placeholder="30"
                    placeholderTextColor={colors.text.tertiary}
                    keyboardType="numeric"
                  />
                </>
              )}

              {/* GPS 인증일 경우 */}
              {formData.verificationType === 'GPS' && (
                <>
                  <Text style={styles.inputLabel}>위도</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.gpsLatitude}
                    onChangeText={text => setFormData(prev => ({ ...prev, gpsLatitude: text }))}
                    placeholder="37.5665"
                    placeholderTextColor={colors.text.tertiary}
                    keyboardType="decimal-pad"
                  />
                  <Text style={styles.inputLabel}>경도</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.gpsLongitude}
                    onChangeText={text => setFormData(prev => ({ ...prev, gpsLongitude: text }))}
                    placeholder="126.9780"
                    placeholderTextColor={colors.text.tertiary}
                    keyboardType="decimal-pad"
                  />
                  <Text style={styles.inputLabel}>허용 반경 (미터)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.gpsRadiusMeters}
                    onChangeText={text => setFormData(prev => ({ ...prev, gpsRadiusMeters: text }))}
                    placeholder="100"
                    placeholderTextColor={colors.text.tertiary}
                    keyboardType="numeric"
                  />
                </>
              )}

              {/* 경험치 */}
              <Text style={styles.inputLabel}>경험치 보상</Text>
              <TextInput
                style={styles.input}
                value={formData.expReward}
                onChangeText={text => setFormData(prev => ({ ...prev, expReward: text }))}
                placeholder="10"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="numeric"
              />

              {/* 뱃지 유효기간 */}
              <Text style={styles.inputLabel}>뱃지 유효기간 (일)</Text>
              <TextInput
                style={styles.input}
                value={formData.badgeDurationDays}
                onChangeText={text => setFormData(prev => ({ ...prev, badgeDurationDays: text }))}
                placeholder="3"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="numeric"
              />

              {/* 활성화 상태 */}
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
              >
                <View
                  style={[
                    styles.checkbox,
                    formData.isActive && styles.checkboxChecked,
                  ]}
                >
                  {formData.isActive && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>활성화 상태로 저장</Text>
              </TouchableOpacity>

              {/* 버튼 */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={styles.cancelButtonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveMission}
                >
                  <Text style={styles.saveButtonText}>
                    {editingMission ? '수정' : '추가'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
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
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  filterButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  filterButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  filterButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  filterButtonTextActive: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  addButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
  },
  addButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  missionList: {
    flex: 1,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing[8],
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  missionCard: {
    marginBottom: spacing[4],
  },
  missionHeader: {
    marginBottom: spacing[3],
  },
  missionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  missionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    flex: 1,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  statusBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  activeBadge: {
    backgroundColor: colors.primary[100],
  },
  inactiveBadge: {
    backgroundColor: colors.gray[100],
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  activeText: {
    color: colors.primary[700],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  inactiveText: {
    color: colors.gray[600],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  missionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  missionMeta: {
    flexDirection: 'row',
    gap: spacing[4],
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing[3],
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  metaValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  missionActions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing[2],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  actionButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  editButton: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[200],
  },
  editButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  deleteButton: {
    backgroundColor: colors.error[50],
    borderColor: colors.error[200],
  },
  deleteButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.error[600],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing[5],
    maxHeight: '90%',
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[2],
    marginTop: spacing[3],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    textAlignVertical: 'top',
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  optionRow: {
    flexDirection: 'row',
    gap: spacing[2],
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  optionButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  optionButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  optionButtonTextActive: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[4],
    gap: spacing[3],
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  checkmark: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(14),
  },
  checkboxLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[6],
    paddingBottom: spacing[4],
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing[4],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  cancelButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  saveButton: {
    flex: 1,
    paddingVertical: spacing[4],
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
});

export default AdminMissionManageScreen;
