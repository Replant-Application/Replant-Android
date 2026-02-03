/**
 * 커뮤니티 게시글 상세 화면
 */

import React, { useState, useEffect } from 'react';
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
import { Loading, ErrorBoundary, EmptyState, Header, Card, AlertModal, ConfirmModal, FullScreenImageViewer } from '../../components/ui';
import { colors } from '../../utils/designTokens';
import { formatDateKorean } from '../../utils/dateUtils';
import { getCharacterImageStatic } from '../../utils/characterUtils';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { useCommunityPostDetailScreenContainer } from './CommunityPostDetailScreen.container';
import { styles } from './CommunityPostDetailScreen.styles';

interface CommunityPostDetailScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'CommunityPostDetail'>;
}

const CommunityPostDetailScreen: React.FC<CommunityPostDetailScreenProps> = ({ navigation, route }) => {
  // 비즈니스 로직은 Container에서 처리 (훅 규칙으로 항상 먼저 호출)
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

  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  // 히스토리 복원 시 params가 잠깐 바뀌어 postId가 없어지면 무한 로딩 방지: 즉시 뒤로가기
  const postId = route.params?.postId;
  useEffect(() => {
    if (!postId || String(postId).trim() === '') {
      navigation.goBack();
    }
  }, [postId, navigation]);

  if (!postId || String(postId).trim() === '') {
    return null;
  }

  if (loading) {
    return <Loading text="게시글을 불러오는 중..." />;
  }

  if (error || !post) {
    const displayError = error || '게시글을 찾을 수 없습니다.';
    const isPrivateAccess =
      typeof displayError === 'string' &&
      (displayError.includes('비공개') ||
        /403|접근|forbidden/i.test(displayError));

    if (isPrivateAccess) {
      return (
        <ImageBackground
          source={require('../../assets/images/background.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
          accessibilityElementsHidden={true}
        >
          <View style={styles.container}>
            <Header
              title="게시글"
              navigation={navigation}
              showBorder={false}
              titleStyle={styles.headerTitle}
            />
            <View style={styles.privateAccessContainer}>
              <Text style={styles.privateAccessTitle}>비공개 글입니다</Text>
              <Text style={styles.privateAccessMessage}>
                작성자만 볼 수 있는 글입니다.
              </Text>
            </View>
          </View>
        </ImageBackground>
      );
    }

    return <ErrorBoundary error={displayError} />;
  }

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
      accessibilityElementsHidden={true}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Header
          title="게시글"
          navigation={{
            ...navigation,
            goBack: () => {
              // returnScreen이 있으면 해당 화면으로 복원
              const returnScreen = route.params?.returnScreen;
              if (returnScreen) {
                const navParams: any = {};
                // Community로 돌아갈 때 activeTab 전달
                if (returnScreen === 'Community' && route.params?.activeTab) {
                  navParams.activeTab = route.params.activeTab;
                }
                navigation.navigate(returnScreen as any, navParams);
              } else {
                // 기본 동작: 이전 화면으로 돌아가기
                navigation.goBack?.();
              }
            },
          }}
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
                accessibilityRole="button"
                accessibilityLabel="게시글 수정"
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
                accessibilityRole="button"
                accessibilityLabel="게시글 삭제"
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
                {post.authorReantLevel != null && post.authorReantLevel >= 1 ? (
                  <Image
                    source={getCharacterImageStatic(Math.min(post.authorReantLevel, 6))}
                    style={styles.authorAvatarImage}
                    resizeMode="contain"
                    accessibilityLabel={`${post.author_nickname || '작성자'} 캐릭터`}
                  />
                ) : (
                  <Text style={styles.authorAvatarText}>
                    {post.author_nickname?.charAt(0)?.toUpperCase() || '?'}
                  </Text>
                )}
              </View>
              <View style={styles.authorNameContainer}>
                <Text style={styles.authorName}>{post.author_nickname || '알 수 없음'}</Text>
                {post.category && (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{post.category}</Text>
                  </View>
                )}
                <Text style={styles.date}>
                  {post.created_at ? formatDateKorean(post.created_at) : ''}
                </Text>
              </View>
            </View>
          </View>

          {/* 인증글일 때만 미션 영역 표시. 일반글은 미션 제목 스타일 박스 미표시. */}
          {post.category === '인증' && (
            <View style={styles.missionInfo}>
              <Image
                source={require('../../assets/images/goal.png')}
                style={styles.missionEmojiImage}
                resizeMode="contain"
                accessibilityLabel="미션 아이콘"
              />
              <Text style={styles.missionTitle}>
                {post.mission_title || '미션'}
                {post.category === '인증' && post.completionRate !== undefined && post.completionRate !== null && (
                  ` (${post.completionRate}%)`
                )}
              </Text>
              {post.category === '인증' && (
                post.verified === true ? (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedIcon}>✓</Text>
                    <Text style={styles.verifiedText}>인증완료</Text>
                  </View>
                ) : post.verified === false ? (
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingIcon}>⏳</Text>
                    <Text style={styles.pendingText}>인증대기</Text>
                  </View>
                ) : null
              )}
            </View>
          )}

          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.contentText}>{post.content}</Text>

          {post.images && post.images.length > 0 && (
            <View style={styles.imageContainer}>
              {post.images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImageUri(image)}
                  activeOpacity={0.9}
                  accessibilityRole="imagebutton"
                  accessibilityLabel={`${post.title} 이미지 ${index + 1} 자세히 보기`}
                >
                  <Image 
                    source={{ uri: image }} 
                    style={styles.image} 
                    resizeMode="cover" 
                    accessibilityLabel={`${post.title} 이미지 ${index + 1}`}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleLike}
              accessibilityRole="button"
              accessibilityLabel={post.is_liked ? `좋아요 취소, ${post.like_count}명이 좋아요` : `좋아요, ${post.like_count}명이 좋아요`}
            >
              <Image
                source={require('../../assets/images/heart.png')}
                style={styles.actionIconImage}
                resizeMode="contain"
                accessibilityLabel="좋아요 아이콘"
              />
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
                          accessibilityLabel="댓글 수정"
                          accessibilityHint="수정할 댓글 내용을 입력하세요"
                        />
                        <View style={styles.editCommentActions}>
                          <TouchableOpacity
                            style={styles.editCommentButton}
                            onPress={handleCancelEdit}
                            accessibilityRole="button"
                            accessibilityLabel="취소"
                          >
                            <Text style={styles.editCommentButtonText}>취소</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.editCommentButton, styles.editCommentButtonSave]}
                            onPress={handleUpdateComment}
                            accessibilityRole="button"
                            accessibilityLabel="저장"
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
                                accessibilityLabel="답글 수정"
                                accessibilityHint="수정할 답글 내용을 입력하세요"
                              />
                              <View style={styles.editCommentActions}>
                                <TouchableOpacity
                                  style={styles.editCommentButton}
                                  onPress={handleCancelEdit}
                                  accessibilityRole="button"
                                  accessibilityLabel="취소"
                                >
                                  <Text style={styles.editCommentButtonText}>취소</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={[styles.editCommentButton, styles.editCommentButtonSave]}
                                  onPress={handleUpdateComment}
                                  accessibilityRole="button"
                                  accessibilityLabel="저장"
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
              <TouchableOpacity
                onPress={handleCancelReply}
                style={styles.cancelReplyButton}
                accessibilityRole="button"
                accessibilityLabel="답글 취소"
              >
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
              accessibilityLabel={replyingToComment ? "답글 입력" : "댓글 입력"}
              accessibilityHint={replyingToComment ? "답글을 입력하세요" : "댓글을 입력하세요"}
            />
            <TouchableOpacity
              style={[styles.submitButton, !commentContent.trim() && styles.submitButtonDisabled]}
              onPress={handleSubmitComment}
              disabled={!commentContent.trim()}
              accessibilityRole="button"
              accessibilityLabel={replyingToComment ? '답글 등록' : '댓글 등록'}
              accessibilityState={{ disabled: !commentContent.trim() }}
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
        title={post.category === '인증' || (post.mission_id && post.mission_id !== 'undefined') ? '인증글 삭제' : '게시글 삭제'}
        message={post.category === '인증' || (post.mission_id && post.mission_id !== 'undefined')
          ? '인증글을 삭제하면\n미션이 실패 처리됩니다.'
          : '정말로 이 게시글을 삭제하시겠습니까?'}
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
      <FullScreenImageViewer
        visible={!!selectedImageUri}
        imageUri={selectedImageUri}
        onClose={() => setSelectedImageUri(null)}
      />
    </ImageBackground>
  );
};


export default CommunityPostDetailScreen;
