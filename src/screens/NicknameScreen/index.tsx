import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Button, Input, Header } from '../../components/ui';
import { useNicknameScreenContainer } from './NicknameScreen.container';
import { styles } from './NicknameScreen.styles';

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
          accessibilityRole="button"
          accessibilityLabel="소셜 로그인으로 돌아가기"
        >
          <Text style={styles.backToSocialText}>소셜 로그인으로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NicknameScreen;
