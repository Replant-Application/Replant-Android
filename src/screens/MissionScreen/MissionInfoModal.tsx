/**
 * 미션 정보 모달 컴포넌트
 * 미션 도감에서 미션 정보를 표시하는 모달
 */

import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { MissionCategory } from '../../api/missionApi';

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

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({ 
      ios: typography.fontFamily.regular, 
      android: typography.fontFamily.regular 
    }),
    includeFontPadding: false,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 20,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  modalContent: {
    maxHeight: 400,
  },
  modalDetailRow: {
    marginBottom: spacing[4],
  },
  modalDetailLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing[1],
    fontFamily: Platform.select({ 
      ios: typography.fontFamily.regular, 
      android: typography.fontFamily.regular 
    }),
    includeFontPadding: false,
  },
  modalDetailValue: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
    fontFamily: Platform.select({ 
      ios: typography.fontFamily.regular, 
      android: typography.fontFamily.regular 
    }),
    includeFontPadding: false,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[4],
    alignItems: 'center',
  },
  modalDetailButton: {
    flex: 1,
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    alignItems: 'center',
  },
  modalDetailButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
    fontFamily: Platform.select({ 
      ios: typography.fontFamily.regular, 
      android: typography.fontFamily.regular 
    }),
    includeFontPadding: false,
  },
  modalEditButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalEditIcon: {
    width: 20,
    height: 20,
    tintColor: colors.primary[600],
  },
});

export default MissionInfoModal;
