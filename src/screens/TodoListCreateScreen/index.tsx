import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ImageBackground,
  Image,
  Modal,
} from 'react-native';
import { colors } from '../../utils/designTokens';
import { Header, AlertModal } from '../../components/ui';
import { TodoListCreateScreenProps, TimePeriod } from '../../types/screens/todolist';
import { TIME_PERIODS, HOURS, MINUTES } from '../../constants/screens/todolist';
import { useTodoListCreateScreenContainer } from './TodoListCreateScreen.container';
import { styles } from './TodoListCreateScreen.styles';

const TodoListCreateScreen: React.FC<TodoListCreateScreenProps> = ({ navigation }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    randomMissions,
    customMissions,
    allMissions,
    missionsWithTime,
    currentStep,
    selectedCustomMissions,
    title,
    description,
    loading,
    creating,
    showCreateForm,
    newMissionTitle,
    newMissionDescription,
    creatingMission,
    showMissionSuccessModal,
    showTodoListSuccessModal,
    showTimeRequiredModal,
    showAlreadyCreatedModal,
    missionTimeRanges,
    showTimePickerModal,
    selectedMissionForTime,
    startPeriod,
    startHour,
    startMinute,
    endPeriod,
    endHour,
    endMinute,
    openDropdown,
    rerollingMissionIndex,
    setCurrentStep,
    setTitle,
    setDescription,
    setShowCreateForm,
    setNewMissionTitle,
    setNewMissionDescription,
    setShowMissionSuccessModal,
    setShowTimeRequiredModal,
    setShowAlreadyCreatedModal,
    setShowTimePickerModal,
    setSelectedMissionForTime,
    setStartPeriod,
    setStartHour,
    setStartMinute,
    setEndPeriod,
    setEndHour,
    setEndMinute,
    setOpenDropdown,
    handleCustomMissionToggle,
    handleRerollMission,
    handleCreateMission,
    handleCreate,
    handleSetMissionTime,
    handleSaveTime,
    handleRemoveTime,
    handleTodoListSuccessClose,
    isOpen,
  } = useTodoListCreateScreenContainer({ navigation });

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
              <TouchableOpacity
                style={styles.rerollButton}
                onPress={() => handleRerollMission(index)}
                disabled={rerollingMissionIndex === index}
                activeOpacity={0.7}
              >
                {rerollingMissionIndex === index ? (
                  <ActivityIndicator size="small" color={colors.primary[500]} />
                ) : (
                  <Image
                    source={require('../../assets/images/reroll.png')}
                    style={styles.rerollButtonIcon}
                    resizeMode="contain"
                  />
                )}
              </TouchableOpacity>
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
    const todayDate = new Date();
    const todayDayName = todayDate.toLocaleDateString('ko-KR', { weekday: 'short' });
    const todayDayNumber = todayDate.getDate();

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
                              {TIME_PERIODS.map((period) => (
                                <TouchableOpacity
                                  key={period}
                                  style={styles.dropdownItem}
                                  onPress={() => {
                                    setStartPeriod(period);
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
                              {HOURS.map((hour) => (
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
                              {MINUTES.map((minute) => (
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
                              {TIME_PERIODS.map((period) => (
                                <TouchableOpacity
                                  key={period}
                                  style={styles.dropdownItem}
                                  onPress={() => {
                                    setEndPeriod(period);
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
        onClose={handleTodoListSuccessClose}
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


export default TodoListCreateScreen;
