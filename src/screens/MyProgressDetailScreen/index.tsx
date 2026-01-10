/**
 * 나의 진행률 상세 화면
 * 유효한 뱃지 목록 + 완료된 미션 리스트 (페이지네이션)
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Platform,
  ImageBackground,
  Dimensions,
  FlatList,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { Header, Loading } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { useMission } from '../../hooks/useMission';
import { getMyBadges, Badge } from '../../api/badgeApi';
import { logError } from '../../utils/logger';
import { Mission } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEMS_PER_PAGE = 5;

interface MyProgressDetailScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const MyProgressDetailScreen: React.FC<MyProgressDetailScreenProps> = ({ navigation }) => {
  const { missions, loading: missionsLoading } = useMission();
  const [refreshing, setRefreshing] = useState(false);
  const [validBadges, setValidBadges] = useState<Badge[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(true);
  const [currentMissionPage, setCurrentMissionPage] = useState(0);
  const missionFlatListRef = useRef<FlatList>(null);

  // 완료된 미션 필터링
  const completedMissions = useMemo(() => {
    return missions.filter(m => m.completed || m.status === 'COMPLETED');
  }, [missions]);

  // 페이지 수 계산
  const totalMissionPages = Math.ceil(completedMissions.length / ITEMS_PER_PAGE);

  // 페이지별 미션 데이터 생성
  const missionPages = useMemo(() => {
    const pages: Mission[][] = [];
    for (let i = 0; i < completedMissions.length; i += ITEMS_PER_PAGE) {
      pages.push(completedMissions.slice(i, i + ITEMS_PER_PAGE));
    }
    return pages.length > 0 ? pages : [[]];
  }, [completedMissions]);

  // 뱃지 로딩
  const loadBadges = useCallback(async () => {
    try {
      setBadgesLoading(true);
      const result = await getMyBadges();

      if (result.success && result.data) {
        setValidBadges(result.data.badges || []);
      }
    } catch (error) {
      logError('뱃지 로딩 실패', error as Error);
    } finally {
      setBadgesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBadges();
  }, [loadBadges]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBadges();
    setRefreshing(false);
  }, [loadBadges]);

  // 뱃지 클릭 핸들러
  const handleBadgePress = (badge: Badge) => {
    navigation.navigate('BadgeDetail', { badge });
  };

  // 미션 클릭 핸들러
  const handleMissionPress = (mission: Mission) => {
    navigation.navigate('MissionDetail' as any, { missionId: mission.mission_id || String(mission.id) });
  };

  // 미션 페이지 변경 핸들러
  const onMissionPageChange = (event: any) => {
    const pageIndex = Math.round(event.nativeEvent.contentOffset.x / (SCREEN_WIDTH - spacing[8]));
    setCurrentMissionPage(pageIndex);
  };

  // 페이지 이동
  const goToMissionPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < totalMissionPages) {
      missionFlatListRef.current?.scrollToIndex({ index: pageIndex, animated: true });
      setCurrentMissionPage(pageIndex);
    }
  };

  // 미션 페이지 렌더링
  const renderMissionPage = ({ item: pageMissions, index }: { item: Mission[]; index: number }) => (
    <View style={styles.pageContainer}>
      {pageMissions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image
            source={require('../../assets/images/goal.png')}
            style={styles.emptyIcon}
            resizeMode="contain"
          />
          <Text style={styles.emptyText}>완료한 미션이 없습니다</Text>
          <Text style={styles.emptySubtext}>미션을 완료하면 여기에 표시됩니다!</Text>
        </View>
      ) : (
        <View style={styles.missionList}>
          {pageMissions.map((mission, idx) => (
            <TouchableOpacity
              key={`${mission.mission_id || mission.id}-${idx}`}
              style={styles.missionItem}
              onPress={() => handleMissionPress(mission)}
              activeOpacity={0.7}
            >
              <View style={styles.missionIconContainer}>
                <Text style={styles.missionEmoji}>{mission.emoji || '🎯'}</Text>
              </View>
              <View style={styles.missionInfo}>
                <Text style={styles.missionTitle} numberOfLines={1}>
                  {mission.title}
                </Text>
                {mission.description && (
                  <Text style={styles.missionDescription} numberOfLines={1}>
                    {mission.description}
                  </Text>
                )}
              </View>
              <View style={styles.completedBadge}>
                <Image
                  source={require('../../assets/images/check2.png')}
                  style={styles.checkIcon}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Header
          title="뱃지 & 완료 미션"
          leftButton={
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image
                source={require('../../assets/images/left.png')}
                style={styles.backButtonIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          }
        />

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary[500]]}
              tintColor={colors.primary[500]}
            />
          }
        >
          {/* 유효한 뱃지 섹션 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>유효한 뱃지</Text>
              <Text style={styles.sectionCount}>{validBadges.length}개</Text>
            </View>

            {badgesLoading ? (
              <Loading text="뱃지를 불러오는 중..." />
            ) : validBadges.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Image
                  source={require('../../assets/images/check2.png')}
                  style={styles.emptyIcon}
                  resizeMode="contain"
                />
                <Text style={styles.emptyText}>유효한 뱃지가 없습니다</Text>
                <Text style={styles.emptySubtext}>미션을 완료하고 뱃지를 획득해보세요!</Text>
              </View>
            ) : (
              <View style={styles.badgeGrid}>
                {validBadges.map((badge) => {
                  const missionTitle = badge.mission?.title || badge.customMission?.title || '미션';

                  return (
                    <TouchableOpacity
                      key={badge.id}
                      style={styles.badgeItem}
                      onPress={() => handleBadgePress(badge)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.badgeIcon}>
                        <Image
                          source={require('../../assets/images/check2.png')}
                          style={styles.badgeIconImage}
                          resizeMode="contain"
                        />
                      </View>
                      <Text style={styles.badgeTitle} numberOfLines={2}>
                        {missionTitle}
                      </Text>
                      {badge.remainingDays !== undefined && (
                        <Text style={styles.badgeRemaining}>D-{badge.remainingDays}</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* 완료된 미션 섹션 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>완료한 미션</Text>
              <Text style={styles.sectionCount}>{completedMissions.length}개</Text>
            </View>

            {missionsLoading ? (
              <Loading text="미션을 불러오는 중..." />
            ) : (
              <>
                <FlatList
                  ref={missionFlatListRef}
                  data={missionPages}
                  renderItem={renderMissionPage}
                  keyExtractor={(_, index) => `mission-page-${index}`}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={onMissionPageChange}
                  getItemLayout={(_, index) => ({
                    length: SCREEN_WIDTH - spacing[8],
                    offset: (SCREEN_WIDTH - spacing[8]) * index,
                    index,
                  })}
                  scrollEnabled={totalMissionPages > 1}
                />

                {/* 페이지 인디케이터 및 네비게이션 */}
                {totalMissionPages > 1 && (
                  <View style={styles.paginationContainer}>
                    <TouchableOpacity
                      style={[styles.pageArrow, currentMissionPage === 0 && styles.pageArrowDisabled]}
                      onPress={() => goToMissionPage(currentMissionPage - 1)}
                      disabled={currentMissionPage === 0}
                    >
                      <Text style={[styles.pageArrowText, currentMissionPage === 0 && styles.pageArrowTextDisabled]}>‹</Text>
                    </TouchableOpacity>

                    <View style={styles.pageIndicators}>
                      {missionPages.map((_, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.pageIndicator,
                            currentMissionPage === index && styles.pageIndicatorActive,
                          ]}
                          onPress={() => goToMissionPage(index)}
                        />
                      ))}
                    </View>

                    <TouchableOpacity
                      style={[styles.pageArrow, currentMissionPage === totalMissionPages - 1 && styles.pageArrowDisabled]}
                      onPress={() => goToMissionPage(currentMissionPage + 1)}
                      disabled={currentMissionPage === totalMissionPages - 1}
                    >
                      <Text style={[styles.pageArrowText, currentMissionPage === totalMissionPages - 1 && styles.pageArrowTextDisabled]}>›</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* 페이지 정보 */}
                {totalMissionPages > 1 && (
                  <Text style={styles.pageInfo}>
                    {currentMissionPage + 1} / {totalMissionPages} 페이지
                  </Text>
                )}
              </>
            )}
          </View>
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
    padding: spacing[4],
    paddingBottom: spacing[20],
  },
  section: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 4,
    borderColor: '#0E0F37',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  sectionCount: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing[6],
  },
  emptyIcon: {
    width: 48,
    height: 48,
    marginBottom: spacing[3],
    opacity: 0.5,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  badgeItem: {
    alignItems: 'center',
    width: '30%',
    padding: spacing[3],
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
  },
  badgeIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  badgeIconImage: {
    width: 32,
    height: 32,
  },
  badgeTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  badgeRemaining: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[600],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  pageContainer: {
    width: SCREEN_WIDTH - spacing[8],
  },
  missionList: {
    gap: spacing[2],
  },
  missionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.base,
    padding: spacing[3],
  },
  missionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  missionEmoji: {
    fontSize: 22,
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  missionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.green[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing[2],
  },
  checkIcon: {
    width: 16,
    height: 16,
    tintColor: colors.green[600],
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing[4],
    gap: spacing[3],
  },
  pageArrow: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageArrowDisabled: {
    backgroundColor: colors.gray[100],
  },
  pageArrowText: {
    fontSize: typography.fontSize['2xl'],
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  pageArrowTextDisabled: {
    color: colors.gray[400],
  },
  pageIndicators: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  pageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[300],
  },
  pageIndicatorActive: {
    backgroundColor: colors.primary[500],
    width: 20,
  },
  pageInfo: {
    textAlign: 'center',
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
});

export default MyProgressDetailScreen;
