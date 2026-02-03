import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../types/navigation';
import { useOverlay } from '../../../contexts/OverlayContext';
import { SCREEN_NAMES } from '../../../utils/constants';
import { styles } from './AppHeader.styles';

interface AppHeaderProps {
  navigation: NavigationProp<RootStackParamList>;
}

const AppHeader: React.FC<AppHeaderProps> = ({ navigation }) => {
  const { unreadNotificationCount } = useOverlay();

  return (
    <View style={styles.header}>
      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            try {
              if (navigation && typeof navigation.navigate === 'function') {
                navigation.navigate(SCREEN_NAMES.NOTIFICATION as any);
              }
            } catch (error) {
              console.error('[AppHeader] 알림 화면 이동 실패:', error);
            }
          }}
          activeOpacity={0.6}
          accessibilityRole="button"
          accessibilityLabel={unreadNotificationCount > 0 ? `알림, ${unreadNotificationCount}개의 읽지 않은 알림` : '알림'}
        >
          <View style={styles.iconWrapper}>
            <Image
              source={require('../../../assets/images/notification.png')}
              style={styles.iconImage}
              resizeMode="contain"
              accessibilityLabel="알림 아이콘"
              accessibilityElementsHidden={true}
            />
            {unreadNotificationCount > 0 && (
              <View style={styles.notificationBadge} accessibilityElementsHidden={true}>
                <Text style={styles.badgeText}>
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AppHeader;

