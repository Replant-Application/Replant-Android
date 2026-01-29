import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, Animated } from 'react-native';
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
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(300)).current;

  const toggleMenu = () => {
    if (menuVisible) {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setMenuVisible(false));
    } else {
      setMenuVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleMenuPress = (screen: string, params?: any) => {
    toggleMenu();
    setTimeout(() => {
      navigation.navigate(screen as any, params);
    }, 300);
  };

  return (
    <View style={styles.header}>
      {/* 오른쪽: 알림 + 메뉴 */}
      <View style={styles.rightSection}>
        {/* 알림 버튼 */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            console.log('[AppHeader] 알림 아이콘 클릭:', SCREEN_NAMES.NOTIFICATION);
            try {
              if (navigation && typeof navigation.navigate === 'function') {
                console.log('[AppHeader] navigation.navigate 호출');
                navigation.navigate(SCREEN_NAMES.NOTIFICATION as any);
              } else {
                console.error('[AppHeader] navigation.navigate가 함수가 아님:', typeof navigation?.navigate);
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
        <TouchableOpacity
          style={styles.menuButton}
          onPress={toggleMenu}
          activeOpacity={0.6}
          accessibilityRole="button"
          accessibilityLabel="메뉴"
          accessibilityState={{ expanded: menuVisible }}
        >
          <Image
            source={require('../../../assets/images/menu.png')}
            style={styles.menuIcon}
            resizeMode="contain"
            accessibilityLabel="메뉴 아이콘"
            accessibilityElementsHidden={true}
          />
        </TouchableOpacity>
      </View>

      {/* 메뉴바 */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="none"
        onRequestClose={toggleMenu}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={toggleMenu}
          accessibilityRole="button"
          accessibilityLabel="닫기"
        >
          <Animated.View
            style={[
              styles.menuBar,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuPress('MyPage')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="프로필"
            >
              <Image
                source={require('../../../assets/images/boy.png')}
                style={styles.menuItemIcon}
                resizeMode="contain"
                accessibilityLabel="프로필 아이콘"
                accessibilityElementsHidden={true}
              />
              <Text style={styles.menuItemText}>프로필</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuPress('Calendar')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="캘린더"
            >
              <Image
                source={require('../../../assets/images/calendar.png')}
                style={styles.menuItemIcon}
                resizeMode="contain"
                accessibilityLabel="캘린더 아이콘"
                accessibilityElementsHidden={true}
              />
              <Text style={styles.menuItemText}>캘린더</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuPress('SpontaneousMissionSetup', { mode: 'edit' })}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="돌발 미션 설정"
            >
              <Image
                source={require('../../../assets/images/surprised_mission.png')}
                style={styles.menuItemIcon}
                resizeMode="contain"
                accessibilityLabel="돌발 미션 설정 아이콘"
                accessibilityElementsHidden={true}
              />
              <Text style={styles.menuItemText}>돌발 미션 설정</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuPress('SoundSettings')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="사운드"
            >
              <Image
                source={require('../../../assets/images/sound.png')}
                style={styles.menuItemIcon}
                resizeMode="contain"
                accessibilityLabel="사운드 아이콘"
                accessibilityElementsHidden={true}
              />
              <Text style={styles.menuItemText}>사운드</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuPress('CounselingSelect')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="상담 서비스"
            >
              <Image
                source={require('../../../assets/images/hospital.png')}
                style={styles.menuItemIcon}
                resizeMode="contain"
                accessibilityLabel="상담 서비스 아이콘"
                accessibilityElementsHidden={true}
              />
              <Text style={styles.menuItemText}>상담 서비스</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default AppHeader;

