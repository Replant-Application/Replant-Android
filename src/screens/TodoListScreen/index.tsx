import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ImageBackground,
  Image,
} from 'react-native';
import { colors } from '../../utils/designTokens';
import { formatDateKorean } from '../../utils/dateUtils';
import { Header, SimpleTabBar } from '../../components/ui';
import { TodoList } from '../../types/todolist';
import { useTodoListScreenContainer } from './TodoListScreen.container';
import { styles } from './TodoListScreen.styles';

interface Props {
  navigation: any;
  route?: any;
}

const TodoListScreen: React.FC<Props> = ({ navigation, route }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    activeTodoLists,
    completedTodoLists,
    incompleteTodoLists,
    currentList,
    loading,
    refreshing,
    activeTab,
    setActiveTab,
    handleCreateTodoList,
    handleTodoListPress,
    onRefresh,
  } = useTodoListScreenContainer({ navigation, route });

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
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.cardDate}>
            {formatDateKorean(todoList.createdAt)}
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
        accessibilityElementsHidden={true}
      >
        <Header title="나의 투두리스트" showBackButton={true} navigation={navigation} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.container}
      resizeMode="cover"
      accessibilityElementsHidden={true}
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
            accessibilityRole="button"
            accessibilityLabel="나만의 To-Do 만들기"
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
          currentList.map(todoList => renderTodoListCard(todoList, activeTab === 'incomplete'))
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


export default TodoListScreen;
