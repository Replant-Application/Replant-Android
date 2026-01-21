/**
 * 졸업자 화면
 * - 졸업자(GRADUATE) 역할을 가진 사용자 전용 화면
 * - 멘토링 활동, 커뮤니티 기여 현황, 졸업 뱃지 표시
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { Card, Header, Loading, SectionTitle } from '../../components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { Platform } from 'react-native';
import { RootStackParamList } from '../../types/navigation';
import { useUser } from '../../contexts/UserContext';

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

interface GraduateScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const GraduateScreen: React.FC<GraduateScreenProps> = ({ navigation }) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MentoringStats>({
    totalHelpedUsers: 0,
    answersGiven: 0,
    postsCreated: 0,
    likesReceived: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [graduationDate, setGraduationDate] = useState<string>('');

  useEffect(() => {
    loadGraduateData();
  }, []);

  const loadGraduateData = async () => {
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
  };

  const getActivityIcon = (type: string) => {
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
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="졸업자 공간" navigation={navigation} />
        <Loading text="정보를 불러오는 중..." />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Header title="졸업자 공간" navigation={navigation} />

      <View style={styles.content}>
        {/* 졸업 축하 배너 */}
        <Card style={styles.graduateBanner}>
          <View style={styles.bannerContent}>
            <Text style={styles.graduateBadge}>🎓</Text>
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>축하합니다, {user?.nickname}님!</Text>
              <Text style={styles.bannerSubtitle}>
                리플랜트 여정을 성공적으로 마치셨습니다
              </Text>
              <Text style={styles.graduationDate}>
                졸업일: {graduationDate}
              </Text>
            </View>
          </View>
        </Card>

        {/* 멘토링 활동 통계 */}
        <Card style={styles.statsCard}>
          <SectionTitle title="멘토링 활동" size="lg" marginBottom={spacing[4]} />
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalHelpedUsers}</Text>
              <Text style={styles.statLabel}>도움 준 유저</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.answersGiven}</Text>
              <Text style={styles.statLabel}>답변 수</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.postsCreated}</Text>
              <Text style={styles.statLabel}>작성 글</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.likesReceived}</Text>
              <Text style={styles.statLabel}>받은 좋아요</Text>
            </View>
          </View>
        </Card>

        {/* 졸업자 역할 안내 */}
        <Card style={styles.roleCard}>
          <SectionTitle title="졸업자의 역할" size="lg" marginBottom={spacing[4]} />
          <View style={styles.roleList}>
            <View style={styles.roleItem}>
              <Text style={styles.roleIcon}>🌱</Text>
              <View style={styles.roleContent}>
                <Text style={styles.roleTitle}>멘토링</Text>
                <Text style={styles.roleDescription}>
                  새로운 유저들의 미션 수행을 도와주세요.
                  Q&A에 답변하고 경험을 공유해주세요.
                </Text>
              </View>
            </View>
            <View style={styles.roleItem}>
              <Image
                source={require('../../assets/images/light.png')}
                style={styles.roleIconImage}
                resizeMode="contain"
                accessibilityLabel="역할 아이콘"
              />
              <View style={styles.roleContent}>
                <Text style={styles.roleTitle}>경험 공유</Text>
                <Text style={styles.roleDescription}>
                  미션 수행 팁과 성장 경험을 커뮤니티에 공유해주세요.
                  당신의 이야기가 다른 이들에게 힘이 됩니다.
                </Text>
              </View>
            </View>
            <View style={styles.roleItem}>
              <Text style={styles.roleIcon}>🤝</Text>
              <View style={styles.roleContent}>
                <Text style={styles.roleTitle}>응원</Text>
                <Text style={styles.roleDescription}>
                  어려움을 겪는 유저들에게 응원과 격려를 보내주세요.
                  따뜻한 말 한마디가 큰 힘이 됩니다.
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* 최근 활동 */}
        <Card style={styles.activityCard}>
          <SectionTitle title="최근 멘토링 활동" size="lg" marginBottom={spacing[4]} />
          {recentActivities.length === 0 ? (
            <Text style={styles.emptyText}>아직 멘토링 활동이 없습니다.</Text>
          ) : (
            recentActivities.map(activity => (
              <View key={activity.id} style={styles.activityItem}>
                {typeof getActivityIcon(activity.type) === 'string' ? (
                  <Text style={styles.activityIcon}>
                    {getActivityIcon(activity.type) as string}
                  </Text>
                ) : (
                  <Image
                    source={getActivityIcon(activity.type) as any}
                    style={styles.activityIconImage}
                    resizeMode="contain"
                    accessibilityLabel="활동 아이콘"
                  />
                )}
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDate}>
                    {activity.date}
                    {activity.targetUser && ` • @${activity.targetUser}`}
                  </Text>
                </View>
              </View>
            ))
          )}
        </Card>

        {/* 빠른 액션 */}
        <Card style={styles.actionsCard}>
          <SectionTitle title="멘토링 시작하기" size="lg" marginBottom={spacing[4]} />
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Community')}
          >
            <Image
              source={require('../../assets/images/say.png')}
              style={styles.actionIconImage}
              resizeMode="contain"
              accessibilityLabel="댓글 아이콘"
            />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Q&A 답변하기</Text>
              <Text style={styles.actionDescription}>
                도움이 필요한 질문에 답변해주세요
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('CommunityPostCreate', {
              type: 'GENERAL', // 일반 게시글 타입
              missionTitle: '경험담 공유',
              missionEmoji: '📝',
            })}
          >
            <Text style={styles.actionIcon}>📝</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>경험담 공유하기</Text>
              <Text style={styles.actionDescription}>
                미션 수행 팁이나 성장 경험을 공유해주세요
              </Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* 졸업자 뱃지 */}
        <Card style={styles.badgeCard}>
          <View style={styles.badgeContent}>
            <View style={styles.badgeIcon}>
              <Text style={styles.badgeEmoji}>🎓</Text>
            </View>
            <Text style={styles.badgeTitle}>졸업자 뱃지</Text>
            <Text style={styles.badgeDescription}>
              리플랜트 여정을 완료한 당신은 영원한 졸업생입니다.
              이 뱃지는 당신의 성장과 노력을 증명합니다.
            </Text>
            <View style={styles.badgeStats}>
              <Text style={styles.badgeStatText}>
                전체 졸업생 중 상위 {Math.floor(Math.random() * 10 + 1)}%
              </Text>
            </View>
          </View>
        </Card>
      </View>
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
  graduateBanner: {
    backgroundColor: colors.primary[50],
    marginBottom: spacing[6],
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  graduateBadge: {
    fontSize: 48,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[700],
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xl),
  },
  bannerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  graduationDate: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[500],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
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
    padding: spacing[4],
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
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  roleCard: {
    marginBottom: spacing[6],
  },
  roleList: {
    gap: spacing[4],
  },
  roleItem: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  roleIcon: {
    fontSize: 28,
    width: 40,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  roleIconImage: {
    width: 28,
    height: 28,
  },
  roleContent: {
    flex: 1,
  },
  roleTitle: {
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
  roleDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  activityCard: {
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
  activityIconImage: {
    width: 20,
    height: 20,
  },
  activityItem: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  activityIcon: {
    fontSize: 20,
    width: 30,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  activityDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  actionsCard: {
    marginBottom: spacing[6],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[4],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing[3],
    ...shadows.sm,
  },
  actionIcon: {
    fontSize: 24,
    width: 40,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  actionIconImage: {
    width: 24,
    height: 24,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
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
  actionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  badgeCard: {
    marginBottom: spacing[6],
    backgroundColor: colors.primary[600],
  },
  badgeContent: {
    alignItems: 'center',
    padding: spacing[4],
  },
  badgeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
    ...shadows.lg,
  },
  badgeEmoji: {
    fontSize: 40,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  badgeTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.inverse,
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xl),
  },
  badgeDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[100],
    textAlign: 'center',
    marginBottom: spacing[4],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  badgeStats: {
    backgroundColor: colors.primary[700],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
  },
  badgeStatText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[200],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
});

export default GraduateScreen;
