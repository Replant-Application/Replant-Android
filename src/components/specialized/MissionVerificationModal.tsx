/**
 * 미션 인증 방법 선택 모달
 * 미션 완료 후 인증 방법을 선택하는 모달
 */

import React, { useState } from 'react';
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

interface MissionVerificationModalProps {
  visible: boolean;
  mission: Mission | null;
  onClose: () => void;
  onLikeVerification: () => void; // 좋아요 인증 선택 시 (커뮤니티 공유 화면으로 이동)
  onGPSVerification?: () => void; // GPS 인증 선택 시
  onTimeVerification?: () => void; // 시간 인증 선택 시
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

  if (!mission) return null;

  // 미션의 인증 타입 확인
  const verificationType = mission.verification_type || 'COMMUNITY';

  // GPS 인증 처리
  const handleGPSVerification = async () => {
    if (onGPSVerification) {
      setGpsLoading(true);
      try {
        onGPSVerification();
      } finally {
        setGpsLoading(false);
      }
    } else {
      Alert.alert('기능 준비중', 'GPS 인증 기능은 준비 중입니다.');
    }
  };

  // 시간 인증 처리
  const handleTimeVerification = () => {
    if (onTimeVerification) {
      onTimeVerification();
    } else {
      Alert.alert('기능 준비중', '시간 인증 기능은 준비 중입니다.');
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
                    커뮤니티에 공유하고 다른 유저들의 좋아요 3개 이상 받기
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* GPS 인증 - GPS 타입만 */}
            {showGPSOption && (
              <TouchableOpacity
                style={styles.optionButton}
                onPress={handleGPSVerification}
                activeOpacity={0.7}
              >
                <View style={styles.optionIconContainer}>
                  {gpsLoading ? (
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
                    현재 위치로 즉시 인증하기
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* 시간 인증 - TIME 타입만 */}
            {showTimeOption && (
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
                    지정된 시간 동안 미션 수행 기록으로 인증하기
                  </Text>
                </View>
              </TouchableOpacity>
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
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    width: '100%',
    maxWidth: 400,
  },
  header: {
    marginBottom: spacing[6],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.base,
  },
  optionsContainer: {
    gap: spacing[4],
    marginBottom: spacing[6],
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[4],
  },
  optionIcon: {
    fontSize: typography.fontSize['2xl'],
  },
  optionIconImage: {
    width: 32,
    height: 32,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  optionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  cancelButton: {
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
});

export default MissionVerificationModal;
