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
  ImageSourcePropType,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { Mission } from '../../types';
import { getLocationWithPermission, getCurrentTimestamp } from '../../services/gpsService';
import { verifyMissionByGPS, getVerificationRequirements } from '../../api/missionApi';

interface MissionVerificationModalProps {
  visible: boolean;
  mission: Mission | null;
  onClose: () => void;
  onLikeVerification: () => void; // 좋아요 인증 선택 시 (커뮤니티 공유 화면으로 이동)
  onVerificationSuccess?: () => void; // 인증 성공 시 콜백 (미션 목록 새로고침용)
}

const MissionVerificationModal: React.FC<MissionVerificationModalProps> = ({
  visible,
  mission,
  onClose,
  onLikeVerification,
  onVerificationSuccess,
}) => {
  const [gpsLoading, setGpsLoading] = useState(false);

  if (!mission) return null;

  // GPS 인증 처리
  const handleGPSVerification = async () => {
    if (!mission) return;

    try {
      setGpsLoading(true);

      // 인증 요구사항 조회
      const requirementsResult = await getVerificationRequirements(mission.mission_id);
      if (!requirementsResult.success) {
        Alert.alert('오류', '인증 요구사항을 불러올 수 없습니다.');
        return;
      }

      // 위치 가져오기
      const location = await getLocationWithPermission();
      const timestamp = getCurrentTimestamp();

      // GPS 인증 요청
      const result = await verifyMissionByGPS(mission.mission_id, {
        location,
        timestamp,
      });

      if (result.success) {
        Alert.alert(
          '✅ 인증 완료',
          'GPS 인증이 완료되었습니다!',
          [
            {
              text: '확인',
              onPress: () => {
                onClose();
                onVerificationSuccess?.(); // 미션 목록 새로고침
              },
            },
          ]
        );
      } else {
        Alert.alert('인증 실패', result.error || 'GPS 인증에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('GPS 인증 오류:', error);
      
      if (error.code === 'PERMISSION_DENIED') {
        Alert.alert(
          '위치 권한 필요',
          'GPS 인증을 위해 위치 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
          [
            { text: '취소', style: 'cancel' },
            {
              text: '좋아요 인증으로 변경',
              onPress: () => {
                onClose();
                onLikeVerification();
              },
            },
          ]
        );
      } else {
        Alert.alert('오류', error.message || 'GPS 인증 중 오류가 발생했습니다.');
      }
    } finally {
      setGpsLoading(false);
    }
  };

  // 좋아요 인증 선택
  const handleLikeVerification = () => {
    onClose();
    onLikeVerification();
  };

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
            {/* 좋아요 인증 */}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleLikeVerification}
              disabled={gpsLoading}
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
                  커뮤니티에 공유하고 다른 유저들의 좋아요 5개 이상 받기
                </Text>
              </View>
            </TouchableOpacity>

            {/* GPS 인증 */}
            <TouchableOpacity
              style={[styles.optionButton, gpsLoading && styles.optionButtonDisabled]}
              onPress={handleGPSVerification}
              disabled={gpsLoading}
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
                <Text style={styles.optionTitle}>
                  {gpsLoading ? 'GPS 인증 중...' : 'GPS 인증'}
                </Text>
                <Text style={styles.optionDescription}>
                  현재 위치와 시간으로 즉시 인증하기
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={gpsLoading}
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
  optionButtonDisabled: {
    opacity: 0.6,
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

