import * as React from 'react';
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
import { Header, AlertModal, WheelPicker } from '../../components/ui';
import { TodoListCreateScreenProps } from '../../types/screens/todolist';
import { HOURS, MINUTES } from '../../constants/screens/todolist';
import { useTodoListCreateScreenContainer } from './TodoListCreateScreen.container';
import { styles } from './TodoListCreateScreen.styles';

const TodoListCreateScreen: React.FC<TodoListCreateScreenProps> = ({ navigation, route }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    randomMissions,
    customMissions,
    allMissions,
    missionsWithTime,
    currentStep,
    selectedCustomMissions,
    onlyMyMissions,
    setOnlyMyMissions,
    searchQuery,
    setSearchQuery,
    showFilterModal,
    setShowFilterModal,
    title,
    description,
    loading,
    creating,
    showCreateForm,
    newMissionTitle,
    newMissionDescription,
    creatingMission,
    showAlert,
    alertTitle,
    alertMessage,
    handleCloseAlert,
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
    timePickerModalStep,
    rerollingMissionIndex,
    setCurrentStep,
    setTitle,
    setDescription,
    setNewMissionTitle,
    setNewMissionDescription,
    setShowMissionSuccessModal,
    setShowTimeRequiredModal,
    setShowAlreadyCreatedModal,
    setStartPeriod,
    setStartHour,
    setStartMinute,
    setEndPeriod,
    setEndHour,
    setEndMinute,
    handleCustomMissionToggle,
    handleNavigateToCustomMissionCreate,
    handleRerollMission,
    handleCreateMission,
    handleCreate,
    handleSetMissionTime,
    handleSaveTime,
    isAllDay,
    handleToggleAllDay,
    handleTodoListSuccessClose,
    handleTimePickerNext,
    handleTimePickerPrev,
    handleCloseTimePickerModal,
  } = useTodoListCreateScreenContainer({ navigation, route });

  const renderRandomStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Step 1. 공식 미션</Text>
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
              <View style={styles.missionContent}>
                <View style={styles.missionTitleContainer}>
                  <View style={styles.missionNumber}>
                    <Text style={styles.missionNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.missionTitle}>{mission.title}</Text>
                </View>
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
                accessibilityRole="button"
                accessibilityLabel="미션 다시 뽑기"
                accessibilityState={{ disabled: rerollingMissionIndex === index }}
              >
                {rerollingMissionIndex === index ? (
                  <ActivityIndicator size="small" color={colors.primary[500]} />
                ) : (
                  <Image
                    source={require('../../assets/images/reroll.png')}
                    style={styles.rerollButtonIcon}
                    resizeMode="contain"
                    accessibilityLabel="미션 다시 뽑기 아이콘"
                  />
                )}
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setCurrentStep('custom')}
          disabled={loading || randomMissions.length === 0}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="다음"
          accessibilityState={{ disabled: loading || randomMissions.length === 0 }}
        >
          <Text style={styles.primaryButtonText}>다음</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCustomStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Step 2. 커스텀 미션</Text>
        <Text style={styles.stepSubtitle}>
          원하는 미션을 자유롭게 선택해주세요 ({selectedCustomMissions.length}개 선택됨)
        </Text>
      </View>

      <TouchableOpacity
        style={styles.createMissionButton}
        onPress={handleNavigateToCustomMissionCreate}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="나만의 커스텀 미션 생성"
      >
        <Text style={styles.createMissionButtonText}>나만의 커스텀 미션 생성</Text>
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
              accessibilityLabel="미션 제목"
              accessibilityHint="미션 제목을 입력하세요"
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
              accessibilityLabel="미션 설명"
              accessibilityHint="미션에 대한 자세한 설명을 입력하세요"
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, creatingMission && styles.buttonDisabled]}
            onPress={handleCreateMission}
            disabled={creatingMission}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={creatingMission ? '미션 생성 중' : '미션 생성'}
            accessibilityState={{ disabled: creatingMission }}
          >
            {creatingMission ? <ActivityIndicator size="small" color={colors.white} /> : <Text style={styles.primaryButtonText}>미션 생성</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* 검색창과 필터 버튼 */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Image
            source={require('../../assets/images/search.png')}
            style={styles.searchIcon}
            resizeMode="contain"
            accessibilityLabel="검색 아이콘"
            accessibilityElementsHidden={true}
          />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="미션 검색..."
            placeholderTextColor={colors.text.tertiary}
            accessibilityLabel="미션 검색"
            accessibilityHint="미션을 검색하려면 입력하세요"
            allowFontScaling={true}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="필터"
          accessibilityHint="필터 옵션 열기"
          accessibilityState={{ selected: onlyMyMissions }}
        >
          <Image
            source={require('../../assets/images/filter.png')}
            style={styles.filterIcon}
            resizeMode="contain"
            accessibilityLabel="필터 아이콘"
            accessibilityElementsHidden={true}
          />
          {onlyMyMissions && (
            <View style={styles.filterBadge} accessibilityElementsHidden={true} />
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>미션을 불러오는 중...</Text>
        </View>
      ) : (
        <>
          {customMissions.length > 0 ? (
            <ScrollView style={styles.missionList} showsVerticalScrollIndicator={false}>
              {customMissions.map((mission) => {
            const isSelected = selectedCustomMissions.includes(mission.id);
            return (
              <TouchableOpacity
                key={mission.id}
                style={[styles.selectableMissionCard, isSelected && styles.selectableMissionCardSelected]}
                onPress={() => handleCustomMissionToggle(mission.id)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${mission.title} ${isSelected ? '선택됨' : '선택하기'}`}
                accessibilityState={{ selected: isSelected }}
              >
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
              <Text style={styles.emptyText}>
                {searchQuery.trim() 
                  ? '검색 결과가 없습니다' 
                  : onlyMyMissions 
                    ? '내가 만든 미션이 없습니다' 
                    : '선택 가능한 미션이 없습니다'}
              </Text>
              <Text style={styles.emptySubtext}>
                {searchQuery.trim()
                  ? '다른 검색어를 시도해보세요'
                  : onlyMyMissions 
                    ? '나만의 커스텀 미션을 먼저 생성해주세요' 
                    : '미션 도감에서 커스텀 미션을 먼저 추가해주세요'}
              </Text>
            </View>
          )}
        </>
      )}

      {/* 필터 모달 */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
          accessibilityRole="button"
          accessibilityLabel="필터 모달 닫기"
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            accessibilityRole="none"
          >
            <View style={styles.filterModalContent}>
              <View style={styles.filterModalHeader}>
                <Text style={styles.filterModalTitle}>필터</Text>
                <TouchableOpacity
                  onPress={() => setShowFilterModal(false)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="필터 모달 닫기"
                >
                  <Text style={styles.filterModalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.filterCheckboxRow}
                onPress={() => setOnlyMyMissions(!onlyMyMissions)}
                activeOpacity={0.7}
                accessibilityRole="checkbox"
                accessibilityLabel="내가 만든 미션만 보기"
                accessibilityState={{ checked: onlyMyMissions }}
              >
                <Text style={styles.filterOptionLabel}>내가 만든 미션만 보기</Text>
                <View style={[styles.filterCheckboxBox, onlyMyMissions && styles.filterCheckboxBoxChecked]}>
                  {onlyMyMissions && (
                    <Text style={styles.filterCheckboxCheckmark}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setCurrentStep('random')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="이전"
        >
          <Text style={styles.secondaryButtonText}>이전</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, styles.buttonFlex]}
          onPress={() => setCurrentStep('confirm')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="다음"
        >
          <Text style={styles.primaryButtonText}>다음</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderConfirmStep = () => {
    const todayDate = new Date();
    const todayDayName = todayDate.toLocaleDateString('ko-KR', { weekday: 'short' });
    const todayDayNameLong = todayDate.toLocaleDateString('ko-KR', { weekday: 'long' });
    const todayDayNumber = todayDate.getDate();

    return (
      <View style={styles.stepContainer}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>Step 3. 나만의 투두리스트</Text>
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
              accessibilityLabel="투두리스트 제목"
              accessibilityHint="투두리스트 제목을 입력하세요"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>오늘 하루의 다짐 (선택)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea, styles.descriptionTextArea]}
              placeholder="오늘 하루의 다짐을 입력하세요"
              placeholderTextColor={colors.gray[400]}
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={200}
              accessibilityLabel="오늘 하루의 다짐"
              accessibilityHint="오늘 하루의 다짐을 입력하세요"
            />
          </View>

          <View style={styles.missionsListSection}>
            <View style={styles.missionsListTitleContainer}>
              <Text style={styles.missionsListTitle}>미션을 시간대에 배치하세요</Text>
              <TouchableOpacity
                style={styles.allDayCheckboxRow}
                onPress={handleToggleAllDay}
                activeOpacity={0.7}
                accessibilityRole="checkbox"
                accessibilityLabel="하루종일"
                accessibilityState={{ checked: isAllDay }}
                accessibilityHint="모든 미션의 시간을 오전 12시부터 오후 11시 59분까지 일괄 설정합니다"
              >
                <View style={[styles.allDayCheckbox, isAllDay && styles.allDayCheckboxSelected]}>
                  {isAllDay && <Text style={styles.allDayCheckmark}>✓</Text>}
                </View>
                <Text style={styles.allDayLabel}>하루 종일</Text>
              </TouchableOpacity>
            </View>
            {allMissions.map((mission) => {
              const missionRange = missionTimeRanges[mission.id];
              return (
                <TouchableOpacity
                  key={mission.id}
                  style={[styles.missionListItem, missionRange && styles.missionListItemSelected]}
                  onPress={() => handleSetMissionTime(mission.id)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={missionRange ? `${mission.title}, 시간 설정됨: ${missionRange.start} ~ ${missionRange.end}` : `${mission.title}, 시간 설정하기`}
                  accessibilityHint="탭하여 이 미션의 시간대를 설정합니다"
                  accessibilityState={{ selected: !!missionRange }}
                >
                  <View style={styles.missionListItemContent}>
                    <View style={styles.missionListItemTitleContainer}>
                      {missionRange && (
                        <Text style={styles.missionListItemTimeSlot}>
                          {missionRange.start} ~ {missionRange.end}
                        </Text>
                      )}
                      <Text style={styles.missionListItemTitle}>{mission.title}</Text>
                    </View>
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
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.todaySection}>
            <View
              style={styles.todayHeader}
              accessibilityLabel={`오늘, ${todayDayNameLong} ${todayDayNumber}일`}
              accessibilityRole="header"
            >
              <View style={styles.todayDateRow}>
                <Text style={styles.todayDayName}>{todayDayName}</Text>
                <Text style={styles.todayDayNumber}>{todayDayNumber}</Text>
              </View>
            </View>

            {missionsWithTime.length > 0 ? (
              missionsWithTime.map((mission, index) => (
                <View
                  key={mission.id}
                  style={[
                    styles.timeMissionItem,
                    index === missionsWithTime.length - 1 && styles.timeMissionItemLast,
                  ]}
                >
                  <View style={styles.timeMissionContentWrapper}>
                    <View style={styles.timeMissionContent}>
                      <Text style={styles.timeMissionTime}>
                        {mission.range.start} ~ {mission.range.end}
                      </Text>
                      <Text style={styles.timeMissionTitle} numberOfLines={2}>{mission.title}</Text>
                      <View style={styles.timeMissionMeta}>
                        <Text style={styles.timeMissionCategory}>{mission.category}</Text>
                        <View style={styles.timeMissionExpContainer}>
                          <Image
                            source={require('../../assets/images/sun.png')}
                            style={styles.sunIcon}
                            resizeMode="contain"
                            accessibilityLabel="경험치 아이콘"
                          />
                          <Text style={styles.timeMissionExp}>{mission.expReward} EXP</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyTodayText}>시간을 설정한 미션이 없습니다</Text>
            )}
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setCurrentStep('custom')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="이전"
          >
            <Text style={styles.secondaryButtonText}>이전</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryButton, styles.buttonFlex]}
            onPress={handleCreate}
            disabled={creating}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={creating ? '생성 중' : '생성하기'}
            accessibilityState={{ disabled: creating }}
          >
            {creating ? <ActivityIndicator size="small" color={colors.white} /> : <Text style={styles.primaryButtonText}>생성하기</Text>}
          </TouchableOpacity>
        </View>

        {/* 시간 설정 모달: 1단계 시작 시간 -> 2단계 종료 시간 (WheelPicker) */}
        <Modal
          visible={showTimePickerModal}
          transparent
          animationType="fade"
          onRequestClose={handleCloseTimePickerModal}
        >
          <TouchableOpacity
            style={styles.timePickerModalOverlay}
            activeOpacity={1}
            onPress={handleCloseTimePickerModal}
            accessibilityRole="button"
            accessibilityLabel="시간 설정 모달 닫기"
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {}}
              style={styles.emptyTouchable}
            >
              <View style={styles.modalShadowWrap}>
                <View style={styles.timePickerModalContainer}>
                  <Text style={styles.timePickerModalTitle} accessibilityRole="header">시간 설정</Text>
                  {selectedMissionForTime && (
                    <Text style={styles.timePickerModalMissionTitle}>
                      {allMissions.find((m) => m.id === selectedMissionForTime)?.title}
                    </Text>
                  )}

                  {timePickerModalStep === 'start' ? (
                    <>
                      <View style={styles.timeRangeSection}>
                        <Text style={styles.timeRangeLabel}>시작 시간</Text>
                        <View style={[styles.timePickerWrapper, styles.timeRangeRow]}>
                          <WheelPicker
                            value={startPeriod}
                            options={[
                              { label: '오전', value: 'AM' },
                              { label: '오후', value: 'PM' },
                            ]}
                            onSelect={(v) => { if (v === 'AM' || v === 'PM') setStartPeriod(v); }}
                            width={80}
                            accessibilityLabel="시작 시간 오전 오후 선택"
                          />
                          <WheelPicker
                            value={startHour}
                            options={HOURS.map((h) => ({ label: `${h}`, value: h }))}
                            onSelect={(v) => setStartHour(v as number)}
                            width={60}
                            accessibilityLabel="시작 시간 시 선택"
                          />
                          <View style={styles.timeSeparator} accessibilityElementsHidden={true}>
                            <Text style={styles.timeSeparatorText}>:</Text>
                          </View>
                          <WheelPicker
                            value={startMinute}
                            options={MINUTES.map((m) => ({ label: m < 10 ? `0${m}` : `${m}`, value: m }))}
                            onSelect={(v) => setStartMinute(v as number)}
                            width={60}
                            accessibilityLabel="시작 시간 분 선택"
                          />
                        </View>
                      </View>
                      <View style={styles.timePickerModalButtons}>
                        <TouchableOpacity style={styles.timePickerModalCancelButton} onPress={handleCloseTimePickerModal} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="취소">
                          <Text style={styles.timePickerModalCancelText}>취소</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.timePickerModalConfirmButton} onPress={handleTimePickerNext} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="다음">
                          <Text style={styles.timePickerModalConfirmText}>다음</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.timeRangeSection}>
                        <Text style={styles.timeRangeLabel}>종료 시간</Text>
                        <View style={[styles.timePickerWrapper, styles.timeRangeRow]}>
                          <WheelPicker
                            value={endPeriod}
                            options={[
                              { label: '오전', value: 'AM' },
                              { label: '오후', value: 'PM' },
                            ]}
                            onSelect={(v) => { if (v === 'AM' || v === 'PM') setEndPeriod(v); }}
                            width={80}
                            accessibilityLabel="종료 시간 오전 오후 선택"
                          />
                          <WheelPicker
                            value={endHour}
                            options={HOURS.map((h) => ({ label: `${h}`, value: h }))}
                            onSelect={(v) => setEndHour(v as number)}
                            width={60}
                            accessibilityLabel="종료 시간 시 선택"
                          />
                          <View style={styles.timeSeparator} accessibilityElementsHidden={true}>
                            <Text style={styles.timeSeparatorText}>:</Text>
                          </View>
                          <WheelPicker
                            value={endMinute}
                            options={MINUTES.map((m) => ({ label: m < 10 ? `0${m}` : `${m}`, value: m }))}
                            onSelect={(v) => setEndMinute(v as number)}
                            width={60}
                            accessibilityLabel="종료 시간 분 선택"
                          />
                        </View>
                      </View>
                      <View style={styles.timePickerModalButtons}>
                        <TouchableOpacity style={styles.timePickerModalCancelButton} onPress={handleTimePickerPrev} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="이전">
                          <Text style={styles.timePickerModalCancelText}>이전</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.timePickerModalConfirmButton} onPress={handleSaveTime} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="확인">
                          <Text style={styles.timePickerModalConfirmText}>확인</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  };

  // 각 스텝에서 이전 스텝으로 가는 커스텀 뒤로가기 버튼
  const getCustomBackButton = () => {
    if (currentStep === 'custom') {
      return (
        <TouchableOpacity
          onPress={() => setCurrentStep('random')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
        >
          <Image
            source={require('../../assets/images/left.png')}
            style={styles.icon24}
            resizeMode="contain"
            accessibilityLabel="뒤로 가기"
            accessibilityElementsHidden={true}
          />
        </TouchableOpacity>
      );
    }
    if (currentStep === 'confirm') {
      return (
        <TouchableOpacity
          onPress={() => setCurrentStep('custom')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
        >
          <Image
            source={require('../../assets/images/left.png')}
            style={styles.icon24}
            resizeMode="contain"
            accessibilityLabel="뒤로 가기"
            accessibilityElementsHidden={true}
          />
        </TouchableOpacity>
      );
    }
    // random 스텝에서는 기본 navigation.goBack() 사용
    return undefined;
  };

  return (
    <ImageBackground source={require('../../assets/images/background.png')} style={styles.container} resizeMode="cover" accessibilityElementsHidden={true}>
      <Header 
        title="투두리스트 생성" 
        showBackButton={true} 
        navigation={navigation}
        leftButton={getCustomBackButton()}
      />
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

      {/* useErrorHandler 오류/알림 → 커스텀 모달 */}
      <AlertModal
        visible={showAlert}
        title={alertTitle}
        message={alertMessage}
        buttonText="확인"
        onClose={handleCloseAlert}
      />
    </ImageBackground>
  );
};


export default TodoListCreateScreen;
