import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Image, TextInput, Modal } from 'react-native';
import { spacing, typography, borderRadius } from '../utils/designTokens';
import { SCREEN_NAMES } from '../utils/constants';
import { login as loginApi } from '../api/authApi';
import { saveTokens, saveUserInfo, saveKeepLoggedIn } from '../utils/tokenStorage';
import { apiClient } from '../api/client';
import { useUser } from '../contexts/UserContext';
import { AlertModal } from '../components/ui';
import { signInWithKakao } from '../services/kakaoSignIn';
import { signInWithGoogle } from '../services/googleSignIn';
import { loginWithOAuth } from '../services/authService';

interface LoginScreenProps {
  onNavigate: (screen: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate }) => {
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showAlertModal = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlert(true);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showAlertModal('오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginApi({
        id: email,
        password: password,
      });

      if (result.success && result.data) {
        const { accessToken, refreshToken, name, tokens } = result.data;

        // 토큰 저장
        const finalAccessToken = tokens?.accessToken || accessToken || '';
        const finalRefreshToken = tokens?.refreshToken || refreshToken || '';

        await saveTokens(finalAccessToken, finalRefreshToken);

        // 로그인 유지 설정 저장
        await saveKeepLoggedIn(keepLoggedIn);

        // 사용자 정보 저장
        await saveUserInfo({
          id: 0,
          email: email,
          nickname: name || email,
        });

        // API 클라이언트에 토큰 설정
        if (finalAccessToken) {
          apiClient.setAccessToken(finalAccessToken);
        }

        // 성공 모달 표시 (로그인 처리는 모달이 닫힐 때)
        setUserName(name || email);
        setShowSuccessModal(true);
      } else {
        // 에러 메시지를 문자열로 변환
        let errorMessage = '로그인에 실패했습니다.';
        if (result.error) {
          if (typeof result.error === 'string') {
            errorMessage = result.error;
          } else if (typeof result.error === 'object') {
            const errorObj = result.error as any;
            errorMessage = errorObj.message || errorObj.error || errorObj.msg || JSON.stringify(result.error);
          }
        }
        showAlertModal('로그인 실패', errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      // catch 블록의 에러도 문자열로 변환
      let errorMessage = '로그인 중 오류가 발생했습니다.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        const errorObj = error as any;
        errorMessage = errorObj.message || errorObj.error || errorObj.msg || '로그인 중 오류가 발생했습니다.';
      }
      showAlertModal('오류', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'KAKAO' | 'GOOGLE') => {
    console.log(`[LoginScreen] handleOAuthLogin called with provider: ${provider}`);
    if (isLoading) {
      console.log('[LoginScreen] Already loading, returning...');
      return;
    }

    console.log('[LoginScreen] Setting loading state to true');
    setIsLoading(true);

    try {
      // OAuth Provider에서 Access Token 가져오기
      let providerAccessToken: string | null = null;

      if (provider === 'KAKAO') {
        console.log('[LoginScreen] Calling signInWithKakao...');
        providerAccessToken = await signInWithKakao();
        console.log('[LoginScreen] signInWithKakao result:', providerAccessToken ? 'got token' : 'no token');
      } else if (provider === 'GOOGLE') {
        console.log('[LoginScreen] Calling signInWithGoogle...');
        providerAccessToken = await signInWithGoogle();
        console.log('[LoginScreen] signInWithGoogle result:', providerAccessToken ? 'got token' : 'no token');
      }

      if (!providerAccessToken) {
        // 사용자가 취소한 경우는 에러 메시지를 표시하지 않음
        // (카카오 로그인 서비스에서 이미 처리됨)
        setIsLoading(false);
        return;
      }

      // 백엔드 OAuth 로그인 API 호출
      const result = await loginWithOAuth(provider, providerAccessToken);

      if (result.success && result.data) {
        const { user } = result.data;

        // 로그인 유지 설정 저장
        await saveKeepLoggedIn(keepLoggedIn);

        // 성공 모달 표시
        setUserName(user.nickname || user.email);
        setShowSuccessModal(true);
      } else {
        // 백엔드 에러 메시지 추출
        let errorMessage = '로그인에 실패했습니다.';
        if (typeof result.error === 'string') {
          errorMessage = result.error;
        } else if (result.error && typeof result.error === 'object') {
          const errorObj = result.error as any;
          errorMessage = errorObj.message || errorObj.error || errorObj.msg || errorMessage;
        }
        
        // ACCOUNT-009 에러는 회원가입 실패
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
    console.log('[LoginScreen] Kakao login button pressed');
    try {
      handleOAuthLogin('KAKAO');
    } catch (error) {
      console.error('[LoginScreen] Error in handleKakaoLogin:', error);
      showAlertModal('오류', '카카오 로그인을 시작할 수 없습니다.');
    }
  };
  
  const handleGoogleLogin = () => {
    console.log('[LoginScreen] Google login button pressed');
    try {
      handleOAuthLogin('GOOGLE');
    } catch (error) {
      console.error('[LoginScreen] Error in handleGoogleLogin:', error);
      showAlertModal('오류', '구글 로그인을 시작할 수 없습니다.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.topSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/RePlant_Logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>로그인</Text>
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="이메일을 입력하세요"
              placeholderTextColor="#999999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="비밀번호를 입력하세요"
              placeholderTextColor="#999999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={handleLogin}
              style={styles.input}
            />
          </View>

          <View style={styles.optionsRow}>
            <TouchableOpacity
              onPress={() => setKeepLoggedIn(!keepLoggedIn)}
              style={styles.checkboxRow}
            >
              <View style={[styles.checkbox, keepLoggedIn && styles.checkboxChecked]}>
                {keepLoggedIn && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>로그인 유지</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? '처리 중...' : '이메일로 로그인'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onNavigate(SCREEN_NAMES.SIGNUP as string)}
            style={styles.signUpButton}
          >
            <Text style={styles.linkText}>아직 계정이 없으신가요? 회원가입</Text>
          </TouchableOpacity>

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
              >
                <View style={[styles.socialIconCircle, { backgroundColor: '#FEE500' }]}>
                  <Image
                    source={require('../assets/images/kakao_logo.png')}
                    style={styles.socialIconImage}
                    resizeMode="contain"
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.socialIcon}
                onPress={handleGoogleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <View style={[styles.socialIconCircle, { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#E0E0E0' }]}>
                  <Image
                    source={require('../assets/images/google_logo.png')}
                    style={styles.socialIconImage}
                    resizeMode="contain"
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
        onRequestClose={() => {
          setShowSuccessModal(false);
          onNavigate((SCREEN_NAMES.HOME || 'Home') as string);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Image
              source={require('../assets/images/check.png')}
              style={styles.modalIcon}
              resizeMode="contain"
            />
            <Text style={styles.modalTitle}>로그인 성공</Text>
            <Text style={styles.modalMessage}>{userName}님, 환영합니다!</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={async () => {
                setShowSuccessModal(false);
                // 모달이 닫힌 후 로그인 처리 및 화면 전환
                await login(userName);
                onNavigate((SCREEN_NAMES.HOME || 'Home') as string);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <AlertModal
        visible={showAlert}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: spacing[6],
    justifyContent: 'center',
  },
  topSection: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  bottomSection: {
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: spacing[1],
  },
  brandText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#166534',
    fontFamily: Platform.select({
      ios: 'Maplestory Bold',
      android: 'MaplestoryBold',
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: spacing[4],
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: typography.fontSize.base,
    height: 48,
    color: '#000000',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#000000',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: typography.fontSize.sm,
    color: '#000000',
  },
  findPasswordText: {
    fontSize: typography.fontSize.sm,
    color: '#666666',
  },
  loginButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#166534',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: '#ffffff',
  },
  signUpButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[8],
    paddingVertical: spacing[2],
  },
  linkText: {
    fontSize: typography.fontSize.sm,
    color: '#666666',
    textDecorationLine: 'underline',
  },
  socialSection: {
    alignItems: 'center',
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
    backgroundColor: '#E0E0E0',
  },
  socialTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: '#000000',
    marginHorizontal: spacing[3],
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
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIconText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  socialIconImage: {
    width: 24,
    height: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: spacing[6],
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalIcon: {
    width: 48,
    height: 48,
    marginBottom: spacing[6],
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: '#000000',
    marginBottom: spacing[2],
  },
  modalMessage: {
    fontSize: typography.fontSize.base,
    color: '#666666',
    marginBottom: spacing[6],
    textAlign: 'center',
  },
  modalButton: {
    width: '100%',
    height: 43,
    backgroundColor: '#166534',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default LoginScreen;
