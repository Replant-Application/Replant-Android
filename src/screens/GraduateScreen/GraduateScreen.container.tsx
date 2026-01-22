/**
 * GraduateScreen 비즈니스 로직
 * 졸업자 통계 및 활동 내역 로드
 */

import { useState, useEffect, useCallback } from 'react';

interface MentoringStats {
  totalHelpedUsers: number;
  answersGiven: number;
  postsCreated: number;
  likesReceived: number;
}

interface RecentActivity {
  id: string;
  type: 'answer' | 'post' | 'comment';
  title: string;
  date: string;
  targetUser?: string;
}

interface GraduateScreenContainerProps {
  navigation: any;
}

export const useGraduateScreenContainer = ({
  navigation,
}: GraduateScreenContainerProps) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MentoringStats>({
    totalHelpedUsers: 0,
    answersGiven: 0,
    postsCreated: 0,
    likesReceived: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [graduationDate, setGraduationDate] = useState<string>('');

  /**
   * 졸업자 데이터 로드
   * - 통계 데이터 로드
   * - 최근 활동 내역 로드
   * - 졸업일 로드
   * - 실제로는 API 호출이 필요하지만 현재는 mock 데이터 사용
   */
  const loadGraduateData = useCallback(async () => {
    setLoading(true);
    try {
      // 임시 데이터 - 실제로는 API 호출
      setStats({
        totalHelpedUsers: 23,
        answersGiven: 47,
        postsCreated: 12,
        likesReceived: 156,
      });

      setRecentActivities([
        {
          id: '1',
          type: 'answer',
          title: '"아침 산책 미션 어떻게 시작하나요?"에 답변',
          date: '2024-12-20',
          targetUser: '새싹유저',
        },
        {
          id: '2',
          type: 'post',
          title: '미션 완료 팁: 꾸준함이 답이다',
          date: '2024-12-19',
        },
        {
          id: '3',
          type: 'comment',
          title: '"처음 시작하는 분들께" 글에 응원 댓글',
          date: '2024-12-18',
          targetUser: '희망찬하루',
        },
      ]);

      setGraduationDate('2024-11-15');
    } catch (error) {
      console.error('Failed to load graduate data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGraduateData();
  }, [loadGraduateData]);

  /**
   * 활동 아이콘 가져오기
   */
  const getActivityIcon = useCallback((type: string) => {
    switch (type) {
      case 'answer':
        return require('../../assets/images/say.png');
      case 'post':
        return '📝';
      case 'comment':
        return '💭';
      default:
        return '✨';
    }
  }, []);

  /**
   * Q&A 답변하기 화면으로 이동
   */
  const handleGoToQnA = useCallback(() => {
    navigation.navigate('Community');
  }, [navigation]);

  /**
   * 경험담 공유하기 화면으로 이동
   */
  const handleGoToShareExperience = useCallback(() => {
    navigation.navigate('CommunityPostCreate', {
      type: 'GENERAL',
      missionTitle: '경험담 공유',
      missionEmoji: '📝',
    });
  }, [navigation]);

  return {
    loading,
    stats,
    recentActivities,
    graduationDate,
    getActivityIcon,
    handleGoToQnA,
    handleGoToShareExperience,
  };
};
