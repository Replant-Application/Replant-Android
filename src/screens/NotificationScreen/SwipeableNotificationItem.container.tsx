/**
 * SwipeableNotificationItem 비즈니스 로직
 * 롱프레스 시 삭제 확인 모달, 삭제 처리
 */

import { useState } from 'react';
import { Notification } from '../../api/notificationApi';

interface SwipeableNotificationItemContainerProps {
  item: Notification;
  onDelete: (id: number) => void;
}

export const useSwipeableNotificationItemContainer = ({
  item,
  onDelete,
}: SwipeableNotificationItemContainerProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /**
   * 롱프레스 → 삭제 확인 모달 표시
   */
  const handleLongPress = () => {
    setShowDeleteModal(true);
  };

  /**
   * 삭제 확인 → onDelete 호출
   */
  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    setIsDeleting(true);
    onDelete(item.id);
  };

  /**
   * 삭제 취소 → 모달만 닫기
   */
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  return {
    isDeleting,
    showDeleteModal,
    handleLongPress,
    handleConfirmDelete,
    handleCancelDelete,
  };
};
