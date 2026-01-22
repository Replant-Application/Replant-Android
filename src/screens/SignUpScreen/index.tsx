import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Button, Input, Header, AlertModal } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { SCREEN_NAMES } from '../../constants/screens';
import { SignUpScreenProps } from '../../types/screens/auth';
import GenderSelector from './components/GenderSelector';
import RegionSelector from './components/RegionSelector';
import BirthYearSelector from './components/BirthYearSelector';
import { useSignUpScreenContainer } from './SignUpScreen.container';

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
    marginTop: 3,
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
    paddingLeft: spacing[1],
  },
  verifiedText: {
    fontSize: typography.fontSize.sm,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    color: colors.green[600],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  emailRow: {
    flexDirection: 'row',
    gap: spacing[2],
    alignItems: 'flex-start',
  },
  emailInputWrapper: {
    flex: 1,
    minWidth: 0,
  },
  emailInputContainer: {
    marginBottom: 0,
  },
  emailInputHeight: {
    height: 36,
    paddingVertical: spacing[1],
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
  verificationButtonInline: {
    height: 36,
    minWidth: 90,
    paddingHorizontal: spacing[2],
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
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
  verificationCodeRow: {
    flexDirection: 'row',
    gap: spacing[2],
    alignItems: 'flex-start',
  },
  verificationCodeInputWrapper: {
    flex: 1,
    minWidth: 0,
    position: 'relative',
  },
  verificationCodeInputWithTimer: {
    paddingRight: 60,
  },
  timerInsideInput: {
    position: 'absolute',
    right: spacing[3],
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  timerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
    minWidth: 50,
  },
  timerContainerBelow: {
    marginTop: spacing[1],
    paddingTop: 0,
    alignItems: 'flex-start',
    paddingLeft: spacing[1],
  },
  verifyButtonInline: {
    height: 36,
    minWidth: 107,
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  timerText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.red[500],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
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
    height: 100,
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
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    textAlignVertical: 'center',
    ...(Platform.OS === 'android' && { paddingTop: 2 }),
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
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    textAlignVertical: 'center',
    ...(Platform.OS === 'android' && { paddingTop: 2 }),
  },
  dropdownPlaceholder: {
    color: colors.gray[400],
  },
  dropdownArrow: {
    fontSize: 12,
    color: colors.gray[400],
  },
  dropdownList: {
    marginTop: spacing[1],
    maxHeight: 200,
    backgroundColor: colors.white,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.gray[300],
    overflow: 'hidden',
  },
  dropdownScrollView: {
    maxHeight: 200,
  },
  dropdownListItem: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  dropdownListItemFirst: {
    paddingTop: spacing[2],
  },
  dropdownListItemSelected: {
    backgroundColor: colors.primary[50],
  },
  dropdownListItemText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  dropdownListItemTextSelected: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.semibold,
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
    paddingBottom: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingTop: spacing[3],
    paddingBottom: spacing[1],
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
    paddingTop: spacing[2],
    paddingBottom: spacing[2],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  regionItemFirst: {
    paddingTop: spacing[1],
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
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  regionItemTextSelected: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.semibold,
  },
  modalListContent: {
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: 0,
    marginBottom: 0,
  },
});

export default SignUpScreen;
