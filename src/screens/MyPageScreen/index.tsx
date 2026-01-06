import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useCharacter } from '../../hooks/useCharacter';
import { CharacterCard } from '../../components/specialized';
import { Card, Loading, ErrorBoundary, Header, SectionTitle } from '../../components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { RootStackParamList } from '../../types/navigation';
import { Character } from '../../types';
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
      <ScrollView style={styles.container}>
        <Header />
        <View style={styles.content}>
          <Loading text="프로필을 불러오는 중..." />
        </View>
      </ScrollView>
    );
  }


  const handleCharacterPress = (character: Character): void => {
    navigation.navigate('CharacterDetail', { character });
  };

  return (
    <ScrollView style={styles.container}>
      <Header
        title="마이페이지"
        leftButton={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../../assets/images/left.png')}
              style={styles.backButtonIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        }
      />
      <View style={styles.content}>
        <Card style={styles.profileCard}>
          <SectionTitle title="👤 프로필" size="lg" marginBottom={spacing[4]} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileLabel}>닉네임</Text>
            <Text style={styles.profileValue}>{profile.nickname}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileLabel}>가입일</Text>
            <Text style={styles.profileValue}>{formatDateKorean(profile.createdAt)}</Text>
          </View>
        </Card>

        {currentCharacter && (
          <View style={styles.characterSection}>
            <SectionTitle title="🌱 나의 캐릭터" size="lg" marginBottom={spacing[4]} />
            <CharacterCard
              character={currentCharacter}
              onPress={handleCharacterPress}
              style={styles.characterCard}
            />
          </View>
        )}

        <Card style={styles.statsCard}>
          <SectionTitle title="📊 통계" size="lg" marginBottom={spacing[4]} />
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.stats.completedMissions}</Text>
              <Text style={styles.statLabel}>완료한 미션</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.stats.totalExperience.toLocaleString()}</Text>
              <Text style={styles.statLabel}>총 경험치</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.stats.diaryCount}</Text>
              <Text style={styles.statLabel}>작성한 다이어리</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.stats.postCount}</Text>
              <Text style={styles.statLabel}>커뮤니티 게시글</Text>
            </View>
            {profile.stats.badgeCount !== undefined && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profile.stats.badgeCount}</Text>
                <Text style={styles.statLabel}>보유 뱃지</Text>
              </View>
            )}
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
  backButtonIcon: {
    width: 24,
    height: 24,
    tintColor: colors.text.primary,
  },
  content: {
    padding: spacing[5],
  },
  profileCard: {
    marginBottom: spacing[6],
  },
  profileInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  profileLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  profileValue: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  characterSection: {
    marginBottom: spacing[6],
  },
  characterCard: {
    marginBottom: 0,
  },
  statsCard: {
    marginBottom: spacing[6],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[4],
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    ...shadows.base,
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
    marginBottom: spacing[2],
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
});

export default MyPageScreen;
