import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, Animated } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { useOverlay } from '../../contexts/OverlayContext';
import { loadSoundSettings, saveSoundSettings, SoundSettings } from '../../utils/soundSettings';
import { backgroundMusicService } from '../../services/backgroundMusicService';
import { SCREEN_NAMES } from '../../utils/constants';
import { styles } from './AppHeader.styles';

interface AppHeaderProps {
  navigation: NavigationProp<RootStackParamList>;
}

const AppHeader: React.FC<AppHeaderProps> = ({ navigation }) => {
  const { unreadNotificationCount } = useOverlay();
  const [menuVisible, setMenuVisible] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [savedSettings, setSavedSettings] = useState<SoundSettings | null>(null);
  const slideAnim = React.useRef(new Animated.Value(300)).current;

  // 사운드 설정 불러오기 (soundSettings 사용)
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await loadSoundSettings();
        setSavedSettings(settings);
        // 효과음과 배경음 둘 다 0이면 사운드 꺼짐
        const isEnabled = settings.effectVolume > 0 || settings.backgroundVolume > 0;
        setSoundEnabled(isEnabled);
      } catch (error) {
        console.error('Failed to load sound setting:', error);
      }
    };
    loadSettings();
  }, []);

  // 사운드 토글 (soundSettings와 연동)
  const toggleSound = async () => {
    try {
      const newValue = !soundEnabled;
      setSoundEnabled(newValue);

      if (newValue) {
        // 사운드 켜기: 이전 설정 복원 또는 기본값 사용
        const newSettings: SoundSettings = {
          effectVolume: savedSettings?.effectVolume && savedSettings.effectVolume > 0
            ? savedSettings.effectVolume
            : 1.0,
          backgroundVolume: savedSettings?.backgroundVolume && savedSettings.backgroundVolume > 0
            ? savedSettings.backgroundVolume
            : 0.5,
        };
        await saveSoundSettings(newSettings);
        await backgroundMusicService.setVolume(newSettings.backgroundVolume);
        setSavedSettings(newSettings);
      } else {
        // 사운드 끄기: 현재 설정 저장 후 볼륨 0으로
        if (savedSettings && (savedSettings.effectVolume > 0 || savedSettings.backgroundVolume > 0)) {
          // 현재 설정이 0이 아니면 저장해둠 (나중에 복원용)
          setSavedSettings({ ...savedSettings });
        }
        const mutedSettings: SoundSettings = {
          effectVolume: 0,
          backgroundVolume: 0,
        };
        await saveSoundSettings(mutedSettings);
        await backgroundMusicService.setVolume(0);
      }
    } catch (error) {
      console.error('Failed to save sound setting:', error);
    }
  };

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
              source={require('../../assets/images/notification.png')}
              style={styles.iconImage}
              resizeMode="contain"
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
            source={require('../../assets/images/menu.png')}
            style={styles.menuIcon}
            resizeMode="contain"
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
                source={require('../../assets/images/boy.png')}
                style={styles.menuItemIcon}
                resizeMode="contain"
                accessibilityElementsHidden={true}
              />
              <Text style={styles.menuItemText}>프로필</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuPress('CounselingSelect')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="상담"
            >
              <Image
                source={require('../../assets/images/hospital.png')}
                style={styles.menuItemIcon}
                resizeMode="contain"
                accessibilityElementsHidden={true}
              />
              <Text style={styles.menuItemText}>상담</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuPress('Calendar')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="캘린더"
            >
              <Image
                source={require('../../assets/images/calendar.png')}
                style={styles.menuItemIcon}
                resizeMode="contain"
                accessibilityElementsHidden={true}
              />
              <Text style={styles.menuItemText}>캘린더</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuPress('SoundSettings')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="사운드 설정"
            >
              <Image
                source={require('../../assets/images/sound.png')}
                style={styles.menuItemIcon}
                resizeMode="contain"
                accessibilityElementsHidden={true}
              />
              <Text style={styles.menuItemText}>사운드 설정</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuPress('SpontaneousMissionSetup', { mode: 'edit' })}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="돌발 미션 설정"
            >
              <Image
                source={require('../../assets/images/surprised_mission.png')}
                style={styles.menuItemIcon}
                resizeMode="contain"
                accessibilityElementsHidden={true}
              />
              <Text style={styles.menuItemText}>돌발 미션 설정</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default AppHeader;

