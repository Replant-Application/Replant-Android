/**
 * 졸업자 화면
 * - 졸업자(GRADUATE) 역할을 가진 사용자 전용 화면
 * - 멘토링 활동, 커뮤니티 기여 현황, 졸업 배지 표시
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { Card, Header, Loading, SectionTitle } from '../../components/ui';
import { spacing } from '../../utils/designTokens';
import { RootStackParamList } from '../../types/navigation';
import { useUser } from '../../contexts/UserContext';
import { useGraduateScreenContainer } from './GraduateScreen.container';
import { styles } from './GraduateScreen.styles';

interface GraduateScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const GraduateScreen: React.FC<GraduateScreenProps> = ({ navigation }) => {
  const { user } = useUser();

  // 비즈니스 로직은 Container에서 처리
  const {
    loading,
    stats,
    recentActivities,
    graduationDate,
    getActivityIcon,
    handleGoToQnA,
    handleGoToShareExperience,
  } = useGraduateScreenContainer({ navigation });

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
            onPress={handleGoToQnA}
            accessibilityRole="button"
            accessibilityLabel="Q&A 답변하기"
          >
            <Image
              source={require('../../assets/images/say.png')}
              style={styles.actionIconImage}
              resizeMode="contain"
              accessibilityElementsHidden={true}
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
            onPress={handleGoToShareExperience}
            accessibilityRole="button"
            accessibilityLabel="경험담 공유하기"
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

        {/* 졸업자 배지 */}
        <Card style={styles.badgeCard}>
          <View style={styles.badgeContent}>
            <View style={styles.badgeIcon}>
              <Text style={styles.badgeEmoji}>🎓</Text>
            </View>
            <Text style={styles.badgeTitle}>졸업자 배지</Text>
            <Text style={styles.badgeDescription}>
              리플랜트 여정을 완료한 당신은 영원한 졸업생입니다.
              이 배지는 당신의 성장과 노력을 증명합니다.
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

export default GraduateScreen;
