/**
 * CounselingSelectScreen 스타일
 * 상담 서비스 선택 화면의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { createTextStyle, createTitleStyle, createSecondaryTextStyle } from '../../utils/styles/textStyles';

export const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing[6],
  },
  backButtonIcon: {
    width: 24,
    height: 24,
    tintColor: colors.text.primary,
  },
  content: {
    padding: spacing[5],
  },
  title: {
    ...createTitleStyle('xxl', {
      marginBottom: spacing[2],
      textAlign: 'center',
    }),
  },
  subtitle: {
    ...createSecondaryTextStyle('base', {
      marginBottom: spacing[6],
      textAlign: 'center',
    }),
  },
  counselingCard: {
    marginBottom: spacing[5],
  },
  counselingCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[1],
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: '#FFF8E7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
    borderWidth: 2,
    borderColor: '#D4A574',
    ...shadows.sm,
  },
  cardIconImage: {
    width: 32,
    height: 32,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    ...createTitleStyle('lg', {
      marginBottom: spacing[1],
    }),
  },
  cardDescription: {
    ...createSecondaryTextStyle('sm'),
  },
  cardArrow: {
    marginLeft: spacing[2],
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
  infoCard: {
    marginTop: spacing[2],
  },
  infoTitle: {
    ...createTitleStyle('base', {
      marginBottom: spacing[3],
    }),
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  infoBullet: {
    ...createTextStyle('sm', {
      color: '#8B6F47',
      marginRight: spacing[2],
      marginTop: 2,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  infoText: {
    flex: 1,
    ...createSecondaryTextStyle('sm'),
  },
});
