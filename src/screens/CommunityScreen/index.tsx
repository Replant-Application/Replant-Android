/**
 * 커뮤니티 게시판 목록 화면
 * 일반 게시글 + 인증글(VerificationPost) 통합 표시
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Modal, RefreshControl, Platform, ImageBackground, ActivityIndicator } from 'react-native';
import { PostCard } from '../../components/specialized';
import { Loading, ErrorBoundary, EmptyState, SimpleTabBar, Header, AlertModal } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { CommunityScreenProps, CommunityTab, VerificationFilter } from '../../types/screens/community';
import { FILTER_OPTIONS } from '../../constants/screens/community';
import MissionSetList from './components/MissionSetList';
import { useCommunityScreenContainer } from './CommunityScreen.container';

const CommunityScreen: React.FC<CommunityScreenProps> = ({ navigation }) => {
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
    handleCopyMissionSet,
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
  } = useCommunityScreenContainer({ navigation });

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
          onCopyMissionSet={handleCopyMissionSet}
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
          <Text style={styles.fabText}>+</Text>
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
            {FILTER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterOption,
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

            {/* 인증 상태 필터 */}
            <Text style={styles.modalSectionTitle}>인증 상태</Text>
            {[
              { key: 'all', label: '전체' },
              { key: 'pending', label: '인증대기' },
              { key: 'approved', label: '인증완료' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterOption,
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
            {[
              { value: 'popular', label: '인기순' },
              { value: 'latest', label: '최신순' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterOption,
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBarContainer: {
    paddingHorizontal: spacing[3],
    paddingTop: spacing[2],
    paddingBottom: spacing[3],
  },
  tabBar: {
    marginBottom: 0,
  },
  filterContainer: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[1],
    paddingBottom: spacing[3],

  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderWidth: 1,
    borderColor: '#D4A574',
  },
  filterButton: {
    backgroundColor: '#8B6F47',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#D4A574',
  },
  filterIcon: {
    width: 26,
    height: 26,
    tintColor: colors.white,
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.white,
  },
  chipContainer: {
    flexDirection: 'row',
    marginTop: spacing[2],
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[100],
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderWidth: 1,
    borderColor: colors.primary[500],
    gap: spacing[1],
  },
  chipText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[700],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  chipClose: {
    fontSize: typography.fontSize.base,
    color: colors.primary[700],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: 16,
  },
  searchIcon: {
    width: 16,
    height: 16,
    marginRight: spacing[2],
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    padding: 0,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  filterSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
    alignSelf: 'flex-start',
  },
  filterSelectorText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  filterSelectorIcon: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginLeft: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    width: '85%',
    maxWidth: 350,
    borderWidth: 1,
    borderColor: colors.border.light,
    maxHeight: '80%',
    zIndex: 1,
    elevation: 5,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[4],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xl),
  },
  modalSectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginTop: spacing[4],
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.base,
    marginBottom: spacing[2],
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  filterOptionActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  filterOptionText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  filterOptionTextActive: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  filterOptionCheck: {
    fontSize: typography.fontSize.base,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  modalApplyButton: {
    marginTop: spacing[6],
    paddingVertical: spacing[3],
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.base,
    alignItems: 'center',
  },
  modalApplyButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  content: {
    flex: 1,
    padding: spacing[4],
    paddingBottom: spacing[20], // 하단 탭바 높이 + 여유 공간
  },
  postsList: {
    gap: spacing[3],
    paddingBottom: spacing[16], // 추가 하단 여백
  },
  fab: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 100,
  },
  fabIcon: {
    fontSize: 28,
    color: colors.white,
    fontWeight: '300',
    lineHeight: 32,
  },
  fabIconImage: {
    width: 24,
    height: 24,
    tintColor: colors.white,
  },
  fabText: {
    fontSize: 28,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
    marginTop: -2,
  },
  // 투두 공유 관련 스타일
  missionSetFilterContainer: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[1],
    paddingBottom: spacing[3],
  },
  missionSetSearchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    borderWidth: 1,
    borderColor: '#D4A574',
  },
  missionSetList: {
    gap: spacing[3],
    paddingBottom: spacing[16],
  },
  missionSetCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  missionSetCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  missionSetTitle: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginRight: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  copyButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: borderRadius.base,
  },
  copyButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  missionSetDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[3],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  missionSetMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  metaText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  metaDot: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginHorizontal: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  missionSetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[2],
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  stars: {
    fontSize: typography.fontSize.sm,
    color: colors.warning,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  ratingText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  addedCount: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  // 투두리스트 공유 모달 스타일
  shareModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  shareModalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
    paddingBottom: spacing[6],
  },
  shareModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  shareModalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
  },
  shareModalCloseButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareModalCloseText: {
    fontSize: 28,
    color: colors.text.secondary,
    lineHeight: 28,
  },
  shareModalSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
  },
  shareModalList: {
    paddingHorizontal: spacing[4],
  },
  shareModalEmpty: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  shareModalEmptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
  },
  shareModalEmptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
  },
  shareModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  shareModalItemShared: {
    backgroundColor: colors.gray[50],
    borderColor: colors.gray[200],
  },
  shareModalItemContent: {
    flex: 1,
    marginRight: spacing[3],
  },
  shareModalItemTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
  },
  shareModalItemDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
  },
  shareModalItemMeta: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
  },
  shareModalItemAction: {
    minWidth: 60,
    alignItems: 'center',
  },
  sharedBadge: {
    backgroundColor: colors.gray[200],
    paddingVertical: spacing[1.5],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.full,
  },
  sharedBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
  },
  shareButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.md,
  },
  shareButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
  },
});

export default CommunityScreen;

