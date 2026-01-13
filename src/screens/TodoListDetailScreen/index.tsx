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
import { Header } from '../../components/ui';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { SCREEN_NAMES } from '../../utils/constants';
import { getTodoListDetail, completeTodoMission, archiveTodoList, canCreateNewTodoList } from '../../api/todolistApi';
import { TodoList, TodoMission } from '../../types/todolist';

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

  const loadData = useCallback(async () => {
    try {
      const [detailResult, canCreateResult] = await Promise.all([
        getTodoListDetail(todoListId),
        canCreateNewTodoList(),
      ]);

      if (detailResult.success && detailResult.data) {
        setTodoList(detailResult.data);
      }

      if (canCreateResult.success && canCreateResult.data) {
        setCanCreate(canCreateResult.data.canCreate);
      }
    } catch (error) {
      console.error('Failed to load todo list detail:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [todoListId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleCompleteMission = async (missionId: number) => {
    setCompletingMissionId(missionId);
    try {
      const result = await completeTodoMission(todoListId, missionId);
      if (result.success && result.data) {
        setTodoList(result.data);
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

    return (
      <TouchableOpacity
        style={[
          styles.missionItem,
          mission.isCompleted && styles.missionItemCompleted,
        ]}
        onPress={() => !mission.isCompleted && todoList?.status === 'ACTIVE' && handleCompleteMission(mission.missionId)}
        disabled={mission.isCompleted || isCompleting || todoList?.status !== 'ACTIVE'}
        activeOpacity={0.7}
      >
        <TouchableOpacity
          style={[
            styles.missionCheckbox,
            mission.isCompleted && styles.missionCheckboxCompleted,
          ]}
          onPress={() => !mission.isCompleted && handleCompleteMission(mission.missionId)}
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
          ) : null}
        </TouchableOpacity>

        <View style={styles.missionContent}>
          <Text
            style={[
              styles.missionTitle,
              mission.isCompleted && styles.missionTitleCompleted,
            ]}
            numberOfLines={1}
          >
            {mission.title}
          </Text>
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

  const progressPercent = Math.round(todoList.progressRate);

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
        rightButton={
          todoList.status === 'ACTIVE' ? (
            <TouchableOpacity
              style={styles.archiveButton}
              onPress={handleArchive}
              disabled={archiving}
            >
              <Text style={styles.archiveButtonText}>보관</Text>
            </TouchableOpacity>
          ) : undefined
        }
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
              {todoList.completedCount}/{todoList.totalCount} 완료
            </Text>
          </View>

          {/* 새 투두리스트 생성 버튼 */}
          {canCreate && todoList.status === 'ACTIVE' && (
            <TouchableOpacity
              style={styles.createNewButton}
              onPress={handleCreateNew}
              activeOpacity={0.7}
            >
              <Text style={styles.createNewButtonText}>+ 새 투두리스트</Text>
            </TouchableOpacity>
          )}
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
    borderRadius: borderRadius.xl,
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
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing[2],
  },
  statusBadge: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2.5],
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
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
    color: colors.primary[700],
  },
  statusBadgeTextCompleted: {
    color: '#2E7D32',
  },
  statusBadgeTextArchived: {
    color: colors.text.secondary,
  },
  infoDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[4],
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
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
  },
  progressValue: {
    fontSize: typography.fontSize.lg,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.bold,
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
    borderRadius: borderRadius.md,
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
  },
  missionSection: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  missionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
  },
  missionItemCompleted: {
    opacity: 0.6,
  },
  missionDivider: {
    height: 1,
    backgroundColor: colors.gray[100],
    marginLeft: spacing[11],
  },
  missionCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  missionCheckboxCompleted: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },
  checkIcon: {
    width: 16,
    height: 16,
    tintColor: colors.white,
  },
  missionContent: {
    flex: 1,
  },
  missionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[0.5],
  },
  missionTitleCompleted: {
    color: colors.text.secondary,
    textDecorationLine: 'line-through',
  },
  missionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  emptyMissions: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  emptyMissionsText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
});

export default TodoListDetailScreen;
