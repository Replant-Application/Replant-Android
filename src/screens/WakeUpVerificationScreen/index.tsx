/**
 * 기상 미션 인증 화면
 * 1일 이내에 인증 버튼을 눌러야 함
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  Image,
} from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { Header, AlertModal } from '../../components/ui';
import { colors } from '../../utils/designTokens';
import { useWakeUpVerificationScreenContainer } from './WakeUpVerificationScreen.container';
import { styles } from './WakeUpVerificationScreen.styles';

interface WakeUpVerificationScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'WakeUpVerification'>;
}

const WakeUpVerificationScreen: React.FC<WakeUpVerificationScreenProps> = ({ navigation, route }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
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
  } = useWakeUpVerificationScreenContainer({ navigation, route });

  if (loading) {
    return (
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
        accessibilityElementsHidden={true}
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
      accessibilityElementsHidden={true}
    >
      <View style={styles.container}>
        <Header title="기상 미션 인증" navigation={navigation} />

        <View style={styles.content}>
          {/* 미션 정보 카드 */}
          <View style={styles.missionCard}>
            <View style={styles.missionHeader}>
              <Image
                source={require('../../assets/images/daily_mission.png')}
                style={styles.missionIcon}
                resizeMode="contain"
                accessibilityLabel="기상 미션 아이콘"
              />
              <View style={styles.missionInfo}>
                <Text style={styles.missionTitle}>
                  기상 미션
                </Text>
                <Text style={styles.missionDescription}>
                  기상 미션을 완료하세요!
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
                            {Math.floor(timeRemaining / 3600).toString().padStart(2, '0')}
                          </Text>
                          <Text style={styles.colon}>:</Text>
                          <Text style={[
                            styles.digit,
                            timeRemaining <= 10 && styles.digitWarning,
                          ]}>
                            {Math.floor((timeRemaining % 3600) / 60).toString().padStart(2, '0')}
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
                      <View style={styles.expiredContainer}>
                        <Image
                          source={require('../../assets/images/bomb.png')}
                          style={styles.bombIcon}
                          resizeMode="contain"
                          accessibilityLabel="시간 초과"
                        />
                        <Text style={styles.expiredText}>시간 초과</Text>
                      </View>
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
                        { width: `${(timeRemaining / (12 * 3600)) * 100}%` },
                        timeRemaining <= 10 && styles.progressFillWarning,
                      ]} 
                    />
                  </View>
                </View>
              )}
            </View>
            {isExpired && (
              <Text style={styles.expiredMessage}>
                12시간이 지나 인증할 수 없습니다.
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
            accessibilityRole="button"
            accessibilityLabel={isExpired ? '시간 초과' : '인증하기'}
            accessibilityState={{ disabled: isExpired || verifying || (timeRemaining !== null && timeRemaining <= 0) }}
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
              • 알림 후 12시간 이내에 인증 버튼을 눌러주세요
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


export default WakeUpVerificationScreen;
