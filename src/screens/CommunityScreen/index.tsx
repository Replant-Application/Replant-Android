/**
 * 커뮤니티 게시판 목록 화면
 * 일반 게시글 + 인증글(VerificationPost) 통합 표시
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Modal, RefreshControl, ImageBackground, ActivityIndicator, Animated } from 'react-native';
import { SCREEN_NAMES } from '../../utils/constants';
import { spacing } from '../../utils/designTokens';
import { formatDateKorean } from '../../utils/dateUtils';
import { PostCard } from '../../components/specialized';
import { Loading, ErrorBoundary, EmptyState, Header, AlertModal, ConfirmModal, FilterOptionSection, RemovableChip } from '../../components/ui';
import { colors } from '../../utils/designTokens';
import { CommunityScreenProps, VerificationFilter, PostTypeFilter, PostFilter } from '../../types/screens/community';
import { FILTER_OPTIONS } from '../../constants/screens/community';
import MissionSetList from './components/MissionSetList';
import MissionSetDetailScreen from '../MissionSetDetailScreen';
import CommunityPostDetailScreen from '../CommunityPostDetailScreen';
import { useCommunityScreenContainer } from './CommunityScreen.container';
import { missionTabStyles } from '../../utils/styles';
import { styles } from './CommunityScreen.styles';

const FADE_DURATION = 150;

const CommunityScreen: React.FC<CommunityScreenProps> = ({ navigation, route }) => {
  const missionSetFadeAnim = useRef(new Animated.Value(1)).current;

  // 비즈니스 로직은 Container에서 처리
  const {
    loading,
    error,
    filteredPosts,
    missionSets,
    myMissionSets,
    searchQuery,
    filter,
    activeTab,
    showFilterModal,
    refreshing,
    verificationFilter,
    postTypeFilter,
    onlyMyPosts,
    showAlert,
    alertTitle,
    alertMessage,
    missionSetLoading,
    missionSetSearchQuery,
    missionSetSortBy,
    showMissionSetFilterModal,
    showShareModal,
    myMissionSetsLoading,
    sharingId,
    setSearchQuery,
    setFilter,
    setActiveTab,
    setShowFilterModal,
    setVerificationFilter,
    setPostTypeFilter,
    setOnlyMyPosts,
    setMissionSetSearchQuery,
    setMissionSetSortBy,
    setShowMissionSetFilterModal,
    handleOpenShareModal,
    handleShareMissionSet,
    handleHidePost,
    handlePostPress,
    handleLike,
    handleAlertClose,
    handleFilterModalClose,
    handleMissionSetFilterModalClose,
    handleShareModalClose,
    handleCreatePost,
    onRefresh,
    currentPage,
    totalPages,
    handleNextPage,
    handlePreviousPage,
    showShareConfirmModal,
    shareConfirmMissionSet,
    handleShareConfirm,
    handleShareConfirmCancel,
    handleUnshareMissionSet,
    selectedMissionSetId,
    onMissionSetPress,
    closeMissionSetDetailModal,
    selectedPostIdForModal,
    openPostInModal,
    closePostModal,
  } = useCommunityScreenContainer({ navigation, route });

  useEffect(() => {
    if (selectedMissionSetId != null) missionSetFadeAnim.setValue(1);
  }, [selectedMissionSetId, missionSetFadeAnim]);

  const handleCloseMissionSetModal = () => {
    Animated.timing(missionSetFadeAnim, {
      toValue: 0,
      duration: FADE_DURATION,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        closeMissionSetDetailModal();
        missionSetFadeAnim.setValue(1);
      }
    });
  };

  if (loading) {
    return <Loading text="게시글을 불러오는 중..." />;
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
      {/* 헤더 */}
      <Header title="커뮤니티" showBackButton={false} navigation={navigation} />

      {/* 탭 - 나의 미션/미션 도감과 동일 스타일 */}
      <View style={styles.topTabContainer}>
        <View style={missionTabStyles.container()}>
          <TouchableOpacity
            style={[missionTabStyles.tab(), activeTab === 'all' && missionTabStyles.tabActive()]}
            onPress={() => setActiveTab('all')}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityLabel={activeTab === 'all' ? '전체 게시판, 선택됨' : '전체 게시판'}
            accessibilityState={{ selected: activeTab === 'all' }}
          >
            <Text
              style={[missionTabStyles.tabText(), activeTab === 'all' && missionTabStyles.tabTextActive()]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              전체 게시판
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[missionTabStyles.tab(), activeTab === 'todo-share' && missionTabStyles.tabActive()]}
            onPress={() => setActiveTab('todo-share')}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityLabel={activeTab === 'todo-share' ? '투두리스트 공유, 선택됨' : '투두리스트 공유'}
            accessibilityState={{ selected: activeTab === 'todo-share' }}
          >
            <Text
              style={[missionTabStyles.tabText(), activeTab === 'todo-share' && missionTabStyles.tabTextActive()]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              투두리스트 공유
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 검색, 필터, 게시글 목록 (전체 게시판일 때만) */}
      {activeTab === 'all' && (
        <>
          <View style={styles.filterContainer}>
            {/* 검색창과 필터 버튼 */}
            <View style={styles.searchRow}>
              <View style={styles.searchContainer}>
                <Image
                  source={require('../../assets/images/search.png')}
                  style={styles.searchIcon}
                  resizeMode="contain"
                  accessibilityLabel="검색 아이콘"
                  accessibilityElementsHidden={true}
                />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="게시글 검색..."
                  placeholderTextColor={colors.text.tertiary}
                  accessibilityLabel="게시글 검색"
                  accessibilityHint="게시글을 검색하려면 입력하세요"
                  allowFontScaling={true}
                />
              </View>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowFilterModal(true)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="필터"
                accessibilityHint="게시글 필터 옵션 열기"
                accessibilityState={{ selected: verificationFilter !== 'all' || filter !== 'latest' || onlyMyPosts }}
              >
                <Image
                  source={require('../../assets/images/filter.png')}
                  style={styles.filterIcon}
                  resizeMode="contain"
                  accessibilityLabel="필터 아이콘"
                  accessibilityElementsHidden={true}
                />
                {(verificationFilter !== 'all' || filter !== 'latest' || onlyMyPosts) && (
                  <View style={styles.filterBadge} accessibilityElementsHidden={true} />
                )}
              </TouchableOpacity>
            </View>

            {/* 인증 상태 칩 (선택된 경우에만 표시) */}
            {verificationFilter !== 'all' && (
              <View style={styles.chipContainer}>
                <RemovableChip
                  label={verificationFilter === 'pending' ? '인증대기' : '인증완료'}
                  onRemove={() => setVerificationFilter('all')}
                  accessibilityLabel={`${verificationFilter === 'pending' ? '인증대기' : '인증완료'} 필터 제거`}
                />
              </View>
            )}
          </View>

          <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
          />
        }
      >
        {filteredPosts.length === 0 ? (
          <EmptyState
            iconImage={require('../../assets/images/notes.png')}
            title="아직 게시글이 없어요"
            description="미션을 완료하고 커뮤니티에 공유해보세요!"
          />
        ) : (
          <>
            <View style={styles.postsList}>
              {filteredPosts.map(post => (
                <PostCard
                  key={post.post_id}
                  post={post}
                  onPress={handlePostPress}
                  onLike={handleLike}
                  onHide={handleHidePost}
                />
              ))}
            </View>
            
            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <View style={styles.paginationContainer}>
                <TouchableOpacity
                  style={[styles.paginationButton, currentPage === 0 && styles.paginationButtonDisabled]}
                  onPress={handlePreviousPage}
                  disabled={currentPage === 0}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="이전 페이지"
                  accessibilityState={{ disabled: currentPage === 0 }}
                >
                  <Text style={[styles.paginationButtonText, currentPage === 0 && styles.paginationButtonTextDisabled]}>
                    이전
                  </Text>
                </TouchableOpacity>
                
                <Text style={styles.paginationInfo}>
                  {currentPage + 1} / {totalPages}
                </Text>
                
                <TouchableOpacity
                  style={[styles.paginationButton, currentPage >= totalPages - 1 && styles.paginationButtonDisabled]}
                  onPress={handleNextPage}
                  disabled={currentPage >= totalPages - 1}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="다음 페이지"
                  accessibilityState={{ disabled: currentPage >= totalPages - 1 }}
                >
                  <Text style={[styles.paginationButtonText, currentPage >= totalPages - 1 && styles.paginationButtonTextDisabled]}>
                    다음
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
          </ScrollView>
        </>
      )}

      {/* 투두 공유 탭 콘텐츠 */}
      {activeTab === 'todo-share' && (
        <MissionSetList
          missionSets={missionSets}
          loading={missionSetLoading}
          searchQuery={missionSetSearchQuery}
          onSearchChange={setMissionSetSearchQuery}
          onFilterPress={() => setShowMissionSetFilterModal(true)}
          refreshing={refreshing}
          onRefresh={onRefresh}
          navigation={navigation}
          onMissionSetPress={onMissionSetPress}
          onUnshare={handleUnshareMissionSet}
        />
      )}

      {/* GENERAL 글쓰기 FAB */}
      {activeTab === 'all' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreatePost}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="게시글 작성"
          accessibilityHint="새 게시글을 작성합니다"
        >
          <Image
            source={require('../../assets/images/pencil.png')}
            style={styles.fabIconImage}
            resizeMode="contain"
            accessibilityLabel="게시글 작성 아이콘"
            accessibilityElementsHidden={true}
          />
        </TouchableOpacity>
      )}

      {/* 투두리스트 공유 FAB */}
      {activeTab === 'todo-share' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleOpenShareModal}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="투두리스트 공유"
          accessibilityHint="내 투두리스트를 공유합니다"
          accessibilityState={{ disabled: myMissionSetsLoading }}
          disabled={myMissionSetsLoading}
        >
          <Image
            source={require('../../assets/images/pencil.png')}
            style={styles.fabIconImage}
            resizeMode="contain"
            accessibilityLabel="게시글 작성 아이콘"
            accessibilityElementsHidden={true}
          />
        </TouchableOpacity>
      )}

      {/* 미션세트 상세 모달 (전체 화면 아님 - 하단 탭 바 노출·터치 가능) */}
      <Modal
        visible={selectedMissionSetId != null}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseMissionSetModal}
      >
        {selectedMissionSetId != null && (
          <Animated.View style={[styles.modalMissionSetDetailWrap, { opacity: missionSetFadeAnim }]}>
            <View style={styles.modalMissionSetDetailContent}>
              <MissionSetDetailScreen
                navigation={{
                  ...navigation,
                  goBack: handleCloseMissionSetModal,
                  openPostInModal,
                } as any}
                route={{ params: { missionSetId: selectedMissionSetId } } as any}
              />
            </View>
            {/* 모달 내 하단 탭 바: 탭 누르면 모달 닫고 해당 화면으로 이동 */}
            <View style={styles.modalTabBar}>
              {[
                { screen: SCREEN_NAMES.HOME, label: '홈', icon: require('../../assets/images/home.png') },
                { screen: SCREEN_NAMES.MISSION, label: '미션', icon: require('../../assets/images/goal.png') },
                { screen: SCREEN_NAMES.COMMUNITY, label: '커뮤니티', icon: require('../../assets/images/chat.png') },
                { screen: SCREEN_NAMES.DIARY, label: '감정일기', icon: require('../../assets/images/books.png') },
                { screen: SCREEN_NAMES.SETTINGS, label: '설정', icon: require('../../assets/images/settings.png') },
              ].map(({ screen, label, icon }) => (
                <TouchableOpacity
                  key={screen}
                  style={[styles.modalTab, screen === SCREEN_NAMES.COMMUNITY && styles.modalTabActive]}
                  onPress={() => {
                    closeMissionSetDetailModal();
                    (navigation as any).navigate(screen, screen === SCREEN_NAMES.COMMUNITY ? { activeTab: 'todo-share' } : undefined);
                  }}
                  activeOpacity={0.7}
                  accessibilityRole="tab"
                  accessibilityLabel={label}
                >
                  <Image
                    source={icon}
                    style={[styles.modalTabIcon, screen === SCREEN_NAMES.COMMUNITY && styles.modalTabIconActive]}
                    resizeMode="contain"
                  />
                  <Text style={[styles.modalTabLabel, screen === SCREEN_NAMES.COMMUNITY && styles.modalTabLabelActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}
      </Modal>

      {/* 게시글 상세 모달 (투두리스트 상세에서 완료 미션 탭 시, 좋아요·댓글 동작) - 하단 탭 바 노출 */}
      <Modal
        visible={selectedPostIdForModal != null}
        animationType="slide"
        onRequestClose={closePostModal}
      >
        {selectedPostIdForModal != null && (
          <View style={styles.modalMissionSetDetailWrap}>
            <View style={styles.modalMissionSetDetailContent}>
              <CommunityPostDetailScreen
                navigation={{
                  ...navigation,
                  goBack: closePostModal,
                } as any}
                route={{ params: { postId: String(selectedPostIdForModal) } } as any}
              />
            </View>
            {/* 모달 내 하단 탭 바: 탭 누르면 모달 닫고 해당 화면으로 이동 */}
            <View style={styles.modalTabBar}>
              {[
                { screen: SCREEN_NAMES.HOME, label: '홈', icon: require('../../assets/images/home.png') },
                { screen: SCREEN_NAMES.MISSION, label: '미션', icon: require('../../assets/images/goal.png') },
                { screen: SCREEN_NAMES.COMMUNITY, label: '커뮤니티', icon: require('../../assets/images/chat.png') },
                { screen: SCREEN_NAMES.DIARY, label: '감정일기', icon: require('../../assets/images/books.png') },
                { screen: SCREEN_NAMES.SETTINGS, label: '설정', icon: require('../../assets/images/settings.png') },
              ].map(({ screen, label, icon }) => (
                <TouchableOpacity
                  key={screen}
                  style={[styles.modalTab, screen === SCREEN_NAMES.COMMUNITY && styles.modalTabActive]}
                  onPress={() => {
                    closePostModal();
                    closeMissionSetDetailModal();
                    (navigation as any).navigate(screen, screen === SCREEN_NAMES.COMMUNITY ? { activeTab: 'todo-share' } : undefined);
                  }}
                  activeOpacity={0.7}
                  accessibilityRole="tab"
                  accessibilityLabel={label}
                >
                  <Image
                    source={icon}
                    style={[styles.modalTabIcon, screen === SCREEN_NAMES.COMMUNITY && styles.modalTabIconActive]}
                    resizeMode="contain"
                  />
                  <Text style={[styles.modalTabLabel, screen === SCREEN_NAMES.COMMUNITY && styles.modalTabLabelActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </Modal>

      {/* 필터 모달 */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleFilterModalClose}
      >
          <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={handleFilterModalClose}
            accessibilityRole="button"
            accessibilityLabel="필터 모달 닫기"
          />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle} accessibilityRole="header">필터 선택</Text>

            <FilterOptionSection
              title="게시글 종류"
              options={[
                { key: 'all', label: '전체' },
                { key: 'certified', label: '인증' },
                { key: 'general', label: '일반' },
              ]}
              selected={postTypeFilter}
              onSelect={(key) => setPostTypeFilter(key as PostTypeFilter)}
              showCheckmark={false}
            />

            <FilterOptionSection
              title="정렬"
              options={FILTER_OPTIONS.map((o) => ({ key: o.value, label: o.label }))}
              selected={filter}
              onSelect={(key) => setFilter(key as PostFilter)}
              showCheckmark={false}
              sectionTitleStyle={{ marginTop: spacing[5] }}
            />

            <FilterOptionSection
              title="인증 상태"
              options={[
                { key: 'all', label: '전체' },
                { key: 'pending', label: '대기' },
                { key: 'approved', label: '완료' },
              ]}
              selected={verificationFilter}
              onSelect={(key) => setVerificationFilter(key as VerificationFilter)}
              showCheckmark={false}
              sectionTitleStyle={{ marginTop: spacing[5] }}
            />

            {/* 내가 쓴 게시글만 보기 */}
            <TouchableOpacity
              style={[styles.filterCheckboxRow, { marginTop: spacing[6] }]}
              onPress={() => setOnlyMyPosts(!onlyMyPosts)}
              activeOpacity={0.7}
              accessibilityRole="checkbox"
              accessibilityLabel="내가 쓴 게시글만 보기"
              accessibilityState={{ checked: onlyMyPosts }}
            >
              <Text style={styles.filterOptionLabel}>내가 쓴 게시글만 보기</Text>
              <View style={[styles.filterCheckboxBox, onlyMyPosts && styles.filterCheckboxBoxChecked]}>
                {onlyMyPosts && (
                  <Text style={styles.filterCheckboxCheckmark}>✓</Text>
                )}
              </View>
            </TouchableOpacity>

            {/* 적용 버튼 */}
            <TouchableOpacity
              style={styles.modalApplyButton}
              onPress={handleFilterModalClose}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="필터 적용"
            >
              <Text style={styles.modalApplyButtonText}>적용</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 투두 공유 필터 모달 */}
      <Modal
        visible={showMissionSetFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleMissionSetFilterModalClose}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={handleMissionSetFilterModalClose}
            accessibilityRole="button"
            accessibilityLabel="정렬 선택 모달 닫기"
          />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle} accessibilityRole="header">정렬 선택</Text>

            {/* 정렬 옵션 */}
            <View style={styles.filterOptionRow}>
              {[
                { value: 'latest', label: '최신순' },
                { value: 'popular', label: '인기순' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterOptionHorizontal,
                    missionSetSortBy === option.value && styles.filterOptionActive,
                  ]}
                  onPress={() => {
                    setMissionSetSortBy(option.value as 'popular' | 'latest');
                  }}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={option.label}
                  accessibilityState={{ selected: missionSetSortBy === option.value }}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      missionSetSortBy === option.value && styles.filterOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 적용 버튼 */}
            <TouchableOpacity
              style={styles.modalApplyButton}
              onPress={handleMissionSetFilterModalClose}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="필터 적용"
            >
              <Text style={styles.modalApplyButtonText}>적용</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 투두리스트 공유 모달 */}
      <Modal
        visible={showShareModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleShareModalClose}
      >
        <View style={styles.shareModalOverlay}>
          <View style={styles.shareModalContent}>
            <View style={styles.shareModalHeader}>
              <Text style={styles.shareModalTitle} accessibilityRole="header">투두리스트 공유하기</Text>
              <TouchableOpacity
                onPress={handleShareModalClose}
                style={styles.shareModalCloseButton}
                accessibilityRole="button"
                accessibilityLabel="닫기"
              >
                <Text style={styles.shareModalCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.shareModalSubtitle}>
              커뮤니티에 공유할 투두리스트를 선택하세요
            </Text>

            <ScrollView style={styles.shareModalList}>
              {myMissionSets.length === 0 ? (
                <View style={styles.shareModalEmpty}>
                  <Text style={styles.shareModalEmptyText}>
                    아직 만든 투두리스트가 없습니다.
                  </Text>
                  <Text style={styles.shareModalEmptySubtext}>
                    홈에서 투두리스트를 먼저 만들어보세요!
                  </Text>
                </View>
              ) : (
                myMissionSets.map(missionSet => (
                  <TouchableOpacity
                    key={missionSet.id}
                    style={styles.shareModalItem}
                    onPress={() => handleShareMissionSet(missionSet)}
                    disabled={sharingId === missionSet.id || missionSet.isPublic}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={missionSet.title}
                  >
                    <View style={styles.shareModalItemContent}>
                      <Text style={styles.shareModalItemTitle} numberOfLines={1}>
                        {missionSet.title}
                      </Text>
                      {missionSet.description && (
                        <Text style={styles.shareModalItemDesc} numberOfLines={1}>
                          {missionSet.description}
                        </Text>
                      )}
                      {missionSet.createdAt && (
                        <Text style={styles.shareModalItemMeta}>
                          {formatDateKorean(missionSet.createdAt)}
                        </Text>
                      )}
                    </View>
                    <View style={styles.shareModalItemAction}>
                      {sharingId === missionSet.id ? (
                        <ActivityIndicator size="small" color={colors.primary[500]} />
                      ) : (
                        <View style={[styles.shareButton, missionSet.isPublic && styles.shareButtonDisabled]}>
                          <Text style={[styles.shareButtonText, missionSet.isPublic && styles.shareButtonTextDisabled]}>공유</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      <AlertModal
        visible={showAlert}
        title={alertTitle}
        message={alertMessage}
        onClose={handleAlertClose}
      />
      <ConfirmModal
        visible={showShareConfirmModal}
        title="공유 확인"
        message={shareConfirmMissionSet ? `"${shareConfirmMissionSet.title}" 투두리스트를 공유하시겠습니까?` : ''}
        confirmText="공유"
        cancelText="취소"
        onConfirm={handleShareConfirm}
        onCancel={handleShareConfirmCancel}
        confirmButtonColor={colors.primary[500]}
      />
    </ImageBackground>
  );
};


export default CommunityScreen;

