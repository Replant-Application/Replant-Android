import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Input, Header } from '../components/ui';
import { colors, spacing, typography } from '../utils/designTokens';
import { SCREEN_NAMES } from '../utils/constants';
import { login as loginApi } from '../api/authApi';
import { saveTokens, saveUserInfo } from '../utils/tokenStorage';
import { apiClient } from '../api/client';
import { useUser } from '../contexts/UserContext';

interface LoginScreenProps {
  onNavigate: (screen: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate }) => {
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('오류', '이메일과 비밀번호를 입력해주세요.');
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
        const finalAccessToken = tokens?.accessToken || accessToken;
        const finalRefreshToken = tokens?.refreshToken || refreshToken;

        await saveTokens(finalAccessToken, finalRefreshToken);

        // 사용자 정보 저장
        await saveUserInfo({
          id: 0,
          email: email,
          nickname: name,
        });

        // API 클라이언트에 토큰 설정
        apiClient.setAccessToken(finalAccessToken);

        // 로컬 로그인 처리
        await login(name);

        Alert.alert('로그인 성공', `${name}님, 환영합니다!`, [
          {
            text: '확인',
            onPress: () => onNavigate(SCREEN_NAMES.HOME as string),
          },
        ]);
      } else {
        Alert.alert('로그인 실패', result.error || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('오류', '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header />
      <View style={styles.content}>
        <Text style={styles.title}>로그인</Text>
        <Text style={styles.subtitle}>
          계정에 로그인해주세요
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>이메일</Text>
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
          <Text style={styles.label}>비밀번호</Text>
          <Input
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            onSubmitEditing={handleLogin}
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={isLoading ? '처리 중...' : '로그인'}
          onPress={handleLogin}
          disabled={isLoading}
          loading={isLoading}
          size="lg"
          style={styles.button}
        />
        <TouchableOpacity
          onPress={() => onNavigate(SCREEN_NAMES.SIGNUP as string)}
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>계정이 없으신가요? 회원가입</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onNavigate(SCREEN_NAMES.START as string)}
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    padding: spacing[5],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
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
    paddingBottom: spacing[10],
    gap: spacing[3],
  },
  button: {
    width: '100%',
  },
  linkButton: {
    paddingVertical: spacing[2],
    alignItems: 'center',
  },
  linkText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary.main,
  },
});

export default LoginScreen;
