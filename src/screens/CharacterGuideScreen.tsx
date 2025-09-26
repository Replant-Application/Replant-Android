import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useCharacter } from '../hooks/useCharacter';
import { colors, spacing, typography, borderRadius, shadows } from '../utils/designTokens';
import { SCREEN_NAMES } from '../utils/constants';

interface Character {
  id: string;
  name: string;
  level: number;
  experience: number;
  category_id: string;
}

interface CharacterGuideScreenProps {
  navigation: any;
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
    if (level >= 10) return '성숙한 나무';
    if (level >= 7) return '자라는 나무';
    if (level >= 4) return '새싹';
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

  // 대표 캐릭터 설정
  const handleSetRepresentative = async (character: Character): Promise<void> => {
    try {
      const result = await setRepresentative(character.id);
      if (result.success) {
        Alert.alert('성공', `${character.name}을(를) 대표 캐릭터로 설정했습니다.`);
      } else {
        Alert.alert('오류', '대표 캐릭터 설정에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '대표 캐릭터 설정 중 오류가 발생했습니다.');
    }
  };

  // 캐릭터 상세 페이지로 이동
  const handleCharacterPress = (character: Character): void => {
    navigation.navigate(SCREEN_NAMES.CHARACTER_DETAIL, { character });
  };

  // 뒤로가기
  const handleGoBack = (): void => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>캐릭터를 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>캐릭터를 불러올 수 없습니다.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleGoBack}>
          <Text style={styles.retryButtonText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>캐릭터 가이드</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* 대표 캐릭터 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌱 대표 캐릭터</Text>
          {representativeCharacter ? (
            <View style={styles.representativeCard}>
              <Image 
                source={getCharacterImage(representativeCharacter.level)}
                style={styles.representativeImage}
                resizeMode="contain"
              />
              <View style={styles.representativeInfo}>
                <Text style={styles.representativeName}>{representativeCharacter.name}</Text>
                <Text style={styles.representativeLevel}>{getLevelName(representativeCharacter.level)}</Text>
                <Text style={styles.representativeCategory}>
                  {getCategoryIcon(representativeCharacter.category_id)} {getCategoryName(representativeCharacter.category_id)}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyRepresentative}>
              <Text style={styles.emptyText}>대표 캐릭터가 설정되지 않았습니다.</Text>
            </View>
          )}
        </View>

        {/* 모든 캐릭터 목록 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 모든 캐릭터</Text>
          {characters.length > 0 ? (
            characters.map((character) => (
              <TouchableOpacity
                key={character.id}
                style={[
                  styles.characterCard,
                  representativeCharacter?.id === character.id && styles.selectedCharacter
                ]}
                onPress={() => handleCharacterPress(character)}
              >
                <Image 
                  source={getCharacterImage(character.level)}
                  style={styles.characterImage}
                  resizeMode="contain"
                />
                <View style={styles.characterInfo}>
                  <Text style={styles.characterName}>{character.name}</Text>
                  <Text style={styles.characterLevel}>{getLevelName(character.level)}</Text>
                  <Text style={styles.characterCategory}>
                    {getCategoryIcon(character.category_id)} {getCategoryName(character.category_id)}
                  </Text>
                  <Text style={styles.characterExp}>경험치: {character.experience}</Text>
                </View>
                <View style={styles.characterActions}>
                  {representativeCharacter?.id !== character.id && (
                    <TouchableOpacity
                      style={styles.setRepresentativeButton}
                      onPress={() => handleSetRepresentative(character)}
                    >
                      <Text style={styles.setRepresentativeText}>대표로 설정</Text>
                    </TouchableOpacity>
                  )}
                  {representativeCharacter?.id === character.id && (
                    <View style={styles.currentRepresentative}>
                      <Text style={styles.currentRepresentativeText}>현재 대표</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyCharacters}>
              <Text style={styles.emptyText}>아직 캐릭터가 없습니다.</Text>
            </View>
          )}
        </View>

        {/* 캐릭터 시스템 설명 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 캐릭터 시스템</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>레벨 시스템</Text>
            <Text style={styles.infoText}>
              • 씨앗 (Lv.1-3): 초보 단계{'\n'}
              • 새싹 (Lv.4-6): 성장 단계{'\n'}
              • 자라는 나무 (Lv.7-9): 발전 단계{'\n'}
              • 성숙한 나무 (Lv.10+): 완성 단계
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>경험치 획득</Text>
            <Text style={styles.infoText}>
              • 미션 완료 시 경험치 획득{'\n'}
              • 100 경험치마다 레벨업{'\n'}
              • 카테고리별로 다른 성장
            </Text>
          </View>
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
  backButton: {
    padding: spacing[2],
  },
  backButtonText: {
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: spacing[5],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  representativeCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.base,
  },
  representativeImage: {
    width: 80,
    height: 80,
    marginRight: spacing[4],
  },
  representativeInfo: {
    flex: 1,
  },
  representativeName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  representativeLevel: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  representativeCategory: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  emptyRepresentative: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[6],
    alignItems: 'center',
    ...shadows.base,
  },
  characterCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.base,
  },
  selectedCharacter: {
    borderWidth: 2,
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[100],
  },
  characterImage: {
    width: 60,
    height: 60,
    marginRight: spacing[4],
  },
  characterInfo: {
    flex: 1,
  },
  characterName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  characterLevel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  characterCategory: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing[1],
  },
  characterExp: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  characterActions: {
    alignItems: 'flex-end',
  },
  setRepresentativeButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.sm,
  },
  setRepresentativeText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.medium,
  },
  currentRepresentative: {
    backgroundColor: colors.success[500],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.sm,
  },
  currentRepresentativeText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.medium,
  },
  emptyCharacters: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[6],
    alignItems: 'center',
    ...shadows.base,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    ...shadows.base,
  },
  infoTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[5],
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[5],
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  retryButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.base,
  },
  retryButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.medium,
  },
});

export default CharacterGuideScreen;
