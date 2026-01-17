import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform, ImageBackground } from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { Header } from '../../components/ui';
import { formatDateKorean } from '../../utils/dateUtils';

interface BadgeDetailScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'BadgeDetail'>;
}

const BadgeDetailScreen: React.FC<BadgeDetailScreenProps> = ({ navigation, route }) => {
  const { badge } = route.params;

  const missionTitle = badge.mission?.title || badge.customMission?.title || '미션';
  const missionType = badge.missionType === 'CUSTOM' ? '커스텀 미션' : '일반 미션';
  const isExpired = badge.isExpired || new Date(badge.expiresAt) < new Date();

  // 날짜 포맷팅 (formatDateKorean 사용)

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Header
          title="뱃지 상세"
          leftButton={
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image
                source={require('../../assets/images/left.png')}
                style={styles.backButtonIcon}
                resizeMode="contain"
                accessibilityLabel="뒤로 가기"
              />
            </TouchableOpacity>
          }
        />

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        {/* 뱃지 아이콘 */}
        <View style={styles.badgeIconContainer}>
          <View style={[styles.badgeIcon, isExpired && styles.badgeIconExpired]}>
            <Image
              source={require('../../assets/images/check2.png')}
              style={styles.badgeImage}
              accessibilityLabel="뱃지 아이콘"
              resizeMode="contain"
            />
          </View>
          {isExpired && (
            <View style={styles.expiredBadge}>
              <Text style={styles.expiredBadgeText}>만료됨</Text>
            </View>
          )}
        </View>

        {/* 뱃지 정보 */}
        <View style={styles.infoCard}>
          <Text style={styles.badgeTitle}>{missionTitle}</Text>
          <Text style={styles.missionType}>{missionType}</Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>발급일</Text>
            <Text style={styles.infoValue}>{formatDateKorean(badge.issuedAt)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>만료일</Text>
            <Text style={[styles.infoValue, isExpired && styles.expiredText]}>
              {formatDateKorean(badge.expiresAt)}
            </Text>
          </View>

          {!isExpired && badge.remainingDays !== undefined && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>남은 기간</Text>
              <Text style={styles.remainingDays}>D-{badge.remainingDays}</Text>
            </View>
          )}
        </View>

        {/* 뱃지 혜택 안내 */}
        <View style={styles.benefitCard}>
          <Text style={styles.benefitTitle}>뱃지 혜택</Text>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>해당 미션 후기 작성 가능</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>미션 도감에 완료 표시</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>경험치 보상 획득</Text>
          </View>
        </View>

        {/* 미션 상세 보기 버튼 */}
        {badge.mission && (
          <TouchableOpacity
            style={styles.viewMissionButton}
            onPress={() => navigation.navigate('MissionDetail', { missionId: String(badge.mission?.id) })}
            activeOpacity={0.7}
          >
            <Text style={styles.viewMissionButtonText}>미션 상세 보기</Text>
          </TouchableOpacity>
        )}
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  backButtonIcon: {
    width: 24,
    height: 24,
    tintColor: colors.text.primary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[20],
  },
  badgeIconContainer: {
    alignItems: 'center',
    marginTop: spacing[2],
    marginBottom: spacing[5],
    position: 'relative',
  },
  badgeIcon: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeIconExpired: {
    backgroundColor: colors.gray[200],
  },
  badgeImage: {
    width: 64,
    height: 64,
  },
  expiredBadge: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: colors.gray[500],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  expiredBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  infoCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[5],
    marginBottom: spacing[4],
  },
  badgeTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xl),
  },
  missionType: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[3],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing[4],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  infoLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  expiredText: {
    color: colors.gray[400],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  remainingDays: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[600],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  benefitCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[5],
    marginBottom: spacing[5],
  },
  benefitTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[4],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  benefitIcon: {
    fontSize: typography.fontSize.base,
    color: colors.primary[500],
    marginRight: spacing[3],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  benefitText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  viewMissionButton: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.base,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    alignItems: 'center',
    marginTop: spacing[2],
  },
  viewMissionButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
});

export default BadgeDetailScreen;
