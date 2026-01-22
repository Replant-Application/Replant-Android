import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Platform,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { Header, SimpleTabBar } from '../../components/ui';
import { useRoutineSettingScreenContainer } from './RoutineSettingScreen.container';

interface RoutineSettingScreenProps {
  navigation: any;
}

const RoutineSettingScreen: React.FC<RoutineSettingScreenProps> = ({ navigation }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    loading,
    saving,
    editingType,
    editTitle,
    editDescription,
    editValue,
    editTimeStart,
    editTimeEnd,
    showTimeStartPicker,
    showTimeEndPicker,
    notificationEnabled,
    editLatitude,
    editLongitude,
    activeCategory,
    filteredConfigs,
    ROUTINE_CONFIGS,
    setEditTitle,
    setEditDescription,
    setEditValue,
    setNotificationEnabled,
    setShowTimeStartPicker,
    setShowTimeEndPicker,
    getRoutineByType,
    getDisplayValue,
    startEditing,
    cancelEditing,
    handleSave,
    handleDelete,
    handleTimeStartChange,
    handleTimeEndChange,
    handleSearchLocation,
    handleViewHistory,
    handleCategoryChange,
  } = useRoutineSettingScreenContainer({ navigation });

  if (loading) {
    return (
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <Header navigation={navigation} title="나의 루틴 설정" showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>불러오는 중...</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <Header navigation={navigation} title="나의 루틴 설정" showBackButton />

      {/* 카테고리 탭 */}
      <View style={styles.tabContainer}>
        <SimpleTabBar
          tabs={[
            { key: 'time', label: '⏰ 시간' },
            { key: 'place', label: '📍 장소' },
            { key: 'goal', label: '🎯 목표' },
          ]}
          activeTab={activeCategory}
          onTabChange={handleCategoryChange}
        />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionDescription}>
          {activeCategory === 'time' && '미션에 필요한 시간대를 설정해요.'}
          {activeCategory === 'place' && '자주 가는 장소를 등록해요.\n맵에서 검색하여 정확한 위치를 저장할 수 있어요.'}
          {activeCategory === 'goal' && '다짐과 목표를 적어보세요.'}
        </Text>

        {filteredConfigs.map(config => {
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
                  <Text style={styles.routineName}>{routine?.title || config.name}</Text>
                  <Text style={styles.routineDescription}>
                    {routine?.description || config.description}
                  </Text>
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
                  {/* 제목 입력 */}
                  {config.inputType === 'place' && (
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>장소명</Text>
                      <TextInput
                        style={styles.textInput}
                        value={editTitle}
                        onChangeText={setEditTitle}
                        placeholder="예: 우리동네 헬스장"
                        placeholderTextColor={colors.gray[400]}
                      />
                    </View>
                  )}

                  {/* 시간 입력 (단일) */}
                  {config.inputType === 'time' && (
                    <View style={styles.timeEditContainer}>
                      <Text style={styles.inputLabel}>시간 설정</Text>
                      <TouchableOpacity
                        style={styles.timeDisplay}
                        onPress={() => setShowTimeStartPicker(true)}
                      >
                        <Text style={styles.timeText}>
                          {editTimeStart.getHours().toString().padStart(2, '0')}:
                          {editTimeStart.getMinutes().toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                      {showTimeStartPicker && (
                        <DateTimePicker
                          value={editTimeStart}
                          mode="time"
                          is24Hour={true}
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={handleTimeStartChange}
                        />
                      )}
                    </View>
                  )}

                  {/* 시간 범위 입력 */}
                  {config.inputType === 'time_range' && (
                    <View style={styles.timeRangeContainer}>
                      <View style={styles.timeRangeItem}>
                        <Text style={styles.inputLabel}>시작 시간</Text>
                        <TouchableOpacity
                          style={styles.timeDisplay}
                          onPress={() => setShowTimeStartPicker(true)}
                        >
                          <Text style={styles.timeText}>
                            {editTimeStart.getHours().toString().padStart(2, '0')}:
                            {editTimeStart.getMinutes().toString().padStart(2, '0')}
                          </Text>
                        </TouchableOpacity>
                        {showTimeStartPicker && (
                          <DateTimePicker
                            value={editTimeStart}
                            mode="time"
                            is24Hour={true}
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleTimeStartChange}
                          />
                        )}
                      </View>
                      <Text style={styles.timeRangeSeparator}>~</Text>
                      <View style={styles.timeRangeItem}>
                        <Text style={styles.inputLabel}>종료 시간</Text>
                        <TouchableOpacity
                          style={styles.timeDisplay}
                          onPress={() => setShowTimeEndPicker(true)}
                        >
                          <Text style={styles.timeText}>
                            {editTimeEnd.getHours().toString().padStart(2, '0')}:
                            {editTimeEnd.getMinutes().toString().padStart(2, '0')}
                          </Text>
                        </TouchableOpacity>
                        {showTimeEndPicker && (
                          <DateTimePicker
                            value={editTimeEnd}
                            mode="time"
                            is24Hour={true}
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleTimeEndChange}
                          />
                        )}
                      </View>
                    </View>
                  )}

                  {/* 장소 입력 */}
                  {config.inputType === 'place' && (
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>위치</Text>
                      <View style={styles.locationInputRow}>
                        <TextInput
                          style={[styles.textInput, styles.locationInput]}
                          value={editValue}
                          onChangeText={setEditValue}
                          placeholder={config.placeholder}
                          placeholderTextColor={colors.gray[400]}
                        />
                        <TouchableOpacity
                          style={styles.mapButton}
                          onPress={handleSearchLocation}
                        >
                          <Text style={styles.mapButtonText}>🗺️ 지도</Text>
                        </TouchableOpacity>
                      </View>
                      {editLatitude && editLongitude && (
                        <Text style={styles.coordinateText}>
                          좌표: {editLatitude.toFixed(6)}, {editLongitude.toFixed(6)}
                        </Text>
                      )}
                    </View>
                  )}

                  {/* 텍스트 입력 */}
                  {config.inputType === 'text' && (
                    <TextInput
                      style={[styles.textInput, styles.textAreaInput]}
                      value={editValue}
                      onChangeText={setEditValue}
                      placeholder={config.placeholder}
                      placeholderTextColor={colors.gray[400]}
                      multiline
                      numberOfLines={3}
                    />
                  )}

                  {/* 알림 설정 */}
                  <View style={styles.notificationRow}>
                    <Text style={styles.notificationLabel}>알림 받기</Text>
                    <Switch
                      value={notificationEnabled}
                      onValueChange={setNotificationEnabled}
                      trackColor={{ false: colors.gray[300], true: colors.primary[300] }}
                      thumbColor={notificationEnabled ? colors.primary[500] : colors.gray[100]}
                    />
                  </View>

                  {/* 버튼 */}
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
                    onPress={() => handleDelete(routine.id, routine.title || config.name)}
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
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  tabContainer: {
    paddingHorizontal: spacing[3],
    paddingTop: spacing[2],
    paddingBottom: spacing[3],
  },
  tabTextActive: {
    color: colors.primary[500],
    fontWeight: typography.fontWeight.semibold,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing[4],
  },
  sectionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm) * 1.5,
    marginBottom: spacing[4],
  },
  routineCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 2,
    borderColor: '#D4A574',
  },
  routineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  routineIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFF8F0',
    borderWidth: 1,
    borderColor: '#E8DDD4',
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
    backgroundColor: '#FFF8F0',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: '#E8DDD4',
  },
  valueText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: '#6B5344',
  },
  valueTextPlaceholder: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
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
  inputGroup: {
    marginBottom: spacing[3],
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing[2],
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
  timeRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  timeRangeItem: {
    alignItems: 'center',
  },
  timeRangeSeparator: {
    fontSize: typography.fontSize.xl,
    color: colors.text.secondary,
    marginHorizontal: spacing[3],
    marginTop: spacing[6],
  },
  locationInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: spacing[2],
  },
  mapButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.md,
  },
  mapButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  coordinateText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing[2],
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
  },
  textAreaInput: {
    minHeight: 88,
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
