/**
 * NotificationScreen 스타일
 * 알림 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
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
    marginHorizontal: spacing[4],
    marginTop: spacing[3],
    marginBottom: spacing[3],
    backgroundColor: '#F5F5F0',
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: '#A68B6F',
    paddingVertical: 2.5,
    paddingHorizontal: 3,
    gap: 2,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  filterTabActive: {
    backgroundColor: '#8B6F47',
  },
  filterText: {
    ...createTextStyle('sm', {
      color: colors.black,
      fontWeight: typography.fontWeight.medium,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
    }),
  },
  filterTextActive: {
    ...createTextStyle('sm', {
      color: colors.white,
      fontWeight: typography.fontWeight.medium,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
    }),
  },
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing[4],
    marginTop: spacing[3],
    marginBottom: spacing[2],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  selectionBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.gray[600],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  checkboxChecked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  checkboxCheckmark: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.bold,
      color: colors.white,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
    }),
  },
  selectAllText: {
    ...createTextStyle('sm', {
      color: colors.text.primary,
      fontWeight: typography.fontWeight.medium,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
    }),
  },
  deleteButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.sm,
    backgroundColor: colors.red[50],
    borderWidth: 1,
    borderColor: colors.red[200],
  },
  deleteButtonDisabled: {
    backgroundColor: colors.gray[100],
    borderColor: colors.gray[300],
  },
  deleteButtonText: {
    ...createTextStyle('sm', {
      color: colors.red[600],
      fontWeight: typography.fontWeight.medium,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
    }),
  },
  deleteButtonTextDisabled: {
    color: colors.gray[500],
  },
  cancelButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.sm,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  cancelButtonText: {
    ...createTextStyle('sm', {
      color: colors.text.primary,
      fontWeight: typography.fontWeight.medium,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
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
