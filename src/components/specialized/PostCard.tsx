import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ViewStyle } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { CommunityPost } from '../../types';

interface PostCardProps {
  post: CommunityPost;
  onPress?: (postId: string) => void;
  onLike?: (postId: string) => void;
  style?: ViewStyle;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onPress,
  onLike,
  style
}) => {
  if (!post) return null;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress?.(post.post_id)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{post.author_nickname}</Text>
          {post.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{post.category}</Text>
            </View>
          )}
        </View>
        <Text style={styles.date}>{formatDate(post.created_at)}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.missionInfo}>
          <Text style={styles.missionEmoji}>{post.mission_emoji}</Text>
          <Text style={styles.missionTitle}>{post.mission_title}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {post.title}
        </Text>
        <Text style={styles.text} numberOfLines={3}>
          {post.content}
        </Text>
      </View>

      {post.images && post.images.length > 0 && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: post.images[0] }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        </View>
      )}

      {post.tags && post.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {post.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.stats}>
          <TouchableOpacity
            style={styles.statButton}
            onPress={(e) => {
              e.stopPropagation();
              onLike?.(post.post_id);
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.statIcon, post.is_liked && styles.likedIcon]}>
              {post.is_liked ? '❤️' : '🤍'}
            </Text>
            <Text style={styles.statText}>{post.like_count}</Text>
          </TouchableOpacity>

          <View style={styles.statButton}>
            <Text style={styles.statIcon}>💬</Text>
            <Text style={styles.statText}>{post.comment_count}</Text>
          </View>

          {post.is_scrapped && (
            <View style={styles.statButton}>
              <Text style={styles.statIcon}>🔖</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginVertical: spacing[2],
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  authorName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  categoryBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[700],
    fontWeight: typography.fontWeight.medium,
  },
  date: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  content: {
    marginBottom: spacing[3],
  },
  missionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
    padding: spacing[2],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
  },
  missionEmoji: {
    fontSize: typography.fontSize.lg,
  },
  missionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[600],
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  text: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.base,
  },
  imageContainer: {
    marginBottom: spacing[3],
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: colors.background.secondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  tag: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  tagText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[600],
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing[3],
  },
  stats: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  statButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  statIcon: {
    fontSize: typography.fontSize.base,
  },
  likedIcon: {
    // 이미 이모지로 표시됨
  },
  statText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
});

export default PostCard;

