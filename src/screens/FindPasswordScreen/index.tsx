import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Button, Input, Header } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { SCREEN_NAMES } from '../../utils/constants';
import { sendVerification, verifyEmail, genPassword, GenPasswordRequest } from '../../api/authApi';

interface FindPasswordScreenProps {
  onNavigate: (screen: string, params?: any) => void;
}

type Step = 'email' | 'verification' | 'complete';

const FindPasswordScreen: React.FC<FindPasswordScreenProps> = ({ onNavigate }) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    verificationCode: '',
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/;
    return emailRegex.test(email);
  };

  const validateVerificationCode = (code: string): boolean => {
    // 숫자 6자리 (실제 스펙에 맞게 조정 필요)
    return /^\d{6}$/.test(code);
  };

  // 1단계: 이메일 입력 및 인증번호 발송
  const handleSendVerification = async () => {
    setErrors({ email: '', verificationCode: '' });

    // 이메일 검증
    if (!email.trim()) {
      setErrors({ email: '이메일을 입력해주세요.', verificationCode: '' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: '올바른 이메일 형식으로 입력해주세요.', verificationCode: '' });
      return;
    }

    setIsLoading(true);

    try {
      const result = await sendVerification({ email });

      if (result.success && result.data) {
        // 인증번호 발송 성공 → 2단계로 이동
        setStep('verification');
        Alert.alert('인증번호 발송', '이메일로 인증번호를 보냈습니다.','인증번호를 입력해주세요.');
      } else {
        // 에러 메시지 추출
        let errorMessage = '인증번호 발송에 실패했습니다.';
        if (result.error) {
          if (typeof result.error === 'string') {
            errorMessage = result.error;
          } else if (typeof result.error === 'object') {
            const errorObj = result.error as any;
            errorMessage = errorObj.message || errorObj.error || errorMessage;
          }
        }
        setErrors({ email: errorMessage, verificationCode: '' });
      }
    } catch (error) {
      console.error('Send verification error:', error);
      setErrors({ email: '인증번호 발송 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', verificationCode: '' });
    } finally {
      setIsLoading(false);
    }
  };

  // 2단계: 인증번호 확인
  const handleVerifyEmail = async () => {
    setErrors({ email: '', verificationCode: '' });

    // 인증번호 검증
    if (!verificationCode.trim()) {
      setErrors({ email: '', verificationCode: '인증번호를 입력해주세요.' });
      return;
    }

    if (!validateVerificationCode(verificationCode)) {
      setErrors({ email: '', verificationCode: '인증번호는 6자리 숫자로 입력해주세요.' });
      return;
    }

    setIsLoading(true);

    try {
      const result = await verifyEmail({
        email,
        code: verificationCode, // Swagger 스펙에 맞게 code로 변경
      });

      if (result.success && result.data !== undefined) {
        // Swagger 스펙: { data: boolean } 형태로 응답
        // apiClient가 data.data를 추출하므로 result.data는 boolean
        if (result.data === true) {
          // 인증 성공 → 3단계로 이동
          setStep('complete');
          Alert.alert('인증 완료', '이메일 인증이 완료되었습니다.\n임시 비밀번호를 발급받으세요.');
        } else {
          // 인증 실패 (data가 false)
          setErrors({ email: '', verificationCode: '인증번호가 올바르지 않습니다.' });
        }
      } else {
        // 에러 메시지 추출
        let errorMessage = '인증번호가 올바르지 않습니다.';
        if (result.error) {
          if (typeof result.error === 'string') {
            errorMessage = result.error;
          } else if (typeof result.error === 'object') {
            const errorObj = result.error as any;
            errorMessage = errorObj.message || errorObj.error || errorMessage;
          }
        }
        setErrors({ email: '', verificationCode: errorMessage });
      }
    } catch (error) {
      console.error('Verify email error:', error);
      setErrors({ email: '', verificationCode: '인증번호 확인 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.' });
    } finally {
      setIsLoading(false);
    }
  };

  // 3단계: 임시 비밀번호 발급
  const handleGenPassword = async () => {
    setIsLoading(true);

    try {
      // Swagger 스펙: { id: string (이메일), name: string }
      // TODO: 백엔드 스펙 변경 시 name 필드 처리 방식 확인 필요
      // 현재: name이 필수이므로 이메일 주소에서 추출
      // 향후: name이 선택사항이 되면 아래 코드를 수정:
      //   - GenPasswordRequest의 name을 optional로 변경
      //   - requestData에서 name 제거 또는 조건부 처리
      const requestData: GenPasswordRequest = {
        id: email,
        // 현재 스펙: name 필수 → 이메일에서 추출
        // 향후 스펙 변경 시: 이 줄 제거 또는 조건부 처리
        name: email.split('@')[0] || email,
      };
      
      const result = await genPassword(requestData);

      if (result.success && result.data) {
        // 임시 비밀번호 발급 성공
        const tempPassword = result.data.temporaryPassword;
        const message = tempPassword
          ? `임시 비밀번호가 발급되었습니다.\n\n임시 비밀번호: ${tempPassword}\n\n로그인 후 비밀번호를 변경해주세요.`
          : result.data.message || '임시 비밀번호가 발급되었습니다.\n이메일을 확인해주세요.';

        Alert.alert('비밀번호 발급 완료', message, [
          {
            text: '확인',
            onPress: () => {
              // 로그인 화면으로 이동
              onNavigate(SCREEN_NAMES.LOGIN as string);
            },
          },
        ]);
      } else {
        // 에러 메시지 추출
        let errorMessage = '임시 비밀번호 발급에 실패했습니다.';
        if (result.error) {
          if (typeof result.error === 'string') {
            errorMessage = result.error;
          } else if (typeof result.error === 'object') {
            const errorObj = result.error as any;
            errorMessage = errorObj.message || errorObj.error || errorMessage;
          }
        }
        Alert.alert('오류', errorMessage);
      }
    } catch (error) {
      console.error('Gen password error:', error);
      Alert.alert('오류', '임시 비밀번호 발급 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 단계 초기화 (처음부터 다시 시작)
  const handleReset = () => {
    setStep('email');
    setEmail('');
    setVerificationCode('');
    setErrors({ email: '', verificationCode: '' });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header
        title="비밀번호 찾기"
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
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) {
                  setErrors({ ...errors, email: '' });
                }
              }}
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
                onChangeText={(text) => {
                  // 숫자만 입력 가능
                  const numericText = text.replace(/[^0-9]/g, '');
                  setVerificationCode(numericText);
                  if (errors.verificationCode) {
                    setErrors({ ...errors, verificationCode: '' });
                  }
                }}
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
