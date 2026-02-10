import React from 'react';
import { View, Text, ScrollView, RefreshControl, ImageBackground, ActivityIndicator, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import { MissionCard, MissionVerificationModal, MissionProgressCard } from '../../components/specialized';
import { Loading, ErrorBoundary, Header, EmptyState, ConfirmModal, AlertModal } from '../../components/ui';
import MissionInfoModal from './MissionInfoModal';
import MissionPagination from './MissionPagination';
import MissionGroupList from './MissionGroupList';
import { colors, spacing } from '../../utils/designTokens';
import { missionTabStyles } from '../../utils/styles';
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
    missionCounts,
    selectedFilter,
    activeTab,
    missionGroupTab,
    showAlert,
    alertTitle,
    alertMessage,
    handleCloseAlert,
    showConfirmModal,
    confirmModalTitle,
    confirmModalMessage,
    handleConfirmModalConfirm,
    handleConfirmModalCancel,
    verificationModalVisible,
    selectedMissionForVerification,
    showCompleteModal,
    completeModalTitle,
    completeModalMessage,
    isLevelUp,
    groupMissions,
    groupLoading,
    selectedGroupMission,
    currentClientPage,
    totalClientPages,
    currentUserId,
    currentMissionPage,
    totalMissionPages,
    missionPages,
    missionFlatListRef,
    refreshing,
    handleMissionComplete,
    handleCompleteCustomMission,
    completingMissionId,
    handleMissionUncomplete,
    handleVerify,
    handleLikeVerification,
    handleDeletePhoto,
    handleCompleteModalConfirm,
    handleCompleteModalCancel,
    handleVerificationModalClose,
    handleVerificationSuccess,
    handleTabChange,
    handleFilterChange,
    handleMissionGroupTabChange,
    handleClientPageChange,
    setSelectedGroupMission,
    onRefresh,
    onMissionPageChange,
    goToMissionPage,
    missionSortBy,
    handleMissionSortChange,
    showOnlyParticipated,
    handleShowOnlyParticipatedChange,
    searchQuery,
    handleSearchQueryChange,
    titleOnly,
    handleTitleOnlyToggle,
    selectedCategory,
    handleCategoryFilterChange,
    selectedDifficulty,
    handleDifficultyFilterChange,
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
      accessibilityElementsHidden={true}
    >
      <Header title="미션" showBackButton={false} navigation={navigation} />

      {/* 나의 미션 / 미션 도감 탭 */}
      <View style={styles.topTabContainer}>
        <View style={missionTabStyles.container()}>
          <TouchableOpacity
            style={[missionTabStyles.tab(), activeTab === 'myMission' && missionTabStyles.tabActive()]}
            onPress={() => handleTabChange('myMission')}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityLabel={activeTab === 'myMission' ? '나의 미션, 선택됨' : '나의 미션'}
            accessibilityState={{ selected: activeTab === 'myMission' }}
          >
            <Text 
              style={[missionTabStyles.tabText(), activeTab === 'myMission' && missionTabStyles.tabTextActive()]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              나의 미션
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[missionTabStyles.tab(), activeTab === 'missionGroup' && missionTabStyles.tabActive()]}
            onPress={() => handleTabChange('missionGroup')}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityLabel={activeTab === 'missionGroup' ? '미션 도감, 선택됨' : '미션 도감'}
            accessibilityState={{ selected: activeTab === 'missionGroup' }}
          >
            <Text 
              style={[missionTabStyles.tabText(), activeTab === 'missionGroup' && missionTabStyles.tabTextActive()]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              미션 도감
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* useErrorHandler 오류/성공/알림 → AlertModal */}
      <AlertModal
        visible={showAlert}
        title={alertTitle}
        message={alertMessage}
        buttonText="확인"
        onClose={handleCloseAlert}
      />

      {/* useErrorHandler showConfirm → ConfirmModal (사진 삭제 등) */}
      <ConfirmModal
        visible={showConfirmModal}
        title={confirmModalTitle}
        message={confirmModalMessage}
        confirmText="확인"
        cancelText="취소"
        onConfirm={handleConfirmModalConfirm}
        onCancel={handleConfirmModalCancel}
      />

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
        {/* 진행률 카드 - 미션이 없어도 나의 진행률 표시 */}
        <MissionProgressCard
          completedMissions={completedMissions}
          totalMissions={totalMissions}
          onBadgePress={() => navigation.navigate('MyProgressDetail' as any)}
        />

        {/* 진행중/인증대기/완료 탭 - 나의 미션/미션 도감과 동일 스타일 */}
        <View style={styles.filterTabWrapper}>
          <View style={missionTabStyles.container()}>
            <TouchableOpacity
              style={[missionTabStyles.tab(), selectedFilter === 'inProgress' && missionTabStyles.tabActive()]}
              onPress={() => handleFilterChange('inProgress')}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityLabel={selectedFilter === 'inProgress' ? '진행중, 선택됨' : `진행중 ${missionCounts?.inProgress ?? 0}개`}
              accessibilityState={{ selected: selectedFilter === 'inProgress' }}
            >
              <Text
                style={[missionTabStyles.tabText(), selectedFilter === 'inProgress' && missionTabStyles.tabTextActive()]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                진행중 ({missionCounts?.inProgress ?? 0})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[missionTabStyles.tab(), selectedFilter === 'pendingVerification' && missionTabStyles.tabActive()]}
              onPress={() => handleFilterChange('pendingVerification')}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityLabel={selectedFilter === 'pendingVerification' ? '대기, 선택됨' : `대기 ${missionCounts?.pendingVerification ?? 0}개`}
              accessibilityState={{ selected: selectedFilter === 'pendingVerification' }}
            >
              <Text
                style={[missionTabStyles.tabText(), selectedFilter === 'pendingVerification' && missionTabStyles.tabTextActive()]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                대기 ({missionCounts?.pendingVerification ?? 0})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[missionTabStyles.tab(), selectedFilter === 'completed' && missionTabStyles.tabActive()]}
              onPress={() => handleFilterChange('completed')}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityLabel={selectedFilter === 'completed' ? '완료, 선택됨' : `완료 ${missionCounts?.completed ?? 0}개`}
              accessibilityState={{ selected: selectedFilter === 'completed' }}
            >
              <Text
                style={[missionTabStyles.tabText(), selectedFilter === 'completed' && missionTabStyles.tabTextActive()]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                완료 ({missionCounts?.completed ?? 0})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

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
                      onCompleteCustom={handleCompleteCustomMission}
                      onUncomplete={handleMissionUncomplete}
                      loading={loading || completingMissionId === mission.mission_id}
                      onDeletePhoto={handleDeletePhoto}
                      onWriteReview={(missionId) => navigation.navigate('MissionDetail', { 
                        missionId,
                        returnTab: (activeTab as MissionTab) === 'missionGroup' ? 'missionGroup' : 'myMission',
                        missionGroupTab: (activeTab as MissionTab) === 'missionGroup' ? missionGroupTab : undefined,
                        selectedFilter: (activeTab as MissionTab) === 'myMission' ? selectedFilter : undefined
                      })}
                      onVerify={handleVerify}
                      onViewDetails={() => navigation.navigate('MissionDetail', { 
                        missionId: mission.mission_id || String(mission.id) || '',
                        returnTab: (activeTab as MissionTab) === 'missionGroup' ? 'missionGroup' : 'myMission',
                        missionGroupTab: (activeTab as MissionTab) === 'missionGroup' ? missionGroupTab : undefined,
                        selectedFilter: (activeTab as MissionTab) === 'myMission' ? selectedFilter : undefined
                      })}
                      selectedFilter={selectedFilter}
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
            <View style={missionTabStyles.container()}>
              <TouchableOpacity
                style={[missionTabStyles.tab(), missionGroupTab === 'official' && missionTabStyles.tabActive()]}
                onPress={() => handleMissionGroupTabChange('official')}
                activeOpacity={0.7}
                accessibilityRole="tab"
                accessibilityLabel={missionGroupTab === 'official' ? '공식 미션, 선택됨' : '공식 미션'}
                accessibilityState={{ selected: missionGroupTab === 'official' }}
              >
                <Text 
                  style={[missionTabStyles.tabText(), missionGroupTab === 'official' && missionTabStyles.tabTextActive()]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  공식 미션
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[missionTabStyles.tab(), missionGroupTab === 'custom' && missionTabStyles.tabActive()]}
                onPress={() => handleMissionGroupTabChange('custom')}
                activeOpacity={0.7}
                accessibilityRole="tab"
                accessibilityLabel={missionGroupTab === 'custom' ? '커스텀 미션, 선택됨' : '커스텀 미션'}
                accessibilityState={{ selected: missionGroupTab === 'custom' }}
              >
                <Text 
                  style={[missionTabStyles.tabText(), missionGroupTab === 'custom' && missionTabStyles.tabTextActive()]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  커스텀 미션
                </Text>
              </TouchableOpacity>
            </View>
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
              currentServerPage={currentClientPage}
              totalServerPages={totalClientPages}
              refreshing={refreshing}
              sortBy={missionSortBy}
              showOnlyParticipated={showOnlyParticipated}
              searchQuery={searchQuery}
              onSearchQueryChange={handleSearchQueryChange}
              titleOnly={titleOnly}
              onTitleOnlyToggle={handleTitleOnlyToggle}
              selectedCategory={selectedCategory}
              onCategoryFilterChange={handleCategoryFilterChange}
              selectedDifficulty={selectedDifficulty}
              onDifficultyFilterChange={handleDifficultyFilterChange}
              onMissionSelect={(mission) => setSelectedGroupMission(mission)}
              onServerPageChange={handleClientPageChange}
              onNavigateToCreate={() => navigation.navigate('CustomMissionCreate' as any)}
              onRefresh={onRefresh}
              onSortChange={handleMissionSortChange}
              onShowOnlyParticipatedChange={handleShowOnlyParticipatedChange}
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
