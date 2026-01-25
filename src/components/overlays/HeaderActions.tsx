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
  TouchableOpacity,
  Image,
} from 'react-native';
import { useOverlay } from '../../contexts/OverlayContext';
import { spacing } from '../../utils/designTokens';
import { styles } from './HeaderActions.styles';

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
          accessibilityRole="button"
          accessibilityLabel={unreadChatCount > 0 ? `채팅, ${unreadChatCount}개의 읽지 않은 메시지` : '채팅'}
          accessibilityState={{ selected: activeOverlay === 'chat' }}
        >
          <Image
            source={require('../../assets/images/say.png')}
            style={styles.iconImage}
            resizeMode="contain"
            accessibilityLabel="채팅 아이콘"
            accessibilityElementsHidden={true}
          />
          {unreadChatCount > 0 && (
            <View style={styles.badge} accessibilityElementsHidden={true}>
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
          accessibilityRole="button"
          accessibilityLabel={unreadNotificationCount > 0 ? `알림, ${unreadNotificationCount}개의 읽지 않은 알림` : '알림'}
          accessibilityState={{ selected: activeOverlay === 'notification' }}
        >
          <Text style={styles.icon} accessibilityElementsHidden={true}>🔔</Text>
          {unreadNotificationCount > 0 && (
            <View style={styles.badge} accessibilityElementsHidden={true}>
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

export default HeaderActions;
