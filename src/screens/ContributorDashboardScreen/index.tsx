/**
 * 기여자 대시보드 화면
 * - 기여자(CONTRIBUTOR) 역할을 가진 사용자 전용 화면
 * - 심리학과 학생, 전문 상담사 등이 유저를 도와주는 기능
 * - 상담 요청 관리, 활동 통계, 전문 자료 제공
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { Card, Header, Loading, SectionTitle } from '../../components/ui';
import { spacing } from '../../utils/designTokens';
import { RootStackParamList } from '../../types/navigation';
import { useUser } from '../../contexts/UserContext';
import { useContributorDashboardScreenContainer } from './ContributorDashboardScreen.container';
import { styles } from './ContributorDashboardScreen.styles';

interface ContributorDashboardScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const ContributorDashboardScreen: React.FC<ContributorDashboardScreenProps> = ({ navigation }) => {
  const { user } = useUser();

  // 비즈니스 로직은 Container에서 처리
  const {
    loading,
    stats,
    pendingRequests,
    activeSessions,
    showResourceModal,
    handleAcceptRequest,
    openResourceModal,
    closeResourceModal,
    handleSessionPress,
    handleGoToQnA,
    handleGoToShareInfo,
    handleOpenCounselingJournal,
    handleOpenActivityReport,
    getUrgencyColor,
    getUrgencyLabel,
  } = useContributorDashboardScreenContainer({ navigation });

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="기여자 대시보드" navigation={navigation} />
        <Loading text="정보를 불러오는 중..." />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Header title="기여자 대시보드" navigation={navigation} />

      <View style={styles.content}>
        {/* 환영 배너 */}
        <Card style={styles.welcomeBanner}>
          <View style={styles.bannerContent}>
            <Text style={styles.welcomeEmoji}>🤝</Text>
            <View style={styles.bannerText}>
              <Text style={styles.welcomeTitle}>안녕하세요, {user?.nickname}님</Text>
              <Text style={styles.welcomeSubtitle}>
                오늘도 따뜻한 마음으로 도움을 주셔서 감사합니다
              </Text>
            </View>
          </View>
        </Card>

        {/* 활동 통계 */}
        <Card style={styles.statsCard}>
          <SectionTitle title="나의 기여 활동" size="lg" marginBottom={spacing[4]} />
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalSupportedUsers}</Text>
              <Text style={styles.statLabel}>도움 준 유저</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.activeChatRooms}</Text>
              <Text style={styles.statLabel}>진행 중 상담</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.answeredQuestions}</Text>
              <Text style={styles.statLabel}>답변 수</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.averageRating}</Text>
              <Text style={styles.statLabel}>평균 평점</Text>
            </View>
          </View>
          <View style={styles.totalHours}>
            <Text style={styles.totalHoursText}>
              총 {stats.totalHelpHours}시간의 도움을 주셨습니다
            </Text>
          </View>
        </Card>

        {/* 대기 중인 상담 요청 */}
        <Card style={styles.requestsCard}>
          <SectionTitle title="대기 중인 상담 요청" size="lg" marginBottom={spacing[4]} />
          {pendingRequests.length === 0 ? (
            <Text style={styles.emptyText}>현재 대기 중인 요청이 없습니다.</Text>
          ) : (
            pendingRequests.map(request => (
                <View key={request.id} style={styles.requestItem}>
                  <View style={styles.requestHeader}>
                    <View style={styles.requestUser}>
                      <Text style={styles.requestUserName}>@{request.userNickname}</Text>
                      <View
                        style={[
                          styles.urgencyBadge,
                          { backgroundColor: getUrgencyColor(request.urgency) + '20' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.urgencyText,
                            { color: getUrgencyColor(request.urgency) },
                          ]}
                        >
                          {getUrgencyLabel(request.urgency)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.requestTime}>{request.createdAt}</Text>
                  </View>
                  <Text style={styles.requestTopic}>{request.topic}</Text>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleAcceptRequest(request.id)}
                    accessibilityRole="button"
                    accessibilityLabel="상담 시작하기"
                  >
                    <Text style={styles.acceptButtonText}>상담 시작하기</Text>
                  </TouchableOpacity>
                </View>
              ))
          )}
        </Card>

        {/* 진행 중인 채팅 */}
        <Card style={styles.sessionsCard}>
          <SectionTitle title="진행 중인 상담" size="lg" marginBottom={spacing[4]} />
          {activeSessions.length === 0 ? (
            <Text style={styles.emptyText}>진행 중인 상담이 없습니다.</Text>
          ) : (
            activeSessions.map(session => (
              <TouchableOpacity
                key={session.id}
                style={styles.sessionItem}
                onPress={() => handleSessionPress(session)}
                accessibilityRole="button"
                accessibilityLabel={`${session.userName}와의 상담`}
              >
                <View style={styles.sessionAvatar}>
                  <Text style={styles.sessionAvatarText}>
                    {session.userName.charAt(0)}
                  </Text>
                </View>
                <View style={styles.sessionContent}>
                  <View style={styles.sessionHeader}>
                    <Text style={styles.sessionUserName}>{session.userName}</Text>
                    <Text style={styles.sessionTime}>{session.lastMessageTime}</Text>
                  </View>
                  <Text style={styles.sessionLastMessage} numberOfLines={1}>
                    {session.lastMessage}
                  </Text>
                </View>
                {session.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadCount}>{session.unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </Card>

        {/* 기여자 가이드 */}
        <Card style={styles.guideCard}>
          <SectionTitle title="기여자 가이드" size="lg" marginBottom={spacing[4]} />
          <View style={styles.guideList}>
            <View style={styles.guideItem}>
              <Text style={styles.guideIcon}>📋</Text>
              <View style={styles.guideContent}>
                <Text style={styles.guideTitle}>상담 윤리</Text>
                <Text style={styles.guideDescription}>
                  비밀유지, 경청, 존중의 원칙을 지켜주세요.
                </Text>
              </View>
            </View>
            <View style={styles.guideItem}>
              <Image
                source={require('../../assets/images/warning.png')}
                style={styles.guideIconImage}
                resizeMode="contain"
                accessibilityLabel="경고 아이콘"
              />
              <View style={styles.guideContent}>
                <Text style={styles.guideTitle}>위기 상황</Text>
                <Text style={styles.guideDescription}>
                  자해/자살 징후 발견 시 즉시 전문기관 연결
                </Text>
              </View>
            </View>
            <View style={styles.guideItem}>
              <Text style={styles.guideIcon}>📚</Text>
              <View style={styles.guideContent}>
                <Text style={styles.guideTitle}>자료실</Text>
                <Text style={styles.guideDescription}>
                  상담 기법 및 참고 자료 확인하기
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.resourceButton}
            onPress={openResourceModal}
            accessibilityRole="button"
            accessibilityLabel="상담 자료실 열기"
          >
            <Text style={styles.resourceButtonText}>상담 자료실 열기</Text>
          </TouchableOpacity>
        </Card>

        {/* 빠른 액션 */}
        <Card style={styles.actionsCard}>
          <SectionTitle title="빠른 액션" size="lg" marginBottom={spacing[4]} />
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleGoToQnA}
              accessibilityRole="button"
              accessibilityLabel="Q&A 답변"
            >
              <Image
                source={require('../../assets/images/say.png')}
                style={styles.actionIconImage}
                resizeMode="contain"
                accessibilityElementsHidden={true}
              />
              <Text style={styles.actionLabel}>Q&A 답변</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleGoToShareInfo}
              accessibilityRole="button"
              accessibilityLabel="정보 공유"
            >
              <Text style={styles.actionIcon}>📝</Text>
              <Text style={styles.actionLabel}>정보 공유</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleOpenCounselingJournal}
              accessibilityRole="button"
              accessibilityLabel="상담 일지"
            >
              <Text style={styles.actionIcon}>📓</Text>
              <Text style={styles.actionLabel}>상담 일지</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleOpenActivityReport}
              accessibilityRole="button"
              accessibilityLabel="활동 보고"
            >
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionLabel}>활동 보고</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* 긴급 연락처 */}
        <Card style={styles.emergencyCard}>
          <Text style={styles.emergencyTitle}>긴급 상황 시 연락처</Text>
          <Text style={styles.emergencyText}>
            자살예방상담전화: 1393 {'\n'}
            정신건강위기상담전화: 1577-0199 {'\n'}
            청소년상담전화: 1388
          </Text>
        </Card>
      </View>

      {/* 자료실 모달 */}
      <Modal visible={showResourceModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <SectionTitle title="상담 자료실" size="lg" marginBottom={spacing[4]} accessibilityRole="header" />

            <ScrollView style={styles.resourceList}>
              <TouchableOpacity style={styles.resourceItem} accessibilityRole="none" accessibilityLabel="동기면담 기법 가이드, 변화 동기를 이끌어내는 상담 기법">
                <Text style={styles.resourceIcon}>📖</Text>
                <View style={styles.resourceContent}>
                  <Text style={styles.resourceTitle}>동기면담 기법 가이드</Text>
                  <Text style={styles.resourceDesc}>변화 동기를 이끌어내는 상담 기법</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resourceItem} accessibilityRole="none" accessibilityLabel="경청과 공감 실습, 효과적인 경청 기술 연습">
                <Text style={styles.resourceIcon}>📋</Text>
                <View style={styles.resourceContent}>
                  <Text style={styles.resourceTitle}>경청과 공감 실습</Text>
                  <Text style={styles.resourceDesc}>효과적인 경청 기술 연습</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resourceItem} accessibilityRole="none" accessibilityLabel="위기 상황 대응 매뉴얼, 긴급 상황 판단 및 대응 방법">
                <Image
                  source={require('../../assets/images/warning.png')}
                  style={styles.resourceIconImage}
                  resizeMode="contain"
                  accessibilityElementsHidden={true}
                />
                <View style={styles.resourceContent}>
                  <Text style={styles.resourceTitle}>위기 상황 대응 매뉴얼</Text>
                  <Text style={styles.resourceDesc}>긴급 상황 판단 및 대응 방법</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resourceItem} accessibilityRole="none" accessibilityLabel="은둔형 외톨이 이해하기, 니트족 청년의 심리와 특성">
                <Text style={styles.resourceIcon}>🧠</Text>
                <View style={styles.resourceContent}>
                  <Text style={styles.resourceTitle}>은둔형 외톨이 이해하기</Text>
                  <Text style={styles.resourceDesc}>니트족 청년의 심리와 특성</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeResourceModal}
              accessibilityRole="button"
              accessibilityLabel="닫기"
            >
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default ContributorDashboardScreen;
