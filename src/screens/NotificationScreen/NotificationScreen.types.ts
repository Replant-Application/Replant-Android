import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { Notification as NotificationType } from '../../api/notificationApi';

export interface NotificationScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

export interface SwipeableNotificationItemProps {
  item: NotificationType;
  onPress: (notification: NotificationType) => void;
  onDelete: (notificationId: number) => void;
}

