import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, Platform } from 'react-native';
import { useCalendar } from '../../hooks/useCalendar';
import { Card, Loading, ErrorBoundary, Header, SectionTitle, Button, FAB } from '../../components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { CalendarEventData } from '../../types';
import { formatDateKorean } from '../../utils/dateUtils';

const CalendarScreen: React.FC = () => {
  const { loading, error, addEvent, updateEvent, deleteEvent, getEventsByDate } = useCalendar();
  const todayDateString = new Date().toISOString().split('T')[0] || '';
  const [selectedDate, setSelectedDate] = useState<string>(todayDateString);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<{ id: string; data: CalendarEventData } | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventTime, setEventTime] = useState('');

  // 에러 처리
  if (error) {
    return <ErrorBoundary error={error} />;
  }

  // 날짜 포맷팅 (formatDateKorean의 includeWeekday 옵션 사용)

  // 시간 포맷팅
  const formatTime = (timeString?: string): string => {
    if (!timeString) return '';
    return timeString;
  };

  // 이벤트 모달 열기
  const openEventModal = (date?: string, event?: { id: string; data: CalendarEventData }) => {
    const dateToSet = date || todayDateString || '';
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

  // 날짜 선택 UI (간단한 버전)
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toISOString().split('T')[0];
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowString = tomorrow.toISOString().split('T')[0];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Header />
        <View style={styles.content}>
          {/* 날짜 선택 */}
          <Card style={styles.dateCard}>
            <SectionTitle title="📅 날짜 선택" size="lg" marginBottom={spacing[4]} />
            <View style={styles.dateButtons}>
              <TouchableOpacity
                style={[styles.dateButton, selectedDate === yesterdayString && styles.dateButtonActive]}
                onPress={() => setSelectedDate(yesterdayString || '')}
              >
                <Text style={[styles.dateButtonText, selectedDate === yesterdayString && styles.dateButtonTextActive]}>
                  어제
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dateButton, selectedDate === todayString && styles.dateButtonActive]}
                onPress={() => setSelectedDate(todayString || '')}
              >
                <Text style={[styles.dateButtonText, selectedDate === todayString && styles.dateButtonTextActive]}>
                  오늘
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dateButton, selectedDate === tomorrowString && styles.dateButtonActive]}
                onPress={() => setSelectedDate(tomorrowString || '')}
              >
                <Text style={[styles.dateButtonText, selectedDate === tomorrowString && styles.dateButtonTextActive]}>
                  내일
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.selectedDateText}>{formatDateKorean(selectedDate, true)}</Text>
          </Card>

          {/* 선택된 날짜의 이벤트 */}
          <Card style={styles.eventsCard}>
            <SectionTitle title="📌 이벤트" size="lg" marginBottom={spacing[4]} />
            {loading ? (
              <Loading text="이벤트를 불러오는 중..." />
            ) : dayEvents.length > 0 ? (
              dayEvents.map((event) => (
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
                      onPress={() => openEventModal(selectedDate, { id: event.id, data: { title: event.title, description: event.description, date: event.date, time: event.time } })}
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
              ))
            ) : (
              <Text style={styles.emptyText}>이 날짜에는 이벤트가 없습니다.</Text>
            )}
          </Card>
        </View>
      </ScrollView>

      {/* 이벤트 추가 버튼 */}
      <FAB
        icon="➕"
        onPress={() => openEventModal(selectedDate)}
        style={styles.fab}
      />

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing[5],
  },
  dateCard: {
    marginBottom: spacing[6],
  },
  dateButtons: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  dateButton: {
    flex: 1,
    padding: spacing[3],
    borderRadius: borderRadius.base,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
  },
  dateButtonActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[400],
  },
  dateButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  dateButtonTextActive: {
    color: colors.primary[700],
    fontWeight: typography.fontWeight.bold,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  selectedDateText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  eventsCard: {
    marginBottom: spacing[6],
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
    fontWeight: typography.fontWeight.semibold,
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
  fab: {
    position: 'absolute',
    bottom: spacing[6],
    right: spacing[5],
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
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    ...shadows.lg,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
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
});

export default CalendarScreen;
