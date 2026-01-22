/**
 * NicknameScreen 스타일
 * 닉네임 입력 화면의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing } from '../../utils/designTokens';
import { createTextStyle, createTitleStyle, createSecondaryTextStyle } from '../../utils/styles/textStyles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    justifyContent: 'space-between',
    padding: spacing[5],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...createTitleStyle('2xl', {
      marginBottom: spacing[4],
      textAlign: 'center',
    }),
  },
  subtitle: {
    ...createSecondaryTextStyle('base', {
      textAlign: 'center',
      marginBottom: spacing[10],
    }),
  },
  input: {
    // textAlign은 Input 컴포넌트에서 처리
  },
  buttonContainer: {
    paddingBottom: spacing[10],
    gap: spacing[3],
  },
  button: {
    width: '100%',
  },
  backToSocialButton: {
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  backToSocialText: {
    ...createSecondaryTextStyle('sm', {
      textDecorationLine: 'underline',
    }),
  },
});
