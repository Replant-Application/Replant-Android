/**
 * 관리자 미션 관리 화면
 * - 시스템 미션 추가/수정/삭제
 * - 미션 활성화/비활성화
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { Card, Header, Loading, SectionTitle } from '../../components/ui';
import { colors, spacing } from '../../utils/designTokens';
import { RootStackParamList } from '../../types/navigation';
import {
  useAdminMissionManageScreenContainer,
  MISSION_TYPES,
  VERIFICATION_TYPES,
} from './AdminMissionManageScreen.container';
import { styles } from './AdminMissionManageScreen.styles';

interface AdminMissionManageScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const AdminMissionManageScreen: React.FC<AdminMissionManageScreenProps> = ({ navigation }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    missions: filteredMissions,
    loading,
    showModal,
    editingMission,
    filter,
    formData,
    handleFilterChange,
    openAddModal,
    openEditModal,
    closeModal,
    updateFormData,
    handleSaveMission,
    handleDeleteMission,
    handleToggleActive,
    getMissionTypeLabel,
    getVerificationTypeLabel,
  } = useAdminMissionManageScreenContainer({ navigation });

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="미션 관리" navigation={navigation} />
        <Loading text="미션 목록을 불러오는 중..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="미션 관리" navigation={navigation} />

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
                onPress={() => handleFilterChange(filterOption)}
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
                accessibilityRole="header"
              />

              {/* 제목 */}
              <Text style={styles.inputLabel}>미션 제목 *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={text => updateFormData({ title: text })}
                placeholder="미션 제목을 입력하세요"
                placeholderTextColor={colors.text.tertiary}
              />

              {/* 설명 */}
              <Text style={styles.inputLabel}>미션 설명 *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={text => updateFormData({ description: text })}
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
                    onPress={() => updateFormData({ type: type.value as any })}
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
                    onPress={() => updateFormData({ verificationType: type.value as any })}
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
                    onChangeText={text => updateFormData({ requiredMinutes: text })}
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
                    onChangeText={text => updateFormData({ gpsLatitude: text })}
                    placeholder="37.5665"
                    placeholderTextColor={colors.text.tertiary}
                    keyboardType="decimal-pad"
                  />
                  <Text style={styles.inputLabel}>경도</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.gpsLongitude}
                    onChangeText={text => updateFormData({ gpsLongitude: text })}
                    placeholder="126.9780"
                    placeholderTextColor={colors.text.tertiary}
                    keyboardType="decimal-pad"
                  />
                  <Text style={styles.inputLabel}>허용 반경 (미터)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.gpsRadiusMeters}
                    onChangeText={text => updateFormData({ gpsRadiusMeters: text })}
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
                onChangeText={text => updateFormData({ expReward: text })}
                placeholder="10"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="numeric"
              />

              {/* 배지 유효기간 */}
              <Text style={styles.inputLabel}>배지 유효기간 (일)</Text>
              <TextInput
                style={styles.input}
                value={formData.badgeDurationDays}
                onChangeText={text => updateFormData({ badgeDurationDays: text })}
                placeholder="3"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="numeric"
              />

              {/* 활성화 상태 */}
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => updateFormData({ isActive: !formData.isActive })}
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
                  onPress={closeModal}
                  accessibilityRole="button"
                  accessibilityLabel="취소"
                >
                  <Text style={styles.cancelButtonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveMission}
                  accessibilityRole="button"
                  accessibilityLabel={editingMission ? '수정' : '추가'}
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

export default AdminMissionManageScreen;
