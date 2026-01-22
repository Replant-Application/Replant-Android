import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ImageBackground } from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { Header } from '../../components/ui';
import { formatDateKorean, normalizeDate } from '../../utils/dateUtils';
import { styles } from './BadgeDetailScreen.styles';

interface BadgeDetailScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'BadgeDetail'>;
}

const BadgeDetailScreen: React.FC<BadgeDetailScreenProps> = ({ navigation, route }) => {
  const { badge } = route.params;

  const missionTitle = badge.mission?.title || badge.customMission?.title || '미션';
  const missionType = badge.missionType === 'CUSTOM' ? '커스텀 미션' : '일반 미션';
  // 만료일 비교 (배열 형식 날짜 처리)
  const expiresAtDate = badge.expiresAt ? new Date(normalizeDate(badge.expiresAt)) : null;
  const isExpired = badge.isExpired || (expiresAtDate && !isNaN(expiresAtDate.getTime()) && expiresAtDate < new Date());

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

export default BadgeDetailScreen;
