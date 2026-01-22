import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  ActivityIndicator,
  Image,
  ImageBackground,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { Header, AlertModal } from '../../components/ui';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { TodoMission } from '../../types/todolist';
import { useTodoListDetailScreenContainer } from './TodoListDetailScreen.container';

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
    canCreate,
    loading,
    refreshing,
    completingMissionId,
    archiving,
    showCompleteModal,
    actualCompletedCount,
    actualTotalCount,
    progressPercent,
    handleCompleteMission,
    handleArchive,
    handleCreateNew,
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
        onClose={handleCompleteModalClose}
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
