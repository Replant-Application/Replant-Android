/**
 * OverlayContainer 스타일
 * 오버레이 모달 컨테이너 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
});
