/**
 * 미션 수행 이력 화면
 * 완료/실패/만료된 미션들의 기록을 볼 수 있는 화면
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { getUserMissions, UserMission, UserMissionStatus } from '../../api/missionApi';
import { Loading, Header, EmptyState, FilterBar } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { Platform } from 'react-native';
import { formatDateDot } from '../../utils/dateUtils';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';

interface MissionHistoryScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

type FilterType = 'all' | 'completed' | 'expired';

const MissionHistoryScreen: React.FC<MissionHistoryScreenProps> = ({ navigation }) => {
  const [missions, setMissions] = useState<UserMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchHistory = useCallback(async (pageNum: number = 0, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNum === 0) {
        setLoading(true);
      }

      const result = await getUserMissions({ page: pageNum, size: 20 });

      if (result.success && result.data) {
        const newMissions = result.data.content;
        if (isRefresh || pageNum === 0) {
          setMissions(newMissions);
        } else {
          setMissions(prev => [...prev, ...newMissions]);
        }
        setHasMore(result.data.number < result.data.totalPages - 1);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('미션 이력 조회 실패:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(0);
  }, [fetchHistory]);

  const handleRefresh = () => {
    fetchHistory(0, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchHistory(page + 1);
    }
  };

  const getFilteredMissions = () => {
    if (filter === 'all') return missions;
    if (filter === 'completed') return missions.filter(m => m.status === 'COMPLETED');
    if (filter === 'expired') return missions.filter(m => m.status === 'EXPIRED');
    return missions;
  };

  const getStatusColor = (status: UserMissionStatus) => {
    switch (status) {
      case 'COMPLETED': return colors.success;
      case 'EXPIRED': return colors.error;
      case 'ASSIGNED': return colors.info;
      case 'PENDING': return colors.warning;
      default: return colors.text.secondary;
    }
  };

  const getStatusText = (status: UserMissionStatus) => {
    switch (status) {
      case 'COMPLETED': return '완료';
      case 'EXPIRED': return '만료';
      case 'ASSIGNED': return '진행중';
      case 'PENDING': return '인증대기';
      default: return status;
    }
  };


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
            {item.missionType === 'SYSTEM' ? '시스템' : '커스텀'}
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

        {item.status === 'COMPLETED' && (
          <View style={styles.rewardInfo}>
            <Text style={styles.rewardText}>+{mission.expReward} EXP 획득</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading && missions.length === 0) {
    return <Loading text="미션 이력을 불러오는 중..." />;
  }

  const filteredMissions = getFilteredMissions();

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
        onFilterChange={(key) => setFilter(key as FilterType)}
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
          <Text style={styles.statValue}>
            {missions.filter(m => m.status === 'COMPLETED').length}
          </Text>
          <Text style={styles.statLabel}>완료</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {missions.filter(m => m.status === 'EXPIRED').length}
          </Text>
          <Text style={styles.statLabel}>만료</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {missions.length > 0
              ? Math.round((missions.filter(m => m.status === 'COMPLETED').length / missions.length) * 100)
              : 0}%
          </Text>
          <Text style={styles.statLabel}>성공률</Text>
        </View>
      </View>

      {/* 미션 목록 */}
      <FlatList
        data={filteredMissions}
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
    fontWeight: typography.fontWeight.bold as any,
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
    fontWeight: typography.fontWeight.semibold as any,
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
    lineHeight: 20,
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
