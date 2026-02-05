/**
 * AlertModal 스타일
 * 알림 다이얼로그 모달 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../../utils/designTokens';
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
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: spacing[3],
    right: spacing[3],
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    ...createTextStyle('lg', {
      fontWeight: typography.fontWeight.semibold,
      color: colors.white,
    }),
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  title: {
    ...createTitleStyle('xl', {
      color: colors.white,
      textAlign: 'center',
      marginBottom: spacing[6],
    }),
  },
  titleIcon: {
    width: 28,
    height: 28,
    marginRight: -spacing[1],
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  icon: {
    width: 160,
    height: 160,
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
