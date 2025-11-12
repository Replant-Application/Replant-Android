/**
 * 커뮤니티 게시판 목록 화면
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useCommunity } from '../hooks/useCommunity';
import { PostCard } from '../components/specialized';
import { Loading, ErrorBoundary, Header, EmptyState, FAB } from '../components/ui';
import { colors, spacing, typography } from '../utils/designTokens';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

interface CommunityScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const CommunityScreen: React.FC<CommunityScreenProps> = ({ navigation }) => {
  const { posts, loading, error, loadPosts, toggleLike } = useCommunity();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');

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

    // 정렬
    if (sortBy === 'popular') {
      filtered = [...filtered].sort((a, b) => {
        const aScore = a.like_count + a.comment_count;
        const bScore = b.like_count + b.comment_count;
        return bScore - aScore;
      });
    } else {
      filtered = [...filtered].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return filtered;
  }, [posts, searchQuery, sortBy]);

  const handlePostPress = (postId: string) => {
    navigation.navigate('CommunityPostDetail', { postId });
  };

  const handleLike = async (postId: string) => {
    await toggleLike(postId);
  };

  if (loading) {
    return <Loading text="게시글을 불러오는 중..." />;
  }

  if (error) {
    return <ErrorBoundary error={error} />;
  }

  return (
    <View style={styles.container}>
      <Header />

      {/* 검색 및 정렬 */}
      <View style={styles.filterContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="검색..."
            placeholderTextColor={colors.text.tertiary}
          />
        </View>
        <View style={styles.sortContainer}>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'latest' && styles.sortButtonActive]}
            onPress={() => setSortBy('latest')}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === 'latest' && styles.sortButtonTextActive,
              ]}
            >
              최신순
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'popular' && styles.sortButtonActive]}
            onPress={() => setSortBy('popular')}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === 'popular' && styles.sortButtonTextActive,
              ]}
            >
              인기순
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {filteredPosts.length === 0 ? (
          <EmptyState
            icon="📝"
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
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  filterContainer: {
    padding: spacing[4],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  searchContainer: {
    marginBottom: spacing[3],
  },
  searchInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  sortContainer: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  sortButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
  },
  sortButtonActive: {
    backgroundColor: colors.primary[600],
  },
  sortButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  sortButtonTextActive: {
    color: colors.white,
  },
  content: {
    flex: 1,
    padding: spacing[4],
  },
  postsList: {
    gap: spacing[2],
  },
});

export default CommunityScreen;

