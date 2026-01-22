/**
 * GenderSelector 스타일
 * 성별 선택 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../../utils/designTokens';
import { createTextStyle, createTitleStyle, createErrorTextStyle } from '../../../utils/styles/textStyles';

export const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: spacing[4],
  },
  label: {
    ...createTitleStyle('base', {
      marginBottom: spacing[2],
    }),
  },
  genderContainer: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  genderButton: {
    flex: 1,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderButtonSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  genderButtonText: {
    ...createTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.secondary,
    }),
  },
  genderButtonTextSelected: {
    ...createTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
      color: colors.primary[700],
    }),
  },
  errorText: {
    ...createErrorTextStyle('sm', {
      marginTop: spacing[1],
    }),
  },
});
