/**
 * OAuth 회원가입 완료 화면
 * OAuth로 처음 로그인한 사용자의 추가 정보 입력
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Button, Input, Header } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { useOAuthCompleteSignUpScreenContainer } from './OAuthCompleteSignUpScreen.container';

interface OAuthCompleteSignUpScreenProps {
  onNavigate: (screen: string) => void;
  route?: {
    params?: {
      email?: string;
      nickname?: string;
      provider?: string;
    };
  };
}

const OAuthCompleteSignUpScreen: React.FC<OAuthCompleteSignUpScreenProps> = ({
  onNavigate,
  route,
}) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    nickname,
    phone,
    gender,
    region,
    regionName,
    birthYear,
    isLoading,
    errors,
    showRegionModal,
    showBirthYearModal,
    regions,
    birthYears,
    handleNicknameChange,
    handlePhoneChange,
    handleGenderSelect,
    handleRegionSelect,
    handleBirthYearSelect,
    handleToggleRegionModal,
    handleToggleBirthYearModal,
    handleComplete,
    handleSkip,
  } = useOAuthCompleteSignUpScreenContainer({ onNavigate, route });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header
        title="추가 정보 입력"
        leftButton={
          <TouchableOpacity
            onPress={handleSkip}
            style={styles.skipButton}
            accessibilityRole="button"
            accessibilityLabel="건너뛰기"
          >
            <Text style={styles.skipButtonText}>건너뛰기</Text>
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
            <Text style={styles.infoText} numberOfLines={2}>
              {route?.params?.provider === 'GOOGLE' ? '구글' : '소셜'} 계정으로 가입되었습니다.{'\n'}
              추가 정보를 입력해주세요.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>닉네임</Text>
            <Input
              placeholder="2~20자 사이의 닉네임을 입력해주세요"
              value={nickname}
              onChangeText={handleNicknameChange}
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
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              maxLength={11}
              returnKeyType="done"
              blurOnSubmit={true}
              inputStyle={styles.inputText}
            />
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>성별</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'MALE' && styles.genderButtonSelected,
                ]}
                onPress={() => handleGenderSelect('MALE')}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === 'MALE' && styles.genderButtonTextSelected,
                  ]}
                >
                  남성
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'FEMALE' && styles.genderButtonSelected,
                ]}
                onPress={() => handleGenderSelect('FEMALE')}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === 'FEMALE' && styles.genderButtonTextSelected,
                  ]}
                >
                  여성
                </Text>
              </TouchableOpacity>
            </View>
            {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>지역</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={handleToggleRegionModal}
            >
              <Text
                style={[styles.dropdownButtonText, !regionName && styles.dropdownPlaceholder]}
              >
                {regionName || '지역을 선택해주세요'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
            {showRegionModal && (
              <View style={styles.dropdownList}>
                <ScrollView
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                  style={styles.dropdownScrollView}
                >
                  {regions.map((item, index) => (
                    <TouchableOpacity
                      key={item.code}
                      style={[
                        styles.dropdownListItem,
                        index === 0 && styles.dropdownListItemFirst,
                        region === item.code && styles.dropdownListItemSelected,
                      ]}
                      onPress={() => handleRegionSelect(item.code, item.name)}
                    >
                      <Text
                        style={[
                          styles.dropdownListItemText,
                          region === item.code && styles.dropdownListItemTextSelected,
                        ]}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            {errors.region ? <Text style={styles.errorText}>{errors.region}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>출생연도</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={handleToggleBirthYearModal}
            >
              <Text
                style={[styles.dropdownButtonText, !birthYear && styles.dropdownPlaceholder]}
              >
                {birthYear ? `${birthYear}년` : '출생연도를 선택해주세요'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
            {showBirthYearModal && (
              <View style={styles.dropdownList}>
                <ScrollView
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                  style={styles.dropdownScrollView}
                >
                  {birthYears.map((item, index) => (
                    <TouchableOpacity
                      key={item.toString()}
                      style={[
                        styles.dropdownListItem,
                        index === 0 && styles.dropdownListItemFirst,
                        birthYear === item && styles.dropdownListItemSelected,
                      ]}
                      onPress={() => handleBirthYearSelect(item)}
                    >
                      <Text
                        style={[
                          styles.dropdownListItemText,
                          birthYear === item && styles.dropdownListItemTextSelected,
                        ]}
                      >
                        {item}년
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            {errors.birthYear ? <Text style={styles.errorText}>{errors.birthYear}</Text> : null}
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title={isLoading ? '처리 중...' : '가입 완료'}
          onPress={handleComplete}
          disabled={isLoading}
          loading={isLoading}
          size="lg"
          style={styles.button}
          textStyle={styles.buttonText}
        />
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
    letterSpacing: -0.5,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm) * 1.3,
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
  skipButton: {
    padding: spacing[2],
  },
  skipButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
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
});

export default OAuthCompleteSignUpScreen;
