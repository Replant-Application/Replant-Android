import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ViewStyle, Modal, Alert, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { CommunityPost } from '../../types';
import { formatTimeAgo } from '../../utils/dateUtils';
import { useUser } from '../../contexts/UserContext';

interface PostCardProps {
  post: CommunityPost;
  currentUserId?: string | number; // string (레거시) 또는 number 지원
  onPress?: (postId: string) => void;
  onLike?: (postId: string) => void;
  onScrap?: (postId: string) => void;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onHide?: (postId: string) => void;
  style?: ViewStyle;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserId,
  onPress,
  onLike,
  onScrap,
  onEdit,
  onDelete,
  onHide,
  style
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const { currentUserId: contextUserId } = useUser();
  
  // 본인 게시글인지 확인 (백엔드에서 제공하는 isAuthor 필드 사용)
  // 로그인한 경우에만 isAuthor가 올바르게 설정됨
  const isOwnPost = post.isAuthor === true;
  
  // 인증되지 않은 게시글인지 확인 (verified가 false이거나 undefined인 경우)
  const canEditDelete = isOwnPost && !post.verified;

  const handleEdit = () => {
    setShowMenu(false);
    onEdit?.(post.post_id);
  };

  const handleDelete = () => {
    setShowMenu(false);
    Alert.alert(
      '게시글 삭제',
      '정말 이 게시글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => onDelete?.(post.post_id)
        }
      ]
    );
  };

  const handleHide = () => {
    setShowMenu(false);
    Alert.alert(
      '게시글 숨기기',
      '이 게시글을 숨기시겠습니까? 숨긴 게시글은 목록에서 보이지 않습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '숨기기',
          onPress: () => onHide?.(post.post_id)
        }
      ]
    );
  };
  if (!post) return null;

  // formatDate는 formatTimeAgo의 longFormat 버전 사용

  // 접근성 라벨 생성
  const getAccessibilityLabel = () => {
    let label = `${post.author_nickname}의 게시글, ${post.title}`;
    if (post.mission_title) {
      label += `, ${post.mission_title} 미션`;
    }
    if (post.verified === true) {
      label += ', 인증완료';
    } else if (post.verified === false) {
      label += ', 인증대기';
    }
    return label;
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress?.(post.post_id)}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={getAccessibilityLabel()}
    >
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorAvatarText}>
              {post.author_nickname.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.authorNameContainer}>
            <Text style={styles.authorName}>{post.author_nickname}</Text>
            {post.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{post.category}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.date}>{formatTimeAgo(post.created_at, { longFormat: true })}</Text>
          {!isOwnPost && onHide && (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={(e) => {
                e.stopPropagation();
                setShowMenu(true);
              }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="게시글 메뉴"
              accessibilityHint="게시글 숨기기 옵션"
            >
              <Text style={styles.menuIcon}>⋮</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 수정/삭제 메뉴 */}
      {showMenu && (
        <>
          <TouchableOpacity
            style={styles.menuOverlay}
            activeOpacity={1}
            onPress={() => setShowMenu(false)}
          />
          <View style={styles.menuContainer}>
            {canEditDelete && (
              <>
                <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
                  <Text style={styles.menuItemIcon}>✏️</Text>
                  <Text style={styles.menuItemText}>수정</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
                  <Text style={styles.menuItemIcon}>🗑️</Text>
                  <Text style={[styles.menuItemText, styles.deleteText]}>삭제</Text>
                </TouchableOpacity>
              </>
            )}
            {!isOwnPost && onHide && (
              <>
                {canEditDelete && <View style={styles.menuDivider} />}
                <TouchableOpacity style={styles.menuItem} onPress={handleHide}>
                  <Text style={styles.menuItemIcon}>🚫</Text>
                  <Text style={styles.menuItemText}>숨기기</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </>
      )}

      <View style={styles.content}>
        {post.mission_title && post.mission_title !== 'undefined' && (
          <View style={styles.missionInfo}>
            <Image
              source={require('../../assets/images/goal.png')}
              style={styles.missionEmojiImage}
              resizeMode="contain"
              accessibilityLabel="미션 아이콘"
            />
            <Text style={styles.missionTitle} numberOfLines={1}>
              {post.mission_title}
            </Text>
            {/* 인증 상태 뱃지 */}
            {post.verified === true ? (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedIcon}>✓</Text>
                <Text style={styles.verifiedText}>인증완료</Text>
              </View>
            ) : post.verified === false ? (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingIcon}>⏳</Text>
                <Text style={styles.pendingText}>인증대기</Text>
              </View>
            ) : null}
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
            accessibilityLabel={`${post.title} 이미지`}
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
            accessibilityRole="button"
            accessibilityLabel={post.is_liked ? `좋아요 취소, ${post.like_count}개` : `좋아요, ${post.like_count}개`}
            accessibilityState={{ selected: post.is_liked }}
          >
            {post.is_liked ? (
              <Text style={[styles.statIcon, styles.likedIcon]}>❤️</Text>
            ) : (
              <Image
                source={require('../../assets/images/heart.png')}
                style={styles.statIconImage}
                resizeMode="contain"
                accessibilityElementsHidden={true}
              />
            )}
            <Text style={[styles.statText, post.is_liked && styles.statTextActive]}>
              {post.like_count}
            </Text>
          </TouchableOpacity>

          <View style={styles.statButton} accessibilityRole="text" accessibilityLabel={`댓글 ${post.comment_count}개`}>
            <Image
              source={require('../../assets/images/say.png')}
              style={styles.statIconImage}
              resizeMode="contain"
              accessibilityElementsHidden={true}
            />
            <Text style={styles.statText}>{post.comment_count}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[3],
    marginBottom: spacing[1],
    borderWidth: 4,
    borderColor: '#0E0F37',
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
    flex: 1,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorAvatarText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.white,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  authorNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
  },
  authorName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  categoryBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.base,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[700],
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  date: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  menuButton: {
    padding: spacing[2],
    marginRight: -spacing[2],
  },
  menuIcon: {
    fontSize: typography.fontSize.xl,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xl),
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  menuContainer: {
    position: 'absolute',
    top: 40,
    right: spacing[2],
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    minWidth: 100,
    borderWidth: 1,
    borderColor: colors.border.light,
    zIndex: 2,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    gap: spacing[2],
  },
  menuItemIcon: {
    fontSize: typography.fontSize.base,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  menuItemText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border.light,
  },
  deleteText: {
    color: colors.red[500],
  },
  content: {
    marginBottom: spacing[3],
  },
  missionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    marginBottom: spacing[3],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    backgroundColor: colors.primary[100],
    borderRadius: borderRadius.base,
    borderWidth: 1.5,
    borderColor: colors.primary[500],
  },
  missionEmoji: {
    fontSize: typography.fontSize.base,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  missionEmojiImage: {
    width: 16,
    height: 16,
  },
  missionTitle: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.primary[800],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.base,
    gap: 2,
    marginLeft: spacing[2],
  },
  verifiedIcon: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  verifiedText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[700],
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.orange[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.base,
    gap: 2,
    marginLeft: spacing[2],
  },
  pendingIcon: {
    fontSize: typography.fontSize.xs,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  pendingText: {
    fontSize: typography.fontSize.xs,
    color: colors.orange[700],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    marginBottom: spacing[2],
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  text: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  imageContainer: {
    marginBottom: spacing[3],
    borderRadius: borderRadius.base,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  thumbnail: {
    width: '100%',
    height: 160,
    backgroundColor: colors.background.secondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1.5],
    marginBottom: spacing[3],
  },
  tag: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  tagText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[700],
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  footer: {
    paddingTop: 0,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing[2],
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
    fontSize: typography.fontSize.base,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  statIconImage: {
    width: 20,
    height: 20,
  },
  likedIcon: {
    // 이미 이모지로 표시됨
  },
  scrappedIcon: {
    // 이미 이모지로 표시됨
  },
  statText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  statTextActive: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.normal,
  },
});

export default PostCard;
