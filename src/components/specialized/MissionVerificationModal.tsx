/**
 * 미션 인증 방법 선택 모달
 * 미션 완료 후 인증 방법을 선택하는 모달
 * - 좋아요 인증: 커뮤니티 공유 후 좋아요 받기
 * - GPS 인증: 현재 위치와 목표 위치 비교
 * - 시간 인증: 현재 시간과 설정된 시간 비교
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { Mission } from '../../types';
import { useLocation } from '../../hooks/useLocation';

interface MissionVerificationModalProps {
  visible: boolean;
  mission: Mission | null;
  onClose: () => void;
  onLikeVerification: () => void; // 좋아요 인증 선택 시 (커뮤니티 공유 화면으로 이동)
  onGPSVerification?: () => void; // GPS 인증 성공 시
  onTimeVerification?: () => void; // 시간 인증 성공 시
  onVerificationSuccess?: () => void; // 인증 성공 시 콜백 (미션 목록 새로고침용)
}

const MissionVerificationModal: React.FC<MissionVerificationModalProps> = ({
  visible,
  mission,
  onClose,
  onLikeVerification,
  onGPSVerification,
  onTimeVerification,
  onVerificationSuccess: _onVerificationSuccess,
}) => {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [timeCheckResult, setTimeCheckResult] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);
  const [gpsCheckResult, setGpsCheckResult] = useState<{
    isValid: boolean;
    distance: number | null;
    message: string;
  } | null>(null);

  const { verifyGPSLocation, locationState } = useLocation();

  // 미션 변경 시 결과 초기화
  useEffect(() => {
    if (visible && mission) {
      setTimeCheckResult(null);
      setGpsCheckResult(null);
    }
  }, [visible, mission]);

  if (!mission) return null;

  // 미션의 인증 타입 확인
  const verificationType = mission.verification_type || 'COMMUNITY';

  // 시간 인증 정보 가져오기
  const getTimeRequirement = () => {
    const requirements = mission.verification_requirements;
    if (requirements?.required_time) {
      return requirements.required_time;
    }
    // 기본값: 07:00 ~ 09:00 (아침 시간)
    return { start: '07:00', end: '09:00' };
  };

  // GPS 인증 정보 가져오기
  const getGPSRequirement = () => {
    const requirements = mission.verification_requirements;
    if (requirements?.required_location) {
      return requirements.required_location;
    }
    // 기본값: 서울 시청 반경 100m
    return { lat: 37.5665, lng: 126.9780, radius: 100 };
  };

  // 현재 시간이 설정된 시간 범위 내인지 확인
  const checkTimeVerification = (): { isValid: boolean; message: string } => {
    const timeReq = getTimeRequirement();
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const isWithinRange = currentTime >= timeReq.start && currentTime <= timeReq.end;

    return {
      isValid: isWithinRange,
      message: isWithinRange
        ? `현재 시간 ${currentTime}은 인증 시간 내입니다.`
        : `현재 시간 ${currentTime}은 인증 시간(${timeReq.start}~${timeReq.end}) 밖입니다.`,
    };
  };

  // 시간 인증 처리
  const handleTimeVerification = () => {
    const result = checkTimeVerification();
    setTimeCheckResult(result);

    if (result.isValid) {
      Alert.alert(
        '✅ 시간 인증 성공',
        result.message,
        [
          {
            text: '확인',
            onPress: () => {
              onTimeVerification?.();
              onClose();
            },
          },
        ]
      );
    } else {
      Alert.alert('❌ 시간 인증 실패', result.message);
    }
  };

  // GPS 인증 처리
  const handleGPSVerification = async () => {
    setGpsLoading(true);
    setGpsCheckResult(null);

    try {
      const gpsReq = getGPSRequirement();
      const result = await verifyGPSLocation(gpsReq.lat, gpsReq.lng, gpsReq.radius);

      setGpsCheckResult({
        isValid: result.withinRadius,
        distance: result.distance,
        message: result.message,
      });

      if (result.withinRadius) {
        Alert.alert(
          '✅ GPS 인증 성공',
          result.message,
          [
            {
              text: '확인',
              onPress: () => {
                onGPSVerification?.();
                onClose();
              },
            },
          ]
        );
      } else {
        Alert.alert('❌ GPS 인증 실패', result.message);
      }
    } catch (error) {
      Alert.alert('오류', 'GPS 인증 중 오류가 발생했습니다.');
    } finally {
      setGpsLoading(false);
    }
  };

  // 좋아요 인증 선택
  const handleLikeVerification = () => {
    onLikeVerification();
    onClose();
  };

  // 인증 타입에 따른 버튼 표시 여부
  const showLikeOption = verificationType === 'COMMUNITY';
  const showGPSOption = verificationType === 'GPS';
  const showTimeOption = verificationType === 'TIME';

  // 시간 요구사항 텍스트
  const timeReq = getTimeRequirement();
  const gpsReq = getGPSRequirement();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>인증 방법 선택</Text>
            <Text style={styles.subtitle}>
              {mission.title} 미션을 인증할 방법을 선택해주세요
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            {/* 좋아요 인증 - COMMUNITY 타입만 */}
            {showLikeOption && (
              <TouchableOpacity
                style={styles.optionButton}
                onPress={handleLikeVerification}
                activeOpacity={0.7}
              >
                <View style={styles.optionIconContainer}>
                  <Image
                    source={require('../../assets/images/like.png')}
                    style={styles.optionIconImage}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>좋아요 인증</Text>
                  <Text style={styles.optionDescription}>
                    커뮤니티에 공유하고 다른 유저들의 좋아요 1개 이상 받기
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* GPS 인증 - GPS 타입만 */}
            {showGPSOption && (
              <View>
                <View style={styles.requirementInfo}>
                  <Text style={styles.requirementLabel}>📍 목표 위치</Text>
                  <Text style={styles.requirementValue}>
                    위도: {gpsReq.lat.toFixed(4)}, 경도: {gpsReq.lng.toFixed(4)}
                  </Text>
                  <Text style={styles.requirementValue}>
                    반경: {gpsReq.radius}m 이내
                  </Text>
                </View>

                {gpsCheckResult && (
                  <View style={[
                    styles.resultBox,
                    gpsCheckResult.isValid ? styles.resultSuccess : styles.resultFail
                  ]}>
                    <Text style={styles.resultText}>{gpsCheckResult.message}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.optionButton, gpsLoading && styles.optionButtonDisabled]}
                  onPress={handleGPSVerification}
                  activeOpacity={0.7}
                  disabled={gpsLoading}
                >
                  <View style={styles.optionIconContainer}>
                    {gpsLoading || locationState.loading ? (
                      <ActivityIndicator size="small" color={colors.primary[500]} />
                    ) : (
                      <Image
                        source={require('../../assets/images/location.png')}
                        style={styles.optionIconImage}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>GPS 인증</Text>
                    <Text style={styles.optionDescription}>
                      {gpsLoading ? '위치 확인 중...' : '현재 위치와 목표 위치 비교하기'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* 시간 인증 - TIME 타입만 */}
            {showTimeOption && (
              <View>
                <View style={styles.requirementInfo}>
                  <Text style={styles.requirementLabel}>⏰ 인증 가능 시간</Text>
                  <Text style={styles.requirementValue}>
                    {timeReq.start} ~ {timeReq.end}
                  </Text>
                  <Text style={styles.currentTime}>
                    현재 시간: {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>

                {timeCheckResult && (
                  <View style={[
                    styles.resultBox,
                    timeCheckResult.isValid ? styles.resultSuccess : styles.resultFail
                  ]}>
                    <Text style={styles.resultText}>{timeCheckResult.message}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={handleTimeVerification}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionIconContainer}>
                    <Image
                      source={require('../../assets/images/alarm.png')}
                      style={styles.optionIconImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>시간 인증</Text>
                    <Text style={styles.optionDescription}>
                      현재 시간이 인증 시간 내인지 확인하기
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>나중에</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[5],
  },
  modalContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[5],
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    marginBottom: spacing[4],
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  optionsContainer: {
    gap: spacing[4],
    marginBottom: spacing[6],
  },
  requirementInfo: {
    backgroundColor: colors.gray[50],
    padding: spacing[3],
    borderRadius: borderRadius.base,
    marginBottom: spacing[3],
  },
  requirementLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  requirementValue: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  currentTime: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.normal,
    marginTop: spacing[1],
  },
  resultBox: {
    padding: spacing[2],
    borderRadius: borderRadius.base,
    marginBottom: spacing[3],
  },
  resultSuccess: {
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  resultFail: {
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  resultText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.primary,
    textAlign: 'center',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderRadius: borderRadius.base,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  optionButtonDisabled: {
    opacity: 0.6,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.base,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  optionIcon: {
    fontSize: typography.fontSize.xl,
  },
  optionIconImage: {
    width: 24,
    height: 24,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  optionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  cancelButton: {
    paddingVertical: spacing[2],
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.normal,
  },
});

export default MissionVerificationModal;
