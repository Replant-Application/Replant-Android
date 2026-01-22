/**
 * LoginScreen 스타일
 * 로그인 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform, Dimensions } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/styles/textStyles';
import { createTextStyle, createTitleStyle, createBodyStyle, createSecondaryTextStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { inputStyles, buttonStyles } from '../../utils/styles/commonStyles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 반응형 상수 계산
const RESPONSIVE_PADDING_H = Math.min(spacing[6], SCREEN_WIDTH * 0.05);
const RESPONSIVE_LOGO_SIZE = Math.min(280, SCREEN_WIDTH * 0.7, SCREEN_HEIGHT * 0.35);
const RESPONSIVE_INPUT_HEIGHT = Math.max(44, SCREEN_HEIGHT * 0.06);
const RESPONSIVE_INPUT_PADDING_H = Math.min(spacing[4], SCREEN_WIDTH * 0.04);
const RESPONSIVE_INPUT_PADDING_V = Math.max(spacing[2], SCREEN_HEIGHT * 0.01);
const RESPONSIVE_BUTTON_HEIGHT = Math.max(44, SCREEN_HEIGHT * 0.055);
const RESPONSIVE_CHECKBOX_SIZE = Math.max(20, SCREEN_WIDTH * 0.05);
const RESPONSIVE_SOCIAL_ICON_SIZE = Math.max(48, SCREEN_WIDTH * 0.12);
const RESPONSIVE_SOCIAL_ICON_RADIUS = Math.max(24, SCREEN_WIDTH * 0.06);
const RESPONSIVE_SOCIAL_IMAGE_SIZE = Math.max(24, SCREEN_WIDTH * 0.06);
const RESPONSIVE_MODAL_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 350);
const RESPONSIVE_MODAL_MAX_WIDTH = Math.min(350, SCREEN_WIDTH * 0.9);
const RESPONSIVE_MODAL_PADDING = Math.min(spacing[5], SCREEN_WIDTH * 0.05);
const RESPONSIVE_MODAL_CHARACTER_SIZE = Math.max(70, SCREEN_WIDTH * 0.18);
const RESPONSIVE_TOP_MARGIN = Math.max(spacing[2], SCREEN_HEIGHT * 0.02);
const RESPONSIVE_INPUT_MARGIN = Math.max(spacing[3], SCREEN_HEIGHT * 0.02);
const RESPONSIVE_OPTIONS_MARGIN = Math.max(spacing[5], SCREEN_HEIGHT * 0.025);
const RESPONSIVE_SOCIAL_MARGIN = Math.max(spacing[3], SCREEN_HEIGHT * 0.02);

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingHorizontal: RESPONSIVE_PADDING_H,
    justifyContent: 'center',
  },
  topSection: {
    alignItems: 'center',
    marginBottom: RESPONSIVE_TOP_MARGIN,
  },
  bottomSection: {
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing[1],
  },
  logo: {
    width: RESPONSIVE_LOGO_SIZE,
    height: RESPONSIVE_LOGO_SIZE,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize['2xl']),
  },
  inputContainer: {
    marginBottom: RESPONSIVE_INPUT_MARGIN,
  },
  input: {
    ...inputStyles.base(),
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.base,
    paddingHorizontal: RESPONSIVE_INPUT_PADDING_H,
    paddingVertical: RESPONSIVE_INPUT_PADDING_V,
    fontSize: typography.fontSize.sm,
    height: RESPONSIVE_INPUT_HEIGHT,
    lineHeight: 22,
    letterSpacing: 1,
    textAlignVertical: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: RESPONSIVE_OPTIONS_MARGIN,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  checkbox: {
    width: RESPONSIVE_CHECKBOX_SIZE,
    height: RESPONSIVE_CHECKBOX_SIZE,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary[700], // WCAG AA 대비율 개선
  },
  checkmark: {
    color: colors.text.inverse,
    fontSize: 12,
    fontWeight: typography.fontWeight.medium,
  },
  checkboxLabel: {
    ...createTextStyle('sm', {
      lineHeight: 22,
    }),
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[2],
    marginBottom: spacing[8],
    paddingVertical: spacing[1],
  },
  footerLink: {
    paddingHorizontal: spacing[2],
  },
  footerLinkText: {
    ...createSecondaryTextStyle('sm'),
  },
  footerSeparator: {
    ...createSecondaryTextStyle('sm', {
      marginHorizontal: spacing[1],
    }),
  },
  loginButton: {
    ...buttonStyles.primary(),
    width: '100%',
    height: RESPONSIVE_BUTTON_HEIGHT,
    backgroundColor: colors.primary[700], // WCAG AA 대비율 개선
    borderRadius: borderRadius.base,
    marginBottom: spacing[2],
  },
  loginButtonDisabled: {
    opacity: 0.6,
    backgroundColor: colors.gray[300],
  },
  loginButtonText: {
    ...createButtonTextStyle('sm', {
      lineHeight: 22,
    }),
  },
  signUpButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[8],
    paddingVertical: spacing[2],
  },
  linkText: {
    ...createSecondaryTextStyle('sm', {
      textDecorationLine: 'underline',
      lineHeight: 22,
    }),
  },
  socialSection: {
    alignItems: 'center',
    marginTop: RESPONSIVE_SOCIAL_MARGIN,
  },
  socialTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing[4],
  },
  socialTitleLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  socialTitle: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.normal,
      marginHorizontal: spacing[3],
      lineHeight: 22,
    }),
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[4],
  },
  socialIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIconCircle: {
    width: RESPONSIVE_SOCIAL_ICON_SIZE,
    height: RESPONSIVE_SOCIAL_ICON_SIZE,
    borderRadius: RESPONSIVE_SOCIAL_ICON_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIconText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  socialIconImage: {
    width: RESPONSIVE_SOCIAL_IMAGE_SIZE,
    height: RESPONSIVE_SOCIAL_IMAGE_SIZE,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: RESPONSIVE_MODAL_PADDING,
    width: RESPONSIVE_MODAL_WIDTH,
    maxWidth: RESPONSIVE_MODAL_MAX_WIDTH,
    alignItems: 'center',
  },
  modalCharacterContainer: {
    width: RESPONSIVE_MODAL_CHARACTER_SIZE,
    height: RESPONSIVE_MODAL_CHARACTER_SIZE,
    marginBottom: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCharacter: {
    width: '100%',
    height: '100%',
  },
  modalTextContainer: {
    alignItems: 'center',
    marginBottom: spacing[5],
  },
  modalUserName: {
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[600],
  },
  modalMessage: {
    ...createTitleStyle('lg', {
      textAlign: 'center',
      lineHeight: 22,
    }),
  },
  modalButton: {
    ...buttonStyles.primary(),
    width: '100%',
    height: RESPONSIVE_BUTTON_HEIGHT,
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.base,
  },
  modalButtonText: {
    ...createButtonTextStyle('base', {
      lineHeight: 22,
    }),
  },
});
