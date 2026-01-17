import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ImageBackground, Image } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useCharacter } from '../../hooks/useCharacter';
import { CharacterCard } from '../../components/specialized';
import { Loading, ErrorBoundary, Header } from '../../components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { RootStackParamList } from '../../types/navigation';
import { formatDateKorean } from '../../utils/dateUtils';

interface MyPageScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const MyPageScreen: React.FC<MyPageScreenProps> = ({ navigation }) => {
  const { profile, loading, error } = useUserProfile();
  const { characters } = useCharacter();
  const currentCharacter = characters.length > 0 ? characters[0] : null;

  if (error) {
    return <ErrorBoundary error={error} />;
  }

  if (loading || !profile) {
    return (
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <ScrollView style={styles.scrollView}>
          <Header title="마이페이지" navigation={navigation} />
          <View style={styles.content}>
            <Loading text="프로필을 불러오는 중..." />
          </View>
        </ScrollView>
      </ImageBackground>
    );
  }


  // 통계 데이터 정규화 (그래프 표시용)
  const maxValue = Math.max(
    profile.stats.completedMissions,
    profile.stats.totalExperience / 100, // 경험치는 100으로 나눠서 스케일 조정
    profile.stats.diaryCount,
    profile.stats.postCount,
    1 // 0으로 나누기 방지
  );

  const statsData = [
    { label: '완료한 미션', value: profile.stats.completedMissions, color: colors.primary[500] },
    { label: '총 경험치', value: profile.stats.totalExperience / 100, displayValue: profile.stats.totalExperience.toLocaleString(), color: colors.green[500] },
    { label: '작성한 다이어리', value: profile.stats.diaryCount, color: colors.orange[500] },
    { label: '커뮤니티 게시글', value: profile.stats.postCount, color: colors.blue[500] },
  ];

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <ScrollView style={styles.scrollView}>
        <Header title="마이페이지" navigation={navigation} />
        <View style={styles.content}>
          {/* 프로필 섹션 */}
          <View style={styles.profileCard}>
            <View style={styles.sectionHeader}>
              <Image
                source={require('../../assets/images/boy.png')}
                style={styles.sectionIcon}
                resizeMode="contain"
                accessibilityLabel="프로필 아이콘"
              />
              <Text style={styles.sectionTitle}>프로필</Text>
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>닉네임</Text>
                <Text style={styles.profileValue}>{profile.nickname}</Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>가입일</Text>
                <Text style={styles.profileValue}>{formatDateKorean(profile.createdAt)}</Text>
              </View>
            </View>
          </View>

          {/* 캐릭터 섹션 */}
          {currentCharacter && (
            <View style={styles.characterCard}>
              <View style={styles.sectionHeader}>
                <Image
                  source={require('../../assets/images/clover.png')}
                  style={styles.sectionIcon}
                  resizeMode="contain"
                  accessibilityLabel="캐릭터 아이콘"
                />
                <Text style={styles.sectionTitle}>나의 캐릭터</Text>
              </View>
              <CharacterCard
                character={currentCharacter}
                onPress={() => {}}
                style={styles.characterCardInner}
              />
            </View>
          )}

          {/* 통계 섹션 */}
          <View style={styles.statsCard}>
            <View style={styles.sectionHeader}>
              <Image
                source={require('../../assets/images/search.png')}
                style={styles.sectionIcon}
                resizeMode="contain"
                accessibilityLabel="통계 아이콘"
              />
              <Text style={styles.sectionTitle}>통계</Text>
            </View>
            <View style={styles.statsContainer}>
              {statsData.map((stat, index) => {
                const percentage = maxValue > 0 ? (stat.value / maxValue) * 100 : 0;
                return (
                  <View key={index} style={styles.statItem}>
                    <View style={styles.statHeader}>
                      <Text style={styles.statLabel}>{stat.label}</Text>
                      <Text style={styles.statValue}>
                        {stat.displayValue || stat.value.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.barChartContainer}>
                      <View style={styles.barChartBackground}>
                        <View
                          style={[
                            styles.barChartFill,
                            {
                              width: `${percentage}%`,
                              backgroundColor: stat.color,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing[5],
    paddingBottom: spacing[20],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  sectionIcon: {
    width: 25,
    height: 25,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  profileCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: '#D4A574',
    ...shadows.lg,
  },
  profileInfo: {
    gap: spacing[3],
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  profileLabel: {
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
  profileValue: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  characterCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: '#D4A574',
    ...shadows.lg,
  },
  characterCardInner: {
    marginBottom: 0,
  },
  statsCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: '#D4A574',
    ...shadows.lg,
  },
  statsContainer: {
    gap: spacing[4],
  },
  statItem: {
    gap: spacing[2],
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  barChartContainer: {
    marginTop: spacing[1],
  },
  barChartBackground: {
    height: 12,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  barChartFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
});

export default MyPageScreen;
