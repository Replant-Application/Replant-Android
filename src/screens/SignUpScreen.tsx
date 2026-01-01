import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Button, Input, Header } from '../components/ui';
import { colors, spacing, typography } from '../utils/designTokens';
import { SCREEN_NAMES } from '../utils/constants';
import { join } from '../api/authApi';
import { saveTokens, saveUserInfo } from '../utils/tokenStorage';
import { apiClient } from '../api/client';
import { useUser } from '../contexts/UserContext';

interface SignUpScreenProps {
  onNavigate: (screen: string) => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onNavigate }) => {
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^01[016789][0-9]{7,8}$/;
    return phoneRegex.test(phone.replace(/-/g, ''));
  };

  const handleSignUp = async () => {
    // 유효성 검사
    if (!email.trim() || !password.trim() || !nickname.trim() || !phone.trim()) {
      Alert.alert('오류', '모든 필수 항목을 입력해주세요.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('오류', '올바른 이메일 형식을 입력해주세요.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('오류', '비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      return;
    }

    if (nickname.length < 2 || nickname.length > 20) {
      Alert.alert('오류', '닉네임은 2~20자 사이로 입력해주세요.');
      return;
    }

    if (!validatePhone(phone)) {
      Alert.alert('오류', '올바른 전화번호 형식을 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await join({
        id: email,
        password: password,
        name: nickname,
        phone: phone.replace(/-/g, ''),
      });

      if (result.success && result.data) {
        const { accessToken, refreshToken, name, tokens } = result.data;

        // 토큰 저장
        const finalAccessToken = tokens?.accessToken || accessToken || '';
        const finalRefreshToken = tokens?.refreshToken || refreshToken || '';

        if (finalAccessToken && finalRefreshToken) {
          await saveTokens(finalAccessToken, finalRefreshToken);
        }

        // 사용자 정보 저장
        await saveUserInfo({
          id: 0,
          email: email,
          nickname: name,
        });

        // API 클라이언트에 토큰 설정
        apiClient.setAccessToken(finalAccessToken || null);

        // 로컬 로그인 처리
        await login(name);

        Alert.alert('회원가입 완료', '환영합니다! 홈 화면으로 이동합니다.', [
          {
            text: '확인',
            onPress: () => onNavigate(SCREEN_NAMES.HOME as string),
          },
        ]);
      } else {
        Alert.alert('회원가입 실패', result.error || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('SignUp error:', error);
      Alert.alert('오류', '회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header
        leftButton={
          <TouchableOpacity
            onPress={() => onNavigate(SCREEN_NAMES.START as string)}
            style={styles.backButton}
          >
            <Image
              source={require('../assets/images/left.png')}
              style={styles.backButtonIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        }
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>회원가입</Text>
          <Text style={styles.subtitle}>
            새로운 계정을 만들어주세요
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>이메일 *</Text>
            <Input
              placeholder="이메일을 입력하세요"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>비밀번호 * (8자 이상)</Text>
            <Input
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>비밀번호 확인 *</Text>
            <Input
              placeholder="비밀번호를 다시 입력하세요"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>닉네임 * (2~20자)</Text>
            <Input
              placeholder="닉네임을 입력하세요"
              value={nickname}
              onChangeText={setNickname}
              maxLength={20}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>전화번호 *</Text>
            <Input
              placeholder="전화번호를 입력하세요 (숫자만)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={11}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title={isLoading ? '처리 중...' : '회원가입'}
          onPress={handleSignUp}
          disabled={isLoading}
          loading={isLoading}
          size="lg"
          style={styles.button}
          textStyle={styles.buttonText}
        />
        <TouchableOpacity
          onPress={() => onNavigate(SCREEN_NAMES.LOGIN as string)}
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>이미 계정이 있으신가요? 로그인</Text>
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
    paddingBottom: spacing[24],
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[2],
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[8],
  },
  inputContainer: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  buttonContainer: {
    padding: spacing[5],
    paddingBottom: spacing[10],
    gap: spacing[3],
  },
  button: {
    height: 42,
    width: '100%',
    borderRadius: 28,
    backgroundColor: '#166534',
  },
  buttonText: {
    fontSize: typography.fontSize.sm,
  },
  linkButton: {
    paddingVertical: spacing[2],
    alignItems: 'center',
  },
  linkText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    textDecorationLine: 'underline',
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

export default SignUpScreen;
