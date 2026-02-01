import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Platform,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../../utils/designTokens';
import { Header, SimpleTabBar } from '../../components/ui';
import { useRoutineSettingScreenContainer } from './RoutineSettingScreen.container';
import { styles } from './RoutineSettingScreen.styles';

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
    setEditTitle,
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
        accessibilityElementsHidden={true}
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
      accessibilityElementsHidden={true}
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
                    accessibilityRole="button"
                    accessibilityLabel="기록 보기"
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
                        accessibilityRole="button"
                        accessibilityLabel={`시간 선택, ${editTimeStart.getHours().toString().padStart(2, '0')}시 ${editTimeStart.getMinutes().toString().padStart(2, '0')}분`}
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
                          accessibilityRole="button"
                          accessibilityLabel={`시작 시간 선택, ${editTimeStart.getHours().toString().padStart(2, '0')}시 ${editTimeStart.getMinutes().toString().padStart(2, '0')}분`}
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
                          accessibilityRole="button"
                          accessibilityLabel={`종료 시간 선택, ${editTimeEnd.getHours().toString().padStart(2, '0')}시 ${editTimeEnd.getMinutes().toString().padStart(2, '0')}분`}
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
                          accessibilityRole="button"
                          accessibilityLabel="지도에서 위치 검색"
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
                      accessibilityRole="switch"
                      accessibilityLabel="알림 받기"
                      accessibilityState={{ checked: notificationEnabled }}
                    />
                  </View>

                  {/* 버튼 */}
                  <View style={styles.editActions}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={cancelEditing}
                      accessibilityRole="button"
                      accessibilityLabel="취소"
                    >
                      <Text style={styles.cancelButtonText}>취소</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                      onPress={() => handleSave(config)}
                      disabled={isSaving}
                      accessibilityRole="button"
                      accessibilityLabel={isSaving ? '저장 중' : '저장'}
                      accessibilityState={{ disabled: isSaving }}
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
                  accessibilityRole="button"
                  accessibilityLabel={`편집, ${getDisplayValue(routine, config)}`}
                >
                  <Text style={[
                    styles.valueText,
                    !routine && styles.valueTextPlaceholder
                  ]}>
                    {getDisplayValue(routine, config)}
                  </Text>
                  <Text style={styles.editIcon} accessibilityElementsHidden={true}>›</Text>
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
                    accessibilityRole="button"
                    accessibilityLabel="삭제"
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


export default RoutineSettingScreen;
