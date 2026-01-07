/**
 * 기여자 대시보드 화면
 * - 기여자(CONTRIBUTOR) 역할을 가진 사용자 전용 화면
 * - 심리학과 학생, 전문 상담사 등이 유저를 도와주는 기능
 * - 상담 요청 관리, 활동 통계, 전문 자료 제공
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
  Image,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { Card, Header, Loading, SectionTitle } from '../../components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { RootStackParamList } from '../../types/navigation';
import { useUser } from '../../contexts/UserContext';

interface ContributorStats {
  totalSupportedUsers: number;
  activeChatRooms: number;
  answeredQuestions: number;
  averageRating: number;
  totalHelpHours: number;
}

interface SupportRequest {
  id: string;
  userId: string;
  userNickname: string;
  topic: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  urgency: 'low' | 'medium' | 'high';
}

interface ChatSession {
  id: string;
  userName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface ContributorDashboardScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const ContributorDashboardScreen: React.FC<ContributorDashboardScreenProps> = ({ navigation }) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ContributorStats>({
    totalSupportedUsers: 0,
    activeChatRooms: 0,
    answeredQuestions: 0,
    averageRating: 0,
    totalHelpHours: 0,
  });
  const [pendingRequests, setPendingRequests] = useState<SupportRequest[]>([]);
  const [activeSessions, setActiveSessions] = useState<ChatSession[]>([]);
  const [showResourceModal, setShowResourceModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 임시 데이터 - 실제로는 API 호출
      setStats({
        totalSupportedUsers: 45,
        activeChatRooms: 3,
        answeredQuestions: 128,
        averageRating: 4.8,
        totalHelpHours: 67,
      });

      setPendingRequests([
        {
          id: '1',
          userId: 'user1',
          userNickname: '희망찬새벽',
          topic: '미션 동기부여가 어려워요',
          status: 'pending',
          createdAt: '2024-12-21 10:30',
          urgency: 'medium',
        },
        {
          id: '2',
          userId: 'user2',
          userNickname: '새로운시작',
          topic: '사회활동 시작이 두려워요',
          status: 'pending',
          createdAt: '2024-12-21 09:15',
          urgency: 'high',
        },
        {
          id: '3',
          userId: 'user3',
          userNickname: '조용한관찰자',
          topic: '미션 선택에 대한 조언',
          status: 'pending',
          createdAt: '2024-12-20 18:45',
          urgency: 'low',
        },
      ]);

      setActiveSessions([
        {
          id: 'chat1',
          userName: '용기있는발걸음',
          lastMessage: '네, 오늘은 산책 미션 도전해볼게요!',
          lastMessageTime: '10분 전',
          unreadCount: 0,
        },
        {
          id: 'chat2',
          userName: '밝은미래',
          lastMessage: '상담사님 조언 덕분에 용기가 났어요',
          lastMessageTime: '1시간 전',
          unreadCount: 2,
        },
      ]);
    } catch (error) {
      console.error('Failed to load contributor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = (requestId: string) => {
    Alert.alert(
      '상담 수락',
      '이 상담 요청을 수락하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '수락',
          onPress: () => {
            setPendingRequests(prev =>
              prev.map(r =>
                r.id === requestId ? { ...r, status: 'in_progress' as const } : r
              )
            );
            Alert.alert('완료', '상담이 시작되었습니다. 채팅방이 생성됩니다.');
          },
        },
      ]
    );
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return colors.error[500];
      case 'medium':
        return colors.warning[500];
      default:
        return colors.gray[500];
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return '긴급';
      case 'medium':
        return '보통';
      default:
        return '낮음';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="기여자 대시보드" />
        <Loading text="정보를 불러오는 중..." />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Header title="기여자 대시보드" />

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
          {pendingRequests.filter(r => r.status === 'pending').length === 0 ? (
            <Text style={styles.emptyText}>현재 대기 중인 요청이 없습니다.</Text>
          ) : (
            pendingRequests
              .filter(r => r.status === 'pending')
              .map(request => (
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
                onPress={() => {
                  // 채팅 화면으로 이동
                  Alert.alert('채팅', `${session.userName}님과의 채팅으로 이동합니다.`);
                }}
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
            onPress={() => setShowResourceModal(true)}
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
              onPress={() => navigation.navigate('Community')}
            >
              <Image
                source={require('../../assets/images/say.png')}
                style={styles.actionIconImage}
                resizeMode="contain"
              />
              <Text style={styles.actionLabel}>Q&A 답변</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate('CommunityPostCreate' as any, {
                missionId: '',
                missionTitle: '정보 공유',
                missionEmoji: '📝',
              })}
            >
              <Text style={styles.actionIcon}>📝</Text>
              <Text style={styles.actionLabel}>정보 공유</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                Alert.alert('알림', '상담 일지 기능은 준비 중입니다.');
              }}
            >
              <Text style={styles.actionIcon}>📓</Text>
              <Text style={styles.actionLabel}>상담 일지</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                Alert.alert('알림', '활동 보고서 기능은 준비 중입니다.');
              }}
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
            <SectionTitle title="상담 자료실" size="lg" marginBottom={spacing[4]} />

            <ScrollView style={styles.resourceList}>
              <TouchableOpacity style={styles.resourceItem}>
                <Text style={styles.resourceIcon}>📖</Text>
                <View style={styles.resourceContent}>
                  <Text style={styles.resourceTitle}>동기면담 기법 가이드</Text>
                  <Text style={styles.resourceDesc}>변화 동기를 이끌어내는 상담 기법</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resourceItem}>
                <Text style={styles.resourceIcon}>📋</Text>
                <View style={styles.resourceContent}>
                  <Text style={styles.resourceTitle}>경청과 공감 실습</Text>
                  <Text style={styles.resourceDesc}>효과적인 경청 기술 연습</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resourceItem}>
                <Image
                  source={require('../../assets/images/warning.png')}
                  style={styles.resourceIconImage}
                  resizeMode="contain"
                />
                <View style={styles.resourceContent}>
                  <Text style={styles.resourceTitle}>위기 상황 대응 매뉴얼</Text>
                  <Text style={styles.resourceDesc}>긴급 상황 판단 및 대응 방법</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resourceItem}>
                <Text style={styles.resourceIcon}>🧠</Text>
                <View style={styles.resourceContent}>
                  <Text style={styles.resourceTitle}>쉬었음 청년 이해하기</Text>
                  <Text style={styles.resourceDesc}>니트족 청년의 심리와 특성</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowResourceModal(false)}
            >
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    padding: spacing[5],
  },
  welcomeBanner: {
    backgroundColor: colors.primary[50],
    marginBottom: spacing[6],
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  welcomeEmoji: {
    fontSize: 40,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  bannerText: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[700],
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  welcomeSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  statsCard: {
    marginBottom: spacing[6],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: spacing[3],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[600],
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize['2xl']),
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  totalHours: {
    marginTop: spacing[4],
    padding: spacing[3],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  totalHoursText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[700],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  requestsCard: {
    marginBottom: spacing[6],
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
    textAlign: 'center',
    padding: spacing[4],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  requestItem: {
    padding: spacing[4],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing[3],
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[400],
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  requestUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  requestUserName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  urgencyBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  urgencyText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  requestTime: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  requestTopic: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    marginBottom: spacing[3],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  acceptButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  sessionsCard: {
    marginBottom: spacing[6],
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing[2],
    gap: spacing[3],
  },
  sessionAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionAvatarText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[600],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  sessionContent: {
    flex: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[1],
  },
  sessionUserName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  sessionTime: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  sessionLastMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.error[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadCount: {
    fontSize: typography.fontSize.xs,
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  guideCard: {
    marginBottom: spacing[6],
  },
  guideList: {
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  guideItem: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  guideIcon: {
    fontSize: 24,
    width: 32,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(24),
  },
  guideIconImage: {
    width: 24,
    height: 24,
  },
  guideContent: {
    flex: 1,
  },
  guideTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  guideDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  resourceButton: {
    backgroundColor: colors.primary[50],
    padding: spacing[3],
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  resourceButtonText: {
    color: colors.primary[600],
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  actionsCard: {
    marginBottom: spacing[6],
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  actionItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(24),
  },
  actionIconImage: {
    width: 24,
    height: 24,
    marginBottom: spacing[2],
  },
  actionLabel: {
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
  emergencyCard: {
    marginBottom: spacing[6],
    backgroundColor: colors.error[50],
    borderWidth: 1,
    borderColor: colors.error[200],
  },
  emergencyTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.error[700],
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  emergencyText: {
    fontSize: typography.fontSize.sm,
    color: colors.error[600],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing[5],
    maxHeight: '80%',
  },
  resourceList: {
    marginBottom: spacing[4],
  },
  resourceItem: {
    flexDirection: 'row',
    gap: spacing[3],
    padding: spacing[4],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing[3],
  },
  resourceIcon: {
    fontSize: 24,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
  },
  resourceIconImage: {
    width: 24,
    height: 24,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
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
  resourceDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  closeButton: {
    backgroundColor: colors.background.secondary,
    padding: spacing[4],
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  closeButtonText: {
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
});

export default ContributorDashboardScreen;
