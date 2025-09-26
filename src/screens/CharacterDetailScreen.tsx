import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useCharacter } from '../hooks/useCharacter';
import { colors, spacing, typography, borderRadius, shadows } from '../utils/designTokens';

interface Character {
  id: string;
  name: string;
  level: number;
  experience: number;
  category_id: string;
}

interface CharacterDetailScreenProps {
  route: {
    params: {
      character: Character;
    };
  };
  navigation: any;
}

const CharacterDetailScreen: React.FC<CharacterDetailScreenProps> = ({ route, navigation }) => {
  const { character } = route.params;
  const [currentEmotion, setCurrentEmotion] = useState<string>('default');
  
  // 레벨별 캐릭터 이미지
  const getCharacterImage = (level: number, emotion: string = 'default') => {
    const levelFolder = `level${Math.min(level, 6)}`;
    switch (levelFolder) {
      case 'level1': 
        return emotion === 'happy' ? require('../assets/images/characters/level1/happy.png') :
               emotion === 'waving' ? require('../assets/images/characters/level1/waving.png') :
               require('../assets/images/characters/level1/default.png');
      case 'level2': 
        return emotion === 'happy' ? require('../assets/images/characters/level2/happy.png') :
               emotion === 'waving' ? require('../assets/images/characters/level2/waving.png') :
               require('../assets/images/characters/level2/default.png');
      case 'level3': 
        return emotion === 'happy' ? require('../assets/images/characters/level3/happy.png') :
               emotion === 'waving' ? require('../assets/images/characters/level3/waving.png') :
               require('../assets/images/characters/level3/default.png');
      case 'level4': 
        return emotion === 'happy' ? require('../assets/images/characters/level4/happy.png') :
               emotion === 'waving' ? require('../assets/images/characters/level4/waving.png') :
               require('../assets/images/characters/level4/default.png');
      case 'level5': 
        return emotion === 'happy' ? require('../assets/images/characters/level5/happy.png') :
               emotion === 'waving' ? require('../assets/images/characters/level5/waving.png') :
               require('../assets/images/characters/level5/default.png');
      case 'level6': 
        return emotion === 'happy' ? require('../assets/images/characters/level6/happy.png') :
               emotion === 'waving' ? require('../assets/images/characters/level6/waving.png') :
               require('../assets/images/characters/level6/default.png');
      default: 
        return require('../assets/images/characters/level1/default.png');
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
      'career': '커리어관리',
    };
    return categoryNames[categoryId] || '기타';
  };

  // 경험치 진행률 계산
  const getExperienceProgress = (experience: number): number => {
    return experience % 100;
  };

  // 다음 레벨까지 필요한 경험치
  const getNextLevelExp = (experience: number): number => {
    return 100 - (experience % 100);
  };

  // 감정 변경
  const handleEmotionChange = (emotion: string): void => {
    setCurrentEmotion(emotion);
  };

  // 뒤로가기
  const handleGoBack = (): void => {
    navigation.goBack();
  };

  if (!character) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>캐릭터 정보를 찾을 수 없습니다.</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>돌아가기</Text>
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
        <Text style={styles.title}>캐릭터 상세</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* 캐릭터 이미지 */}
        <View style={styles.characterImageContainer}>
          <Image 
            source={getCharacterImage(character.level, currentEmotion)}
            style={styles.characterImage}
            resizeMode="contain"
          />
        </View>

        {/* 캐릭터 정보 */}
        <View style={styles.characterInfo}>
          <Text style={styles.characterName}>{character.name}</Text>
          <Text style={styles.characterLevel}>{getLevelName(character.level)}</Text>
          <Text style={styles.characterCategory}>{getCategoryName(character.category_id)}</Text>
        </View>

        {/* 경험치 진행률 */}
        <View style={styles.progressSection}>
          <Text style={styles.progressTitle}>경험치 진행률</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${getExperienceProgress(character.experience)}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {getExperienceProgress(character.experience)}/100 EXP
          </Text>
          <Text style={styles.nextLevelText}>
            다음 레벨까지 {getNextLevelExp(character.experience)} EXP
          </Text>
        </View>

        {/* 감정 변경 버튼들 */}
        <View style={styles.emotionSection}>
          <Text style={styles.emotionTitle}>감정 표현</Text>
          <View style={styles.emotionButtons}>
            <TouchableOpacity
              style={[
                styles.emotionButton,
                currentEmotion === 'default' && styles.selectedEmotion
              ]}
              onPress={() => handleEmotionChange('default')}
            >
              <Text style={styles.emotionText}>기본</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.emotionButton,
                currentEmotion === 'happy' && styles.selectedEmotion
              ]}
              onPress={() => handleEmotionChange('happy')}
            >
              <Text style={styles.emotionText}>행복</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.emotionButton,
                currentEmotion === 'waving' && styles.selectedEmotion
              ]}
              onPress={() => handleEmotionChange('waving')}
            >
              <Text style={styles.emotionText}>인사</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 캐릭터 설명 */}
        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionTitle}>캐릭터 소개</Text>
          <Text style={styles.descriptionText}>
            {character.name}은(는) {getLevelName(character.level)} 단계의 캐릭터입니다.
            꾸준한 미션 수행을 통해 성장하고 있으며, 현재 {character.experience}의 경험치를 보유하고 있습니다.
          </Text>
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
  characterImageContainer: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  characterImage: {
    width: 200,
    height: 200,
  },
  characterInfo: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  characterName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  characterLevel: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  characterCategory: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
  },
  progressSection: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[6],
    ...shadows.base,
  },
  progressTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  progressBar: {
    height: 12,
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
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[1],
  },
  nextLevelText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  emotionSection: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[6],
    ...shadows.base,
  },
  emotionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  emotionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  emotionButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.base,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  selectedEmotion: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  emotionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  descriptionSection: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    ...shadows.base,
  },
  descriptionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  descriptionText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
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
});

export default CharacterDetailScreen;
