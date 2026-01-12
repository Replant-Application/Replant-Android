/**
 * OAuth 회원가입 완료 화면
 * OAuth로 처음 로그인한 사용자의 추가 정보 입력
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Button, Input, Header } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { SCREEN_NAMES } from '../../utils/constants';
import { RegionInfo } from '../../api/authApi';
import { apiClient } from '../../api/client';
import { useUser } from '../../contexts/UserContext';

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
  const { login, refreshUser } = useUser();
  const [nickname, setNickname] = useState(route?.params?.nickname || '');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 성별, 지역, 출생연도 상태
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | null>(null);
  const [region, setRegion] = useState<string | null>(null);
  const [regionName, setRegionName] = useState<string>('');
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [birthYear, setBirthYear] = useState<number | null>(null);
  const [showBirthYearModal, setShowBirthYearModal] = useState(false);

  // 지역 목록 (백엔드 MetropolitanArea enum과 동일)
  const regions: RegionInfo[] = [
    { code: 'SEOUL', name: '서울특별시' },
    { code: 'BUSAN', name: '부산광역시' },
    { code: 'DAEGU', name: '대구광역시' },
    { code: 'INCHEON', name: '인천광역시' },
    { code: 'GWANGJU', name: '광주광역시' },
    { code: 'DAEJEON', name: '대전광역시' },
    { code: 'ULSAN', name: '울산광역시' },
    { code: 'SEJONG', name: '세종특별자치시' },
    { code: 'GYEONGGI', name: '경기도' },
    { code: 'GANGWON', name: '강원특별자치도' },
    { code: 'CHUNGBUK', name: '충청북도' },
    { code: 'CHUNGNAM', name: '충청남도' },
    { code: 'JEONBUK', name: '전북특별자치도' },
    { code: 'JEONNAM', name: '전라남도' },
    { code: 'GYEONGBUK', name: '경상북도' },
    { code: 'GYEONGNAM', name: '경상남도' },
    { code: 'JEJU', name: '제주특별자치도' },
  ];

  // 출생연도 목록 생성 (1950년 ~ 현재년도 - 14세)
  const currentYear = new Date().getFullYear();
  const birthYears = Array.from(
    { length: currentYear - 14 - 1950 + 1 },
    (_, i) => currentYear - 14 - i
  );

  const [errors, setErrors] = useState({
    nickname: '',
    phone: '',
    gender: '',
    region: '',
    birthYear: '',
  });

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^01[016789][0-9]{7,8}$/;
    return phoneRegex.test(phone.replace(/-/g, ''));
  };

  const handleComplete = async () => {
    // 에러 초기화
    setErrors({
      nickname: '',
      phone: '',
      gender: '',
      region: '',
      birthYear: '',
    });

    let hasError = false;
    const newErrors = {
      nickname: '',
      phone: '',
      gender: '',
      region: '',
      birthYear: '',
    };

    // 유효성 검사
    if (!nickname.trim()) {
      newErrors.nickname = '닉네임을 입력해주세요.';
      hasError = true;
    } else if (nickname.length < 2 || nickname.length > 20) {
      newErrors.nickname = '닉네임은 2~20자 사이로 입력해주세요.';
      hasError = true;
    }

    if (!phone.trim()) {
      newErrors.phone = '전화번호를 입력해주세요.';
      hasError = true;
    } else if (!validatePhone(phone)) {
      newErrors.phone = '올바른 전화번호 형식으로 입력해주세요. (예: 01012345678)';
      hasError = true;
    }

    if (!gender) {
      newErrors.gender = '성별을 선택해주세요.';
      hasError = true;
    }

    if (!region) {
      newErrors.region = '지역을 선택해주세요.';
      hasError = true;
    }

    if (!birthYear) {
      newErrors.birthYear = '출생연도를 선택해주세요.';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // 사용자 정보 업데이트 API 호출 (PUT /api/users/me)
      const result = await apiClient.put('/users/me', {
        nickname: nickname,
        phone: phone.replace(/-/g, ''),
        gender: gender,
        region: region,
        birthYear: birthYear,
      });

      if (result.success) {
        // 로그인 처리 및 사용자 정보 새로고침
        await login(nickname);
        await refreshUser();

        Alert.alert('환영합니다!', '회원정보 입력이 완료되었습니다.\n홈 화면으로 이동합니다.', [
          {
            text: '확인',
            onPress: () => onNavigate(SCREEN_NAMES.HOME as string),
          },
        ]);
      } else {
        Alert.alert('오류', result.error || '정보 저장에 실패했습니다.\n잠시 후 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('오류', '정보 저장 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    // 건너뛰기 - 기본 정보로 바로 홈으로 이동
    await login(nickname || route?.params?.email || '사용자');
    await refreshUser();
    onNavigate(SCREEN_NAMES.HOME as string);
  };

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
              onChangeText={(text) => {
                setNickname(text);
                if (errors.nickname) {
                  setErrors({ ...errors, nickname: '' });
                }
              }}
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
              onChangeText={(text) => {
                setPhone(text);
                if (errors.phone) {
                  setErrors({ ...errors, phone: '' });
                }
              }}
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
                onPress={() => {
                  setGender('MALE');
                  if (errors.gender) {
                    setErrors({ ...errors, gender: '' });
                  }
                }}
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
                onPress={() => {
                  setGender('FEMALE');
                  if (errors.gender) {
                    setErrors({ ...errors, gender: '' });
                  }
                }}
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
              onPress={() => {
                setShowBirthYearModal(false);
                setShowRegionModal(!showRegionModal);
              }}
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
                      onPress={() => {
                        setRegion(item.code);
                        setRegionName(item.name);
                        setShowRegionModal(false);
                        if (errors.region) {
                          setErrors({ ...errors, region: '' });
                        }
                      }}
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
              onPress={() => {
                setShowRegionModal(false);
                setShowBirthYearModal(!showBirthYearModal);
              }}
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
                      onPress={() => {
                        setBirthYear(item);
                        setShowBirthYearModal(false);
                        if (errors.birthYear) {
                          setErrors({ ...errors, birthYear: '' });
                        }
                      }}
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
