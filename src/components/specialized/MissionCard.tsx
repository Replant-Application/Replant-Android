import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ViewStyle } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';

import { Mission } from '../../types';
import Badge from './Badge';

interface MissionCardProps {
  mission: Mission;
  onComplete?: (missionId: string) => void;
  onUncomplete?: (missionId: string) => void;
  onUploadPhoto?: (missionId: string) => void;
  onDeletePhoto?: (missionId: string) => void;
  onShareToCommunity?: (missionId: string) => void;
  onViewDetails?: (missionId: string) => void;
  onVerify?: (mission: Mission, type: 'COMMUNITY' | 'GPS' | 'TIME') => void;
  loading?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  style?: ViewStyle;
}

const MissionCard: React.FC<MissionCardProps> = ({
  mission,
  onComplete,
  onUncomplete: _onUncomplete,
  onUploadPhoto,
  onDeletePhoto,
  onShareToCommunity,
  onViewDetails,
  onVerify,
  loading = false,
  disabled = false,
  readonly = false,
  style
}) => {
  if (!mission) return null;

  // 인증 유형 결정 (verification_type 또는 기본값 COMMUNITY)
  const verificationType = mission.verification_type || 'COMMUNITY';

  // 인증하기 버튼 라벨
  const getVerifyButtonLabel = (): string => {
    switch (verificationType) {
      case 'GPS':
        return '위치 인증';
      case 'TIME':
        return '시간 인증';
      case 'COMMUNITY':
      default:
        return '인증하기';
    }
  };

  // 인증하기 버튼 핸들러
  const handleVerifyPress = () => {
    if (onVerify) {
      onVerify(mission, verificationType);
    } else if (onComplete) {
      onComplete(mission.mission_id);
    }
  };

  const getCategoryImage = (categoryId: string): any => {
    const imageMap: Record<string, any> = {
      growth: require('../../assets/images/clover.png'),
      custom: '✨',
    };
    return imageMap[categoryId] || require('../../assets/images/clover.png');
  };

  const getCategoryName = (categoryId: string): string => {
    const nameMap: Record<string, string> = {
      growth: '성장',
      custom: '나만의 미션',
    };
    return nameMap[categoryId] || '성장';
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.categoryInfo}>
          {typeof getCategoryImage(mission.category_id || '') === 'string' ? (
            <Text style={styles.categoryEmoji}>
              {getCategoryImage(mission.category_id || '')}
            </Text>
          ) : (
            <Image
              source={getCategoryImage(mission.category_id || '')}
              style={styles.categoryImage}
              resizeMode="contain"
            />
          )}
          <Text style={styles.categoryName}>
            {getCategoryName(mission.category_id || '')}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          {mission.completed ? (
            <>
              {/* 인증 완료된 경우에만 인증 뱃지(badge_verified.png) 표시 */}
              {mission.verified === true ? (
                <Badge tier="bronze" size="sm" />
              ) : (
                <View style={styles.statusWrapper}>
                  <Image
                    source={require('../../assets/images/alarm.png')}
                    style={styles.statusIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.pendingVerificationText}>인증 대기</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.statusWrapper}>
              <Image
                source={require('../../assets/images/alarm.png')}
                style={styles.statusIcon}
                resizeMode="contain"
              />
              <Text style={styles.pendingText}>진행중</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{mission.title}</Text>
        {mission.description && (
          <Text style={styles.description}>{mission.description}</Text>
        )}

        {mission.photo_url && (
          <View style={styles.photoContainer}>
            <Image
              source={{ uri: mission.photo_url }}
              style={styles.photo}
              resizeMode="cover"
            />
            {onDeletePhoto && !readonly && (
              <TouchableOpacity
                style={styles.deletePhotoButton}
                onPress={() => onDeletePhoto(mission.mission_id)}
                disabled={disabled}
                activeOpacity={0.7}
              >
                <Text style={styles.deletePhotoIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.experienceInfo}>
          <Text style={styles.experienceText}>
            +{mission.experience || 50} EXP
          </Text>
        </View>

        {readonly ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => onViewDetails?.(mission.mission_id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionText, styles.viewText]}>
              자세히 보기
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actionButtonsContainer}>
            {/* 사진 추가 버튼: COMMUNITY 인증이고 미완료 상태일 때만 */}
            {!mission.completed && verificationType === 'COMMUNITY' && onUploadPhoto && (
              <TouchableOpacity
                style={[styles.photoIconButton]}
                onPress={() => onUploadPhoto(mission.mission_id)}
                disabled={disabled}
                activeOpacity={disabled ? 1 : 0.7}
              >
                <Image
                  source={require('../../assets/images/plus.png')}
                  style={styles.photoIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
            {/* 공유 버튼: 완료 후 COMMUNITY 인증일 때 */}
            {mission.completed && verificationType === 'COMMUNITY' && onShareToCommunity && (
              <TouchableOpacity
                style={[styles.shareButton]}
                onPress={() => onShareToCommunity(mission.mission_id)}
                disabled={disabled}
                activeOpacity={disabled ? 1 : 0.7}
              >
                <Image
                  source={require('../../assets/images/chat.png')}
                  style={styles.shareIcon}
                  resizeMode="contain"
                />
                <Text style={styles.shareButtonText}>공유</Text>
              </TouchableOpacity>
            )}
            {/* 인증 버튼: 미완료 상태일 때 */}
            {!mission.completed && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  verificationType === 'GPS' ? styles.gpsButton :
                  verificationType === 'TIME' ? styles.timeButton :
                  styles.completeButton,
                  disabled && styles.disabledButton
                ]}
                onPress={disabled ? undefined : handleVerifyPress}
                disabled={loading || disabled}
                activeOpacity={disabled ? 1 : 0.7}
              >
                <Text style={[
                  styles.actionText,
                  styles.completeText,
                  disabled && styles.disabledText
                ]}>
                  {disabled ? '비활성화' : loading ? '처리중...' : getVerifyButtonLabel()}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    marginVertical: spacing[2],
    borderWidth: 0,
    ...shadows.lg,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },

  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  categoryEmoji: {
    fontSize: typography.fontSize.xl,
    marginRight: spacing[2],
  },
  categoryImage: {
    width: 24,
    height: 24,
    marginRight: spacing[2],
  },
  statusWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  statusIcon: {
    width: 16,
    height: 16,
  },

  categoryName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },

  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
    minWidth: 36,
  },

  pendingText: {
    fontSize: typography.fontSize.xs,
    color: colors.warning,
    fontWeight: typography.fontWeight.medium,
  },
  pendingVerificationText: {
    fontSize: typography.fontSize.xs,
    color: colors.warning,
    fontWeight: typography.fontWeight.medium,
  },

  content: {
    marginBottom: spacing[3],
  },

  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },

  description: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.base,
  },

  photoContainer: {
    position: 'relative',
    width: '100%',
    marginTop: spacing[2],
  },
  photo: {
    width: '100%',
    height: 120,
    borderRadius: borderRadius.base,
  },
  deletePhotoButton: {
    position: 'absolute',
    top: spacing[1],
    right: spacing[1],
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deletePhotoIcon: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[1],
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: spacing[2],
    alignItems: 'center',
  },

  experienceInfo: {
    flex: 1,
  },

  experienceText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
  },

  actionButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.xl,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  completeButton: {
    backgroundColor: colors.primary[500],
  },

  gpsButton: {
    backgroundColor: colors.blue[500],
  },

  timeButton: {
    backgroundColor: colors.orange[500],
  },

  uncompleteButton: {
    backgroundColor: colors.gray[300],
  },

  viewButton: {
    backgroundColor: colors.primary[100],
    borderWidth: 1,
    borderColor: colors.primary[300],
  },

  actionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  completeText: {
    color: colors.text.inverse,
  },

  uncompleteText: {
    color: colors.text.secondary,
  },

  viewText: {
    color: colors.primary[600],
  },
  photoIconButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoIcon: {
    width: 20,
    height: 20,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary[100],
    borderWidth: 1,
    borderColor: colors.primary[300],
    minHeight: 40,
    justifyContent: 'center',
    gap: spacing[1],
  },
  shareIcon: {
    width: 16,
    height: 16,
  },
  shareButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[700],
  },
  disabledButton: {
    backgroundColor: colors.gray[200],
    opacity: 0.6,
  },

  disabledText: {
    color: colors.text.tertiary,
  },
});

export default MissionCard;
