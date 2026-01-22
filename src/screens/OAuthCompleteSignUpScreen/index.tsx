/**
 * OAuth 회원가입 완료 화면
 * OAuth로 처음 로그인한 사용자의 추가 정보 입력
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Button, Input, Header } from '../../components/ui';
import { useOAuthCompleteSignUpScreenContainer } from './OAuthCompleteSignUpScreen.container';
import { styles } from './OAuthCompleteSignUpScreen.styles';

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

export default OAuthCompleteSignUpScreen;
