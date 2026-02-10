/**
 * CommunityPostDetailScreen 비즈니스 로직
 * 커뮤니티 게시글 상세 화면: 게시글 조회, 좋아요, 댓글 CRUD, 댓글 숨기기, 게시글 삭제
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Alert } from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { useCommunityPost } from '../../hooks/useCommunityPost';
import { useCommunity } from '../../hooks/useCommunity';
import { useUser } from '../../contexts/UserContext';
import { getHiddenComments, hideComment } from '../../utils/hiddenContentStorage';
import { logError } from '../../utils/logger';
import { SCREEN_NAMES } from '../../utils/constants';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

interface CommunityPostDetailScreenContainerProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'CommunityPostDetail'>;
}

export const useCommunityPostDetailScreenContainer = ({
  navigation,
  route,
}: CommunityPostDetailScreenContainerProps) => {
  const { postId } = route.params;
  useUser();
  const { post, comments, loading, error, createComment, updateComment, deleteComment, toggleLike } =
    useCommunityPost(postId);
  const { deletePost } = useCommunity();

  const [commentContent, setCommentContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [replyingToComment, setReplyingToComment] = useState<{ id: string; nickname: string } | null>(null);
  
  // 음성 녹음 관련 상태
  const [isListening, setIsListening] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const voiceCommittedRef = useRef(''); // 음성으로 확정된 텍스트

  // 숨긴 댓글 ID 목록
  const [hiddenCommentIds, setHiddenCommentIds] = useState<string[]>([]);
  // AlertModal 상태
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  // 삭제 확인 모달 상태
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);

  /**
   * 본인 게시글인지 확인 (백엔드에서 제공하는 isAuthor 필드 사용)
   */
  const isAuthor = useMemo(() => {
    return post?.isAuthor === true;
  }, [post]);

  /**
   * 숨긴 댓글 목록 로드
   */
  useEffect(() => {
    const loadHiddenComments = async () => {
      try {
        const hiddenIds = await getHiddenComments();
        setHiddenCommentIds(hiddenIds);
      } catch (err) {
        logError('숨긴 댓글 목록 로드 실패', err as Error);
      }
    };
    loadHiddenComments();
  }, []);

  /**
   * 음성 인식 사용 가능 여부 확인
   */
  useEffect(() => {
    const check = async () => {
      try {
        const available = ExpoSpeechRecognitionModule?.isRecognitionAvailable?.() ?? false;
        setVoiceAvailable(available);
      } catch {
        setVoiceAvailable(false);
      }
    };
    check();
  }, []);

  /**
   * 음성 인식 이벤트 핸들러
   */
  useSpeechRecognitionEvent('start', () => setIsListening(true));
  useSpeechRecognitionEvent('end', () => setIsListening(false));
  useSpeechRecognitionEvent('result', (event: { results: Array<{ transcript?: string }>; isFinal?: boolean }) => {
    const transcript = event.results?.[0]?.transcript?.trim();
    if (!transcript) return;
    const isFinal = event.isFinal === true;
    if (isFinal) {
      voiceCommittedRef.current = voiceCommittedRef.current
        ? `${voiceCommittedRef.current} ${transcript}`
        : transcript;
      setCommentContent(voiceCommittedRef.current);
    } else {
      // 말하는 동안 실시간으로 입력창에 보여줌
      setCommentContent(
        voiceCommittedRef.current
          ? `${voiceCommittedRef.current} ${transcript}`
          : transcript
      );
    }
  });
  useSpeechRecognitionEvent('error', (event: { error?: string; message?: string }) => {
    setIsListening(false);
    if (event.error && event.error !== 'aborted' && event.error !== 'no-speech') {
      Alert.alert('음성 인식', event.message || '음성 인식 중 문제가 발생했어요.');
    }
  });

  /**
   * 음성 입력 버튼 핸들러
   */
  const handleVoicePress = useCallback(async () => {
    if (!voiceAvailable) {
      Alert.alert('음성 입력', '이 기기에서는 음성 인식을 사용할 수 없어요.');
      return;
    }
    try {
      if (isListening) {
        ExpoSpeechRecognitionModule.stop();
        return;
      }
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) {
        Alert.alert('마이크 권한', '음성 입력을 쓰려면 마이크 권한이 필요해요.');
        return;
      }
      voiceCommittedRef.current = commentContent; // 녹음 시작 시점의 입력값 유지 (이어쓰기)
      ExpoSpeechRecognitionModule.start({
        lang: 'ko-KR',
        interimResults: true,
        continuous: false,
      });
    } catch (e) {
      Alert.alert('음성 입력', '음성 인식을 시작할 수 없어요.');
    }
  }, [voiceAvailable, isListening, commentContent]);

  /**
   * 음성 입력 취소 핸들러
   */
  const handleVoiceCancel = useCallback(() => {
    ExpoSpeechRecognitionModule.abort();
    setCommentContent(voiceCommittedRef.current);
  }, []);

  /**
   * 댓글 숨기기 처리
   */
  const handleHideComment = useCallback(async (commentId: string) => {
    try {
      await hideComment(commentId);
      setHiddenCommentIds(prev => [...prev, commentId]);
    } catch (err) {
      logError('댓글 숨기기 실패', err as Error);
      setAlertTitle('오류');
      setAlertMessage('댓글을 숨기는 중 문제가 발생했습니다.');
      setShowAlert(true);
    }
  }, []);

  /**
   * 좋아요 토글
   */
  const handleLike = useCallback(async () => {
    if (post) {
      const result = await toggleLike();
      // 내 게시글에는 좋아요를 누를 수 없음 에러 처리
      if (!result.success && result.error === '내 게시글에는 좋아요를 누를 수 없습니다.') {
        setAlertTitle('알림');
        setAlertMessage('내 게시글에는 좋아요를 누를 수 없습니다.');
        setShowAlert(true);
      }
      // toggleLike가 내부적으로 post 상태를 업데이트하므로 loadPost 불필요
    }
  }, [post, toggleLike]);

  /**
   * 게시글 삭제 모달 열기
   */
  const handleDeletePost = useCallback(() => {
    if (!post) return;
    setShowDeleteModal(true);
  }, [post]);

  /**
   * 게시글 삭제 확인
   */
  const handleConfirmDelete = useCallback(async () => {
    if (!post) return;
    setShowDeleteModal(false);
    const result = await deletePost(post.post_id);
    if (result.success) {
      navigation.goBack();
    } else {
      setAlertTitle('오류');
      setAlertMessage(result.error || '게시글 삭제에 실패했습니다.');
      setShowAlert(true);
    }
  }, [post, deletePost, navigation]);

  /**
   * 댓글 작성
   */
  const handleSubmitComment = useCallback(async () => {
    if (!commentContent.trim()) {
      setAlertTitle('오류');
      setAlertMessage('댓글을 입력해주세요.');
      setShowAlert(true);
      return;
    }

    // 대댓글인 경우 parentCommentId 전달
    const result = await createComment(commentContent.trim(), replyingToComment?.id);
    if (result.success) {
      setCommentContent('');
      setReplyingToComment(null); // 답글 모드 해제
    } else {
      setAlertTitle('오류');
      setAlertMessage(result.error || '댓글 작성에 실패했습니다.');
      setShowAlert(true);
    }
  }, [commentContent, replyingToComment, createComment]);

  /**
   * 답글 버튼 클릭 핸들러
   */
  const handleReplyComment = useCallback((comment: any) => {
    setReplyingToComment({ id: comment.comment_id, nickname: comment.author_nickname });
    // 답글 입력란에 포커스를 맞추기 위해 placeholder를 변경
  }, []);

  /**
   * 답글 모드 취소 핸들러
   */
  const handleCancelReply = useCallback(() => {
    setReplyingToComment(null);
  }, []);

  /**
   * 댓글 수정 시작
   */
  const handleEditComment = useCallback((comment: any) => {
    setEditingCommentId(comment.comment_id);
    setEditingContent(comment.content);
  }, []);

  /**
   * 댓글 수정 취소
   */
  const handleCancelEdit = useCallback(() => {
    setEditingCommentId(null);
    setEditingContent('');
  }, []);

  /**
   * 댓글 수정 저장
   */
  const handleUpdateComment = useCallback(async () => {
    if (!editingCommentId || !editingContent.trim()) return;

    const result = await updateComment(editingCommentId, editingContent.trim());
    if (result.success) {
      setEditingCommentId(null);
      setEditingContent('');
    } else {
      setAlertTitle('오류');
      setAlertMessage(result.error || '댓글 수정에 실패했습니다.');
      setShowAlert(true);
    }
  }, [editingCommentId, editingContent, updateComment]);

  /**
   * 댓글 삭제 모달 열기
   */
  const handleDeleteComment = useCallback((commentId: string) => {
    setDeleteCommentId(commentId);
    setShowDeleteCommentModal(true);
  }, []);

  /**
   * 댓글 삭제 확인
   */
  const handleConfirmDeleteComment = useCallback(async () => {
    if (deleteCommentId) {
      try {
        await deleteComment(deleteCommentId);
        setShowDeleteCommentModal(false);
        setDeleteCommentId(null);
      } catch (err) {
        logError('댓글 삭제 실패', err as Error);
        setShowDeleteCommentModal(false);
        setDeleteCommentId(null);
      }
    }
  }, [deleteCommentId, deleteComment]);

  /**
   * 게시글 수정 화면으로 이동
   */
  const handleEditPost = useCallback(() => {
    if (post) {
      navigation.navigate(SCREEN_NAMES.COMMUNITY_POST_EDIT as any, { postId: post.post_id });
    }
  }, [post, navigation]);

  /**
   * Alert 모달 닫기
   */
  const handleCloseAlert = useCallback(() => {
    setShowAlert(false);
  }, []);

  /**
   * 게시글 삭제 모달 닫기
   */
  const handleCloseDeleteModal = useCallback(() => {
    setShowDeleteModal(false);
  }, []);

  /**
   * 댓글 삭제 모달 닫기
   */
  const handleCloseDeleteCommentModal = useCallback(() => {
    setShowDeleteCommentModal(false);
    setDeleteCommentId(null);
  }, []);

  return {
    // Data from hooks
    post,
    comments,
    loading,
    error,
    // Computed values
    isAuthor,
    hiddenCommentIds,
    // State
    commentContent,
    editingCommentId,
    editingContent,
    replyingToComment,
    showAlert,
    alertTitle,
    alertMessage,
    showDeleteModal,
    showDeleteCommentModal,
    // Setters
    setCommentContent,
    setEditingContent,
    // Handlers
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
    // 음성 입력
    voiceAvailable,
    isListening,
    handleVoicePress,
    handleVoiceCancel,
  };
};
