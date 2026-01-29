import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SwipeableNotificationItemProps } from '../../types/screens/notification';
import { colors } from '../../utils/designTokens';
import { formatTimeAgo } from '../../utils/dateUtils';
import { ConfirmModal } from '../../components/ui';
import { useSwipeableNotificationItemContainer } from './SwipeableNotificationItem.container';
import { styles } from './SwipeableNotificationItem.styles';

/** 두 문장 이상일 때 문장 끝(. ! ?) 뒤에 줄바꿈 삽입 */
function contentWithLineBreaks(content: string): string {
  if (!content || typeof content !== 'string') return content;
  return content.replace(/([.!?])\s+/g, '$1\n').trim();
}

const SwipeableNotificationItem: React.FC<SwipeableNotificationItemProps> = ({ 
  item, 
  onPress, 
  onDelete 
}) => {
  const {
    isDeleting,
    showDeleteModal,
    handleLongPress,
    handleConfirmDelete,
    handleCancelDelete,
  } = useSwipeableNotificationItemContainer({ item, onDelete });

  if (isDeleting) {
    return null;
  }

  return (
    <View style={styles.itemContainer}>
      <View
        style={[
          styles.notificationCard,
          !item.isRead && styles.unreadCard,
        ]}
      >
        <TouchableOpacity
          onPress={() => onPress(item)}
          onLongPress={handleLongPress}
          activeOpacity={0.7}
          style={styles.cardTouchable}
          accessibilityLabel={`${item.title}. 길게 누르면 삭제`}
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
              <Text style={styles.content} numberOfLines={4}>
                {contentWithLineBreaks(item.content)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

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
