/**
 * SimpleTabBar 스타일
 * 간단한 탭 바 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { spacing, typography, colors } from '../../../utils/designTokens';
import { createTextStyle } from '../../../utils/styles/textStyles';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingTop: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
  },
  tab: {
    flex: 1,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.black,
  },
  tabText: {
    ...createTextStyle('sm', {
      color: colors.gray[500],
      fontWeight: typography.fontWeight.normal,
    }),
  },
  tabTextActive: {
    ...createTextStyle('sm', {
      color: colors.black,
      fontWeight: typography.fontWeight.bold,
    }),
  },
  tabCount: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.normal,
      color: colors.gray[500],
      marginLeft: spacing[1],
    }),
  },
  tabCountActive: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.bold,
      color: colors.black,
      marginLeft: spacing[1],
    }),
  },
  underline: {
    display: 'none',
  },
});
