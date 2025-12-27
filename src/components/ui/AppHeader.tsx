import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { useOverlay } from '../../contexts/OverlayContext';

interface AppHeaderProps {
  navigation: NavigationProp<RootStackParamList>;
}

const AppHeader: React.FC<AppHeaderProps> = ({ navigation }) => {
  const { unreadNotificationCount } = useOverlay();

  return (
    <View style={styles.header}>
      {/* 오른쪽: 알림 + 프로필 */}
      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('Notification' as any)}
          activeOpacity={0.6}
        >
          <View style={styles.iconWrapper}>
            <Image
              source={require('../../assets/images/notification.png')}
              style={styles.iconImage}
              resizeMode="contain"
            />
            {unreadNotificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('MyPage')}
          activeOpacity={0.6}
        >
          <View style={styles.profileImage}>
            <Image
              source={require('../../assets/images/boy.png')}
              style={styles.profileIconImage}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingTop: spacing[6],
    paddingBottom: spacing[3],
    paddingLeft: 0,
    paddingRight: spacing[4],
    width: '100%',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginLeft: 'auto',
  },
  iconButton: {
    position: 'relative',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: typography.fontSize.base,
  },
  iconImage: {
    width: 28,
    height: 28,
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
    fontWeight: typography.fontWeight.bold,
  },
  profileButton: {
    position: 'relative',
  },
  profileImage: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: typography.fontSize.lg,
  },
  profileIconImage: {
    width: 28,
    height: 28,
  },
});

export default AppHeader;

