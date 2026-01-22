import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Button, Input, Header, AlertModal } from '../../components/ui';
import { SCREEN_NAMES } from '../../utils/constants';
import { SignUpScreenProps } from '../../types/screens/auth';
import GenderSelector from './components/GenderSelector';
import RegionSelector from './components/RegionSelector';
import BirthYearSelector from './components/BirthYearSelector';
import { useSignUpScreenContainer } from './SignUpScreen.container';
import { styles } from './SignUpScreen.styles';

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onNavigate }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    email,
    password,
    confirmPassword,
    nickname,
    phone,
    verificationCode,
    isEmailVerified,
    isSendingVerification,
    isVerifyingCode,
    showVerificationCodeInput,
    isLoading,
    timer,
    showVerificationModal,
    showVerificationCompleteModal,
    showSignUpCompleteModal,
    gender,
    region,
    regionName,
    showRegionModal,
    birthYear,
    showBirthYearModal,
    birthYears,
    errors,
    setEmail,
    setPassword,
    setConfirmPassword,
    setNickname,
    setPhone,
    setVerificationCode,
    setGender,
    setRegion,
    setShowRegionModal,
    setBirthYear,
    setShowBirthYearModal,
    handleSendVerification,
    handleVerifyEmail,
    handleSignUp,
    handleSignUpCompleteModalClose,
    validateEmail,
    validatePhone,
    validateVerificationCode,
    setShowVerificationModal,
    setShowVerificationCompleteModal,
  } = useSignUpScreenContainer({ onNavigate });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header
        title="회원가입"
        leftButton={
          <TouchableOpacity
            onPress={() => onNavigate(SCREEN_NAMES.LOGIN as string)}
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
            <View style={styles.emailRow}>
              <View style={styles.emailInputWrapper}>
                <Input
                  placeholder="이메일 주소를 입력해주세요"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  inputStyle={[styles.inputText, styles.emailInputHeight] as any}
                  style={styles.emailInputContainer}
                  editable={!isEmailVerified}
                />
              </View>
              {!isEmailVerified && (
                <TouchableOpacity
                  onPress={handleSendVerification}
                  disabled={isSendingVerification || !validateEmail(email)}
                  style={[
                    styles.verificationButtonInline,
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
              )}
            </View>
            {isEmailVerified && (
              <View style={styles.verifiedBadgeContainer}>
                <Text style={styles.verifiedText}>이메일 인증이 완료되었습니다.</Text>
              </View>
            )}
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            
            {!isEmailVerified && (
              <>
                
                {showVerificationCodeInput && (
                  <View style={styles.verificationCodeContainer}>
                    <Text style={styles.label}>인증번호</Text>
                    <View style={styles.verificationCodeRow}>
                      <View style={styles.verificationCodeInputWrapper}>
                        <Input
                          placeholder="인증번호 6자리 입력"
                          value={verificationCode}
                          onChangeText={setVerificationCode}
                          keyboardType="number-pad"
                          maxLength={6}
                          returnKeyType="done"
                          blurOnSubmit={true}
                          inputStyle={[styles.inputText, styles.emailInputHeight, styles.verificationCodeInputWithTimer] as any}
                          style={styles.emailInputContainer}
                        />
                        {timer > 0 && !isEmailVerified && (
                          <View style={styles.timerInsideInput}>
                            <Text style={styles.timerText}>
                              {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                            </Text>
                          </View>
                        )}
                      </View>
                      {timer > 0 ? (
                        <TouchableOpacity
                          onPress={handleVerifyEmail}
                          disabled={isVerifyingCode || !validateVerificationCode(verificationCode)}
                          style={[
                            styles.verifyButtonInline,
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
                      ) : (
                        <TouchableOpacity
                          onPress={handleSendVerification}
                          disabled={isSendingVerification || !validateEmail(email)}
                          style={[
                            styles.verifyButtonInline,
                            (!validateEmail(email) || isSendingVerification) && styles.verifyButtonDisabled,
                          ]}
                        >
                          <Text style={[
                            styles.verifyButtonText,
                            (!validateEmail(email) || isSendingVerification) && styles.verifyButtonTextDisabled,
                          ]}>
                            {isSendingVerification ? '발송 중...' : '재전송'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
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
              onChangeText={setPassword}
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
              onChangeText={setConfirmPassword}
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
              onChangeText={setNickname}
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
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={11}
              returnKeyType="done"
              blurOnSubmit={true}
              inputStyle={styles.inputText}
            />
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
          </View>

          <GenderSelector
            gender={gender}
            onGenderChange={setGender}
            error={errors.gender}
            onErrorClear={() => {}}
          />

          <RegionSelector
            region={region}
            regionName={regionName}
            onRegionChange={setRegion}
            showModal={showRegionModal}
            onModalToggle={() => setShowRegionModal(!showRegionModal)}
            onOtherModalClose={() => setShowBirthYearModal(false)}
            error={errors.region}
            onErrorClear={() => {}}
          />

          <BirthYearSelector
            birthYear={birthYear}
            onBirthYearChange={setBirthYear}
            showModal={showBirthYearModal}
            onModalToggle={() => setShowBirthYearModal(!showBirthYearModal)}
            onOtherModalClose={() => setShowRegionModal(false)}
            error={errors.birthYear}
            onErrorClear={() => {}}
          />
        </View>
      </ScrollView>


      {/* 인증번호 발송 알림 모달 */}
      <AlertModal
        visible={showVerificationModal}
        title="인증번호 발송"
        message="이메일로 인증번호를 보냈습니다. 인증번호를 입력해주세요."
        buttonText="확인"
        onClose={() => setShowVerificationModal(false)}
      />

      <AlertModal
        visible={showVerificationCompleteModal}
        title="인증 완료"
        message="이메일 인증이 완료되었습니다."
        buttonText="확인"
        onClose={() => setShowVerificationCompleteModal(false)}
      />

      <AlertModal
        visible={showSignUpCompleteModal}
        title="회원가입 완료"
        message="환영합니다! 지금의 나에서 한 단계 더 성장해보세요."
        buttonText="시작하기"
        onClose={handleSignUpCompleteModalClose}
      />

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
          ] as any}
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


export default SignUpScreen;
