/**
 * 미션 도감 목록 컴포넌트
 * 공식/커스텀 미션 목록을 표시하는 컴포넌트
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, RefreshControl } from 'react-native';
import { colors } from '../../utils/designTokens';
import { EmptyState } from '../../components/ui';
import { MissionCategory } from '../../api/missionApi';
import { styles } from './MissionGroupList.styles';

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
  onMissionSelect,
  onServerPageChange,
  onNavigateToCreate,
  onRefresh,
  onSortChange,
  onShowOnlyParticipatedChange,
  getVerificationTypeLabel,
  getVerificationTypeIcon,
  getMissionCategoryLabel,
}) => {
  const [showSortDropdown, setShowSortDropdown] = useState(false);

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
          // 스크롤 시작 시 드롭다운 닫기
          if (showSortDropdown) {
            setShowSortDropdown(false);
          }
        }}
      >
      {/* 필터 및 정렬 컨트롤 (같은 가로 라인) */}
      {missions.length > 0 && (
        <View style={styles.filterSortRow}>
          {/* 공식 미션: "참여한 미션" 체크박스 */}
          {missionGroupTab === 'official' ? (
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
          ) : (
            <View style={styles.filterCheckboxPlaceholder} />
          )}

          {/* 정렬 버튼 */}
          <View style={styles.sortButtonWrapper}>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => setShowSortDropdown(!showSortDropdown)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="정렬 옵션"
            >
              <Text style={styles.sortButtonText}>
                {sortBy === 'participants' ? '참여순' : 
                 (sortBy === 'exp' && missionGroupTab === 'official') ? 'EXP순' : 
                 sortBy === 'difficulty' ? '난이도순' : '기본순'}
              </Text>
              <Text style={styles.sortButtonArrow}>↑↓</Text>
            </TouchableOpacity>
          
          {/* 드롭다운 메뉴 */}
          {showSortDropdown && (
            <View style={styles.sortDropdown}>
              <TouchableOpacity
                style={[
                  styles.sortDropdownItem,
                  sortBy === 'default' && styles.sortDropdownItemSelected,
                ]}
                onPress={() => {
                  onSortChange?.('default');
                  setShowSortDropdown(false);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.sortDropdownItemText,
                    sortBy === 'default' && styles.sortDropdownItemTextSelected,
                  ]}
                >
                  기본순
                </Text>
                {sortBy === 'default' && (
                  <Text style={styles.sortDropdownCheck}>✓</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sortDropdownItem,
                  sortBy === 'participants' && styles.sortDropdownItemSelected,
                ]}
                onPress={() => {
                  onSortChange?.('participants');
                  setShowSortDropdown(false);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.sortDropdownItemText,
                    sortBy === 'participants' && styles.sortDropdownItemTextSelected,
                  ]}
                >
                  참여순
                </Text>
                {sortBy === 'participants' && (
                  <Text style={styles.sortDropdownCheck}>✓</Text>
                )}
              </TouchableOpacity>
              {missionGroupTab === 'official' && (
                <TouchableOpacity
                  style={[
                    styles.sortDropdownItem,
                    sortBy === 'exp' && styles.sortDropdownItemSelected,
                  ]}
                  onPress={() => {
                    onSortChange?.('exp');
                    setShowSortDropdown(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.sortDropdownItemText,
                      sortBy === 'exp' && styles.sortDropdownItemTextSelected,
                    ]}
                  >
                    EXP순
                  </Text>
                  {sortBy === 'exp' && (
                    <Text style={styles.sortDropdownCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              {missionGroupTab === 'official' && (
                <TouchableOpacity
                  style={[
                    styles.sortDropdownItem,
                    sortBy === 'difficulty' && styles.sortDropdownItemSelected,
                  ]}
                  onPress={() => {
                    onSortChange?.('difficulty');
                    setShowSortDropdown(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.sortDropdownItemText,
                      sortBy === 'difficulty' && styles.sortDropdownItemTextSelected,
                    ]}
                  >
                    난이도순
                  </Text>
                  {sortBy === 'difficulty' && (
                    <Text style={styles.sortDropdownCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}
          </View>
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

                    <View style={styles.groupMissionContent}>
                      <View style={styles.groupMissionVerificationInfo}>
                        {getVerificationTypeIcon(mission.verificationType) && (
                          <Image
                            source={getVerificationTypeIcon(mission.verificationType)!}
                            style={styles.groupVerificationIcon}
                            resizeMode="contain"
                            accessibilityLabel={`${getVerificationTypeLabel(mission.verificationType)} 아이콘`}
                          />
                        )}
                        <Text style={styles.groupMissionVerificationText}>
                          {getVerificationTypeLabel(mission.verificationType)}
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
    </View>
  );
};

export default MissionGroupList;
