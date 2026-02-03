/**
 * SoundSettingsScreen 스타일
 * 사운드 설정 화면의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { createTextStyle, createSecondaryTextStyle } from '../../utils/styles/textStyles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[5],
    paddingBottom: 120,
  },
  settingsCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  volumeSection: {
    paddingVertical: spacing[3],
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  volumeIcon: {
    width: 32,
    height: 32,
  },
  volumeLabel: {
    flex: 1,
    ...createTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.primary,
    }),
  },
  volumeValue: {
    ...createSecondaryTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
      minWidth: 45,
      textAlign: 'right',
    }),
  },
  /** 미션 인증글과 동일: 트랙·채움·썸 슬라이더 */
  sliderContainer: {
    marginBottom: spacing[1],
  },
  sliderTrack: {
    width: '100%',
    height: 20,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.gray[300],
    position: 'relative' as const,
    marginTop: 0,
    marginBottom: spacing[3],
    justifyContent: 'center',
  },
  sliderFill: {
    position: 'absolute' as const,
    height: 16,
    borderRadius: borderRadius.sm,
    left: 0,
    top: 0,
  },
  sliderThumb: {
    position: 'absolute' as const,
    width: 22,
    height: 22,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginLeft: -10,
    top: -2,
    ...shadows.lg,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing[2],
  },
  resetButton: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  resetButtonText: {
    ...createSecondaryTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
});
