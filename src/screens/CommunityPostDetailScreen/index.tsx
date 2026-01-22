/**
 * 커뮤니티 게시글 상세 화면
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from 'react-native';
import { CommentCard } from '../../components/specialized';
import { Loading, ErrorBoundary, EmptyState, Header, Card, AlertModal, ConfirmModal } from '../../components/ui';
import { colors } from '../../utils/designTokens';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { useCommunityPostDetailScreenContainer } from './CommunityPostDetailScreen.container';
import { styles } from './CommunityPostDetailScreen.styles';

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


export default CommunityPostDetailScreen;
