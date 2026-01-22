/**
 * OverlayContainer
 * 오버레이 모달들을 관리하는 컨테이너 컴포넌트
 *
 * 특징:
 * - NotificationDropdown, ChatDropdown을 렌더링
 * - 네비게이션 함수를 받아서 드롭다운에 전달
 * - 앱 최상위에 배치하여 모든 화면 위에 표시
 */

import React from 'react';
import { View } from 'react-native';
import NotificationDropdown from './NotificationDropdown';
import { styles } from './OverlayContainer.styles';
// import ChatDropdown from './ChatDropdown'; // TODO: ChatDropdown 구현 필요

interface OverlayContainerProps {
  onNavigate?: (screen: string, params?: any) => void;
  onViewAllNotifications?: () => void;
  onViewAllChats?: () => void;
}

const OverlayContainer: React.FC<OverlayContainerProps> = ({
  onNavigate,
  onViewAllNotifications,
  onViewAllChats,
}) => {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <NotificationDropdown
        onNavigate={onNavigate}
        onViewAll={onViewAllNotifications}
      />
      {/* <ChatDropdown
        onNavigate={onNavigate}
        onViewAll={onViewAllChats}
      /> */}
    </View>
  );
};

export default OverlayContainer;
