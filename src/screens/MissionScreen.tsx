import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SCREEN_NAMES } from '../utils/constants';
import { useMission } from '../hooks/useMission';
import { useCharacter } from '../hooks/useCharacter';
import { MissionCard } from '../components/specialized';
import { Card, Loading, ErrorBoundary, Button } from '../components/ui';
import { colors, spacing, typography, borderRadius } from '../utils/designTokens';

interface MissionCategory {
  id: string;
  name: string;
  emoji: string;
}

interface MissionScreenProps {
  navigation: any;
}

const MISSION_CATEGORIES: MissionCategory[] = [
  { id: 'all', name: '전체', emoji: '🎯' },
  { id: 'self_management', name: '자기관리', emoji: '🧘' },
  { id: 'communication', name: '소통관리', emoji: '💬' },
  { id: 'career', name: '커리어관리', emoji: '📚' },
  { id: 'custom', name: '나만의 미션', emoji: '✨' },
];

const MissionScreen: React.FC<MissionScreenProps> = ({ navigation }) => {
  const { addExperienceByCategory } = useCharacter();
  const { missions, loading, error, completeMissionWithPhoto, uncompleteMission } = useMission(addExperienceByCategory);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 필터링된 미션 목록
  const filteredMissions = selectedCategory === 'all' 
    ? missions 
    : selectedCategory === 'custom'
    ? missions.filter(mission => mission.is_custom)
    : missions.filter(mission => mission.category === selectedCategory);

  // 카테고리별 미션 수 계산
  const getCategoryMissionCount = (categoryId: string): number => {
    if (categoryId === 'all') {
      return missions.length;
    } else if (categoryId === 'custom') {
      return missions.filter(mission => mission.is_custom).length;
    } else {
      return missions.filter(mission => mission.category === categoryId).length;
    }
  };

  // 진행률 계산
  const completedMissions = missions.filter(mission => mission.completed).length;
  const totalMissions = missions.length;
  const progressPercentage = totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;

  const handleMissionComplete = async (missionId: string): Promise<void> => {
    try {
      // 사진 없이 미션 완료 (Phase 4 상태)
      const result = await completeMissionWithPhoto(missionId, null);
      
      if (result.success) {
        // 성공 시 추가 처리 (예: 토스트 메시지)
      }
    } catch (error) {
      console.error('미션 완료 실패:', error);
    }
  };

  const handleMissionUncomplete = async (missionId: string): Promise<void> => {
    try {
      const result = await uncompleteMission(missionId);
      
      if (result.success) {
        // 성공 시 추가 처리
      }
    } catch (error) {
      console.error('미션 완료 취소 실패:', error);
    }
  };

  const handleCreateMission = (): void => {
    navigation.navigate(SCREEN_NAMES.CUSTOM_MISSION_CREATE);
  };

  if (loading) {
    return <Loading text="미션을 불러오는 중..." />;
  }

  if (error) {
    return <ErrorBoundary error={error} />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>미션</Text>
        <Text style={styles.userInfo}>사용자님</Text>
      </View>

      {/* 진행률 표시 */}
      <View style={styles.progressSection}>
        <Text style={styles.progressTitle}>전체 진행률</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${progressPercentage}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {completedMissions}/{totalMissions} 완료 ({Math.round(progressPercentage)}%)
        </Text>
      </View>

      {/* 카테고리 필터 */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {MISSION_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.selectedCategory
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text style={[
                styles.categoryName,
                selectedCategory === category.id && styles.selectedCategoryText
              ]}>
                {category.name}
              </Text>
              <Text style={[
                styles.categoryCount,
                selectedCategory === category.id && styles.selectedCategoryCount
              ]}>
                ({getCategoryMissionCount(category.id)})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 섹션 제목 */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === 'all' 
            ? `전체 미션 (${filteredMissions.length}개)`
            : selectedCategory === 'custom'
            ? `나만의 미션 (${filteredMissions.length}개)`
            : `${MISSION_CATEGORIES.find(cat => cat.id === selectedCategory)?.name} 미션 (${filteredMissions.length}개)`
          }
        </Text>
        {selectedCategory === 'custom' && (
          <Button
            title="+ 새 미션"
            onPress={handleCreateMission}
            size="sm"
            style={styles.addButton}
            textStyle={{ color: colors.white }}
          />
        )}
      </View>

      {/* 미션 목록 */}
      <View style={styles.missionList}>
        {filteredMissions.length > 0 ? (
          filteredMissions.map((mission) => (
            <MissionCard
              key={mission.mission_id}
              mission={mission}
              onComplete={handleMissionComplete}
              onUncomplete={handleMissionUncomplete}
              style={styles.missionCard}
            />
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              {selectedCategory === 'custom' 
                ? '아직 나만의 미션이 없어요.\n새로운 미션을 만들어보세요!'
                : '이 카테고리의 미션이 없어요.'
              }
            </Text>
            {selectedCategory === 'custom' && (
              <Button
                title="미션 만들기"
                onPress={handleCreateMission}
                style={styles.createButton}
                textStyle={{ color: colors.white }}
              />
            )}
          </Card>
        )}
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
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  userInfo: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  progressSection: {
    padding: spacing[5],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  progressTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: spacing[2],
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.sm,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  categoryContainer: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    marginRight: spacing[3],
    backgroundColor: colors.background.primary,
    borderRadius: spacing[6],
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  selectedCategory: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  categoryEmoji: {
    fontSize: typography.fontSize.base,
    marginRight: spacing[2],
  },
  categoryName: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  selectedCategoryText: {
    color: colors.text.inverse,
  },
  categoryCount: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginLeft: spacing[1],
  },
  selectedCategoryCount: {
    color: colors.text.inverse,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  addButton: {
    backgroundColor: colors.primary[500],
  },
  missionList: {
    paddingHorizontal: spacing[5],
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
    marginBottom: spacing[4],
  },
  createButton: {
    backgroundColor: colors.primary[500],
  },
});

export default MissionScreen;
