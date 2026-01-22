/**
 * 미션 정보 모달 컴포넌트
 * 미션 도감에서 미션 정보를 표시하는 모달
 */

import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, Image } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { MissionCategory } from '../../api/missionApi';
import { styles } from './MissionInfoModal.styles';

// 미션 도감용 통합 미션 타입
interface UnifiedMission {
  id: number;
  title: string;
  description: string;
  category?: MissionCategory;
  verificationType: string;
  requiredMinutes?: number;
  expReward: number;
  badgeDurationDays: number;
  participantCount?: number;
  isCustom: boolean;
  creatorId?: number;
  creatorNickname?: string;
  isChallenge?: boolean;
  challengeDays?: number;
  deadlineDays?: number;
  isPublic?: boolean;
  worryType?: string;
  isCompleted?: boolean;
  isAttempted?: boolean;
}

interface MissionInfoModalProps {
  visible: boolean;
  mission: UnifiedMission | null;
  missionGroupTab: 'official' | 'custom';
  currentUserId: number | null;
  onClose: () => void;
  navigation: NavigationProp<any>;
  getVerificationTypeLabel: (type?: string) => string;
}

const MissionInfoModal: React.FC<MissionInfoModalProps> = ({
  visible,
  mission,
  missionGroupTab,
  currentUserId,
  onClose,
  navigation,
  getVerificationTypeLabel,
}) => {
  if (!mission) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>미션 정보</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>미션명</Text>
              <Text style={styles.modalDetailValue}>{mission.title}</Text>
            </View>
            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>설명</Text>
              <Text style={styles.modalDetailValue}>{mission.description}</Text>
            </View>
            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>인증 방식</Text>
              <Text style={styles.modalDetailValue}>
                {getVerificationTypeLabel(mission.verificationType)}
              </Text>
            </View>
            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>보상</Text>
              <Text style={styles.modalDetailValue}>
                {mission.isCustom
                  ? `뱃지 (${mission.badgeDurationDays}일)`
                  : `${mission.expReward} EXP + 뱃지 (${mission.badgeDurationDays}일)`
                }
              </Text>
            </View>
            {mission.requiredMinutes && (
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>필요 시간</Text>
                <Text style={styles.modalDetailValue}>{mission.requiredMinutes}분</Text>
              </View>
            )}

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalDetailButton}
                onPress={() => {
                  onClose();
                  navigation.navigate('MissionDetail', { 
                    missionId: String(mission.id),
                    returnTab: 'missionGroup'
                  });
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalDetailButtonText}>미션 상세 보기</Text>
              </TouchableOpacity>

              {/* 생성자만 수정 버튼 표시 */}
              {mission.isCustom &&
               mission.creatorId === currentUserId && (
                <TouchableOpacity
                  style={styles.modalEditButton}
                  onPress={() => {
                    onClose();
                    navigation.navigate('CustomMissionCreate', {
                      mode: 'edit',
                      missionId: mission.id,
                      missionData: {
                        title: mission.title,
                        description: mission.description,
                        category: mission.category,
                        verificationType: mission.verificationType,
                        isChallenge: mission.isChallenge,
                        challengeDays: mission.challengeDays,
                        deadlineDays: mission.deadlineDays,
                        expReward: mission.expReward,
                        isPublic: mission.isPublic,
                        worryType: mission.worryType,
                      },
                    });
                  }}
                  activeOpacity={0.7}
                >
                  <Image
                    source={require('../../assets/images/edit.png')}
                    style={styles.modalEditIcon}
                    resizeMode="contain"
                    accessibilityLabel="미션 수정 아이콘"
                  />
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default MissionInfoModal;
