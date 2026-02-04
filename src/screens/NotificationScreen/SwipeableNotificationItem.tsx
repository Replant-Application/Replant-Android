import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SwipeableNotificationItemProps } from '../../types/screens/notification';
import { formatTimeAgo } from '../../utils/dateUtils';
import { styles } from './SwipeableNotificationItem.styles';

/** 두 문장 이상일 때 문장 끝(. ! ?) 뒤에 줄바꿈 삽입 */
function contentWithLineBreaks(content: string): string {
  if (!content || typeof content !== 'string') return content;
  return content.replace(/([.!?])\s+/g, '$1\n').trim();
}

const SwipeableNotificationItem: React.FC<SwipeableNotificationItemProps> = ({
  item,
  selected = false,
  onPress,
  onLongPress,
}) => {
  return (
    <View style={styles.itemContainer}>
      <View
        style={[
          styles.notificationCard,
          !item.isRead && styles.unreadCard,
          selected && styles.notificationCardSelected,
        ]}
      >
        <TouchableOpacity
          onPress={() => onPress(item)}
          onLongPress={onLongPress}
          activeOpacity={0.7}
          style={styles.cardTouchable}
          accessibilityLabel={`${item.title}. 길게 누르면 선택`}
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
    </View>
  );
};

export default SwipeableNotificationItem;
