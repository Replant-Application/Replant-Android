import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Button, Input, Header } from '../../components/ui';
import { useFindIdScreenContainer } from './FindIdScreen.container';
import { styles } from './FindIdScreen.styles';

interface FindIdScreenProps {
  onNavigate: (screen: string, params?: any) => void;
}

const FindIdScreen: React.FC<FindIdScreenProps> = ({ onNavigate }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    nickname,
    input,
    inputType,
    isLoading,
    error,
    handleNicknameChange,
    handleInputChange,
    handleFindId,
    handleGoToLogin,
  } = useFindIdScreenContainer({
    onNavigate,
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header
        title="아이디 찾기"
        leftButton={
          <TouchableOpacity
            onPress={handleGoToLogin}
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
              전화번호 또는 이메일을 입력해주세요
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>닉네임</Text>
            <Input
              placeholder="닉네임을 입력해주세요"
              value={nickname}
              onChangeText={handleNicknameChange}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              blurOnSubmit={false}
              inputStyle={styles.inputText}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>전화번호 또는 이메일</Text>
            <Input
              placeholder="전화번호 또는 이메일을 입력해주세요"
              value={input}
              onChangeText={handleInputChange}
              keyboardType={inputType === 'phone' ? 'phone-pad' : 'email-address'}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              blurOnSubmit={true}
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
          onPress={handleGoToLogin}
          style={styles.linkButton}
          accessibilityRole="button"
          accessibilityLabel="로그인으로 돌아가기"
        >
          <Text style={styles.linkText}>로그인으로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default FindIdScreen;
