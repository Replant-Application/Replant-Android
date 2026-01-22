/**
 * AdminUserListScreen 스타일
 * 전체 유저 목록 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/styles/textStyles';
import { createTextStyle, createTitleStyle, createSecondaryTextStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { inputStyles, cardStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    flex: 1,
    padding: spacing[5],
  },
  searchContainer: {
    marginBottom: spacing[4],
  },
  searchInput: {
    ...inputStyles.base(),
    padding: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    textAlignVertical: 'center',
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  filterContainer: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  filterText: {
    ...createSecondaryTextStyle('sm'),
  },
  filterTextActive: {
    ...createButtonTextStyle('sm', {
      color: colors.text.inverse,
    }),
  },
  userList: {
    flex: 1,
  },
  userCard: {
    ...cardStyles.base(),
    marginBottom: spacing[3],
    ...shadows.base,
  },
  userCardContent: {
    padding: spacing[4],
  },
  userCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  userCardNickname: {
    ...createTextStyle('lg', {
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
    }),
  },
  statusBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary[100],
  },
  statusBadgeInactive: {
    backgroundColor: colors.gray[200],
  },
  statusText: {
    ...createTitleStyle('xs'),
  },
  userCardEmail: {
    ...createSecondaryTextStyle('sm', {
      marginBottom: spacing[2],
    }),
  },
  userCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing[2],
  },
  userCardRole: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
    }),
  },
  userCardDate: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
    }),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[10],
  },
  emptyText: {
    ...createSecondaryTextStyle('base'),
  },
});
