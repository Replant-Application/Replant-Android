/**
 * AdminUserEditScreen 스타일
 * 유저 수정 화면의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTitleStyle, createSecondaryTextStyle, createButtonTextStyle } from '../../utils/styles/textStyles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[5],
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: spacing[5],
  },
  inputSection: {
    marginBottom: spacing[5],
  },
  label: {
    ...createTitleStyle('sm', {
      color: colors.text.secondary,
      marginBottom: spacing[2],
    }),
  },
  input: {
    backgroundColor: colors.background.primary,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  roleButton: {
    flex: 1,
    padding: spacing[3],
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  roleButtonText: {
    ...createSecondaryTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  roleButtonTextActive: {
    ...createButtonTextStyle('base', {
      color: colors.text.inverse,
    }),
  },
  buttonContainer: {
    padding: spacing[5],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  saveButton: {
    width: '100%',
  },
  backButtonIcon: {
    width: 24,
    height: 24,
  },
});
