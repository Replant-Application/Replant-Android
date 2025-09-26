import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useCharacter } from '../hooks/useCharacter';
import { colors, spacing, typography, borderRadius, shadows } from '../utils/designTokens';
import { SCREEN_NAMES } from '../utils/constants';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

interface CharacterGuideScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const CharacterGuideScreen: React.FC<CharacterGuideScreenProps> = ({ navigation }) => {
  const { characters, representativeCharacter, loading, error, setRepresentative } = useCharacter();

  // 레벨별 캐릭터 이미지
  const getCharacterImage = (level: number) => {
    const levelFolder = `level${Math.min(level, 6)}`;
    switch (levelFolder) {
      case 'level1': return require('../assets/images/characters/level1/default.png');
      case 'level2': return require('../assets/images/characters/level2/default.png');
      case 'level3': return require('../assets/images/characters/level3/default.png');
      case 'level4': return require('../assets/images/characters/level4/default.png');
      case 'level5': return require('../assets/images/characters/level5/default.png');
      case 'level6': return require('../assets/images/characters/level6/default.png');
      default: return require('../assets/images/characters/level1/default.png');
    }
  };

  // 레벨 이름 변환
  const getLevelName = (level: number): string => {
    if (level >= 6) return '성숙한 나무';
    if (level >= 5) return '열매 나무';
    if (level >= 4) return '나무';
    if (level >= 3) return '어린 식물';
    if (level >= 2) return '새싹';
    return '씨앗';
  };

  // 카테고리 이름 변환
  const getCategoryName = (categoryId: string): string => {
    const categoryNames: Record<string, string> = {
      'self_management': '자기관리',
      'communication': '소통관리',
      'career': '커리어관리'
    };
    return categoryNames[categoryId] || '알 수 없음';
  };

  // 카테고리 아이콘
  const getCategoryIcon = (categoryId: string): string => {
    const categoryIcons: Record<string, string> = {
      'self_management': '🧘',
      'communication': '💬',
      'career': '📚'
    };
    return categoryIcons[categoryId] || '❓';
  };

  // 캐릭터 상세 페이지로 이동
  const handleCharacterPress = (character: any) => {
    navigation.navigate('CharacterDetail', { character });
  };

  // 대표 캐릭터 설정 핸들러
  const handleSetRepresentative = async (character: any) => {
    try {
      const result = await setRepresentative(character.category_id);
      if (result.success) {
        Alert.alert('성공', `${getCategoryName(character.category_id)} 캐릭터가 대표 캐릭터로 설정되었습니다.`);
      } else {
        Alert.alert('오류', result.error || '대표 캐릭터 설정에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '대표 캐릭터 설정 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.secondary }]}>
        <View style={[styles.header, { backgroundColor: colors.background.primary }]} />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>캐릭터 정보를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.secondary }]}>
        <View style={[styles.header, { backgroundColor: colors.background.primary }]} />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text.secondary }]}>캐릭터 정보를 불러올 수 없습니다.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.secondary }]}>
      <View style={[styles.header, { backgroundColor: colors.background.primary, borderBottomColor: colors.border.light }]} />

      <ScrollView style={styles.content}>

        {/* 캐릭터 목록 */}
        <View style={styles.charactersSection}>
          {characters.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.background.primary, borderColor: colors.border.light }]}>
              <Text style={[styles.emptyIcon, { color: colors.text.tertiary }]}>📝</Text>
              <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>캐릭터가 없어요</Text>
              <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                아직 캐릭터가 없습니다.
              </Text>
            </View>
          ) : (
            characters
              .sort((a, b) => {
                // 대표 캐릭터를 맨 위로
                if (representativeCharacter && a.id === representativeCharacter.id) return -1;
                if (representativeCharacter && b.id === representativeCharacter.id) return 1;
                return 0;
              })
              .map((character) => (
              <TouchableOpacity
                key={character.id}
                style={[styles.characterCard, { backgroundColor: colors.background.primary, borderColor: colors.border.light }]}
                onPress={() => handleCharacterPress(character)}
                activeOpacity={0.7}
              >
                <View style={styles.characterHeader}>
                  <View style={styles.characterImageContainer}>
                    <Image
                      source={getCharacterImage(character.level || 1)}
                      style={styles.characterImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.characterInfo}>
                    <Text style={[styles.characterName, { color: colors.text.primary }]}>{character.name}</Text>
                    <Text style={[styles.characterCategory, { color: colors.primary[500] }]}>
                      {getCategoryIcon(character.category_id)} {getCategoryName(character.category_id)}
                    </Text>
                  </View>
                  <View style={styles.characterLevel}>
                    <Text style={[styles.levelText, { color: colors.primary[500] }]}>Lv.{character.level || 1}</Text>
                    <Text style={[styles.levelName, { color: colors.text.secondary }]}>{getLevelName(character.level || 1)}</Text>
                  </View>
                </View>

                <View style={styles.characterStats}>
                  <View style={styles.statRow}>
                    <Text style={[styles.characterStatLabel, { color: colors.text.secondary }]}>현재 경험치</Text>
                    <Text style={[styles.statValue, { color: colors.text.primary }]}>
                      {((character.experience || 0) % 100).toLocaleString()} EXP
                    </Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={[styles.characterStatLabel, { color: colors.text.secondary }]}>총 경험치</Text>
                    <Text style={[styles.statValue, { color: colors.text.primary }]}>
                      {(character.total_experience || 0).toLocaleString()} EXP
                    </Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={[styles.characterStatLabel, { color: colors.text.secondary }]}>해제일</Text>
                    <Text style={[styles.statValue, { color: colors.text.primary }]}>
                      {character.unlocked_date ? new Date(character.unlocked_date).toLocaleDateString('ko-KR') : '알 수 없음'}
                    </Text>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { backgroundColor: colors.background.secondary }]}>
                    <View
                      style={[
                        styles.progressFill,
                        { backgroundColor: colors.primary[500], width: `${((character.experience || 0) % 100)}%` }
                      ]}
                    />
                  </View>
                  <Text style={[styles.progressText, { color: colors.text.tertiary }]}>
                    다음 레벨까지 {100 - ((character.experience || 0) % 100)} EXP
                  </Text>
                </View>

                {/* 대표 캐릭터 설정 버튼 */}
                <View style={styles.actionContainer}>
                  {representativeCharacter && representativeCharacter.id === character.id ? (
                    <View style={[styles.representativeBadge, { backgroundColor: colors.primary[500] }]}>
                      <Text style={[styles.representativeText, { color: colors.text.inverse }]}>
                        ⭐ 대표 캐릭터
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.setRepresentativeButton, { backgroundColor: colors.background.secondary, borderColor: colors.border.medium }]}
                      onPress={() => handleSetRepresentative(character)}
                    >
                      <Text style={[styles.setRepresentativeText, { color: colors.text.primary }]}>
                        대표로 설정
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[20],
    paddingBottom: spacing[6],
    borderBottomWidth: 1,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
  },
  content: {
    flex: 1,
    padding: spacing[5],
    paddingTop: spacing[6],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.base,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: typography.fontSize.base,
  },
  charactersSection: {
    marginBottom: spacing[5],
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing[4],
  },
  emptyCard: {
    padding: spacing[8],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: typography.fontSize['4xl'],
    marginBottom: spacing[4],
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing[2],
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  characterCard: {
    padding: spacing[5],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing[4],
    ...shadows.base,
  },
  characterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  characterImageContainer: {
    width: 60,
    height: 60,
    marginRight: spacing[3],
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
  characterInfo: {
    flex: 1,
  },
  characterName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing[1],
  },
  characterCategory: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  characterLevel: {
    alignItems: 'center',
  },
  levelText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  levelName: {
    fontSize: typography.fontSize.sm,
  },
  characterStats: {
    marginBottom: spacing[4],
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  characterStatLabel: {
    fontSize: typography.fontSize.sm,
  },
  statValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  progressContainer: {
    marginTop: spacing[2],
  },
  progressBar: {
    height: 8,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: spacing[1],
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  progressText: {
    fontSize: typography.fontSize.xs,
    textAlign: 'right',
  },
  actionContainer: {
    marginTop: spacing[3],
    alignItems: 'center',
  },
  representativeBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.base,
  },
  representativeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  setRepresentativeButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.base,
    borderWidth: 1,
  },
  setRepresentativeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
});

export default CharacterGuideScreen;
