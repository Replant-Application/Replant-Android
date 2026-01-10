/**
 * 내 미션세트 관리 화면
 * 내가 만든/담은 미션세트 목록 관리
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
  ImageBackground,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { Header, Loading, EmptyState } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { getMyMissionSets, deleteMissionSet, MissionSetSimple } from '../../api/missionSetApi';
import { logError } from '../../utils/logger';
import { SCREEN_NAMES } from '../../utils/constants';

interface MyMissionSetsScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const MyMissionSetsScreen: React.FC<MyMissionSetsScreenProps> = ({ navigation }) => {
  const [missionSets, setMissionSets] = useState<MissionSetSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 내 미션세트 목록 로딩
  const loadMyMissionSets = useCallback(async () => {
    try {
      const result = await getMyMissionSets({ page: 0, size: 100 });
      if (result.success && result.data) {
        setMissionSets(result.data.content);
      }
    } catch (error) {
      logError('내 미션세트 로딩 실패', error as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMyMissionSets();
  }, [loadMyMissionSets]);

  // Pull-to-Refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMyMissionSets();
    setRefreshing(false);
  }, [loadMyMissionSets]);

  // 미션세트 삭제
  const handleDelete = (missionSet: MissionSetSimple) => {
    Alert.alert(
      '삭제 확인',
      `"${missionSet.title}" 투두리스트를 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteMissionSet(missionSet.id);
              if (result.success) {
                setMissionSets(prev => prev.filter(ms => ms.id !== missionSet.id));
                Alert.alert('완료', '투두리스트가 삭제되었습니다.');
              } else {
                Alert.alert('오류', result.error || '삭제에 실패했습니다.');
              }
            } catch (error) {
              logError('미션세트 삭제 실패', error as Error);
              Alert.alert('오류', '삭제 중 문제가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  // 미션세트 상세 보기
  const handleDetail = (missionSet: MissionSetSimple) => {
    navigation.navigate(SCREEN_NAMES.MISSION_SET_DETAIL as any, {
      missionSetId: missionSet.id,
    });
  };

  // 별점 렌더링
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const stars = [];

    for (let i = 0; i < 5; i++) {
      stars.push(i < fullStars ? '★' : '☆');
    }

    return stars.join('');
  };

  if (loading) {
    return <Loading text="내 투두리스트를 불러오는 중..." />;
  }

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <Header title="내 투두리스트" showBackButton={true} navigation={navigation} />

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
            title="아직 투두리스트가 없어요"
            description="새로운 투두리스트를 만들어보세요!"
          />
        ) : (
          <View style={styles.missionSetList}>
            {missionSets.map(missionSet => (
              <TouchableOpacity
                key={missionSet.id}
                style={styles.missionSetCard}
                onPress={() => handleDetail(missionSet)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.titleRow}>
                    <Text style={styles.missionSetTitle} numberOfLines={1}>
                      {missionSet.title}
                    </Text>
                    {missionSet.isPublic ? (
                      <View style={styles.publicBadge}>
                        <Text style={styles.publicBadgeText}>공개</Text>
                      </View>
                    ) : (
                      <View style={styles.privateBadge}>
                        <Text style={styles.privateBadgeText}>비공개</Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(missionSet)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.deleteButtonText}>삭제</Text>
                  </TouchableOpacity>
                </View>

                {missionSet.description && (
                  <Text style={styles.missionSetDescription} numberOfLines={2}>
                    {missionSet.description}
                  </Text>
                )}

                <View style={styles.cardMeta}>
                  <Text style={styles.metaText}>
                    {missionSet.missionCount}개 미션
                  </Text>
                  {missionSet.isPublic && (
                    <>
                      <Text style={styles.metaDot}>·</Text>
                      <Text style={styles.metaText}>
                        {missionSet.addedCount}명이 담음
                      </Text>
                    </>
                  )}
                </View>

                {missionSet.isPublic && (
                  <View style={styles.cardFooter}>
                    <View style={styles.ratingContainer}>
                      <Text style={styles.stars}>
                        {renderStars(missionSet.averageRating)}
                      </Text>
                      <Text style={styles.ratingText}>
                        {missionSet.averageRating.toFixed(1)}
                      </Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 여백 */}
        <View style={{ height: 100 }} />
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
  content: {
    flex: 1,
    padding: spacing[4],
  },
  missionSetList: {
    gap: spacing[3],
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
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginRight: spacing[2],
  },
  missionSetTitle: {
    flex: 1,
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
  publicBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[0.5],
    borderRadius: borderRadius.base,
  },
  publicBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  privateBadge: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[0.5],
    borderRadius: borderRadius.base,
  },
  privateBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[600],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  deleteButton: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  deleteButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
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
  metaDot: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginHorizontal: spacing[1],
  },
  cardFooter: {
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
  },
  ratingText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
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
});

export default MyMissionSetsScreen;
