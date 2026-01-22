import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  ImageBackground,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { Header, Card } from '../../components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { RootStackParamList } from '../../types/navigation';
import { useStatisticsScreenContainer } from './StatisticsScreen.container';

interface StatisticsScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

type CategoryFilter = 'all' | 'health' | 'selfcare' | 'daily' | 'regular';

const StatisticsScreen: React.FC<StatisticsScreenProps> = ({ navigation }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    activeTab,
    selectedYear,
    selectedMonth,
    selectedCategory,
    monthlyStats,
    changeMonth,
    handleTabChange,
    handleCategoryChange,
    generateCalendarGridData,
  } = useStatisticsScreenContainer({ navigation });

  /**
   * 캘린더 그리드 렌더링
   */
  const renderCalendarGrid = (completedDays: number[], daysInMonth: number) => {
    const dayColors = ['#FFE066', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181'];
    const gridData = generateCalendarGridData(completedDays, daysInMonth);
    const rows = [];
    const daysPerRow = 7;
    const totalRows = Math.ceil(daysInMonth / daysPerRow);

    for (let row = 0; row < totalRows; row++) {
      const rowDays = [];
      for (let col = 0; col < daysPerRow; col++) {
        const dayIndex = row * daysPerRow + col;
        const dayData = gridData[dayIndex];
        if (dayData) {
          rowDays.push(
            <View
              key={dayData.day}
              style={[
                styles.calendarDay,
                dayData.isCompleted && {
                  backgroundColor: dayData.color,
                },
              ]}
            />
          );
        } else {
          rowDays.push(<View key={`empty-${dayIndex}`} style={styles.calendarDay} />);
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
    { id: 'health' as CategoryFilter, label: '건강 챙기기', icon: require('../../assets/images/health.png') },
    { id: 'selfcare' as CategoryFilter, label: '나 돌보기', icon: require('../../assets/images/coffee.png') },
    { id: 'daily' as CategoryFilter, label: '정돈된 일상', icon: require('../../assets/images/clean.png') },
    { id: 'regular' as CategoryFilter, label: '규칙적인', icon: require('../../assets/images/traning.png') },
  ];

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Header
            title="통계"
            navigation={navigation}
            leftButton={
              navigation?.goBack ? (
                <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
                  <Image
                    source={require('../../assets/images/left.png')}
                    style={styles.backButtonIcon}
                    resizeMode="contain"
                    accessibilityLabel="뒤로 가기"
                  />
                </TouchableOpacity>
              ) : undefined
            }
          />
          <View style={styles.content}>
            {/* 통합 통계 카드 */}
            <Card style={styles.mainCard}>
              {/* 날짜 선택기 */}
              <View style={styles.dateSection}>
                <View style={styles.dateSelector}>
                  <TouchableOpacity
                    style={styles.dateArrow}
                    onPress={() => changeMonth('prev')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.arrowText}>‹</Text>
                  </TouchableOpacity>
                  <Text style={styles.dateText}>
                    {selectedYear}년 {selectedMonth}월
                  </Text>
                  <TouchableOpacity
                    style={styles.dateArrow}
                    onPress={() => changeMonth('next')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.arrowText}>›</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 탭 */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'monthly' && styles.tabActive]}
                  onPress={() => handleTabChange('monthly')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tabText, activeTab === 'monthly' && styles.tabTextActive]}>
                    월간
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'weekly' && styles.tabActive]}
                  onPress={() => handleTabChange('weekly')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tabText, activeTab === 'weekly' && styles.tabTextActive]}>
                    주간
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 카테고리 필터 */}
              <View style={styles.filterSection}>
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
                      onPress={() => handleCategoryChange(filter.id)}
                      activeOpacity={0.7}
                    >
                      <Image
                        source={filter.icon}
                        style={styles.categoryIcon}
                        resizeMode="contain"
                        accessibilityLabel={`${filter.label} 카테고리 아이콘`}
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
              </View>

              {/* 목표 달성률 */}
              <View style={styles.achievementSection}>
                <View style={styles.achievementHeader}>
                  <Image
                    source={require('../../assets/images/goal.png')}
                    style={styles.achievementIcon}
                    resizeMode="contain"
                    accessibilityLabel="목표 달성 아이콘"
                  />
                  <Text style={styles.achievementTitle}>목표 달성률</Text>
                </View>
                <View style={styles.achievementContent}>
                  <Text style={styles.achievementPercentage}>
                    {monthlyStats.totalCompletionRate}%
                  </Text>
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${monthlyStats.totalCompletionRate}%` },
                        ]}
                      />
                    </View>
                    <View style={styles.progressGlow} />
                  </View>
                </View>
              </View>

              {/* 미션별 통계 */}
              <View style={styles.missionStatsSection}>
                <View style={styles.missionStatsGrid}>
                  {monthlyStats.missionStats.map((stat) => (
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
                            accessibilityLabel="완료 아이콘"
                          />
                          <Text style={styles.missionStatDays}>{stat.completedDays.length}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </Card>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
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
    paddingBottom: spacing[6],
  },
  content: {
    padding: spacing[5],
  },
  mainCard: {
    marginBottom: spacing[6],
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E7',
    borderRadius: borderRadius.lg,
    padding: spacing[1],
    marginBottom: spacing[5],
    marginTop: spacing[3],
    borderWidth: 2,
    borderColor: '#D4A574',
    ...shadows.sm,
    shadowColor: '#8B6F47',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    marginHorizontal: 2,
    minHeight: 28,
  },
  tabActive: {
    backgroundColor: '#8B6F47',
    ...shadows.sm,
    shadowColor: '#8B6F47',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium as any,
    color: '#8B6F47',
    letterSpacing: 0.3,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  tabTextActive: {
    color: '#FFF8E7',
    fontWeight: typography.fontWeight.medium as any,
    letterSpacing: 0.3,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  dateSection: {
    marginBottom: spacing[3],
    paddingBottom: 0,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateArrow: {
    padding: spacing[2],
    minWidth: 40,
    alignItems: 'center',
  },
  arrowText: {
    fontSize: typography.fontSize['2xl'],
    color: colors.primary[700],
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  dateText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xl),
  },
  filterSection: {
    marginBottom: spacing[5],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  categoryScroll: {
    marginBottom: 0,
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
    width: 25,
    height: 25,
  },
  categoryFilterText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  categoryFilterTextActive: {
    color: colors.primary[600],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  achievementSection: {
    marginBottom: spacing[5],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
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
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[0],
  },
  achievementPercentage: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.medium as any,
    color: '#8B6F47',
    minWidth: 45,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize['2xl']),
  },
  progressBarContainer: {
    flex: 1,
    position: 'relative',
    minWidth: 0,
  },
  progressBar: {
    height: 16,
    backgroundColor: '#F5E6D3',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D4A574',
    ...shadows.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B6F47',
    borderRadius: borderRadius.full,
    ...shadows.sm,
    shadowColor: '#8B6F47',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  progressGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 16,
    borderRadius: borderRadius.full,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(139, 111, 71, 0.2)',
    pointerEvents: 'none',
  },
  missionStatsSection: {
    marginTop: spacing[2],
  },
  missionStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  missionStatCard: {
    width: '48%',
    padding: spacing[3],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
  },
  missionStatTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[2],
    minHeight: 36,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
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
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
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
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
});

export default StatisticsScreen;

