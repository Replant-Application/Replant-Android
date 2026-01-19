import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  route?: any;
}

const TodoListScreen: React.FC<Props> = ({ navigation, route }) => {
  const [activeTodoLists, setActiveTodoLists] = useState<TodoList[]>([]);
  const [completedTodoLists, setCompletedTodoLists] = useState<TodoList[]>([]);
  const [incompleteTodoLists, setIncompleteTodoLists] = useState<TodoList[]>([]);
  const [canCreate, setCanCreate] = useState<CanCreateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'incomplete'>('active');

  const loadData = useCallback(async () => {
    try {
      const [activeResult, allResult, canCreateResult] = await Promise.all([
        getActiveTodoLists(),
        getTodoLists(0, 50),
        canCreateNewTodoList(),
      ]);

      console.log('[TodoListScreen] getActiveTodoLists 응답:', JSON.stringify(activeResult, null, 2));
      
      if (activeResult.success && activeResult.data) {
        console.log('[TodoListScreen] activeResult.data:', activeResult.data);
        console.log('[TodoListScreen] activeResult.data 타입:', Array.isArray(activeResult.data) ? '배열' : typeof activeResult.data);
        const allActiveLists = Array.isArray(activeResult.data) ? activeResult.data : [];
        
        // 오늘 날짜인 투두리스트만 "진행중"에 표시
        // 과거 날짜의 미완료 투두리스트는 제외
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayActiveLists = allActiveLists.filter((todoList) => {
          if (!todoList.createdAt) return false;
          const createdDate = new Date(todoList.createdAt);
          createdDate.setHours(0, 0, 0, 0);
          
          // 오늘 날짜이고 완료되지 않은 투두리스트만
          const isToday = createdDate.getTime() === today.getTime();
          const isNotCompleted = todoList.status === 'ACTIVE' && 
                                 todoList.completedCount < todoList.totalCount;
          
          return isToday && isNotCompleted;
        });
        
        setActiveTodoLists(todayActiveLists);
      } else {
        console.log('[TodoListScreen] activeResult 실패:', activeResult.error);
      }

      if (allResult.success && allResult.data) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // 완료된 투두리스트만 "완료" 탭에 표시
        const completed = allResult.data.content.filter(
          (todo) => todo.status === 'COMPLETED' || todo.status === 'ARCHIVED'
        );
        setCompletedTodoLists(completed);
        
        // 과거 날짜의 미완료 투두리스트는 별도로 분리
        const incomplete = allResult.data.content.filter((todo) => {
          if (!todo.createdAt) return false;
          const createdDate = new Date(todo.createdAt);
          createdDate.setHours(0, 0, 0, 0);
          const isPastDate = createdDate.getTime() < today.getTime();
          const isNotCompleted = todo.status === 'ACTIVE' && 
                                 todo.completedCount < todo.totalCount;
          
          return isPastDate && isNotCompleted;
        });
        setIncompleteTodoLists(incomplete);
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

  // route.params.refresh가 있으면 데이터 새로고침 (약간의 딜레이를 주어 백엔드 트랜잭션 완료 대기)
  useEffect(() => {
    if (route?.params?.refresh) {
      // 백엔드 트랜잭션이 완료될 시간을 주기 위해 약간의 딜레이 추가
      const timer = setTimeout(() => {
        console.log('[TodoListScreen] refresh 플래그 감지, 데이터 새로고침');
        loadData();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [route?.params?.refresh, loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleCreateTodoList = () => {
    // canCreate는 항상 true이므로 제한 없이 생성 가능
    navigation.navigate(SCREEN_NAMES.TODO_LIST_CREATE);
  };

  const handleTodoListPress = (todoList: TodoList) => {
    navigation.navigate(SCREEN_NAMES.TODO_LIST_DETAIL, { todoListId: todoList.id });
  };

  const renderTodoListCard = (todoList: TodoList, isIncomplete: boolean = false) => {
    // completedCount와 totalCount를 기반으로 진행률 직접 계산
    const progressPercent = todoList.totalCount > 0 
      ? Math.round((todoList.completedCount / todoList.totalCount) * 100)
      : 0;

    // 과거 날짜의 미완료 투두리스트는 "미완료"로 표시
    const statusText = isIncomplete 
      ? '미완료'
      : (todoList.status === 'ACTIVE' ? '진행중' :
         todoList.status === 'COMPLETED' ? '완료' : '보관됨');

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
            isIncomplete && styles.statusBadgeIncomplete,
          ]}>
            <Text style={[
              styles.statusBadgeText,
              todoList.status === 'COMPLETED' && styles.statusBadgeTextCompleted,
              todoList.status === 'ARCHIVED' && styles.statusBadgeTextArchived,
              isIncomplete && styles.statusBadgeTextIncomplete,
            ]}>
              {statusText}
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

  const currentList = activeTab === 'active' 
    ? activeTodoLists 
    : activeTab === 'completed' 
    ? completedTodoLists 
    : incompleteTodoLists;

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
            { key: 'incomplete', label: `미완료 (${incompleteTodoLists.length})` },
          ]}
          activeTab={activeTab}
          onTabChange={(key) => setActiveTab(key as 'active' | 'completed' | 'incomplete')}
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
              <Text style={styles.createButtonTitle}>나만의 To-Do 만들기</Text>
              <Text style={styles.createButtonSubtitle}>
                필수미션을 조합해서 새로운 목표를 설정하세요
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* 투두리스트 목록 */}
        {currentList.length > 0 ? (
          currentList.map((todoList) => renderTodoListCard(todoList, activeTab === 'incomplete'))
        ) : (
          <View style={styles.emptyContainer}>
            <Image 
              source={require('../../assets/images/list.png')} 
              style={styles.emptyIcon} 
              resizeMode="contain" 
              accessibilityLabel="투두리스트 아이콘"
            />
            <Text style={styles.emptyText}>
              {activeTab === 'active'
                ? '진행 중인 투두리스트가 없습니다'
                : activeTab === 'completed'
                ? '완료된 투두리스트가 없습니다'
                : '미완료된 투두리스트가 없습니다'}
            </Text>
            {activeTab === 'active' && (
              <Text style={styles.emptySubtext}>
                새 투두리스트를 만들어보세요!
              </Text>
            )}
          </View>
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
    borderRadius: borderRadius.base,
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
    fontWeight: typography.fontWeight.medium,
    color: '#6B5344',
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  createButtonSubtitle: {
    fontSize: typography.fontSize.sm,
    color: '#8B6F47',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  todoListCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.base,
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
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500],
  },
  statusBadgeCompleted: {
    backgroundColor: '#D4EDDA',
  },
  statusBadgeArchived: {
    backgroundColor: colors.gray[200],
  },
  statusBadgeIncomplete: {
    backgroundColor: '#FFE082',
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
    color: '#2E7D32',
  },
  statusBadgeTextArchived: {
    color: colors.text.secondary,
  },
  statusBadgeTextIncomplete: {
    color: '#E65100',
  },
  cardDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[3],
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
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
  },
  cardDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  progressPercent: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: '#6B5344',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[12],
  },
  emptyIcon: {
    width: 48,
    height: 48,
    marginBottom: spacing[4],
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
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
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
});

export default TodoListScreen;
