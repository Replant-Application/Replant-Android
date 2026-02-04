/**
 * FullScreenImageViewer 스타일
 * 풀스크린 이미지 보기 모달
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../../utils/designTokens';
import { createTextStyle } from '../../../utils/styles/textStyles';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: spacing[6] + 12,
    right: spacing[4],
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    ...createTextStyle('xxl', {
      fontWeight: typography.fontWeight.semibold,
      color: colors.white,
    }),
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '80%',
  },
});
