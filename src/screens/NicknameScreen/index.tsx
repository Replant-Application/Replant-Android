import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Button, Input, Header } from '../../components/ui';
import { colors, spacing, typography } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { useNicknameScreenContainer } from './NicknameScreen.container';

interface NicknameScreenProps {
  onNavigate: (screen: string) => void;
}

const NicknameScreen: React.FC<NicknameScreenProps> = ({ onNavigate }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    nickname,
    setNickname,
    isLoading,
    handleGoBackToSocialLogin,
    handleSubmit,
  } = useNicknameScreenContainer({
    onNavigate,
  });

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <Text style={styles.title}>닉네임을 입력해주세요</Text>
        <Text style={styles.subtitle}>
          다른 사용자들과 구분할 수 있는{'\n'}
          고유한 닉네임을 설정해주세요
        </Text>

        <Input
          placeholder="닉네임을 입력하세요"
          value={nickname}
          onChangeText={setNickname}
          onSubmitEditing={handleSubmit}
          maxLength={20}
          autoFocus
          returnKeyType="done"
          autoCorrect={false}
          autoCapitalize="none"
          keyboardType="default"
          style={styles.input}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={isLoading ? '처리 중...' : '완료'}
          onPress={handleSubmit}
          disabled={isLoading}
          loading={isLoading}
          size="lg"
          style={styles.button}
        />
        <TouchableOpacity
          onPress={handleGoBackToSocialLogin}
          style={styles.backToSocialButton}
        >
          <Text style={styles.backToSocialText}>소셜 로그인으로 돌아가기</Text>
        </TouchableOpacity>
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
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[4],
    textAlign: 'center' as const,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize['2xl']),
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[10],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  input: {
    // textAlign은 Input 컴포넌트에서 처리
  },
  buttonContainer: {
    paddingBottom: spacing[10],
    gap: spacing[3],
  },
  button: {
    width: '100%',
  },
  backToSocialButton: {
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  backToSocialText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textDecorationLine: 'underline',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
});

export default NicknameScreen;
