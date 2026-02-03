import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ImageBackground, Modal, Pressable } from 'react-native';
import { Card, Header } from '../../components/ui';
import { SCREEN_NAMES } from '../../utils/constants';
import { formatDateYYYYMMDD } from '../../utils/dateUtils';
import CommunityPostDetailScreen from '../CommunityPostDetailScreen';
import { useCalendarScreenContainer } from './CalendarScreen.container';
import { styles } from './CalendarScreen.styles';

interface CalendarScreenProps {
  navigation?: {
    goBack?: () => void;
    navigate?: (screen: string, params?: object) => void;
  };
}

const CalendarScreen: React.FC<CalendarScreenProps> = ({ navigation }) => {
  const today = new Date();

  // 비즈니스 로직은 Container에서 처리
  const {
    currentMonth,
    currentYear,
    selectedDate,
    calendarDays,
    missionsByDate,
    selectedDayMissions,
    changeMonth,
    handleDatePress,
    selectedPostIdForModal,
    openPostInModal,
    closePostModal,
  } = useCalendarScreenContainer({ navigation });

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
      accessibilityElementsHidden={true}
    >
      <View style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <Header
            title="캘린더"
            navigation={navigation}
            leftButton={
              navigation?.goBack ? (
                <TouchableOpacity
                  onPress={() => navigation.goBack?.()}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="뒤로 가기"
                >
                  <Image
                    source={require('../../assets/images/left.png')}
                    style={styles.backButtonIcon}
                    resizeMode="contain"
                    accessibilityLabel="뒤로 가기"
                    accessibilityElementsHidden={true}
                  />
                </TouchableOpacity>
              ) : undefined
            }
          />
          <View style={styles.content}>
            {/* 캘린더 */}
            <Card style={styles.calendarCard}>
              <View style={styles.calendarHeader}>
                <TouchableOpacity
                  onPress={() => changeMonth('prev')}
                  style={styles.monthButton}
                  accessibilityRole="button"
                  accessibilityLabel="이전 달"
                >
                  <Text style={styles.monthButtonText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.monthYearText}>
                  {currentYear}년 {monthNames[currentMonth]}
                </Text>
                <TouchableOpacity
                  onPress={() => changeMonth('next')}
                  style={styles.monthButton}
                  accessibilityRole="button"
                  accessibilityLabel="다음 달"
                >
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
                      accessibilityRole="button"
                      accessibilityLabel={`${dateString}, 미션 ${missionCount}개${isSelected ? ', 선택됨' : ''}`}
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
                      {selectedDayMissions
                        .filter(userMission => !userMission.isSpontaneous && (userMission.mission || userMission.customMission))
                        .map((userMission, index) => {
                        const missionTitle = userMission.mission?.title || userMission.customMission?.title || '미션';
                        const isCompleted = userMission.status === 'COMPLETED';
                        const canOpenPost = isCompleted && userMission.verificationPostId != null && userMission.verificationPostId > 0;
                        const content = (
                          <View style={styles.missionItem}>
                            <Text style={styles.missionNumber}>{index + 1}.</Text>
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
                        if (canOpenPost) {
                          return (
                            <Pressable
                              key={userMission.id}
                              onPress={() => openPostInModal(userMission.verificationPostId!)}
                              style={({ pressed }) => [{ width: '100%', opacity: pressed ? 0.7 : 1 }]}
                              accessibilityRole="button"
                              accessibilityLabel={`${missionTitle}, 완료. 게시글 보기`}
                            >
                              {content}
                            </Pressable>
                          );
                        }
                        return <View key={userMission.id}>{content}</View>;
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

      {/* 게시글 상세 모달 (완료 미션 탭 시) - 하단 탭 바 노출 */}
      <Modal
        visible={selectedPostIdForModal != null}
        animationType="slide"
        onRequestClose={closePostModal}
      >
        {selectedPostIdForModal != null && (
          <View style={styles.modalPostDetailWrap}>
            <View style={styles.modalPostDetailContent}>
              <CommunityPostDetailScreen
                navigation={{
                  ...navigation,
                  goBack: closePostModal,
                } as any}
                route={{ params: { postId: String(selectedPostIdForModal) } } as any}
              />
            </View>
            {/* 모달 내 하단 탭 바: 탭 누르면 모달 닫고 해당 화면으로 이동 */}
            <View style={styles.modalTabBar}>
              {[
                { screen: SCREEN_NAMES.HOME, label: '홈', icon: require('../../assets/images/home.png') },
                { screen: SCREEN_NAMES.MISSION, label: '미션', icon: require('../../assets/images/goal.png') },
                { screen: SCREEN_NAMES.COMMUNITY, label: '커뮤니티', icon: require('../../assets/images/chat.png') },
                { screen: SCREEN_NAMES.DIARY, label: '감정일기', icon: require('../../assets/images/books.png') },
                { screen: SCREEN_NAMES.SETTINGS, label: '설정', icon: require('../../assets/images/settings.png') },
              ].map(({ screen, label, icon }) => (
                <TouchableOpacity
                  key={screen}
                  style={[styles.modalTab, screen === SCREEN_NAMES.DIARY && styles.modalTabActive]}
                  onPress={() => {
                    closePostModal();
                    (navigation as any)?.navigate?.(screen, screen === SCREEN_NAMES.COMMUNITY ? { activeTab: 'todo-share' } : undefined);
                  }}
                  activeOpacity={0.7}
                  accessibilityRole="tab"
                  accessibilityLabel={label}
                >
                  <Image
                    source={icon}
                    style={[styles.modalTabIcon, screen === SCREEN_NAMES.DIARY && styles.modalTabIconActive]}
                    resizeMode="contain"
                  />
                  <Text style={[styles.modalTabLabel, screen === SCREEN_NAMES.DIARY && styles.modalTabLabelActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </Modal>
    </ImageBackground>
  );
};

export default CalendarScreen;
