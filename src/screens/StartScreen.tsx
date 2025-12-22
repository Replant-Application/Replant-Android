import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { SCREEN_NAMES } from '../utils/constants';
import { Button, Header } from '../components/ui';
import { colors, spacing, typography, borderRadius } from '../utils/designTokens';

interface StartScreenProps {
  onNavigate: (screen: string) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onNavigate }) => {

  const handleSignUp = () => {
    if (onNavigate) {
      onNavigate(SCREEN_NAMES.SIGNUP as string);
    }
  };

  const handleLogin = () => {
    if (onNavigate) {
      onNavigate(SCREEN_NAMES.LOGIN as string);
    }
  };

  // 소셜 로그인 핸들러 (화면만 구현, 기능은 나중에)
  const handleKakaoLogin = () => {
    Alert.alert('카카오 로그인', '카카오 로그인 기능은 준비 중입니다.');
  };

  const handleGoogleLogin = () => {
    Alert.alert('구글 로그인', '구글 로그인 기능은 준비 중입니다.');
  };

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <Text style={styles.title}>🌱 Replant</Text>
        <Text style={styles.subtitle}>사회로의 첫 걸음</Text>
      </View>

      <View style={styles.buttonContainer}>
        {/* 소셜 로그인 버튼들 */}
        <View style={styles.socialLoginContainer}>
          <Text style={styles.socialLoginTitle}>소셜 로그인</Text>
          
          {/* 카카오 로그인 */}
          <TouchableOpacity
            style={[styles.socialButton, styles.kakaoButton]}
            onPress={handleKakaoLogin}
            activeOpacity={0.8}
          >
            <Image
              source={require('../assets/images/kakao_logo.png')}
              style={styles.socialLogo}
              resizeMode="contain"
            />
            <Text style={styles.socialButtonText}>카카오로 시작하기</Text>
          </TouchableOpacity>

          {/* 구글 로그인 */}
          <TouchableOpacity
            style={[styles.socialButton, styles.googleButton]}
            onPress={handleGoogleLogin}
            activeOpacity={0.8}
          >
            <Image
              source={require('../assets/images/google_logo.png')}
              style={styles.socialLogo}
              resizeMode="contain"
            />
            <Text style={styles.socialButtonText}>구글로 시작하기</Text>
          </TouchableOpacity>
        </View>

        {/* 구분선 */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>또는</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* 회원가입 버튼 */}
        <Button
          title="새로 시작하기 (회원가입)"
          onPress={handleSignUp}
          size="lg"
          style={styles.button}
        />

        {/* 로그인 버튼 */}
        <Button
          title="로그인"
          onPress={handleLogin}
          size="lg"
          variant="outline"
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    justifyContent: 'space-between',
    padding: spacing[5],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  subtitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  buttonContainer: {
    paddingBottom: spacing[10],
    gap: spacing[4],
  },
  socialLoginContainer: {
    width: '100%',
    gap: spacing[3],
  },
  socialLoginTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },
  kakaoButton: {
    backgroundColor: '#FEE500', // 카카오 노란색
  },
  googleButton: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  socialLogo: {
    width: 24,
    height: 24,
  },
  socialButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing[2],
    gap: spacing[3],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  dividerText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  button: {
    width: '100%',
  },
});

export default StartScreen;
