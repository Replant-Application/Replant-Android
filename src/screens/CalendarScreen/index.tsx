import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, Platform, Image, ImageBackground } from 'react-native';
import { useCalendar } from '../../hooks/useCalendar';
import { useMission } from '../../hooks/useMission';
import { Card, ErrorBoundary, Header, Button } from '../../components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { CalendarEventData, Mission } from '../../types';
import { formatDateKorean, formatDateYYYYMMDD } from '../../utils/dateUtils';

interface CalendarScreenProps {
  navigation?: {
    goBack?: () => void;
  };
}

const CalendarScreen: React.FC<CalendarScreenProps> = ({ navigation }) => {
  const { error, addEvent, updateEvent, deleteEvent, getEventsByDate } = useCalendar();
  const { missions } = useMission();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(formatDateYYYYMMDD(today));
  const [showEventModal, setShowEventModal] = useState(false);
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<{ id: string; data: CalendarEventData } | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventTime, setEventTime] = useState('');

  // 완료된 미션을 날짜별로 그룹화
  const missionsByDate = useMemo(() => {
    const grouped: Record<string, Mission[]> = {};
    missions.forEach(mission => {
      if (mission.completed && mission.completed_at) {
        const date = mission.completed_at.split('T')[0];
        if (date) {
          if (!grouped[date]) {
            grouped[date] = [];
          }
          grouped[date].push(mission);
        }
      }
    });
    return grouped;
  }, [missions]);

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
    const dayMissions = missionsByDate[dateString] || [];
    if (dayMissions.length >= 3) {
      setShowMissionModal(true);
    }
  };

  // 시간 포맷팅
  const formatTime = (timeString?: string): string => {
    if (!timeString) return '';
    return timeString;
  };

  // 이벤트 모달 열기
  const openEventModal = (date?: string, event?: { id: string; data: CalendarEventData }) => {
    const dateToSet = date || selectedDate || '';
    setSelectedDate(dateToSet);
    if (event) {
      setEditingEvent(event);
      setEventTitle(event.data.title || '');
      setEventDescription(event.data.description || '');
      setEventTime(event.data.time || '');
    } else {
      setEditingEvent(null);
      setEventTitle('');
      setEventDescription('');
      setEventTime('');
    }
    setShowEventModal(true);
  };

  // 이벤트 모달 닫기
  const closeEventModal = () => {
    setShowEventModal(false);
    setEditingEvent(null);
    setEventTitle('');
    setEventDescription('');
    setEventTime('');
  };

  // 이벤트 저장
  const handleSaveEvent = async () => {
    if (!eventTitle.trim()) {
      Alert.alert('오류', '제목을 입력해주세요.');
      return;
    }

    try {
      const eventData: CalendarEventData = {
        title: eventTitle.trim(),
        description: eventDescription.trim() || undefined,
        date: selectedDate,
        time: eventTime.trim() || undefined,
      };

      if (editingEvent) {
        const result = await updateEvent(editingEvent.id, eventData);
        if (result.success) {
          Alert.alert('완료', '이벤트가 수정되었습니다.');
          closeEventModal();
        } else {
          Alert.alert('오류', result.error || '이벤트 수정에 실패했습니다.');
        }
      } else {
        const result = await addEvent(eventData);
        if (result.success) {
          Alert.alert('완료', '이벤트가 추가되었습니다.');
          closeEventModal();
        } else {
          Alert.alert('오류', result.error || '이벤트 추가에 실패했습니다.');
        }
      }
    } catch (saveError) {
      Alert.alert('오류', '이벤트 저장에 실패했습니다.');
    }
  };

  // 이벤트 삭제
  const handleDeleteEvent = (eventId: string) => {
    Alert.alert(
      '이벤트 삭제',
      '정말로 이 이벤트를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteEvent(eventId);
            if (result.success) {
              Alert.alert('완료', '이벤트가 삭제되었습니다.');
            } else {
              Alert.alert('오류', result.error || '이벤트 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  // 선택된 날짜의 이벤트
  const dayEvents = selectedDate ? getEventsByDate(selectedDate) : [];
  const selectedDayMissions = selectedDate ? missionsByDate[selectedDate] || [] : [];

  // 에러 처리
  if (error) {
    return <ErrorBoundary error={error} />;
  }

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
                          {dayMissionsForDate.slice(0, 2).map((mission, idx) => (
                            <View
                              key={mission.id}
                              style={[
                                styles.missionIndicator,
                                { backgroundColor: getMissionColor(mission, idx) },
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
                      {formatDateKorean(selectedDate, true)} 완료한 미션
                    </Text>
                    <TouchableOpacity
                      style={styles.addButtonSmall}
                      onPress={() => openEventModal(selectedDate)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.addButtonDot} />
                    </TouchableOpacity>
                  </View>
                  {selectedDayMissions.length > 0 && (
                    <>
                      {selectedDayMissions.map((mission) => (
                        <View key={mission.id} style={styles.missionItem}>
                          <Image
                            source={require('../../assets/images/goal.png')}
                            style={styles.missionIcon}
                            resizeMode="contain"
                          />
                          <View style={styles.missionContent}>
                            <Text style={styles.missionTitle}>{mission.title}</Text>
                            {mission.description && (
                              <Text style={styles.missionDescription}>{mission.description}</Text>
                            )}
                          </View>
                        </View>
                      ))}
                    </>
                  )}
                </View>
              )}

              {/* 선택된 날짜의 이벤트 목록 */}
              {selectedDate && dayEvents.length > 0 && (
                <View style={styles.eventsListContainer}>
                  <View style={styles.missionsListHeader}>
                    <Image
                      source={require('../../assets/images/clip.png')}
                      style={styles.missionsListIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.missionsListTitle}>이벤트</Text>
                  </View>
                  {dayEvents.map((event) => (
                    <View key={event.id} style={styles.eventItem}>
                      <View style={styles.eventContent}>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        {event.description && (
                          <Text style={styles.eventDescription}>{event.description}</Text>
                        )}
                        {event.time && (
                          <Text style={styles.eventTime}>⏰ {formatTime(event.time)}</Text>
                        )}
                      </View>
                      <View style={styles.eventActions}>
                        <TouchableOpacity
                          style={styles.eventActionButton}
                          onPress={() =>
                            openEventModal(selectedDate, {
                              id: event.id,
                              data: {
                                title: event.title,
                                description: event.description,
                                date: event.date,
                                time: event.time,
                              },
                            })
                          }
                        >
                          <Text style={styles.eventActionText}>✏️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.eventActionButton}
                          onPress={() => handleDeleteEvent(event.id)}
                        >
                          <Text style={styles.eventActionText}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* 빈 상태 메시지 */}
              {selectedDate && selectedDayMissions.length === 0 && dayEvents.length === 0 && (
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyText}>이 날짜에는 미션과 이벤트가 없습니다.</Text>
                </View>
              )}
            </Card>
          </View>
        </ScrollView>

        {/* 이벤트 추가/수정 모달 */}
        <Modal
          visible={showEventModal}
          animationType="slide"
          transparent={true}
          onRequestClose={closeEventModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editingEvent ? '이벤트 수정' : '이벤트 추가'}
              </Text>
              <Text style={styles.modalDate}>{formatDateKorean(selectedDate, true)}</Text>

              <TextInput
                style={styles.input}
                placeholder="제목 *"
                value={eventTitle}
                onChangeText={setEventTitle}
                placeholderTextColor={colors.text.secondary}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="설명 (선택사항)"
                value={eventDescription}
                onChangeText={setEventDescription}
                multiline
                numberOfLines={4}
                placeholderTextColor={colors.text.secondary}
              />

              <TextInput
                style={styles.input}
                placeholder="시간 (예: 14:30)"
                value={eventTime}
                onChangeText={setEventTime}
                placeholderTextColor={colors.text.secondary}
              />

              <View style={styles.modalActions}>
                <Button
                  title="취소"
                  onPress={closeEventModal}
                  variant="outline"
                  style={styles.modalButton}
                />
                <Button
                  title={editingEvent ? '수정' : '추가'}
                  onPress={handleSaveEvent}
                  style={styles.modalButton}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* 미션 목록 모달 (3개 이상일 때) */}
        <Modal
          visible={showMissionModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowMissionModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {formatDateKorean(selectedDate, true)} 완료한 미션
              </Text>
              <ScrollView style={styles.missionModalList}>
                {selectedDayMissions.map((mission) => (
                  <View key={mission.id} style={styles.missionModalItem}>
                    <Image
                      source={require('../../assets/images/goal.png')}
                      style={styles.missionModalIcon}
                      resizeMode="contain"
                    />
                    <View style={styles.missionModalContent}>
                      <Text style={styles.missionModalTitle}>{mission.title}</Text>
                      {mission.description && (
                        <Text style={styles.missionModalDescription}>{mission.description}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </ScrollView>
              <Button
                title="닫기"
                onPress={() => setShowMissionModal(false)}
                style={styles.modalButton}
              />
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
};

// 미션 색상 생성 함수
const getMissionColor = (mission: Mission, index: number): string => {
  const missionColors: string[] = ['#FFE066', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181', '#A8E6CF', '#FFD3A5'];
  const hash = mission.id.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
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
  backButtonIcon: {
    width: 24,
    height: 24,
  },
  addButtonSmall: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary[500],
  },
  eventsListContainer: {
    marginTop: spacing[4],
    paddingTop: spacing[4],
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
  sectionSubtitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.primary,
    marginBottom: spacing[3],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
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
  missionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.primary,
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  missionDescription: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  eventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    marginBottom: spacing[3],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    ...shadows.base,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  eventDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  eventTime: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  eventActions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  eventActionButton: {
    padding: spacing[2],
  },
  eventActionText: {
    fontSize: typography.fontSize.lg,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    ...shadows.lg,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xl),
  },
  modalDate: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing[4],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.base,
    padding: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
    marginBottom: spacing[3],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    textAlignVertical: 'top',
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[4],
  },
  modalButton: {
    flex: 1,
  },
  missionModalList: {
    maxHeight: 400,
    marginBottom: spacing[4],
  },
  missionModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    marginBottom: spacing[2],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
  },
  missionModalIcon: {
    width: 24,
    height: 24,
    marginRight: spacing[3],
  },
  missionModalContent: {
    flex: 1,
  },
  missionModalTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.primary,
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  missionModalDescription: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
});

export default CalendarScreen;
