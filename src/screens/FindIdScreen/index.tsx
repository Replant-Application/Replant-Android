import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Button, Input, Header } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { SCREEN_NAMES } from '../../utils/constants';
import { searchId } from '../../api/authApi';

interface FindIdScreenProps {
  onNavigate: (screen: string, params?: any) => void;
}

const FindIdScreen: React.FC<FindIdScreenProps> = ({ onNavigate }) => {
  const [nickname, setNickname] = useState('');
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState<'phone' | 'email'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^01[016789][0-9]{7,8}$/;
    return phoneRegex.test(phone.replace(/-/g, ''));
  };

  const detectInputType = (text: string): 'phone' | 'email' => {
    // @가 포함되어 있으면 이메일
    if (text.includes('@')) {
      return 'email';
    }
    // 숫자만 있으면 전화번호
    if (/^\d+$/.test(text.replace(/-/g, ''))) {
      return 'phone';
    }
    // 기본값은 전화번호
    return 'phone';
  };

  const handleFindId = async () => {
    // 에러 초기화
    setError('');

    // 입력값 검증
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    if (!input.trim()) {
      setError('전화번호 또는 이메일을 입력해주세요.');
      return;
    }

    const detectedType = detectInputType(input);

    // 타입별 검증
    if (detectedType === 'email') {
      if (!validateEmail(input)) {
        setError('올바른 이메일 형식으로 입력해주세요.');
        return;
      }
    } else {
      if (!validatePhone(input)) {
        setError('올바른 전화번호 형식으로 입력해주세요. (예: 01012345678)');
        return;
      }
    }

    setIsLoading(true);

    try {
      const result = await searchId({
        nickname: nickname.trim(),
        [detectedType === 'phone' ? 'phone' : 'email']: input.replace(/-/g, ''),
      });

      if (result.success && result.data) {
        // 아이디 찾기 성공 - 결과 화면으로 이동 (마스킹된 이메일 전달)
        // result.data는 string (마스킹된 이메일)
        onNavigate(SCREEN_NAMES.FIND_ID_RESULT as string, {
          email: result.data,
        });
      } else {
        // 에러 메시지 추출
        let errorMessage = '아이디 찾기에 실패했습니다.';
        if (result.error) {
          if (typeof result.error === 'string') {
            errorMessage = result.error;
          } else if (typeof result.error === 'object') {
            const errorObj = result.error as any;
            errorMessage = errorObj.message || errorObj.error || errorMessage;
          }
        }
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Find ID error:', error);
      setError('아이디 찾기 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.');
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
        title="아이디 찾기"
        leftButton={
          <TouchableOpacity
            onPress={() => onNavigate(SCREEN_NAMES.LOGIN as string)}
            style={styles.backButton}
          >
            <Image
              source={require('../../assets/images/left.png')}
              style={styles.backButtonIcon}
              resizeMode="contain"
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
            />
            <Text style={styles.infoText} numberOfLines={1}>
              전화번호 또는 이메일을 입력해주세요
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>닉네임</Text>
            <Input
              placeholder="닉네임을 입력해주세요"
              value={nickname}
              onChangeText={(text) => {
                setNickname(text);
                if (error) {
                  setError('');
                }
              }}
              autoCapitalize="none"
              autoCorrect={false}
              inputStyle={styles.inputText}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>전화번호 또는 이메일</Text>
            <Input
              placeholder="전화번호 또는 이메일을 입력해주세요"
              value={input}
              onChangeText={(text) => {
                setInput(text);
                if (error) {
                  setError('');
                }
                // 입력 타입 자동 감지
                const type = detectInputType(text);
                setInputType(type);
              }}
              keyboardType={inputType === 'phone' ? 'phone-pad' : 'email-address'}
              autoCapitalize="none"
              autoCorrect={false}
              inputStyle={styles.inputText}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title={isLoading ? '처리 중...' : '아이디 찾기'}
          onPress={handleFindId}
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

export default FindIdScreen;
