import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Modal, Animated } from 'react-native';
import FastImage from 'react-native-fast-image';
import { spacing, typography, colors, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { SCREEN_NAMES } from '../../utils/constants';
import { saveKeepLoggedIn } from '../../utils/tokenStorage';
import { useUser } from '../../contexts/UserContext';
import { AlertModal } from '../../components/ui';
import { signInWithKakao } from '../../services/kakaoSignIn';
import { signInWithGoogle } from '../../services/googleSignIn';
import { loginWithOAuth } from '../../services/authService';

interface StartScreenProps {
  onNavigate: (screen: string) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onNavigate }) => {
  const { login, refreshUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const modalScaleAnim = useRef(new Animated.Value(0)).current;
  const modalFadeAnim = useRef(new Animated.Value(0)).current;

  const showAlertModal = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlert(true);
  };

  const handleOAuthLogin = async (provider: 'KAKAO' | 'GOOGLE') => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      let providerAccessToken: string | null = null;

      if (provider === 'KAKAO') {
        providerAccessToken = await signInWithKakao();
      } else if (provider === 'GOOGLE') {
        providerAccessToken = await signInWithGoogle();
      }

      if (!providerAccessToken) {
        setIsLoading(false);
        return;
      }

      const result = await loginWithOAuth(provider, providerAccessToken);

      if (result.success && result.data) {
        const { user, isNewUser } = result.data;

        // OAuth 로그인은 기본적으로 로그인 상태 유지
        await saveKeepLoggedIn(true);

        if (isNewUser) {
          onNavigate(`${SCREEN_NAMES.OAUTH_COMPLETE_SIGNUP}?email=${encodeURIComponent(user.email)}&nickname=${encodeURIComponent(user.nickname || '')}&provider=${provider}`);
          return;
        }

        setUserName(user.nickname || user.email);
        setShowSuccessModal(true);
        Animated.parallel([
          Animated.spring(modalScaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }),
          Animated.timing(modalFadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        let errorMessage = '로그인에 실패했습니다.';
        if (typeof result.error === 'string') {
          errorMessage = result.error;
        } else if (result.error && typeof result.error === 'object') {
          const errorObj = result.error as any;
          errorMessage = errorObj.message || errorObj.error || errorObj.msg || errorMessage;
        }
        
        if (errorMessage.includes('회원가입에 실패') || errorMessage.includes('ACCOUNT-009')) {
          errorMessage = '회원가입 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        }
        
        showAlertModal('로그인 실패', errorMessage);
      }
    } catch (error) {
      console.error('OAuth login error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : '로그인 중 오류가 발생했습니다.';
      showAlertModal('오류', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKakaoLogin = () => {
    try {
      handleOAuthLogin('KAKAO');
    } catch (error) {
      console.error('Error in handleKakaoLogin:', error);
      showAlertModal('오류', '카카오 로그인을 시작할 수 없습니다.');
    }
  };

  const handleGoogleLogin = () => {
    try {
      handleOAuthLogin('GOOGLE');
    } catch (error) {
      console.error('Error in handleGoogleLogin:', error);
      showAlertModal('오류', '구글 로그인을 시작할 수 없습니다.');
    }
  };

  const handleSignUp = () => {
    onNavigate(SCREEN_NAMES.SIGNUP as string);
  };

  const handleLogin = () => {
    onNavigate(SCREEN_NAMES.LOGIN as string);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/images/Replant_Loading.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>
            다시 살아갈 당신에게 희망을<Text style={styles.clover}>🍀</Text>
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.kakaoButton, isLoading && styles.buttonDisabled]}
          onPress={handleKakaoLogin}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <Image
            source={require('../../assets/images/kakao_logo.png')}
            style={styles.kakaoLogo}
            resizeMode="contain"
          />
          <Text style={styles.kakaoButtonText}>
            {isLoading ? '처리 중...' : 'Kakao 계정으로 로그인'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.googleButton, isLoading && styles.buttonDisabled]}
          onPress={handleGoogleLogin}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <Image
            source={require('../../assets/images/google_logo.png')}
            style={styles.googleLogo}
            resizeMode="contain"
          />
          <Text style={styles.googleButtonText}>
            {isLoading ? '처리 중...' : 'Google 계정으로 로그인'}
          </Text>
        </TouchableOpacity>

        <View style={styles.textButtonContainer}>
          <TouchableOpacity
            style={styles.textButton}
            onPress={handleSignUp}
            activeOpacity={0.8}
          >
            <Text style={styles.textButtonText}>회원가입</Text>
          </TouchableOpacity>
          <Text style={styles.dividerText}>|</Text>
          <TouchableOpacity
            style={styles.textButton}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.textButtonText}>로그인</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 성공 모달 */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="none"
        onRequestClose={() => {}}
      >
        <Animated.View
          style={[
            styles.modalOverlay,
            {
              opacity: modalFadeAnim,
            },
          ]}
        >
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
              onPress={async () => {
                Animated.parallel([
                  Animated.timing(modalScaleAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                  }),
                  Animated.timing(modalFadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                  }),
                ]).start(() => {
                  setShowSuccessModal(false);
                  modalScaleAnim.setValue(0);
                  modalFadeAnim.setValue(0);
                });
                await login(userName);
                await refreshUser();
                setTimeout(() => {
                  onNavigate((SCREEN_NAMES.HOME || 'Home') as string);
                }, 100);
              }}
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
        onClose={() => setShowAlert(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: spacing[6],
    paddingTop: spacing[1],
    paddingBottom: spacing[10],
    justifyContent: 'space-between',
  },
  content: {
    alignItems: 'center',
    paddingTop: spacing[24] + spacing[12],
  },
  logoImage: {
    width: 310,
    height: 310,
    marginBottom: -50,
  },
  title: {
    fontSize: 66,
    color: '#166534',
    marginBottom: spacing[2],
    letterSpacing: 2,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  subtitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    letterSpacing: 0.5,
    lineHeight: getOptimizedLineHeight(16),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  clover: {
    fontSize: 18,
    marginLeft: 8,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(18),
  },
  buttonContainer: {
    width: '100%',
    gap: spacing[3],
    paddingBottom: spacing[8],
    paddingTop: spacing[4],
    alignItems: 'center',
  },
  kakaoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '85%',
    height: 44,
    backgroundColor: '#FEE500',
    borderRadius: 8,
    gap: spacing[2],
    paddingHorizontal: spacing[3],
  },
  kakaoLogo: {
    width: 24,
    height: 24,
  },
  kakaoButtonText: {
    fontSize: 16,
    color: '#000000',
    letterSpacing: 0.1,
    lineHeight: getOptimizedLineHeight(16),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '85%',
    height: 44,
    backgroundColor: '#000000',
    borderRadius: 8,
    gap: spacing[2],
    paddingHorizontal: spacing[3],
  },
  googleLogo: {
    width: 17,
    height: 17,
  },
  googleButtonText: {
    fontSize: 15,
    color: '#ffffff',
    letterSpacing: 0.1,
    lineHeight: getOptimizedLineHeight(15),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  textButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  textButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
  },
  textButtonText: {
    fontSize: 15,
    color: '#666666',
    lineHeight: getOptimizedLineHeight(15),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  dividerText: {
    fontSize: 14,
    color: '#CCCCCC',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(14),
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
    padding: spacing[5],
    width: '80%',
    maxWidth: 300,
    alignItems: 'center',
  },
  modalCharacterContainer: {
    width: 70,
    height: 70,
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
    height: 44,
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

export default StartScreen;
