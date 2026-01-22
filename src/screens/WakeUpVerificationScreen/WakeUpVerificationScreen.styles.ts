/**
 * WakeUpVerificationScreen 스타일
 * 기상 미션 인증 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/styles/textStyles';
import { createTextStyle, createTitleStyle, createBodyStyle, createSecondaryTextStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { cardStyles, buttonStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing[4],
    ...createBodyStyle('base', {
      color: colors.text.secondary,
    }),
  },
  content: {
    flex: 1,
    padding: spacing[4],
    justifyContent: 'center',
  },
  missionCard: {
    ...cardStyles.base(),
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginRight: spacing[4],
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    ...createTitleStyle('lg', {
      fontWeight: typography.fontWeight.medium,
      marginBottom: spacing[2],
    }),
  },
  missionDescription: {
    ...createSecondaryTextStyle('sm', {
      lineHeight: getOptimizedLineHeight(typography.fontSize.sm) * 1.4,
    }),
  },
  timerCard: {
    ...cardStyles.base(),
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[5],
    marginBottom: spacing[4],
    alignItems: 'center',
  },
  timerLabel: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.medium,
      marginBottom: spacing[4],
    }),
  },
  timerDisplay: {
    width: '100%',
    alignItems: 'center',
  },
  timerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  timerScreen: {
    backgroundColor: '#1a1a1a',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[6],
    paddingHorizontal: spacing[6],
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.green[500],
    borderStyle: 'solid',
  },
  timerScreenWarning: {
    borderColor: colors.error[500],
    backgroundColor: '#2a1a1a',
  },
  timerScreenExpired: {
    borderColor: colors.error[500],
    backgroundColor: '#2a1a1a',
  },
  timerDigits: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: {
    fontSize: 48,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.green[500],
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: 56,
    letterSpacing: 4,
    textShadowColor: colors.green[500],
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  digitWarning: {
    color: colors.error[500],
    textShadowColor: colors.error[500],
    textShadowRadius: 15,
  },
  colon: {
    fontSize: 48,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.green[500],
    marginHorizontal: spacing[2],
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: 56,
  },
  expiredText: {
    ...createTitleStyle('xl', {
      fontWeight: typography.fontWeight.medium,
      color: colors.error[500],
    }),
  },
  progressContainer: {
    width: '100%',
    marginTop: spacing[2],
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.green[500],
    borderRadius: borderRadius.full,
  },
  progressFillWarning: {
    backgroundColor: colors.warning,
  },
  expiredMessage: {
    marginTop: spacing[3],
    ...createTextStyle('sm', {
      color: colors.error[500],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  warningMessage: {
    marginTop: spacing[3],
    ...createTextStyle('sm', {
      color: colors.warning,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  verifyButton: {
    ...buttonStyles.primary(),
    backgroundColor: colors.green[500],
    borderRadius: borderRadius.base,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    marginBottom: spacing[4],
    minHeight: 40,
  },
  verifyButtonDisabled: {
    backgroundColor: colors.gray[400],
    opacity: 0.6,
  },
  verifyButtonText: {
    ...createButtonTextStyle('lg', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  infoContainer: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.base,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  infoText: {
    ...createSecondaryTextStyle('sm', {
      lineHeight: getOptimizedLineHeight(typography.fontSize.sm) * 1.5,
      textAlign: 'center',
    }),
  },
});
