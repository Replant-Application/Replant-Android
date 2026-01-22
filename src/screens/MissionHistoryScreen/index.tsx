/**
 * 미션 수행 이력 화면
 * 완료/실패/만료된 미션들의 기록을 볼 수 있는 화면
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { UserMission } from '../../api/missionApi';
import { Loading, Header, EmptyState, FilterBar } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { formatDateDot } from '../../utils/dateUtils';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { useMissionHistoryScreenContainer } from './MissionHistoryScreen.container';

interface MissionHistoryScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const MissionHistoryScreen: React.FC<MissionHistoryScreenProps> = ({ navigation }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    missions,
    loading,
    refreshing,
    filter,
    stats,
    handleRefresh,
    handleLoadMore,
    handleFilterChange,
    getStatusColor,
    getStatusText,
  } = useMissionHistoryScreenContainer({ navigation });


  const renderMissionItem = ({ item }: { item: UserMission }) => {
    const mission = item.mission || item.customMission;
    if (!mission) return null;

    return (
      <TouchableOpacity style={styles.missionCard}>
        <View style={styles.missionHeader}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
          <Text style={styles.missionType}>
            {item.missionType === 'OFFICIAL' ? '시스템' : '커스텀'}
          </Text>
        </View>

        <Text style={styles.missionTitle}>{mission.title}</Text>
        <Text style={styles.missionDescription} numberOfLines={2}>
          {mission.description}
        </Text>

        <View style={styles.missionFooter}>
          <Text style={styles.dateText}>
            배정: {formatDateDot(item.assignedAt)}
          </Text>
          <Text style={styles.dateText}>
            마감: {formatDateDot(item.dueDate)}
          </Text>
        </View>

        {item.status === 'COMPLETED' && item.missionType !== 'CUSTOM' && (
          <View style={styles.rewardInfo}>
            <Text style={styles.rewardText}>+{mission.expReward || 0} EXP 획득</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading && missions.length === 0) {
    return <Loading text="미션 이력을 불러오는 중..." />;
  }

  return (
    <View style={styles.container}>
      <Header
        title="미션 이력"
        leftButton={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ fontSize: 24 }}>←</Text>
          </TouchableOpacity>
        }
      />

      {/* 필터 탭 */}
      <FilterBar
        filters={[
          { key: 'all', label: '전체' },
          { key: 'completed', label: '완료' },
          { key: 'expired', label: '만료' },
        ]}
        selectedFilter={filter}
        onFilterChange={(key) => handleFilterChange(key as 'all' | 'completed' | 'expired')}
        variant="button"
        containerStyle={{
          paddingHorizontal: spacing[4],
          paddingVertical: spacing[2],
          borderBottomWidth: 1,
          borderBottomColor: colors.border.light,
        }}
      />

      {/* 통계 요약 */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.completed}</Text>
          <Text style={styles.statLabel}>완료</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.expired}</Text>
          <Text style={styles.statLabel}>만료</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.successRate}%</Text>
          <Text style={styles.statLabel}>성공률</Text>
        </View>
      </View>

      {/* 미션 목록 */}
      <FlatList
        data={missions}
        renderItem={renderMissionItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <EmptyState
            icon="clipboard-list"
            title="미션 이력이 없습니다"
            description="미션을 수행하고 나면 여기에 기록이 남습니다."
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    marginHorizontal: spacing[4],
    marginVertical: spacing[3],
    padding: spacing[4],
    borderRadius: borderRadius.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.medium as any,
    color: colors.primary[600],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize['2xl']),
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing[1],
  },
  listContent: {
    padding: spacing[4],
  },
  missionCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  statusBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  missionType: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  missionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.primary,
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  missionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  missionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing[3],
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  dateText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  rewardInfo: {
    marginTop: spacing[2],
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  rewardText: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
});

export default MissionHistoryScreen;
