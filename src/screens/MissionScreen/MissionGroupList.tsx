/**
 * 미션 도감 목록 컴포넌트
 * 공식/커스텀 미션 목록을 표시하는 컴포넌트
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform, RefreshControl } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { EmptyState } from '../../components/ui';
import { MissionCategory } from '../../api/missionApi';

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
          {/* 서버 페이지네이션 (서버에서 가져올 페이지) */}
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
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[20],
  },
  createMissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  createMissionIcon: {
    width: 20,
    height: 20,
    tintColor: colors.white,
  },
  createMissionText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  serverPaginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing[4],
    marginBottom: spacing[2],
    gap: spacing[12],
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  serverPageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[100],
  },
  serverPageButtonDisabled: {
    backgroundColor: colors.gray[100],
  },
  serverPageArrowIcon: {
    width: 16,
    height: 16,
    tintColor: colors.primary[600],
  },
  serverPageArrowIconLeft: {
    transform: [{ rotate: '180deg' }],
  },
  serverPageArrowIconDisabled: {
    tintColor: colors.gray[400],
  },
  serverPageInfo: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  groupMissionList: {
    marginBottom: spacing[4],
  },
  groupMissionCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[3],
    marginBottom: spacing[1],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  groupMissionCardLocked: {
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.base,
    padding: spacing[8],
    marginBottom: spacing[1],
    borderWidth: 2.5,
    borderColor: colors.gray[500],
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.gray[800],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  groupMissionCardSelected: {
    borderColor: colors.primary[500],
    borderWidth: 2,
    backgroundColor: colors.primary[50],
  },
  groupMissionHeader: {
    marginBottom: spacing[2],
  },
  groupMissionInfo: {
    flex: 1,
  },
  groupMissionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
    gap: spacing[1.5],
  },
  groupMissionIcon: {
    width: 20,
    height: 20,
  },
  groupMissionTitle: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  groupMissionTypeBadge: {
    backgroundColor: colors.primary[100],
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  groupMissionTypeText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[700],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  groupMissionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  groupMissionContent: {
    marginBottom: spacing[2],
  },
  groupMissionVerificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  groupVerificationIcon: {
    width: 16,
    height: 16,
  },
  groupMissionVerificationText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[800],
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  groupMissionFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing[2],
  },
  groupMissionStats: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  groupStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  groupStatIcon: {
    width: 16,
    height: 16,
  },
  groupStatText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  groupMissionLockIconCenter: {
    width: 40,
    height: 40,
    tintColor: colors.gray[600],
  },
});

export default MissionGroupList;
