import React, { useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { Header, SectionTitle } from '../../components/ui';
import { useCharacter } from '../../hooks/useCharacter';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { useAsyncOperation } from '../../hooks/useAsyncOperation';
import { useCharacterNameEdit } from '../../hooks/useCharacterNameEdit';
import { downloadPetImage } from '../../services/petService';
import CharacterImageSection from './CharacterImageSection';
import EmotionButtons from './EmotionButtons';
import CharacterInfoSection from './CharacterInfoSection';
import CharacterNameEditModal from './CharacterNameEditModal';

interface CharacterDetailScreenProps {
  route: RouteProp<RootStackParamList, 'CharacterDetail'>;
  navigation: NavigationProp<RootStackParamList>;
}

const CharacterDetailScreen: React.FC<CharacterDetailScreenProps> = ({ route, navigation }) => {
  const { character: initialCharacter } = route.params || {};
  const { characters } = useCharacter();
  const { showSuccess } = useErrorHandler();
  const [currentEmotion, setCurrentEmotion] = useState<string>('default');
  const imageRef = useRef<Image>(null);
  
  // 이름 변경 훅
  const {
    showModal: showNameEditModal,
    newName,
    openModal,
    closeModal,
    setName,
    handleNameChange,
  } = useCharacterNameEdit();

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
  const handleNameChangeConfirm = async () => {
    if (!character) return;
    await handleNameChange(character.id, character.name);
  };

  // 이미지 다운로드 비동기 작업
  const { execute: executeDownload, loading: downloading } = useAsyncOperation(
    async () => {
      if (!character || !imageRef.current) {
        throw new Error('캐릭터 정보 또는 이미지를 찾을 수 없습니다.');
      }
      return downloadPetImage(imageRef, character.name, character.level || 1);
    },
    {
      onSuccess: () => {
        showSuccess('캐릭터 이미지가 갤러리에 저장되었습니다.', '다운로드 완료');
      },
      context: 'CharacterDetailScreen.handleDownloadImage',
    }
  );

  // 이미지 다운로드 핸들러
  const handleDownloadImage = async () => {
    if (!character || !imageRef.current) return;
    await executeDownload();
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
      <Header
        title="캐릭터 상세"
        leftButton={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../../assets/images/left.png')}
              style={styles.backButtonIcon}
              resizeMode="contain"
              accessibilityLabel="뒤로 가기"
            />
          </TouchableOpacity>
        }
      />

      <View style={styles.content}>
        {/* 캐릭터 이미지 섹션 */}
        <CharacterImageSection
          character={character}
          currentEmotion={currentEmotion}
          imageRef={imageRef}
          downloading={downloading}
          onDownload={handleDownloadImage}
        />

        {/* 감정 표현 버튼들 */}
        <EmotionButtons
          emotions={emotionButtons}
          selectedEmotion={currentEmotion}
          onSelect={setCurrentEmotion}
        />

        {/* 캐릭터 정보 섹션 */}
        <CharacterInfoSection
          character={character}
          onEditName={() => openModal(character.name)}
          getLevelName={getLevelName}
          getCategoryName={getCategoryName}
          getCategoryIcon={getCategoryIcon}
        />

        {/* 캐릭터 설명 */}
        <View style={styles.descriptionSection}>
          <SectionTitle title="🌱 캐릭터 소개" />
          <Text style={styles.description}>
            {character.description || getCategoryDescription()}
          </Text>
        </View>
      </View>

      {/* 이름 변경 모달 */}
      <CharacterNameEditModal
        visible={showNameEditModal}
        name={newName}
        onNameChange={setName}
        onConfirm={handleNameChangeConfirm}
        onCancel={closeModal}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  backButtonIcon: {
    width: 24,
    height: 24,
    tintColor: colors.text.primary,
  },
  content: {
    padding: spacing[5],
    paddingTop: spacing[6],
  },
  descriptionSection: {
    marginBottom: spacing[6],
    padding: spacing[6],
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CharacterDetailScreen;
