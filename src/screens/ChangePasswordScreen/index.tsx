import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { Button, Input, Header } from '../../components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { useUser } from '../../contexts/UserContext';
import { resetPassword, ResetPasswordRequest } from '../../api/authApi';
import { getUserInfo } from '../../utils/tokenStorage';
import { RootStackParamList } from '../../types/navigation';

interface ChangePasswordScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({ navigation }) => {
  const { user } = useUser();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // 비밀번호 유효성 검증
  const validatePassword = (password: string): string => {
    if (!password) {
      return '비밀번호를 입력해주세요.';
    }
    if (password.length < 8) {
      return '비밀번호는 8자 이상이어야 합니다.';
    }
    return '';
  };

  // 새 비밀번호와 확인 비밀번호 일치 확인
  const validateConfirmPassword = (newPwd: string, confirmPwd: string): string => {
    if (!confirmPwd) {
      return '비밀번호 확인을 입력해주세요.';
    }
    if (newPwd !== confirmPwd) {
      return '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.';
    }
    return '';
  };

  // 전체 폼 검증
  const validateForm = (): boolean => {
    const newErrors = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    // 현재 비밀번호 검증
    newErrors.oldPassword = validatePassword(oldPassword);

    // 새 비밀번호 검증
    newErrors.newPassword = validatePassword(newPassword);

    // 확인 비밀번호 검증
    newErrors.confirmPassword = validateConfirmPassword(newPassword, confirmPassword);

    // 새 비밀번호와 현재 비밀번호가 같은지 확인
    if (oldPassword && newPassword && oldPassword === newPassword) {
      newErrors.newPassword = '새 비밀번호는 현재 비밀번호와 달라야 합니다.';
    }

    setErrors(newErrors);

    return !newErrors.oldPassword && !newErrors.newPassword && !newErrors.confirmPassword;
  };

  // 비밀번호 변경 처리
  const handleChangePassword = async () => {
    // 폼 검증
    if (!validateForm()) {
      return;
    }

    // 사용자 이메일 가져오기
    let userEmail = '';
    try {
      const userInfo = await getUserInfo();
      if (userInfo?.email) {
        userEmail = userInfo.email;
      } else {
        Alert.alert('오류', '사용자 정보를 가져올 수 없습니다. 다시 로그인해주세요.');
        return;
      }
    } catch (error) {
      Alert.alert('오류', '사용자 정보를 가져오는 중 오류가 발생했습니다.');
      return;
    }

    setIsLoading(true);

    try {
      const requestData: ResetPasswordRequest = {
        id: userEmail,
        oldPassword: oldPassword.trim(),
        newPassword: newPassword.trim(),
      };

      const result = await resetPassword(requestData);

      if (result.success) {
        Alert.alert(
          '완료',
          '비밀번호가 성공적으로 변경되었습니다.',
          [
            {
              text: '확인',
              onPress: () => {
                // 입력 필드 초기화
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setErrors({ oldPassword: '', newPassword: '', confirmPassword: '' });
                // 이전 화면으로 돌아가기
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        // 에러 코드에 따른 메시지 처리
        let errorMessage = '비밀번호 변경에 실패했습니다.';
        
        if (result.error) {
          if (result.error.includes('ACCOUNT-011') || result.error.includes('비밀번호가 틀립니다')) {
            errorMessage = '현재 비밀번호가 일치하지 않습니다.';
            setErrors((prev) => ({ ...prev, oldPassword: errorMessage }));
          } else if (result.error.includes('ACCOUNT-020') || result.error.includes('동일합니다')) {
            errorMessage = '새 비밀번호는 현재 비밀번호와 달라야 합니다.';
            setErrors((prev) => ({ ...prev, newPassword: errorMessage }));
          } else if (result.error.includes('ACCOUNT-010') || result.error.includes('존재하지 않습니다')) {
            errorMessage = '회원 정보를 찾을 수 없습니다.';
          } else {
            errorMessage = result.error;
          }
        }

        Alert.alert('오류', errorMessage);
      }
    } catch (error) {
      console.error('비밀번호 변경 오류:', error);
      Alert.alert('오류', '비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <Header title="비밀번호 변경" navigation={navigation} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                비밀번호를 변경하려면 현재 비밀번호를 입력한 후,{'\n'}
                새로운 비밀번호를 입력해주세요.
              </Text>
            </View>

            <View style={styles.form}>
              {/* 현재 비밀번호 */}
              <View style={styles.inputContainer}>
                <Input
                  label="현재 비밀번호"
                  placeholder="현재 비밀번호를 입력하세요"
                  value={oldPassword}
                  onChangeText={(text) => {
                    setOldPassword(text);
                    if (errors.oldPassword) {
                      setErrors((prev) => ({ ...prev, oldPassword: '' }));
                    }
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  error={errors.oldPassword}
                  inputStyle={styles.inputText}
                />
              </View>

              {/* 새 비밀번호 */}
              <View style={styles.inputContainer}>
                <Input
                  label="새 비밀번호"
                  placeholder="8자 이상의 비밀번호를 입력하세요"
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    if (errors.newPassword) {
                      setErrors((prev) => ({ ...prev, newPassword: '' }));
                    }
                    // 확인 비밀번호와 일치 여부 재확인
                    if (confirmPassword && text !== confirmPassword) {
                      setErrors((prev) => ({
                        ...prev,
                        confirmPassword: '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.',
                      }));
                    } else if (confirmPassword && text === confirmPassword) {
                      setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  error={errors.newPassword}
                  inputStyle={styles.inputText}
                />
              </View>

              {/* 새 비밀번호 확인 */}
              <View style={styles.inputContainer}>
                <Input
                  label="새 비밀번호 확인"
                  placeholder="새 비밀번호를 한 번 더 입력하세요"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) {
                      setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }
                    // 새 비밀번호와 일치 여부 확인
                    if (newPassword && text !== newPassword) {
                      setErrors((prev) => ({
                        ...prev,
                        confirmPassword: '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.',
                      }));
                    } else if (newPassword && text === newPassword) {
                      setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleChangePassword}
                  error={errors.confirmPassword}
                  inputStyle={styles.inputText}
                />
              </View>

              {/* 변경 버튼 */}
              <View style={styles.buttonContainer}>
                <Button
                  title="비밀번호 변경"
                  onPress={handleChangePassword}
                  variant="primary"
                  size="lg"
                  disabled={isLoading}
                  loading={isLoading}
                  style={styles.changeButton}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing[10],
  },
  content: {
    padding: spacing[5],
  },
  infoBox: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  infoText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: getOptimizedLineHeight(typography.fontSize.base) * 1.5,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  form: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    ...shadows.lg,
  },
  inputContainer: {
    marginBottom: spacing[4],
  },
  inputText: {
    fontSize: typography.fontSize.base,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  buttonContainer: {
    marginTop: spacing[6],
  },
  changeButton: {
    width: '100%',
  },
});

export default ChangePasswordScreen;
