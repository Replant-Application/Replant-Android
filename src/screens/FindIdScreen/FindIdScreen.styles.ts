/**
 * FindIdScreen 스타일
 * 아이디 찾기 화면의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createTitleStyle, createSecondaryTextStyle, createButtonTextStyle, createErrorTextStyle } from '../../utils/styles/textStyles';
import { inputStyles, buttonStyles } from '../../utils/styles/commonStyles';

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
    ...createTitleStyle('sm', {
      marginBottom: spacing[3],
    }),
  },
  inputText: {
    ...inputStyles.base(),
  },
  errorText: {
    ...createErrorTextStyle('xs', {
      marginTop: -5,
    }),
  },
  buttonContainer: {
    padding: spacing[5],
    paddingBottom: spacing[10],
    gap: spacing[3],
  },
  button: {
    ...buttonStyles.primary(),
    height: 44,
    width: '100%',
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary[700],
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
