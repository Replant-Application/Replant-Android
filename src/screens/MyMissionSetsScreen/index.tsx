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
  Image,
  Platform,
  ImageBackground,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { Header, Loading, EmptyState } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { getMyMissionSets, deleteMissionSet, MissionSetSimple } from '../../api/todolistApi';
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
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Header
          title="내 투두리스트"
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
          rightButton={
            <TouchableOpacity
              onPress={() => navigation.navigate(SCREEN_NAMES.MISSION_SET_CREATE as any)}
              style={styles.createButton}
            >
              <Image
                source={require('../../assets/images/pencil.png')}
                style={styles.createButtonIcon}
                resizeMode="contain"
                accessibilityLabel="새 투두리스트 만들기"
              />
            </TouchableOpacity>
          }
        />

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
          {/* 안내 박스 */}
          <View style={styles.infoBox}>
            <Image
              source={require('../../assets/images/notes.png')}
              style={styles.infoIcon}
              resizeMode="contain"
              accessibilityLabel="안내 아이콘"
            />
            <Text style={styles.infoText}>
              나만의 투두리스트를 만들고 관리해보세요
            </Text>
          </View>

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
                  {/* 카드 헤더 */}
                  <View style={styles.cardHeader}>
                    <View style={styles.titleRow}>
                      <Image
                        source={require('../../assets/images/notes.png')}
                        style={styles.cardIcon}
                        resizeMode="contain"
                        accessibilityLabel="투두리스트 아이콘"
                      />
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
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDelete(missionSet);
                      }}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Image
                        source={require('../../assets/images/trash.png')}
                        style={styles.deleteIcon}
                        resizeMode="contain"
                        accessibilityLabel="삭제 아이콘"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* 설명 */}
                  {missionSet.description && (
                    <Text style={styles.missionSetDescription} numberOfLines={2}>
                      {missionSet.description}
                    </Text>
                  )}

                  {/* 카드 푸터 */}
                  <View style={styles.cardFooter}>
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Image
                          source={require('../../assets/images/goal.png')}
                          style={styles.statIcon}
                          resizeMode="contain"
                          accessibilityLabel="미션 아이콘"
                        />
                        <Text style={styles.statText}>{missionSet.missionCount}개 미션</Text>
                      </View>
                      {missionSet.isPublic && (
                        <View style={styles.statItem}>
                          <Image
                            source={require('../../assets/images/high-five.png')}
                            style={styles.statIcon}
                            resizeMode="contain"
                            accessibilityLabel="참여자 아이콘"
                          />
                          <Text style={styles.statText}>{missionSet.addedCount}명</Text>
                        </View>
                      )}
                    </View>
                    {missionSet.isPublic && (
                      <View style={styles.ratingContainer}>
                        <Text style={styles.stars}>
                          {renderStars(missionSet.averageRating)}
                        </Text>
                        <Text style={styles.ratingText}>
                          {missionSet.averageRating.toFixed(1)}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* 하단 여백 */}
          <View style={{ height: spacing[20] }} />
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
  createButton: {
    padding: spacing[2],
  },
  createButtonIcon: {
    width: 24,
    height: 24,
  },
  content: {
    flex: 1,
    padding: spacing[4],
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.base,
    padding: spacing[3],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.primary[200],
    gap: spacing[3],
  },
  infoIcon: {
    width: 24,
    height: 24,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.primary[700],
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  missionSetList: {
    gap: spacing[2],
  },
  missionSetCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginRight: spacing[2],
  },
  cardIcon: {
    width: 20,
    height: 20,
  },
  missionSetTitle: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
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
    padding: spacing[1],
  },
  deleteIcon: {
    width: 18,
    height: 18,
    tintColor: colors.error,
  },
  missionSetDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[2],
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
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
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  statIcon: {
    width: 16,
    height: 16,
  },
  statText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
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
});

export default MyMissionSetsScreen;
