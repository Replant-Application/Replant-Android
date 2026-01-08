import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Button, Header } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { SCREEN_NAMES } from '../../utils/constants';

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

  // 이메일 마스킹 처리 (이미 마스킹되어 올 수도 있지만, 안전을 위해)
  const maskEmail = (email: string): string => {
    if (!email) return '아이디를 찾을 수 없습니다.';
    const [localPart, domain] = email.split('@');
    if (!domain) return email;
    
    if (localPart.length <= 2) {
      return `${localPart[0]}***@${domain}`;
    }
    return `${localPart.substring(0, 2)}***@${domain}`;
  };

  const maskedEmail = maskEmail(email);

  // email이 없으면 아이디 찾기 화면으로 돌아가기
  useEffect(() => {
    if (!email) {
      onNavigate(SCREEN_NAMES.FIND_ID as string);
    }
  }, [email, onNavigate]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header
        title="아이디 찾기"
        leftButton={
          <TouchableOpacity
            onPress={() => onNavigate(SCREEN_NAMES.FIND_ID as string)}
            style={styles.backButton}
          >
            <Image
              source={require('../../assets/images/left.png')}
              style={styles.backButtonIcon}
              resizeMode="contain"
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
          onPress={() => onNavigate(SCREEN_NAMES.LOGIN as string)}
          size="lg"
          style={styles.button}
          textStyle={styles.buttonText}
        />
        <TouchableOpacity
          onPress={() => onNavigate(SCREEN_NAMES.FIND_PASSWORD as string)}
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>비밀번호 찾기</Text>
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
  resultContainer: {
    marginTop: spacing[4],
  },
  resultLabel: {
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
  resultBox: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.base,
    padding: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  resultEmail: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
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
});

export default FindIdResultScreen;
