/**
 * 투두리스트(미션세트) 공유 화면
 * 공개된 미션세트 목록 표시 및 담기 기능
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  Image,
  Platform,
  ImageBackground,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { Header, Loading, EmptyState } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { getMissionSets, searchMissionSets, copyMissionSet, MissionSetSimple } from '../../api/missionSetApi';
import { logError } from '../../utils/logger';
import { SCREEN_NAMES } from '../../utils/constants';

interface MissionSetListScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const MissionSetListScreen: React.FC<MissionSetListScreenProps> = ({ navigation }) => {
  const [missionSets, setMissionSets] = useState<MissionSetSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // 검색어 디바운싱 (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 미션세트 목록 로딩
  const loadMissionSets = useCallback(async () => {
    try {
      let result;
      if (debouncedSearchQuery.trim()) {
        result = await searchMissionSets({
          keyword: debouncedSearchQuery,
          page: 0,
          size: 50,
        });
      } else {
        result = await getMissionSets({ page: 0, size: 50 });
      }

      if (result.success && result.data) {
        setMissionSets(result.data.content);
      }
    } catch (error) {
      logError('미션세트 로딩 실패', error as Error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery]);

  useEffect(() => {
    loadMissionSets();
  }, [loadMissionSets]);

  // Pull-to-Refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMissionSets();
    setRefreshing(false);
  }, [loadMissionSets]);

  // 미션세트 담기
  const handleCopy = async (missionSet: MissionSetSimple) => {
    try {
      const result = await copyMissionSet(missionSet.id);
      if (result.success) {
        Alert.alert(
          '담기 완료',
          `"${missionSet.title}" 미션세트를 내 목록에 추가했습니다.`
        );
        // 담은 수 증가 반영
        setMissionSets(prev =>
          prev.map(ms =>
            ms.id === missionSet.id
              ? { ...ms, addedCount: ms.addedCount + 1 }
              : ms
          )
        );
      } else {
        Alert.alert('담기 실패', result.error || '미션세트를 담는데 실패했습니다.');
      }
    } catch (error) {
      logError('미션세트 담기 실패', error as Error);
      Alert.alert('오류', '미션세트를 담는 중 문제가 발생했습니다.');
    }
  };

  // 별점 렌더링
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const stars = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push('★');
      } else if (i === fullStars && hasHalfStar) {
        stars.push('☆');
      } else {
        stars.push('☆');
      }
    }

    return stars.join('');
  };

  if (loading) {
    return <Loading text="투두리스트를 불러오는 중..." />;
  }

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <Header title="투두 공유" showBackButton={true} navigation={navigation} />

      {/* 검색창 */}
      <View style={styles.searchContainer}>
        <Image
          source={require('../../assets/images/search.png')}
          style={styles.searchIcon}
          resizeMode="contain"
        />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="투두리스트 검색..."
          placeholderTextColor={colors.text.tertiary}
        />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
          />
        }
      >
        {missionSets.length === 0 ? (
          <EmptyState
            iconImage={require('../../assets/images/notes.png')}
            title="공유된 투두리스트가 없어요"
            description="다른 사용자들의 투두리스트를 기다려주세요!"
          />
        ) : (
          <View style={styles.missionSetList}>
            {missionSets.map(missionSet => (
              <TouchableOpacity
                key={missionSet.id}
                style={styles.missionSetCard}
                onPress={() => navigation.navigate(SCREEN_NAMES.MISSION_SET_DETAIL as any, { missionSetId: missionSet.id })}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.missionSetTitle} numberOfLines={1}>
                    {missionSet.title}
                  </Text>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() => handleCopy(missionSet)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.copyButtonText}>담기</Text>
                  </TouchableOpacity>
                </View>

                {missionSet.description && (
                  <Text style={styles.missionSetDescription} numberOfLines={2}>
                    {missionSet.description}
                  </Text>
                )}

                <View style={styles.cardMeta}>
                  <Text style={styles.metaText}>
                    by {missionSet.creatorNickname}
                  </Text>
                  <Text style={styles.metaDot}>·</Text>
                  <Text style={styles.metaText}>
                    {missionSet.missionCount}개 미션
                  </Text>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.stars}>
                      {renderStars(missionSet.averageRating)}
                    </Text>
                    <Text style={styles.ratingText}>
                      {missionSet.averageRating.toFixed(1)}
                    </Text>
                  </View>
                  <Text style={styles.addedCount}>
                    {missionSet.addedCount}명이 담음
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 플로팅 생성 버튼 */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate(SCREEN_NAMES.MISSION_SET_CREATE as any)}
        activeOpacity={0.8}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    marginHorizontal: spacing[4],
    marginVertical: spacing[3],
    borderWidth: 1,
    borderColor: '#D4A574',
  },
  searchIcon: {
    width: 16,
    height: 16,
    marginRight: spacing[2],
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    padding: 0,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  content: {
    flex: 1,
    padding: spacing[4],
  },
  missionSetList: {
    gap: spacing[3],
    paddingBottom: spacing[16],
  },
  missionSetCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  missionSetTitle: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginRight: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  copyButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: borderRadius.base,
  },
  copyButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  missionSetDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[3],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  metaText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  floatingButton: {
    position: 'absolute',
    right: spacing[4],
    bottom: spacing[8],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  floatingButtonText: {
    fontSize: 28,
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
    marginTop: -2,
  },
  metaDot: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginHorizontal: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[2],
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  stars: {
    fontSize: typography.fontSize.sm,
    color: colors.warning,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  ratingText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  addedCount: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
});

export default MissionSetListScreen;
