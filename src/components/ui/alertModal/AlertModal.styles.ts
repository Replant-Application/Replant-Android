/**
 * AlertModal 스타일
 * 알림 다이얼로그 모달 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../../utils/designTokens';
import { createTextStyle, createTitleStyle, createButtonTextStyle } from '../../../utils/styles/textStyles';
import { modalStyles, buttonStyles } from '../../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  overlay: {
    ...modalStyles.overlay(),
  },
  modalContainer: {
    ...modalStyles.content(),
    backgroundColor: colors.gray[800],
    width: 350,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  icon: {
    width: 70,
    height: 70,
  },
  title: {
    ...createTitleStyle('xl', {
      color: colors.white,
      marginBottom: spacing[3],
      textAlign: 'center',
    }),
  },
  message: {
    ...createTextStyle('base', {
      color: colors.gray[300],
      marginBottom: spacing[6],
      textAlign: 'center',
    }),
  },
  button: {
    ...buttonStyles.primary(),
    paddingVertical: spacing[2],
    borderRadius: borderRadius.xl,
    backgroundColor: colors.green[600],
  },
  buttonText: {
    ...createButtonTextStyle('base'),
  },
});
