import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Image, TextInput, Modal, Animated, Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { SCREEN_NAMES } from '../../constants/screens';
import { AlertModal } from '../../components/ui';
import { useLoginScreenContainer } from './LoginScreen.container';

interface LoginScreenProps {
  onNavigate: (screen: string) => void;
}

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

const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    email,
    password,
    isLoading,
    keepLoggedIn,
    showSuccessModal,
    userName,
    showAlert,
    alertTitle,
    alertMessage,
    modalScaleAnim,
    modalFadeAnim,
    setEmail,
    setPassword,
    setKeepLoggedIn,
    handleLogin,
    handleKakaoLogin,
    handleGoogleLogin,
    handleSuccessModalClose,
    handleSuccessModalRequestClose,
    handleCloseAlert,
  } = useLoginScreenContainer({ onNavigate });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.topSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/Replant_Loading.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="Replant 로고"
            />
          </View>
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="이메일을 입력하세요"
              placeholderTextColor={colors.gray[500]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              blurOnSubmit={false}
              style={styles.input}
              accessibilityLabel="이메일"
              accessibilityHint="이메일 주소를 입력하세요"
              allowFontScaling={true}
              {...(Platform.OS === 'android' && { includeFontPadding: false })}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="비밀번호를 입력하세요"
              placeholderTextColor={colors.gray[500]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              blurOnSubmit={true}
              style={styles.input}
              accessibilityLabel="비밀번호"
              accessibilityHint="비밀번호를 입력하세요"
              allowFontScaling={true}
              {...(Platform.OS === 'android' && { includeFontPadding: false })}
            />
          </View>

          <View style={styles.optionsRow}>
            <TouchableOpacity
              onPress={() => setKeepLoggedIn(!keepLoggedIn)}
              style={styles.checkboxRow}
              accessibilityRole="checkbox"
              accessibilityLabel="로그인 유지"
              accessibilityState={{ checked: keepLoggedIn }}
            >
              <View style={[styles.checkbox, keepLoggedIn && styles.checkboxChecked]}>
                {keepLoggedIn && <Text style={styles.checkmark} accessibilityElementsHidden={true}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>로그인 유지</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={isLoading ? '처리 중' : '이메일로 로그인'}
            accessibilityState={{ disabled: isLoading }}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? '처리 중...' : '이메일로 로그인'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footerLinks}>
            <TouchableOpacity
              onPress={() => onNavigate(SCREEN_NAMES.FIND_PASSWORD as string)}
              style={styles.footerLink}
              accessibilityRole="button"
              accessibilityLabel="비밀번호 찾기"
            >
              <Text style={styles.footerLinkText}>비밀번호 찾기</Text>
            </TouchableOpacity>
            <Text style={styles.footerSeparator} accessibilityElementsHidden={true}>|</Text>
            <TouchableOpacity
              onPress={() => onNavigate(SCREEN_NAMES.FIND_ID as string)}
              style={styles.footerLink}
              accessibilityRole="button"
              accessibilityLabel="아이디 찾기"
            >
              <Text style={styles.footerLinkText}>아이디 찾기</Text>
            </TouchableOpacity>
            <Text style={styles.footerSeparator} accessibilityElementsHidden={true}>|</Text>
            <TouchableOpacity
              onPress={() => onNavigate(SCREEN_NAMES.SIGNUP as string)}
              style={styles.footerLink}
              accessibilityRole="button"
              accessibilityLabel="회원가입"
            >
              <Text style={styles.footerLinkText}>회원가입</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.socialSection}>
            <View style={styles.socialTitleContainer}>
              <View style={styles.socialTitleLine} />
              <Text style={styles.socialTitle}>간편로그인</Text>
              <View style={styles.socialTitleLine} />
            </View>
            <View style={styles.socialIcons}>
              <TouchableOpacity 
                style={styles.socialIcon}
                onPress={handleKakaoLogin}
                disabled={isLoading}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="카카오로 로그인"
                accessibilityState={{ disabled: isLoading }}
              >
                <View style={[styles.socialIconCircle, { backgroundColor: '#FEE500' }]}>
                  <Image
                    source={require('../../assets/images/kakao_logo.png')}
                    style={styles.socialIconImage}
                    resizeMode="contain"
                    accessibilityElementsHidden={true}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.socialIcon}
                onPress={handleGoogleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="구글로 로그인"
                accessibilityState={{ disabled: isLoading }}
              >
                <View style={[styles.socialIconCircle, { backgroundColor: colors.background.primary, borderWidth: 1, borderColor: colors.border.light }]}>
                  <Image
                    source={require('../../assets/images/google_logo.png')}
                    style={styles.socialIconImage}
                    resizeMode="contain"
                    accessibilityElementsHidden={true}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleSuccessModalRequestClose}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: modalFadeAnim }]}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ scale: modalScaleAnim }],
              },
            ]}
          >
            <View style={styles.modalCharacterContainer}>
              <FastImage
                source={require('../../assets/images/smile_replant.gif')}
                style={styles.modalCharacter}
                resizeMode={FastImage.resizeMode.contain}
                accessibilityLabel="환영하는 캐릭터"
              />
            </View>
            <View style={styles.modalTextContainer}>
              <Text style={styles.modalMessage}>
                환영합니다! <Text style={styles.modalUserName}>{userName}</Text>님,{'\n'}
                함께 성장해요 🌱
              </Text>
            </View>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleSuccessModalClose}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="시작하기"
            >
              <Text style={styles.modalButtonText}>시작하기</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>

      <AlertModal
        visible={showAlert}
        title={alertTitle}
        message={alertMessage}
        onClose={handleCloseAlert}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.base,
    paddingHorizontal: RESPONSIVE_INPUT_PADDING_H,
    paddingVertical: RESPONSIVE_INPUT_PADDING_V,
    fontSize: typography.fontSize.sm,
    height: RESPONSIVE_INPUT_HEIGHT,
    color: colors.text.primary,
    lineHeight: 22,
    letterSpacing: 1,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
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
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    lineHeight: 22,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
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
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  footerSeparator: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginHorizontal: spacing[1],
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  loginButton: {
    width: '100%',
    height: RESPONSIVE_BUTTON_HEIGHT,
    backgroundColor: colors.primary[700], // WCAG AA 대비율 개선
    borderRadius: borderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  loginButtonDisabled: {
    opacity: 0.6,
    backgroundColor: colors.gray[300],
  },
  loginButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.inverse,
    lineHeight: 22,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  signUpButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[8],
    paddingVertical: spacing[2],
  },
  linkText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textDecorationLine: 'underline',
    lineHeight: 22,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
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
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    marginHorizontal: spacing[3],
    lineHeight: 22,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
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
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  modalButton: {
    width: '100%',
    height: RESPONSIVE_BUTTON_HEIGHT,
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: typography.fontSize.base,
    lineHeight: 22,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.inverse,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
});

export default LoginScreen;
