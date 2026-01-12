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
  ImageBackground,
  Image,
  Alert,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { Header, SimpleTabBar } from '../../components/ui';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { SCREEN_NAMES } from '../../utils/constants';
import { getActiveTodoLists, getTodoLists, canCreateNewTodoList } from '../../api/todolistApi';
import { TodoList, CanCreateResponse } from '../../types/todolist';

interface Props {
  navigation: any;
}

const TodoListScreen: React.FC<Props> = ({ navigation }) => {
  const [activeTodoLists, setActiveTodoLists] = useState<TodoList[]>([]);
  const [completedTodoLists, setCompletedTodoLists] = useState<TodoList[]>([]);
  const [canCreate, setCanCreate] = useState<CanCreateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  const loadData = useCallback(async () => {
    try {
      const [activeResult, allResult, canCreateResult] = await Promise.all([
        getActiveTodoLists(),
        getTodoLists(0, 50),
        canCreateNewTodoList(),
      ]);

      if (activeResult.success && activeResult.data) {
        setActiveTodoLists(activeResult.data);
      }

      if (allResult.success && allResult.data) {
        const completed = allResult.data.content.filter(
          (todo) => todo.status === 'COMPLETED' || todo.status === 'ARCHIVED'
        );
        setCompletedTodoLists(completed);
      }

      if (canCreateResult.success && canCreateResult.data) {
        setCanCreate(canCreateResult.data);
      }
    } catch (error) {
      console.error('Failed to load todo lists:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleCreateTodoList = () => {
    if (canCreate && !canCreate.canCreate) {
      Alert.alert(
        "투두리스트 생성 불가",
        "현재 진행 중인 투두리스트를 80% 이상 완료해야 새로운 투두리스트를 만들 수 있습니다.",
        [{ text: "확인" }]
      );
      return;
    }
    navigation.navigate(SCREEN_NAMES.TODO_LIST_CREATE);
  };

  const handleTodoListPress = (todoList: TodoList) => {
    navigation.navigate(SCREEN_NAMES.TODO_LIST_DETAIL, { todoListId: todoList.id });
  };

  const renderTodoListCard = (todoList: TodoList) => {
    const progressPercent = Math.round(todoList.progressRate);

    return (
      <TouchableOpacity
        key={todoList.id}
        style={styles.todoListCard}
        onPress={() => handleTodoListPress(todoList)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
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

        {todoList.description && (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {todoList.description}
          </Text>
        )}

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercent}%` },
                todoList.status === 'COMPLETED' && styles.progressFillCompleted,
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {todoList.completedCount}/{todoList.totalCount}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.cardDate}>
            {new Date(todoList.createdAt).toLocaleDateString('ko-KR')}
          </Text>
          <Text style={styles.progressPercent}>{progressPercent}%</Text>
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
        <Header title="나의 투두리스트" showBackButton={true} navigation={navigation} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </ImageBackground>
    );
  }

  const currentList = activeTab === 'active' ? activeTodoLists : completedTodoLists;

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <Header title="나의 투두리스트" showBackButton={true} navigation={navigation} />

      {/* 탭 버튼 */}
      <View style={styles.tabContainer}>
        <SimpleTabBar
          tabs={[
            { key: 'active', label: `진행중 (${activeTodoLists.length})` },
            { key: 'completed', label: `완료 (${completedTodoLists.length})` },
          ]}
          activeTab={activeTab}
          onTabChange={(key) => setActiveTab(key as 'active' | 'completed')}
        />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* 새 투두리스트 생성 버튼 */}
        {activeTab === 'active' && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateTodoList}
            activeOpacity={0.7}
          >
            <Text style={styles.createButtonIcon}>+</Text>
            <View style={styles.createButtonContent}>
              <Text style={styles.createButtonTitle}>새 투두리스트 만들기</Text>
              <Text style={styles.createButtonSubtitle}>
                5개의 미션으로 새로운 목표를 설정하세요
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* 투두리스트 목록 */}
        {currentList.length > 0 ? (
          currentList.map(renderTodoListCard)
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'active'
                ? '진행 중인 투두리스트가 없습니다'
                : '완료된 투두리스트가 없습니다'}
            </Text>
            {activeTab === 'active' && (
              <Text style={styles.emptySubtext}>
                새 투두리스트를 만들어보세요!
              </Text>
            )}
          </View>
        )}
        )}
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    paddingHorizontal: spacing[3],
    paddingTop: spacing[2],
    paddingBottom: spacing[3],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing[4],
    paddingBottom: 120,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 2,
    borderColor: '#D4A574',
    borderStyle: 'dashed',
  },
  createButtonIcon: {
    fontSize: 32,
    color: '#8B6F47',
    marginRight: spacing[3],
    fontWeight: typography.fontWeight.normal,
  },
  createButtonContent: {
    flex: 1,
  },
  createButtonTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: '#6B5344',
    marginBottom: spacing[1],
  },
  createButtonSubtitle: {
    fontSize: typography.fontSize.sm,
    color: '#8B6F47',
  },
  todoListCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 2,
    borderColor: '#D4A574',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  cardTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing[2],
  },
  statusBadge: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2.5],
    borderRadius: borderRadius.full,
    backgroundColor: '#E8DDD4',
  },
  statusBadgeCompleted: {
    backgroundColor: '#D4EDDA',
  },
  statusBadgeArchived: {
    backgroundColor: colors.gray[200],
  },
  statusBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: '#6B5344',
  },
  statusBadgeTextCompleted: {
    color: '#2E7D32',
  },
  statusBadgeTextArchived: {
    color: colors.text.secondary,
  },
  cardDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[3],
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E8DDD4',
    borderRadius: borderRadius.full,
    marginRight: spacing[2],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B6F47',
    borderRadius: borderRadius.full,
  },
  progressFillCompleted: {
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
    minWidth: 40,
    textAlign: 'right',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  progressPercent: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: '#6B5344',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[12],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing[4],
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginTop: spacing[4],
    borderWidth: 1,
    borderColor: '#D4A574',
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
});

export default TodoListScreen;
