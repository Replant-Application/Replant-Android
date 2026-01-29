/**
 * 미션 인증 방법 선택 모달
 * 모든 미션은 커뮤니티 인증(인증글 작성)으로 통일
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
} from 'react-native';
import { styles } from './MissionVerificationModal.styles';
import { Mission } from '../../types';

interface MissionVerificationModalProps {
  visible: boolean;
  mission: Mission | null;
  onClose: () => void;
  onLikeVerification: () => void; // 커뮤니티 인증 선택 시 (인증글 작성 화면으로 이동)
  onGPSVerification?: () => void; // 사용 안 함 (하위 호환)
  onTimeVerification?: () => void; // 사용 안 함 (하위 호환)
  onVerificationSuccess?: () => void;
}

const MissionVerificationModal: React.FC<MissionVerificationModalProps> = ({
  visible,
  mission,
  onClose,
  onLikeVerification,
}) => {
  const handleLikeVerification = () => {
    onLikeVerification();
    onClose();
  };

  if (!mission) return null;

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
            <Text style={styles.title} accessibilityRole="header">인증 방법</Text>
            <Text style={styles.subtitle}>
              {mission.title} 미션을 인증할 방법을 선택해주세요
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleLikeVerification}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="커뮤니티 인증"
            >
              <View style={styles.optionIconContainer}>
                <Image
                  source={require('../../assets/images/like.png')}
                  style={styles.optionIconImage}
                  resizeMode="contain"
                  accessibilityLabel="커뮤니티 인증 아이콘"
                />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>커뮤니티 인증</Text>
                <Text style={styles.optionDescription}>
                  인증글을 작성해 미션을 완료합니다
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="나중에"
          >
            <Text style={styles.cancelButtonText}>나중에</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default MissionVerificationModal;
