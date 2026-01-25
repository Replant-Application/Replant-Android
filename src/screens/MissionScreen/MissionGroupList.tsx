/**
 * 미션 도감 목록 컴포넌트
 * 공식/커스텀 미션 목록을 표시하는 컴포넌트
 */

import React from 'react';
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
  onMissionSelect: (mission: UnifiedMission | null) => void;
  onServerPageChange: (page: number) => void;
  onNavigateToCreate: () => void;
  onRefresh?: () => void;
  getVerificationTypeLabel: (type?: string) => string;
  getVerificationTypeIcon: (type?: string) => any;
  getMissionCategoryLabel: (category?: MissionCategory) => string;
}

const MissionGroupList: React.FC<MissionGroupListProps> = ({
  missions,
  missionGroupTab,
  selectedMission,
  currentUserId,
  currentServerPage,
  totalServerPages,
  refreshing = false,
  onMissionSelect,
  onServerPageChange,
  onNavigateToCreate,
  onRefresh,
  getVerificationTypeLabel,
  getVerificationTypeIcon,
  getMissionCategoryLabel,
}) => {
  return (
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
    >
      {/* 커스텀 미션 탭: 미션 만들기 버튼 */}
      {missionGroupTab === 'custom' && (
        <TouchableOpacity
          style={styles.createMissionButton}
          onPress={onNavigateToCreate}
          activeOpacity={0.7}
        >
          <Image
            source={require('../../assets/images/goal.png')}
            style={styles.createMissionIcon}
            resizeMode="contain"
            accessibilityLabel="미션 만들기 아이콘"
          />
          <Text style={styles.createMissionText}>커스텀 미션 만들기</Text>
        </TouchableOpacity>
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
                        <View style={styles.groupStatItem}>
                          <Image
                            source={require('../../assets/images/high-five.png')}
                            style={styles.groupStatIcon}
                            resizeMode="contain"
                            accessibilityLabel="참여자 아이콘"
                          />
                          <Text style={styles.groupStatText}>
                            참여 {mission.participantCount || 0}명
                          </Text>
                        </View>
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
  );
};

export default MissionGroupList;
