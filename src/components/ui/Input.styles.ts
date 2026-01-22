/**
 * Input 스타일
 * 재사용 가능한 입력 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createTitleStyle, createErrorTextStyle } from '../../utils/styles/textStyles';
import { inputStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },

  label: {
    ...createTitleStyle('sm', {
      marginBottom: spacing[1],
    }),
    lineHeight: 22,
  },

  input: {
    ...inputStyles.base(),
    ...createTextStyle('base', {
      textAlign: 'left', // 한글 입력을 위해 명시적으로 설정
      lineHeight: 22,
      letterSpacing: 0,
      textAlignVertical: 'center', // Android 수직 정렬
    }),
  },

  // Sizes
  sm: {
    height: 32,
    paddingVertical: spacing[1],
  },
  base: {
    height: 40,
    paddingVertical: spacing[2],
  },
  lg: {
    height: 48,
    paddingVertical: spacing[3],
  },

  // States
  focused: {
    ...inputStyles.focused(),
  },

  error: {
    ...inputStyles.error(),
  },

  multiline: {
    height: 'auto',
    minHeight: 40,
    textAlignVertical: 'top',
  },

  errorText: {
    ...createErrorTextStyle('sm', {
      marginTop: spacing[1],
      lineHeight: 22,
    }),
  },
});
