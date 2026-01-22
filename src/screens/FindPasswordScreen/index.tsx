import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Button, Input, Header } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { SCREEN_NAMES } from '../../utils/constants';
import { useFindPasswordScreenContainer } from './FindPasswordScreen.container';

interface FindPasswordScreenProps {
  onNavigate: (screen: string, params?: any) => void;
}

const FindPasswordScreen: React.FC<FindPasswordScreenProps> = ({ onNavigate }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    step,
    email,
    verificationCode,
    isLoading,
    errors,
    handleEmailChange,
    handleVerificationCodeChange,
    handleSendVerification,
    handleVerifyEmail,
    handleGenPassword,
    handleReset,
    handleGoToLogin,
  } = useFindPasswordScreenContainer({ onNavigate });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header
        title="비밀번호 찾기"
        leftButton={
          <TouchableOpacity
            onPress={handleGoToLogin}
            style={styles.backButton}
          >
            <Image
              source={require('../../assets/images/left.png')}
              style={styles.backButtonIcon}
              resizeMode="contain"
              accessibilityLabel="뒤로 가기"
            />
          </TouchableOpacity>
        }
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.infoBox}>
            <Image
              source={require('../../assets/images/RePlant_Logo.png')}
              style={styles.logoIcon}
              resizeMode="contain"
              accessibilityLabel="RePlant 로고"
            />
            <Text style={styles.infoText} numberOfLines={3}>
              {step === 'email' && '이메일을 입력하시면 인증번호를 보내드립니다.'}
              {step === 'verification' && '이메일로 발송된 인증번호를 입력해주세요.'}
              {step === 'complete' && '인증이 완료되었습니다.\n임시 비밀번호를 발급받으세요.'}
            </Text>
          </View>

          {/* 1단계: 이메일 입력 */}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>이메일</Text>
            <Input
              placeholder="이메일 주소를 입력해주세요"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={step === 'email'}
              inputStyle={step !== 'email' ? StyleSheet.flatten([styles.inputText, styles.inputDisabled]) : styles.inputText}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          {/* 2단계: 인증번호 입력 (인증번호 발송 후 표시) */}
          {step !== 'email' && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>인증번호</Text>
              <Input
                placeholder="인증번호 6자리를 입력해주세요"
                value={verificationCode}
                onChangeText={handleVerificationCodeChange}
                keyboardType="number-pad"
                maxLength={6}
                editable={step === 'verification'}
                inputStyle={step !== 'verification' ? StyleSheet.flatten([styles.inputText, styles.inputDisabled]) : styles.inputText}
              />
              {errors.verificationCode ? <Text style={styles.errorText}>{errors.verificationCode}</Text> : null}
            </View>
          )}

          {/* 처음부터 다시 시작 버튼 (2단계 이상일 때) */}
          {step !== 'email' && (
            <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
              <Text style={styles.resetButtonText}>처음부터 다시 시작</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        {/* 1단계: 인증번호 발송 버튼 */}
        {step === 'email' && (
          <Button
            title={isLoading ? '처리 중...' : '인증번호 발송'}
            onPress={handleSendVerification}
            disabled={isLoading}
            loading={isLoading}
            size="lg"
            style={styles.button}
            textStyle={styles.buttonText}
          />
        )}

        {/* 2단계: 인증번호 확인 버튼 */}
        {step === 'verification' && (
          <Button
            title={isLoading ? '처리 중...' : '인증번호 확인'}
            onPress={handleVerifyEmail}
            disabled={isLoading}
            loading={isLoading}
            size="lg"
            style={styles.button}
            textStyle={styles.buttonText}
          />
        )}

        {/* 3단계: 임시 비밀번호 발급 버튼 */}
        {step === 'complete' && (
          <Button
            title={isLoading ? '처리 중...' : '임시 비밀번호 발급'}
            onPress={handleGenPassword}
            disabled={isLoading}
            loading={isLoading}
            size="lg"
            style={styles.button}
            textStyle={styles.buttonText}
          />
        )}

        <TouchableOpacity
          onPress={handleGoToLogin}
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>로그인으로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
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
    fontSize: typography.fontSize.sm,
    color: colors.primary[700],
    letterSpacing: -1,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  inputContainer: {
    marginBottom: spacing[3],
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[3],
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  inputText: {
    fontSize: typography.fontSize.sm,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  inputDisabled: {
    backgroundColor: colors.gray[100],
    color: colors.text.secondary,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.red[500],
    marginTop: -5,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  resetButton: {
    alignSelf: 'flex-end',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    marginTop: spacing[2],
  },
  resetButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textDecorationLine: 'underline',
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
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
    fontSize: typography.fontSize.sm,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  linkButton: {
    paddingVertical: spacing[2],
    alignItems: 'center',
  },
  linkText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textDecorationLine: 'underline',
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
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
});

export default FindPasswordScreen;
