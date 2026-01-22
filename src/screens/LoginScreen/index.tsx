import React from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Image, TextInput, Modal, Animated } from 'react-native';
import FastImage from 'react-native-fast-image';
import { SCREEN_NAMES } from '../../utils/constants';
import { AlertModal } from '../../components/ui';
import { colors } from '../../utils/designTokens';
import { useLoginScreenContainer } from './LoginScreen.container';
import { styles } from './LoginScreen.styles';

interface LoginScreenProps {
  onNavigate: (screen: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    email,
    password,
    isLoading,
    keepLoggedIn,
    showSuccessModal,
    userName,
    showAlert,
    alertTitle,
    alertMessage,
    modalScaleAnim,
    modalFadeAnim,
    setEmail,
    setPassword,
    setKeepLoggedIn,
    handleLogin,
    handleKakaoLogin,
    handleGoogleLogin,
    handleSuccessModalClose,
    handleSuccessModalRequestClose,
    handleCloseAlert,
  } = useLoginScreenContainer({ onNavigate });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.topSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/Replant_Loading.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="Replant 로고"
            />
          </View>
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="이메일을 입력하세요"
              placeholderTextColor={colors.gray[500]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              blurOnSubmit={false}
              style={styles.input}
              accessibilityLabel="이메일"
              accessibilityHint="이메일 주소를 입력하세요"
              allowFontScaling={true}
              {...(Platform.OS === 'android' && { includeFontPadding: false })}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="비밀번호를 입력하세요"
              placeholderTextColor={colors.gray[500]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              blurOnSubmit={true}
              style={styles.input}
              accessibilityLabel="비밀번호"
              accessibilityHint="비밀번호를 입력하세요"
              allowFontScaling={true}
              {...(Platform.OS === 'android' && { includeFontPadding: false })}
            />
          </View>

          <View style={styles.optionsRow}>
            <TouchableOpacity
              onPress={() => setKeepLoggedIn(!keepLoggedIn)}
              style={styles.checkboxRow}
              accessibilityRole="checkbox"
              accessibilityLabel="로그인 유지"
              accessibilityState={{ checked: keepLoggedIn }}
            >
              <View style={[styles.checkbox, keepLoggedIn && styles.checkboxChecked]}>
                {keepLoggedIn && <Text style={styles.checkmark} accessibilityElementsHidden={true}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>로그인 유지</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={isLoading ? '처리 중' : '이메일로 로그인'}
            accessibilityState={{ disabled: isLoading }}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? '처리 중...' : '이메일로 로그인'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footerLinks}>
            <TouchableOpacity
              onPress={() => onNavigate(SCREEN_NAMES.FIND_PASSWORD as string)}
              style={styles.footerLink}
              accessibilityRole="button"
              accessibilityLabel="비밀번호 찾기"
            >
              <Text style={styles.footerLinkText}>비밀번호 찾기</Text>
            </TouchableOpacity>
            <Text style={styles.footerSeparator} accessibilityElementsHidden={true}>|</Text>
            <TouchableOpacity
              onPress={() => onNavigate(SCREEN_NAMES.FIND_ID as string)}
              style={styles.footerLink}
              accessibilityRole="button"
              accessibilityLabel="아이디 찾기"
            >
              <Text style={styles.footerLinkText}>아이디 찾기</Text>
            </TouchableOpacity>
            <Text style={styles.footerSeparator} accessibilityElementsHidden={true}>|</Text>
            <TouchableOpacity
              onPress={() => onNavigate(SCREEN_NAMES.SIGNUP as string)}
              style={styles.footerLink}
              accessibilityRole="button"
              accessibilityLabel="회원가입"
            >
              <Text style={styles.footerLinkText}>회원가입</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.socialSection}>
            <View style={styles.socialTitleContainer}>
              <View style={styles.socialTitleLine} />
              <Text style={styles.socialTitle}>간편로그인</Text>
              <View style={styles.socialTitleLine} />
            </View>
            <View style={styles.socialIcons}>
              <TouchableOpacity 
                style={styles.socialIcon}
                onPress={handleKakaoLogin}
                disabled={isLoading}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="카카오로 로그인"
                accessibilityState={{ disabled: isLoading }}
              >
                <View style={[styles.socialIconCircle, { backgroundColor: '#FEE500' }]}>
                  <Image
                    source={require('../../assets/images/kakao_logo.png')}
                    style={styles.socialIconImage}
                    resizeMode="contain"
                    accessibilityElementsHidden={true}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.socialIcon}
                onPress={handleGoogleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="구글로 로그인"
                accessibilityState={{ disabled: isLoading }}
              >
                <View style={[styles.socialIconCircle, { backgroundColor: colors.background.primary, borderWidth: 1, borderColor: colors.border.light }]}>
                  <Image
                    source={require('../../assets/images/google_logo.png')}
                    style={styles.socialIconImage}
                    resizeMode="contain"
                    accessibilityElementsHidden={true}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleSuccessModalRequestClose}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: modalFadeAnim }]}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ scale: modalScaleAnim }],
              },
            ]}
          >
            <View style={styles.modalCharacterContainer}>
              <FastImage
                source={require('../../assets/images/smile_replant.gif')}
                style={styles.modalCharacter}
                resizeMode={FastImage.resizeMode.contain}
                accessibilityLabel="환영하는 캐릭터"
              />
            </View>
            <View style={styles.modalTextContainer}>
              <Text style={styles.modalMessage}>
                환영합니다! <Text style={styles.modalUserName}>{userName}</Text>님,{'\n'}
                함께 성장해요 🌱
              </Text>
            </View>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleSuccessModalClose}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="시작하기"
            >
              <Text style={styles.modalButtonText}>시작하기</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>

      <AlertModal
        visible={showAlert}
        title={alertTitle}
        message={alertMessage}
        onClose={handleCloseAlert}
      />
    </KeyboardAvoidingView>
  );
};


export default LoginScreen;
