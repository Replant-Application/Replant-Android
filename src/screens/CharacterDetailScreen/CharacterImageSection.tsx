/**
 * 캐릭터 이미지 섹션 컴포넌트
 * 캐릭터 이미지 표시 및 다운로드 기능
 */

import React, { RefObject } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { getCharacterImage } from '../../utils/characterUtils';
import { Character } from '../../types';

interface CharacterImageSectionProps {
  character: Character;
  currentEmotion: string;
  imageRef: RefObject<Image>;
  downloading: boolean;
  onDownload: () => void;
}

const CharacterImageSection: React.FC<CharacterImageSectionProps> = ({
  character,
  currentEmotion,
  imageRef,
  downloading,
  onDownload,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          ref={imageRef}
          source={getCharacterImage(character.level || 1, currentEmotion)}
          style={styles.image}
          resizeMode="contain"
          accessibilityLabel={`${character.name || '캐릭터'} 이미지`}
        />
      </View>

      {/* 이미지 다운로드 버튼 */}
      <TouchableOpacity
        style={[styles.downloadButton, downloading && styles.downloadButtonDisabled]}
        onPress={onDownload}
        disabled={downloading}
      >
        {downloading ? (
          <Text style={styles.downloadButtonIcon}>⏳</Text>
        ) : (
          <Image
            source={require('../../assets/images/download-icon.jpg')}
            style={styles.downloadIconImage}
            resizeMode="contain"
            accessibilityLabel="다운로드 아이콘"
          />
        )}
        <Text style={styles.downloadButtonText}>
          {downloading ? '다운로드 중...' : '다운로드'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  imageContainer: {
    width: 180,
    height: 180,
    marginBottom: spacing[2],
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: '90%',
    height: '90%',
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
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  downloadIconImage: {
    width: 20,
    height: 20,
  },
  downloadButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
});

export default CharacterImageSection;
