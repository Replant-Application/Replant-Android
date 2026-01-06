import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ViewStyle, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';

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
        return '인증';
      case 'TIME':
        return '인증';
      case 'COMMUNITY':
      default:
        return '인증';
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

  // 미션 카드 클릭 핸들러
  const handleCardPress = () => {
    if (!readonly && !disabled && !mission.completed && onVerify) {
      onVerify(mission, verificationType);
    } else if (onViewDetails) {
      onViewDetails(mission.mission_id);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, style]}
      onPress={handleCardPress}
      activeOpacity={0.7}
      disabled={readonly && !onViewDetails}
    >
      <View style={styles.header}>
        <View style={styles.categoryInfo}>
          <View style={styles.categoryNameContainer}>
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
            <Text style={styles.categoryName} numberOfLines={1}>
              {getCategoryName(mission.category_id || '')}
            </Text>
          </View>
        </View>
        <View style={styles.statusContainer}>
          {mission.completed ? (
            <>
              {/* 인증 완료된 경우 */}
              {mission.verified === true ? (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedIcon}>✓</Text>
                  <Text style={styles.verifiedText}>인증완료</Text>
                </View>
              ) : (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingIcon}>⏳</Text>
                  <Text style={styles.pendingVerificationText}>인증대기중</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.inProgressBadge}>
              <Text style={styles.inProgressIcon}>▶</Text>
              <Text style={styles.pendingText}>진행중</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{mission.title}</Text>
        {mission.description && (
          <Text style={styles.description} numberOfLines={2}>{mission.description}</Text>
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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[4],
    marginVertical: spacing[1],
    borderWidth: 1,
    borderColor: colors.border.light,
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

  categoryNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    gap: spacing[1],
    flexShrink: 0,
    flexWrap: 'nowrap',
  },
  categoryEmoji: {
    fontSize: typography.fontSize.sm,
    flexShrink: 0,
  },
  categoryImage: {
    width: 16,
    height: 16,
    flexShrink: 0,
  },
  categoryName: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.secondary,
    flexShrink: 0,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
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

  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 28,
    minWidth: 28,
  },

  pendingText: {
    fontSize: typography.fontSize.xs,
    color: colors.warning,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  pendingVerificationText: {
    fontSize: typography.fontSize.xs,
    color: colors.warning,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },

  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.green[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    gap: spacing[1],
  },
  verifiedIcon: {
    fontSize: typography.fontSize.xs,
    color: colors.green[500],
    fontWeight: typography.fontWeight.bold,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  verifiedText: {
    fontSize: typography.fontSize.xs,
    color: colors.green[500],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.orange[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    gap: spacing[1],
  },
  pendingIcon: {
    fontSize: typography.fontSize.xs,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  inProgressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    gap: spacing[1],
  },
  inProgressIcon: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },

  content: {
    marginBottom: spacing[3],
  },

  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    marginBottom: spacing[2],
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },

  description: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },

  photoContainer: {
    position: 'relative',
    width: '100%',
    marginTop: spacing[2],
  },
  photo: {
    width: '100%',
    height: 80,
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
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[2],
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
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },

  actionButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.xl,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary[500],
  },

  completeButton: {
    // 기본 actionButton 스타일 사용
  },

  gpsButton: {
    // 기본 actionButton 스타일 사용
  },

  timeButton: {
    // 기본 actionButton 스타일 사용
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
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },

  completeText: {
    color: colors.primary[500],
  },

  uncompleteText: {
    color: colors.text.secondary,
  },

  viewText: {
    color: colors.primary[500],
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
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1.5],
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary[100],
    borderWidth: 1,
    borderColor: colors.primary[300],
    minHeight: 32,
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
    color: colors.primary[500],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  disabledButton: {
    backgroundColor: colors.gray[200],
    opacity: 0.6,
  },

  disabledText: {
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
});

export default MissionCard;
