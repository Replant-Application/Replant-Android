import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ViewStyle, Alert } from 'react-native';
import { styles } from './PostCard.styles';
import { CommunityPost } from '../../types';
import { formatTimeAgo } from '../../utils/dateUtils';

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
  currentUserId: _currentUserId,
  onPress,
  onLike,
  onScrap: _onScrap,
  onEdit,
  onDelete,
  onHide,
  style
}) => {
  const [showMenu, setShowMenu] = useState(false);
  
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
    
    // 인증 게시글인지 확인 (category가 '인증'이거나 mission_id가 있는 경우)
    const isVerificationPost = post.category === '인증' || (post.mission_id && post.mission_id !== 'undefined');
    
    const alertTitle = isVerificationPost ? '인증글 삭제' : '게시글 삭제';
    const alertMessage = isVerificationPost
      ? '인증글을 삭제하면\n미션이 실패 처리됩니다.'
      : '정말 이 게시글을 삭제하시겠습니까?';
    
    Alert.alert(
      alertTitle,
      alertMessage,
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
    const authorName = post.author_nickname || '익명';
    let label = `${authorName}의 게시글, ${post.title}`;
    if (post.mission_title) {
      label += `, ${post.mission_title} 미션`;
    }
    // 인증 게시글일 때만 인증 상태 표시
    if (post.category === '인증') {
      if (post.verified === true) {
        label += ', 인증완료';
      } else if (post.verified === false) {
        label += ', 인증대기';
      }
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
              {(post.author_nickname || '익').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.authorNameContainer}>
            <Text style={styles.authorName}>{post.author_nickname || '익명'}</Text>
            {post.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{post.category}</Text>
              </View>
            )}
            {isOwnPost && post.isPublic === false && (
              <View style={styles.privateBadge}>
                <Text style={styles.privateBadgeText}>비공개</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.date}>
            {formatTimeAgo(post.created_at, { longFormat: true })}
          </Text>
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
            accessibilityRole="button"
            accessibilityLabel="메뉴 닫기"
          />
          <View style={styles.menuContainer}>
            {canEditDelete && (
              <>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleEdit}
                  accessibilityRole="button"
                  accessibilityLabel="수정"
                >
                  <Text style={styles.menuItemIcon}>✏️</Text>
                  <Text style={styles.menuItemText}>수정</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleDelete}
                  accessibilityRole="button"
                  accessibilityLabel="삭제"
                >
                  <Text style={styles.menuItemIcon}>🗑️</Text>
                  <Text style={[styles.menuItemText, styles.deleteText]}>삭제</Text>
                </TouchableOpacity>
              </>
            )}
            {!isOwnPost && onHide && (
              <>
                {canEditDelete && <View style={styles.menuDivider} />}
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleHide}
                  accessibilityRole="button"
                  accessibilityLabel="숨기기"
                >
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
              {post.category === '인증' && post.completionRate !== undefined && post.completionRate !== null && (
                ` (${post.completionRate}%)`
              )}
            </Text>
            {/* 인증 상태 배지 - 인증 게시글(category === '인증')일 때만 표시 */}
            {post.category === '인증' && (
              post.verified === true ? (
                <View
                  style={styles.verifiedBadge}
                  accessibilityLabel="인증완료"
                  accessibilityRole="text"
                >
                  <Text style={styles.verifiedIcon} accessibilityElementsHidden={true}>✓</Text>
                  <Text style={styles.verifiedText} accessibilityElementsHidden={true}>인증완료</Text>
                </View>
              ) : post.verified === false ? (
                <View
                  style={styles.pendingBadge}
                  accessibilityLabel="인증대기"
                  accessibilityRole="text"
                >
                  <Text style={styles.pendingIcon} accessibilityElementsHidden={true}>⏳</Text>
                  <Text style={styles.pendingText} accessibilityElementsHidden={true}>인증대기</Text>
                </View>
              ) : null
            )}
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
            <Image
              source={require('../../assets/images/heart.png')}
              style={styles.statIconImage}
              resizeMode="contain"
              accessibilityLabel="좋아요 아이콘"
              accessibilityElementsHidden={true}
            />
            <Text style={[styles.statText, post.is_liked && styles.statTextActive]}>
              {post.like_count}
            </Text>
          </TouchableOpacity>

          <View style={styles.statButton} accessibilityRole="text" accessibilityLabel={`댓글 ${post.comment_count}개`}>
            <Image
              source={require('../../assets/images/say.png')}
              style={styles.statIconImage}
              resizeMode="contain"
              accessibilityLabel="댓글 아이콘"
              accessibilityElementsHidden={true}
            />
            <Text style={styles.statText}>{post.comment_count}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PostCard;
