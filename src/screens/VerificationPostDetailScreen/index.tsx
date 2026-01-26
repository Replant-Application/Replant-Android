/**
 * 인증글 상세 화면
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
  RefreshControl,
} from 'react-native';
import { CommentCard } from '../../components/specialized';
import { Loading, ErrorBoundary, EmptyState, AlertModal } from '../../components/ui';
import { colors } from '../../utils/designTokens';
import { formatDateKorean } from '../../utils/dateUtils';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { useVerificationPostDetailScreenContainer } from './VerificationPostDetailScreen.container';
import { styles } from './VerificationPostDetailScreen.styles';

interface VerificationPostDetailScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'VerificationPostDetail'>;
}

const VerificationPostDetailScreen: React.FC<VerificationPostDetailScreenProps> = ({ navigation, route }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    post,
    comments,
    loading,
    refreshing,
    error,
    commentContent,
    editingCommentId,
    editingContent,
    replyingToComment,
    isAuthor,
    showAlert,
    alertTitle,
    alertMessage,
    handleAlertClose,
    setCommentContent,
    setEditingContent,
    onRefresh,
    handleVote,
    handleDeletePost,
    handleSubmitComment,
    handleReplyComment,
    handleCancelReply,
    handleEditComment,
    handleCancelEdit,
    handleUpdateComment,
    handleDeleteComment,
    handleEditPost,
    getStatusBadge,
    getMissionTitle,
    currentUserId,
  } = useVerificationPostDetailScreenContainer({ navigation, route });

  // 상태 뱃지 렌더링
  const statusBadge = getStatusBadge();

  if (loading) {
    return <Loading text="인증글을 불러오는 중..." />;
  }

  if (error || !post) {
    return <ErrorBoundary error={error || '인증글을 찾을 수 없습니다.'} />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image
            source={require('../../assets/images/left.png')}
            style={styles.backButtonIcon}
            resizeMode="contain"
            accessibilityLabel="뒤로 가기"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>인증글</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 게시글 내용 */}
        <View style={styles.postContainer}>
          <View style={styles.postHeader}>
            <View style={styles.authorInfo}>
              <View style={styles.authorAvatar}>
                {post.userProfileImg ? (
                  <Image 
                    source={{ uri: post.userProfileImg }} 
                    style={styles.authorAvatarImage} 
                    accessibilityLabel={`${post.userNickname || '사용자'} 프로필 이미지`}
                  />
                ) : (
                  <Text style={styles.authorAvatarText}>
                    {post.userNickname?.charAt(0)?.toUpperCase() || '?'}
                  </Text>
                )}
              </View>
              <View style={styles.authorNameContainer}>
                <Text style={styles.authorName}>{post.userNickname || '알 수 없음'}</Text>
                <Text style={styles.missionTypeBadge}>
                  {post.missionType === 'OFFICIAL' ? '시스템 미션' : '커스텀 미션'}
                </Text>
              </View>
            </View>
            <Text style={styles.date}>
              {post.createdAt ? formatDateKorean(post.createdAt) : ''}
            </Text>
          </View>

          <View style={styles.missionInfo}>
            <Text style={styles.missionEmoji}>🎯</Text>
            <Text style={styles.missionTitle}>{getMissionTitle()}</Text>
            {statusBadge && (
              <View
                style={
                  statusBadge.type === 'APPROVED'
                    ? styles.approvedBadge
                    : statusBadge.type === 'REJECTED'
                    ? styles.rejectedBadge
                    : styles.pendingBadge
                }
              >
                <Text style={styles.badgeIcon}>{statusBadge.icon}</Text>
                <Text
                  style={
                    statusBadge.type === 'APPROVED'
                      ? styles.approvedText
                      : statusBadge.type === 'REJECTED'
                      ? styles.rejectedText
                      : styles.pendingText
                  }
                >
                  {statusBadge.text}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.contentText}>{post.content}</Text>

          {post.imageUrls && post.imageUrls.length > 0 && (
            <View style={styles.imageContainer}>
              {post.imageUrls.map((imageUrl, index) => (
                <Image 
                  key={index} 
                  source={{ uri: imageUrl }} 
                  style={styles.image} 
                  resizeMode="cover" 
                  accessibilityLabel={`${post.title} 인증 이미지 ${index + 1}`}
                />
              ))}
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.voteButton, post.myVote === 'APPROVE' && styles.voteButtonActive, isAuthor && styles.voteButtonDisabled]}
              onPress={() => handleVote('APPROVE')}
              disabled={isAuthor}
            >
              {post.myVote === 'APPROVE' ? (
                <Text style={[styles.voteIcon, isAuthor && styles.voteIconDisabled]}>❤️</Text>
              ) : (
                <Image
                  source={require('../../assets/images/heart.png')}
                  style={styles.voteIconImage}
                  resizeMode="contain"
                  accessibilityLabel="좋아요 아이콘"
                />
              )}
              <Text style={[styles.voteText, post.myVote === 'APPROVE' && styles.voteTextActive, isAuthor && styles.voteTextDisabled]}>
                {post.approveCount}
              </Text>
            </TouchableOpacity>

            <View style={styles.actionButton}>
              <Image
                source={require('../../assets/images/say.png')}
                style={styles.actionIconImage}
                resizeMode="contain"
                accessibilityLabel="댓글 아이콘"
              />
              <Text style={styles.actionText}>{post.commentCount || comments.length}</Text>
            </View>

            {isAuthor && post.status === 'PENDING' && (
              <>
                <TouchableOpacity style={styles.actionButton} onPress={handleEditPost}>
                  <Text style={styles.actionText}>✏️ 수정</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={handleDeletePost}>
                  <Text style={[styles.actionText, styles.deleteText]}>🗑️ 삭제</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* 댓글 섹션 */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>댓글 ({comments.length})</Text>

          {comments.length === 0 ? (
            <EmptyState icon="💬" title="아직 댓글이 없어요" description="첫 댓글을 남겨보세요!" />
          ) : (
            <View style={styles.commentsList}>
              {comments
                .filter(comment => !comment.parent_comment_id)
                .map(parentComment => (
                  <View key={parentComment.comment_id}>
                    {editingCommentId === parentComment.comment_id ? (
                      <View style={styles.editCommentContainer}>
                        <TextInput
                          style={styles.editCommentInput}
                          value={editingContent}
                          onChangeText={setEditingContent}
                          multiline
                        />
                        <View style={styles.editCommentActions}>
                          <TouchableOpacity style={styles.editCommentButton} onPress={handleCancelEdit}>
                            <Text style={styles.editCommentButtonText}>취소</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.editCommentButton, styles.editCommentButtonSave]}
                            onPress={handleUpdateComment}
                          >
                            <Text style={[styles.editCommentButtonText, styles.editCommentButtonTextSave]}>
                              저장
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <CommentCard
                        comment={parentComment as any}
                        isAuthor={currentUserId !== null && 
                          (parentComment.author_id !== undefined 
                            ? Number(parentComment.author_id) === currentUserId
                            : parseInt(parentComment.author) === currentUserId)}
                        onEdit={handleEditComment}
                        onDelete={handleDeleteComment}
                        onReply={handleReplyComment}
                      />
                    )}

                    {/* 대댓글 */}
                    {(parentComment.replies || comments.filter(r => r.parent_comment_id === parentComment.comment_id))
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
                                <TouchableOpacity style={styles.editCommentButton} onPress={handleCancelEdit}>
                                  <Text style={styles.editCommentButtonText}>취소</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={[styles.editCommentButton, styles.editCommentButtonSave]}
                                  onPress={handleUpdateComment}
                                >
                                  <Text style={[styles.editCommentButtonText, styles.editCommentButtonTextSave]}>
                                    저장
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          ) : (
                            <CommentCard
                              comment={reply as any}
                              isAuthor={currentUserId !== null && 
                                (reply.author_id !== undefined 
                                  ? Number(reply.author_id) === currentUserId
                                  : parseInt(reply.author) === currentUserId)}
                              isReply={true}
                              onEdit={handleEditComment}
                              onDelete={handleDeleteComment}
                            />
                          )}
                        </View>
                      ))}
                  </View>
                ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 댓글 입력 */}
      <View style={styles.commentInputWrapper}>
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
            placeholder={replyingToComment ? `@${replyingToComment.nickname}님에게 답글...` : "댓글을 입력하세요..."}
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

      {/* 오류 모달 */}
      <AlertModal
        visible={showAlert}
        title={alertTitle}
        message={alertMessage}
        buttonText="확인"
        onClose={handleAlertClose}
      />
    </KeyboardAvoidingView>
  );
};


export default VerificationPostDetailScreen;
