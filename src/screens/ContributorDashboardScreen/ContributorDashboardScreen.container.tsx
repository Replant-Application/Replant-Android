/**
 * ContributorDashboardScreen 비즈니스 로직
 * 기여자 통계, 상담 요청 관리, 채팅 세션 관리
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';

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

interface ContributorDashboardScreenContainerProps {
  navigation: any;
}

export const useContributorDashboardScreenContainer = ({
  navigation,
}: ContributorDashboardScreenContainerProps) => {
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

  /**
   * 대시보드 데이터 로드
   * - 통계 데이터 로드
   * - 대기 중인 상담 요청 로드
   * - 진행 중인 채팅 세션 로드
   * - 실제로는 API 호출이 필요하지만 현재는 mock 데이터 사용
   */
  const loadDashboardData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  /**
   * 상담 요청 수락
   * - 확인 Alert 표시
   * - 요청 상태를 in_progress로 변경
   * - 채팅방 생성 알림
   */
  const handleAcceptRequest = useCallback((requestId: string) => {
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
  }, []);

  /**
   * 자료실 모달 열기
   */
  const openResourceModal = useCallback(() => {
    setShowResourceModal(true);
  }, []);

  /**
   * 자료실 모달 닫기
   */
  const closeResourceModal = useCallback(() => {
    setShowResourceModal(false);
  }, []);

  /**
   * 채팅 세션 클릭
   */
  const handleSessionPress = useCallback((session: ChatSession) => {
    Alert.alert('채팅', `${session.userName}님과의 채팅으로 이동합니다.`);
  }, []);

  /**
   * Q&A 답변하기 화면으로 이동
   */
  const handleGoToQnA = useCallback(() => {
    navigation.navigate('Community');
  }, [navigation]);

  /**
   * 정보 공유 화면으로 이동
   */
  const handleGoToShareInfo = useCallback(() => {
    navigation.navigate('CommunityPostCreate' as any, {
      type: 'GENERAL',
      missionId: '',
      missionTitle: '정보 공유',
      missionEmoji: '📝',
    });
  }, [navigation]);

  /**
   * 상담 일지 열기
   */
  const handleOpenCounselingJournal = useCallback(() => {
    Alert.alert('알림', '상담 일지 기능은 준비 중입니다.');
  }, []);

  /**
   * 활동 보고서 열기
   */
  const handleOpenActivityReport = useCallback(() => {
    Alert.alert('알림', '활동 보고서 기능은 준비 중입니다.');
  }, []);

  /**
   * 긴급도 색상 가져오기
   */
  const getUrgencyColor = useCallback((urgency: string) => {
    switch (urgency) {
      case 'high':
        return '#EF4444'; // colors.error[500]
      case 'medium':
        return '#F59E0B'; // colors.warning[500]
      default:
        return '#6B7280'; // colors.gray[500]
    }
  }, []);

  /**
   * 긴급도 라벨 가져오기
   */
  const getUrgencyLabel = useCallback((urgency: string) => {
    switch (urgency) {
      case 'high':
        return '긴급';
      case 'medium':
        return '보통';
      default:
        return '낮음';
    }
  }, []);

  /**
   * 대기 중인 요청 필터링
   */
  const filteredPendingRequests = pendingRequests.filter(r => r.status === 'pending');

  return {
    loading,
    stats,
    pendingRequests: filteredPendingRequests,
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
  };
};
