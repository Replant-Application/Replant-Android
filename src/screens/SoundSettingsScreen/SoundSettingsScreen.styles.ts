/**
 * SoundSettingsScreen 스타일
 * 사운드 설정 화면의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
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
    ...createSecondaryTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      minWidth: 45,
      textAlign: 'right',
    }),
  },
  slider: {
    width: '100%',
    height: 40,
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
