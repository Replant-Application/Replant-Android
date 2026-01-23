import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { SwipeableNotificationItemProps } from '../../types/screens/notification';
import { colors } from '../../utils/designTokens';
import { formatTimeAgo } from '../../utils/dateUtils';
import { ConfirmModal } from '../../components/ui';
import { useSwipeableNotificationItemContainer } from './SwipeableNotificationItem.container';
import { styles } from './SwipeableNotificationItem.styles';

const SwipeableNotificationItem: React.FC<SwipeableNotificationItemProps> = ({ 
  item, 
  onPress, 
  onDelete 
}) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    translateX,
    isDeleting,
    showDeleteModal,
    panResponder,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
  } = useSwipeableNotificationItemContainer({ item, onDelete });

  if (isDeleting) {
    return null;
  }

  return (
    <View style={styles.swipeContainer}>
      {/* 삭제 버튼 (배경) */}
      <View style={styles.deleteButtonContainer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../assets/images/trash.png')}
            style={styles.deleteButtonIcon}
            resizeMode="contain"
            accessibilityLabel="삭제"
          />
        </TouchableOpacity>
      </View>

      {/* 알림 카드 (앞면) */}
      <Animated.View
        style={[
          styles.notificationCard,
          !item.isRead && styles.unreadCard,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          onPress={() => onPress(item)}
          activeOpacity={0.7}
          style={styles.cardTouchable}
        >
          <View style={styles.contentContainer}>
            <Image
              source={require('../../assets/images/funny.png')}
              style={styles.characterImage}
              resizeMode="contain"
              accessibilityLabel="캐릭터 이미지"
            />
            <View style={styles.textContainer}>
              <View style={styles.headerRow}>
                {!item.isRead && <View style={styles.unreadDot} />}
                <Text style={[styles.title, !item.isRead && styles.unreadTitle]}>
                  {item.title}
                </Text>
                <Text style={styles.time}>{formatTimeAgo(item.createdAt)}</Text>
              </View>
              <Text style={styles.content} numberOfLines={2}>
                {item.content}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        visible={showDeleteModal}
        title="알림 삭제"
        message="이 알림을 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmButtonColor={colors.error[500]}
      />
    </View>
  );
};

export default SwipeableNotificationItem;

