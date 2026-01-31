/**
 * CommunityPostCreateScreen 비즈니스 로직
 * 커뮤니티 게시글 작성 화면: 일반 게시글/인증 게시글 작성, 이미지 업로드
 */

import { useState, useCallback } from 'react';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { useCommunity } from '../../hooks/useCommunity';
import { createVerificationPost } from '../../api/verificationApi';
import { verifySpontaneousMission } from '../../api/missionApi';
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadCommunityPhoto } from '../../api/fileApi';
import { logError } from '../../utils/logger';
import { SCREEN_NAMES } from '../../utils/constants';

interface CommunityPostCreateScreenContainerProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'CommunityPostCreate'>;
}

export const useCommunityPostCreateScreenContainer = ({
  navigation,
  route,
}: CommunityPostCreateScreenContainerProps) => {
  // 안전한 기본값 설정 (크래시 방지)
  const params = route.params || {};
  const postType = params.type || 'VERIFICATION'; // GENERAL or VERIFICATION
  const isGeneralPost = postType === 'GENERAL';
  const userMissionId = params.userMissionId; // 인증글 작성 시 필요한 UserMission ID (하위 호환성)
  const spontaneousMissionId = params.spontaneousMissionId || (params as any).referenceId; // 돌발 미션 ID (spontaneous_mission의 ID)
  const missionId = params.missionId || '';
  const missionTitle = isGeneralPost ? '자유게시판' : params.missionTitle || '미션';
  const missionEmoji = isGeneralPost ? '📝' : params.missionEmoji || '🎯';
  const photoUrl = params.photoUrl;

  const { createPost } = useCommunity();

  // 식사 미션 여부 확인
  const isMealMission = missionTitle.includes('식사') || missionTitle.includes('아침') || missionTitle.includes('점심') || missionTitle.includes('저녁') || missionTitle.includes('밥');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [tasteRating, setTasteRating] = useState(3); // 맛 평가 1-5
  
  // AlertModal 상태
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // AlertModal 표시 함수
  const showAlertModal = useCallback((alertTitleText: string, alertMessageText: string) => {
    setAlertTitle(alertTitleText);
    setAlertMessage(alertMessageText);
    setShowAlert(true);
  }, []);

  // AlertModal 닫기
  const handleAlertClose = useCallback(() => {
    setShowAlert(false);
  }, []);

  /**
   * 이미지 선택 (갤러리)
   */
  const handleSelectImage = useCallback(async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 3,
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
  }, [showAlertModal]);

  /**
   * 이미지 제거
   */
  const handleRemoveImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * 게시글 작성
   */
  const handleCreatePost = useCallback(async () => {
    // 중복 호출 방지
    if (loading) {
      console.log('[CommunityPostCreateScreen] 이미 처리 중입니다.');
      return;
    }

    if (!content.trim()) {
      showAlertModal('오류', '내용을 입력해주세요.');
      return;
    }

    // 인증글인데 userMissionId가 없으면 오류
    if (!isGeneralPost && !userMissionId) {
      showAlertModal('오류', '미션 정보가 없습니다. 다시 시도해주세요.');
      return;
    }

    try {
      setLoading(true);

      let result;

      if (isGeneralPost) {
        // 일반 게시글: communityService 사용
        // title이 비어있으면 missionTitle 사용, 그것도 없으면 기본값
        const postTitle = title.trim() || missionTitle || '자유게시글';

        console.log('[CommunityPostCreateScreen] 일반 게시글 작성 시작:', {
          postTitle,
          missionTitle,
          hasContent: !!content.trim(),
          postType,
        });

        const postData = {
          mission_id: missionId,
          mission_title: missionTitle,
          mission_emoji: missionEmoji,
          title: postTitle,
          content: content.trim(),
          images: photoUrl ? [photoUrl, ...images] : images,
          category: postType,
        };
        result = await createPost(postData);
        console.log('[CommunityPostCreateScreen] 일반 게시글 작성 완료:', result.success);
      } else if (isMealMission) {
        // 식사 미션: 돌발 미션 API 사용
        // 주의: 식사 미션은 이제 spontaneous_mission이므로 새로운 API 사용
        console.log('[CommunityPostCreateScreen] 식사 미션 인증 시작:', {
          spontaneousMissionId: spontaneousMissionId,
          userMissionId: userMissionId, // 하위 호환성
          title: title.trim() || missionTitle,
          hasDescription: !!content.trim(),
          hasImages: images.length > 0,
          rating: tasteRating,
          isMealMission: true,
        });

        if (!spontaneousMissionId) {
          showAlertModal('오류', '미션 정보가 없습니다. 다시 시도해주세요.');
          return;
        }

        // 1단계: 먼저 게시글 작성
        const postTitle = title.trim() || missionTitle;
        const postData = {
          mission_id: missionId,
          mission_title: missionTitle,
          mission_emoji: missionEmoji,
          title: postTitle,
          content: content.trim(),
          images: photoUrl ? [photoUrl, ...images] : images,
          category: postType,
        };
        
        const postResult = await createPost(postData);
        
        if (!postResult.success || !postResult.data) {
          showAlertModal('오류', postResult.error || '게시글 작성에 실패했습니다.');
          return;
        }

        const postId = Number(postResult.data.id); // CommunityPost.id는 string이므로 number로 변환
        console.log('[CommunityPostCreateScreen] 게시글 작성 완료, postId:', postId);

        // 2단계: 돌발 미션 인증 API 호출 (postId 전달)
        const verifyResult = await verifySpontaneousMission(
          typeof spontaneousMissionId === 'string' ? Number(spontaneousMissionId) : spontaneousMissionId,
          { postId }
        );

        if (verifyResult.success) {
          console.log('[CommunityPostCreateScreen] 식사 미션 인증 완료:', verifyResult.success);
          result = postResult; // 게시글 작성 결과를 반환
        } else {
          // 404 에러인 경우 (백엔드 미구현) 게시글은 성공적으로 작성되었으므로 계속 진행
          const isNotFound = verifyResult.error?.includes('404') || 
                            verifyResult.error?.includes('찾을 수 없습니다') ||
                            verifyResult.error?.includes('아직 준비되지 않았습니다');
          
          if (isNotFound) {
            console.warn('[CommunityPostCreateScreen] 미션 인증 API가 아직 구현되지 않았지만 게시글은 작성되었습니다.');
            // 게시글 작성은 성공했으므로 결과 반환 (미션 인증은 나중에 처리될 수 있음)
            result = postResult;
          } else {
            console.error('[CommunityPostCreateScreen] 식사 미션 인증 실패:', verifyResult.error);
            showAlertModal('오류', verifyResult.error || '미션 인증에 실패했습니다.');
            return;
          }
        }
      } else {
        // 일반 인증 게시글: verificationApi 사용
        console.log('[CommunityPostCreateScreen] 인증글 작성 시작:', {
          userMissionId: userMissionId!,
          hasContent: !!content.trim(),
          hasPhoto: !!photoUrl,
          postType,
          isGeneralPost: false,
        });

        // 인증글은 createVerificationPost만 호출 (createPost 절대 호출 안 함)
        result = await createVerificationPost({
          userMissionId: userMissionId!,
          content: content.trim(),
          imageUrls: photoUrl ? [photoUrl] : undefined,
        });
        console.log('[CommunityPostCreateScreen] 인증글 작성 완료:', result.success);
      }

      if (result.success) {
        setShowSuccessModal(true);
      } else {
        showAlertModal('오류', result.error || '게시글 작성에 실패했습니다.');
      }
    } catch (error) {
      showAlertModal('오류', '게시글 작성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [
    showAlertModal,
    loading,
    content,
    isGeneralPost,
    isMealMission,
    userMissionId,
    spontaneousMissionId,
    title,
    missionTitle,
    missionId,
    missionEmoji,
    photoUrl,
    images,
    tasteRating,
    postType,
    createPost,
  ]);

  /**
   * 성공 모달 닫기 및 커뮤니티 화면으로 이동
   */
  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false);
    navigation.navigate(SCREEN_NAMES.COMMUNITY as any);
  }, [navigation]);

  return {
    // Route params
    isGeneralPost,
    isMealMission,
    missionTitle,
    missionEmoji,
    photoUrl,
    // State
    title,
    content,
    images,
    uploadingImage,
    loading,
    showSuccessModal,
    tasteRating,
    // AlertModal 상태
    showAlert,
    alertTitle,
    alertMessage,
    // Setters
    setTitle,
    setContent,
    setTasteRating,
    // Handlers
    handleSelectImage,
    handleRemoveImage,
    handleCreatePost,
    handleSuccessModalClose,
    handleAlertClose,
  };
};
