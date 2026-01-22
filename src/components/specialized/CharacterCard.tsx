import React from 'react';
import { View, Text, TouchableOpacity, Image, ViewStyle } from 'react-native';
import { styles } from './CharacterCard.styles';
import { Character } from '../../types';

interface CharacterCardProps {
  character: Character;
  onPress: (character: Character) => void;
  selected?: boolean;
  style?: ViewStyle;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onPress,
  selected = false,
  style
}) => {
  if (!character) return null;

  const getLevelName = (level: number): string => {
    if (level >= 10) return '성숙한 나무';
    if (level >= 7) return '자라는 나무';
    if (level >= 4) return '새싹';
    return '씨앗';
  };

  // 캐릭터 이미지 미리 import
  const characterImages = {
    level1: require('../../assets/images/characters/level1/default.gif'),
    level2: require('../../assets/images/characters/level2/default.gif'),
    level3: require('../../assets/images/characters/level3/default.gif'),
    level4: require('../../assets/images/characters/level4/default.gif'),
    level5: require('../../assets/images/characters/level5/default.gif'),
    level6: require('../../assets/images/characters/level6/default.gif'),
  };

  // 캐릭터 이미지 경로 생성
  const getCharacterImage = (level: number) => {
    const levelKey = `level${Math.min(level, 6)}`;
    return characterImages[levelKey as keyof typeof characterImages] || characterImages.level1;
  };

  // experience는 이미 현재 레벨의 경험치 (0-99)이므로 % 100 불필요
  const experienceProgress = character.experience || 0;
  const nextLevelExp = 100 - experienceProgress;

  // 접근성 라벨 생성
  const getAccessibilityLabel = () => {
    const levelName = getLevelName(character.level || 1);
    const experienceProgress = character.experience || 0;
    return `${character.name || '캐릭터'}, ${levelName}, 레벨 ${character.level || 1}, 경험치 ${experienceProgress}/100`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && styles.selected,
        style
      ]}
      onPress={() => onPress(character)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={getAccessibilityLabel()}
      accessibilityState={{ selected }}
    >
      <View style={styles.header}>
        <View style={styles.characterImageContainer}>
          <Image
            source={getCharacterImage(character.level || 1)}
            style={styles.characterImage}
            resizeMode="contain"
            accessibilityLabel={`${character.name || '캐릭터'} 이미지, ${getLevelName(character.level || 1)}`}
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{character.name || '캐릭터'}</Text>
          <Text style={styles.level}>{getLevelName(character.level || 1)}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <Text style={styles.levelText}>Lv.{character.level || 1}</Text>
          <Text style={styles.expText}>
            {experienceProgress}/100 EXP
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${experienceProgress}%` }
            ]}
          />
        </View>
        <Text style={styles.nextLevelText}>
          다음 레벨까지 {nextLevelExp} EXP
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default CharacterCard;
