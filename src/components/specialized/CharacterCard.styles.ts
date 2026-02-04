/**
 * CharacterCard 스타일
 * 캐릭터 카드 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { createTextStyle, createSecondaryTextStyle, createTitleStyle } from '../../utils/styles/textStyles';
import { cardStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  container: {
    ...cardStyles.base(),
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.base,
  },
  selected: {
    borderColor: colors.primary[500],
    borderWidth: 2,
    backgroundColor: colors.primary[100],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  characterImageContainer: {
    width: 60,
    height: 60,
    marginRight: spacing[3],
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.background.secondary,
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
  },
  name: {
    ...createTitleStyle('lg', {
      marginBottom: spacing[1],
    }),
  },
  level: {
    ...createSecondaryTextStyle('sm'),
  },
  progressContainer: {
    marginTop: spacing[2],
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[1],
  },
  levelText: {
    ...createTextStyle('sm', {
      color: colors.primary[500],
    }),
  },
  expText: {
    ...createSecondaryTextStyle('sm'),
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: spacing[1],
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.sm,
  },
  nextLevelText: {
    ...createSecondaryTextStyle('xs', {
      textAlign: 'center',
    }),
  },
});
