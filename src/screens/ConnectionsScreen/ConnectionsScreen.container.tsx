/**
 * ConnectionsScreen 비즈니스 로직
 * 추천 목록 로드, 추천 수락/거절, 채팅방 목록 로드
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { getRecommendations, acceptRecommendation, rejectRecommendation } from '../../api/recommendationApi';
import { SCREEN_NAMES } from '../../utils/constants';

interface ConnectionsScreenContainerProps {
  navigation: any;
}

type TabType = 'recommendations' | 'chats';

interface Recommendation {
  id: number;
  recommendedUser: {
    id: number;
    nickname: string;
    profileImg?: string;
    reantLevel?: number;
    reantStage?: string;
  };
  mission?: {
    id: number;
    title: string;
    type: string;
  };
  matchReason?: any;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  expiresAt: string;
  createdAt: string;
}

interface ChatRoom {
  id: number;
  otherUser: {
    id: number;
    nickname: string;
    profileImg?: string;
  };
  matchedMission?: {
    id: number;
    title: string;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  unreadCount: number;
  isActive: boolean;
  createdAt: string;
}

export const useConnectionsScreenContainer = ({
  navigation,
}: ConnectionsScreenContainerProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('recommendations');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * 데이터 로드
   * - 추천 목록 로드 (getRecommendations)
   * - 채팅방 목록 로드 (TODO: chatApi 구현 필요)
   */
  const fetchData = useCallback(async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [recResult] = await Promise.all([
        getRecommendations({ status: 'PENDING' }),
        // getChatRooms(), // TODO: chatApi 구현 필요
        Promise.resolve({ success: true, data: [] }), // 임시: 빈 배열 반환
      ]);
      const chatResult = { success: true, data: [] }; // TODO: chatApi 구현 필요

      if (recResult.success && recResult.data) {
        setRecommendations(recResult.data as any);
      }

      if (chatResult.success && chatResult.data) {
        setChatRooms(chatResult.data as any);
      }
    } catch (error) {
      console.error('데이터 조회 실패:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * 새로고침
   */
  const handleRefresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  /**
   * 탭 변경
   */
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  /**
   * 추천 수락
   * - acceptRecommendation API 호출
   * - 성공 시 Alert 표시 및 채팅 탭으로 이동
   */
  const handleAcceptRecommendation = useCallback(async (recommendationId: number) => {
    try {
      const result = await acceptRecommendation(recommendationId);
      if (result.success) {
        Alert.alert(
          '인연 수락!',
          '채팅방이 생성되었습니다. 이제 대화를 시작해보세요!',
          [
            {
              text: '채팅하기',
              onPress: () => {
                fetchData(true);
                setActiveTab('chats');
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('오류', '인연 수락에 실패했습니다.');
    }
  }, [fetchData]);

  /**
   * 추천 거절
   * - 확인 Alert 표시
   * - rejectRecommendation API 호출
   * - 목록에서 제거
   */
  const handleRejectRecommendation = useCallback(async (recommendationId: number) => {
    Alert.alert(
      '정말 거절하시겠어요?',
      '거절하면 이 추천은 사라집니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '거절',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await rejectRecommendation(recommendationId);
              if (result.success) {
                setRecommendations(prev =>
                  prev.filter(r => r.id !== recommendationId)
                );
              }
            } catch (error) {
              Alert.alert('오류', '거절에 실패했습니다.');
            }
          },
        },
      ]
    );
  }, []);

  /**
   * 채팅방 열기
   */
  const handleOpenChat = useCallback((roomId: number) => {
    navigation.navigate(SCREEN_NAMES.CHAT_ROOM as any, { roomId });
  }, [navigation]);

  /**
   * 추천 배지 개수
   */
  const recommendationBadge = useMemo(() => {
    return recommendations.length > 0 ? recommendations.length : undefined;
  }, [recommendations]);

  /**
   * 채팅 읽지 않은 메시지 총 개수
   */
  const chatUnreadCount = useMemo(() => {
    return chatRooms.reduce((sum, r) => sum + r.unreadCount, 0);
  }, [chatRooms]);

  /**
   * 채팅 배지 개수
   */
  const chatBadge = useMemo(() => {
    return chatUnreadCount > 0 ? chatUnreadCount : undefined;
  }, [chatUnreadCount]);

  return {
    activeTab,
    recommendations,
    chatRooms,
    loading,
    refreshing,
    recommendationBadge,
    chatBadge,
    handleRefresh,
    handleTabChange,
    handleAcceptRecommendation,
    handleRejectRecommendation,
    handleOpenChat,
  };
};
