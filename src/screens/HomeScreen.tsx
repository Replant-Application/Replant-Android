import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';
import { useCharacter } from '../hooks/useCharacter';
import { useMission } from '../hooks/useMission';
import { CharacterCard, MissionCard } from '../components/specialized';
import { Card, Loading, ErrorBoundary } from '../components/ui';
import { colors, spacing, typography } from '../utils/designTokens';
import { executeWithErrorHandling } from '../utils/errorHandler';
import { SCREEN_NAMES } from '../utils/constants';
import { RootStackParamList } from '../types/navigation';

interface HomeScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user } = useUser();
  const { representativeCharacter, loading: characterLoading, error: characterError, addExperienceByCategory } = useCharacter();
  const { missions, loading: missionLoading, error: missionError, completeMissionWithPhoto, uncompleteMission } = useMission(addExperienceByCategory);


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

  // 미션 완료 핸들러
  const handleCompleteMission = async (missionId: string): Promise<void> => {
    const result = await executeWithErrorHandling(
      () => completeMissionWithPhoto(missionId, null),
      '미션 완료'
    );

    if (result.success) {
      // 성공 시 추가 처리 (예: 토스트 메시지)
    }
  };

  // 미션 완료 취소 핸들러
  const handleUncompleteMission = async (missionId: string): Promise<void> => {
    const result = await executeWithErrorHandling(
      () => uncompleteMission(missionId),
      '미션 완료 취소'
    );

    if (result.success) {
      // 성공 시 추가 처리
    }
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
        <View style={styles.header}>
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>나의 캐릭터</Text>
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
            <Text style={styles.sectionTitle}>추천 미션</Text>
          </View>
          <Loading text="미션을 불러오는 중..." />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
      </View>
      <View style={styles.content}>

        {/* 메인 캐릭터 표시 */}
        <View style={styles.characterSection}>
          <Text style={styles.sectionTitle}>🌱 나의 캐릭터</Text>
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
          <Text style={styles.sectionTitle}>🎯 추천 미션</Text>
          {recommendedMissions.length > 0 ? (
            recommendedMissions.map((mission) => (
              <MissionCard
                key={mission.mission_id}
                mission={mission}
                onComplete={handleCompleteMission}
                onUncomplete={handleUncompleteMission}
                style={styles.missionCard}
                disabled={true}
              />
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                🎉 모든 미션을 완료했습니다!{'\n'}
                새로운 미션이 곧 추가될 예정입니다.
              </Text>
            </Card>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[20],
    paddingBottom: spacing[5],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
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
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[4],
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
  emptyCard: {
    padding: spacing[6],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
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
