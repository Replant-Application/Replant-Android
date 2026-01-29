/**
 * NotificationScreen 스타일
 * 알림 화면의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../utils/designTokens';
import { createTextStyle, createTitleStyle, createSecondaryTextStyle } from '../../utils/styles/textStyles';

export const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerTitle: {
    ...createTitleStyle('lg'),
  },
  markAllButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    flexShrink: 0,
  },
  markAllReadText: {
    ...createSecondaryTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing[5],
    paddingTop: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  filterTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.black,
  },
  filterText: {
    ...createTextStyle('sm', {
      color: colors.gray[500],
      fontWeight: typography.fontWeight.normal,
    }),
  },
  filterTextActive: {
    ...createTextStyle('sm', {
      color: colors.black,
      fontWeight: typography.fontWeight.bold,
    }),
  },
  listWrapper: {
    flex: 1,
    position: 'relative',
  },
  listContent: {
    padding: spacing[4],
  },
});
