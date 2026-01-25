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
import { Header, AlertModal } from '../../components/ui';
import { TodoMission } from '../../types/todolist';
import { useTodoListDetailScreenContainer } from './TodoListDetailScreen.container';
import { styles } from './TodoListDetailScreen.styles';

interface Props {
  navigation: any;
  route: {
    params: {
      todoListId: number;
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
    showCompleteModal,
    actualCompletedCount,
    actualTotalCount,
    progressPercent,
    handleCompleteMission,
    handleCompleteModalClose,
    onRefresh,
  } = useTodoListDetailScreenContainer({ navigation, route });


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
              accessibilityLabel="완료 아이콘"
            />
          ) : isRequiredMission ? (
            <Image
              source={require('../../assets/images/badge.png')}
              style={styles.requiredIcon}
              resizeMode="contain"
              accessibilityLabel="필수 미션 아이콘"
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
        accessibilityElementsHidden={true}
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
        accessibilityElementsHidden={true}
      >
        <Header title="투두리스트" showBackButton={true} navigation={navigation} />
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
        onClose={handleCompleteModalClose}
      />
    </ImageBackground>
  );
};


export default TodoListDetailScreen;
