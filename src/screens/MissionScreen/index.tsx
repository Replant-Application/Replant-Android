import React from 'react';
import { View, Text, ScrollView, RefreshControl, ImageBackground, ActivityIndicator, Dimensions, FlatList } from 'react-native';
import { MissionCard, MissionVerificationModal, MissionProgressCard } from '../../components/specialized';
import { Loading, ErrorBoundary, Header, EmptyState, ConfirmModal, SimpleTabBar } from '../../components/ui';
import MissionInfoModal from './MissionInfoModal';
import MissionPagination from './MissionPagination';
import MissionGroupList from './MissionGroupList';
import { colors, spacing } from '../../utils/designTokens';
import { MissionScreenProps, MissionTab } from '../../types/screens/mission';
import { useMissionScreenContainer } from './MissionScreen.container';
import { styles } from './MissionScreen.styles';

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


export default MissionScreen;
