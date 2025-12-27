/**
 * 커뮤니티 게시판 목록 화면
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Modal } from 'react-native';
import { useCommunity } from '../hooks/useCommunity';
import { PostCard } from '../components/specialized';
import { Loading, ErrorBoundary, EmptyState } from '../components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '../utils/designTokens';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

interface CommunityScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

type CommunityTab = 'all' | 'mission-group';

const CommunityScreen: React.FC<CommunityScreenProps> = ({ navigation }) => {
  const { posts, loading, error, toggleLike, toggleScrap } = useCommunity();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'popular'>('all');
  const [activeTab, setActiveTab] = useState<CommunityTab>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const filterOptions = [
    { value: 'all', label: '전체' },
    { value: 'popular', label: '인기' },
  ];

  const selectedFilterLabel = filterOptions.find(opt => opt.value === filter)?.label || '전체';

  // 검색 및 필터링
  const filteredPosts = useMemo(() => {
    let filtered = posts;

    // 검색
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        post =>
          post.title.toLowerCase().includes(lowerQuery) ||
          post.content.toLowerCase().includes(lowerQuery) ||
          post.mission_title.toLowerCase().includes(lowerQuery)
      );
    }

    // 필터링
    if (filter === 'popular') {
      // 인기 게시글: 좋아요 + 댓글 수가 높은 순으로 정렬
      filtered = [...filtered].sort((a, b) => {
        const aScore = a.like_count + a.comment_count;
        const bScore = b.like_count + b.comment_count;
        return bScore - aScore;
      });
    } else {
      // 전체: 최신순으로 정렬
      filtered = [...filtered].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return filtered;
  }, [posts, searchQuery, filter]);

  const handlePostPress = (postId: string) => {
    navigation.navigate('CommunityPostDetail', { postId });
  };

  const handleLike = async (postId: string) => {
    await toggleLike(postId);
  };

  const handleScrap = async (postId: string) => {
    await toggleScrap(postId);
  };

  if (loading) {
    return <Loading text="게시글을 불러오는 중..." />;
  }

  if (error) {
    return <ErrorBoundary error={error} />;
  }

  // 미션 그룹 화면으로 이동
  const handleMissionGroupPress = () => {
    navigation.navigate('MissionGroup');
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>커뮤니티</Text>
      </View>

      {/* 탭 */}
      <View style={styles.tabContainer}>
        <View style={styles.tabWrapper}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.tabActive]}
            onPress={() => setActiveTab('all')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
              전체 게시판
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'mission-group' && styles.tabActive]}
            onPress={handleMissionGroupPress}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'mission-group' && styles.tabTextActive]}>
              미션 그룹
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 검색 및 정렬 */}
      {activeTab === 'all' && (
        <View style={styles.filterContainer}>
          <View style={styles.searchContainer}>
            <Image
              source={require('../assets/images/search.png')}
              style={styles.searchIcon}
              resizeMode="contain"
            />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="게시글 검색..."
              placeholderTextColor={colors.text.tertiary}
            />
          </View>
          <TouchableOpacity
            style={styles.filterSelector}
            onPress={() => setShowFilterModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.filterSelectorText}>{selectedFilterLabel}</Text>
            <Text style={styles.filterSelectorIcon}>▼</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'all' && (
      <ScrollView style={styles.content}>
        {filteredPosts.length === 0 ? (
          <EmptyState
            iconImage={require('../assets/images/notes.png')}
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
                onScrap={handleScrap}
              />
            ))}
          </View>
        )}
      </ScrollView>
      )}

      {/* 필터 모달 */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>필터 선택</Text>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterOption,
                  filter === option.value && styles.filterOptionActive,
                ]}
                onPress={() => {
                  setFilter(option.value as 'all' | 'popular');
                  setShowFilterModal(false);
                }}
                activeOpacity={0.7}
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
                  <Text style={styles.filterOptionCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    backgroundColor: colors.background.primary,
    paddingTop: spacing[16],
    paddingBottom: spacing[4],
    paddingHorizontal: spacing[5],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
  },
  tabContainer: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  tabWrapper: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.xl,
    padding: spacing[1],
  },
  tab: {
    flex: 1,
    paddingVertical: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    minHeight: 40,
  },
  tabActive: {
    backgroundColor: colors.green[500],
    ...shadows.sm,
  },
  tabText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
  },
  filterContainer: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: spacing[2],
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    padding: 0,
  },
  filterSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
    minHeight: 44,
  },
  filterSelectorText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  filterSelectorIcon: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginLeft: spacing[2],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    width: '80%',
    maxWidth: 300,
    ...shadows.lg,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.md,
    marginBottom: spacing[2],
    backgroundColor: colors.gray[50],
  },
  filterOptionActive: {
    backgroundColor: colors.green[50],
  },
  filterOptionText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  filterOptionTextActive: {
    color: colors.green[700],
    fontWeight: typography.fontWeight.semibold,
  },
  filterOptionCheck: {
    fontSize: typography.fontSize.base,
    color: colors.green[600],
    fontWeight: typography.fontWeight.bold,
  },
  content: {
    flex: 1,
    padding: spacing[4],
  },
  postsList: {
    gap: spacing[3],
  },
});

export default CommunityScreen;

