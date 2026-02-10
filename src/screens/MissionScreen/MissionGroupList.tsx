/**
 * 미션 도감 목록 컴포넌트
 * 공식/커스텀 미션 목록을 표시하는 컴포넌트
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, RefreshControl, TextInput, Modal } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../utils/designTokens';
import { EmptyState } from '../../components/ui';
import { MissionCategory } from '../../api/missionApi';
import { styles } from './MissionGroupList.styles';
import { createTextStyle, createTitleStyle, createBodyStyle } from '../../utils/styles/textStyles';

// 미션 도감용 통합 미션 타입
interface UnifiedMission {
  id: number;
  title: string;
  description: string;
  category?: MissionCategory;
  verificationType: string;
  requiredMinutes?: number;
  expReward: number;
  badgeDurationDays: number;
  participantCount?: number;
  difficultyLevel?: 'EASY' | 'MEDIUM' | 'HARD';
  isCustom: boolean;
  creatorId?: number;
  creatorNickname?: string;
  isChallenge?: boolean;
  challengeDays?: number;
  deadlineDays?: number;
  isPublic?: boolean;
  worryType?: string;
  isCompleted?: boolean;
  isAttempted?: boolean;
}

interface MissionGroupListProps {
  missions: UnifiedMission[];
  missionGroupTab: 'official' | 'custom';
  selectedMission: UnifiedMission | null;
  currentUserId: number | null;
  currentServerPage: number;
  totalServerPages: number;
  refreshing?: boolean;
  sortBy?: 'default' | 'participants' | 'exp' | 'difficulty';
  showOnlyParticipated?: boolean; // 내가 참여한 미션만 보기 (공식 미션 전용)
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  titleOnly?: boolean;
  onTitleOnlyToggle?: (value: boolean) => void;
  selectedCategory?: MissionCategory | null;
  onCategoryFilterChange?: (category: MissionCategory | null) => void;
  selectedDifficulty?: 'EASY' | 'MEDIUM' | 'HARD' | null;
  onDifficultyFilterChange?: (difficulty: 'EASY' | 'MEDIUM' | 'HARD' | null) => void;
  onMissionSelect: (mission: UnifiedMission | null) => void;
  onServerPageChange: (page: number) => void;
  onNavigateToCreate: () => void;
  onRefresh?: () => void;
  onSortChange?: (sortBy: 'default' | 'participants' | 'exp' | 'difficulty') => void;
  onShowOnlyParticipatedChange?: (value: boolean) => void; // 체크박스 변경 핸들러
  getVerificationTypeLabel: (type?: string) => string;
  getVerificationTypeIcon: (type?: string) => any;
  getMissionCategoryLabel: (category?: MissionCategory) => string;
}

const MissionGroupList: React.FC<MissionGroupListProps> = ({
  missions,
  missionGroupTab,
  selectedMission,
  currentUserId: _currentUserId,
  currentServerPage,
  totalServerPages,
  refreshing = false,
  sortBy = 'default',
  showOnlyParticipated = false,
  searchQuery = '',
  onSearchQueryChange,
  titleOnly = false,
  onTitleOnlyToggle,
  selectedCategory = null,
  onCategoryFilterChange,
  selectedDifficulty = null,
  onDifficultyFilterChange,
  onMissionSelect,
  onServerPageChange,
  onNavigateToCreate,
  onRefresh,
  onSortChange,
  onShowOnlyParticipatedChange,
  getVerificationTypeLabel: _getVerificationTypeLabel,
  getVerificationTypeIcon: _getVerificationTypeIcon,
  getMissionCategoryLabel,
}) => {
  const [showFilterModal, setShowFilterModal] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary[500]]}
              tintColor={colors.primary[500]}
            />
          ) : undefined
        }
        onScrollBeginDrag={() => {
          // 스크롤 시작 시 모달 닫기
          if (showFilterModal) {
            setShowFilterModal(false);
          }
        }}
      >
      {/* 검색창과 필터 버튼 - 커스텀 미션 탭에서만 표시, 항상 표시 */}
      {missionGroupTab === 'custom' && (
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrapper}>
            <Image
              source={require('../../assets/images/search.png')}
              style={styles.searchIcon}
              resizeMode="contain"
              accessibilityLabel="검색 아이콘"
            />
            <TextInput
              style={styles.searchInput}
              placeholder="미션 검색..."
              placeholderTextColor={colors.gray[400]}
              value={searchQuery}
              onChangeText={onSearchQueryChange}
              returnKeyType="search"
              accessibilityLabel="미션 검색 입력"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => onSearchQueryChange?.('')}
                style={styles.searchClearButton}
                accessibilityLabel="검색어 지우기"
              >
                <Text style={styles.searchClearText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.filterButton,
              (selectedCategory || selectedDifficulty || sortBy !== 'default') && styles.filterButtonActive
            ]}
            onPress={() => setShowFilterModal(true)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="필터"
            accessibilityHint="필터 옵션 열기"
            accessibilityState={{ selected: !!(selectedCategory || selectedDifficulty || sortBy !== 'default') }}
          >
            <Image
              source={require('../../assets/images/filter.png')}
              style={styles.filterIcon}
              resizeMode="contain"
              accessibilityLabel="필터 아이콘"
            />
            {(selectedCategory || selectedDifficulty || sortBy !== 'default') && (
              <View style={styles.filterBadge} />
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* 공식 미션: 체크박스와 필터 버튼 */}
      {missionGroupTab === 'official' && (
        <View style={styles.officialFilterRow}>
          {missions.length > 0 && (
            <TouchableOpacity
              style={styles.filterCheckbox}
              onPress={() => onShowOnlyParticipatedChange?.(!showOnlyParticipated)}
              activeOpacity={0.7}
              accessibilityRole="checkbox"
              accessibilityLabel="잠금 해제된 미션만 보기"
              accessibilityState={{ checked: showOnlyParticipated }}
            >
              <View style={[styles.checkbox, showOnlyParticipated && styles.checkboxChecked]}>
                {showOnlyParticipated && (
                  <Text style={styles.checkboxCheckmark}>✓</Text>
                )}
              </View>
              <Text style={styles.filterCheckboxLabel}>잠금 해제된 미션만 보기</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.filterButton,
              (showOnlyParticipated || sortBy !== 'default') && styles.filterButtonActive
            ]}
            onPress={() => setShowFilterModal(true)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="필터"
            accessibilityHint="필터 옵션 열기"
            accessibilityState={{ selected: !!(showOnlyParticipated || sortBy !== 'default') }}
          >
            <Image
              source={require('../../assets/images/filter.png')}
              style={styles.filterIcon}
              resizeMode="contain"
              accessibilityLabel="필터 아이콘"
            />
            {(showOnlyParticipated || sortBy !== 'default') && (
              <View style={styles.filterBadge} />
            )}
          </TouchableOpacity>
        </View>
      )}

      {missions.length === 0 ? (
        <EmptyState
          iconImage={require('../../assets/images/goal.png')}
          title="미션이 없어요"
          description="현재 등록된 미션이 없습니다."
        />
      ) : (
        <>
          {/* 미션 목록 */}
          <View style={styles.groupMissionList}>
            {missions.map((mission) => (
              <View key={mission.id}>
                {/* 커스텀 미션 탭: 모든 미션 정상 카드, 공식 미션 탭: 수행한 미션(완료/미완료)은 정상 카드, 미수행만 자물쇠 */}
                {missionGroupTab === 'custom' || (missionGroupTab === 'official' && (mission.isCompleted === true || mission.isAttempted === true)) ? (
                  <TouchableOpacity
                    style={[
                      styles.groupMissionCard,
                      selectedMission?.id === mission.id && styles.groupMissionCardSelected,
                    ]}
                    onPress={() => {
                      onMissionSelect(
                        selectedMission?.id === mission.id ? null : mission
                      );
                    }}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`${mission.title} 미션${selectedMission?.id === mission.id ? ', 선택됨' : ''}`}
                    accessibilityState={{ selected: selectedMission?.id === mission.id }}
                    accessibilityHint="미션 정보를 봅니다"
                  >
                    <View style={styles.groupMissionHeader}>
                      <View style={styles.groupMissionInfo}>
                        <View style={styles.groupMissionTitleRow}>
                          <Image
                            source={require('../../assets/images/goal.png')}
                            style={styles.groupMissionIcon}
                            resizeMode="contain"
                            accessibilityLabel={`${mission.title} 아이콘`}
                          />
                          <Text style={styles.groupMissionTitle}>{mission.title}</Text>
                          {mission.category && (
                            <View style={styles.groupMissionTypeBadge}>
                              <Text style={styles.groupMissionTypeText}>
                                {getMissionCategoryLabel(mission.category)}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.groupMissionDescription} numberOfLines={2}>
                          {mission.description}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.groupMissionFooter}>
                      <View style={styles.groupMissionStats}>
                        <View style={styles.groupStatItem}>
                          <Text style={styles.groupStatText}>
                            참여 {mission.participantCount || 0}명
                          </Text>
                        </View>
                        {mission.expReward > 0 && (
                          <View style={styles.groupStatItem}>
                            <Image
                              source={require('../../assets/images/sun.png')}
                              style={styles.groupStatIcon}
                              resizeMode="contain"
                              accessibilityLabel="경험치 아이콘"
                            />
                            <Text style={styles.groupStatText}>{mission.expReward} EXP</Text>
                          </View>
                        )}
                        {missionGroupTab === 'official' && mission.difficultyLevel && (
                          <View style={styles.groupStatItem}>
                            <Text style={styles.groupStatText}>
                              {mission.difficultyLevel === 'EASY' ? '쉬움' : 
                               mission.difficultyLevel === 'MEDIUM' ? '보통' : '어려움'}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ) : (
                  // 공식 미션 탭의 미수행 미션: 잠금 아이콘 표시
                  <View style={styles.groupMissionCardLocked}>
                    <Image
                      source={require('../../assets/images/lock.png')}
                      style={styles.groupMissionLockIconCenter}
                      resizeMode="contain"
                      accessibilityLabel="잠금"
                    />
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* 서버 페이지네이션 (미션 카드 아래) */}
          {totalServerPages > 1 && (
            <View style={styles.serverPaginationContainer}>
              <TouchableOpacity
                style={[styles.serverPageButton, currentServerPage === 0 && styles.serverPageButtonDisabled]}
                onPress={() => {
                  if (currentServerPage > 0) {
                    onServerPageChange(currentServerPage - 1);
                  }
                }}
                disabled={currentServerPage === 0}
              >
                <Image
                  source={require('../../assets/images/chevron.png')}
                  style={[
                    styles.serverPageArrowIcon,
                    styles.serverPageArrowIconLeft,
                    currentServerPage === 0 && styles.serverPageArrowIconDisabled,
                  ]}
                  resizeMode="contain"
                  accessibilityLabel="이전 서버 페이지"
                />
              </TouchableOpacity>

              <Text style={styles.serverPageInfo}>
                Page {currentServerPage + 1} / {totalServerPages}
              </Text>

              <TouchableOpacity
                style={[styles.serverPageButton, currentServerPage === totalServerPages - 1 && styles.serverPageButtonDisabled]}
                onPress={() => {
                  if (currentServerPage < totalServerPages - 1) {
                    onServerPageChange(currentServerPage + 1);
                  }
                }}
                disabled={currentServerPage === totalServerPages - 1}
              >
                <Image
                  source={require('../../assets/images/chevron.png')}
                  style={[
                    styles.serverPageArrowIcon,
                    currentServerPage === totalServerPages - 1 && styles.serverPageArrowIconDisabled,
                  ]}
                  resizeMode="contain"
                  accessibilityLabel="다음 서버 페이지"
                />
            </TouchableOpacity>
          </View>
          )}
        </>
      )}
      </ScrollView>

      {/* 커스텀 미션 탭: FAB 버튼 */}
      {missionGroupTab === 'custom' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={onNavigateToCreate}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="커스텀 미션 만들기"
          accessibilityHint="새 커스텀 미션을 만듭니다"
        >
          <Image
            source={require('../../assets/images/pencil.png')}
            style={styles.fabIconImage}
            resizeMode="contain"
            accessibilityLabel="커스텀 미션 만들기 아이콘"
            accessibilityElementsHidden={true}
          />
        </TouchableOpacity>
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

              {/* 정렬 옵션 */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>정렬</Text>
                <View style={styles.filterOptionsRow}>
                  <TouchableOpacity
                    style={[
                      styles.filterOption,
                      sortBy === 'default' && styles.filterOptionActive,
                    ]}
                    onPress={() => onSortChange?.('default')}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={sortBy === 'default' ? '기본순, 선택됨' : '기본순으로 정렬'}
                    accessibilityState={{ selected: sortBy === 'default' }}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        sortBy === 'default' && styles.filterOptionTextActive,
                      ]}
                    >
                      기본순
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.filterOption,
                      sortBy === 'participants' && styles.filterOptionActive,
                    ]}
                    onPress={() => onSortChange?.('participants')}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={sortBy === 'participants' ? '참여순, 선택됨' : '참여순으로 정렬'}
                    accessibilityState={{ selected: sortBy === 'participants' }}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        sortBy === 'participants' && styles.filterOptionTextActive,
                      ]}
                    >
                      참여순
                    </Text>
                  </TouchableOpacity>
                  {missionGroupTab === 'official' && (
                    <TouchableOpacity
                      style={[
                        styles.filterOption,
                        sortBy === 'exp' && styles.filterOptionActive,
                      ]}
                      onPress={() => onSortChange?.('exp')}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={sortBy === 'exp' ? 'EXP순, 선택됨' : 'EXP순으로 정렬'}
                      accessibilityState={{ selected: sortBy === 'exp' }}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          sortBy === 'exp' && styles.filterOptionTextActive,
                        ]}
                      >
                        EXP순
                      </Text>
                    </TouchableOpacity>
                  )}
                  {missionGroupTab === 'official' && (
                    <TouchableOpacity
                      style={[
                        styles.filterOption,
                        sortBy === 'difficulty' && styles.filterOptionActive,
                      ]}
                      onPress={() => onSortChange?.('difficulty')}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={sortBy === 'difficulty' ? '난이도순, 선택됨' : '난이도순으로 정렬'}
                      accessibilityState={{ selected: sortBy === 'difficulty' }}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          sortBy === 'difficulty' && styles.filterOptionTextActive,
                        ]}
                      >
                        난이도순
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* 커스텀 미션만: 카테고리 필터 */}
              {missionGroupTab === 'custom' && (
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>카테고리</Text>
                  <View style={styles.filterOptionsRow}>
                    <TouchableOpacity
                      style={[
                        styles.filterOption,
                        selectedCategory === null && styles.filterOptionActive,
                      ]}
                      onPress={() => onCategoryFilterChange?.(null)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel="전체 카테고리"
                      accessibilityState={{ selected: selectedCategory === null }}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedCategory === null && styles.filterOptionTextActive,
                        ]}
                      >
                        전체
                      </Text>
                    </TouchableOpacity>
                    {(['DAILY_LIFE', 'GROWTH', 'EXERCISE', 'STUDY', 'HEALTH', 'RELATIONSHIP'] as MissionCategory[]).map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.filterOption,
                          selectedCategory === category && styles.filterOptionActive,
                        ]}
                        onPress={() => onCategoryFilterChange?.(category)}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel={getMissionCategoryLabel(category)}
                        accessibilityState={{ selected: selectedCategory === category }}
                      >
                        <Text
                          style={[
                            styles.filterOptionText,
                            selectedCategory === category && styles.filterOptionTextActive,
                          ]}
                        >
                          {getMissionCategoryLabel(category)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* 커스텀 미션만: 난이도 필터 */}
              {missionGroupTab === 'custom' && (
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>난이도</Text>
                  <View style={styles.filterOptionsRow}>
                    <TouchableOpacity
                      style={[
                        styles.filterOption,
                        selectedDifficulty === null && styles.filterOptionActive,
                      ]}
                      onPress={() => onDifficultyFilterChange?.(null)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel="전체 난이도"
                      accessibilityState={{ selected: selectedDifficulty === null }}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedDifficulty === null && styles.filterOptionTextActive,
                        ]}
                      >
                        전체
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.filterOption,
                        selectedDifficulty === 'EASY' && styles.filterOptionActive,
                      ]}
                      onPress={() => onDifficultyFilterChange?.('EASY')}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel="쉬움"
                      accessibilityState={{ selected: selectedDifficulty === 'EASY' }}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedDifficulty === 'EASY' && styles.filterOptionTextActive,
                        ]}
                      >
                        쉬움
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.filterOption,
                        selectedDifficulty === 'MEDIUM' && styles.filterOptionActive,
                      ]}
                      onPress={() => onDifficultyFilterChange?.('MEDIUM')}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel="보통"
                      accessibilityState={{ selected: selectedDifficulty === 'MEDIUM' }}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedDifficulty === 'MEDIUM' && styles.filterOptionTextActive,
                        ]}
                      >
                        보통
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.filterOption,
                        selectedDifficulty === 'HARD' && styles.filterOptionActive,
                      ]}
                      onPress={() => onDifficultyFilterChange?.('HARD')}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel="어려움"
                      accessibilityState={{ selected: selectedDifficulty === 'HARD' }}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedDifficulty === 'HARD' && styles.filterOptionTextActive,
                        ]}
                      >
                        어려움
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default MissionGroupList;
