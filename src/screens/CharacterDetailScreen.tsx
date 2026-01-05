import React, { useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../utils/designTokens';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { ProgressBar, Header, SectionTitle, Button } from '../components/ui';
import { useCharacter } from '../hooks/useCharacter';
import { downloadPetImage } from '../services/petService';

interface CharacterDetailScreenProps {
  route: RouteProp<RootStackParamList, 'CharacterDetail'>;
  navigation: NavigationProp<RootStackParamList>;
}

const CharacterDetailScreen: React.FC<CharacterDetailScreenProps> = ({ route, navigation: _navigation }) => {
  const { character: initialCharacter } = route.params || {};
  const { characters, updateCharacterName, loadCharacters } = useCharacter();
  const [currentEmotion, setCurrentEmotion] = useState<string>('default');
  const [showNameEditModal, setShowNameEditModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [downloading, setDownloading] = useState(false);
  const imageRef = useRef<Image>(null);

  // characters에서 현재 캐릭터 찾기 (이름 변경 후 최신 정보 반영)
  const character = useMemo(() => {
    if (!initialCharacter) return null;
    // characters 배열에서 같은 id의 캐릭터 찾기
    const updatedCharacter = characters.find(c => c.id === initialCharacter.id);
    return updatedCharacter || initialCharacter;
  }, [characters, initialCharacter]);

  if (!character) {
    return (
      <View style={styles.emptyContainer}>
        <Text>캐릭터 정보를 불러올 수 없습니다.</Text>
      </View>
    );
  }

  // 이름 변경 핸들러
  const handleNameChange = async () => {
    if (!newName.trim()) {
      Alert.alert('오류', '캐릭터 이름을 입력해주세요.');
      return;
    }

    if (newName.trim() === character.name) {
      Alert.alert('알림', '현재 이름과 동일합니다.');
      setShowNameEditModal(false);
      return;
    }

    if (!character) return;

    try {
      const result = await updateCharacterName(character.id, newName.trim());
      if (result.success && result.data) {
        // loadCharacters를 호출하여 최신 캐릭터 정보 로드
        await loadCharacters();
        Alert.alert('완료', '캐릭터 이름이 변경되었습니다.');
        setShowNameEditModal(false);
        setNewName('');
      } else {
        Alert.alert('오류', result.error || '이름 변경에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '이름 변경 중 오류가 발생했습니다.');
    }
  };

  // 이미지 다운로드 핸들러
  const handleDownloadImage = async () => {
    if (!character || !imageRef.current) return;

    try {
      setDownloading(true);
      const result = await downloadPetImage(imageRef, character.name, character.level || 1);

      if (result.success) {
        Alert.alert(
          '다운로드 완료',
          '캐릭터 이미지가 갤러리에 저장되었습니다.',
          [{ text: '확인' }]
        );
      } else {
        Alert.alert('오류', result.error || '이미지 다운로드에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '이미지 다운로드 중 오류가 발생했습니다.');
    } finally {
      setDownloading(false);
    }
  };

  // 레벨별 캐릭터 이미지
  const getCharacterImage = (level: number, emotion: string = 'default') => {
    const levelFolder = `level${Math.min(level, 6)}`;
    switch (levelFolder) {
      case 'level1':
        return emotion === 'happy' ? require('../assets/images/characters/level1/happy.gif') :
               require('../assets/images/characters/level1/default.gif');
      case 'level2':
        return emotion === 'happy' ? require('../assets/images/characters/level2/happy.gif') :
               require('../assets/images/characters/level2/default.gif');
      case 'level3':
        return emotion === 'happy' ? require('../assets/images/characters/level3/happy.gif') :
               require('../assets/images/characters/level3/default.gif');
      case 'level4':
        return emotion === 'happy' ? require('../assets/images/characters/level4/happy.gif') :
               require('../assets/images/characters/level4/default.gif');
      case 'level5':
        return emotion === 'happy' ? require('../assets/images/characters/level5/happy.gif') :
               require('../assets/images/characters/level5/default.gif');
      case 'level6':
        return emotion === 'happy' ? require('../assets/images/characters/level6/happy.gif') :
               require('../assets/images/characters/level6/default.gif');
      default:
        return require('../assets/images/characters/level1/default.gif');
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

  const getCategoryDescription = (): string => {
    return '꾸준한 성장을 통해 더욱 빛나고 있어요';
  };

  // 카테고리 이름 변환
  const getCategoryName = (): string => '성장';

  // 카테고리 아이콘
  const getCategoryIcon = (): string => '🌱';

  // 감정 표현 버튼들
  const emotionButtons = [
    { key: 'default', label: '기본', emoji: '😐' },
    { key: 'happy', label: '기쁨', emoji: '😊' },
    { key: 'waving', label: '인사', emoji: '👋' }
  ];

  return (
    <ScrollView style={styles.container}>
      <Header />

      <View style={styles.content}>
        {/* 캐릭터 이미지 섹션 */}
        <View style={styles.characterSection}>
          <View style={styles.characterImageContainer}>
            <Image
              ref={imageRef}
              source={getCharacterImage(character.level || 1, currentEmotion)}
              style={styles.characterImage}
              resizeMode="contain"
            />
          </View>

          {/* 이미지 다운로드 버튼 */}
          <TouchableOpacity
            style={[styles.downloadButton, downloading && styles.downloadButtonDisabled]}
            onPress={handleDownloadImage}
            disabled={downloading}
          >
            {downloading ? (
              <Text style={styles.downloadButtonIcon}>⏳</Text>
            ) : (
              <Image
                source={require('../assets/images/download-icon.jpg')}
                style={styles.downloadIconImage}
                resizeMode="contain"
              />
            )}
            <Text style={styles.downloadButtonText}>
              {downloading ? '다운로드 중...' : '다운로드'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 감정 표현 버튼들 */}
        <View style={styles.emotionButtonsContainer}>
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
            <TouchableOpacity
              style={styles.editNameButton}
              onPress={() => {
                setNewName(character.name);
                setShowNameEditModal(true);
              }}
            >
              <Text style={styles.editNameIcon}>✏️</Text>
            </TouchableOpacity>
          </View>

          {/* 2. 레벨 정보 */}
          <View style={styles.levelSection}>
            <Text style={styles.levelText}>Lv.{character.level || 1}</Text>
            <Text style={styles.levelName}>{getLevelName(character.level || 1)}</Text>
          </View>

          {/* 3. 카테고리 정보 (단일: 성장) */}
          <View style={styles.categorySection}>
            <Text style={styles.categoryIcon}>{getCategoryIcon()}</Text>
            <Text style={styles.categoryName}>{getCategoryName()}</Text>
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
          <SectionTitle title="🌱 캐릭터 소개" />
          <Text style={styles.description}>
            {character.description || getCategoryDescription()}
          </Text>
        </View>

      </View>

      {/* 이름 변경 모달 */}
      <Modal
        visible={showNameEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNameEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>캐릭터 이름 변경</Text>
            <TextInput
              style={styles.nameInput}
              placeholder="새 이름을 입력하세요"
              value={newName}
              onChangeText={setNewName}
              placeholderTextColor={colors.text.secondary}
              maxLength={20}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Button
                title="취소"
                onPress={() => {
                  setShowNameEditModal(false);
                  setNewName('');
                }}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="변경"
                onPress={handleNameChange}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: spacing[6],
  },
  characterSection: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  characterImageContainer: {
    width: 180,
    height: 180,
    marginBottom: spacing[2],
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
  emotionButtonsContainer: {
    width: '100%',
    marginBottom: spacing[6],
    paddingHorizontal: spacing[1],
  },
  emotionButtons: {
    flexDirection: 'row',
    gap: spacing[3],
    width: '100%',
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
    marginBottom: spacing[6],
    padding: spacing[6],
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    ...shadows.base,
  },
  characterNameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[5],
    gap: spacing[2],
  },
  characterName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  editNameButton: {
    padding: spacing[2],
  },
  editNameIcon: {
    fontSize: typography.fontSize.base,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    ...shadows.lg,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[4],
    textAlign: 'center',
  },
  nameInput: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.base,
    padding: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
    marginBottom: spacing[4],
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  modalButton: {
    flex: 1,
  },
  levelSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[5],
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
    marginBottom: spacing[5],
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
  descriptionSection: {
    marginBottom: spacing[6],
    padding: spacing[6],
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    ...shadows.base,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  downloadButton: {
    marginTop: spacing[1],
    marginBottom: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.base,
    backgroundColor: 'transparent',
    gap: spacing[2],
  },
  downloadButtonDisabled: {
    borderColor: colors.gray[300],
    opacity: 0.6,
  },
  downloadButtonIcon: {
    fontSize: typography.fontSize.base,
  },
  downloadIconImage: {
    width: 20,
    height: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
});

export default CharacterDetailScreen;
