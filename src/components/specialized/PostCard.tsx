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
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorAvatarText}>
              {post.author_nickname.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.authorName}>{post.author_nickname}</Text>
            {post.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{post.category}</Text>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.date}>{formatDate(post.created_at)}</Text>
      </View>

      <View style={styles.content}>
        {post.mission_title && (
          <View style={styles.missionInfo}>
            <Text style={styles.missionEmoji}>{post.mission_emoji || '🎯'}</Text>
            <Text style={styles.missionTitle} numberOfLines={1}>
              {post.mission_title}
            </Text>
          </View>
        )}
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
            <Text style={[styles.statText, post.is_liked && styles.statTextActive]}>
              {post.like_count}
            </Text>
          </TouchableOpacity>

          <View style={styles.statButton}>
            <Text style={styles.statIcon}>💬</Text>
            <Text style={styles.statText}>{post.comment_count}</Text>
          </View>

          <TouchableOpacity
            style={styles.statButton}
            onPress={(e) => {
              e.stopPropagation();
              onScrap?.(post.post_id);
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.statIcon, post.is_scrapped && styles.scrappedIcon]}>
              {post.is_scrapped ? '🔖' : '📌'}
            </Text>
            {post.scrap_count > 0 && (
              <Text style={[styles.statText, post.is_scrapped && styles.statTextActive]}>
                {post.scrap_count}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    marginBottom: spacing[3],
    borderWidth: 0,
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[4],
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.green[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorAvatarText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  authorName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  categoryBadge: {
    backgroundColor: colors.green[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    color: colors.green[700],
    fontWeight: typography.fontWeight.medium,
  },
  date: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing[1],
  },
  content: {
    marginBottom: spacing[4],
  },
  missionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.green[50],
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.green[500],
  },
  missionEmoji: {
    fontSize: typography.fontSize.xl,
  },
  missionTitle: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.green[700],
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[2],
    lineHeight: typography.lineHeight.tight * typography.fontSize.xl,
  },
  text: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  imageContainer: {
    marginBottom: spacing[4],
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
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
    marginBottom: spacing[4],
  },
  tag: {
    backgroundColor: colors.green[50],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.green[200],
  },
  tagText: {
    fontSize: typography.fontSize.xs,
    color: colors.green[700],
    fontWeight: typography.fontWeight.medium,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing[3],
  },
  stats: {
    flexDirection: 'row',
    gap: spacing[6],
  },
  statButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    borderRadius: borderRadius.md,
  },
  statIcon: {
    fontSize: typography.fontSize.lg,
  },
  likedIcon: {
    // 이미 이모지로 표시됨
  },
  statText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  statTextActive: {
    color: colors.green[600],
    fontWeight: typography.fontWeight.semibold,
  },
});

export default PostCard;
