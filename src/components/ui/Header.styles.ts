/**
 * Header 스타일
 * 재사용 가능한 헤더 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../utils/designTokens';
import { createTitleStyle } from '../../utils/styles/textStyles';
import { headerStyles } from '../../utils/styles/componentStyles';

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[12],
    paddingBottom: spacing[5],
    backgroundColor: 'transparent',
  },
  headerWithBorder: {
    // 테두리 스타일 제거
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    ...createTitleStyle('lg', {
      fontWeight: typography.fontWeight.normal,
    }),
  },
  backButtonIcon: {
    ...headerStyles.backButtonIcon(),
  },
});
