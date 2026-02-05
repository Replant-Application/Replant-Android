/**
 * NotificationScreen 타입 정의
 */

import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';
import { Notification as NotificationType } from '../../api/notificationApi';

export interface NotificationScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

export interface NotificationListItemProps {
  item: NotificationType;
  selected?: boolean;
  onPress: (notification: NotificationType) => void;
  onLongPress: () => void;
}
