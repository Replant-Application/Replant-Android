/**
 * OAuthCompleteSignUpScreen 스타일
 * OAuth 회원가입 완료 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/styles/textStyles';
import { createTextStyle, createSecondaryTextStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { inputStyles } from '../../utils/styles/commonStyles';
import { dropdownStyles } from '../../utils/styles/componentStyles';

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
      letterSpacing: -0.5,
      lineHeight: getOptimizedLineHeight(typography.fontSize.sm) * 1.3,
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
  errorText: {
    ...createTextStyle('xs', {
      color: colors.red[500],
      marginTop: 3,
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
  skipButton: {
    padding: spacing[2],
  },
  skipButtonText: {
    ...createSecondaryTextStyle('sm'),
  },
  // 성별 선택 스타일
  genderContainer: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  genderButton: {
    flex: 1,
    height: 100,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderButtonSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  genderButtonText: {
    ...createTextStyle('sm', {
      color: colors.text.secondary,
      textAlignVertical: 'center',
      ...(Platform.OS === 'android' && { paddingTop: 2 }),
    }),
  },
  genderButtonTextSelected: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.semibold,
  },
  // 드롭다운 스타일
  dropdownButton: {
    ...dropdownStyles.button(),
    backgroundColor: colors.white,
  },
  dropdownButtonText: {
    ...dropdownStyles.buttonText(),
    textAlignVertical: 'center',
    ...(Platform.OS === 'android' && { paddingTop: 2 }),
  },
  dropdownPlaceholder: {
    ...dropdownStyles.placeholder(),
  },
  dropdownArrow: {
    ...createTextStyle('xs', {
      color: colors.gray[400],
    }),
  },
  dropdownList: {
    ...dropdownStyles.list(),
    backgroundColor: colors.white,
  },
  dropdownScrollView: {
    maxHeight: 200,
  },
  dropdownListItem: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  dropdownListItemFirst: {
    paddingTop: spacing[2],
  },
  dropdownListItemSelected: {
    backgroundColor: colors.primary[50],
  },
  dropdownListItemText: {
    ...createTextStyle('sm', {
      color: colors.text.primary,
    }),
  },
  dropdownListItemTextSelected: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.semibold,
  },
});
