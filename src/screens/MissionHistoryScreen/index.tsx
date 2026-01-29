/**
 * 미션 수행 이력 화면
 * 완료/실패/만료된 미션들의 기록을 볼 수 있는 화면
 */

import React from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { UserMission } from '../../api/missionApi';
import { Loading, Header, EmptyState, FilterBar } from '../../components/ui';
import { formatDateDot } from '../../utils/dateUtils';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { useMissionHistoryScreenContainer } from './MissionHistoryScreen.container';
import { styles } from './MissionHistoryScreen.styles';

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
    // 돌발 미션은 표시하지 않음
    if (item.isSpontaneous === true || item.mission === null) {
      return null;
    }
    
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
            <Text style={styles.backButtonText}>←</Text>
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
        containerStyle={styles.filterBarContainer}
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

export default MissionHistoryScreen;
