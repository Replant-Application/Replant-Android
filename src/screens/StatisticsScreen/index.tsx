import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { Header, Card } from '../../components/ui';
import { spacing } from '../../utils/designTokens';
import { RootStackParamList } from '../../types/navigation';
import { useStatisticsScreenContainer } from './StatisticsScreen.container';
import { styles } from './StatisticsScreen.styles';

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

export default StatisticsScreen;

