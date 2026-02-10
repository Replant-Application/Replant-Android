import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  ImageBackground,
} from 'react-native';
import { colors } from '../../utils/designTokens';
import { Header, AlertModal, ConfirmModal } from '../../components/ui';
import { TodoMission } from '../../types/todolist';
import { useTodoListDetailScreenContainer } from './TodoListDetailScreen.container';
import { styles } from './TodoListDetailScreen.styles';
import { SCREEN_NAMES } from '../../utils/constants';

interface Props {
  navigation: any;
  route: {
    params: {
      todoListId: number;
      activeTab?: 'active' | 'completed' | 'incomplete'; // 뒤로가기 시 복원할 탭
    };
  };
}

const TodoListDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    todoList,
    loading,
    refreshing,
    completingMissionId,
    isOwner,
    showCompleteModal,
    showAlert,
    alertTitle,
    alertMessage,
    handleCloseAlert,
    showArchiveConfirmModal,
    handleArchiveConfirm,
    handleArchiveConfirmCancel,
    showDeleteConfirmModal,
    handleDelete,
    handleDeleteConfirm,
    handleDeleteConfirmCancel,
    actualCompletedCount,
    actualTotalCount,
    progressPercent,
    handleCompleteMission,
    handleUncompleteMission,
    handleCompleteModalClose,
    onRefresh,
  } = useTodoListDetailScreenContainer({ navigation, route });


  const renderMissionItem = (mission: TodoMission) => {
    const isCompleting = completingMissionId === mission.missionId;
    const canComplete = !mission.isCompleted && todoList?.status === 'ACTIVE';
    const isCustomMission = mission.missionType === 'CUSTOM' || mission.missionSource === 'CUSTOM_SELECTED';
    const canUncomplete = mission.isCompleted && isCustomMission && todoList?.status === 'ACTIVE';
    const handlePress = () => {
      if (canComplete) handleCompleteMission(mission);
      else if (canUncomplete) handleUncompleteMission(mission);
    };

    return (
      <TouchableOpacity
        style={[
          styles.missionItem,
          mission.isCompleted && styles.missionItemCompleted,
        ]}
        onPress={handlePress}
        disabled={!canComplete && !canUncomplete || isCompleting || todoList?.status !== 'ACTIVE'}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={mission.isCompleted ? (canUncomplete ? `${mission.title}, 완료됨. 다시 누르면 인증 취소` : `${mission.title}, 완료됨`) : mission.title}
        accessibilityState={{ disabled: !canComplete && !canUncomplete || isCompleting || todoList?.status !== 'ACTIVE' }}
      >
        <TouchableOpacity
          style={[
            styles.missionCheckbox,
            mission.isCompleted && styles.missionCheckboxCompleted,
          ]}
          onPress={handlePress}
          disabled={!canComplete && !canUncomplete || isCompleting || todoList?.status !== 'ACTIVE'}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={mission.isCompleted ? (canUncomplete ? '완료됨, 다시 누르면 인증 취소' : '완료됨') : '미션 완료하기'}
          accessibilityState={{ disabled: !canComplete && !canUncomplete || isCompleting || todoList?.status !== 'ACTIVE' }}
        >
          {isCompleting ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : mission.isCompleted ? (
            <Image
              source={require('../../assets/images/check2.png')}
              style={styles.checkIcon}
              resizeMode="contain"
              accessibilityLabel="완료 아이콘"
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
          </View>
          {mission.description && (
            <Text style={styles.missionDescription} numberOfLines={1}>
              {mission.description}
            </Text>
          )}
          <View style={styles.missionBadges}>
            <View style={[
              styles.missionBadge,
              isCustomMission ? styles.missionBadgeCustom : styles.missionBadgeOfficial
            ]}>
              <Text style={[
                styles.missionBadgeText,
                isCustomMission ? styles.missionBadgeTextCustom : styles.missionBadgeTextOfficial
              ]}>
                {isCustomMission ? '커스텀' : '공식'}
              </Text>
            </View>
            {mission.isCompleted && (
              <View style={styles.missionBadgeCompleted}>
                <Text style={styles.missionBadgeTextCompleted}>완료</Text>
              </View>
            )}
          </View>
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
        <Header 
          title="투두리스트" 
          showBackButton={true} 
          navigation={{
            ...navigation,
            goBack: () => {
              // activeTab이 있으면 해당 탭으로 복원
              const activeTab = route.params?.activeTab;
              if (activeTab) {
                navigation.navigate(SCREEN_NAMES.TODO_LIST as any, { activeTab });
              } else {
                navigation.goBack?.();
              }
            },
          }}
        />
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
        accessibilityElementsHidden={true}
      >
        <Header 
          title="투두리스트" 
          showBackButton={true} 
          navigation={{
            ...navigation,
            goBack: () => {
              // activeTab이 있으면 해당 탭으로 복원
              const activeTab = route.params?.activeTab;
              if (activeTab) {
                navigation.navigate(SCREEN_NAMES.TODO_LIST as any, { activeTab });
              } else {
                navigation.goBack?.();
              }
            },
          }}
        />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>투두리스트를 찾을 수 없습니다</Text>
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
      <Header
        title="투두리스트"
        showBackButton={true}
        navigation={{
          ...navigation,
            goBack: () => {
              // activeTab이 있으면 해당 탭으로 복원
              const activeTab = route.params?.activeTab;
              if (activeTab) {
                navigation.navigate(SCREEN_NAMES.TODO_LIST as any, { activeTab });
              } else {
                navigation.goBack?.();
              }
            },
        }}
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
            <View style={styles.headerRight}>
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
              {isOwner && todoList?.isPublic && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDelete}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="공유 해제"
                >
                  <Text style={styles.deleteButtonText}>공유 해제</Text>
                </TouchableOpacity>
              )}
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
              {actualCompletedCount} / {actualTotalCount} 완료
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

      {/* useErrorHandler 오류/성공/알림 → AlertModal */}
      <AlertModal
        visible={showAlert}
        title={alertTitle}
        message={alertMessage}
        buttonText="확인"
        onClose={handleCloseAlert}
      />

      {/* 보관 확인 ConfirmModal */}
      <ConfirmModal
        visible={showArchiveConfirmModal}
        title="투두리스트 보관"
        message="이 투두리스트를 보관하시겠습니까?\n보관된 투두리스트는 더 이상 수정할 수 없습니다."
        confirmText="보관"
        cancelText="취소"
        onConfirm={handleArchiveConfirm}
        onCancel={handleArchiveConfirmCancel}
        confirmButtonColor={colors.primary[500]}
      />

      {/* 공유 해제 확인 ConfirmModal */}
      <ConfirmModal
        visible={showDeleteConfirmModal}
        title="공유 게시판에서 제거"
        message="이 투두리스트를 커뮤니티 공유 게시판에서 제거하시겠습니까?\n제거된 투두리스트는 다른 사용자에게 보이지 않지만, 본인은 계속 사용할 수 있습니다."
        confirmText="제거"
        cancelText="취소"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteConfirmCancel}
        confirmButtonColor={colors.primary[500]}
      />

      {/* 오늘의 투두 완료 모달 */}
      <AlertModal
        visible={showCompleteModal}
        title="오늘의 투두 완료!"
        message={"모든 미션을 완료했습니다.\n오늘의 투두는 끝났어요!"}
        buttonText="확인"
        onClose={handleCompleteModalClose}
      />
    </ImageBackground>
  );
};


export default TodoListDetailScreen;
