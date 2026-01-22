import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Platform, ImageBackground, ActivityIndicator, Dimensions, FlatList } from 'react-native';
import { MissionCard, MissionVerificationModal, MissionProgressCard } from '../../components/specialized';
import { Loading, ErrorBoundary, Header, EmptyState, ConfirmModal, SimpleTabBar } from '../../components/ui';
import MissionInfoModal from './MissionInfoModal';
import MissionPagination from './MissionPagination';
import MissionGroupList from './MissionGroupList';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { MissionScreenProps, MissionTab } from '../../types/screens/mission';
import { useMissionScreenContainer } from './MissionScreen.container';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MissionScreen: React.FC<MissionScreenProps> = ({ navigation, route }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    loading,
    error,
    displayedMissions,
    completedMissions,
    totalMissions,
    selectedFilter,
    activeTab,
    missionGroupTab,
    verificationModalVisible,
    selectedMissionForVerification,
    showCompleteModal,
    completeModalTitle,
    completeModalMessage,
    completedMissionForVerification,
    isLevelUp,
    groupMissions,
    groupLoading,
    selectedGroupMission,
    currentServerPage,
    totalServerPages,
    currentUserId,
    currentMissionPage,
    totalMissionPages,
    missionPages,
    missionFlatListRef,
    refreshing,
    handleMissionComplete,
    handleMissionUncomplete,
    handleVerify,
    handleLikeVerification,
    handlePhotoUpload,
    handleDeletePhoto,
    handleCompleteModalConfirm,
    handleCompleteModalCancel,
    handleVerificationModalClose,
    handleVerificationSuccess,
    handleTabChange,
    handleFilterChange,
    handleMissionGroupTabChange,
    handleServerPageChange,
    setSelectedGroupMission,
    onRefresh,
    onMissionPageChange,
    goToMissionPage,
    getVerificationTypeLabel,
    getVerificationTypeIcon,
    getMissionCategoryLabel,
  } = useMissionScreenContainer({ navigation, route });


  if (loading) {
    return <Loading text="미션을 불러오는 중..." />;
  }

  if (error) {
    return <ErrorBoundary error={error} />;
  }


  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <Header title="미션" showBackButton={false} navigation={navigation} />

      {/* 나의 미션 / 미션 도감 탭 */}
      <View style={styles.topTabContainer}>
        <SimpleTabBar
          tabs={[
            { key: 'myMission', label: '나의 미션' },
            { key: 'missionGroup', label: '미션 도감' },
          ]}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          style={styles.topTabBar}
        />
      </View>

      {/* 미션 완료 모달 */}
      <ConfirmModal
        visible={showCompleteModal}
        title={completeModalTitle}
        message={completeModalMessage}
        confirmText="인증하기"
        cancelText="나중에"
        onConfirm={handleCompleteModalConfirm}
        onCancel={handleCompleteModalCancel}
        confirmButtonColor={colors.primary[500]}
        image={isLevelUp ? require('../../assets/images/gift.png') : require('../../assets/images/check2.png')}
      />

      {/* 인증 방법 선택 모달 */}
      <MissionVerificationModal
        visible={verificationModalVisible}
        mission={selectedMissionForVerification}
        onClose={handleVerificationModalClose}
        onLikeVerification={handleLikeVerification}
        onVerificationSuccess={handleVerificationSuccess}
      />

      {/* 나의 미션 콘텐츠 */}
      {activeTab === 'myMission' && (
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
          />
        }
      >
        {/* 진행률 카드 */}
        {totalMissions > 0 && (
          <MissionProgressCard
            completedMissions={completedMissions}
            totalMissions={totalMissions}
            onBadgePress={() => navigation.navigate('MyProgressDetail' as any)}
          />
        )}

        {/* 진행중/인증대기/완료 탭 */}
        <SimpleTabBar
          tabs={[
            { key: 'inProgress', label: '진행중' },
            { key: 'pendingVerification', label: '인증 대기' },
            { key: 'completed', label: '완료' },
          ]}
          activeTab={selectedFilter}
          onTabChange={handleFilterChange}
          style={styles.tabBar}
        />

        {/* 미션 목록 (페이지네이션) */}
        {displayedMissions.length === 0 ? (
          <EmptyState
            iconImage={require('../../assets/images/clover.png')}
            title={
              selectedFilter === 'inProgress'
                ? '완료할 미션이 없어'
                : selectedFilter === 'completed'
                ? '완료한 미션이 없어요'
                : '인증 대기 중인 미션이 없어요'
            }
            description={
              selectedFilter === 'inProgress'
                ? '새로운 미션에 도전해보세요!'
                : selectedFilter === 'completed'
                ? '미션을 완료하면 여기에 표시됩니다.'
                : '미션을 인증하면 여기에 표시됩니다.'
            }
          />
        ) : (
          <>
            <FlatList
              ref={missionFlatListRef}
              data={missionPages}
              renderItem={({ item: pageMissions }) => (
                <View style={styles.missionPageContainer}>
                  {pageMissions.map((mission, index) => (
                    <MissionCard
                      key={`${mission.mission_id}-${mission.id || index}`}
                      mission={mission}
                      onComplete={handleMissionComplete}
                      onUncomplete={handleMissionUncomplete}
                      onUploadPhoto={handlePhotoUpload}
                      onDeletePhoto={handleDeletePhoto}
                      onWriteReview={(missionId) => navigation.navigate('MissionDetail', { 
                        missionId,
                        returnTab: (activeTab as MissionTab) === 'missionGroup' ? 'missionGroup' : undefined
                      })}
                      onVerify={handleVerify}
                      onViewDetails={() => navigation.navigate('MissionDetail', { 
                        missionId: mission.mission_id || String(mission.id) || '',
                        returnTab: (activeTab as MissionTab) === 'missionGroup' ? 'missionGroup' : undefined
                      })}
                    />
                  ))}
                </View>
              )}
              keyExtractor={(_, index) => `mission-page-${index}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onMissionPageChange}
              getItemLayout={(_, index) => ({
                length: SCREEN_WIDTH - spacing[8],
                offset: (SCREEN_WIDTH - spacing[8]) * index,
                index,
              })}
              scrollEnabled={totalMissionPages > 1}
            />

            {/* 페이지네이션 */}
            <MissionPagination
              currentPage={currentMissionPage}
              totalPages={totalMissionPages}
              onPageChange={goToMissionPage}
              onPrevious={() => goToMissionPage(currentMissionPage - 1)}
              onNext={() => goToMissionPage(currentMissionPage + 1)}
            />
          </>
        )}
      </ScrollView>
      )}

      {/* 미션 도감 콘텐츠 */}
      {activeTab === 'missionGroup' && (
        <>
          {/* 공식/커스텀 미션 탭 */}
          <View style={styles.groupTabContainer}>
            <SimpleTabBar
              tabs={[
                { key: 'official', label: '공식 미션' },
                { key: 'custom', label: '커스텀 미션' },
              ]}
              activeTab={missionGroupTab}
              onTabChange={handleMissionGroupTabChange}
              style={styles.groupTabBar}
            />
          </View>

          {groupLoading ? (
            <View style={styles.groupLoadingContainer}>
              <ActivityIndicator size="large" color={colors.primary[500]} />
              <Text style={styles.groupLoadingText}>미션을 불러오는 중...</Text>
            </View>
          ) : (
            <MissionGroupList
              missions={groupMissions}
              missionGroupTab={missionGroupTab}
              selectedMission={selectedGroupMission}
              currentUserId={currentUserId}
              currentServerPage={currentServerPage}
              totalServerPages={totalServerPages}
              refreshing={refreshing}
              onMissionSelect={(mission) => setSelectedGroupMission(mission)}
              onServerPageChange={handleServerPageChange}
              onNavigateToCreate={() => navigation.navigate('CustomMissionCreate' as any)}
              onRefresh={onRefresh}
              getVerificationTypeLabel={getVerificationTypeLabel}
              getVerificationTypeIcon={getVerificationTypeIcon}
              getMissionCategoryLabel={getMissionCategoryLabel}
            />
          )}
        </>
      )}

      {/* 미션 상세 정보 모달 */}
      <MissionInfoModal
        visible={selectedGroupMission !== null && (missionGroupTab === 'custom' || (missionGroupTab === 'official' && selectedGroupMission !== null && (selectedGroupMission.isCompleted === true || selectedGroupMission.isAttempted === true)))}
        mission={selectedGroupMission}
        missionGroupTab={missionGroupTab}
        currentUserId={currentUserId}
        onClose={() => setSelectedGroupMission(null)}
        navigation={navigation}
        getVerificationTypeLabel={getVerificationTypeLabel}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topTabContainer: {
    paddingHorizontal: spacing[3],
    paddingTop: spacing[2],
    paddingBottom: spacing[1],
  },
  topTabBar: {
    marginBottom: 0,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    marginBottom: spacing[4],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize['2xl']),
  },
  tabBar: {
    marginBottom: spacing[4],
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[20], // 하단 탭바 높이 + 여유 공간
  },
  missionList: {
    gap: spacing[1],
  },
  // 페이지네이션 관련 스타일
  missionPageContainer: {
    width: SCREEN_WIDTH - spacing[8],
    gap: spacing[1],
  },
  // 미션 도감 관련 스타일
  groupTabContainer: {
    paddingHorizontal: spacing[3],
    paddingTop: spacing[1],
    paddingBottom: spacing[1],
  },
  groupTabBar: {
    marginBottom: 0,
  },
  groupLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[8],
  },
  groupLoadingText: {
    marginTop: spacing[3],
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  groupInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.base,
    padding: spacing[3],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.primary[200],
    gap: spacing[4],
  },
  groupLogoIcon: {
    width: 24,
    height: 24,
  },
  groupInfoText: {
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
  groupInlineDetailContainer: {
    marginTop: spacing[2],
    marginBottom: spacing[3],
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[400],
    marginLeft: spacing[2],
    paddingLeft: spacing[3],
  },
  groupInlineDetailCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  groupDetailTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[4],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  groupDetailRow: {
    marginBottom: spacing[3],
  },
  groupDetailLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  groupDetailValue: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  groupDetailButton: {
    flex: 1,
    backgroundColor: colors.green[500],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  groupDetailButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  groupDetailButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[4],
  },
  editMissionButton: {
    backgroundColor: colors.gray[200],
    padding: spacing[3],
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editMissionIcon: {
    width: 20,
    height: 20,
    tintColor: colors.gray[600],
  },
});

export default MissionScreen;
