import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { Button, Input } from '../components/ui';
import { colors, spacing, typography } from '../utils/designTokens';

interface NicknameScreenProps {
  onNavigate: (screen: string) => void;
}

const NicknameScreen: React.FC<NicknameScreenProps> = ({ onNavigate }) => {
  const { login } = useUser();
  const [nickname, setNickname] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (): Promise<void> => {
    // 닉네임 유효성 검사
    if (!nickname.trim()) {
      Alert.alert('오류', '닉네임을 입력해주세요.');
      return;
    }
    
    if (nickname.length < 2) {
      Alert.alert('오류', '닉네임은 2글자 이상 입력해주세요.');
      return;
    }
    
    if (nickname.length > 20) {
      Alert.alert('오류', '닉네임은 20글자 이하로 입력해주세요.');
      return;
    }

    setIsLoading(true);
    
    try {
      // 간단한 로그인 처리 (인증 없이)
      await login(nickname);
      // 성공 시 자동으로 홈 화면으로 이동
    } catch (error: any) {
      Alert.alert('오류', error.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>닉네임을 입력해주세요</Text>
        <Text style={styles.subtitle}>
          다른 사용자들과 구분할 수 있는{'\n'}
          고유한 닉네임을 설정해주세요
        </Text>
        
        <Input
          label="닉네임"
          placeholder="닉네임을 입력하세요"
          value={nickname}
          onChangeText={setNickname}
          maxLength={20}
          style={styles.input}
        />
        
        <Text style={styles.helpText}>
          • 2-20글자 사이로 입력해주세요{'\n'}
          • 특수문자 사용 가능합니다{'\n'}
          • 나중에 변경할 수 있습니다
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title="시작하기"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={!nickname.trim() || isLoading}
          size="lg"
          style={styles.button}
        />
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
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[4],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    marginBottom: spacing[8],
  },
  input: {
    marginBottom: spacing[4],
  },
  helpText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  buttonContainer: {
    paddingBottom: spacing[8],
  },
  button: {
    backgroundColor: colors.primary[500],
  },
});

export default NicknameScreen;
