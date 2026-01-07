/**
 * HeaderActions
 * Header의 우측에 배치되는 액션 아이콘 컴포넌트
 *
 * 특징:
 * - 알림, 채팅 아이콘 표시
 * - 읽지 않은 알림/채팅 뱃지 표시
 * - 터치 시 해당 드롭다운 토글
 * - 기존 Header를 수정하지 않고 rightButton prop으로 전달
 */

import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { useOverlay } from '../../contexts/OverlayContext';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';

interface HeaderActionsProps {
  showNotification?: boolean;
  showChat?: boolean;
  headerHeight?: number; // 드롭다운 위치 계산용
}

const HeaderActions: React.FC<HeaderActionsProps> = ({
  showNotification = true,
  showChat = true,
  headerHeight = 100,
}) => {
  const {
    toggleOverlay,
    activeOverlay,
    unreadNotificationCount,
    unreadChatCount,
  } = useOverlay();

  const notificationRef = useRef<View>(null);
  const chatRef = useRef<View>(null);

  // 알림 아이콘 클릭
  const handleNotificationPress = useCallback(() => {
    // 드롭다운 위치 계산 (헤더 바로 아래)
    const position = {
      top: headerHeight + spacing[2],
      right: spacing[4],
    };
    toggleOverlay('notification', position);
  }, [headerHeight, toggleOverlay]);

  // 채팅 아이콘 클릭
  const handleChatPress = useCallback(() => {
    const position = {
      top: headerHeight + spacing[2],
      right: spacing[4],
    };
    toggleOverlay('chat', position);
  }, [headerHeight, toggleOverlay]);

  return (
    <View style={styles.container}>
      {/* 채팅 아이콘 */}
      {showChat && (
        <TouchableOpacity
          ref={chatRef}
          style={[
            styles.iconButton,
            activeOverlay === 'chat' && styles.iconButtonActive,
          ]}
          onPress={handleChatPress}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Image
            source={require('../../assets/images/say.png')}
            style={styles.iconImage}
            resizeMode="contain"
          />
          {unreadChatCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadChatCount > 99 ? '99+' : unreadChatCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* 알림 아이콘 */}
      {showNotification && (
        <TouchableOpacity
          ref={notificationRef}
          style={[
            styles.iconButton,
            activeOverlay === 'notification' && styles.iconButtonActive,
          ]}
          onPress={handleNotificationPress}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.icon}>🔔</Text>
          {unreadNotificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing[1],
    backgroundColor: 'transparent',
  },
  iconButtonActive: {
    backgroundColor: colors.gray[100],
  },
  icon: {
    fontSize: 22,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(22),
  },
  iconImage: {
    width: 22,
    height: 22,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: colors.background.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  badgeText: {
    fontSize: 9,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.white,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(9),
  },
});

export default HeaderActions;
