/**
 * 커뮤니티 게시판 목록 화면
 * 일반 게시글 + 인증글(VerificationPost) 통합 표시
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Modal, RefreshControl, ImageBackground, ActivityIndicator } from 'react-native';
import { PostCard } from '../../components/specialized';
import { Loading, ErrorBoundary, EmptyState, SimpleTabBar, Header, AlertModal } from '../../components/ui';
import { colors, spacing } from '../../utils/designTokens';
import { CommunityScreenProps, CommunityTab, VerificationFilter } from '../../types/screens/community';
import { FILTER_OPTIONS } from '../../constants/screens/community';
import MissionSetList from './components/MissionSetList';
import { useCommunityScreenContainer } from './CommunityScreen.container';
import { styles } from './CommunityScreen.styles';

const CommunityScreen: React.FC<CommunityScreenProps> = ({ navigation, route }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    posts,
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
    setMissionSetSearchQuery,
    setMissionSetSortBy,
    setShowMissionSetFilterModal,
    handleOpenShareModal,
    handleShareMissionSet,
    handleHidePost,
    handlePostPress,
    handleLike,
    handleMissionGroupPress,
    handleAlertClose,
    handleFilterModalClose,
    handleMissionSetFilterModalClose,
    handleShareModalClose,
    handleCreatePost,
    onRefresh,
    renderStars,
  } = useCommunityScreenContainer({ navigation, route });

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
    >
      {/* 헤더 */}
      <Header title="커뮤니티" showBackButton={false} navigation={navigation} />

      {/* 탭 */}
      <View style={styles.tabBarContainer}>
        <SimpleTabBar
          tabs={[
            { key: 'all', label: '전체 게시판' },
            { key: 'todo-share', label: '투두 공유' },
          ]}
          activeTab={activeTab}
          onTabChange={(key) => setActiveTab(key as CommunityTab)}
          style={styles.tabBar}
        />
      </View>

      {/* 검색 및 정렬 */}
      {activeTab === 'all' && (
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
              accessibilityState={{ selected: verificationFilter !== 'all' || filter !== 'all' }}
            >
              <Image
                source={require('../../assets/images/filter.png')}
                style={styles.filterIcon}
                resizeMode="contain"
                accessibilityLabel="필터 아이콘"
                accessibilityElementsHidden={true}
              />
              {(verificationFilter !== 'all' || filter !== 'all') && (
                <View style={styles.filterBadge} accessibilityElementsHidden={true} />
              )}
            </TouchableOpacity>
          </View>

          {/* 인증 필터 칩 (선택된 경우에만 표시) */}
          {verificationFilter !== 'all' && (
            <View style={styles.chipContainer}>
              <TouchableOpacity
                style={styles.chip}
                onPress={() => setVerificationFilter('all')}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${verificationFilter === 'pending' ? '인증대기' : '인증완료'} 필터 제거`}
              >
                <Text style={styles.chipText}>
                  {verificationFilter === 'pending' ? '인증대기' : '인증완료'}
                </Text>
                <Text style={styles.chipClose} accessibilityElementsHidden={true}>×</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {activeTab === 'all' && (
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
        )}
      </ScrollView>
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
          renderStars={renderStars}
          navigation={navigation}
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
          />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>필터 선택</Text>
            
            {/* 정렬 옵션 */}
            <Text style={styles.modalSectionTitle}>정렬</Text>
            <View style={styles.filterOptionRow}>
              {FILTER_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterOptionHorizontal,
                    filter === option.value && styles.filterOptionActive,
                  ]}
                  onPress={() => {
                    setFilter(option.value);
                  }}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={option.label}
                  accessibilityState={{ selected: filter === option.value }}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      filter === option.value && styles.filterOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {filter === option.value && (
                    <Text style={styles.filterOptionCheck} accessibilityElementsHidden={true}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* 인증 상태 필터 */}
            <Text style={styles.modalSectionTitle}>인증 상태</Text>
            <View style={styles.filterOptionRow}>
              {[
                { key: 'all', label: '전체' },
                { key: 'pending', label: '인증대기' },
                { key: 'approved', label: '인증완료' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.filterOptionHorizontal,
                    verificationFilter === option.key && styles.filterOptionActive,
                  ]}
                  onPress={() => {
                    setVerificationFilter(option.key as VerificationFilter);
                  }}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={option.label}
                  accessibilityState={{ selected: verificationFilter === option.key }}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      verificationFilter === option.key && styles.filterOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {verificationFilter === option.key && (
                    <Text style={styles.filterOptionCheck} accessibilityElementsHidden={true}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

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
          />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>정렬 선택</Text>

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
                  {missionSetSortBy === option.value && (
                    <Text style={styles.filterOptionCheck} accessibilityElementsHidden={true}>✓</Text>
                  )}
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
              <Text style={styles.shareModalTitle}>투두리스트 공유하기</Text>
              <TouchableOpacity
                onPress={handleShareModalClose}
                style={styles.shareModalCloseButton}
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
                    style={[
                      styles.shareModalItem,
                      missionSet.isPublic && styles.shareModalItemShared,
                    ]}
                    onPress={() => handleShareMissionSet(missionSet)}
                    disabled={sharingId === missionSet.id || missionSet.isPublic}
                    activeOpacity={0.7}
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
                      <Text style={styles.shareModalItemMeta}>
                        {missionSet.missionCount}개 미션
                      </Text>
                    </View>
                    <View style={styles.shareModalItemAction}>
                      {sharingId === missionSet.id ? (
                        <ActivityIndicator size="small" color={colors.primary[500]} />
                      ) : missionSet.isPublic ? (
                        <View style={styles.sharedBadge}>
                          <Text style={styles.sharedBadgeText}>공유됨</Text>
                        </View>
                      ) : (
                        <View style={styles.shareButton}>
                          <Text style={styles.shareButtonText}>공유</Text>
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
    </ImageBackground>
  );
};


export default CommunityScreen;

