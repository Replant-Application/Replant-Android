/**
 * PlusButton 스타일
 * 플러스 버튼 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { borderRadius } from '../../utils/designTokens';

export const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  plusBar: {
    position: 'absolute',
  },
  plusBarVertical: {
    position: 'absolute',
  },
});
