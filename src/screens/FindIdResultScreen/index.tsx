import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Button, Header } from '../../components/ui';
import { useFindIdResultScreenContainer } from './FindIdResultScreen.container';
import { styles } from './FindIdResultScreen.styles';

interface FindIdResultScreenProps {
  onNavigate: (screen: string, params?: any) => void;
  route?: {
    params: {
      email: string; // 마스킹된 이메일
    };
  };
}

const FindIdResultScreen: React.FC<FindIdResultScreenProps> = ({ onNavigate, route }) => {
  const email = route?.params?.email || '';

  // 비즈니스 로직은 Container에서 처리
  const { maskedEmail, handleGoBack, handleGoToLogin, handleGoToFindPassword } =
    useFindIdResultScreenContainer({
      email,
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
            onPress={handleGoBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="뒤로 가기"
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
              accessibilityLabel="RePlant 로고"
            />
            <Text style={styles.infoText} numberOfLines={2}>
              찾은 아이디입니다.
            </Text>
          </View>

          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>아이디</Text>
            <View style={styles.resultBox}>
              <Text style={styles.resultEmail}>{maskedEmail}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="로그인하기"
          onPress={handleGoToLogin}
          size="lg"
          style={styles.button}
          textStyle={styles.buttonText}
        />
        <TouchableOpacity
          onPress={handleGoToFindPassword}
          style={styles.linkButton}
          accessibilityRole="button"
          accessibilityLabel="비밀번호 찾기"
        >
          <Text style={styles.linkText}>비밀번호 찾기</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default FindIdResultScreen;
