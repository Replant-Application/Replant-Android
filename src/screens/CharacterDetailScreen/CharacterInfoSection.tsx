/**
 * 캐릭터 정보 섹션 컴포넌트
 * 캐릭터 이름, 레벨, 카테고리, 경험치 정보 표시
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { ProgressBar } from '../../components/ui';
import { Character } from '../../types';

interface CharacterInfoSectionProps {
  character: Character;
  onEditName: () => void;
  getLevelName: (level: number) => string;
  getCategoryName: () => string;
  getCategoryIcon: () => string;
}

const CharacterInfoSection: React.FC<CharacterInfoSectionProps> = ({
  character,
  onEditName,
  getLevelName,
  getCategoryName,
  getCategoryIcon,
}) => {
  return (
    <View style={styles.container}>
      {/* 1. 캐릭터 이름 */}
      <View style={styles.nameSection}>
        <Text style={styles.name}>{character.name}</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={onEditName}
        >
          <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>
      </View>

      {/* 2. 레벨 정보 */}
      <View style={styles.levelSection}>
        <Text style={styles.levelText}>Lv.{character.level || 1}</Text>
        <Text style={styles.levelName}>{getLevelName(character.level || 1)}</Text>
      </View>

      {/* 3. 카테고리 정보 */}
      <View style={styles.categorySection}>
        <Text style={styles.categoryIcon}>{getCategoryIcon()}</Text>
        <Text style={styles.categoryName}>{getCategoryName()}</Text>
      </View>

      {/* 4. 경험치 바 */}
      <View style={styles.experienceSection}>
        <ProgressBar
          current={character.experience || 0}
          max={100}
          showPercentage={false}
          showRemaining={false}
          color={colors.primary[500]}
          height={12}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[5],
    gap: spacing[2],
  },
  name: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize['2xl']),
  },
  editButton: {
    padding: spacing[2],
  },
  editIcon: {
    fontSize: typography.fontSize.base,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
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
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[500],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xl),
  },
  levelName: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
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
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  categoryName: {
    fontSize: typography.fontSize.base,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  experienceSection: {
    width: '100%',
  },
});

export default CharacterInfoSection;
