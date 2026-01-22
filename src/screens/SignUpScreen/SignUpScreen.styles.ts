/**
 * SignUpScreen 스타일
 * 회원가입 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createTitleStyle, createBodyStyle, createSecondaryTextStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
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
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      marginBottom: spacing[3],
    }),
  },
  inputText: {
    ...createTextStyle('sm'),
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
  verifiedBadgeContainer: {
    marginTop: spacing[1],
    paddingLeft: spacing[1],
  },
  verifiedText: {
    ...createTextStyle('sm', {
      color: colors.green[600],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  emailRow: {
    flexDirection: 'row',
    gap: spacing[2],
    alignItems: 'flex-start',
  },
  emailInputWrapper: {
    flex: 1,
    minWidth: 0,
  },
  emailInputContainer: {
    marginBottom: 0,
  },
  emailInputHeight: {
    height: 36,
    paddingVertical: spacing[1],
  },
  verificationButton: {
    marginTop: spacing[1],
    height: 44,
    width: '100%',
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  verificationButtonInline: {
    height: 36,
    minWidth: 90,
    paddingHorizontal: spacing[2],
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  verificationButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  verificationButtonText: {
    ...createButtonTextStyle('sm'),
  },
  verificationButtonTextDisabled: {
    color: colors.gray[500],
  },
  verificationCodeContainer: {
    marginTop: spacing[4],
    gap: 0,
  },
  verificationCodeRow: {
    flexDirection: 'row',
    gap: spacing[2],
    alignItems: 'flex-start',
  },
  verificationCodeInputWrapper: {
    flex: 1,
    minWidth: 0,
    position: 'relative',
  },
  verificationCodeInputWithTimer: {
    paddingRight: 60,
  },
  timerInsideInput: {
    position: 'absolute',
    right: spacing[3],
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  timerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
    minWidth: 50,
  },
  timerContainerBelow: {
    marginTop: spacing[1],
    paddingTop: 0,
    alignItems: 'flex-start',
    paddingLeft: spacing[1],
  },
  verifyButtonInline: {
    height: 36,
    minWidth: 107,
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  timerText: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      color: colors.red[500],
    }),
  },
  verifyButton: {
    marginTop: 0,
    height: 44,
    width: '100%',
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  verifyButtonText: {
    ...createButtonTextStyle('sm'),
  },
  verifyButtonTextDisabled: {
    color: colors.gray[500],
  },
  buttonDisabled: {
    backgroundColor: colors.gray[300],
  },
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
  dropdownButton: {
    height: 44,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    paddingHorizontal: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownButtonText: {
    ...createTextStyle('sm', {
      textAlignVertical: 'center',
      ...(Platform.OS === 'android' && { paddingTop: 2 }),
    }),
  },
  dropdownPlaceholder: {
    color: colors.gray[400],
  },
  dropdownArrow: {
    fontSize: 12,
    color: colors.gray[400],
  },
  dropdownList: {
    marginTop: spacing[1],
    maxHeight: 200,
    backgroundColor: colors.white,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.gray[300],
    overflow: 'hidden',
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
    ...createTextStyle('sm'),
  },
  dropdownListItemTextSelected: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.semibold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    maxHeight: '70%',
    paddingBottom: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingTop: spacing[3],
    paddingBottom: spacing[1],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    ...createTitleStyle('lg', {
      fontWeight: typography.fontWeight.semibold,
    }),
  },
  modalCloseButton: {
    ...createTextStyle('sm', {
      color: colors.primary[500],
    }),
  },
  regionItem: {
    paddingTop: spacing[2],
    paddingBottom: spacing[2],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  regionItemFirst: {
    paddingTop: spacing[1],
  },
  regionItemSelected: {
    backgroundColor: colors.primary[50],
  },
  regionItemText: {
    ...createBodyStyle('base'),
  },
  regionItemTextSelected: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.semibold,
  },
  modalListContent: {
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: 0,
    marginBottom: 0,
  },
});
