/**
 * CommunityPostEditScreen 비즈니스 로직
 * 커뮤니티 게시글 수정 화면: 게시글 수정
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { useCommunity } from '../../hooks/useCommunity';
import { useCommunityPost } from '../../hooks/useCommunityPost';
import { useUser } from '../../contexts/UserContext';

interface CommunityPostEditScreenContainerProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'CommunityPostEdit'>;
}

export const useCommunityPostEditScreenContainer = ({
  navigation,
  route,
}: CommunityPostEditScreenContainerProps) => {
  const { postId } = route.params;
  useUser();
  const { post, loading } = useCommunityPost(postId);
  const { updatePost } = useCommunity();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertCloseAction, setAlertCloseAction] = useState<'goBack' | null>(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const showAlertModal = useCallback((title: string, message: string, closeAction?: 'goBack') => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertCloseAction(closeAction || null);
    setShowAlert(true);
  }, []);

  const handleAlertClose = useCallback(() => {
    setShowAlert(false);
    if (alertCloseAction === 'goBack') {
      navigation.goBack();
      setAlertCloseAction(null);
    }
  }, [alertCloseAction, navigation]);

  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false);
    navigation.goBack();
  }, [navigation]);

  /**
   * 게시글 데이터 로드 시 폼 초기화
   */
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
    }
  }, [post]);

  /**
   * 본인 게시글인지 확인
   */
  const isAuthor = useMemo(() => {
    return post?.isAuthor === true;
  }, [post]);

  /**
   * 인증글인지 확인
   */
  const isVerificationPost = useMemo(() => {
    return post?.category === '인증';
  }, [post]);

  /**
   * 게시글 수정
   */
  const handleUpdatePost = useCallback(async () => {
    if (!content.trim()) {
      showAlertModal('오류', '내용을 입력해주세요.');
      return;
    }

    if (!post) return;

    try {
      setSaving(true);

      // 인증글인 경우 제목은 변경하지 않음 (기존 제목 유지)
      const updateTitle = isVerificationPost ? post.title : title.trim() || post.mission_title;

      const result = await updatePost(post.post_id, {
        title: updateTitle,
        content: content.trim(),
      });

      if (result.success) {
        setShowSuccessModal(true);
      } else {
        showAlertModal('오류', result.error || '게시글 수정에 실패했습니다.');
      }
    } catch (error) {
      showAlertModal('오류', '게시글 수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  }, [content, title, post, isVerificationPost, updatePost, showAlertModal]);

  /**
   * 권한 확인 및 네비게이션 처리
   */
  useEffect(() => {
    if (!loading && post && !isAuthor) {
      showAlertModal('오류', '본인의 게시글만 수정할 수 있습니다.', 'goBack');
    }
  }, [loading, post, isAuthor, showAlertModal]);

  return {
    post,
    loading,
    isAuthor,
    isVerificationPost,
    title,
    content,
    saving,
    setTitle,
    setContent,
    handleUpdatePost,
    showAlert,
    alertTitle,
    alertMessage,
    handleAlertClose,
    showSuccessModal,
    handleSuccessModalClose,
  };
};
