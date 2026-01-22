/**
 * MissionVerificationModal 스타일
 * 미션 인증 방법 선택 모달 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createSecondaryTextStyle } from '../../utils/styles/textStyles';
import { modalStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  overlay: {
    ...modalStyles.overlay(),
    padding: spacing[5],
  },
  modalContainer: {
    ...modalStyles.content(),
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    marginBottom: spacing[4],
  },
  title: {
    ...createTextStyle('base', {
      fontWeight: typography.fontWeight.normal,
      color: colors.text.primary,
      marginBottom: spacing[2],
    }),
  },
  subtitle: {
    ...createSecondaryTextStyle('sm'),
  },
  optionsContainer: {
    gap: spacing[4],
    marginBottom: spacing[6],
  },
  requirementInfo: {
    backgroundColor: colors.gray[50],
    padding: spacing[3],
    borderRadius: borderRadius.base,
    marginBottom: spacing[3],
  },
  requirementLabel: {
    ...createTextStyle('xs', {
      fontWeight: typography.fontWeight.normal,
      color: colors.text.primary,
      marginBottom: spacing[1],
    }),
  },
  requirementValue: {
    ...createSecondaryTextStyle('xs'),
  },
  currentTime: {
    ...createTextStyle('xs', {
      color: colors.primary[500],
      fontWeight: typography.fontWeight.normal,
      marginTop: spacing[1],
    }),
  },
  resultBox: {
    padding: spacing[2],
    borderRadius: borderRadius.base,
    marginBottom: spacing[3],
  },
  resultSuccess: {
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  resultFail: {
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  resultText: {
    ...createTextStyle('xs', {
      color: colors.text.primary,
      textAlign: 'center',
    }),
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderRadius: borderRadius.base,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  optionButtonDisabled: {
    opacity: 0.6,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.base,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  optionIcon: {
    ...createTextStyle('xl'),
  },
  optionIconImage: {
    width: 24,
    height: 24,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    ...createTextStyle('base', {
      fontWeight: typography.fontWeight.normal,
      color: colors.text.primary,
      marginBottom: spacing[1],
    }),
  },
  optionDescription: {
    ...createSecondaryTextStyle('sm'),
  },
  cancelButton: {
    paddingVertical: spacing[2],
    alignItems: 'center',
  },
  cancelButtonText: {
    ...createSecondaryTextStyle('sm', {
      fontWeight: typography.fontWeight.normal,
    }),
  },
});
