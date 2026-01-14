import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image, ImageBackground } from 'react-native';
import { useMission } from '../../hooks/useMission';
import { Card, ErrorBoundary, Header } from '../../components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { Mission } from '../../types';
import { formatDateKorean, formatDateYYYYMMDD } from '../../utils/dateUtils';
import { getUserMissions, UserMission } from '../../api/missionApi';
import { logError } from '../../utils/logger';

interface CalendarScreenProps {
  navigation?: {
    goBack?: () => void;
  };
}

const CalendarScreen: React.FC<CalendarScreenProps> = ({ navigation }) => {
  const { missions } = useMission();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(formatDateYYYYMMDD(today));
  
  // 백엔드에서 모든 미션 가져오기 (생성된 날짜 기준)
  const [allMissions, setAllMissions] = useState<UserMission[]>([]);
  const [loadingMissions, setLoadingMissions] = useState(false);

  useEffect(() => {
    const loadAllMissions = async () => {
      setLoadingMissions(true);
      try {
        // 모든 상태의 미션 가져오기 (완료 여부와 관계없이)
        const result = await getUserMissions({ page: 0, size: 1000 });
        if (result.success && result.data) {
          setAllMissions(result.data.content);
        }
      } catch (err) {
        logError('미션 로딩 실패', err as Error);
      } finally {
        setLoadingMissions(false);
      }
    };
    loadAllMissions();
  }, []);

  // 미션을 생성된 날짜(assignedAt) 기준으로 날짜별로 그룹화
  const missionsByDate = useMemo(() => {
    const grouped: Record<string, UserMission[]> = {};
    
    // 백엔드에서 가져온 모든 미션들을 assignedAt 기준으로 그룹화
    allMissions.forEach(userMission => {
      if (userMission.assignedAt) {
        const date = userMission.assignedAt.split('T')[0];
        if (date) {
          if (!grouped[date]) {
            grouped[date] = [];
          }
          grouped[date].push(userMission);
        }
      }
    });
    
    return grouped;
  }, [allMissions]);

  // 현재 월의 날짜 배열 생성
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{ date: number; dateString: string | undefined; isCurrentMonth: boolean }> = [];

    // 이전 달의 마지막 날들
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = prevMonthLastDay - i;
      const dateString = formatDateYYYYMMDD(new Date(currentYear, currentMonth - 1, date));
      days.push({ date, dateString, isCurrentMonth: false });
    }

    // 현재 달의 날들
    for (let i = 1; i <= daysInMonth; i++) {
      const dateString = formatDateYYYYMMDD(new Date(currentYear, currentMonth, i));
      days.push({ date: i, dateString, isCurrentMonth: true });
    }

    // 다음 달의 첫 날들 (캘린더를 채우기 위해)
    const remainingDays = 42 - days.length; // 6주 * 7일
    for (let i = 1; i <= remainingDays; i++) {
      const dateString = formatDateYYYYMMDD(new Date(currentYear, currentMonth + 1, i));
      days.push({ date: i, dateString, isCurrentMonth: false });
    }

    return days;
  }, [currentYear, currentMonth]);

  // 월 이동
  const changeMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  // 날짜 클릭 처리
  const handleDatePress = (dateString: string | undefined) => {
    if (!dateString) return;
    setSelectedDate(dateString);
  };

  // 선택된 날짜의 미션
  const selectedDayMissions = selectedDate ? missionsByDate[selectedDate] || [] : [];

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <Header
            title="캘린더"
            navigation={navigation}
            leftButton={
              navigation?.goBack ? (
                <TouchableOpacity onPress={() => navigation.goBack?.()} activeOpacity={0.7}>
                  <Image
                    source={require('../../assets/images/left.png')}
                    style={styles.backButtonIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              ) : undefined
            }
          />
          <View style={styles.content}>
            {/* 캘린더 */}
            <Card style={styles.calendarCard}>
              <View style={styles.calendarHeader}>
                <TouchableOpacity onPress={() => changeMonth('prev')} style={styles.monthButton}>
                  <Text style={styles.monthButtonText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.monthYearText}>
                  {currentYear}년 {monthNames[currentMonth]}
                </Text>
                <TouchableOpacity onPress={() => changeMonth('next')} style={styles.monthButton}>
                  <Text style={styles.monthButtonText}>›</Text>
                </TouchableOpacity>
              </View>

              {/* 요일 헤더 */}
              <View style={styles.weekDaysHeader}>
                {weekDays.map((day, index) => (
                  <View key={index} style={styles.weekDayHeader}>
                    <Text style={styles.weekDayText}>{day}</Text>
                  </View>
                ))}
              </View>

              {/* 캘린더 그리드 */}
              <View style={styles.calendarGrid}>
                {calendarDays.map((day, index) => {
                  if (!day.dateString) return null;
                  const dateString = day.dateString;
                  const dayMissionsForDate = missionsByDate[dateString] || [];
                  const todayString = formatDateYYYYMMDD(today);
                  const isToday = dateString === todayString;
                  const isSelected = dateString === selectedDate;
                  const missionCount = dayMissionsForDate.length;
                  const showMoreIndicator = missionCount > 2;

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.calendarDay,
                        !day.isCurrentMonth && styles.calendarDayOtherMonth,
                        isToday && styles.calendarDayToday,
                        isSelected && styles.calendarDaySelected,
                      ]}
                      onPress={() => handleDatePress(dateString)}
                    >
                      <Text
                        style={[
                          styles.calendarDayText,
                          !day.isCurrentMonth && styles.calendarDayTextOtherMonth,
                          isToday && styles.calendarDayTextToday,
                        ]}
                      >
                        {day.date}
                      </Text>
                      {missionCount > 0 && (
                        <View style={styles.missionIndicators}>
                          {dayMissionsForDate.slice(0, 2).map((userMission, idx) => (
                            <View
                              key={userMission.id}
                              style={[
                                styles.missionIndicator,
                                { backgroundColor: getMissionColor(userMission, idx) },
                              ]}
                            />
                          ))}
                          {showMoreIndicator && (
                            <Text style={styles.moreIndicatorText}>+{missionCount - 2}</Text>
                          )}
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 선택된 날짜의 미션 목록 (캘린더 바로 아래) */}
              {selectedDate && (
                <View style={styles.missionsListContainer}>
                  <View style={styles.missionsListHeader}>
                    <Image
                      source={require('../../assets/images/clip.png')}
                      style={styles.missionsListIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.missionsListTitle}>
                      {formatDateKorean(selectedDate, true)} 미션
                    </Text>
                  </View>
                  {selectedDayMissions.length > 0 && (
                    <>
                      {selectedDayMissions.map((userMission) => {
                        const missionTitle = userMission.mission?.title || userMission.customMission?.title || '미션';
                        const isCompleted = userMission.status === 'COMPLETED';
                        return (
                          <View key={userMission.id} style={styles.missionItem}>
                            <Image
                              source={require('../../assets/images/goal.png')}
                              style={styles.missionIcon}
                              resizeMode="contain"
                            />
                            <View style={styles.missionContent}>
                              <View style={styles.missionTitleRow}>
                                <Text style={styles.missionTitle}>{missionTitle}</Text>
                                {isCompleted && (
                                  <View style={styles.completedBadge}>
                                    <Text style={styles.completedText}>✓ 완료</Text>
                                  </View>
                                )}
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </>
                  )}
                </View>
              )}

              {/* 빈 상태 메시지 */}
              {selectedDate && selectedDayMissions.length === 0 && (
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyText}>이 날짜에는 미션이 없습니다.</Text>
                </View>
              )}
            </Card>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

// 미션 색상 생성 함수
const getMissionColor = (userMission: UserMission, index: number): string => {
  const missionColors: string[] = ['#FFE066', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181', '#A8E6CF', '#FFD3A5'];
  const hash = userMission.id.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorIndex = (hash + index) % missionColors.length;
  const selectedColor = missionColors[colorIndex];
  return selectedColor ?? missionColors[0] ?? '#FFE066';
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
  content: {
    padding: spacing[5],
  },
  calendarCard: {
    marginBottom: spacing[6],
  },
  missionsListContainer: {
    marginTop: spacing[1],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  missionsListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  missionsListIcon: {
    width: 20,
    height: 20,
  },
  missionsListTitle: {
    fontSize: typography.fontSize.base,
    letterSpacing: -0.5,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
    flex: 1,
  },
  emptyStateContainer: {
    marginTop: spacing[4],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    alignItems: 'center',
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  monthButton: {
    padding: spacing[2],
    minWidth: 40,
    alignItems: 'center',
  },
  monthButtonText: {
    fontSize: typography.fontSize['2xl'],
    color: colors.primary[700],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  monthYearText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xl),
  },
  weekDaysHeader: {
    flexDirection: 'row',
    marginBottom: spacing[2],
  },
  weekDayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  weekDayText: {
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
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    padding: spacing[1],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  calendarDayOtherMonth: {
    backgroundColor: colors.background.secondary,
    opacity: 0.5,
  },
  calendarDayToday: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[400],
  },
  calendarDaySelected: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[600],
  },
  calendarDayText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  calendarDayTextOtherMonth: {
    color: colors.text.secondary,
  },
  calendarDayTextToday: {
    color: colors.primary[700],
    fontWeight: typography.fontWeight.medium,
  },
  missionIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    gap: 2,
  },
  missionIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  moreIndicatorText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  missionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    marginBottom: spacing[2],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    ...shadows.base,
  },
  missionIcon: {
    width: 24,
    height: 24,
    marginRight: spacing[3],
  },
  missionContent: {
    flex: 1,
  },
  missionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  missionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.primary,
    flex: 1,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  completedBadge: {
    backgroundColor: colors.green[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  completedText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.green[700],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    padding: spacing[6],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
});

export default CalendarScreen;
