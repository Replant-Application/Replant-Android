import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Modal, Animated } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { useOverlay } from '../../contexts/OverlayContext';

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

  const handleMenuPress = (screen: string) => {
    toggleMenu();
    setTimeout(() => {
      navigation.navigate(screen as any);
    }, 300);
  };

  return (
    <View style={styles.header}>
      {/* 오른쪽: 알림 + 메뉴 */}
      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('Notification' as any)}
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
              onPress={() => handleMenuPress('Statistics')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="통계"
            >
              <Image
                source={require('../../assets/images/search.png')}
                style={styles.menuItemIcon}
                resizeMode="contain"
                accessibilityElementsHidden={true}
              />
              <Text style={styles.menuItemText}>통계</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
    paddingTop: spacing[6],
    paddingBottom: spacing[3],
    paddingLeft: spacing[4],
    paddingRight: spacing[4],
    width: '100%',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  menuButton: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    width: 36,
    height: 36,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  menuBar: {
    position: 'absolute',
    top: spacing[16],
    right: 0,
    width: 280,
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderBottomLeftRadius: borderRadius.xl,
    borderLeftWidth: 3,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: '#D4A574',
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
    paddingHorizontal: spacing[4],
    ...shadows.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.md,
    marginBottom: spacing[1],
    backgroundColor: '#FFF8E7',
    borderWidth: 1,
    borderColor: '#D4A574',
  },
  menuItemIcon: {
    width: 24,
    height: 24,
    marginRight: spacing[3],
  },
  menuItemText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  iconButton: {
    position: 'relative',
  },
  iconWrapper: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: typography.fontSize.base,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  iconImage: {
    width: 36,
    height: 36,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2.5,
    borderColor: colors.background.primary,
    ...shadows.sm,
  },
  badgeText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
});

export default AppHeader;

