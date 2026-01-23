/**
 * Loading 스타일
 * 로딩 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../../utils/designTokens';
import { createSecondaryTextStyle } from '../../../utils/styles/textStyles';
import { loadingStyles } from '../../../utils/styles/componentStyles';

export const styles = StyleSheet.create({
  container: {
    ...loadingStyles.container(),
  },
  text: {
    ...createSecondaryTextStyle('base', {
      marginTop: spacing[3],
      textAlign: 'center',
    }),
  },
});
