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
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadCommunityPhoto } from '../../api/fileApi';
import { logError } from '../../utils/logger';

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
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertCloseAction, setAlertCloseAction] = useState<'goBack' | null>(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const showAlertModal = useCallback((alertTitleText: string, alertMessageText: string, closeAction?: 'goBack') => {
    setAlertTitle(alertTitleText);
    setAlertMessage(alertMessageText);
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
      // 모든 게시글(일반/인증) 이미지 초기화 — 수정 화면에서 사진 추가 가능
      setImages(post.images || []);
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
   * 일반 게시글인지 확인
   */
  const isGeneralPost = useMemo(() => {
    return post?.category !== '인증';
  }, [post]);

  /**
   * 이미지 선택
   */
  const handleSelectImage = useCallback(async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 3 - images.length,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        logError('갤러리 오류', new Error(result.errorMessage || result.errorCode));
        if (result.errorCode === 'permission') {
          showAlertModal('권한 필요', '사진을 선택하려면 갤러리 접근 권한이 필요합니다.');
        } else {
          showAlertModal('오류', '사진을 불러오는 중 오류가 발생했습니다.');
        }
        return;
      }

      if (result.assets && result.assets.length > 0) {
        setUploadingImage(true);
        try {
          const uploadPromises = result.assets.map(async asset => {
            if (asset.uri) {
              const uploadResult = await uploadCommunityPhoto({
                uri: asset.uri,
                type: asset.type || 'image/jpeg',
                name: asset.fileName || `image_${Date.now()}.jpg`,
              });
              return uploadResult.success && uploadResult.data ? uploadResult.data.fileUrl : null;
            }
            return null;
          });

          const uploadedUrls = (await Promise.all(uploadPromises)).filter((url): url is string => url !== null);
          setImages(prev => [...prev, ...uploadedUrls]);
        } catch (error) {
          logError('이미지 업로드 오류', error as Error);
          showAlertModal('오류', '이미지 업로드 중 오류가 발생했습니다.');
        } finally {
          setUploadingImage(false);
        }
      }
    } catch (error) {
      logError('이미지 선택 오류', error as Error);
      showAlertModal('오류', '사진을 선택하는 중 오류가 발생했습니다.');
    }
  }, [images.length, showAlertModal]);

  /**
   * 이미지 제거
   */
  const handleRemoveImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

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

      const updateData: {
        title?: string;
        content?: string;
        images?: string[];
      } = {
        title: updateTitle,
        content: content.trim(),
      };

      // 일반 게시글인 경우 이미지도 함께 전송
      if (isGeneralPost) {
        updateData.images = images;
      }

      const result = await updatePost(post.post_id, updateData);

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
  }, [content, title, images, post, isVerificationPost, isGeneralPost, updatePost, showAlertModal]);

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
    isGeneralPost,
    title,
    content,
    images,
    uploadingImage,
    saving,
    setTitle,
    setContent,
    handleSelectImage,
    handleRemoveImage,
    handleUpdatePost,
    showAlert,
    alertTitle,
    alertMessage,
    handleAlertClose,
    showSuccessModal,
    handleSuccessModalClose,
  };
};
