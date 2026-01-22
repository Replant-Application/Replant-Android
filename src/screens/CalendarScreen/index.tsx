import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { Card, Header } from '../../components/ui';
import { spacing } from '../../utils/designTokens';
import { formatDateYYYYMMDD } from '../../utils/dateUtils';
import { useCalendarScreenContainer } from './CalendarScreen.container';
import { styles } from './CalendarScreen.styles';

interface CalendarScreenProps {
  navigation?: {
    goBack?: () => void;
  };
}

const CalendarScreen: React.FC<CalendarScreenProps> = ({ navigation }) => {
  const today = new Date();

  // 비즈니스 로직은 Container에서 처리
  const {
    currentMonth,
    currentYear,
    selectedDate,
    loadingMissions,
    calendarDays,
    missionsByDate,
    selectedDayMissions,
    changeMonth,
    handleDatePress,
  } = useCalendarScreenContainer({ navigation });

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
                    accessibilityLabel="뒤로 가기"
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
                        <View style={styles.missionCountBadge}>
                          <Text style={styles.missionCountText}>{missionCount}</Text>
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
                      accessibilityLabel="미션 목록 아이콘"
                    />
                    <Text style={styles.missionsListTitle}>
                      {(() => {
                        const date = new Date(selectedDate + 'T00:00:00');
                        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 미션`;
                      })()}
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
                              accessibilityLabel="미션 아이콘"
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

export default CalendarScreen;
