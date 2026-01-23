/**
 * WheelPicker 스타일
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography } from '../../../utils/designTokens';
import { getOptimizedLineHeight } from '../../../utils/styles/textStyles';

export const styles = StyleSheet.create({
  container: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  selection: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 50,
    marginTop: -25,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.primary[500],
    zIndex: 1,
    pointerEvents: 'none',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  content: {
    paddingVertical: 0,
  },
  item: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
  },
  itemText: {
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular, // Android는 커스텀 폰트 사용
    }),
    color: colors.text.primary,
    includeFontPadding: false,
    textAlign: 'center',
  },
});
