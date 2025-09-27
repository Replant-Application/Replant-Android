import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { useCharacter } from '../hooks/useCharacter';
import { useMission } from '../hooks/useMission';
import { CharacterCard, MissionCard } from '../components/specialized';
import { Card, Loading, ErrorBoundary, Header, EmptyState, SectionTitle } from '../components/ui';
import { colors, spacing, typography } from '../utils/designTokens';
import { RootStackParamList } from '../types/navigation';

interface HomeScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { representativeCharacter, loading: characterLoading, error: characterError } = useCharacter();
  const { missions, loading: missionLoading, error: missionError } = useMission();


  // 추천 미션 (카테고리 우선순위: 자기관리 → 소통관리 → 커리어관리)
  const recommendedMissions = missions
    .filter(mission => !mission.completed)
    .sort((a, b) => {
      // 카테고리 우선순위 정의
      const categoryPriority: Record<string, number> = {
        'self_management': 1,    // 자기관리 (최우선)
        'communication': 2,      // 소통관리 (두번째)
        'career': 3             // 커리어관리 (세번째)
      };

      const priorityA = categoryPriority[a.category_id as keyof typeof categoryPriority] || 999;
      const priorityB = categoryPriority[b.category_id as keyof typeof categoryPriority] || 999;

      // 카테고리 우선순위로 정렬
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // 같은 카테고리 내에서는 제목 순으로 정렬
      return a.title.localeCompare(b.title);
    })
    .slice(0, 3);


  // 미션 상세 보기 핸들러 (미션 페이지로 이동)
  const handleViewMissionDetails = (_missionId: string): void => {
    navigation.navigate('Mission');
  };

  // 캐릭터 상세 페이지로 이동
  const handleCharacterPress = (): void => {
    if (representativeCharacter) {
      navigation.navigate('CharacterDetail', { character: representativeCharacter });
    }
  };


  // 에러 처리
  if (characterError || missionError) {
    return <ErrorBoundary error={characterError || missionError || 'Unknown error'} />;
  }

  return (
    <ScrollView style={styles.container}>
      <Header />
      <View style={styles.content}>

        {/* 메인 캐릭터 표시 */}
        <View style={styles.characterSection}>
          <SectionTitle title="🌱 나의 캐릭터" />
          {characterLoading ? (
            <Loading text="캐릭터를 불러오는 중..." />
          ) : representativeCharacter ? (
            <CharacterCard
              character={representativeCharacter}
              onPress={handleCharacterPress}
              style={styles.characterCard}
            />
          ) : (
            <Card style={styles.emptyCharacterCard}>
              <Text style={styles.emptyCharacterText}>
                캐릭터를 불러올 수 없습니다.
              </Text>
            </Card>
          )}
        </View>

        {/* 추천 미션 */}
        <View style={styles.missionSection}>
          <SectionTitle title="🎯 추천 미션" />
          {missionLoading ? (
            <Loading text="미션을 불러오는 중..." />
          ) : recommendedMissions.length > 0 ? (
            recommendedMissions.map((mission) => (
              <MissionCard
                key={mission.mission_id}
                mission={mission}
                onViewDetails={handleViewMissionDetails}
                style={styles.missionCard}
                readonly={true}
              />
            ))
          ) : (
            <EmptyState
              icon="🎉"
              title="모든 미션을 완료했습니다!"
              description="새로운 미션이 곧 추가될 예정입니다."
            />
          )}
        </View>
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
  characterSection: {
    marginBottom: spacing[8],
  },
  missionSection: {
    marginBottom: spacing[8],
  },
  characterCard: {
    marginBottom: spacing[4],
  },
  emptyCharacterCard: {
    padding: spacing[6],
    alignItems: 'center',
  },
  emptyCharacterText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  missionCard: {
    marginBottom: spacing[3],
  },
});

export default HomeScreen;
