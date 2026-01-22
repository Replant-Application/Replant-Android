/**
 * ChangePasswordScreen 스타일
 * 비밀번호 변경 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/styles/textStyles';
import { createTextStyle, createSecondaryTextStyle } from '../../utils/styles/textStyles';
import { inputStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing[10],
  },
  content: {
    padding: spacing[5],
  },
  infoBox: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  infoText: {
    ...createSecondaryTextStyle('base', {
      textAlign: 'center',
      lineHeight: getOptimizedLineHeight(typography.fontSize.base) * 1.5,
    }),
  },
  form: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[12],
    ...shadows.lg,
  },
  inputContainer: {
    marginBottom: spacing[4],
  },
  inputText: {
    ...inputStyles.base(),
    fontSize: typography.fontSize.base,
  },
  buttonContainer: {
    marginTop: spacing[6],
  },
  changeButton: {
    width: '100%',
  },
});
