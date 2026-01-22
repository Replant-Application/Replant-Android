/**
 * FindPasswordScreen 스타일
 * 비밀번호 찾기 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { createTextStyle, createSecondaryTextStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { inputStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[5],
    paddingTop: spacing[2],
    paddingBottom: spacing[24],
  },
  content: {
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.sm,
    padding: spacing[3],
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: colors.primary[200],
    gap: spacing[4],
  },
  logoIcon: {
    width: 24,
    height: 24,
  },
  infoText: {
    flex: 1,
    ...createTextStyle('sm', {
      color: colors.primary[700],
      letterSpacing: -1,
    }),
  },
  inputContainer: {
    marginBottom: spacing[3],
  },
  label: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.primary,
      marginBottom: spacing[3],
    }),
  },
  inputText: {
    ...inputStyles.base(),
  },
  inputDisabled: {
    backgroundColor: colors.gray[100],
    color: colors.text.secondary,
  },
  errorText: {
    ...createTextStyle('xs', {
      color: colors.red[500],
      marginTop: -5,
    }),
  },
  resetButton: {
    alignSelf: 'flex-end',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    marginTop: spacing[2],
  },
  resetButtonText: {
    ...createSecondaryTextStyle('sm', {
      textDecorationLine: 'underline',
    }),
  },
  buttonContainer: {
    padding: spacing[5],
    paddingBottom: spacing[10],
    gap: spacing[3],
  },
  button: {
    height: 44,
    width: '100%',
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary[500],
  },
  buttonText: {
    ...createButtonTextStyle('sm'),
  },
  linkButton: {
    paddingVertical: spacing[2],
    alignItems: 'center',
  },
  linkText: {
    ...createSecondaryTextStyle('sm', {
      textDecorationLine: 'underline',
    }),
  },
  backButton: {
    padding: spacing[2],
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonIcon: {
    width: 24,
    height: 24,
  },
});
