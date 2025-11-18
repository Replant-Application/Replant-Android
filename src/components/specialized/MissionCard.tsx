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
  loading?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  style?: ViewStyle;
}

const MissionCard: React.FC<MissionCardProps> = ({
  mission,
  onComplete,
  onUncomplete,
  onUploadPhoto,
  onDeletePhoto,
  onShareToCommunity,
  onViewDetails,
  loading = false,
  disabled = false,
  readonly = false,
  style
}) => {
  if (!mission) return null;

  const getCategoryEmoji = (categoryId: string): string => {
    const emojiMap: Record<string, string> = {
      growth: '🌱',
      custom: '✨',
    };
    return emojiMap[categoryId] || '🌱';
  };

  const getCategoryName = (categoryId: string): string => {
    const nameMap: Record<string, string> = {
      growth: '성장',
      custom: '나만의 미션',
    };
    return nameMap[categoryId] || '성장';
  };

  const handleToggleComplete = (): void => {
    if (mission.completed) {
      onUncomplete?.(mission.mission_id);
    } else {
      onComplete?.(mission.mission_id);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryEmoji}>
            {getCategoryEmoji(mission.category_id || '')}
          </Text>
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
                <Text style={styles.pendingVerificationText}>⏳ 인증 대기</Text>
              )}
            </>
          ) : (
            <Text style={styles.pendingText}>⏳ 진행중</Text>
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
            {!mission.completed && onUploadPhoto && (
              <TouchableOpacity
                style={[styles.photoIconButton]}
                onPress={() => onUploadPhoto(mission.mission_id)}
                disabled={disabled}
                activeOpacity={disabled ? 1 : 0.7}
              >
                <Text style={styles.photoIcon}>➕</Text>
              </TouchableOpacity>
            )}
            {mission.completed && onShareToCommunity && (
              <TouchableOpacity
                style={[styles.shareButton]}
                onPress={() => onShareToCommunity(mission.mission_id)}
                disabled={disabled}
                activeOpacity={disabled ? 1 : 0.7}
              >
                <Text style={styles.shareButtonText}>💬 공유</Text>
              </TouchableOpacity>
            )}
          <TouchableOpacity
            style={[
              styles.actionButton,
              mission.completed ? styles.uncompleteButton : styles.completeButton,
              disabled && styles.disabledButton
            ]}
            onPress={disabled ? undefined : handleToggleComplete}
            disabled={loading || disabled}
            activeOpacity={disabled ? 1 : 0.7}
          >
            <Text style={[
              styles.actionText,
              mission.completed ? styles.uncompleteText : styles.completeText,
              disabled && styles.disabledText
            ]}>
              {disabled ? '비활성화' : loading ? '처리중...' : mission.completed ? '완료 취소' : '완료하기'}
            </Text>
          </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginVertical: spacing[2],
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.base,
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
    borderRadius: borderRadius.base,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  completeButton: {
    backgroundColor: colors.primary[500],
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
    fontSize: typography.fontSize.xl,
  },
  shareButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary[100],
    borderWidth: 1,
    borderColor: colors.primary[300],
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
