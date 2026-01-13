import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { Header, AlertModal } from '../../components/ui';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { SCREEN_NAMES } from '../../utils/constants';
import { getTodoListDetail, completeTodoMission, archiveTodoList, canCreateNewTodoList } from '../../api/todolistApi';
import { TodoList, TodoMission } from '../../types/todolist';
import { getVerifications } from '../../api/missionApi';

interface Props {
  navigation: any;
  route: {
    params: {
      todoListId: number;
    };
  };
}

const TodoListDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { todoListId } = route.params;
  const [todoList, setTodoList] = useState<TodoList | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completingMissionId, setCompletingMissionId] = useState<number | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [canCreate, setCanCreate] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [hasShownCompleteModal, setHasShownCompleteModal] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [detailResult, canCreateResult] = await Promise.all([
        getTodoListDetail(todoListId),
        canCreateNewTodoList(),
      ]);

      if (detailResult.success && detailResult.data) {
        const todoList = detailResult.data;
        setTodoList(todoList);

        // 모든 미션이 완료되었는지 확인
        const allMissionsCompleted = todoList.missions 
          ? todoList.missions.every(mission => mission.isCompleted)
          : (todoList.completedCount > 0 && todoList.completedCount === todoList.totalCount);

        // 투두리스트가 오늘 생성되었는지 확인
        const isTodayCreated = (() => {
          if (!todoList.createdAt) return false;
          const createdDate = new Date(todoList.createdAt);
          const today = new Date();
          return (
            createdDate.getFullYear() === today.getFullYear() &&
            createdDate.getMonth() === today.getMonth() &&
            createdDate.getDate() === today.getDate()
          );
        })();

        // 모든 미션이 완료되었고 오늘 생성된 투두리스트인 경우 모달 표시
        if (allMissionsCompleted && isTodayCreated && !hasShownCompleteModal) {
          setShowCompleteModal(true);
          setHasShownCompleteModal(true);
        }

        // 필수 미션 중 인증 완료되었지만 아직 투두리스트에서 완료되지 않은 미션 확인
        // 백엔드에서 인증 완료 시 자동으로 투두리스트 미션도 완료 처리하므로,
        // 투두리스트를 다시 조회하여 최신 상태 반영
        if (todoList.missions) {
          const incompleteRequiredMissions = todoList.missions.filter(
            (mission) =>
              (mission.missionType === 'OFFICIAL' || mission.missionSource === 'RANDOM_OFFICIAL') &&
              !mission.isCompleted
          );

          let hasVerifiedMission = false;
          for (const mission of incompleteRequiredMissions) {
            try {
              // 해당 미션의 인증 완료 상태 확인
              const verificationResult = await getVerifications({
                missionId: mission.missionId,
                status: 'APPROVED',
                page: 0,
                size: 1,
              });

              if (
                verificationResult.success &&
                verificationResult.data &&
                verificationResult.data.content &&
                verificationResult.data.content.length > 0
              ) {
                // 인증 완료된 인증글이 있음
                console.log('[TodoListDetailScreen] 인증 완료된 미션 발견:', {
                  missionId: mission.missionId,
                  missionTitle: mission.title,
                });
                hasVerifiedMission = true;
              }
            } catch (error) {
              console.error('[TodoListDetailScreen] 미션 인증 상태 확인 중 오류:', error);
            }
          }

          // 인증 완료된 미션이 있으면 투두리스트를 다시 조회하여 최신 상태 반영
          // (백엔드에서 자동으로 투두리스트 미션도 완료 처리했을 수 있음)
          if (hasVerifiedMission) {
            console.log('[TodoListDetailScreen] 인증 완료된 미션이 있으므로 투두리스트 재조회');
            setTimeout(async () => {
              const refreshResult = await getTodoListDetail(todoListId);
              if (refreshResult.success && refreshResult.data) {
                const refreshedTodoList = refreshResult.data;
                setTodoList(refreshedTodoList);
                console.log('[TodoListDetailScreen] 투두리스트 최신 상태 반영 완료');

                // 모든 미션이 완료되었는지 확인
                const allMissionsCompleted = refreshedTodoList.missions 
                  ? refreshedTodoList.missions.every(m => m.isCompleted)
                  : (refreshedTodoList.completedCount > 0 && refreshedTodoList.completedCount === refreshedTodoList.totalCount);

                // 투두리스트가 오늘 생성되었는지 확인
                const isTodayCreated = (() => {
                  if (!refreshedTodoList.createdAt) return false;
                  const createdDate = new Date(refreshedTodoList.createdAt);
                  const today = new Date();
                  return (
                    createdDate.getFullYear() === today.getFullYear() &&
                    createdDate.getMonth() === today.getMonth() &&
                    createdDate.getDate() === today.getDate()
                  );
                })();

                // 모든 미션이 완료되었고 오늘 생성된 투두리스트인 경우 모달 표시
                if (allMissionsCompleted && isTodayCreated && !hasShownCompleteModal) {
                  setShowCompleteModal(true);
                  setHasShownCompleteModal(true);
                }
              }
            }, 500); // 백엔드 처리 시간을 고려하여 약간의 지연
          }
        }
      } else {
        console.error('[TodoListDetailScreen] 투두리스트 상세 조회 실패:', detailResult.error);
        // 500 에러인 경우 사용자에게 알림
        if (detailResult.error?.includes('서버 오류') || detailResult.error?.includes('500')) {
          Alert.alert('오류', '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
      }

      if (canCreateResult.success && canCreateResult.data) {
        setCanCreate(canCreateResult.data.canCreate);
      }
    } catch (error) {
      console.error('[TodoListDetailScreen] Failed to load todo list detail:', error);
      Alert.alert('오류', '투두리스트를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [todoListId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 화면 포커스 시 최신 상태 다시 조회 (인증 완료 시 진행률 반영)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // 화면이 포커스될 때마다 최신 상태 조회 (인증 완료된 미션이 반영되도록)
      loadData();
    });

    return unsubscribe;
  }, [navigation, loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleCompleteMission = async (mission: TodoMission) => {
    // 필수 미션(공식 미션)은 인증이 필요함
    const isRequiredMission = mission.missionType === 'OFFICIAL' || mission.missionSource === 'RANDOM_OFFICIAL';
    
    if (isRequiredMission) {
      // 필수 미션은 인증 화면으로 이동
      navigation.navigate(SCREEN_NAMES.MISSION_DETAIL as any, {
        missionId: mission.missionId.toString(),
      });
      return;
    }

    // 커스텀 미션은 바로 완료 처리
    setCompletingMissionId(mission.missionId);
    try {
      const result = await completeTodoMission(todoListId, mission.missionId);
      if (result.success && result.data) {
        const updatedTodoList = result.data;
        setTodoList(updatedTodoList);
        
        // 모든 미션이 완료되었는지 확인
        const allMissionsCompleted = updatedTodoList.missions 
          ? updatedTodoList.missions.every(m => m.isCompleted)
          : (updatedTodoList.completedCount > 0 && updatedTodoList.completedCount === updatedTodoList.totalCount);

        // 투두리스트가 오늘 생성되었는지 확인
        const isTodayCreated = (() => {
          if (!updatedTodoList.createdAt) return false;
          const createdDate = new Date(updatedTodoList.createdAt);
          const today = new Date();
          return (
            createdDate.getFullYear() === today.getFullYear() &&
            createdDate.getMonth() === today.getMonth() &&
            createdDate.getDate() === today.getDate()
          );
        })();

        // 모든 미션이 완료되었고 오늘 생성된 투두리스트인 경우 모달 표시
        if (allMissionsCompleted && isTodayCreated && !hasShownCompleteModal) {
          setShowCompleteModal(true);
          setHasShownCompleteModal(true);
        }

        const canCreateResult = await canCreateNewTodoList();
        if (canCreateResult.success && canCreateResult.data) {
          setCanCreate(canCreateResult.data.canCreate);
        }
      } else {
        Alert.alert('오류', result.error || '미션 완료에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '미션 완료에 실패했습니다.');
    } finally {
      setCompletingMissionId(null);
    }
  };

  const handleArchive = async () => {
    Alert.alert(
      '투두리스트 보관',
      '이 투두리스트를 보관하시겠습니까?\n보관된 투두리스트는 더 이상 수정할 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '보관',
          style: 'destructive',
          onPress: async () => {
            setArchiving(true);
            try {
              const result = await archiveTodoList(todoListId);
              if (result.success) {
                Alert.alert('성공', '투두리스트가 보관되었습니다.', [
                  {
                    text: '확인',
                    onPress: () => navigation.goBack(),
                  },
                ]);
              } else {
                Alert.alert('오류', result.error || '보관에 실패했습니다.');
              }
            } catch (error) {
              Alert.alert('오류', '보관에 실패했습니다.');
            } finally {
              setArchiving(false);
            }
          },
        },
      ]
    );
  };

  const handleCreateNew = () => {
    navigation.navigate(SCREEN_NAMES.TODO_LIST_CREATE);
  };

  const renderMissionItem = (mission: TodoMission) => {
    const isCompleting = completingMissionId === mission.missionId;
    const isRequiredMission = mission.missionType === 'OFFICIAL' || mission.missionSource === 'RANDOM_OFFICIAL';
    const canComplete = !mission.isCompleted && todoList?.status === 'ACTIVE';

    return (
      <TouchableOpacity
        style={[
          styles.missionItem,
          mission.isCompleted && styles.missionItemCompleted,
        ]}
        onPress={() => canComplete && handleCompleteMission(mission)}
        disabled={mission.isCompleted || isCompleting || todoList?.status !== 'ACTIVE'}
        activeOpacity={0.7}
      >
        <TouchableOpacity
          style={[
            styles.missionCheckbox,
            mission.isCompleted && styles.missionCheckboxCompleted,
            isRequiredMission && !mission.isCompleted && styles.missionCheckboxRequired,
          ]}
          onPress={() => canComplete && handleCompleteMission(mission)}
          disabled={mission.isCompleted || isCompleting || todoList?.status !== 'ACTIVE'}
          activeOpacity={0.7}
        >
          {isCompleting ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : mission.isCompleted ? (
            <Image
              source={require('../../assets/images/check2.png')}
              style={styles.checkIcon}
              resizeMode="contain"
            />
          ) : isRequiredMission ? (
            <Image
              source={require('../../assets/images/badge.png')}
              style={styles.requiredIcon}
              resizeMode="contain"
            />
          ) : null}
        </TouchableOpacity>

        <View style={styles.missionContent}>
          <View style={styles.missionTitleRow}>
            <Text
              style={[
                styles.missionTitle,
                mission.isCompleted && styles.missionTitleCompleted,
              ]}
              numberOfLines={1}
            >
              {mission.title}
            </Text>
            {isRequiredMission && !mission.isCompleted && (
              <Text style={styles.requiredBadge}>인증 필요</Text>
            )}
          </View>
          {mission.description && (
            <Text style={styles.missionDescription} numberOfLines={1}>
              {mission.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <Header title="투두리스트" showBackButton={true} navigation={navigation} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </ImageBackground>
    );
  }

  if (!todoList) {
    return (
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <Header title="투두리스트" showBackButton={true} navigation={navigation} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>투두리스트를 찾을 수 없습니다</Text>
        </View>
      </ImageBackground>
    );
  }

  // 실제 미션 배열을 기반으로 완료 수 직접 계산 (백엔드 completedCount가 부정확할 수 있음)
  const actualCompletedCount = todoList.missions 
    ? todoList.missions.filter(mission => mission.isCompleted).length
    : todoList.completedCount;
  const actualTotalCount = todoList.missions 
    ? todoList.missions.length
    : todoList.totalCount;
  
  const progressPercent = actualTotalCount > 0 
    ? Math.round((actualCompletedCount / actualTotalCount) * 100)
    : 0;

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <Header
        title="투두리스트"
        showBackButton={true}
        navigation={navigation}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 정보 카드 */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoTitle} numberOfLines={1}>
              {todoList.title}
            </Text>
            <View style={[
              styles.statusBadge,
              todoList.status === 'COMPLETED' && styles.statusBadgeCompleted,
              todoList.status === 'ARCHIVED' && styles.statusBadgeArchived,
            ]}>
              <Text style={[
                styles.statusBadgeText,
                todoList.status === 'COMPLETED' && styles.statusBadgeTextCompleted,
                todoList.status === 'ARCHIVED' && styles.statusBadgeTextArchived,
              ]}>
                {todoList.status === 'ACTIVE' ? '진행중' :
                 todoList.status === 'COMPLETED' ? '완료' : '보관됨'}
              </Text>
            </View>
          </View>

          {/* 진행률 */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>진행률</Text>
              <Text style={styles.progressValue}>{progressPercent}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPercent}%` },
                  todoList.status === 'COMPLETED' && styles.progressFillCompleted,
                ]}
              />
            </View>
            <Text style={styles.progressCount}>
              {actualCompletedCount}/{actualTotalCount} 완료
            </Text>
          </View>
        </View>

        {/* 미션 목록 */}
        <View style={styles.missionSection}>
          {todoList.missions && todoList.missions.length > 0 ? (
            todoList.missions
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((mission, index, array) => (
                <View key={mission.id}>
                  {renderMissionItem(mission)}
                  {index < array.length - 1 && <View style={styles.missionDivider} />}
                </View>
              ))
          ) : (
            <View style={styles.emptyMissions}>
              <Text style={styles.emptyMissionsText}>미션이 없습니다</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 오늘의 투두 완료 모달 */}
      <AlertModal
        visible={showCompleteModal}
        title="오늘의 투두 완료!"
        message="모든 미션을 완료했습니다. 오늘의 투두는 끝났어요! 내일 다시 새로운 투두리스트를 작성해보세요."
        buttonText="확인"
        onClose={() => setShowCompleteModal(false)}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  archiveButton: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
  },
  archiveButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing[4],
    paddingBottom: 120,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.base,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 2,
    borderColor: '#D4A574',
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  infoTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  statusBadge: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary[500],
  },
  statusBadgeCompleted: {
    backgroundColor: '#E8F5E9',
  },
  statusBadgeArchived: {
    backgroundColor: colors.gray[200],
  },
  statusBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  statusBadgeTextCompleted: {
    color: colors.white,
  },
  statusBadgeTextArchived: {
    color: colors.text.secondary,
  },
  infoDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[4],
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  progressSection: {
    marginTop: spacing[2],
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  progressLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  progressValue: {
    fontSize: typography.fontSize.lg,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  progressBar: {
    height: 12,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.full,
  },
  progressFillCompleted: {
    backgroundColor: '#4CAF50',
  },
  progressCount: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing[1.5],
    textAlign: 'center',
  },
  createNewButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.base,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    marginTop: spacing[4],
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  createNewButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[700],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  missionSection: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.base,
    padding: spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  missionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[3],
  },
  missionItemCompleted: {
    opacity: 0.6,
  },
  missionDivider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginLeft: spacing[11],
    marginRight: spacing[3],
  },
  missionCheckbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.base,
    borderWidth: 2,
    borderColor: colors.gray[400],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
    marginTop: spacing[0.5],
  },
  missionCheckboxCompleted: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },
  missionCheckboxRequired: {
    borderColor: colors.primary[500],
    borderWidth: 2,
  },
  checkIcon: {
    width: 16,
    height: 16,
    tintColor: colors.white,
  },
  requiredIcon: {
    width: 14,
    height: 14,
    tintColor: colors.primary[500],
  },
  missionContent: {
    flex: 1,
    paddingTop: spacing[0.5],
  },
  missionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[0.5],
  },
  missionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    flex: 1,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  requiredBadge: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[600],
    marginLeft: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  missionTitleCompleted: {
    color: colors.text.secondary,
    textDecorationLine: 'line-through',
  },
  missionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  emptyMissions: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  emptyMissionsText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
});

export default TodoListDetailScreen;
