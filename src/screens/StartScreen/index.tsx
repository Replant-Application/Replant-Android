import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, Platform } from 'react-native';
import { spacing } from '../../utils/designTokens';
import { SCREEN_NAMES } from '../../utils/constants';

interface StartScreenProps {
  onNavigate: (screen: string) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onNavigate }) => {
  const handleKakaoLogin = () => {
    Alert.alert('Kakao 계정으로 로그인', '카카오 로그인 기능은 준비 중입니다.');
  };

  const handleGoogleLogin = () => {
    Alert.alert('Google 계정으로 로그인', '구글 로그인 기능은 준비 중입니다.');
  };

  const handleSignUp = () => {
    onNavigate(SCREEN_NAMES.SIGNUP as string);
  };

  const handleLogin = () => {
    onNavigate(SCREEN_NAMES.LOGIN as string);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/images/Replant_Loading.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.title}>RePlant</Text>
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>다시 살아갈 당신에게 희망을</Text>
          <Text style={styles.clover}>🍀</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.kakaoButton}
          onPress={handleKakaoLogin}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../assets/images/kakao_logo.png')}
            style={styles.kakaoLogo}
            resizeMode="contain"
          />
          <Text style={styles.kakaoButtonText}>Kakao 계정으로 로그인</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleLogin}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../assets/images/google_logo.png')}
            style={styles.googleLogo}
            resizeMode="contain"
          />
          <Text style={styles.googleButtonText}>Google 계정으로 로그인</Text>
        </TouchableOpacity>

        <View style={styles.textButtonContainer}>
          <TouchableOpacity
            style={styles.textButton}
            onPress={handleSignUp}
            activeOpacity={0.8}
          >
            <Text style={styles.textButtonText}>회원가입</Text>
          </TouchableOpacity>
          <Text style={styles.dividerText}>|</Text>
          <TouchableOpacity
            style={styles.textButton}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.textButtonText}>로그인</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: spacing[6],
    paddingTop: spacing[1],
    paddingBottom: spacing[10],
    justifyContent: 'space-between',
  },
  content: {
    alignItems: 'center',
    paddingTop: spacing[24] + spacing[12],
  },
  logoImage: {
    width: 160,
    height: 160,
    marginBottom: spacing[1],
  },
  title: {
    fontSize: 66,
    fontWeight: '600',
    color: '#166534',
    marginBottom: spacing[2],
    letterSpacing: 2,
    fontFamily: Platform.select({
      ios: 'Maplestory Bold',
      android: 'MaplestoryBold',
    }),
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '300',
    color: '#666666',
    letterSpacing: 0.2,
    fontFamily: Platform.select({
      ios: 'Maplestory Light',
      android: 'MaplestoryLight',
    }),
  },
  clover: {
    fontSize: 15,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing[3],
    paddingBottom: spacing[8],
    paddingTop: spacing[4],
    alignItems: 'center',
  },
  kakaoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    height: 45,
    backgroundColor: '#FEE500',
    borderRadius: 28,
    gap: spacing[5],
  },
  kakaoLogo: {
    width: 24,
    height: 24,
  },
  kakaoButtonText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    letterSpacing: 0.3,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    height: 45,
    backgroundColor: '#000000',
    borderWidth: 0,
    borderRadius: 28,
    gap: spacing[5],
  },
  googleLogo: {
    width: 19,
    height: 19,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  textButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  textButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
  },
  textButtonText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666666',
  },
  dividerText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
});

export default StartScreen;
