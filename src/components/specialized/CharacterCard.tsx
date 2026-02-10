import React from 'react';
import { View, Text, TouchableOpacity, Image, ViewStyle } from 'react-native';
import { styles } from './CharacterCard.styles';
import { getNextLevelExp } from '../../utils/expTable';
import { Character } from '../../types';
import { getCharacterImage } from '../../utils/characterUtils';

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

  // 레벨별 이름 통일: 1=알, 2=씨앗, 3=새싹, 4=어린 나무, 5+=성숙한 나무
  const getLevelName = (level: number): string => {
    if (level >= 5) return '성숙한 나무';
    if (level >= 4) return '어린 나무';
    if (level >= 3) return '새싹';
    if (level >= 2) return '씨앗';
    return '알';
  };

  // 캐릭터 이미지는 characterUtils의 getCharacterImage 함수 사용

  // 백엔드(Reant.java): 다음 레벨 필요 = 레벨별 테이블 (L1→10, L2→50, L3→100, L4→200, L5→500, L6+→500)
  const level = character.level ?? 1;
  const experienceProgress = character.experience ?? 0;
  const maxExperience = getNextLevelExp(level);
  const nextLevelExp = Math.max(0, maxExperience - experienceProgress);

  const getAccessibilityLabel = () => {
    const levelName = getLevelName(character.level || 1);
    return `${character.name || '캐릭터'}, ${levelName}, 레벨 ${character.level || 1}, 경험치 ${experienceProgress}/${maxExperience}`;
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
            source={getCharacterImage(character.level || 1, 'default')}
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
            {experienceProgress}/{maxExperience} EXP
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${maxExperience > 0 ? Math.min(100, (experienceProgress / maxExperience) * 100) : 0}%` }
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
