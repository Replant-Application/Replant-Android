import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { Header } from '../../components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { RootStackParamList } from '../../types/navigation';
import { useMission } from '../../hooks/useMission';
import { Mission } from '../../types';

interface StatisticsScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

type TabType = 'monthly' | 'weekly' | 'greenlight';
type CategoryFilter = 'all' | 'health' | 'selfcare' | 'daily' | 'regular';

const StatisticsScreen: React.FC<StatisticsScreenProps> = ({ navigation }) => {
  const { missions } = useMission();
  const [activeTab, setActiveTab] = useState<TabType>('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');

  // 날짜 변경
  const changeMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedMonth === 1) {
        setSelectedMonth(12);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 12) {
        setSelectedMonth(1);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  // 선택된 월의 미션 완료 데이터 계산
  const monthlyStats = useMemo(() => {
    const year = selectedYear;
    const month = selectedMonth;
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // 선택된 월의 시작일과 종료일
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // 카테고리 필터링
    let filteredMissions = missions;
    if (selectedCategory !== 'all') {
      // 카테고리 매핑 (실제 카테고리 ID에 맞게 조정 필요)
      filteredMissions = missions; // 일단 전체 미션 사용
    }

    // 각 미션별로 해당 월의 완료 일자 계산
    const missionStats = filteredMissions.map(mission => {
      const completedDays: number[] = [];
      
      if (mission.completed_at) {
        const completedDate = new Date(mission.completed_at);
        if (completedDate >= startDate && completedDate <= endDate) {
          completedDays.push(completedDate.getDate());
        }
      }

      // 반복 미션의 경우 (매일 완료 가능한 미션)
      // 실제로는 미션 히스토리 데이터가 필요하지만, 여기서는 예시로 처리
      const completionRate = daysInMonth > 0 
        ? Math.round((completedDays.length / daysInMonth) * 100) 
        : 0;

      return {
        mission,
        completedDays,
        completionRate,
        totalDays: daysInMonth,
      };
    });

    // 전체 목표 달성률 계산
    const totalCompletionRate = missionStats.length > 0
      ? Math.round(
          missionStats.reduce((sum, stat) => sum + stat.completionRate, 0) / 
          missionStats.length
        )
      : 0;

    return {
      missionStats,
      totalCompletionRate,
      daysInMonth,
    };
  }, [missions, selectedYear, selectedMonth, selectedCategory]);

  // 캘린더 그리드 렌더링
  const renderCalendarGrid = (completedDays: number[], daysInMonth: number) => {
    const colors = ['#FFE066', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181'];
    const rows = [];
    const daysPerRow = 7;
    const totalRows = Math.ceil(daysInMonth / daysPerRow);

    for (let row = 0; row < totalRows; row++) {
      const rowDays = [];
      for (let col = 0; col < daysPerRow; col++) {
        const day = row * daysPerRow + col + 1;
        if (day <= daysInMonth) {
          const isCompleted = completedDays.includes(day);
          const colorIndex = completedDays.indexOf(day) % colors.length;
          rowDays.push(
            <View
              key={day}
              style={[
                styles.calendarDay,
                isCompleted && {
                  backgroundColor: colors[colorIndex],
                },
              ]}
            />
          );
        } else {
          rowDays.push(<View key={`empty-${day}`} style={styles.calendarDay} />);
        }
      }
      rows.push(
        <View key={row} style={styles.calendarRow}>
          {rowDays}
        </View>
      );
    }
    return <View style={styles.calendarGrid}>{rows}</View>;
  };

  const categoryFilters = [
    { id: 'all' as CategoryFilter, label: '전체', icon: require('../../assets/images/search.png') },
    { id: 'health' as CategoryFilter, label: '건강 챙기기', icon: require('../../assets/images/home.png') },
    { id: 'selfcare' as CategoryFilter, label: '나 돌보기', icon: require('../../assets/images/like.png') },
    { id: 'daily' as CategoryFilter, label: '정돈된 일상', icon: require('../../assets/images/home.png') },
    { id: 'regular' as CategoryFilter, label: '규칙적인', icon: require('../../assets/images/day.png') },
  ];

  return (
    <View style={styles.container}>
      <Header
        title="통계"
        leftButton={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../../assets/images/left.png')}
              style={styles.backButtonIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        }
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 탭 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'monthly' && styles.tabActive]}
            onPress={() => setActiveTab('monthly')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'monthly' && styles.tabTextActive]}>
              월간
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'weekly' && styles.tabActive]}
            onPress={() => setActiveTab('weekly')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'weekly' && styles.tabTextActive]}>
              주간
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'greenlight' && styles.tabActive]}
            onPress={() => setActiveTab('greenlight')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'greenlight' && styles.tabTextActive]}>
              초록불
            </Text>
          </TouchableOpacity>
        </View>

        {/* 날짜 선택기 */}
        <View style={styles.dateSelector}>
          <TouchableOpacity
            style={styles.dateArrow}
            onPress={() => changeMonth('prev')}
            activeOpacity={0.7}
          >
            <Image
              source={require('../../assets/images/left.png')}
              style={styles.arrowIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.dateText}>
            {selectedYear}년 {selectedMonth}월
          </Text>
          <TouchableOpacity
            style={styles.dateArrow}
            onPress={() => changeMonth('next')}
            activeOpacity={0.7}
          >
            <Image
              source={require('../../assets/images/left.png')}
              style={[styles.arrowIcon, { transform: [{ rotate: '180deg' }] }]}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.infoButton} activeOpacity={0.7}>
            <Text style={styles.infoText}>i</Text>
          </TouchableOpacity>
        </View>

        {/* 카테고리 필터 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {categoryFilters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.categoryFilter,
                selectedCategory === filter.id && styles.categoryFilterActive,
              ]}
              onPress={() => setSelectedCategory(filter.id)}
              activeOpacity={0.7}
            >
              <Image
                source={filter.icon}
                style={styles.categoryIcon}
                resizeMode="contain"
              />
              <Text
                style={[
                  styles.categoryFilterText,
                  selectedCategory === filter.id && styles.categoryFilterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 목표 달성률 */}
        <View style={styles.achievementCard}>
          <View style={styles.achievementHeader}>
            <Image
              source={require('../../assets/images/search.png')}
              style={styles.achievementIcon}
              resizeMode="contain"
            />
            <Text style={styles.achievementTitle}>목표 달성률</Text>
          </View>
          <View style={styles.achievementContent}>
            <Text style={styles.achievementPercentage}>
              {monthlyStats.totalCompletionRate}%
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${monthlyStats.totalCompletionRate}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* 미션별 통계 카드 */}
        <View style={styles.missionStatsGrid}>
          {monthlyStats.missionStats.map((stat, index) => (
            <View key={stat.mission.mission_id} style={styles.missionStatCard}>
              <Text style={styles.missionStatTitle} numberOfLines={2}>
                {stat.mission.title}
              </Text>
              {renderCalendarGrid(stat.completedDays, stat.totalDays)}
              <View style={styles.missionStatFooter}>
                <Text style={styles.missionStatPercentage}>{stat.completionRate}%</Text>
                <View style={styles.missionStatCheck}>
                  <Image
                    source={require('../../assets/images/check2.png')}
                    style={styles.checkIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.missionStatDays}>{stat.completedDays.length}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  backButtonIcon: {
    width: 24,
    height: 24,
    tintColor: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[6],
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: spacing[4],
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[1],
    ...shadows.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing[2],
    alignItems: 'center',
    borderRadius: borderRadius.lg,
  },
  tabActive: {
    backgroundColor: colors.primary[500],
  },
  tabText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
    paddingHorizontal: spacing[4],
  },
  dateArrow: {
    padding: spacing[2],
  },
  arrowIcon: {
    width: 20,
    height: 20,
    tintColor: colors.text.primary,
  },
  dateText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginHorizontal: spacing[4],
  },
  infoButton: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing[2],
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.secondary,
  },
  categoryScroll: {
    marginBottom: spacing[4],
  },
  categoryContainer: {
    paddingHorizontal: spacing[2],
    gap: spacing[2],
  },
  categoryFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.xl,
    backgroundColor: colors.gray[100],
    gap: spacing[2],
  },
  categoryFilterActive: {
    backgroundColor: colors.primary[100],
  },
  categoryIcon: {
    width: 20,
    height: 20,
  },
  categoryFilterText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  categoryFilterTextActive: {
    color: colors.primary[600],
  },
  achievementCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[4],
    ...shadows.lg,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  achievementIcon: {
    width: 20,
    height: 20,
    marginRight: spacing[2],
  },
  achievementTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  achievementPercentage: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
    minWidth: 60,
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.full,
  },
  missionStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  missionStatCard: {
    width: '48%',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[3],
    ...shadows.lg,
  },
  missionStatTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[2],
    minHeight: 36,
  },
  calendarGrid: {
    marginBottom: spacing[2],
  },
  calendarRow: {
    flexDirection: 'row',
    gap: spacing[1],
    marginBottom: spacing[1],
  },
  calendarDay: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.sm,
  },
  missionStatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  missionStatPercentage: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  missionStatCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  checkIcon: {
    width: 16,
    height: 16,
  },
  missionStatDays: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
});

export default StatisticsScreen;

