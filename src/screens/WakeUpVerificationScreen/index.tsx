/**
 * 기상 미션 인증 화면
 * 10분 이내에 인증 버튼을 눌러야 함
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { Header, AlertModal } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { useWakeUpVerificationScreenContainer } from './WakeUpVerificationScreen.container';

interface WakeUpVerificationScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'WakeUpVerification'>;
}

const WakeUpVerificationScreen: React.FC<WakeUpVerificationScreenProps> = ({ navigation, route }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    userMission,
    loading,
    verifying,
    timeRemaining,
    isExpired,
    showSuccessModal,
    showErrorModal,
    errorMessage,
    handleVerify,
    handleSuccessModalClose,
    handleErrorModalClose,
    formatTime,
  } = useWakeUpVerificationScreenContainer({ navigation, route });

  const mission = userMission?.mission || userMission?.customMission;

  if (loading) {
    return (
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <Header title="기상 미션 인증" navigation={navigation} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
            <Text style={styles.loadingText}>미션 정보를 불러오는 중...</Text>
          </View>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Header title="기상 미션 인증" navigation={navigation} />

        <View style={styles.content}>
          {/* 미션 정보 카드 */}
          <View style={styles.missionCard}>
            <View style={styles.missionHeader}>
              <Text style={styles.emoji}>🌅</Text>
              <View style={styles.missionInfo}>
                <Text style={styles.missionTitle}>
                  {mission?.title || '기상 미션'}
                </Text>
                <Text style={styles.missionDescription}>
                  {mission?.description || '기상 미션을 완료하세요!'}
                </Text>
              </View>
            </View>
          </View>

          {/* 타이머 카드 */}
          <View style={styles.timerCard}>
            <Text style={styles.timerLabel}>남은 시간</Text>
            <View style={styles.timerDisplay}>
              {/* 디지털 타이머 스타일 */}
              <View style={styles.timerContainer}>
                <View style={[
                  styles.timerScreen,
                  isExpired && styles.timerScreenExpired,
                  timeRemaining !== null && timeRemaining <= 10 && !isExpired && styles.timerScreenWarning,
                ]}>
                  <View style={styles.timerDigits}>
                    {timeRemaining !== null && !isExpired ? (
                      <>
                        <View style={styles.digitGroup}>
                          <Text style={[
                            styles.digit,
                            timeRemaining <= 10 && styles.digitWarning,
                          ]}>
                            {Math.floor(timeRemaining / 60).toString().padStart(2, '0')}
                          </Text>
                          <Text style={styles.colon}>:</Text>
                          <Text style={[
                            styles.digit,
                            timeRemaining <= 10 && styles.digitWarning,
                          ]}>
                            {(timeRemaining % 60).toString().padStart(2, '0')}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <Text style={styles.expiredText}>시간 초과</Text>
                    )}
                  </View>
                </View>
              </View>
              {!isExpired && timeRemaining !== null && timeRemaining > 0 && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { width: `${(timeRemaining / 600) * 100}%` },
                        timeRemaining <= 10 && styles.progressFillWarning,
                      ]} 
                    />
                  </View>
                </View>
              )}
            </View>
            {isExpired && (
              <Text style={styles.expiredMessage}>
                10분이 지나 인증할 수 없습니다.
              </Text>
            )}
            {timeRemaining !== null && timeRemaining <= 10 && !isExpired && (
              <Text style={styles.warningMessage}>
                ⏰ 시간이 얼마 남지 않았습니다!
              </Text>
            )}
          </View>

          {/* 인증 버튼 */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (isExpired || verifying || (timeRemaining !== null && timeRemaining <= 0)) && styles.verifyButtonDisabled,
            ]}
            onPress={handleVerify}
            disabled={isExpired || verifying || (timeRemaining !== null && timeRemaining <= 0)}
            activeOpacity={0.7}
          >
            {verifying ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.verifyButtonText}>
                {isExpired ? '시간 초과' : '인증하기'}
              </Text>
            )}
          </TouchableOpacity>

          {/* 안내 메시지 */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              • 10분 이내에 인증 버튼을 눌러주세요{'\n'}
              • 인증글 작성 없이 버튼만 누르면 경험치를 받을 수 있습니다
            </Text>
          </View>
        </View>
      </View>

      {/* 성공 모달 */}
      <AlertModal
        visible={showSuccessModal}
        title="인증 완료! 🌅"
        message="기상 미션 인증이 완료되었습니다!"
        buttonText="확인"
        onClose={handleSuccessModalClose}
      />

      {/* 에러 모달 */}
      <AlertModal
        visible={showErrorModal}
        title="오류"
        message={errorMessage || '미션 정보를 불러올 수 없습니다.'}
        buttonText="확인"
        onClose={handleErrorModalClose}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing[4],
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  content: {
    flex: 1,
    padding: spacing[4],
    justifyContent: 'center',
  },
  missionCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginRight: spacing[4],
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.primary,
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  missionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm) * 1.4,
  },
  timerCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[5],
    marginBottom: spacing[4],
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.primary,
    marginBottom: spacing[4],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  timerDisplay: {
    width: '100%',
    alignItems: 'center',
  },
  timerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  timerScreen: {
    backgroundColor: '#1a1a1a',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[6],
    paddingHorizontal: spacing[6],
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.green[500],
    borderStyle: 'solid',
  },
  timerScreenWarning: {
    borderColor: colors.error[500],
    backgroundColor: '#2a1a1a',
  },
  timerScreenExpired: {
    borderColor: colors.error[500],
    backgroundColor: '#2a1a1a',
  },
  timerDigits: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: {
    fontSize: 48,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.green[500],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: 56,
    letterSpacing: 4,
    textShadowColor: colors.green[500],
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  digitWarning: {
    color: colors.error[500],
    textShadowColor: colors.error[500],
    textShadowRadius: 15,
  },
  colon: {
    fontSize: 48,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.green[500],
    marginHorizontal: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: 56,
  },
  expiredText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.error[500],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xl),
  },
  progressContainer: {
    width: '100%',
    marginTop: spacing[2],
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.green[500],
    borderRadius: borderRadius.full,
  },
  progressFillWarning: {
    backgroundColor: colors.warning,
  },
  expiredMessage: {
    marginTop: spacing[3],
    fontSize: typography.fontSize.sm,
    color: colors.error[500],
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  warningMessage: {
    marginTop: spacing[3],
    fontSize: typography.fontSize.sm,
    color: colors.warning,
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  verifyButton: {
    backgroundColor: colors.green[500],
    borderRadius: borderRadius.base,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
    minHeight: 40,
  },
  verifyButtonDisabled: {
    backgroundColor: colors.gray[400],
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.white,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  infoContainer: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.base,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm) * 1.5,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    textAlign: 'center',
  },
});

export default WakeUpVerificationScreen;
