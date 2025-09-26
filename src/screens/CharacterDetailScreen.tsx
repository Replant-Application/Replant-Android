import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useCharacter } from '../hooks/useCharacter';
import { colors, spacing, typography, borderRadius, shadows } from '../utils/designTokens';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { Character } from '../types';
import { ProgressBar } from '../components/ui';

interface CharacterDetailScreenProps {
  route: RouteProp<RootStackParamList, 'CharacterDetail'>;
  navigation: NavigationProp<RootStackParamList>;
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
    if (level >= 6) return '성숙한 나무';
    if (level >= 5) return '열매 나무';
    if (level >= 4) return '나무';
    if (level >= 3) return '어린 식물';
    if (level >= 2) return '새싹';
    return '씨앗';
  };

  const getCategoryDescription = (categoryId: string): string => {
    switch (categoryId) {
      case 'self_management':
        return '매일 조금씩 성장하며 나만의 길을 찾아가요';
      case 'communication':
        return '따뜻한 대화로 세상을 더 아름답게 만들어가요';
      case 'career':
        return '꿈을 현실로 만드는 과정을 즐기고 있어요';
      default:
        return '꾸준한 성장을 통해 더욱 빛나고 있어요';
    }
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

  // 감정 표현 버튼들
  const emotionButtons = [
    { key: 'default', label: '기본', emoji: '😐' },
    { key: 'happy', label: '기쁨', emoji: '😊' },
    { key: 'waving', label: '인사', emoji: '👋' }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← 뒤로</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* 캐릭터 이미지 섹션 */}
        <View style={styles.characterSection}>
          <View style={styles.characterImageContainer}>
            <Image
              source={getCharacterImage(character.level || 1, currentEmotion)}
              style={styles.characterImage}
              resizeMode="contain"
            />
          </View>

          {/* 감정 표현 버튼들 */}
          <View style={styles.emotionButtons}>
            {emotionButtons.map((emotion) => (
              <TouchableOpacity
                key={emotion.key}
                style={[
                  styles.emotionButton,
                  currentEmotion === emotion.key && styles.emotionButtonActive
                ]}
                onPress={() => setCurrentEmotion(emotion.key)}
              >
                <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
                <Text style={[
                  styles.emotionLabel,
                  currentEmotion === emotion.key && styles.emotionLabelActive
                ]}>
                  {emotion.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 캐릭터 정보 섹션 - 4개 항목으로 단순화 */}
        <View style={styles.infoSection}>
          {/* 1. 캐릭터 이름 */}
          <View style={styles.characterNameSection}>
            <Text style={styles.characterName}>{character.name}</Text>
          </View>

          {/* 2. 레벨 정보 */}
          <View style={styles.levelSection}>
            <Text style={styles.levelText}>Lv.{character.level || 1}</Text>
            <Text style={styles.levelName}>{getLevelName(character.level || 1)}</Text>
          </View>

          {/* 3. 카테고리 정보 */}
          <View style={styles.categorySection}>
            <Text style={styles.categoryIcon}>
              {getCategoryIcon(character.category_id)}
            </Text>
            <Text style={styles.categoryName}>
              {getCategoryName(character.category_id)}
            </Text>
          </View>

          {/* 4. 경험치 바 */}
          <View style={styles.experienceSection}>
            <ProgressBar
              current={(character.experience || 0) % 100}
              max={100}
              showPercentage={false}
              showRemaining={false}
              color={colors.primary[500]}
              height={12}
            />
          </View>
        </View>


        {/* 캐릭터 설명 */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>🌱 캐릭터 소개</Text>
          <Text style={styles.description}>
            {character.description || getCategoryDescription(character.category_id)}
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
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[20],
    paddingBottom: spacing[6],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    marginRight: spacing[4],
  },
  backButtonText: {
    fontSize: typography.fontSize.lg,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  content: {
    padding: spacing[5],
    paddingTop: spacing[6],
  },
  characterSection: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  characterImageContainer: {
    width: 160,
    height: 160,
    marginBottom: spacing[6],
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  characterImage: {
    width: '90%',
    height: '90%',
  },
  emotionButtons: {
    flexDirection: 'row',
    gap: spacing[2],
    paddingHorizontal: spacing[2],
  },
  emotionButton: {
    flex: 1,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[4],
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background.primary,
    borderWidth: 2,
    borderColor: colors.border.light,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emotionButtonActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[400],
    shadowColor: colors.primary[400],
    shadowOpacity: 0.2,
    transform: [{ scale: 1.02 }],
  },
  emotionEmoji: {
    fontSize: typography.fontSize['2xl'],
    marginBottom: spacing[2],
  },
  emotionLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.semibold,
  },
  emotionLabelActive: {
    color: colors.primary[700],
    fontWeight: typography.fontWeight.bold,
  },
  infoSection: {
    marginBottom: spacing[8],
    padding: spacing[5],
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    ...shadows.base,
  },
  characterNameSection: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  characterName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  levelSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
    gap: spacing[3],
  },
  levelText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
  },
  levelName: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  categorySection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  categoryIcon: {
    fontSize: typography.fontSize.lg,
  },
  categoryName: {
    fontSize: typography.fontSize.base,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  experienceSection: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  descriptionSection: {
    marginBottom: spacing[8],
    padding: spacing[5],
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    ...shadows.base,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
});

export default CharacterDetailScreen;
