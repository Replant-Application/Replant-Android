import React from 'react';
import { View, Text, TouchableOpacity, Image, ViewStyle } from 'react-native';
import { styles } from './MissionCard.styles';

import { Mission } from '../../types';

interface MissionCardProps {
  mission: Mission;
  onComplete?: (missionId: string) => void;
  onCompleteCustom?: (missionId: string) => void;
  onUncomplete?: (missionId: string) => void;
  onDeletePhoto?: (missionId: string) => void;
  onShareToCommunity?: (missionId: string) => void;
  onWriteReview?: (missionId: string) => void;
  onViewDetails?: (missionId: string) => void;
  onVerify?: (mission: Mission, type: 'COMMUNITY' | 'GPS' | 'TIME') => void;
  loading?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  style?: ViewStyle;
  selectedFilter?: 'inProgress' | 'pendingVerification' | 'completed'; // 현재 선택된 필터
}

const MissionCard: React.FC<MissionCardProps> = ({
  mission,
  onComplete,
  onCompleteCustom,
  onUncomplete: _onUncomplete,
  onDeletePhoto,
  onShareToCommunity: _onShareToCommunity,
  onWriteReview,
  onViewDetails,
  onVerify,
  loading = false,
  disabled = false,
  readonly = false,
  style,
  selectedFilter
}) => {
  if (!mission) return null;

  // 인증 유형 결정 (verification_type 또는 기본값 COMMUNITY)
  const verificationType = mission.verification_type || 'COMMUNITY';

  // 인증 버튼 핸들러 (공식: 인증 플로우, 커스텀: 즉시 완료)
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

  // 미션 카드 클릭 핸들러 - 항상 상세보기로 이동
  const handleCardPress = () => {
    if (onViewDetails) {
      onViewDetails(mission.mission_id);
    }
  };

  // 접근성 라벨 생성
  const getAccessibilityLabel = () => {
    const categoryName = getCategoryName(mission.category_id || '');
    const isCustom = mission.missionType === 'CUSTOM' || mission.is_custom === true;
    const status = mission.completed 
      ? (isCustom || mission.verified === true ? '인증완료' : '인증대기중')
      : '진행중';
    return `${categoryName} 미션, ${mission.title}, ${status}`;
  };

  return (
    <TouchableOpacity 
      style={[styles.container, style]}
      onPress={handleCardPress}
      activeOpacity={0.7}
      disabled={readonly && !onViewDetails}
      accessibilityRole="button"
      accessibilityLabel={getAccessibilityLabel()}
      accessibilityState={{ disabled: readonly && !onViewDetails }}
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
                accessibilityLabel={`${getCategoryName(mission.category_id || '')} 카테고리 아이콘`}
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
              {/* 완료 탭에서는 인증완료 배지 표시하지 않음 */}
              {selectedFilter === 'completed' ? null : (
                <>
                  {/* 커스텀 미션은 인증이 필요 없으므로 완료되면 바로 인증완료 표시 */}
                  {mission.missionType === 'CUSTOM' || mission.is_custom === true ? (
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedIcon}>✓</Text>
                      <Text style={styles.verifiedText}>인증완료</Text>
                    </View>
                  ) : mission.verified === true ? (
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

        {(mission.images && mission.images.length > 0) || mission.photo_url ? (
          <View style={styles.photoContainer}>
            {/* images 배열이 있으면 images 사용, 없으면 photo_url 사용 (하위 호환성) */}
            {mission.images && mission.images.length > 0 ? (
              <View style={styles.imagesGrid}>
                {mission.images.slice(0, 4).map((imageUrl, index) => (
                  <View key={index} style={styles.imageItem}>
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.gridImage}
                      resizeMode="cover"
                      accessibilityLabel={`${mission.title} 인증 사진 ${index + 1}`}
                    />
                    {index === 3 && mission.images && mission.images.length > 4 && (
                      <View style={styles.moreImagesOverlay}>
                        <Text style={styles.moreImagesText}>+{mission.images.length - 4}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ) : mission.photo_url ? (
              <Image
                source={{ uri: mission.photo_url }}
                style={styles.photo}
                resizeMode="cover"
                accessibilityLabel={`${mission.title} 인증 사진`}
              />
            ) : null}
            {onDeletePhoto && !readonly && (
              <TouchableOpacity
                style={styles.deletePhotoButton}
                onPress={() => onDeletePhoto(mission.mission_id)}
                disabled={disabled}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="사진 삭제"
                accessibilityState={{ disabled }}
              >
                <Text style={styles.deletePhotoIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <View style={styles.experienceInfo}>
          {!(mission.missionType === 'CUSTOM' || mission.is_custom === true) && (
            <View style={styles.experienceContainer}>
              <Image
                source={require('../../assets/images/sun.png')}
                style={styles.sunIcon}
                resizeMode="contain"
                accessibilityLabel="경험치 아이콘"
              />
              <Text style={styles.experienceText}>
                {mission.experience || 50} EXP
              </Text>
            </View>
          )}
        </View>

        {readonly ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => onViewDetails?.(mission.mission_id)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="자세히 보기"
          >
            <Text style={[styles.actionText, styles.viewText]}>
              자세히 보기
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actionButtonsContainer}>
            {/* 후기 쓰기 버튼: 완료 후 표시 (커스텀 미션 제외) */}
            {mission.completed && 
             onWriteReview && 
             !(mission.missionType === 'CUSTOM' || mission.is_custom === true) && (
              <TouchableOpacity
                style={[styles.reviewButton]}
                onPress={() => onWriteReview(mission.mission_id)}
                disabled={disabled}
                activeOpacity={disabled ? 1 : 0.7}
                accessibilityRole="button"
                accessibilityLabel="후기 쓰기"
                accessibilityState={{ disabled }}
              >
                <Image
                  source={require('../../assets/images/pencil.png')}
                  style={styles.reviewIcon}
                  resizeMode="contain"
                  accessibilityLabel="후기 쓰기 아이콘"
                  accessibilityElementsHidden={true}
                />
                <Text style={styles.reviewButtonText}>후기 쓰기</Text>
              </TouchableOpacity>
            )}
            {/* 인증 버튼: 공식=인증 플로우, 커스텀=탭 시 즉시 완료 (스타일·문구 통일) */}
            {!mission.completed &&
              ((mission.missionType === 'CUSTOM' || mission.is_custom === true)
                ? onCompleteCustom
                : true) && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.verifyButton,
                  (loading || disabled) && styles.disabledButton,
                ]}
                onPress={
                  (loading || disabled)
                    ? undefined
                    : (mission.missionType === 'CUSTOM' || mission.is_custom === true)
                      ? () => onCompleteCustom?.(mission.mission_id)
                      : handleVerifyPress
                }
                disabled={loading || disabled}
                activeOpacity={loading || disabled ? 1 : 0.7}
                accessibilityRole="button"
                accessibilityLabel={loading ? '처리중' : disabled ? '비활성화' : '인증'}
                accessibilityState={{ disabled: loading || disabled }}
              >
                <Text
                  style={[
                    styles.actionText,
                    styles.completeText,
                    styles.verifyText,
                    (loading || disabled) && styles.disabledText,
                  ]}
                >
                  {loading ? '처리중...' : disabled ? '비활성화' : '인증'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default MissionCard;
