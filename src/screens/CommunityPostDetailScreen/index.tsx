/**
 * 커뮤니티 게시글 상세 화면
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from 'react-native';
import { CommentCard } from '../../components/specialized';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { Loading, ErrorBoundary, EmptyState, Header, Card, AlertModal, ConfirmModal } from '../../components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { useCommunityPostDetailScreenContainer } from './CommunityPostDetailScreen.container';

interface CommunityPostDetailScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'CommunityPostDetail'>;
}

const CommunityPostDetailScreen: React.FC<CommunityPostDetailScreenProps> = ({ navigation, route }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    post,
    comments,
    loading,
    error,
    isAuthor,
    hiddenCommentIds,
    commentContent,
    editingCommentId,
    editingContent,
    replyingToComment,
    showAlert,
    alertTitle,
    alertMessage,
    showDeleteModal,
    showDeleteCommentModal,
    setCommentContent,
    setEditingContent,
    handleLike,
    handleDeletePost,
    handleConfirmDelete,
    handleSubmitComment,
    handleReplyComment,
    handleCancelReply,
    handleEditComment,
    handleCancelEdit,
    handleUpdateComment,
    handleDeleteComment,
    handleConfirmDeleteComment,
    handleEditPost,
    handleHideComment,
    handleCloseAlert,
    handleCloseDeleteModal,
    handleCloseDeleteCommentModal,
  } = useCommunityPostDetailScreenContainer({ navigation, route });

  if (loading) {
    return <Loading text="게시글을 불러오는 중..." />;
  }

  if (error || !post) {
    return <ErrorBoundary error={error || '게시글을 찾을 수 없습니다.'} />;
  }

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Header
          title="게시글"
          navigation={navigation}
          showBorder={false}
          titleStyle={styles.headerTitle}
        />

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 게시글 내용 */}
          <Card style={styles.postContainer}>
          {isAuthor && (
            <View style={styles.postActionsContainer}>
              <TouchableOpacity
                style={styles.postActionButton}
                onPress={handleEditPost}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Image
                  source={require('../../assets/images/pencil.png')}
                  style={styles.postActionIcon}
                  resizeMode="contain"
                  accessibilityLabel="수정 아이콘"
                />
                <Text style={styles.postActionText}>수정</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.postActionButton}
                onPress={handleDeletePost}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Image
                  source={require('../../assets/images/trash.png')}
                  style={styles.postActionIcon}
                  resizeMode="contain"
                  accessibilityLabel="삭제 아이콘"
                />
                <Text style={[styles.postActionText, styles.postActionTextDelete]}>삭제</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.postHeader}>
            <View style={styles.authorInfo}>
              <View style={styles.authorAvatar}>
                <Text style={styles.authorAvatarText}>
                  {post.author_nickname?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
              <View>
                <Text style={styles.authorName}>{post.author_nickname || '알 수 없음'}</Text>
                {post.category && (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{post.category}</Text>
                  </View>
                )}
              </View>
            </View>
            <Text style={styles.date}>
              {post.created_at ? new Date(post.created_at).toLocaleDateString('ko-KR') : ''}
            </Text>
          </View>

          <View style={styles.missionInfo}>
            <Image
              source={require('../../assets/images/goal.png')}
              style={styles.missionEmojiImage}
              resizeMode="contain"
              accessibilityLabel="미션 아이콘"
            />
            <Text style={styles.missionTitle}>{post.mission_title || '미션'}</Text>
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

          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.contentText}>{post.content}</Text>

          {post.images && post.images.length > 0 && (
            <View style={styles.imageContainer}>
              {post.images.map((image, index) => (
                <Image 
                  key={index} 
                  source={{ uri: image }} 
                  style={styles.image} 
                  resizeMode="cover" 
                  accessibilityLabel={`${post.title} 이미지 ${index + 1}`}
                />
              ))}
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
              {post.is_liked ? (
                <Text style={styles.actionIcon}>❤️</Text>
              ) : (
                <Image
                  source={require('../../assets/images/heart.png')}
                  style={styles.actionIconImage}
                  resizeMode="contain"
                  accessibilityLabel="좋아요 아이콘"
                />
              )}
              <Text style={styles.actionText}>{post.like_count}</Text>
            </TouchableOpacity>

            <View style={styles.actionButton}>
              <Image
                source={require('../../assets/images/say.png')}
                style={styles.actionIconImage}
                resizeMode="contain"
                accessibilityLabel="댓글 아이콘"
              />
              <Text style={styles.actionText}>{post.comment_count}</Text>
            </View>
          </View>
          </Card>

          {/* 댓글 섹션 */}
          <Card style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>댓글 ({comments.length})</Text>

          {comments.length === 0 ? (
            <EmptyState iconImage={require('../../assets/images/say.png')} title="아직 댓글이 없어요" description="첫 댓글을 남겨보세요!" />
          ) : (
            <View style={styles.commentsList}>
              {/* 부모 댓글만 먼저 렌더링하고, 대댓글은 부모 댓글 아래에 표시 */}
              {comments
                .filter(comment => !comment.parent_comment_id)
                .filter(comment => !hiddenCommentIds.includes(comment.comment_id))
                .map(parentComment => (
                  <View key={parentComment.comment_id}>
                    {/* 부모 댓글 */}
                    {editingCommentId === parentComment.comment_id ? (
                      <View style={styles.editCommentContainer}>
                        <TextInput
                          style={styles.editCommentInput}
                          value={editingContent}
                          onChangeText={setEditingContent}
                          multiline
                        />
                        <View style={styles.editCommentActions}>
                          <TouchableOpacity
                            style={styles.editCommentButton}
                            onPress={handleCancelEdit}
                          >
                            <Text style={styles.editCommentButtonText}>취소</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.editCommentButton, styles.editCommentButtonSave]}
                            onPress={handleUpdateComment}
                          >
                            <Text
                              style={[
                                styles.editCommentButtonText,
                                styles.editCommentButtonTextSave,
                              ]}
                            >
                              저장
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <CommentCard
                        comment={parentComment}
                        onEdit={handleEditComment}
                        onDelete={handleDeleteComment}
                        onReply={handleReplyComment}
                        onHide={handleHideComment}
                      />
                    )}

                    {/* 대댓글 (부모 댓글에 속한 댓글들) */}
                    {comments
                      .filter(reply => reply.parent_comment_id === parentComment.comment_id)
                      .filter(reply => !hiddenCommentIds.includes(reply.comment_id))
                      .map(reply => (
                        <View key={reply.comment_id}>
                          {editingCommentId === reply.comment_id ? (
                            <View style={[styles.editCommentContainer, styles.replyEditContainer]}>
                              <TextInput
                                style={styles.editCommentInput}
                                value={editingContent}
                                onChangeText={setEditingContent}
                                multiline
                              />
                              <View style={styles.editCommentActions}>
                                <TouchableOpacity
                                  style={styles.editCommentButton}
                                  onPress={handleCancelEdit}
                                >
                                  <Text style={styles.editCommentButtonText}>취소</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={[styles.editCommentButton, styles.editCommentButtonSave]}
                                  onPress={handleUpdateComment}
                                >
                                  <Text
                                    style={[
                                      styles.editCommentButtonText,
                                      styles.editCommentButtonTextSave,
                                    ]}
                                  >
                                    저장
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          ) : (
                            <CommentCard
                              comment={reply}
                              isReply={true}
                              onEdit={handleEditComment}
                              onDelete={handleDeleteComment}
                              onHide={handleHideComment}
                            />
                          )}
                        </View>
                      ))}
                  </View>
                ))}
            </View>
          )}
          </Card>
        </ScrollView>

        {/* 댓글 입력 */}
        <View style={styles.commentInputWrapper}>
          {/* 답글 모드 표시 */}
          {replyingToComment && (
            <View style={styles.replyingToContainer}>
              <Text style={styles.replyingToText}>
                @{replyingToComment.nickname}님에게 답글 작성 중
              </Text>
              <TouchableOpacity onPress={handleCancelReply} style={styles.cancelReplyButton}>
                <Text style={styles.cancelReplyText}>X</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              value={commentContent}
              onChangeText={setCommentContent}
              placeholder={replyingToComment ? `@${replyingToComment.nickname}님에게 답글...` : "댓글을 입력하세요"}
              placeholderTextColor={colors.text.tertiary}
              multiline
            />
            <TouchableOpacity
              style={[styles.submitButton, !commentContent.trim() && styles.submitButtonDisabled]}
              onPress={handleSubmitComment}
              disabled={!commentContent.trim()}
            >
              <Text style={styles.submitButtonText}>{replyingToComment ? '답글' : '등록'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      <AlertModal
        visible={showAlert}
        title={alertTitle}
        message={alertMessage}
        onClose={handleCloseAlert}
      />
      <ConfirmModal
        visible={showDeleteModal}
        title="게시글 삭제"
        message="정말로 이 게시글을 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteModal}
        confirmButtonColor={colors.error}
      />
      <ConfirmModal
        visible={showDeleteCommentModal}
        title="댓글 삭제"
        message="정말로 이 댓글을 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        onConfirm={handleConfirmDeleteComment}
        onCancel={handleCloseDeleteCommentModal}
        confirmButtonColor={colors.error}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[5],
    paddingBottom: spacing[24],
  },
  headerTitle: {
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  postContainer: {
    marginBottom: spacing[5],
    ...shadows.sm,
    position: 'relative',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
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
  authorName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    marginBottom: 2,
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
    alignSelf: 'flex-start',
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
  postActionsContainer: {
    position: 'absolute',
    bottom: spacing[4],
    right: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    zIndex: 10,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  postActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[0.5],
    paddingHorizontal: spacing[1.5],
    paddingVertical: spacing[0.5],
  },
  postActionIcon: {
    width: 14,
    height: 14,
  },
  postActionText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  postActionTextDelete: {
    color: colors.error,
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
  missionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    marginBottom: spacing[2],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    backgroundColor: colors.primary[100],
    borderRadius: borderRadius.base,
    borderWidth: 1.5,
    borderColor: colors.primary[500],
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
    fontWeight: typography.fontWeight.normal,
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
    marginBottom: spacing[1],
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  contentText: {
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
    marginBottom: spacing[2],
    gap: spacing[2],
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.base,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[4],
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  actionIcon: {
    fontSize: typography.fontSize.base,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  actionIconImage: {
    width: 20,
    height: 20,
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  deleteText: {
    color: colors.error,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  headerActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  headerActionIcon: {
    width: 16,
    height: 16,
  },
  headerActionText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  headerActionTextDelete: {
    color: colors.error,
  },
  commentsSection: {
    marginTop: spacing[2],
    ...shadows.sm,
  },
  commentsTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  commentsList: {
    gap: spacing[1],
  },
  editCommentContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[2],
    marginBottom: spacing[1],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  editCommentInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.base,
    padding: spacing[2],
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    minHeight: 60,
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    textAlignVertical: 'top',
  },
  editCommentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[2],
  },
  editCommentButton: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.base,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  editCommentButtonSave: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  editCommentButtonText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  editCommentButtonTextSave: {
    color: colors.white,
    fontWeight: typography.fontWeight.normal,
  },
  replyEditContainer: {
    marginLeft: spacing[4],
  },
  commentInputWrapper: {
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    ...shadows.sm,
  },
  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.primary[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  replyingToText: {
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
  cancelReplyButton: {
    padding: spacing[1],
  },
  cancelReplyText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  commentInputContainer: {
    flexDirection: 'row',
    padding: spacing[3],
    gap: spacing[2],
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.base,
    padding: spacing[2],
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    maxHeight: 40,
    borderWidth: 1,
    borderColor: colors.border.light,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  submitButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.base,
    justifyContent: 'center',
    minHeight: 36,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[200],
  },
  submitButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    fontWeight: typography.fontWeight.normal,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
});

export default CommunityPostDetailScreen;
