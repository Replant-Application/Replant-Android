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
import { Header, ConfirmModal, AlertModal } from '../../components/ui';
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
    handleDeleteTodoList,
    showDeleteConfirmModal,
    handleDeleteConfirm,
    handleDeleteConfirmCancel,
    showDeleteBlockedModal,
    handleDeleteBlockedModalClose,
    onRefresh,
  } = useTodoListScreenContainer({ navigation, route });

  const renderTodoListCard = (todoList: TodoList, _isIncomplete: boolean = false) => {
    // completedCount와 totalCount를 기반으로 진행률 직접 계산
    const progressPercent = todoList.totalCount > 0 
      ? Math.round((todoList.completedCount / todoList.totalCount) * 100)
      : 0;

    return (
      <TouchableOpacity
        key={todoList.id}
        style={styles.todoListCard}
        onPress={() => handleTodoListPress(todoList)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${todoList.title}, ${progressPercent}%`}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {todoList.title}
          </Text>
          {activeTab === 'active' && (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => handleDeleteTodoList(todoList)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="삭제"
              accessibilityHint="누르면 투두리스트를 삭제할 수 있습니다"
            >
              <View style={styles.verticalDots}>
                <View style={styles.verticalDot} />
                <View style={styles.verticalDot} />
                <View style={styles.verticalDot} />
              </View>
            </TouchableOpacity>
          )}
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

      {/* 탭 버튼 - 나의 미션/미션 도감과 동일 스타일 */}
      <View style={styles.tabContainer}>
        <View style={styles.missionTabContainer}>
          <TouchableOpacity
            style={[styles.missionTab, activeTab === 'active' && styles.missionTabActive]}
            onPress={() => setActiveTab('active')}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityLabel={activeTab === 'active' ? '진행중, 선택됨' : '진행중'}
            accessibilityState={{ selected: activeTab === 'active' }}
          >
            <Text
              style={[styles.missionTabText, activeTab === 'active' && styles.missionTabTextActive]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              진행중 ({activeTodoLists.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.missionTab, activeTab === 'completed' && styles.missionTabActive]}
            onPress={() => setActiveTab('completed')}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityLabel={activeTab === 'completed' ? '완료, 선택됨' : '완료'}
            accessibilityState={{ selected: activeTab === 'completed' }}
          >
            <Text
              style={[styles.missionTabText, activeTab === 'completed' && styles.missionTabTextActive]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              완료 ({completedTodoLists.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.missionTab, activeTab === 'incomplete' && styles.missionTabActive]}
            onPress={() => setActiveTab('incomplete')}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityLabel={activeTab === 'incomplete' ? '미완료, 선택됨' : '미완료'}
            accessibilityState={{ selected: activeTab === 'incomplete' }}
          >
            <Text
              style={[styles.missionTabText, activeTab === 'incomplete' && styles.missionTabTextActive]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              미완료 ({incompleteTodoLists.length})
            </Text>
          </TouchableOpacity>
        </View>
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
            style={[styles.createButton, activeTodoLists.length > 0 && styles.createButtonDisabled]}
            onPress={handleCreateTodoList}
            disabled={activeTodoLists.length > 0}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="나만의 투두리스트 만들기. 투두리스트는 하루에 한번만 작성 가능해요"
            accessibilityState={{ disabled: activeTodoLists.length > 0 }}
            accessibilityHint={activeTodoLists.length > 0 ? '진행 중인 투두리스트가 있어 비활성화되었습니다' : undefined}
          >
            <View style={styles.createButtonContent}>
              <View style={styles.createButtonTitleRow}>
                <Text style={styles.createButtonIcon}>+</Text>
                <Text style={styles.createButtonTitle}>나만의 투두리스트 만들기</Text>
              </View>
              <Text style={styles.createButtonSubtitle}>* 투두리스트는 하루에 한번만 작성 가능해요</Text>
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

      {/* 투두리스트 삭제 확인 ConfirmModal */}
      <ConfirmModal
        visible={showDeleteConfirmModal}
        title="투두리스트 삭제"
        message="이 투두리스트를 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteConfirmCancel}
        confirmButtonColor={colors.error}
      />
      {/* 삭제 불가 AlertModal (완료된 미션이 있을 때) */}
      <AlertModal
        visible={showDeleteBlockedModal}
        title="삭제 불가"
        message="진행 이력이 있는 투두리스트는\n삭제할 수 없습니다."
        buttonText="확인"
        onClose={handleDeleteBlockedModalClose}
      />
    </ImageBackground>
  );
};


export default TodoListScreen;
