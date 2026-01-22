/**
 * SwipeableNotificationItem 비즈니스 로직
 * 스와이프 애니메이션 제어, 삭제 처리
 */

import { useState, useRef } from 'react';
import { Animated, PanResponder, Dimensions } from 'react-native';
import { Notification } from '../../api/notificationApi';

interface SwipeableNotificationItemContainerProps {
  item: Notification;
  onDelete: (id: number) => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = -70; // 삭제 버튼이 나타나는 슬라이드 거리
const MAX_SWIPE_DISTANCE = -80; // 최대 슬라이드 거리 제한

export const useSwipeableNotificationItemContainer = ({
  item,
  onDelete,
}: SwipeableNotificationItemContainerProps) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /**
   * PanResponder 설정
   * - 스와이프 제스처 감지
   * - 애니메이션 제어
   */
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: (_, gestureState) => {
        // 오른쪽으로 스와이프만 허용 (음수 = 왼쪽)
        if (gestureState.dx < 0) {
          // 최대 슬라이드 거리 제한
          const limitedDx = Math.max(gestureState.dx, MAX_SWIPE_DISTANCE);
          translateX.setValue(limitedDx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < SWIPE_THRESHOLD) {
          // 삭제 버튼 표시
          Animated.spring(translateX, {
            toValue: SWIPE_THRESHOLD,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start();
        } else {
          // 원래 위치로 복귀
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start();
        }
      },
    })
  ).current;

  /**
   * 삭제 버튼 클릭
   */
  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  /**
   * 삭제 확인
   * - 삭제 애니메이션 실행
   * - onDelete 콜백 호출
   */
  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    setIsDeleting(true);
    Animated.timing(translateX, {
      toValue: -SCREEN_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDelete(item.id);
    });
  };

  /**
   * 삭제 취소
   * - 모달 닫기
   * - 원래 위치로 복귀
   */
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    // 원래 위치로 복귀
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  return {
    translateX,
    isDeleting,
    showDeleteModal,
    panResponder,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
  };
};
