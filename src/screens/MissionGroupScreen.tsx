/**
 * 미션 그룹 화면
 * 내가 완료한 미션별 완료자 게시판
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { Header, Loading, ErrorBoundary, EmptyState } from '../components/ui';
import { PostCard } from '../components/specialized';
import { colors, spacing, typography, borderRadius } from '../utils/designTokens';
import { getMissionGroups, getPostsByMission } from '../api/communityApi';
import { MissionGroup, CommunityPost } from '../types';

interface MissionGroupScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const MissionGroupScreen: React.FC<MissionGroupScreenProps> = ({ navigation }) => {
  const [missionGroups, setMissionGroups] = useState<MissionGroup[]>([]);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 미션 그룹 목록 로드
  const loadMissionGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getMissionGroups();
      if (result.success && result.data) {
        setMissionGroups(result.data);
      } else {
        setError(result.error || '미션 그룹을 불러올 수 없습니다.');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 특정 미션의 게시글 로드
  const loadPostsByMission = async (missionId: string) => {
    try {
      setPostsLoading(true);
      const result = await getPostsByMission(missionId);
      if (result.success && result.data) {
        setPosts(result.data);
      }
    } catch (err) {
      console.error('게시글 로드 오류:', err);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    loadMissionGroups();
  }, []);

  // 미션 선택 시 게시글 로드
  useEffect(() => {
    if (selectedMissionId) {
      loadPostsByMission(selectedMissionId);
    } else {
      setPosts([]);
    }
  }, [selectedMissionId]);

  const handlePostPress = (postId: string) => {
    navigation.navigate('CommunityPostDetail', { postId });
  };

  const handleLike = async (postId: string) => {
    // 좋아요 기능은 CommunityPostDetail에서 처리
    navigation.navigate('CommunityPostDetail', { postId });
  };

  const handleScrap = async (postId: string) => {
    // 스크랩 기능은 CommunityPostDetail에서 처리
    navigation.navigate('CommunityPostDetail', { postId });
  };

  if (loading) {
    return <Loading text="미션 그룹을 불러오는 중..." />;
  }

  if (error) {
    return <ErrorBoundary error={error} />;
  }

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView style={styles.content}>
        {missionGroups.length === 0 ? (
          <EmptyState
            icon="🎯"
            title="완료한 미션이 없어요"
            description="미션을 완료하면 같은 미션을 완료한 사람들과 소통할 수 있어요!"
          />
        ) : (
          <>
            {/* 미션 그룹 목록 */}
            <View style={styles.missionGroupsContainer}>
              <Text style={styles.sectionTitle}>내가 완료한 미션</Text>
              {missionGroups.map((group) => (
                <TouchableOpacity
                  key={group.mission_id}
                  style={[
                    styles.missionGroupCard,
                    selectedMissionId === group.mission_id && styles.missionGroupCardSelected,
                  ]}
                  onPress={() => {
                    setSelectedMissionId(
                      selectedMissionId === group.mission_id ? null : group.mission_id
                    );
                  }}
                >
                  <View style={styles.missionGroupHeader}>
                    <Text style={styles.missionEmoji}>{group.mission_emoji}</Text>
                    <View style={styles.missionGroupInfo}>
                      <Text style={styles.missionTitle}>{group.mission_title}</Text>
                      <Text style={styles.missionStats}>
                        멤버 {group.member_count}명 · 게시글 {group.post_count}개
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* 선택된 미션의 게시글 목록 */}
            {selectedMissionId && (
              <View style={styles.postsContainer}>
                <Text style={styles.sectionTitle}>
                  {missionGroups.find((g) => g.mission_id === selectedMissionId)?.mission_title} 게시판
                </Text>
                {postsLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary[500]} />
                  </View>
                ) : posts.length === 0 ? (
                  <EmptyState
                    icon="📝"
                    title="아직 게시글이 없어요"
                    description="첫 번째 게시글을 작성해보세요!"
                  />
                ) : (
                  <View style={styles.postsList}>
                    {posts.map((post) => (
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
              </View>
            )}
          </>
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
  content: {
    flex: 1,
    padding: spacing[5],
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  missionGroupsContainer: {
    marginBottom: spacing[6],
  },
  missionGroupCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  missionGroupCardSelected: {
    borderColor: colors.primary[500],
    borderWidth: 2,
    backgroundColor: colors.primary[50],
  },
  missionGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  missionEmoji: {
    fontSize: typography.fontSize['2xl'],
    marginRight: spacing[3],
  },
  missionGroupInfo: {
    flex: 1,
  },
  missionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  missionStats: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  postsContainer: {
    marginTop: spacing[6],
  },
  loadingContainer: {
    padding: spacing[8],
    alignItems: 'center',
  },
  postsList: {
    gap: spacing[3],
  },
});

export default MissionGroupScreen;

