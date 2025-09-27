import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { useCharacter } from '../hooks/useCharacter';
import { useMission } from '../hooks/useMission';
import { CharacterCard, MissionCard } from '../components/specialized';
import { Card, Loading, ErrorBoundary, Header, EmptyState, SectionTitle } from '../components/ui';
import { colors, spacing, typography } from '../utils/designTokens';
// import { executeWithErrorHandling } from '../utils/errorHandler';
import { RootStackParamList } from '../types/navigation';

interface HomeScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { representativeCharacter, loading: characterLoading, error: characterError, addExperienceByCategory } = useCharacter();
  const { missions, loading: missionLoading, error: missionError } = useMission(addExperienceByCategory);


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

  // 미션 완료 핸들러 (현재 사용되지 않음)
  // const handleCompleteMission = async (missionId: string): Promise<void> => {
  //   const result = await executeWithErrorHandling(
  //     () => completeMissionWithPhoto(missionId, null),
  //     '미션 완료'
  //   );

  //   if (result.success) {
  //     // 성공 시 추가 처리 (예: 토스트 메시지)
  //   }
  // };

  // 미션 완료 취소 핸들러 (현재 사용되지 않음)
  // const handleUncompleteMission = async (missionId: string): Promise<void> => {
  //   const result = await executeWithErrorHandling(
  //     () => uncompleteMission(missionId),
  //     '미션 완료 취소'
  //   );

  //   if (result.success) {
  //     // 성공 시 추가 처리
  //   }
  // };

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


  // 캐릭터 로딩 중이면 로딩 화면 표시
  if (characterLoading) {
    return <Loading text="캐릭터를 불러오는 중..." />;
  }

  if (characterError || missionError) {
    return <ErrorBoundary error={characterError || missionError || 'Unknown error'} />;
  }

  // 미션 로딩 중이면 미션 부분만 로딩 표시
  if (missionLoading) {
  return (
    <ScrollView style={styles.container}>
      <Header />
      <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SectionTitle title="나의 캐릭터" />
          </View>
          {representativeCharacter ? (
            <CharacterCard
              character={representativeCharacter}
              onPress={handleCharacterPress}
            />
          ) : (
            <View style={styles.emptyCharacterCard}>
              <Text style={styles.emptyCharacterText}>캐릭터를 불러올 수 없습니다.</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SectionTitle title="추천 미션" />
          </View>
          <Loading text="미션을 불러오는 중..." />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Header />
      <View style={styles.content}>

        {/* 메인 캐릭터 표시 */}
        <View style={styles.characterSection}>
          <SectionTitle title="🌱 나의 캐릭터" />
          {characterLoading ? (
            <Card style={styles.emptyCharacterCard}>
              <Text style={styles.emptyCharacterText}>
                캐릭터를 불러오는 중...
              </Text>
            </Card>
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
          {recommendedMissions.length > 0 ? (
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
  section: {
    marginBottom: spacing[6],
  },
  sectionHeader: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
});

export default HomeScreen;
