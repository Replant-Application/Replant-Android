import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image, Modal, FlatList } from 'react-native';
import { Button, Input, Header } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { SCREEN_NAMES } from '../../utils/constants';
import { join, sendVerification, verifyEmail, getRegions, RegionInfo } from '../../api/authApi';
import { saveTokens, saveUserInfo } from '../../utils/tokenStorage';
import { apiClient } from '../../api/client';
import { useUser } from '../../contexts/UserContext';

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
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [showVerificationCodeInput, setShowVerificationCodeInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 성별, 지역, 출생연도 상태
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | null>(null);
  const [region, setRegion] = useState<string | null>(null);
  const [regionName, setRegionName] = useState<string>('');
  const [regions, setRegions] = useState<RegionInfo[]>([]);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [birthYear, setBirthYear] = useState<number | null>(null);
  const [showBirthYearModal, setShowBirthYearModal] = useState(false);

  // 출생연도 목록 생성 (1950년 ~ 현재년도 - 14세)
  const currentYear = new Date().getFullYear();
  const birthYears = Array.from({ length: currentYear - 14 - 1950 + 1 }, (_, i) => currentYear - 14 - i);

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    phone: '',
    verificationCode: '',
    gender: '',
    region: '',
    birthYear: '',
  });

  // 지역 목록 로드
  useEffect(() => {
    const loadRegions = async () => {
      try {
        const result = await getRegions();
        if (result.success && result.data) {
          setRegions(result.data);
        }
      } catch (error) {
        console.error('Failed to load regions:', error);
      }
    };
    loadRegions();
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^01[016789][0-9]{7,8}$/;
    return phoneRegex.test(phone.replace(/-/g, ''));
  };

  const validateVerificationCode = (code: string): boolean => {
    return /^\d{6}$/.test(code);
  };

  // 이메일 인증번호 발송
  const handleSendVerification = async () => {
    setErrors({ ...errors, email: '', verificationCode: '' });
    setIsEmailVerified(false);
    setVerificationCode('');
    setShowVerificationCodeInput(false);

    // 이메일 검증
    if (!email.trim()) {
      setErrors({ ...errors, email: '이메일을 입력해주세요.', verificationCode: '' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ ...errors, email: '올바른 이메일 형식으로 입력해주세요.', verificationCode: '' });
      return;
    }

    setIsSendingVerification(true);

    try {
      const result = await sendVerification({ email });

      if (result.success && result.data) {
        setShowVerificationCodeInput(true);
        Alert.alert('인증번호 발송', '이메일로 인증번호를 보냈습니다.\n인증번호를 입력해주세요.');
      } else {
        let errorMessage = '인증번호 발송에 실패했습니다.';
        if (result.error) {
          if (typeof result.error === 'string') {
            errorMessage = result.error;
          } else if (typeof result.error === 'object') {
            const errorObj = result.error as any;
            errorMessage = errorObj.message || errorObj.error || errorMessage;
          }
        }
        setErrors({ ...errors, email: errorMessage, verificationCode: '' });
      }
    } catch (error) {
      console.error('Send verification error:', error);
      setErrors({ ...errors, email: '인증번호 발송 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', verificationCode: '' });
    } finally {
      setIsSendingVerification(false);
    }
  };

  // 이메일 인증번호 확인
  const handleVerifyEmail = async () => {
    setErrors({ ...errors, email: '', verificationCode: '' });

    // 인증번호 검증
    if (!verificationCode.trim()) {
      setErrors({ ...errors, email: '', verificationCode: '인증번호를 입력해주세요.' });
      return;
    }

    if (!validateVerificationCode(verificationCode)) {
      setErrors({ ...errors, email: '', verificationCode: '인증번호는 6자리 숫자로 입력해주세요.' });
      return;
    }

    setIsVerifyingCode(true);

    try {
      const result = await verifyEmail({
        email,
        code: verificationCode,
      });

      if (result.success && result.data !== undefined) {
        if (result.data === true) {
          setIsEmailVerified(true);
          Alert.alert('인증 완료', '이메일 인증이 완료되었습니다.');
        } else {
          setErrors({ ...errors, email: '', verificationCode: '인증번호가 올바르지 않습니다.' });
        }
      } else {
        let errorMessage = '인증번호가 올바르지 않습니다.';
        if (result.error) {
          if (typeof result.error === 'string') {
            errorMessage = result.error;
          } else if (typeof result.error === 'object') {
            const errorObj = result.error as any;
            errorMessage = errorObj.message || errorObj.error || errorMessage;
          }
        }
        setErrors({ ...errors, email: '', verificationCode: errorMessage });
      }
    } catch (error) {
      console.error('Verify email error:', error);
      setErrors({ ...errors, email: '', verificationCode: '인증번호 확인 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.' });
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleSignUp = async () => {
    // 에러 초기화
    setErrors({
      email: '',
      password: '',
      confirmPassword: '',
      nickname: '',
      phone: '',
      verificationCode: '',
      gender: '',
      region: '',
      birthYear: '',
    });

    let hasError = false;
    const newErrors = {
      email: '',
      password: '',
      confirmPassword: '',
      nickname: '',
      phone: '',
      verificationCode: '',
      gender: '',
      region: '',
      birthYear: '',
    };

    // 유효성 검사
    if (!email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
      hasError = true;
    } else if (!validateEmail(email)) {
      newErrors.email = '올바른 이메일 형식으로 입력해주세요.';
      hasError = true;
    } else if (!isEmailVerified) {
      newErrors.email = '이메일 인증을 완료해주세요.';
      hasError = true;
    }

    if (!password.trim()) {
      newErrors.password = '비밀번호를 입력해주세요.';
      hasError = true;
    } else if (password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상 입력해주세요.';
      hasError = true;
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
      hasError = true;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
      hasError = true;
    }

    if (!nickname.trim()) {
      newErrors.nickname = '닉네임을 입력해주세요.';
      hasError = true;
    } else if (nickname.length < 2 || nickname.length > 20) {
      newErrors.nickname = '닉네임은 2~20자 사이로 입력해주세요.';
      hasError = true;
    }

    if (!phone.trim()) {
      newErrors.phone = '전화번호를 입력해주세요.';
      hasError = true;
    } else if (!validatePhone(phone)) {
      newErrors.phone = '올바른 전화번호 형식으로 입력해주세요. (예: 01012345678)';
      hasError = true;
    }

    if (!gender) {
      newErrors.gender = '성별을 선택해주세요.';
      hasError = true;
    }

    if (!region) {
      newErrors.region = '지역을 선택해주세요.';
      hasError = true;
    }

    if (!birthYear) {
      newErrors.birthYear = '출생연도를 선택해주세요.';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const result = await join({
        id: email,
        password: password,
        name: nickname,
        phone: phone.replace(/-/g, ''),
        gender: gender || undefined,
        region: region || undefined,
        birthYear: birthYear || undefined,
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

        Alert.alert('회원가입 완료', '환영합니다!\n홈 화면으로 이동합니다.', [
          {
            text: '확인',
            onPress: () => onNavigate(SCREEN_NAMES.HOME as string),
          },
        ]);
      } else {
        Alert.alert('회원가입 실패', result.error || '회원가입에 실패했습니다.\n잠시 후 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('SignUp error:', error);
      Alert.alert('오류', '회원가입 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.');
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
        title="회원가입"
        leftButton={
          <TouchableOpacity
            onPress={() => onNavigate(SCREEN_NAMES.START as string)}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="뒤로가기"
          >
            <Image
              source={require('../../assets/images/left.png')}
              style={styles.backButtonIcon}
              resizeMode="contain"
              accessibilityElementsHidden={true}
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
              accessibilityLabel="Replant 로고"
            />
            <Text style={styles.infoText} numberOfLines={1}>
            지금의 나에서, 한 단계 더 성장해보세요.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>이메일</Text>
            <Input
              placeholder="이메일 주소를 입력해주세요"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setIsEmailVerified(false);
                setVerificationCode('');
                setShowVerificationCodeInput(false);
                if (errors.email) {
                  setErrors({ ...errors, email: '', verificationCode: '' });
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              blurOnSubmit={false}
              inputStyle={styles.inputText}
              editable={!isEmailVerified}
            />
            {isEmailVerified && (
              <View style={styles.verifiedBadgeContainer}>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ 인증완료</Text>
                </View>
              </View>
            )}
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            
            {!isEmailVerified && (
              <>
                <TouchableOpacity
                  onPress={handleSendVerification}
                  disabled={isSendingVerification || !validateEmail(email)}
                  style={[
                    styles.verificationButton,
                    (!validateEmail(email) || isSendingVerification) && styles.verificationButtonDisabled,
                  ]}
                >
                  <Text style={[
                    styles.verificationButtonText,
                    (!validateEmail(email) || isSendingVerification) && styles.verificationButtonTextDisabled,
                  ]}>
                    {isSendingVerification ? '발송 중...' : '인증번호 발송'}
                  </Text>
                </TouchableOpacity>
                
                {showVerificationCodeInput && (
                  <View style={styles.verificationCodeContainer}>
                    <Text style={styles.label}>인증번호</Text>
                    <Input
                      placeholder="인증번호 6자리 입력"
                      value={verificationCode}
                      onChangeText={(text) => {
                        setVerificationCode(text);
                        if (errors.verificationCode) {
                          setErrors({ ...errors, verificationCode: '' });
                        }
                      }}
                      keyboardType="number-pad"
                      maxLength={6}
                      returnKeyType="done"
                      blurOnSubmit={true}
                      inputStyle={styles.inputText}
                    />
                    <TouchableOpacity
                      onPress={handleVerifyEmail}
                      disabled={isVerifyingCode || !validateVerificationCode(verificationCode)}
                      style={[
                        styles.verifyButton,
                        (!validateVerificationCode(verificationCode) || isVerifyingCode) && styles.verifyButtonDisabled,
                      ]}
                    >
                      <Text style={[
                        styles.verifyButtonText,
                        (!validateVerificationCode(verificationCode) || isVerifyingCode) && styles.verifyButtonTextDisabled,
                      ]}>
                        {isVerifyingCode ? '확인 중...' : '인증번호 확인'}
                      </Text>
                    </TouchableOpacity>
                    {errors.verificationCode ? <Text style={styles.errorText}>{errors.verificationCode}</Text> : null}
                  </View>
                )}
              </>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>비밀번호</Text>
            <Input
              placeholder="8자 이상의 비밀번호를 입력해주세요"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) {
                  setErrors({ ...errors, password: '' });
                }
              }}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              blurOnSubmit={false}
              inputStyle={styles.inputText}
            />
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>비밀번호 확인</Text>
            <Input
              placeholder="비밀번호를 한 번 더 입력해주세요"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) {
                  setErrors({ ...errors, confirmPassword: '' });
                }
              }}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              blurOnSubmit={false}
              inputStyle={styles.inputText}
            />
            {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>닉네임</Text>
            <Input
              placeholder="2~20자 사이의 닉네임을 입력해주세요"
              value={nickname}
              onChangeText={(text) => {
                setNickname(text);
                if (errors.nickname) {
                  setErrors({ ...errors, nickname: '' });
                }
              }}
              maxLength={20}
              returnKeyType="next"
              blurOnSubmit={false}
              inputStyle={styles.inputText}
            />
            {errors.nickname ? <Text style={styles.errorText}>{errors.nickname}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>전화번호</Text>
            <Input
              placeholder="숫자만 입력해주세요 (예: 01012345678)"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (errors.phone) {
                  setErrors({ ...errors, phone: '' });
                }
              }}
              keyboardType="phone-pad"
              maxLength={11}
              returnKeyType="done"
              blurOnSubmit={true}
              inputStyle={styles.inputText}
            />
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>성별</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'MALE' && styles.genderButtonSelected,
                ]}
                onPress={() => {
                  setGender('MALE');
                  if (errors.gender) {
                    setErrors({ ...errors, gender: '' });
                  }
                }}
              >
                <Text style={[
                  styles.genderButtonText,
                  gender === 'MALE' && styles.genderButtonTextSelected,
                ]}>남성</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'FEMALE' && styles.genderButtonSelected,
                ]}
                onPress={() => {
                  setGender('FEMALE');
                  if (errors.gender) {
                    setErrors({ ...errors, gender: '' });
                  }
                }}
              >
                <Text style={[
                  styles.genderButtonText,
                  gender === 'FEMALE' && styles.genderButtonTextSelected,
                ]}>여성</Text>
              </TouchableOpacity>
            </View>
            {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>지역</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowRegionModal(true)}
            >
              <Text style={[
                styles.dropdownButtonText,
                !regionName && styles.dropdownPlaceholder,
              ]}>
                {regionName || '지역을 선택해주세요'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
            {errors.region ? <Text style={styles.errorText}>{errors.region}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>출생연도</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowBirthYearModal(true)}
            >
              <Text style={[
                styles.dropdownButtonText,
                !birthYear && styles.dropdownPlaceholder,
              ]}>
                {birthYear ? `${birthYear}년` : '출생연도를 선택해주세요'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
            {errors.birthYear ? <Text style={styles.errorText}>{errors.birthYear}</Text> : null}
          </View>
        </View>
      </ScrollView>

      {/* 지역 선택 모달 */}
      <Modal
        visible={showRegionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRegionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>지역 선택</Text>
              <TouchableOpacity onPress={() => setShowRegionModal(false)}>
                <Text style={styles.modalCloseButton}>닫기</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={regions}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.regionItem,
                    region === item.code && styles.regionItemSelected,
                  ]}
                  onPress={() => {
                    setRegion(item.code);
                    setRegionName(item.name);
                    setShowRegionModal(false);
                    if (errors.region) {
                      setErrors({ ...errors, region: '' });
                    }
                  }}
                >
                  <Text style={[
                    styles.regionItemText,
                    region === item.code && styles.regionItemTextSelected,
                  ]}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* 출생연도 선택 모달 */}
      <Modal
        visible={showBirthYearModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBirthYearModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>출생연도 선택</Text>
              <TouchableOpacity onPress={() => setShowBirthYearModal(false)}>
                <Text style={styles.modalCloseButton}>닫기</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={birthYears}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.regionItem,
                    birthYear === item && styles.regionItemSelected,
                  ]}
                  onPress={() => {
                    setBirthYear(item);
                    setShowBirthYearModal(false);
                    if (errors.birthYear) {
                      setErrors({ ...errors, birthYear: '' });
                    }
                  }}
                >
                  <Text style={[
                    styles.regionItemText,
                    birthYear === item && styles.regionItemTextSelected,
                  ]}>{item}년</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <View style={styles.buttonContainer}>
        <Button
          title={isLoading ? '처리 중...' : '회원가입'}
          onPress={handleSignUp}
          disabled={isLoading || !isEmailVerified}
          loading={isLoading}
          size="lg"
          style={[
            styles.button,
            !isEmailVerified && styles.buttonDisabled,
          ]}
          textStyle={styles.buttonText}
        />
        <TouchableOpacity
          onPress={() => onNavigate(SCREEN_NAMES.LOGIN as string)}
          style={styles.linkButton}
          accessibilityRole="button"
          accessibilityLabel="이미 계정이 있으신가요? 로그인"
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
  verifiedBadgeContainer: {
    marginTop: spacing[1],
  },
  verifiedBadge: {
    backgroundColor: colors.green[100],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.green[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: {
    fontSize: typography.fontSize.sm,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    color: colors.green[700],
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  verificationButton: {
    marginTop: spacing[1],
    height: 44,
    width: '100%',
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  verificationButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  verificationButtonText: {
    fontSize: typography.fontSize.sm,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    color: colors.white,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  verificationButtonTextDisabled: {
    color: colors.gray[500],
  },
  verificationCodeContainer: {
    marginTop: spacing[4],
    gap: 0,
  },
  verifyButton: {
    marginTop: 0,
    height: 44,
    width: '100%',
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  verifyButtonText: {
    fontSize: typography.fontSize.sm,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    color: colors.white,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  verifyButtonTextDisabled: {
    color: colors.gray[500],
  },
  buttonDisabled: {
    backgroundColor: colors.gray[300],
  },
  // 성별 선택 스타일
  genderContainer: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  genderButton: {
    flex: 1,
    height: 44,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderButtonSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  genderButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
  },
  genderButtonTextSelected: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.semibold,
  },
  // 드롭다운 스타일
  dropdownButton: {
    height: 44,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    paddingHorizontal: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
  },
  dropdownPlaceholder: {
    color: colors.gray[400],
  },
  dropdownArrow: {
    fontSize: 12,
    color: colors.gray[400],
  },
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
  },
  modalCloseButton: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
  },
  regionItem: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  regionItemSelected: {
    backgroundColor: colors.primary[50],
  },
  regionItemText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
  },
  regionItemTextSelected: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.semibold,
  },
});

export default SignUpScreen;
